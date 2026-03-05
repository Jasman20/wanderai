// api/cards.js — Fetches hotel & attraction cards with photos, booking links, maps links

const fetch = require("node-fetch");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { destination, budget, dates } = req.body;
  if (!destination) return res.status(400).json({ error: "Missing destination" });

  try {
    // ─── STEP 1: Ask Groq for structured hotel + attraction data ──────
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are a travel data API. Always respond with valid JSON only. No explanation, no markdown, no extra text. Just pure JSON.",
          },
          {
            role: "user",
            content: `Return a JSON object for a trip to ${destination} (${dates}, ${budget} budget) with this exact structure:
{
  "hotels": [
    { "name": "Hotel Name", "description": "One sentence about it", "price": "₹X,XXX per night", "area": "Area/locality name" },
    { "name": "Hotel Name 2", "description": "One sentence", "price": "₹X,XXX per night", "area": "Area name" },
    { "name": "Hotel Name 3", "description": "One sentence", "price": "₹X,XXX per night", "area": "Area name" }
  ],
  "attractions": [
    { "name": "Place Name", "description": "One sentence about it", "type": "Historical/Nature/Temple/etc" },
    { "name": "Place Name 2", "description": "One sentence", "type": "type" },
    { "name": "Place Name 3", "description": "One sentence", "type": "type" },
    { "name": "Place Name 4", "description": "One sentence", "type": "type" },
    { "name": "Place Name 5", "description": "One sentence", "type": "type" }
  ]
}
Only return the JSON. Nothing else.`,
          },
        ],
      }),
    });

    const groqData = await groqRes.json();
    let rawText = groqData.choices?.[0]?.message?.content || "{}";

    // Strip any accidental markdown code fences
    rawText = rawText.replace(/```json|```/g, "").trim();

    let cards;
    try {
      cards = JSON.parse(rawText);
    } catch {
      return res.status(200).json({ hotels: [], attractions: [] });
    }

    // ─── STEP 2: Fetch Unsplash photos for each hotel & attraction ────
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

    async function getPhoto(query) {
      if (!unsplashKey) return null;
      try {
        const r = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${unsplashKey}`
        );
        const d = await r.json();
        return d.results?.[0]?.urls?.regular || null;
      } catch {
        return null;
      }
    }

    // ─── STEP 3: Enrich hotels with photos + booking/maps links ──────
    const hotels = await Promise.all(
      (cards.hotels || []).map(async (hotel) => {
        const photo = await getPhoto(`${hotel.name} ${destination} hotel`);
        const bookingQuery = encodeURIComponent(`${hotel.name} ${destination}`);
        const mapsQuery = encodeURIComponent(`${hotel.name} ${destination}`);
        return {
          ...hotel,
          photo,
          bookingUrl: `https://www.booking.com/search.html?ss=${bookingQuery}`,
          makemytripUrl: `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${dates?.split(" to ")?.[0] || ""}&checkout=${dates?.split(" to ")?.[1] || ""}&city=${encodeURIComponent(destination)}`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
        };
      })
    );

    // ─── STEP 4: Enrich attractions with photos + maps links ─────────
    const attractions = await Promise.all(
      (cards.attractions || []).map(async (attraction) => {
        const photo = await getPhoto(`${attraction.name} ${destination}`);
        const mapsQuery = encodeURIComponent(`${attraction.name} ${destination}`);
        return {
          ...attraction,
          photo,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
        };
      })
    );

    return res.status(200).json({ hotels, attractions });

  } catch (err) {
    console.error("Cards error:", err);
    return res.status(500).json({ error: "Failed to load cards", hotels: [], attractions: [] });
  }
}
