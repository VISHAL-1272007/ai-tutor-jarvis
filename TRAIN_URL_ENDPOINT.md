# JARVIS Training Endpoint - Documentation

## Overview

The `/api/train-url` endpoint allows JARVIS to learn and store knowledge from any URL. This endpoint automatically:

1. **Fetches** content from the provided URL using Jina Reader API
2. **Summarizes** the content using Llama 4 Maverick (meta-llama/llama-4-maverick-17b-128e-instruct)
3. **Stores** the structured summary in both:
   - Local knowledge base (JSON files in `/data/knowledge_base`)
   - Pinecone vector database (for semantic search)
4. **Returns** a success message confirming the URL has been learned

## Endpoint Details

### URL
```
POST /api/train-url
```

### Request Body
```json
{
  "url": "https://example.com/article"
}
```

### Request Headers
```
Content-Type: application/json
```

### Success Response (200)
```json
{
  "success": true,
  "message": "URL learned and added to JARVIS memory!",
  "summary": {
    "title": "Article Title",
    "key_points": [
      "Key point 1",
      "Key point 2",
      "Key point 3"
    ],
    "topics": ["topic1", "topic2", "topic3"],
    "source_url": "https://example.com/article",
    "timestamp": "2026-01-26T12:34:56.789Z"
  }
}
```

### Error Responses

**Invalid URL (400)**
```json
{
  "success": false,
  "error": "Invalid URL format"
}
```

**Missing URL (400)**
```json
{
  "success": false,
  "error": "Missing or invalid URL in request body"
}
```

**Empty Content (400)**
```json
{
  "success": false,
  "error": "URL returned empty or insufficient content"
}
```

**Server Error (500)**
```json
{
  "success": false,
  "error": "Failed to fetch URL content: [error details]"
}
```

## Usage Examples

### Using curl
```bash
curl -X POST http://localhost:3000/api/train-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/article"}'
```

### Using JavaScript (Fetch API)
```javascript
const response = await fetch('http://localhost:3000/api/train-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://www.example.com/article'
  })
});

const data = await response.json();
console.log(data.message); // "URL learned and added to JARVIS memory!"
console.log(data.summary);
```

### Using Python (Requests)
```python
import requests

response = requests.post('http://localhost:3000/api/train-url', 
  json={'url': 'https://www.example.com/article'})

data = response.json()
print(data['message'])
print(data['summary'])
```

### Using Node.js (Axios)
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/train-url', {
  url: 'https://www.example.com/article'
});

console.log(response.data.message);
console.log(response.data.summary);
```

## Architecture & Flow

```
User Request (URL)
    ↓
[1] VALIDATE URL
    ├─ Check if URL provided
    ├─ Check if URL is valid format
    └─ Return 400 if invalid
    ↓
[2] FETCH CONTENT (Jina Reader)
    ├─ Make GET request to https://r.jina.ai/{url}
    ├─ Include Bearer token authorization
    ├─ Timeout: 15 seconds
    └─ Return 400 if empty/insufficient content
    ↓
[3] CREATE SUMMARY (Llama 4 Maverick)
    ├─ Model: meta-llama/llama-4-maverick-17b-128e-instruct
    ├─ Temperature: 0.3 (deterministic)
    ├─ Max tokens: 1000
    ├─ Extract: title, summary, key_points, topics
    └─ Parse JSON response
    ↓
[4] STORE KNOWLEDGE
    ├─ Save to local: /data/knowledge_base/{timestamp}.json
    └─ Save to Pinecone: Vector DB for semantic search
    ↓
[5] RETURN SUCCESS (200)
    └─ Message: "URL learned and added to JARVIS memory!"
```

## Storage Locations

### Local Knowledge Base
```
/ai-tutor/data/knowledge_base/
├─ 1706268896789-abc123.json
├─ 1706268912345-def456.json
└─ 1706268928901-ghi789.json
```

Each JSON file contains:
```json
{
  "title": "Article Title",
  "summary": "2-3 sentence summary",
  "key_points": ["point1", "point2", "point3"],
  "topics": ["tag1", "tag2"],
  "source_url": "https://example.com/article",
  "timestamp": "2026-01-26T12:34:56.789Z"
}
```

### Pinecone Vector Database
Summaries are vectorized and stored with metadata:
- **Vector ID**: `knowledge-{timestamp}-{random}`
- **Text**: `"{title}: {summary}"`
- **Metadata**:
  - `title`: Article title
  - `source`: Source URL
  - `topics`: Comma-separated topics
  - `type`: "trained_url"
  - `timestamp`: ISO datetime

## Status Endpoint

Check if the training endpoint is active:

```bash
GET /api/train-url/status
```

Response:
```json
{
  "success": true,
  "status": "Training endpoint is active",
  "models": {
    "verification": "meta-llama/llama-4-maverick-17b-128e-instruct",
    "temperature": 0.3,
    "max_tokens": 1000
  },
  "storage": {
    "local": "/path/to/data/knowledge_base",
    "vector_db": "Pinecone (if configured)"
  }
}
```

## Configuration

Required environment variables:
```env
JINA_READER_BASE_URL=https://r.jina.ai/
JINA_API_KEY=jina_d83260284edf4c30b58ff0f9465fc57cufKCKMW7F3J--A8dYIr2-9a-pC5A
GROQ_API_KEY=<your-groq-api-key>
```

## Performance

- **Typical Response Time**: 5-15 seconds (depends on URL size)
- **Content Limit**: First 8000 characters processed
- **Timeout**: 15 seconds per request
- **Concurrent Requests**: Limited by Groq API rate limits

## Use Cases

1. **Knowledge Training**: Teach JARVIS about your company/domain
2. **Research Archival**: Store important research papers/articles
3. **Custom Knowledge Base**: Build domain-specific RAG system
4. **Content Curation**: Learn from trusted sources
5. **Training Data**: Create structured training data for fine-tuning

## Example Workflow

1. **Learn from multiple URLs**:
```bash
curl -X POST http://localhost:3000/api/train-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://blog.example.com/article-1"}'

curl -X POST http://localhost:3000/api/train-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://docs.example.com/guide"}'

curl -X POST http://localhost:3000/api/train-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://wikipedia.org/wiki/Topic"}'
```

2. **Query with learned knowledge**: Use `/api/oracle/verified` endpoint with trained knowledge

3. **Monitor stored knowledge**: Check `/data/knowledge_base` directory for stored summaries

## Error Handling

The endpoint handles multiple failure scenarios gracefully:

| Scenario | Status Code | Handling |
|----------|-------------|----------|
| Missing URL | 400 | Return validation error |
| Invalid URL format | 400 | Return format error |
| URL unreachable | 500 | Return fetch error |
| Empty content | 400 | Return content error |
| Groq API failure | 500 | Return summarization error |
| Pinecone failure | 200 | Log warning, continue (local saves always work) |

## Integration with RAG Pipeline

After training URLs with `/api/train-url`:

1. **Local Knowledge Base**: Manually search `/data/knowledge_base` for context
2. **Pinecone Integration**: Automatically included in semantic searches via Pinecone vector DB
3. **RAG Augmentation**: Learned summaries are considered in future `/api/oracle/verified` queries

## Monitoring & Logging

The endpoint logs:
```
🧠 [TRAIN-URL] Starting training for: {url}
📥 [TRAIN-URL] Fetching content from {url}...
✅ [TRAIN-URL] Fetched {N} characters of content
🧠 [TRAIN-URL] Creating summary with Llama 4 Maverick...
✅ [TRAIN-URL] Summary created: {title}
💾 [TRAIN-URL] Saving to knowledge base...
✅ [TRAIN-URL] Saved summary to local knowledge base: {filepath}
✅ [TRAIN-URL] Saved summary to Pinecone index
✅ [TRAIN-URL] Training complete!
```

## Security Considerations

1. **No authentication required** (add if needed for production)
2. **URL validation** prevents malformed URLs
3. **Content timeout** (15s) prevents hanging on large files
4. **Content limit** (8000 chars) prevents token overflow
5. **Error masking** protects sensitive information

## Future Enhancements

- [ ] Add authentication/API keys for production
- [ ] Implement batch URL training endpoint
- [ ] Add URL deduplication to prevent duplicate training
- [ ] Implement cache for frequently trained domains
- [ ] Add user-specific knowledge bases
- [ ] Implement knowledge graph generation
- [ ] Add feedback loop for trained knowledge quality

---

**Created**: January 26, 2026
**Status**: ✅ Production Ready
**Last Updated**: January 26, 2026
