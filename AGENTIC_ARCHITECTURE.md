# JARVIS Agentic Workflow Architecture v2.0

## Overview
JARVIS is a sophisticated autonomous AI agent that transforms simple user queries into grounded, research-backed responses. It combines zero-shot classification, multi-query research, and context-aware synthesis into a seamless three-layer pipeline.

---

## Architecture Layers

### **Layer 1: Intent Classification** 
**Function:** `classify_intent(user_query: str) → Dict`

**Purpose:** Determine if the user's query requires real-time grounding (current/2026 data).

**Process:**
- Uses Llama-3.3-70B with zero-shot prompting
- Analyzes query for time-sensitivity indicators
- Generates a **"Triad of Queries"** if search is needed:
  1. Semantic variant (conversational)
  2. Keyword variant #1 (technical)
  3. Keyword variant #2 (breadth-focused)

**Returns:**
```json
{
  "needs_search": true|false,
  "confidence": 0.85,
  "reason": "Query requires current 2026 data",
  "queries": [
    "What are the latest AI advancements in 2026?",
    "2026 AI breakthroughs announcements",
    "artificial intelligence new developments this year"
  ]
}
```

**Key Heuristics:**
- **Search Triggers:** "today", "now", "latest", "current", "breaking", "news", "2026", "trending", "live"
- **Skip Search:** definitions, how-tos, history, concepts, math (unless time-sensitive)

---

### **Layer 2: Asynchronous Research**
**Function:** `conduct_research(queries: List[str]) → Dict`

**Purpose:** Execute multi-query research using Tavily API with advanced search depth.

**Process:**
- Uses `ThreadPoolExecutor` for concurrent query execution (up to 3 workers)
- Each query runs `_run_tavily_search()` with:
  - `search_depth="advanced"` (high-entropy, premium results)
  - `max_results=2` per query (to avoid token overflow)
  - `include_answer=True` (direct Tavily answer if available)
- Aggregates all results into normalized format

**Aggregation Strategy:**
```
Sources are deduplicated and combined into context blocks:

[Source 1: Title]
Snippet content...
URL: https://example.com

[Source 2: Title]
Snippet content...
URL: https://example.com
```

**Returns:**
```json
{
  "context": "...aggregated text from all sources...",
  "sources": [
    {
      "title": "Article Title",
      "snippet": "...preview...",
      "url": "https://..."
    }
  ]
}
```

**Fallback Behavior:**
- If Tavily unavailable or no results: returns empty context
- Gracefully degrades to LLM-only mode

---

### **Layer 3: Context Synthesis**
**Function:** `generate_final_response(user_query: str, research: Dict) → str`

**Purpose:** Generate sophisticated, grounded response with citations.

**System Prompt (Iron Man Persona):**
```
You are JARVIS, an Iron Man–style AI: witty, sophisticated, precise, and 
fact-based. Communicate with polish, add light humor when helpful, and 
always cite sources in Markdown using numbered links: [Source 1](url). 
If grounding is sparse, be transparent and offer best-effort guidance.
```

**Process:**
1. Injects research context into system prompt
2. Sends to Llama-3.3 with:
   - Temperature: 0.65 (balanced creativity + consistency)
   - Max tokens: 1024 (comprehensive responses)
   - Top-p: 0.9 (nucleus sampling for diversity)
3. Appends disclaimer if no external sources found

**Example Output:**
```
JARVIS: I'd be delighted to illuminate the topic! Based on the latest 
research [Source 1](https://example.com), XYZ represents a paradigm shift 
in the field. The mechanism works as follows...

[If no research context]
_Disclaimer: No live sources were retrieved; this answer is based on 
internal knowledge._
```

---

## Request/Response Flow

### **POST /api/jarvis/ask**

**Request:**
```json
{
  "query": "What are the latest AI trends in 2026?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "JARVIS synthesized response with citations...",
  "model": "llama-3.3-70b-versatile",
  "needs_search": true,
  "has_research": true,
  "sources": [
    {
      "title": "Article Title",
      "snippet": "...",
      "url": "https://..."
    }
  ],
  "intent": {
    "needs_search": true,
    "confidence": 0.92,
    "queries": ["semantic", "keyword1", "keyword2"]
  },
  "timestamp": "2026-01-28T12:34:56.789123"
}
```

### **POST /api/jarvis/workflow**

Debug endpoint showing all three workflow steps:
```json
{
  "query": "How does quantum computing work?",
  "step_1_intent": {...},
  "step_2_research": "No web search needed",
  "step_2_sources": [],
  "step_3_response": "JARVIS response based on LLM knowledge..."
}
```

---

## Error Handling & Fallbacks

| Scenario | Behavior |
|----------|----------|
| Groq API unavailable | Return 503 error; JARVIS offline |
| Tavily unavailable | Skip search; rely on LLM knowledge |
| No search results | Append disclaimer to response |
| Classification error | Heuristic fallback (keyword matching) |
| Synthesis error | Return generic error + encourage retry |

---

## Configuration Requirements

### Environment Variables
```bash
GROQ_API_KEY=gsk_xxx...              # Required
TAVILY_API_KEY=tvly_xxx...           # Required for grounding
FLASK_PORT=3000                      # Optional (default: 3000)
```

### Python Dependencies
```
Flask==3.0.0
groq==0.15.0
tavily-python==0.7.19
Flask-CORS==4.0.0
requests==2.31.0
python-dotenv==1.0.0
gunicorn==23.0.0                     # For Render deployment
```

---

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Intent Classification | ~0.5s | Llama zero-shot; deterministic |
| Async Research (3 queries) | ~2-3s | Tavily advanced search; parallel |
| Response Synthesis | ~1-2s | Llama generation; context-aware |
| **Total E2E** | **~4-6s** | Production-grade latency |

---

## Advanced Features

### Multi-Query Expansion
- Triad ensures semantic + keyword coverage
- Maximizes Recall from heterogeneous data sources
- Reduces duplication through thread pool

### Asynchronous Execution
- Non-blocking research via `ThreadPoolExecutor`
- Concurrent Tavily API calls
- Graceful timeout/error handling per query

### Citation System
- Markdown links: `[Source N](url)`
- Automatic source enumeration
- Transparent fallback disclaimers

### Persona Consistency
- Iron Man style: witty, sophisticated, precise
- Temperature/top-p tuned for personality + consistency
- Maintains professionalism while engaging

---

## Deployment Notes (Render)

**Render Build Process:**
1. Installs dependencies from `requirements.txt`
2. Builds Gunicorn WSGI server
3. Runs: `gunicorn app:app`
4. Health check: `GET /health` → `{"status": "healthy"}`
5. Prod URL: `https://your-render-app.onrender.com`

**Troubleshooting:**
- Check `GROQ_API_KEY` and `TAVILY_API_KEY` in Render environment
- Verify logs: `Render Dashboard → Logs → Python Backend Service`
- Test locally: `python app.py` (requires `.env` in `backend/` folder)

---

## Testing

### Local Test
```bash
cd python-backend
python app.py
# Server runs at http://localhost:3000
```

### Quick Request
```bash
curl -X POST http://localhost:3000/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is 2+2?"}'
```

### Debug Workflow
```bash
curl -X POST http://localhost:3000/api/jarvis/workflow \
  -H "Content-Type: application/json" \
  -d '{"query": "Latest AI trends in 2026"}'
```

---

## Future Enhancements

- **Multi-Turn Memory:** Store conversation history for context
- **Tool Integration:** Add calculator, code executor, file search
- **Fine-Tuned Classification:** Train on domain-specific intent patterns
- **Source Ranking:** ML-based credibility scoring for citations
- **Streaming Responses:** Real-time response chunks via WebSocket
- **Caching:** Redis cache for repeated queries

---

**Version:** 2.0 (Agentic)  
**Updated:** 2026-01-28  
**Status:** Production-Ready ✅
