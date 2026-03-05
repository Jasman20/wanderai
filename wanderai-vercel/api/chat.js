// api/chat.js — Vercel Serverless Function

const fetch = require("node-fetch");

// ✅ Strips any leaked <function=...> or tool call text the AI accidentally outputs
function cleanReply(text) {
  return text
    .replace(/<function=\w+>[\s\S]*?<\/function>/g, "")   // removes <function=web_search>...</function>
    .replace(/```json[\s\S]*?```/g, "")                    // removes raw JSON blocks
    .replace(/\{"query":.*?\}/g, "")                       // removes stray JSON queries
    .replace(/Now, let's search.*?\./g, "")                // removes "Now let's search..." lines
    .replace(/\n{3,}/g, "\n\n")                            // collapses excessive blank lines
    .trim();
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { messages, systemPrompt } = req.body;
  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: "Missing messages or systemPrompt" });
  }

  try {

    // ─── STEP 1: Call Groq with web search tool ────────────────────────
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for real-time travel information: weather, hotels, attractions, food, transport, travel advisories.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The search query" },
                },
                required: ["query"],
              },
            },
          },
        ],
        tool_choice: "auto",
        messages: [
          {
            role: "system",
            // ✅ Explicitly tell the AI NOT to write function calls as text
            content: systemPrompt + "\n\nCRITICAL: Never write <function=...> or tool call syntax in your response text. Use tools silently. Only write the final travel plan text for the user to read.",
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    // ─── Handle errors ─────────────────────────────────────────────────
    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after") || 60;
        return res.status(429).json({
          error: "rate_limit",
          message: `Our AI is a bit busy right now. Please try again in ${retryAfter} seconds! ⏳`,
          retryAfter: parseInt(retryAfter),
        });
      }
      if (response.status === 401) {
        return res.status(401).json({
          error: "auth",
          message: "Invalid API key. Check GROQ_API_KEY in Vercel environment variables.",
        });
      }
      if (response.status === 503 || response.status === 502) {
        return res.status(503).json({
          error: "unavailable",
          message: "AI service is temporarily down. Please try again.",
        });
      }
      return res.status(response.status).json({
        error: "api_error",
        message: data?.error?.message || "Something went wrong. Please try again.",
      });
    }

    const choice = data.choices?.[0];

    // ─── STEP 2: AI wants to search the web ───────────────────────────
    if (choice?.finish_reason === "tool_calls") {
      const toolCalls = choice.message.tool_calls;
      const searchResults = [];

      // ─── STEP 3: Run each search ───────────────────────────────────
      for (const toolCall of toolCalls) {
        const query = JSON.parse(toolCall.function.arguments).query;
        console.log(`🔍 Searching: "${query}"`);

        try {
          const searchRes = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
          );
          const searchData = await searchRes.json();

          const resultText = [
            searchData.AbstractText,
            searchData.Answer,
            ...(searchData.RelatedTopics || []).slice(0, 4).map((t) => t.Text).filter(Boolean),
          ].filter(Boolean).join("\n\n");

          searchResults.push({
            toolCallId: toolCall.id,
            query,
            result: resultText || `No live results for "${query}". Use your training knowledge.`,
          });

        } catch {
          searchResults.push({
            toolCallId: toolCall.id,
            query,
            result: `Could not fetch live data for "${query}". Use training knowledge instead.`,
          });
        }
      }

      // ─── STEP 4: Send search results back to AI ────────────────────
      const finalResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: systemPrompt + "\n\nCRITICAL: Never write <function=...> or tool call syntax in your response. Only write the final travel plan for the user.",
            },
            ...messages,
            choice.message,
            ...searchResults.map((r) => ({
              role: "tool",
              tool_call_id: r.toolCallId,
              content: r.result || "No results found.",
            })),
          ],
        }),
      });

      const finalData = await finalResponse.json();
      const rawReply = finalData.choices?.[0]?.message?.content || "No response.";

      return res.status(200).json({
        reply: cleanReply(rawReply),
        searched: searchResults.map((r) => r.query),
      });
    }

    // ─── AI responded directly without searching ───────────────────────
    const rawReply = choice?.message?.content || "No response.";
    return res.status(200).json({ reply: cleanReply(rawReply), searched: [] });

  } catch (err) {
    console.error("Function error:", err);
    return res.status(500).json({
      error: "server_error",
      message: "Unexpected error. Please try again shortly.",
    });
  }
}