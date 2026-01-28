# JARVIS Agentic Workflow - Visual Architecture Diagrams

## 1. Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         JARVIS AI SYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ FRONTEND TIER                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Firebase Hosting                                         │    │
│  │ - HTML/CSS/JavaScript UI                                │    │
│  │ - ai-tools.js makes POST /api/jarvis/ask calls         │    │
│  │ - Displays responses + sources                          │    │
│  │ URL: https://vishai-f6197.web.app                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│ GATEWAY TIER                                                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Node.js Express Gateway                                 │    │
│  │ - backend/jarvis-proxy.js                               │    │
│  │ - Routes /api/jarvis/* to Python Flask backend         │    │
│  │ - CORS headers enabled                                  │    │
│  │ URL: Backend API port                                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTP
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│ AGENTIC BACKEND TIER (Render)                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Python Flask Application (app.py - 450 lines)           │    │
│  │                                                          │    │
│  │  POST /api/jarvis/ask                                   │    │
│  │  POST /api/jarvis/workflow (debug)                      │    │
│  │  GET /health                                            │    │
│  │  GET /                                                  │    │
│  │                                                          │    │
│  │  Running via Gunicorn WSGI Server                       │    │
│  │  Port: 3000 (configurable)                              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│         ┌─────────────────────────────────────────┐              │
│         │ 3-LAYER AGENTIC WORKFLOW                │              │
│         ├─────────────────────────────────────────┤              │
│         │                                         │              │
│         │ LAYER 1: CLASSIFY INTENT               │              │
│         │ classify_intent()                       │              │
│         │ - Llama-3.3 zero-shot analysis         │              │
│         │ - Generate query triad                  │              │
│         │ - Returns: needs_search + confidence   │              │
│         │ Time: 0.5s                              │              │
│         │                                         │              │
│         │ LAYER 2: CONDUCT RESEARCH              │              │
│         │ conduct_research()                      │              │
│         │ - ThreadPoolExecutor (3 workers)        │              │
│         │ - Tavily async search                   │              │
│         │ - Aggregate results                     │              │
│         │ - Returns: sources + context            │              │
│         │ Time: 2.0s (parallel)                   │              │
│         │                                         │              │
│         │ LAYER 3: SYNTHESIZE RESPONSE           │              │
│         │ generate_final_response()               │              │
│         │ - Inject research context               │              │
│         │ - Llama synthesis                       │              │
│         │ - Add JARVIS persona                    │              │
│         │ - Generate citations                    │              │
│         │ Time: 1.5s                              │              │
│         │                                         │              │
│         └─────────────────────────────────────────┘              │
│                                                                    │
└────────────────────────────┬────┬──────────────┬──────────────────┘
                             │    │              │
                    ┌────────▼──┐ │         ┌────▼────────┐
                    │   Groq    │ │         │   Tavily    │
                    │   API     │ │         │   Search    │
                    │ (Llama)   │ │         │   API       │
                    └───────────┘ │         └─────────────┘
                                  │
                           ┌──────▼───────┐
                           │   Internal   │
                           │   Knowledge  │
                           │   (Fallback) │
                           └──────────────┘
```

---

## 2. Request/Response Flow Diagram

```
USER QUERY
    │
    ▼
┌─────────────────────────┐
│   POST /api/jarvis/ask  │
│   { "query": "..." }    │
└──────────────┬──────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │   LAYER 1: CLASSIFY INTENT      │
    │   classify_intent()             │
    │                                 │
    │   Llama Zero-Shot Analysis:     │
    │   "Does this need web search?"  │
    │                                 │
    │   Keywords detected?            │
    │   - today, latest, breaking,    │
    │   - current, news, 2026, live   │
    │                                 │
    │   Output:                       │
    │   ├─ needs_search: bool         │
    │   ├─ confidence: 0-1            │
    │   ├─ reason: string             │
    │   └─ queries: [q1, q2, q3]      │
    └────────┬──────────────────────┘
             │
        ┌────▼─────┐
        │ DECISION  │
        │ POINT     │
        └──┬──────┬─┘
      YES  │      │  NO
           │      └──────────────────┐
           │                         │
    ┌──────▼────────────────┐   ┌────▼────────────────────┐
    │  LAYER 2: RESEARCH    │   │ SKIP TO LAYER 3         │
    │  conduct_research()   │   │ (Use internal knowledge) │
    │                       │   └────┬───────────────────┘
    │  Parallel queries:    │        │
    │  ├─ Query 1 (async)   │        │
    │  ├─ Query 2 (async)   │        │
    │  └─ Query 3 (async)   │        │
    │                       │        │
    │  Tavily search (x3):  │        │
    │  ├─ advanced depth    │        │
    │  ├─ max 2 results     │        │
    │  └─ include_answer    │        │
    │                       │        │
    │  Aggregate:           │        │
    │  ├─ Remove dupes      │        │
    │  ├─ Format context    │        │
    │  └─ Extract sources   │        │
    │                       │        │
    │  Output:              │        │
    │  ├─ context: string   │        │
    │  └─ sources: [...]    │        │
    └──────┬────────────────┘        │
           │                         │
           └──────────┬──────────────┘
                      │
        ┌─────────────▼────────────────────┐
        │  LAYER 3: SYNTHESIZE RESPONSE    │
        │  generate_final_response()       │
        │                                  │
        │  System Prompt Injection:        │
        │  [JARVIS Persona]                │
        │  [Research Context]              │
        │                                  │
        │  Llama Inference:                │
        │  ├─ temp: 0.65                   │
        │  ├─ max_tokens: 1024             │
        │  ├─ top_p: 0.9                   │
        │                                  │
        │  Post-Processing:                │
        │  ├─ Add citations                │
        │  ├─ Add disclaimer (if no src)   │
        │  └─ Format response              │
        │                                  │
        │  Output: response string         │
        └──────┬──────────────────────────┘
               │
    ┌──────────▼─────────────────┐
    │  API RESPONSE (JSON)        │
    │                             │
    │  {                          │
    │    "success": true,         │
    │    "response": "...",       │
    │    "needs_search": bool,    │
    │    "has_research": bool,    │
    │    "sources": [...],        │
    │    "intent": {...},         │
    │    "timestamp": "..."       │
    │  }                          │
    └────────────┬────────────────┘
                 │
                 ▼
            FRONTEND DISPLAY
            - Shows response
            - Lists sources
            - Shows intent debug
```

---

## 3. Error Handling Decision Tree

```
REQUEST RECEIVED
    │
    ▼
┌─────────────────────────────────┐
│  Validate Input                 │
│  - Is query empty?              │
│  - Is JSON valid?               │
└────────┬────────────────────────┘
         │
    ┌────▼────┐
    │ VALID?  │
    └┬──────┬─┘
  NO │      │ YES
     │      └────────────────────────┐
     │                               │
  ┌──▼──────────────┐        ┌──────▼───────────────────┐
  │ Return 400      │        │ Check Groq API Key       │
  │ Error Response  │        │ (REQUIRED)               │
  └─────────────────┘        └──┬───────────────────┬───┘
                              YES │                 │ NO
                                 │          ┌──────▼─────┐
                                 │          │ Return 503 │
                                 │          │ (Hard Fail)│
                                 │          └────────────┘
                                 │
                    ┌────────────▼──────────────────┐
                    │ Execute Agentic Workflow      │
                    │ (Layer 1 → 2 → 3)             │
                    └───┬──────────────┬───────────┘
                   OK   │              │ ERROR
                        │              │
        ┌───────────────▼──┐  ┌───────▼────────────┐
        │ Continue to      │  │ Log error          │
        │ next layer       │  │ Return graceful    │
        │                  │  │ fallback response  │
        └────────────────┬─┘  └─────────────────┬─┘
                         │                       │
        ┌────────────────┴───────────────────────┘
        │
        ▼
    ┌─────────────────────────┐
    │ Layer 1 Classification  │
    │ classify_intent()       │
    │                         │
    │ Error? → Heuristic      │
    │ fallback               │
    └─────────────────────────┘
        │
        ├─ needs_search=false?
        │  └─ Skip Layer 2, go to Layer 3
        │
        └─ needs_search=true?
           │
           ▼
    ┌──────────────────────────────┐
    │ Layer 2: Research            │
    │ conduct_research()           │
    │                              │
    │ Check: Tavily available?     │
    └──┬──────────────────────┬────┘
      YES │                   │ NO
         │          ┌────────▼──────────┐
         │          │ Set context=""    │
         │          │ Continue to L3    │
         │          └───────────────────┘
         │
         ▼
    ┌──────────────────────────────┐
    │ Parallel Tavily Searches     │
    │ (3 concurrent)               │
    │                              │
    │ Error/Timeout → Graceful     │
    │ skip, continue with others   │
    │                              │
    │ All fail? → empty context    │
    │ Some succeed? → use those    │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ Layer 3: Synthesize Response │
    │ generate_final_response()    │
    │                              │
    │ Error? → Log, return generic │
    │ fallback message             │
    │                              │
    │ Missing research? → Add      │
    │ disclaimer to response       │
    │                              │
    │ Success? → Return formatted  │
    │ response with sources        │
    └──────────────┬───────────────┘
                   │
                   ▼
            ┌─────────────────┐
            │ HTTP 200 RESPONSE│
            │ Success: true    │
            └─────────────────┘
```

---

## 4. Data Flow Through Layers

```
LAYER 1: CLASSIFICATION
┌────────────────────────────────────────────┐
│ Input: Query string                        │
│                                            │
│ Llama-3.3 Prompt:                         │
│ "Does this need web search?"              │
│                                            │
│ Output Format:                             │
│ {                                          │
│   "needs_search": true|false,             │
│   "confidence": float,                    │
│   "reason": "explanation",                │
│   "queries": ["q1", "q2", "q3"]           │
│ }                                          │
│                                            │
│ ↓ ONLY IF needs_search=true ↓             │
└────────────────────────────────────────────┘
                 │
                 ▼
LAYER 2: RESEARCH
┌────────────────────────────────────────────┐
│ Input: List of 3 queries                   │
│                                            │
│ ThreadPoolExecutor (max_workers=3):       │
│ ├─ Query 1 → Tavily search                │
│ ├─ Query 2 → Tavily search    (Parallel)  │
│ └─ Query 3 → Tavily search                │
│                                            │
│ Tavily Config:                            │
│ - search_depth: "advanced"                │
│ - max_results: 2 per query                │
│ - include_answer: true                    │
│                                            │
│ Result Normalization:                     │
│ {                                          │
│   "title": "Article Title",               │
│   "snippet": "Preview...",                │
│   "url": "https://..."                    │
│ }                                          │
│                                            │
│ Aggregation:                               │
│ - Combine all results                     │
│ - Remove duplicates                       │
│ - Format as context blocks                │
│                                            │
│ Output:                                    │
│ {                                          │
│   "context": "Full text with sources",   │
│   "sources": [                            │
│     {title, snippet, url},               │
│     ...                                   │
│   ]                                       │
│ }                                          │
│                                            │
│ If no results → empty context             │
└────────────────────────────────────────────┘
                 │
                 ▼
LAYER 3: SYNTHESIS
┌────────────────────────────────────────────┐
│ Input: Original query + research context   │
│                                            │
│ System Prompt Construction:               │
│ 1. JARVIS Persona (witty, sophisticated) │
│ 2. Research Context (if available)        │
│ 3. Fallback disclaimer (if no research)   │
│                                            │
│ Llama-3.3 Inference:                      │
│ - Model: llama-3.3-70b-versatile          │
│ - Temperature: 0.65                       │
│ - Max tokens: 1024                        │
│ - Top-p: 0.9                              │
│                                            │
│ Post-Processing:                          │
│ - Extract response text                   │
│ - Add citations [Source N](url)           │
│ - Append disclaimer if needed             │
│                                            │
│ Output: Response string with citations    │
└────────────────────────────────────────────┘
                 │
                 ▼
        RETURN TO API ENDPOINT
        Build JSON response with all metadata
```

---

## 5. Concurrency Model (Layer 2)

```
Timeline (seconds):
0s  1s  2s  3s  4s  5s
│───┼───┼───┼───┼───┼
    [Q1 search................] (2s)
    [Q2 search................] (2s)
    [Q3 search................] (2s)
    └─ All complete @ ~2s (parallel) ✅

WITHOUT Concurrency (sequential):
    [Q1 search................] (2s)
                          [Q2................] (2s)
                                                  [Q3................] (2s)
                                                                         = 6s ❌

Savings: 3s faster (50% reduction)

Implementation:
┌─────────────────────────────┐
│ ThreadPoolExecutor           │
│ max_workers=3                │
│                              │
│ executor.submit() x3:        │
│ ├─ _run_tavily_search(q1)   │
│ ├─ _run_tavily_search(q2)   │
│ └─ _run_tavily_search(q3)   │
│                              │
│ as_completed() loop:         │
│ - Collect results as ready   │
│ - No blocking                │
│ - Error handling per task    │
└─────────────────────────────┘
```

---

## 6. Fallback Chain Visualization

```
                   Request
                     │
         ┌───────────▼───────────┐
         │ Required: Groq API    │
         │ (HARD DEPENDENCY)     │
         └─┬─────────────────────┘
           │
       ┌───▼────┐
       │ EXISTS? │
       └─┬──┬───┘
       NO│  │YES
    ┌────▼──┐          ┌──────────────────────┐
    │ 503   │          │ Continue processing  │
    │ERROR  │          └──────┬───────────────┘
    └───────┘                 │
                     ┌────────▼──────────┐
                     │ Tavily Available  │
                     │ (OPTIONAL)        │
                     └─┬────────────┬────┘
                     YES│            │NO
         ┌───────────────┘            └──────┐
         │                                   │
    ┌────▼──────────────┐           ┌───────▼────────┐
    │ Execute Research  │           │ Empty Research │
    │ (search web)      │           │ (use LLM only) │
    │                   │           └────────┬───────┘
    │ ├─ Results?       │                    │
    │ │ YES → use       │                    │
    │ │                 │                    │
    │ └─ Empty?         │                    │
    │   YES → continue  │                    │
    │   (empty context) │                    │
    └─────┬─────────────┘                    │
         │                                   │
         └──────────────┬────────────────────┘
                        │
              ┌─────────▼──────────┐
              │ Synthesize Response│
              │ (always executes)  │
              │                    │
              │ IF no research:    │
              │ - Append disclaimer│
              │ - Note LLM-only    │
              └─────────┬──────────┘
                        │
            ┌───────────▼────────────┐
            │ GUARANTEED SUCCESS:    │
            │ 200 response delivered │
            └────────────────────────┘
```

---

**Visual Guide Complete** ✅  
Use these diagrams to understand flow, concurrency, and error handling.
