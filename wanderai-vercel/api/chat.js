// api/chat.js — Vercel Serverless Function
// This replaces the entire Express backend.
// Vercel runs this function only when /api/chat is called — no always-on server needed.

const fetch = require("node-fetch");

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers — allows your frontend to call this function
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request (browser sends this before the real request)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { messages, systemPrompt } = req.body;

  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: "Missing messages or systemPrompt" });
  }

  try {

    // ─── STEP 1: Call Groq WITH web search tool enabled ───────────────
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,

        // ✅ THIS IS WHAT MAKES IT AN AGENT — giving the AI a web search tool
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for real-time information like current weather, hotel prices, travel advisories, tourist attractions, local events, and transport options.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The search query to look up" },
                },
                required: ["query"],
              },
            },
          },
        ],

        tool_choice: "auto", // AI decides when to search

        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    // ─── Handle Groq API errors ────────────────────────────────────────
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
          message: "Invalid API key. Check your GROQ_API_KEY in Vercel environment variables.",
        });
      }
      if (response.status === 503 || response.status === 502) {
        return res.status(503).json({
          error: "unavailable",
          message: "The AI service is temporarily down. Please try again in a moment.",
        });
      }
      return res.status(response.status).json({
        error: "api_error",
        message: data?.error?.message || "Something went wrong. Please try again.",
      });
    }

    const choice = data.choices?.[0];

    // ─── STEP 2: Did the AI decide to search the web? ──────────────────
    if (choice?.finish_reason === "tool_calls") {
      const toolCalls = choice.message.tool_calls;
      const searchResults = [];

      // ─── STEP 3: Execute each web search the AI requested ──────────
      for (const toolCall of toolCalls) {
        const query = JSON.parse(toolCall.function.arguments).query;
        console.log(`🔍 AI searching: "${query}"`);

        try {
          const searchRes = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
          );
          const searchData = await searchRes.json();

          const resultText = [
            searchData.AbstractText,
            searchData.Answer,
            ...(searchData.RelatedTopics || [])
              .slice(0, 4)
              .map((t) => t.Text)
              .filter(Boolean),
          ]
            .filter(Boolean)
            .join("\n\n");

          searchResults.push({
            toolCallId: toolCall.id,
            query,
            result: resultText || `Search done for: "${query}". Use your knowledge to supplement.`,
          });

        } catch (searchErr) {
          searchResults.push({
            toolCallId: toolCall.id,
            query,
            result: `Could not fetch live data for "${query}". Use training knowledge instead.`,
          });
        }
      }

      // ─── STEP 4: Send search results back to AI for final answer ───
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
            { role: "system", content: systemPrompt },
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
      const reply = finalData.choices?.[0]?.message?.content || "No response.";

      return res.status(200).json({
        reply,
        searched: searchResults.map((r) => r.query),
      });
    }

    // ─── AI responded directly without searching ───────────────────────
    const reply = choice?.message?.content || "No response.";
    return res.status(200).json({ reply, searched: [] });

  } catch (err) {
    console.error("Function error:", err);
    return res.status(500).json({
      error: "server_error",
      message: "Unexpected error. Please try again shortly.",
    });
  }
}
