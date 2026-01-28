# JARVIS Agentic Workflow - Testing & Verification Guide

## Quick Start Testing

### Local Development

```bash
# 1. Setup environment
cd ai-tutor/python-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys (in backend/.env)
export GROQ_API_KEY=gsk_xxx...
export TAVILY_API_KEY=tvly_xxx...

# 4. Start Flask server
python app.py
# Output: Server runs at http://localhost:3000
```

---

## Test Cases

### Test 1: Intent Classification Only (No Search)
**Query:** "Explain quantum computing"
**Expected:** needs_search=false, internal knowledge used

```bash
curl -X POST http://localhost:3000/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain quantum computing"}'
```

**Expected Response:**
```json
{
  "success": true,
  "response": "JARVIS: Quantum computing represents... [explanation using internal knowledge]",
  "needs_search": false,
  "has_research": false,
  "sources": [],
  "intent": {
    "needs_search": false,
    "confidence": 0.85,
    "reason": "General concept; no time-sensitivity"
  }
}
```

---

### Test 2: Classification + Research (With Search)
**Query:** "What are the latest AI breakthroughs in 2026?"
**Expected:** needs_search=true, Tavily searches, sources returned

```bash
curl -X POST http://localhost:3000/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest AI breakthroughs in 2026?"}'
```

**Expected Response:**
```json
{
  "success": true,
  "response": "JARVIS: Recent developments indicate... [Source 1](url) confirms... [Source 2](url) demonstrates...",
  "needs_search": true,
  "has_research": true,
  "sources": [
    {
      "title": "AI Breakthrough Title",
      "snippet": "Preview of the article...",
      "url": "https://example.com"
    }
  ],
  "intent": {
    "needs_search": true,
    "confidence": 0.92,
    "reason": "Query requires 2026 data",
    "queries": [
      "What are the latest AI breakthroughs in 2026?",
      "2026 AI breakthroughs announcements",
      "artificial intelligence new developments this year"
    ]
  }
}
```

---

### Test 3: Workflow Debug Endpoint
**See all three layers in action**

```bash
curl -X POST http://localhost:3000/api/jarvis/workflow \
  -H "Content-Type: application/json" \
  -d '{"query": "Latest blockchain news"}' | jq .
```

**Response shows:**
- Step 1: Intent classification (needs_search, queries)
- Step 2: Research results (sources, snippets)
- Step 3: Final synthesized response

---

### Test 4: Current Events Query
**Query:** "What happened today?"
**Expected:** needs_search=true (time-sensitive)

```bash
curl -X POST http://localhost:3000/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What happened today?"}'
```

---

### Test 5: Empty Query Handling
**Query:** "" (empty)
**Expected:** 400 error

```bash
curl -X POST http://localhost:3000/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query": ""}'
```

**Expected Error:**
```json
{
  "success": false,
  "error": "Empty query"
}
```

---

### Test 6: Health Check
**Verify backend is online**

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "groq": "ok",
  "tavily": "ok",
  "timestamp": "2026-01-28T12:34:56.789123"
}
```

---

### Test 7: Root Info Endpoint
**Get service details**

```bash
curl http://localhost:3000/
```

**Expected Response:**
```json
{
  "status": "online",
  "service": "JARVIS Agentic AI Backend v2.0",
  "groq": "configured",
  "tavily": "configured",
  "timestamp": "2026-01-28T12:34:56.789123"
}
```

---

## Performance Benchmarks

### Scenario 1: General Knowledge Query
- Query: "What is Python?"
- needs_search: false
- Time: **0.8-1.2s**
- Cost: 1x Groq call only

### Scenario 2: Current News Query
- Query: "What's the latest AI news?"
- needs_search: true
- Time: **3.5-5.0s**
- Cost: 1x Groq (classify) + 3x Tavily (search) + 1x Groq (synthesize)

### Scenario 3: Research-Heavy Query
- Query: "Compare latest quantum computing approaches in 2026"
- needs_search: true
- Time: **4.0-6.0s**
- Cost: High (3 search queries + synthesis)

---

## Verification Checklist

### Code Quality
- ✅ Modular functions (each layer independent)
- ✅ Error handling with graceful fallbacks
- ✅ Comprehensive logging (for debugging)
- ✅ Type hints on all functions
- ✅ Proper async handling (ThreadPoolExecutor)

### API Compliance
- ✅ Returns JSON with standard schema
- ✅ Includes error messages on failures
- ✅ HTTP status codes correct (200, 400, 500, 503)
- ✅ CORS headers for frontend calls
- ✅ Timestamp on every response

### Feature Completeness
- ✅ Layer 1: Intent classification with Triad queries
- ✅ Layer 2: Async Tavily search with aggregation
- ✅ Layer 3: Groq synthesis with citations
- ✅ Fallbacks: LLM-only when no search results
- ✅ Disclaimers: When sources unavailable

### Production Readiness
- ✅ Gunicorn WSGI server configured
- ✅ Environment variables from .env
- ✅ Logging to file (python-backend.log)
- ✅ Flask debug=False for production
- ✅ Port configurable (default 3000)

---

## Troubleshooting

### Issue: "GROQ_API_KEY is not set"
**Solution:**
```bash
# Set in backend/.env
GROQ_API_KEY=gsk_xxxxx

# Or export in terminal
export GROQ_API_KEY=gsk_xxxxx
```

### Issue: "ModuleNotFoundError: No module named 'tavily'"
**Solution:**
```bash
pip install tavily-python==0.7.19
```

### Issue: Slow responses (>10s)
**Solution:**
1. Check Tavily API status (may be rate-limited)
2. Check Groq API status (inference may be slow)
3. Monitor network latency
4. Consider query optimization

### Issue: "Tavily not configured; skipping research"
**Solution:**
```bash
# Set TAVILY_API_KEY in backend/.env
TAVILY_API_KEY=tvly_xxxxx

# Restart Flask app
python app.py
```

### Issue: 503 Error "Groq not configured"
**Solution:**
```bash
# Groq API key is REQUIRED
export GROQ_API_KEY=gsk_xxxxx
# Restart Flask app
python app.py
```

---

## Render Deployment Verification

### Check Deployment Status
```bash
# Visit: https://dashboard.render.com
# Select: Python Backend Service
# Check: Logs tab for any errors
```

### Test Render Live Endpoint
```bash
# Health check
curl https://your-render-service.onrender.com/health

# Simple test
curl -X POST https://your-render-service.onrender.com/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is 2+2?"}'
```

### Verify Environment on Render
```bash
# In Render Dashboard:
# Environment → Check GROQ_API_KEY and TAVILY_API_KEY are set
```

---

## Frontend Integration Testing

### Test Frontend → Backend Flow
1. Open: https://your-firebase-app.web.app
2. Navigate to: JARVIS AI Tools section
3. Type query: "What is machine learning?"
4. Verify:
   - ✅ Response appears within 1-3 seconds
   - ✅ "JARVIS" persona visible in response
   - ✅ No error messages

### Test with Search Query
1. Type: "Latest AI trends in 2026"
2. Verify:
   - ✅ Response appears (may take 4-5 seconds)
   - ✅ Sources shown with links
   - ✅ [Source 1], [Source 2] citations visible

---

## Monitoring & Logging

### Check Python Backend Logs
```bash
# Local
tail -f python-backend/python-backend.log

# Render
# Dashboard → Python Backend Service → Logs (live streaming)
```

### Log Entries to Monitor
```
[CLASSIFY] Analyzing: 'user query'  # ← Intent classification starting
OK Intent: needs_search=true | confidence=0.92  # ← Classification done
[RESEARCH] Running 3 queries asynchronously  # ← Search starting
Query done: query text | 2 hits  # ← Each search completing
OK Aggregated 5 sources  # ← Research done
[SYNTHESIZE] Generating grounded response  # ← Synthesis starting
[COMPLETE]  # ← Request finished
```

---

## Success Criteria

All tests pass if:
- ✅ Intent classification correctly identifies time-sensitive queries
- ✅ Triad queries generate 3 distinct search variants
- ✅ Async research completes in <5 seconds
- ✅ Responses include citations in Markdown format
- ✅ Fallback to LLM when no sources available
- ✅ Health endpoint returns 200 OK
- ✅ Error handling graceful (no crashes)
- ✅ Frontend displays responses correctly
- ✅ Render deployment stable

---

**Test Date:** 2026-01-28  
**Backend Version:** JARVIS v2.0 (Agentic)  
**Status:** Production-Ready ✅
