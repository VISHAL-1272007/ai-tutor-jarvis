# /api/train-url - Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                          │
│  (Browser, Mobile App, CLI Tool, Integration Service)              │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ POST /api/train-url
                         │ { "url": "https://..." }
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (index.js)                      │
│  - Routes incoming request to training-routes.js                   │
│  - Middleware: CORS, JSON parser, rate limiter                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  TRAINING ROUTES (training-routes.js)              │
│                                                                     │
│  router.post('/train-url') {                                       │
│    1. Validate URL format                                          │
│    2. Fetch content from URL                                       │
│    3. Create summary with AI                                       │
│    4. Store in knowledge bases                                     │
│    5. Return success response                                      │
│  }                                                                  │
└──────────┬──────────────┬──────────────┬──────────────┬────────────┘
           │              │              │              │
           │              │              │              │
           ▼              ▼              ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   VALIDATE   │ │  JINA READER │ │ LLAMA 4      │ │   STORAGE    │
    │     URL      │ │     API      │ │  MAVERICK    │ │  SYSTEMS     │
    └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
           │              │              │              │
           │              │              │              │
           ▼              ▼              ▼              ▼
        ✅/❌      Content Fetch   Summary JSON    Dual Save
        Valid    Clean Markdown   Structured      (Local+Vector)
        Format   (Bearer Auth)    (JSON Format)


┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │  JINA READER API     │  │   GROQ SDK - Llama   │                │
│  │                      │  │                      │                │
│  │ https://r.jina.ai/   │  │ meta-llama/llama-4   │                │
│  │ - Extracts content   │  │ -maverick-17b        │                │
│  │ - Converts to MD     │  │ -128e-instruct       │                │
│  │ - Bearer auth        │  │ - Temperature: 0.3   │                │
│  │ - 15s timeout        │  │ - Deterministic      │                │
│  └──────────────────────┘  └──────────────────────┘                │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │   LOCAL STORAGE      │  │  PINECONE DB         │                │
│  │                      │  │                      │                │
│  │ /data/knowledge_base/│  │ - Vector embeddings  │                │
│  │ - JSON files         │  │ - Semantic search    │                │
│  │ - Timestamped names  │  │ - Metadata indexing  │                │
│  │ - Immediate access   │  │ - RAG integration    │                │
│  └──────────────────────┘  └──────────────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
           │                 │                 │
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Success   │    │  Knowledge  │    │  Knowledge  │
    │  Response   │    │   Base      │    │   Vector DB │
    │  200 OK     │    │   (Local)   │    │  (Pinecone) │
    └─────────────┘    └─────────────┘    └─────────────┘
         │
         │ { success: true, message: "URL learned...", summary: {...} }
         ▼
    ┌──────────────────────────────────────┐
    │      CLIENT RECEIVES RESPONSE         │
    │  - Confirmation of successful train  │
    │  - Summary with key_points           │
    │  - Topics and source_url             │
    └──────────────────────────────────────┘
```

## Detailed Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REQUEST PROCESSING FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

[1] CLIENT SENDS REQUEST
    Request:  POST /api/train-url
    Body:     { "url": "https://example.com/article" }
    Headers:  Content-Type: application/json
    
    ▼
    
[2] VALIDATION STAGE
    ├─ Check if url field exists
    ├─ Check if url is string
    ├─ Validate URL format with URL() constructor
    └─ Return 400 if any validation fails
    
    ▼
    
[3] CONTENT FETCHING (Jina Reader)
    GET https://r.jina.ai/https://example.com/article
    Headers:
      ├─ User-Agent: Mozilla/5.0...
      └─ Authorization: Bearer {JINA_API_KEY}
    
    Response: Clean markdown content (8000 chars max)
    Timeout: 15 seconds
    
    ▼
    
[4] CONTENT VALIDATION
    ├─ Check if response is valid string
    ├─ Check if content > 100 characters
    └─ Return 400 if insufficient content
    
    ▼
    
[5] SUMMARIZATION (Llama 4 Maverick)
    Model: meta-llama/llama-4-maverick-17b-128e-instruct
    Temperature: 0.3 (deterministic)
    Max Tokens: 1000
    
    System Prompt:
      "You are a knowledge extraction expert. Extract and structure
       key information from content. Always respond with valid JSON."
    
    User Prompt:
      "Create a structured summary in JSON format with:
       - title: main topic
       - summary: 2-3 sentence summary
       - key_points: 3-5 key points
       - topics: relevant tags
       - source_url: URL
       - timestamp: current date"
    
    Response: JSON object with all fields
    
    ▼
    
[6] JSON PARSING
    ├─ Try parsing Groq response as JSON
    ├─ Extract JSON from response if wrapped in text
    └─ Create fallback structure if parsing fails
    
    Structured Object:
    {
      title: string,
      summary: string,
      key_points: string[],
      topics: string[],
      source_url: string,
      timestamp: ISO datetime
    }
    
    ▼
    
[7] STORAGE STAGE - PART A: LOCAL FILE SYSTEM
    ├─ Ensure /data/knowledge_base/ directory exists
    ├─ Generate filename: {timestamp}-{random}.json
    ├─ Write JSON to file with pretty formatting
    └─ Log success message
    
    File location: /data/knowledge_base/1706268896789-abc123.json
    
    ▼
    
[8] STORAGE STAGE - PART B: PINECONE VECTOR DB
    ├─ Create vector record with:
    │  ├─ ID: knowledge-{timestamp}-{random}
    │  ├─ Text: "{title}: {summary}"
    │  └─ Metadata:
    │     ├─ title, source, topics, type, timestamp
    ├─ Call pinecone.upsertKnowledge(vectors)
    └─ Log success message
    
    ▼
    
[9] RESPONSE PREPARATION
    Response Status: 200 OK
    Response Body:
    {
      success: true,
      message: "URL learned and added to JARVIS memory!",
      summary: {
        title: "...",
        key_points: [...],
        topics: [...],
        source_url: "...",
        timestamp: "..."
      }
    }
    
    ▼
    
[10] CLIENT RECEIVES SUCCESS RESPONSE
     ├─ Confirmation that URL was processed
     ├─ Structured summary for display/logging
     └─ Ready to train another URL


┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

If validation fails (stage 2):
  ├─ Error: "Missing or invalid URL in request body"
  └─ Status: 400 Bad Request

If URL format invalid (stage 2):
  ├─ Error: "Invalid URL format"
  └─ Status: 400 Bad Request

If fetch fails (stage 3):
  ├─ Error: "Failed to fetch URL content: {reason}"
  └─ Status: 500 Internal Server Error

If content empty (stage 4):
  ├─ Error: "URL returned empty or insufficient content"
  └─ Status: 400 Bad Request

If summarization fails (stage 5):
  ├─ Error: "Failed to create summary: {reason}"
  └─ Status: 500 Internal Server Error

If local save fails (stage 7):
  ├─ Error: "Failed to save summary: {reason}"
  └─ Status: 500 Internal Server Error

If Pinecone fails (stage 8):
  ├─ Warning logged
  ├─ Does NOT fail endpoint (local save succeeded)
  └─ Status: 200 OK (partial success)

All errors include:
  ├─ Console logging with [TRAIN-URL] prefix
  ├─ Error message details
  └─ Timestamp in logs
```

## Data Flow Through Storage Systems

```
┌────────────────────────────────────────────────────────────────┐
│                     KNOWLEDGE OBJECT                           │
│                                                                │
│ {                                                              │
│   title: "Machine Learning",                                 │
│   summary: "ML is a subset of AI...",                         │
│   key_points: ["pattern recognition", "data driven"],         │
│   topics: ["ai", "machine-learning", "data"],                │
│   source_url: "https://en.wikipedia.org/wiki/ML",            │
│   timestamp: "2026-01-26T12:34:56.789Z"                      │
│ }                                                              │
└──────────────┬──────────────────────────┬─────────────────────┘
               │                          │
               │ BRANCH 1:                │ BRANCH 2:
               │ LOCAL STORAGE            │ VECTOR DB
               │                          │
               ▼                          ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │ FILE SYSTEM STORAGE  │  │  PINECONE STORAGE    │
    ├──────────────────────┤  ├──────────────────────┤
    │ Path:                │  │ Vector ID:           │
    │ /data/knowledge_     │  │ knowledge-17062...   │
    │ base/1706268896...   │  │                      │
    │ .json                │  │ Text Embedding:      │
    │                      │  │ "Machine Learning... │
    │ Format: JSON         │  │ (vectorized)         │
    │ (pretty printed)     │  │                      │
    │                      │  │ Metadata:            │
    │ Contents:            │  │ {                    │
    │ - Immediate read     │  │   title: "Machine..  │
    │ - Local indexing     │  │   source: "https://  │
    │ - Backup/archive     │  │   topics: "ai,ml,.." │
    │ - Offline access     │  │   type: "trained_url"│
    │ - Manual search      │  │   timestamp: "..."   │
    │                      │  │ }                    │
    │ Timestamp: Now       │  │                      │
    │ Accessible: File API │  │ Accessible: Vector   │
    │                      │  │ semantic search      │
    └──────────────────────┘  └──────────────────────┘
               │                          │
               │                          │
               ▼                          ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │  USAGE PATTERN:      │  │  USAGE PATTERN:      │
    │  Manual Search       │  │  Semantic Search     │
    │  Direct File Read    │  │  RAG Augmentation    │
    │  Periodic Backup     │  │  Similarity Matching │
    │  Custom Indexing     │  │  Knowledge Retrieval │
    │  Offline Support     │  │  Future Queries      │
    └──────────────────────┘  └──────────────────────┘
```

## Concurrent Request Handling

```
Multiple clients can train URLs simultaneously:

Client A                  Client B                  Client C
   │                         │                         │
   ├─ Train URL 1            ├─ Train URL 2            ├─ Train URL 3
   │  ├─ Validate             │  ├─ Validate             │  ├─ Validate
   │  ├─ Fetch (5s)          │  ├─ Fetch (5s)          │  ├─ Fetch (5s)
   │  ├─ Summarize (10s)     │  ├─ Summarize (10s)     │  ├─ Summarize (10s)
   │  ├─ Store                │  ├─ Store                │  ├─ Store
   │  └─ Response (200)       │  └─ Response (200)      │  └─ Response (200)
   │                         │                         │
   └─ [Concurrent]──────────┴─ [Parallel]─────────────┘ [Queued by Groq]

Rate limiting:
- Express: Unlimited concurrent per route
- Groq API: Limited by tier (30 req/min free)
- Pinecone: High throughput support
- Bottleneck: Groq API rate limit

When Groq limit hit:
- Queue requests naturally
- Response delay increases
- No requests dropped
- Client continues after Groq availability
```

## Performance Timeline

```
Typical Request Timeline: ~10-15 seconds

T+0.0s   │ Request received
T+0.1s   │ URL validation complete
T+0.2s   │ Jina Reader request sent
T+5.2s   │ Content retrieved (varies by URL size)
T+5.3s   │ Content validation passed
T+5.4s   │ Groq API request sent (Llama 4 Maverick)
T+12.4s  │ Summary received from Groq
T+12.5s  │ JSON parsing complete
T+12.6s  │ Local file written
T+12.7s  │ Pinecone upsert sent
T+12.8s  │ Response prepared
T+12.9s  │ Response sent to client

Total: ~12.9 seconds
Breakdown:
  - Jina fetch: 5s (varies with URL)
  - Groq summarization: 7s (varies with content)
  - Storage & response: 0.9s (consistent)
```

---

**Architecture Designed**: January 26, 2026
**Implementation Status**: ✅ Complete
**Ready for Deployment**: Yes
