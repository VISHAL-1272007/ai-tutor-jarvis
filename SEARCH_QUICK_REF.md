# 🔍 SEARCH SYSTEM QUICK REFERENCE

## Current Configuration (Tavily → Sonar Only)

### Search Flow
```
Query → Tavily (3 keys) → Sonar → null
```

### API Keys (.env)
```env
# Primary (3-key rotation)
TAVILY_API_KEY=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
TAVILY_API_KEY2=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
TAVILY_API_KEY3=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

# Fallback
SONAR_API_KEY=(your key)
```

### Usage in Code
```javascript
// Basic search
const result = await searchWeb("latest AI news");

// With mode
const result = await searchWeb("Python tutorial", "code");

// News search
const result = await searchWeb("2026 elections news latest", "all");
```

### Response Format
```javascript
{
    answer: "AI-generated summary with citations",
    citations: ["https://source1.com", "https://source2.com"],
    sources: [
        { title: "Article 1", url: "...", snippet: "..." },
        { title: "Article 2", url: "...", snippet: "..." }
    ],
    searchEngine: "Tavily AI" // or "Sonar (Perplexity)"
}
```

### API Endpoints
- `POST /api/search/news` - News search
- `POST /api/search/web` - Web search
- `POST /api/search/comprehensive` - News + Web

### Startup Verification
Look for this in logs:
```
🔍 SEARCH SYSTEM: Simplified Fallback Chain
  ✅ Tavily (Primary): 3 keys
  ✅ Sonar (Fallback): ✓ Enabled
  🚫 DuckDuckGo: REMOVED
  🚫 Jina AI: REMOVED
  🚫 Brave Search: REMOVED
```

### Troubleshooting

**No search results?**
1. Check Tavily keys in .env
2. Check Sonar key in .env
3. Check network connectivity
4. Look for error logs

**Tavily failing?**
- Should automatically fall back to Sonar
- Check console: "⚠️ Tavily failed: [error]"
- Then: "🔹 Trying Sonar (Fallback)..."

**Both failing?**
- Returns `null`
- Check: "❌ All search APIs failed"
- Verify API keys are valid

### Related Files
- `backend/index.js` lines 560-1408 - Main search implementation
- `backend/.env` - API keys
- `SEARCH_SIMPLIFIED_TAVILY_SONAR.md` - Full documentation
