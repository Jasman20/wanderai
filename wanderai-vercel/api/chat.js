// api/chat.js — Vercel Serverless Function

const fetch = require("node-fetch");

function cleanReply(text) {
  return text
    .replace(/<function=\w+>[\s\S]*?<\/function>/g, "")
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/\{"query":.*?\}/g, "")
    .replace(/Now,?\s*let'?s search.*?\./gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Plain call to Groq with NO tools (fallback) ──────────────────────────
async function callGroqDirect(messages, systemPrompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });
  return res;
}

export default async function handler(req, res) {

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { messages, systemPrompt } = req.body;
  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: "Missing messages or systemPrompt" });
  }

  try {

    // ─── STEP 1: Try calling Groq WITH web search tool ─────────────────
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
              description: "Search the web for real-time travel info: weather, hotels, attractions, food, transport.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Search query" },
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
            content: systemPrompt + "\n\nIMPORTANT: Never write <function=...> or tool call syntax in your text response. Only write the final answer for the user.",
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    // ─── Handle Groq errors ────────────────────────────────────────────
    if (!response.ok) {
      // ✅ KEY FIX: "Failed to call a function" error — retry WITHOUT tools
      const errMsg = data?.error?.message || "";
      if (
        response.status === 400 &&
        (errMsg.includes("failed_generation") || errMsg.includes("Failed to call a function") || errMsg.includes("function"))
      ) {
        console.log("Tool calling failed — retrying without tools...");
        const fallbackRes = await callGroqDirect(messages, systemPrompt);
        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok) {
          return res.status(fallbackRes.status).json({
            error: "api_error",
            message: fallbackData?.error?.message || "Something went wrong. Please try again.",
          });
        }
        const reply = fallbackData.choices?.[0]?.message?.content || "No response.";
        return res.status(200).json({ reply: cleanReply(reply), searched: [] });
      }

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
        message: errMsg || "Something went wrong. Please try again.",
      });
    }

    const choice = data.choices?.[0];

    // ─── STEP 2: AI wants to use web search ───────────────────────────
    if (choice?.finish_reason === "tool_calls") {
      const toolCalls = choice.message.tool_calls;
      const searchResults = [];

      for (const toolCall of toolCalls) {
        let query = "";
        try {
          query = JSON.parse(toolCall.function.arguments).query;
        } catch {
          query = toolCall.function.arguments;
        }
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
            result: `Could not fetch data for "${query}". Use training knowledge instead.`,
          });
        }
      }

      // ─── STEP 3: Send search results back to AI ───────────────────
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
              content: systemPrompt + "\n\nNever write <function=...> syntax in your response. Only write the final travel plan.",
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

      // ✅ If second call also fails, fall back to direct call
      if (!finalResponse.ok) {
        console.log("Final tool response failed — falling back to direct call");
        const fallbackRes = await callGroqDirect(messages, systemPrompt);
        const fallbackData = await fallbackRes.json();
        const reply = fallbackData.choices?.[0]?.message?.content || "No response.";
        return res.status(200).json({ reply: cleanReply(reply), searched: [] });
      }

      const rawReply = finalData.choices?.[0]?.message?.content || "No response.";
      return res.status(200).json({
        reply: cleanReply(rawReply),
        searched: searchResults.map((r) => r.query),
      });
    }

    // ─── AI responded directly ─────────────────────────────────────────
    const rawReply = choice?.message?.content || "No response.";
    return res.status(200).json({ reply: cleanReply(rawReply), searched: [] });

  } catch (err) {
    console.error("Function error:", err);
    // Last resort — try a plain call
    try {
      const fallbackRes = await callGroqDirect(messages, systemPrompt);
      const fallbackData = await fallbackRes.json();
      const reply = fallbackData.choices?.[0]?.message?.content || "No response.";
      return res.status(200).json({ reply: cleanReply(reply), searched: [] });
    } catch {
      return res.status(500).json({
        error: "server_error",
        message: "Unexpected error. Please try again shortly.",
      });
    }
  }
}