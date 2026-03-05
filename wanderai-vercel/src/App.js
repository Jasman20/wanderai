import { useState, useRef, useEffect } from "react";

const MOODS = [
  { id: "beach", label: "Beach & Coastal", icon: "🏖️" },
  { id: "mountains", label: "Mountains & Trekking", icon: "⛰️" },
  { id: "hill", label: "Hill Stations", icon: "🌄" },
  { id: "historical", label: "Historical & Heritage", icon: "🏛️" },
  { id: "forts", label: "Forts & Castles", icon: "🏰" },
  { id: "wildlife", label: "Wildlife & Nature", icon: "🦁" },
  { id: "spiritual", label: "Spiritual & Temples", icon: "🕌" },
  { id: "city", label: "City & Urban Explore", icon: "🌆" },
];
const BUDGETS = [
  { id: "budget", label: "Budget", sub: "Under ₹5,000/day", icon: "💰" },
  { id: "mid", label: "Mid-Range", sub: "₹5k–₹15k/day", icon: "💳" },
  { id: "luxury", label: "Luxury", sub: "₹15k+/day", icon: "👑" },
];
const VIBES = [
  { id: "solo", label: "Solo", icon: "🧳" },
  { id: "couple", label: "Couple", icon: "💑" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "friends", label: "Friends", icon: "🎉" },
];

// ── Hotel Card ─────────────────────────────────────────────────────────────
function HotelCard({ hotel }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 16, overflow: "hidden", flexShrink: 0, width: 220 }}>
      <div style={{ height: 130, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
        {hotel.photo && !imgError ? (
          <img src={hotel.photo} alt={hotel.name} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏨</div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "3px 8px", fontSize: 11, color: "#c9a96e" }}>
          {hotel.price}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8dcc8", marginBottom: 4, lineHeight: 1.3 }}>{hotel.name}</div>
        <div style={{ fontSize: 11, color: "rgba(232,220,200,0.5)", marginBottom: 4 }}>📍 {hotel.area}</div>
        <div style={{ fontSize: 11.5, color: "rgba(232,220,200,0.65)", lineHeight: 1.5, marginBottom: 12 }}>{hotel.description}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <a href={hotel.bookingUrl} target="_blank" rel="noreferrer"
            style={{ flex: 1, background: "linear-gradient(135deg,#c9a96e,#9a6f35)", border: "none", borderRadius: 8, padding: "7px 4px", color: "#1a0f00", fontSize: 11, fontWeight: 700, textAlign: "center", textDecoration: "none", cursor: "pointer" }}>
            Book Now
          </a>
          <a href={hotel.mapsUrl} target="_blank" rel="noreferrer"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 8, padding: "7px 8px", fontSize: 13, textDecoration: "none", cursor: "pointer" }}>
            🗺️
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Attraction Card ────────────────────────────────────────────────────────
function AttractionCard({ attraction }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 16, overflow: "hidden", flexShrink: 0, width: 200 }}>
      <div style={{ height: 120, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
        {attraction.photo && !imgError ? (
          <img src={attraction.photo} alt={attraction.name} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🗺️</div>
        )}
        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "3px 8px", fontSize: 10, color: "rgba(232,220,200,0.8)" }}>
          {attraction.type}
        </div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e8dcc8", marginBottom: 4, lineHeight: 1.3 }}>{attraction.name}</div>
        <div style={{ fontSize: 11, color: "rgba(232,220,200,0.6)", lineHeight: 1.5, marginBottom: 10 }}>{attraction.description}</div>
        <a href={attraction.mapsUrl} target="_blank" rel="noreferrer"
          style={{ display: "block", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 8, padding: "6px", color: "#c9a96e", fontSize: 11, textAlign: "center", textDecoration: "none" }}>
          📍 Open in Maps
        </a>
      </div>
    </div>
  );
}

// ── Cards Section (Hotels + Attractions) ──────────────────────────────────
function CardsSection({ cards, cardsLoading }) {
  if (cardsLoading) {
    return (
      <div style={{ marginBottom: 16, padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.12)", borderRadius: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(232,220,200,0.4)", fontSize: 13 }}>
          <span style={{ animation: "spin 1.5s linear infinite", display: "inline-block" }}>🔄</span>
          Loading hotels & attractions...
        </div>
      </div>
    );
  }

  if (!cards || (!cards.hotels?.length && !cards.attractions?.length)) return null;

  return (
    <div style={{ borderTop: "1px solid rgba(201,169,110,0.15)", borderBottom: "1px solid rgba(201,169,110,0.15)", padding: "18px 0", margin: "8px 0 18px" }}>
      {/* Hotels */}
      {cards.hotels?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ height: 1, flex: 1, background: "rgba(201,169,110,0.2)" }} />
            🏨 Recommended Hotels
            <span style={{ height: 1, flex: 1, background: "rgba(201,169,110,0.2)" }} />
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "thin" }}>
            {cards.hotels.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)}
          </div>
        </div>
      )}

      {/* Attractions */}
      {cards.attractions?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ height: 1, flex: 1, background: "rgba(201,169,110,0.2)" }} />
            🗺️ Top Attractions
            <span style={{ height: 1, flex: 1, background: "rgba(201,169,110,0.2)" }} />
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "thin" }}>
            {cards.attractions.map((attraction, i) => <AttractionCard key={i} attraction={attraction} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9a96e", display: "inline-block", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

function SearchingIndicator() {
  return (
    <div style={{ paddingLeft: 46, marginBottom: 14 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 20, padding: "7px 14px" }}>
        <span style={{ fontSize: 14, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🔍</span>
        <span style={{ fontSize: 12.5, color: "#c9a96e" }}>Searching the web for live data...</span>
      </div>
    </div>
  );
}

function SearchedBadges({ queries }) {
  if (!queries?.length) return null;
  return (
    <div style={{ paddingLeft: 46, marginTop: -10, marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {queries.map((q, i) => (
        <span key={i} style={{ fontSize: 11, background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 20, padding: "3px 10px", color: "rgba(201,169,110,0.7)" }}>🔍 {q}</span>
      ))}
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: msg.searched?.length ? 6 : 18, animation: "fadeUp 0.4s ease" }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#8B5E2D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginRight: 10, marginTop: 2 }}>✈️</div>
      )}
      <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px", background: isUser ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.07)", color: isUser ? "#1a1008" : "#e8dcc8", fontSize: 14, lineHeight: 1.7, fontFamily: "inherit", border: isUser ? "none" : "1px solid rgba(201,169,110,0.2)", whiteSpace: "pre-wrap", boxShadow: isUser ? "0 4px 16px rgba(201,169,110,0.2)" : "0 2px 12px rgba(0,0,0,0.3)" }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginLeft: 10, marginTop: 2, border: "1px solid rgba(201,169,110,0.25)" }}>🙋</div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("intro");
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [retryMsgs, setRetryMsgs] = useState(null);
  const [cards, setCards] = useState(null);           // hotel + attraction cards
  const [cardsLoading, setCardsLoading] = useState(false);
  const bottomRef = useRef(null);
  const retryTimer = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, searching]);

  const buildSystemPrompt = () => {
    const moodLabels = selectedMoods.map((m) => MOODS.find((x) => x.id === m)?.label).join(", ");
    const budgetInfo = BUDGETS.find((b) => b.id === selectedBudget);
    const vibeLabel = VIBES.find((v) => v.id === selectedVibe)?.label;
    return `You are "WanderAI" — an expert AI travel agent with access to web search. You search the web to get REAL, CURRENT information before making recommendations.

Traveler profile:
- Destination: ${destination}
- Dates: ${arrival} to ${departure}
- Interests: ${moodLabels}
- Budget: ${budgetInfo?.label} (${budgetInfo?.sub})
- Group type: ${vibeLabel}

IMPORTANT INSTRUCTIONS:
- You have a web_search tool. USE IT to find current information.
- Search for: current weather at ${destination} in the travel month, top tourist attractions, local food specialties, travel tips.
- Build a complete travel plan with:
  1. 🌤️ Weather overview (from real search data)
  2. 🗺️ Top places to visit (briefly — cards with photos are shown separately)
  3. 🍽️ Must-try local food and restaurants
  4. 📅 Day-by-day itinerary (morning/afternoon/evening) for every day
  5. 🎒 Packing tips and travel notes
- Note: Hotel cards with photos and booking links are shown separately — don't list hotels in detail, just mention 1-2 lines about accommodation type.
- Keep tone warm, practical, and enthusiastic.

CONVERSATION RULES:
- If the user says something casual like "ok", "thanks", "thank you", "great" — reply SHORT. DO NOT repeat the plan.
- Never repeat information already shared unless explicitly asked.
- Keep follow-up responses SHORT and conversational unless detail is needed.`;
  };

  // Countdown timer
  useEffect(() => {
    if (retryAfter <= 0) return;
    retryTimer.current = setInterval(() => {
      setRetryAfter((s) => { if (s <= 1) { clearInterval(retryTimer.current); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(retryTimer.current);
  }, [retryAfter]);

  // Auto-retry on rate limit
  useEffect(() => {
    if (retryAfter === 0 && retryMsgs) {
      const msgs = retryMsgs;
      setRetryMsgs(null);
      setError("");
      setMessages(msgs);
      callAPI(msgs).then(({ reply, searched }) => {
        setMessages([...msgs, { role: "assistant", content: reply, searched }]);
      }).catch((err) => {
        setError(err.message);
        if (err.type === "rate_limit") {
          setRetryAfter(err.retryAfter || 60);
          setRetryMsgs(msgs);
          setMessages([...msgs, { role: "assistant", content: "⏳ Still busy. Auto-retrying again...", searched: [] }]);
        }
      }).finally(() => { setLoading(false); setSearching(false); });
    }
  }, [retryAfter]);

  const callAPI = async (msgs) => {
    setSearching(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, systemPrompt: buildSystemPrompt() }),
    });
    const data = await res.json();
    setSearching(false);
    if (!res.ok) {
      const err = new Error(data.message || `Error ${res.status}`);
      err.type = data.error;
      err.retryAfter = data.retryAfter;
      throw err;
    }
    return { reply: data.reply, searched: data.searched || [] };
  };

  // ✅ Fetch hotel + attraction cards separately
  const fetchCards = async () => {
    setCardsLoading(true);
    try {
      const budgetInfo = BUDGETS.find((b) => b.id === selectedBudget);
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          budget: `${budgetInfo?.label} (${budgetInfo?.sub})`,
          dates: `${arrival} to ${departure}`,
        }),
      });
      const data = await res.json();
      setCards(data);
    } catch {
      setCards(null);
    }
    setCardsLoading(false);
  };

  const startChat = async () => {
    setStep("chat");
    setLoading(true);
    setError("");
    setCards(null);
    const moodLabels = selectedMoods.map((m) => MOODS.find((x) => x.id === m)?.label).join(", ");
    const budgetInfo = BUDGETS.find((b) => b.id === selectedBudget);
    const vibeLabel = VIBES.find((v) => v.id === selectedVibe)?.label;
    const initMsg = `Please search the web and build my complete travel plan for ${destination} from ${arrival} to ${departure}. I'm interested in: ${moodLabels}. Traveling ${vibeLabel} on a ${budgetInfo?.label} budget (${budgetInfo?.sub}). Search for current weather, top attractions and local food first.`;
    const userMsg = { role: "user", content: initMsg };
    setMessages([userMsg]);

    // Run chat and cards fetch in parallel for speed
    fetchCards();

    try {
      const { reply, searched } = await callAPI([userMsg]);
      setMessages([userMsg, { role: "assistant", content: reply, searched }]);
    } catch (err) {
      setError(err.message);
      if (err.type === "rate_limit") {
        setRetryAfter(err.retryAfter || 60);
        setRetryMsgs([userMsg]);
        setMessages([userMsg, { role: "assistant", content: "⏳ AI is busy right now. Auto-retrying soon...", searched: [] }]);
      } else {
        setMessages([userMsg, { role: "assistant", content: "⚠️ Could not load your travel plan. See error above.", searched: [] }]);
      }
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const apiMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const { reply, searched } = await callAPI(apiMessages);
      setMessages([...newMsgs, { role: "assistant", content: reply, searched }]);
    } catch (err) {
      setError(err.message);
      if (err.type === "rate_limit") {
        setRetryAfter(err.retryAfter || 60);
        setRetryMsgs(apiMessages);
        setMessages([...newMsgs, { role: "assistant", content: "⏳ AI is busy. Auto-retrying...", searched: [] }]);
      }
    }
    setLoading(false);
  };

  const toggleMood = (id) => setSelectedMoods((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const reset = () => {
    setStep("intro"); setMessages([]); setSelectedMoods([]); setSelectedBudget(null);
    setSelectedVibe(null); setDestination(""); setArrival(""); setDeparture("");
    setError(""); setRetryAfter(0); setRetryMsgs(null); setSearching(false);
    setCards(null); setCardsLoading(false);
  };

  const bg = { minHeight: "100vh", background: "linear-gradient(145deg,#060504 0%,#100d05 40%,#080f14 100%)", color: "#e8dcc8", fontFamily: "'Source Serif 4',Georgia,serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 40px" };
  const wrap = { width: "100%", maxWidth: 700, position: "relative", zIndex: 1 };
  const cardBox = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.18)", borderRadius: 18, padding: "22px 26px", backdropFilter: "blur(16px)", boxShadow: "0 16px 48px rgba(0,0,0,0.45)", marginBottom: 14 };
  const lbl = { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 14, display: "block" };
  const inp = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,110,0.22)", borderRadius: 10, padding: "11px 14px", color: "#e8dcc8", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const primaryBtn = (off) => ({ background: off ? "rgba(201,169,110,0.2)" : "linear-gradient(135deg,#c9a96e,#9a6f35)", border: "none", borderRadius: 12, padding: "13px 26px", color: off ? "rgba(201,169,110,0.5)" : "#1a0f00", fontSize: 14, fontWeight: 700, cursor: off ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: off ? "none" : "0 5px 18px rgba(201,169,110,0.28)", width: "100%", transition: "all .2s" });
  const ghostBtn = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 22px", color: "rgba(232,220,200,0.55)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  const moodB = (sel) => ({ padding: "11px 6px", borderRadius: 10, border: sel ? "1.5px solid #c9a96e" : "1px solid rgba(255,255,255,0.07)", background: sel ? "rgba(201,169,110,0.13)" : "rgba(255,255,255,0.025)", color: sel ? "#c9a96e" : "rgba(232,220,200,0.65)", cursor: "pointer", textAlign: "center", transition: "all .18s", fontSize: 11, fontFamily: "inherit", boxShadow: sel ? "0 0 14px rgba(201,169,110,0.18)" : "none" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        input[type=date]{color-scheme:dark}
        input:focus{border-color:rgba(201,169,110,0.7)!important;outline:none}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.25);border-radius:4px}
      `}</style>

      <div style={bg}>
        <div style={{ position: "fixed", top: "20%", left: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,169,110,0.05) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "10%", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(80,130,200,0.04) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={wrap}>
          {/* Header */}
          <div style={{ textAlign: "center", padding: "32px 0 18px" }}>
            <span style={{ fontSize: 44, display: "block", animation: "float 3s ease-in-out infinite", marginBottom: 10 }}>🌍</span>
            <h1 style={{ fontSize: 34, fontFamily: "'Playfair Display',serif", fontWeight: 700, background: "linear-gradient(90deg,#c9a96e,#f0d898,#c9a96e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200%", animation: "shimmer 5s linear infinite", letterSpacing: "-0.3px", marginBottom: 6 }}>WanderAI</h1>
            <p style={{ fontSize: 11.5, color: "rgba(232,220,200,0.45)", letterSpacing: "0.25em", textTransform: "uppercase" }}>AI Travel Agent · Searches the Web in Real Time</p>
          </div>

          {/* STEP 1 */}
          {step === "intro" && (
            <div style={{ animation: "fadeUp 0.45s ease" }}>
              <div style={cardBox}>
                <span style={lbl}>📍 Destination</span>
                <input style={inp} placeholder="Where to? (e.g. Manali, Goa, Udaipur, Paris...)" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div style={cardBox}>
                <span style={lbl}>📅 Travel Dates</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10.5, color: "rgba(232,220,200,0.4)", marginBottom: 7, letterSpacing: "0.15em" }}>ARRIVING</p>
                    <input type="date" style={inp} value={arrival} onChange={(e) => setArrival(e.target.value)} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10.5, color: "rgba(232,220,200,0.4)", marginBottom: 7, letterSpacing: "0.15em" }}>DEPARTING</p>
                    <input type="date" style={inp} value={departure} onChange={(e) => setDeparture(e.target.value)} />
                  </div>
                </div>
              </div>
              <button style={primaryBtn(!destination || !arrival || !departure)} disabled={!destination || !arrival || !departure} onClick={() => setStep("mood")}>
                Continue — Choose Your Vibe →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === "mood" && (
            <div style={{ animation: "fadeUp 0.45s ease" }}>
              <div style={cardBox}>
                <span style={lbl}>🌟 What excites you? (pick all that apply)</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9 }}>
                  {MOODS.map((m) => (
                    <button key={m.id} style={moodB(selectedMoods.includes(m.id))} onClick={() => toggleMood(m.id)}>
                      <div style={{ fontSize: 20, marginBottom: 5 }}>{m.icon}</div>
                      <div style={{ lineHeight: 1.3 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={cardBox}>
                <span style={lbl}>👥 Traveling as?</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9 }}>
                  {VIBES.map((v) => (
                    <button key={v.id} style={moodB(selectedVibe === v.id)} onClick={() => setSelectedVibe(v.id)}>
                      <div style={{ fontSize: 20, marginBottom: 5 }}>{v.icon}</div>
                      <div>{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={ghostBtn} onClick={() => setStep("intro")}>← Back</button>
                <button style={{ ...primaryBtn(!selectedMoods.length || !selectedVibe), flex: 2 }} disabled={!selectedMoods.length || !selectedVibe} onClick={() => setStep("budget")}>Set Budget →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === "budget" && (
            <div style={{ animation: "fadeUp 0.45s ease" }}>
              <div style={cardBox}>
                <span style={lbl}>💰 Budget per person per day</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11 }}>
                  {BUDGETS.map((b) => (
                    <button key={b.id} style={{ ...moodB(selectedBudget === b.id), padding: "16px 10px" }} onClick={() => setSelectedBudget(b.id)}>
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{b.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{b.label}</div>
                      <div style={{ fontSize: 10.5, opacity: 0.65 }}>{b.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={ghostBtn} onClick={() => setStep("mood")}>← Back</button>
                <button style={{ ...primaryBtn(!selectedBudget), flex: 2 }} disabled={!selectedBudget} onClick={startChat}>🔍 Search & Generate My Plan</button>
              </div>
            </div>
          )}

          {/* STEP 4 — Chat */}
          {step === "chat" && (
            <div style={{ animation: "fadeUp 0.45s ease" }}>
              {/* Trip summary bar */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, padding: "9px 14px", background: "rgba(201,169,110,0.06)", borderRadius: 10, border: "1px solid rgba(201,169,110,0.14)", fontSize: 12 }}>
                <span style={{ color: "#c9a96e", fontWeight: 600 }}>📍 {destination}</span>
                <span style={{ color: "rgba(201,169,110,0.3)" }}>|</span>
                <span style={{ color: "rgba(232,220,200,0.55)" }}>{arrival} → {departure}</span>
                <span style={{ color: "rgba(201,169,110,0.3)" }}>|</span>
                <span style={{ color: "rgba(232,220,200,0.55)" }}>{BUDGETS.find(b => b.id === selectedBudget)?.label}</span>
                <span style={{ color: "rgba(201,169,110,0.3)" }}>|</span>
                <span style={{ color: "rgba(232,220,200,0.55)" }}>{VIBES.find(v => v.id === selectedVibe)?.label}</span>
                <span style={{ color: "rgba(201,169,110,0.3)" }}>|</span>
                <span style={{ color: "rgba(100,200,100,0.7)", fontSize: 11 }}>🔍 Web Search Active</span>
              </div>

              {/* Error banner */}
              {error && retryAfter === 0 && (
                <div style={{ background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: 9, padding: "10px 14px", marginBottom: 12, fontSize: 12.5, color: "#ff9090" }}>⚠️ {error}</div>
              )}

              {/* Rate limit banner */}
              {retryAfter > 0 && (
                <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 9, padding: "12px 16px", marginBottom: 12, fontSize: 13, color: "#c9a96e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>⏳ Rate limit — auto-retrying in <strong>{retryAfter}s</strong></span>
                  <button onClick={() => setRetryAfter(0)} style={{ background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.4)", borderRadius: 7, padding: "5px 12px", color: "#c9a96e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Retry Now</button>
                </div>
              )}

              {/* Chat window — cards live inside here */}
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,169,110,0.12)", borderRadius: 18, padding: "18px 18px 8px", height: 580, overflowY: "auto", marginBottom: 12, scrollbarWidth: "thin" }}>
                {messages.length === 0 && !loading && !searching && (
                  <div style={{ textAlign: "center", color: "rgba(232,220,200,0.3)", marginTop: 80, fontSize: 13 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                    Searching the web for your destination...
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i}>
                    <ChatMessage msg={m} />
                    {m.role === "assistant" && m.searched?.length > 0 && <SearchedBadges queries={m.searched} />}
                  </div>
                ))}
                {/* Cards appear inside chat after first AI response */}
                {(cards || cardsLoading) && messages.length >= 2 && (
                  <div style={{ marginBottom: 16, animation: "fadeUp 0.5s ease" }}>
                    <CardsSection cards={cards} cardsLoading={cardsLoading} />
                  </div>
                )}
                {searching && <SearchingIndicator />}
                {loading && !searching && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 46, marginBottom: 16 }}>
                    <TypingDots />
                    <span style={{ fontSize: 12, color: "rgba(232,220,200,0.35)" }}>Writing your travel plan...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input style={{ ...inp, flex: 1, borderRadius: 11 }} placeholder="Ask anything — restaurants, transport, hidden gems..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()} />
                <button style={{ ...primaryBtn(loading || !input.trim()), width: "auto", padding: "11px 20px", borderRadius: 11 }} onClick={sendMessage} disabled={loading || !input.trim()}>Send ✈️</button>
              </div>
              <button style={{ ...ghostBtn, width: "100%", fontSize: 12.5 }} onClick={reset}>↺ Plan a New Trip</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}