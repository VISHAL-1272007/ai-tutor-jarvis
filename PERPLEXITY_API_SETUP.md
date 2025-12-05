# 🔍 Perplexity API Setup Guide

Your voice commit interface can now search the web and provide real-time information with citations, just like Perplexity!

## 🎯 What You Get

With Perplexity API integration, your JARVIS can:
- 🌐 **Search the web in real-time** for current information
- 📚 **Provide citations and sources** for all answers
- 🔄 **Get latest data** (not limited to training data)
- 🎓 **Academic research** with scholarly sources
- 💻 **Code examples** from GitHub and Stack Overflow
- 📰 **Latest news and updates**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Perplexity API Key (FREE Trial)

1. Go to: **https://www.perplexity.ai/settings/api**
2. Sign up / Log in
3. Click **"Generate API Key"**
4. Copy your API key (starts with `pplx-...`)

**Pricing:**
- ✅ **FREE Trial**: $5 credit (≈ 1,000 searches)
- 💰 **Pay-as-you-go**: $0.005 per search
- 🎓 **Academic discount available**

---

### Step 2: Add API Key to Backend

Open `backend/.env` and add:

```env
# Perplexity API for Web Search
PERPLEXITY_API_KEY=pplx-your-actual-api-key-here
```

**Example:**
```env
PERPLEXITY_API_KEY=pplx-1234567890abcdef
```

---

### Step 3: Restart Backend

```bash
cd backend
npm install axios
npm start
```

✅ **That's it!** Your voice commit interface now has web search powers!

---

## 🎨 How It Works

### Without Perplexity (Current):
```
User: "What's the weather today?"
JARVIS: "I don't have access to real-time data..."
```

### With Perplexity (New):
```
User: "What's the weather today?"
JARVIS: "Based on current data from weather.com:
Temperature: 72°F, Sunny with clear skies
Forecast: Perfect day for outdoor activities!

Sources:
[1] weather.com - Current conditions
[2] wunderground.com - 10-day forecast"
```

---

## 🌟 Alternative: FREE Web Search APIs

If you don't want to pay, use these **FREE alternatives**:

### Option 1: Brave Search API (FREE)
- **2,000 searches/month FREE**
- Get key: https://brave.com/search/api/
- Add to `.env`: `BRAVE_SEARCH_API_KEY=your_key`

### Option 2: SerpAPI (FREE tier)
- **100 searches/month FREE**
- Get key: https://serpapi.com/
- Add to `.env`: `SERPAPI_KEY=your_key`

### Option 3: DuckDuckGo (No API Key Needed!)
- **Completely FREE, unlimited**
- No signup required
- Already integrated in backend!

---

## 📋 Backend Configuration

The backend automatically detects which API is available:

**Priority Order:**
1. ✅ Perplexity API (best quality, citations)
2. ✅ Brave Search API (good quality, free tier)
3. ✅ SerpAPI (good for Google results)
4. ✅ DuckDuckGo (basic search, always works)

---

## 🧪 Testing Your Setup

### Test 1: Check API Key
```bash
cd backend
node -e "console.log('Perplexity Key:', process.env.PERPLEXITY_API_KEY ? '✅ Set' : '❌ Missing')"
```

### Test 2: Try a Search Query
Open your website and ask:
- "What's the latest news about AI?"
- "Current weather in New York"
- "Latest JavaScript frameworks 2025"

You should see **citations and sources** in the response!

---

## 💡 Usage Tips

### Focus Modes
Each mode optimizes search:

- 🌐 **All**: General web search
- 🎓 **Academic**: Prioritize scholarly articles
- ✍️ **Writing**: Grammar and writing resources
- 🎥 **Video**: YouTube and video content
- 💻 **Code**: GitHub, Stack Overflow, docs

### Example Queries

**With Web Search:**
```
✅ "Latest Python 3.12 features"
✅ "Current Bitcoin price"
✅ "Today's news about SpaceX"
✅ "Best React hooks 2025"
```

**Without Web Search:**
```
✅ "Explain quantum computing"
✅ "Write a sorting algorithm"
✅ "Debug this code..."
✅ "How does photosynthesis work?"
```

---

## 🔧 Troubleshooting

### Issue: "API key not working"
**Solution:**
```bash
# Check if key is loaded
cd backend
cat .env | grep PERPLEXITY
```

### Issue: "Search not returning results"
**Solution:**
1. Check API quota (perplexity.ai/settings/api)
2. Try alternative APIs (Brave, DuckDuckGo)
3. Check backend logs: `npm start`

### Issue: "Citations not showing"
**Solution:**
- Make sure voice-commit.js is loaded after the modal HTML
- Check browser console (F12) for errors
- Verify backend response includes `citations` array

---

## 📊 API Comparison

| API | Free Tier | Quality | Citations | Speed |
|-----|-----------|---------|-----------|-------|
| **Perplexity** | $5 credit | ⭐⭐⭐⭐⭐ | ✅ Excellent | ⚡ Fast |
| **Brave** | 2k/month | ⭐⭐⭐⭐ | ✅ Good | ⚡ Fast |
| **SerpAPI** | 100/month | ⭐⭐⭐⭐ | ✅ Good | 🐢 Slower |
| **DuckDuckGo** | ♾️ Unlimited | ⭐⭐⭐ | ❌ Basic | ⚡ Fast |

---

## 🎯 Recommended Setup

**For Students/Personal Use:**
```env
BRAVE_SEARCH_API_KEY=your_brave_key  # 2k searches/month FREE
```

**For Professional/Production:**
```env
PERPLEXITY_API_KEY=your_pplx_key  # Best quality + citations
```

**For Testing/Development:**
```env
# No API key needed - uses DuckDuckGo automatically
```

---

## 📚 More Resources

- 📖 Perplexity API Docs: https://docs.perplexity.ai/
- 🦁 Brave Search API: https://brave.com/search/api/
- 🔍 SerpAPI Docs: https://serpapi.com/docs
- 💬 Discord Support: https://discord.gg/perplexity

---

## ✅ Next Steps

1. ✅ Add API key to `backend/.env`
2. ✅ Restart backend: `npm start`
3. ✅ Test voice commit with web search queries
4. ✅ Monitor usage at API dashboard
5. ✅ Upgrade plan if needed (usually $5-10/month)

---

**🎉 Congratulations!** Your JARVIS now has Perplexity-level web search capabilities!

*Developed with ❤️ by VISHAL*
