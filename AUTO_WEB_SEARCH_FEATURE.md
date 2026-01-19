# 🌐 Auto Web Search with AI Context Integration

**Last Updated:** January 19, 2026  
**Feature:** Automatic web search detection and real-time context injection  
**Status:** ✅ **LIVE & DEPLOYED**

---

## 📋 Overview

The chat controller now **automatically detects** when a user asks about current events, news, or topics the AI may not know about. When detected:

1. ✅ **Automatically calls `searchWeb()`** to fetch real-time information
2. ✅ **Passes search results as context** to the AI model
3. ✅ **AI naturally cites sources** in its response
4. ✅ **Returns source metadata** in the response for the frontend

---

## 🧠 Smart Detection Logic

### `detectWebSearchNeeded(question)` Function

The new function analyzes the user's question to determine if web search would be beneficial:

**Keywords that trigger web search:**
- **Current events:** `latest`, `current`, `today`, `now`, `recent`, `news`, `weather`, `breaking`, `live`, `right now`
- **Time-specific:** `this week`, `this month`, `this year`, `2024`, `2025`, `2026`
- **Topics to explore:** `tell me about`, `what is`, `who is`, `where is`, `when did`, `research`, `look up`, `find out`
- **Real-time data:** `bitcoin`, `stock price`, `election`, `score`, `who won`

**Keywords that skip web search** (to avoid unnecessary searches):
- **Learning/education:** `explain`, `teach me`, `how to`, `tutorial`, `help me understand`, `definition`
- **Coding:** `code`, `program`, `write`, `algorithm`, `debug`, `error`
- **General knowledge:** `what does`, `meaning of`, `concept`, `learn about`

**Exception:** If a question has BOTH educational keywords AND real-time keywords (e.g., "latest Python news"), web search is enabled.

---

## 🔄 How It Works

### Step 1: Question Analysis
```javascript
const shouldSearchWeb = detectWebSearchNeeded(question);
// Example: "What's the latest news about AI?" → true ✅
// Example: "How do I write a for loop?" → false ❌
```

### Step 2: Automatic Web Search
If web search is needed, the backend:
```javascript
webSearchResults = await searchWeb(question, mode || 'all');
```

Uses available search APIs in priority order:
1. **Jina AI** (10K/month free)
2. **Perplexity API** (best quality, citations built-in)
3. **Brave Search** (fast, reliable)
4. **DuckDuckGo** (always available, no key needed)

### Step 3: Context Injection
Search results are formatted as context and added to the system prompt:

```javascript
webContext = `
📚 **REAL-TIME CONTEXT FROM WEB SEARCH:**

[Search summary from web search results]

**Sources Used:**
1. [Article Title](https://...)
2. [Article Title](https://...)

(Reference these sources in your response when relevant)
`;
```

### Step 4: AI Processing with Context
The AI model receives:
- **Original system prompt** (JARVIS persona, directives)
- **Web search context** (current information)
- **Citation instructions** (naturally cite sources)

```javascript
advancedSystemPrompt += webContext;
advancedSystemPrompt += `\n⚠️ **IMPORTANT:** When answering, naturally cite the sources above using markdown links when providing information from them.`;
```

### Step 5: Response with Metadata
The response includes:
```json
{
  "answer": "...[AI response with citations]...",
  "queryType": "general",
  "expertMode": "JARVIS (Just A Rather Very Intelligent System)",
  "webSearchUsed": true,
  "sources": [
    {
      "title": "Article Title",
      "url": "https://...",
      "snippet": "Article preview..."
    }
  ],
  "searchEngine": "Jina AI"
}
```

---

## 📊 Example Flows

### Example 1: News Query ✅ Web Search Triggered
```
User: "What's happening in tech news today?"
↓
detectWebSearchNeeded() → true (contains "today" + "news")
↓
searchWeb() → fetches latest tech news
↓
AI receives web context + writes answer with citations
↓
Response: "According to recent reports [citation], the latest in tech is..."
```

### Example 2: Educational Query ❌ Web Search Skipped
```
User: "Explain recursion in programming"
↓
detectWebSearchNeeded() → false (educational content, no real-time need)
↓
AI responds with knowledge base
↓
Response: "Recursion is a programming technique where..."
```

### Example 3: Mixed Query ✅ Web Search Triggered (Exception)
```
User: "Latest advances in quantum computing explained"
↓
detectWebSearchNeeded() → true (has "latest" + educational words)
↓
searchWeb() → fetches latest quantum computing news
↓
AI receives web context and explains with current citations
↓
Response: "Recent breakthroughs [citation] show..."
```

---

## 🎯 Key Features

### ✅ Automatic Detection
- No user action required
- Intelligently determines when to search
- Reduces hallucinations for current topics

### ✅ Natural Citations
- AI automatically cites sources from web search
- Uses markdown links: `[Source Title](URL)`
- Preserves original source context

### ✅ Fallback Search Engines
- **Primary:** Jina AI (most free tier: 10K/month)
- **Secondary:** Perplexity (premium quality)
- **Tertiary:** Brave Search (reliable)
- **Fallback:** DuckDuckGo (always works, no key)

### ✅ Context Preservation
- Web search doesn't replace AI knowledge
- Combines both for comprehensive answers
- Falls back to AI-only if web search fails

### ✅ Source Metadata
- Frontend receives `webSearchUsed: true`
- Access to `sources` array with titles and URLs
- `searchEngine` identifies which API was used

---

## 🔧 Configuration

### Environment Variables Needed
```bash
# For web search APIs
JINA_API_KEY=your_jina_key                    # 10K/month free
PERPLEXITY_API_KEY=your_perplexity_key       # Best quality
BRAVE_SEARCH_API_KEY=your_brave_key          # Fast & reliable
SERPAPI_KEY=your_serpapi_key                 # Alternative option

# Core APIs (already configured)
GROQ_API_KEY=your_groq_key                   # Already set
```

### Enable/Disable Web Search
```javascript
// In request body
POST /ask
{
  "question": "What's the latest news?",
  "enableWebSearch": true    // default: true (auto-enabled)
}

// To disable for specific queries:
{
  "question": "How to code?",
  "enableWebSearch": false   // Skip web search
}
```

---

## 📈 Performance Optimizations

### Timeout Handling
- Web search timeout: **15 seconds max**
- If search slow, AI still responds with knowledge
- No blocking of responses

### API Load Balancing
- Multiple API keys for scaling
- Automatic failover between search engines
- Rate limit aware

### Context Length Management
- Only top 5 sources included
- Snippets limited to key information
- Full URLs preserved for citations

---

## 🧪 Testing the Feature

### Test Case 1: Current Events
```bash
Question: "What happened in the news today?"
Expected: Web search triggered, current news provided with citations
Verify: webSearchUsed: true in response
```

### Test Case 2: Stock Information
```bash
Question: "What's the current Bitcoin price?"
Expected: Real-time price from web search
Verify: Sources include finance sites, citations present
```

### Test Case 3: Recent Technology
```bash
Question: "Tell me about the latest AI developments"
Expected: Web search for recent AI news
Verify: Response mentions today's/this week's developments
```

### Test Case 4: Educational Query (No Search)
```bash
Question: "How does photosynthesis work?"
Expected: No web search, AI knowledge used
Verify: webSearchUsed: false or missing from response
```

---

## 🎨 Frontend Integration

The frontend can display search information:

```javascript
// Response structure
{
  answer: "AI response with citations",
  webSearchUsed: true,
  sources: [
    { title: "...", url: "...", snippet: "..." }
  ],
  searchEngine: "Jina AI"
}

// Display to user
if (response.webSearchUsed) {
  console.log("📚 Sources:");
  response.sources.forEach(source => {
    console.log(`- [${source.title}](${source.url})`);
  });
  console.log(`Powered by ${response.searchEngine}`);
}
```

---

## 🚀 Deployment Status

### ✅ Completed
- [x] Smart detection function created
- [x] Web search auto-triggered for relevant queries
- [x] Search results integrated as AI context
- [x] Source citations added to system prompt
- [x] Response metadata includes search info
- [x] Error handling and fallbacks
- [x] Tested and deployed to backend

### 📊 API Capacity
- **Jina AI:** 10,000 searches/month (free tier)
- **Perplexity:** Usage-based
- **Brave Search:** 2,000 queries/month (free)
- **DuckDuckGo:** Unlimited (no key needed)

---

## 📝 Code Changes

### Files Modified
1. **backend/index.js**
   - Added `detectWebSearchNeeded()` function (47 lines)
   - Modified `/ask` endpoint with auto web search logic
   - Added web context injection to system prompt
   - Enhanced response with web search metadata

### Lines Changed
- **New function:** Lines 273-318 (detectWebSearchNeeded)
- **Modified /ask:** Lines 1010-1057 (web search logic)
- **Response structure:** Lines 1213-1230 (added web search fields)

---

## 🔍 Monitoring

### Watch Backend Logs For:
```
✅ Web search auto-detected! Fetching real-time information...
🔥 Using Jina AI Search (10K/month free)...
📊 Web context prepared with 3 sources
🌐 Web search context included in prompt
```

### Expected Behavior:
- Queries with "latest", "news", "today" → `webSearchUsed: true`
- Queries with "explain", "how to" → `webSearchUsed: false`
- All responses include sources if web search used

---

## 🎯 Benefits

1. **Up-to-date Information** - Always provides current data
2. **Reduced Hallucinations** - Real facts from web, not AI generation
3. **Transparent Sources** - Users see where info comes from
4. **Smart Efficiency** - Only searches when beneficial
5. **Seamless Integration** - No UI changes needed, works automatically

---

## ⚙️ Troubleshooting

### Issue: Web search not triggering
**Solution:** Check if question has current event keywords like "latest", "today", "news"

### Issue: Sources not showing
**Solution:** Verify search API keys are set in .env file

### Issue: Slow responses
**Solution:** Web search timeout is 15s, falls back to AI if slow

### Issue: Empty search results
**Solution:** Falls back to other search APIs automatically

---

**Created by:** JARVIS Team  
**Feature Release:** January 19, 2026  
**Status:** Production Ready ✅
