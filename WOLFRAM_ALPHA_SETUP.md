# 🔍 WOLFRAM ALPHA INTEGRATION GUIDE

## Overview

Integrate **Wolfram Alpha** - the world's leading computational knowledge engine - into JARVIS to provide:
- ✅ Computational answers (math, physics, chemistry)
- ✅ Factual information (history, geography, definitions)
- ✅ Unit conversions
- ✅ Real-time data and statistics
- ✅ Scientific analysis and visualizations

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Wolfram Alpha API Key
1. Visit: https://products.wolframalpha.com/api/
2. Click "Get API Access"
3. Sign up for free account (Development tier available)
4. Copy your **App ID** (this is your API key)

### Step 2: Add API Key to .env
Edit `backend/.env` and add:
```bash
WOLFRAM_ALPHA_API_KEY=your_app_id_here
```

### Step 3: Test Integration
```bash
# Backend will auto-initialize on startup
npm start

# Test the Wolfram endpoint
curl "http://localhost:3001/api/wolfram/query?q=what%20is%20the%20capital%20of%20france"
```

---

## 🎯 What Happens Now

### Automatic Integration
When JARVIS responds to questions, it will:
1. Answer using AI (Groq, Gemini, etc.)
2. **Automatically detect** if it's a factual/computational question
3. **Query Wolfram Alpha** in the background
4. **Enhance response** with verified facts from Wolfram
5. **Cache results** for faster future queries

### Example Questions JARVIS Will Enhance
- "What is 25% of 480?"
- "Solve 2x + 5 = 13"
- "What is the capital of France?"
- "Convert 100 miles to kilometers"
- "Define photosynthesis"
- "How tall is Mount Everest?"
- "What is the derivative of x²?"
- "When was Einstein born?"

---

## 📊 Files Created/Modified

### New Files
- **`backend/wolfram-alpha-trainer.js`** (360+ lines)
  - Wolfram Alpha API integration
  - Query caching system
  - Knowledge base management
  - Statistics tracking

### Modified Files
- **`backend/index.js`**
  - Import Wolfram Alpha module (line 9)
  - Enhanced chat endpoint (lines 2107-2128)
  - New `/api/wolfram/query` endpoint
  - New `/api/wolfram/stats` endpoint

### New Data Files (Auto-Created)
- **`data/wolfram_knowledge.json`** - Cached queries and answers
- **`data/wolfram_cache/`** - Additional cache storage

---

## 🔌 API Endpoints

### 1. Query Wolfram Alpha (Direct)
**Endpoint:** `GET /api/wolfram/query`

**Usage:**
```bash
curl "http://localhost:3001/api/wolfram/query?q=what%20is%202%2B2"
```

**Response:**
```json
{
  "success": true,
  "query": "what is 2+2",
  "answer": "4",
  "source": "Wolfram Alpha",
  "cached": false,
  "timestamp": "2026-01-11T07:30:00.000Z"
}
```

### 2. Get Statistics
**Endpoint:** `GET /api/wolfram/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalQueries": 42,
    "cachedResults": 40,
    "lastUpdate": "2026-01-11T07:30:00.000Z",
    "categories": {
      "math": 15,
      "science": 8,
      "facts": 12,
      "conversions": 5,
      "definitions": 2,
      "other": 0
    }
  }
}
```

### 3. Chat with Wolfram Enhancement
**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "message": "What is the population of India?",
  "history": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "According to my knowledge... 📚 **Additional Information from Wolfram Alpha:** India's population is approximately 1.4 billion people...",
  "provider": "Groq",
  "wolframEnhanced": true
}
```

---

## ⚙️ Configuration

### Change Query Categorization
Edit `backend/wolfram-alpha-trainer.js` line 183:
```javascript
const categorizeQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.match(/your_pattern/)) {
    return 'your_category';
  }
  // ...
}
```

### Change Cache Size
Edit `backend/wolfram-alpha-trainer.js` line 102:
```javascript
// Keep only last X queries
currentData.queries = currentData.queries.slice(0, 500); // Change 500
```

### Auto-Query Threshold
Edit `backend/index.js` line 2112:
```javascript
// Detect if this is a question to enhance
if (message.match(/(calculate|solve|what is|...)i)) {
  // Query Wolfram Alpha
}
```

---

## 📈 Query Categories

System automatically categorizes queries:

| Category | Examples | Detection |
|----------|----------|-----------|
| **Math** | "Solve 2x+5=13", "Derivative of x²" | Contains: solve, calculate, derivative, integral |
| **Science** | "Define photosynthesis", "Atomic mass" | Contains: physics, chemistry, biology, atom, element |
| **Facts** | "When was Einstein born?", "Capital of France" | Contains: who, when, where, how, fact, history |
| **Conversions** | "100 miles to km", "32°F to Celsius" | Contains: convert, =, to, in, as |
| **Definitions** | "What is gravity?", "Define photosynthesis" | Contains: define, definition, meaning, what is |
| **Other** | Any other query | Default fallback |

---

## 💾 Knowledge Base Structure

### `wolfram_knowledge.json`
```json
{
  "lastUpdate": "2026-01-11T07:30:00.000Z",
  "queries": [
    {
      "query": "what is 2+2",
      "answer": "4",
      "type": "short",
      "timestamp": "2026-01-11T07:30:00.000Z",
      "source": "Wolfram Alpha"
    }
  ],
  "queryCount": 42,
  "categories": {
    "math": 15,
    "science": 8,
    "facts": 12,
    "conversions": 5,
    "definitions": 2,
    "other": 0
  }
}
```

---

## 🔄 Caching System

### How It Works
1. **First Query:** Search Wolfram Alpha API
2. **Result:** Save to `wolfram_knowledge.json`
3. **Same Query Again:** Load from cache (instant)
4. **Rolling Window:** Keep last 500 queries
5. **Auto-Cleanup:** Remove duplicate queries

### Benefits
- ⚡ Faster responses for repeated questions
- 💰 Lower API usage costs
- 🔒 Works even if API is temporarily down
- 📊 Build knowledge base over time

---

## 📊 Monitoring

### View Recent Queries
```bash
cat data/wolfram_knowledge.json | jq '.queries[0:5]'
```

### Check Statistics
```bash
curl http://localhost:3001/api/wolfram/stats
```

### Monitor Logs
```bash
# Search for Wolfram queries
grep "Wolfram Alpha" backend.log | tail -20

# Check cache hits
grep "Found in Wolfram knowledge cache" backend.log
```

---

## 🛠️ Troubleshooting

### Error: "Wolfram Alpha API not configured"
**Solution:** Add `WOLFRAM_ALPHA_API_KEY` to `.env` file

### Error: "No results found"
**Solution:** 
- Verify API key is correct
- Try different query format
- Some queries may not have results

### Slow Response
**Solution:**
- First query takes longer (API call)
- Subsequent queries use cache (instant)
- Add more frequently asked questions to speed up

### API Rate Limit Exceeded
**Solution:**
- Free tier: 2,000 queries/month
- Upgrade plan if needed
- Cache helps reduce API calls

---

## 🌟 Advanced Features

### Multi-Language Support
Wolfram Alpha supports queries in multiple languages:
```javascript
await smartWolframQuery("¿Cuál es la capital de España?"); // Spanish
await smartWolframQuery("Quelle est la capitale de la France?"); // French
await smartWolframQuery("இந்தியாவின் மூலதனம் என்ன?"); // Tamil
```

### Scientific Notation
```javascript
await smartWolframQuery("integrate sin(x) from 0 to pi");
await smartWolframQuery("solve x^3 - 2x = 0");
```

### Real-Time Data
```javascript
await smartWolframQuery("current Bitcoin price");
await smartWolframQuery("weather in New York");
await smartWolframQuery("sunrise time tomorrow");
```

---

## 📚 Example Integration Code

### Simple Query
```javascript
const { smartWolframQuery } = require('./wolfram-alpha-trainer');

const result = await smartWolframQuery("What is the area of a circle with radius 5?");
console.log(result.answer); // "25 π ≈ 78.5398..."
```

### With Error Handling
```javascript
try {
  const result = await smartWolframQuery(userQuestion);
  if (result.success) {
    console.log("Answer:", result.answer);
  } else {
    console.log("No results found");
  }
} catch (error) {
  console.error("Query failed:", error.message);
}
```

### Get Statistics
```javascript
const { getWolframStats } = require('./wolfram-alpha-trainer');

const stats = getWolframStats();
console.log(`Cached results: ${stats.cachedResults}`);
console.log(`Total queries: ${stats.totalQueries}`);
console.log(`Categories:`, stats.categories);
```

---

## 🎓 Learning Benefits

### What JARVIS Can Now Do
1. **Exact Calculations** - Math and physics problems
2. **Factual Answers** - History, geography, definitions
3. **Data Analysis** - Statistics and trends
4. **Unit Conversions** - Any measurement conversion
5. **Scientific Computation** - Derivatives, integrals, equations
6. **Real-World Facts** - Current data and information

### Demo Impact
- Show JARVIS solving complex math problems
- Answer questions about world facts instantly
- Perform unit conversions perfectly
- Display scientific computations
- Provide real-time information

---

## 🚀 Future Enhancements

### Planned Features
1. ✅ Caching system (done)
2. 🔄 Category-based responses
3. 📊 Visualization of results
4. 🌍 Multi-language support
5. 📈 Trending queries tracking
6. 🎯 Question-answer suggestions

### Integration Ideas
- Combine with Daily News for fact verification
- Use for assignment answer checking
- Build knowledge base of course materials
- Create FAQ system with Wolfram backup

---

## 📞 Support

### Wolfram Alpha Resources
- **Official API:** https://products.wolframalpha.com/api/
- **Documentation:** https://products.wolframalpha.com/api/documentation
- **Examples:** https://www.wolframalpha.com/input/?i=examples

### Quick Debug
1. Test API key: Visit `https://api.wolframalpha.com/v2/query?appid=YOUR_KEY&input=2%2B2`
2. Check `.env` file: `WOLFRAM_ALPHA_API_KEY=xxx`
3. Verify response: `curl http://localhost:3001/api/wolfram/query?q=2%2B2`

---

## ✨ Success Metrics

### What You'll See
- ✅ API endpoints responding correctly
- ✅ Queries cached in `wolfram_knowledge.json`
- ✅ Chat responses enhanced with Wolfram data
- ✅ Statistics showing query categories
- ✅ Automatic caching improving performance

### By Demo Day
- 100+ cached queries
- Rich knowledge base of answers
- JARVIS answering computational questions perfectly
- Instant responses from cache
- Impressive factual accuracy

---

**Status: ✅ READY TO INTEGRATE**

Wolfram Alpha is now fully integrated into JARVIS! Every response can be enhanced with computational knowledge, and all queries are cached for instant future access. No manual intervention needed - it works automatically!

🚀 **JARVIS now has the power of Wolfram Alpha!**
