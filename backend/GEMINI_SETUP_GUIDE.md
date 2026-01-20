# 🤖 JARVIS AI Backend - Gemini 1.5 Flash Setup Guide

## Overview
This is a production-ready Node.js + Express backend for JARVIS AI using Google's Gemini 1.5 Flash model with integrated Google Search Retrieval.

## Features ✨
- ✅ **Gemini 1.5 Flash** - Fast, efficient AI model
- ✅ **Google Search Retrieval** - Real-time internet access
- ✅ **Chat History Management** - Multi-user session support
- ✅ **Tanglish Mentoring** - Tamil + English communication
- ✅ **Robust Error Handling** - Production-grade reliability
- ✅ **CORS Enabled** - Works with frontend
- ✅ **Health Checks** - Monitoring ready
- ✅ **Session Cleanup** - Automatic memory management

## Installation

### 1. Prerequisites
- Node.js 16+ installed
- npm or yarn
- Google Gemini API Key

### 2. Get Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy the key

### 3. Setup Backend
```bash
cd backend
npm install
```

### 4. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
```
GEMINI_API_KEY=your_key_here
PORT=3000
```

### 5. Start Server
```bash
# Development
npm start

# Or with nodemon for auto-reload
npx nodemon server-gemini.js
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║        🤖 JARVIS AI BACKEND - GEMINI 1.5 FLASH 🤖        ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server running on port 3000
```

## API Routes

### 1. POST /chat
**Send message to Jarvis AI**

Request:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "message": "How to start learning DSA?"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Anna/Akka, DSA learning start pannum before...",
    "sessionId": "user123",
    "messageCount": 5,
    "timestamp": "2026-01-20T10:30:00Z"
  },
  "processingTime": "2345ms"
}
```

### 2. GET /health
**Check server status**

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T10:30:00Z",
  "uptime": 3600,
  "sessions": 5
}
```

### 3. GET /history/:userId
**Get chat history for a user**

```bash
curl http://localhost:3000/history/user123
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "messageCount": 10,
    "createdAt": "2026-01-20T10:00:00Z",
    "lastActivity": "2026-01-20T10:30:00Z",
    "history": [
      {
        "role": "user",
        "content": "How to learn DSA?",
        "timestamp": "2026-01-20T10:05:00Z"
      },
      {
        "role": "model",
        "content": "First, understand Arrays...",
        "timestamp": "2026-01-20T10:05:05Z"
      }
    ]
  }
}
```

### 4. POST /clear-session/:userId
**Clear a user's session**

```bash
curl -X POST http://localhost:3000/clear-session/user123
```

### 5. GET /admin/sessions
**View all active sessions**

```bash
curl http://localhost:3000/admin/sessions
```

Response:
```json
{
  "success": true,
  "data": {
    "totalSessions": 5,
    "sessions": [
      {
        "userId": "user123",
        "messageCount": 10,
        "createdAt": "2026-01-20T10:00:00Z",
        "lastActivity": "2026-01-20T10:30:00Z",
        "historyLength": 20
      }
    ]
  }
}
```

## Frontend Integration

### Using with Frontend

Update your frontend code to use this backend:

```javascript
// frontend/config.js or api-client.js
const BACKEND_URL = 'http://localhost:3000'; // Development
// const BACKEND_URL = 'https://api.example.com'; // Production

async function sendMessageToJarvis(userId, message) {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.message;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## System Instruction

The system instruction is embedded in the server and tells Jarvis to:
- Act as an empathetic Tanglish mentor
- Focus on May 2027 AI Engineer goal
- Guide toward 180+ DSA problems
- Explain logic before syntax
- Use Google Search for current facts

You can modify this in `server-gemini.js`:

```javascript
const SYSTEM_INSTRUCTION = `You are Jarvis, an empathetic Tanglish mentor...`;
```

## Features Explained

### Google Search Retrieval
Enabled via:
```javascript
tools: [{ googleSearchRetrieval: {} }]
```

This allows Jarvis to search the internet for:
- Latest AI/ML news
- Current programming trends
- DSA problem solutions
- Educational resources

### Chat History
Each user's chat history is stored in memory:
```javascript
const chatSessions = new Map(); // userId -> session object
```

History includes:
- Last 50 messages (to prevent memory bloat)
- Timestamps
- Role (user/model)
- Message content

### Session Management
- Automatic cleanup of sessions older than 24 hours
- Real-time session updates
- Multi-user support
- No database required (in-memory)

## Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server-gemini.js --name "jarvis-backend"
pm2 save
pm2 startup
```

### Using Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server-gemini.js"]
```

Build and run:
```bash
docker build -t jarvis-backend .
docker run -e GEMINI_API_KEY=your_key -p 3000:3000 jarvis-backend
```

### Using Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables (GEMINI_API_KEY)
4. Deploy

### Using Railway
1. Connect GitHub repo
2. Add GEMINI_API_KEY in Variables
3. Set PORT to 3000
4. Deploy

## Error Handling

The server handles:
- ✅ Invalid API keys
- ✅ Network errors
- ✅ Timeout errors
- ✅ Rate limiting
- ✅ Invalid requests
- ✅ Missing parameters
- ✅ Malformed JSON

All errors return appropriate HTTP status codes and error messages.

## Environment Variables

```
GEMINI_API_KEY    - Required: Google Gemini API Key
PORT              - Optional: Server port (default: 3000)
NODE_ENV          - Optional: Environment (development/production)
CORS_ORIGINS      - Optional: Allowed origins
```

## Testing

### Test with cURL
```bash
# Test chat
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test1","message":"Hello Jarvis!"}'

# Test health
curl http://localhost:3000/health

# Test history
curl http://localhost:3000/history/test1

# Test sessions
curl http://localhost:3000/admin/sessions
```

### Test with Postman
1. Import routes into Postman
2. Set base URL: http://localhost:3000
3. Create requests for each endpoint
4. Test with different payloads

## Troubleshooting

### Error: "GEMINI_API_KEY not found"
- Solution: Create .env file with GEMINI_API_KEY

### Error: "Cannot read property 'sendMessage'"
- Solution: Ensure @google/generative-ai is installed
- Run: `npm install @google/generativeai@latest`

### Error: "CORS policy blocked"
- Solution: Update CORS_ORIGINS in code or .env
- Add your frontend URL to cors array

### Error: "429 Too Many Requests"
- Solution: Implement rate limiting
- Add: npm install express-rate-limit
- Then use middleware in server-gemini.js

### Timeout errors
- Solution: Increase timeout in fetch calls
- Current: 30 seconds via AbortSignal

## Performance Tips

1. **Cache Responses** - Store frequent answers
2. **Batch Requests** - Send multiple messages together
3. **Compress Responses** - Enable gzip compression
4. **Monitor Sessions** - Clean old sessions regularly
5. **Use Redis** - For scalable session storage

## Next Steps

1. ✅ Test locally with cURL
2. ✅ Integrate with frontend
3. ✅ Deploy to production
4. ✅ Monitor usage
5. ✅ Add database persistence (optional)
6. ✅ Implement rate limiting
7. ✅ Add authentication

## Support

- Google Generative AI Docs: https://ai.google.dev/docs
- Express.js: https://expressjs.com
- CORS: https://enable-cors.org

## Version History

- **v1.0.0** (Jan 20, 2026) - Initial release with Gemini 1.5 Flash support

---

**🎯 Ready to power JARVIS with Gemini? Let's go! 🚀**
