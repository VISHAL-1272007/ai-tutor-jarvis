# /api/train-url - Quick Reference

## Endpoint
```
POST /api/train-url
GET /api/train-url/status
```

## Quick Test
```bash
# Train JARVIS from a URL
curl -X POST http://localhost:3000/api/train-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Machine_learning"}'

# Response:
# {
#   "success": true,
#   "message": "URL learned and added to JARVIS memory!",
#   "summary": {
#     "title": "Machine Learning",
#     "key_points": [...],
#     "topics": [...],
#     "source_url": "...",
#     "timestamp": "..."
#   }
# }
```

## What It Does
1. ✅ Takes a URL
2. ✅ Fetches content via Jina Reader (with Bearer auth)
3. ✅ Summarizes using Llama 4 Maverick (temp=0.3)
4. ✅ Saves to `/data/knowledge_base/` (local JSON)
5. ✅ Saves to Pinecone (vector DB)
6. ✅ Returns: "URL learned and added to JARVIS memory!"

## Response Format
```json
{
  "success": true,
  "message": "URL learned and added to JARVIS memory!",
  "summary": {
    "title": "Article Title",
    "key_points": ["point1", "point2", "point3"],
    "topics": ["topic1", "topic2"],
    "source_url": "https://example.com/article",
    "timestamp": "2026-01-26T12:34:56.789Z"
  }
}
```

## Files
- **Endpoint code**: `backend/training-routes.js`
- **Test script**: `backend/test-train-url.js`
- **Documentation**: `TRAIN_URL_ENDPOINT.md`
- **Knowledge base**: `data/knowledge_base/`

## Key Features
- 🚀 Fast: 5-15 seconds per URL
- 🧠 Smart: Uses Llama 4 Maverick
- 💾 Durable: Stores locally + in Pinecone
- 🔒 Secure: URL validation, timeout protection
- 📊 Monitored: Detailed logging
- 🛡️ Robust: Comprehensive error handling

## Status
✅ READY TO USE - Just deploy!
