# ✈️ WanderAI — AI Travel Agent

An AI-powered travel planner that searches the web in real time to build complete itineraries.

---

## 📁 Project Structure

```
wanderai/
├── api/
│   └── chat.js        ← Serverless function (backend logic)
├── src/
│   ├── App.js         ← React UI
│   └── index.js       ← Entry point
├── public/
│   └── index.html     ← HTML shell
├── package.json       ← Dependencies
└── vercel.json        ← Vercel routing config
```

---

## 🚀 Deploy to Vercel (Step by Step)

### Step 1 — Get Free Groq API Key
1. Go to https://console.groq.com
2. Sign up free (no credit card)
3. API Keys → Create API Key → copy it (starts with `gsk_...`)

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "WanderAI initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wanderai.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your `wanderai` repo
3. Vercel auto-detects everything — don't change any settings
4. Before clicking Deploy, go to "Environment Variables" and add:
   ```
   GROQ_API_KEY = gsk_your_key_here
   ```
5. Click "Deploy"
6. Done! Your live URL appears in ~2 minutes ✅

---

## 💻 Run Locally

```bash
npm install

# Create local env file
echo "GROQ_API_KEY=gsk_your_key_here" > .env.local

# Start (needs Vercel CLI for serverless functions locally)
npm install -g vercel
vercel dev
```

---

## 🔒 Security
- API key lives only in Vercel Environment Variables
- Never in frontend code
- Never in GitHub

Built with React + Vercel Serverless Functions + Groq (Llama 3.3 70B) + DuckDuckGo Search
