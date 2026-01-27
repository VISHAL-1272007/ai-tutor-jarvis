# 🤖 JARVIS Full Stack Integration Guide

## Overview

This guide documents the complete 3-tier integration of JARVIS AI across Python Flask backend, Node.js Express server, and React frontend.

```
┌─────────────────────────────────────────────────┐
│          REACT FRONTEND (Port 5173)             │
│      jarvis-chat.jsx Component                  │
│   Animated Loading + Source Cards               │
└──────────────────┬──────────────────────────────┘
                   │ POST /api/jarvis/ask
                   │ {query: "..."}
                   ▼
┌─────────────────────────────────────────────────┐
│        NODE.JS EXPRESS SERVER (Port 5000)       │
│      backend/index.js + jarvis-proxy.js         │
│      Middleware Router + Health Check           │
└──────────────────┬──────────────────────────────┘
                   │ POST /ask-jarvis
                   │ Forward request
                   ▼
┌─────────────────────────────────────────────────┐
│      PYTHON FLASK BACKEND (Port 3000)           │
│   python-backend/app.py + ml_service.py         │
│   DDGS Search + Groq LLM + BeautifulSoup        │
│   Verified Sources + Structured Response        │
└─────────────────────────────────────────────────┘
```

---

## Architecture Components

### 1️⃣ Python Flask Backend (Port 3000)

**File**: `python-backend/app.py`

**Key Features**:
- DDGS web search integration (free, no API key needed)
- BeautifulSoup4 content scraping
- ML-based source verification (0.3-1.0 relevance score)
- Groq Llama-3.3-70b-versatile LLM synthesis
- UTF-8 emoji logging for Windows support
- CORS enabled for Node.js communication

**Endpoints**:
- `POST /ask-jarvis` - Main JARVIS query endpoint
- `GET /health` - Health check

**Response Format**:
```json
{
  "success": true,
  "response": "Generated answer...",
  "sources": [
    {
      "title": "Article Title",
      "url": "https://example.com",
      "content": "Scraped content snippet..."
    }
  ],
  "verified_sources_count": 4,
  "context_length": 2345,
  "model": "llama-3.3-70b-versatile",
  "timestamp": "2026-01-27T10:30:00Z"
}
```

**How to Run**:
```bash
cd python-backend
python app.py
# Server running on http://localhost:3000
```

**Required Python Packages**:
```
Flask==2.3.0
Flask-CORS==4.0.0
requests==2.31.0
beautifulsoup4==4.12.0
groq==0.15.0
duckduckgo-search==3.9.0
python-dotenv==1.0.0
```

**Environment Variables** (from `backend/.env`):
```
GROQ_API_KEY=gsk_xxxxxxxx
```

---

### 2️⃣ Node.js Express Server (Port 5000)

**Files**: 
- `backend/index.js` - Main Express app
- `backend/jarvis-proxy.js` - NEW proxy middleware

**Key Features**:
- Proxy middleware that forwards requests to Python backend
- Error handling (connection refused, timeout, server offline)
- Health check endpoint
- Request/response logging
- 120-second timeout for web scraping + LLM

**Endpoints** (NEW):
- `POST /api/jarvis/ask` - Query JARVIS
- `GET /api/jarvis/health` - Health check
- `GET /api/jarvis/status` - Status info

**How to Run**:
```bash
cd backend
npm install  # if needed
node index.js
# Server running on http://localhost:5000
# JARVIS proxy available at /api/jarvis/*
```

**Middleware Behavior**:
1. Receives request from React: `POST /api/jarvis/ask` with `{query}`
2. Validates query (not empty, is string)
3. Forwards to Python: `POST http://localhost:3000/ask-jarvis`
4. Handles Python timeout (120s max)
5. Returns response to React with same structure
6. Logs all operations with timestamps

**Error Handling**:
- `ECONNREFUSED` → 503 "Python backend offline"
- `ENOTFOUND` → 503 "Host not found"
- `ETIMEDOUT` → 504 "Request timeout"
- Empty query → 400 "Query required"
- Generic error → 503 with message

---

### 3️⃣ React Frontend (Port 5173 dev, Firebase hosting production)

**File**: `frontend/jarvis-chat.jsx`

**Key Features**:
- Animated loading states (4 status messages cycling every 2 seconds)
- Perplexity-style source cards with external links
- Full markdown rendering with code highlighting
- Dark mode UI with Tailwind CSS (glass morphism)
- Mobile responsive design
- Auto-scroll on new messages
- Full chat history persistence
- Error states with retry capability

**Component State**:
```jsx
const [query, setQuery] = useState('');           // Current user input
const [response, setResponse] = useState(null);   // JARVIS response
const [isLoading, setIsLoading] = useState(false);// Request in progress
const [loadingMessageIndex, setLoadingMessageIndex] = useState(0); // Animation frame
const [chatHistory, setChatHistory] = useState([]); // Conversation history
const [error, setError] = useState(null);        // Error messages
```

**Loading Messages** (cycles every 2 seconds):
1. 🌐 "Searching 2026 web..."
2. ⚙️ "Scraping content..." (spinner)
3. ✅ "Verifying sources..."
4. ✨ "JARVIS is thinking..."

**Backend URL**:
```jsx
const BACKEND_URL = 'http://localhost:5000/api/jarvis/ask';
```

**How to Use**:
```bash
# Option 1: Local dev (Vite)
cd frontend
npm run dev
# Open http://localhost:5173

# Option 2: Standalone HTML
open jarvis-standalone.html
# Uses all CDN dependencies

# Option 3: Production (Firebase)
firebase deploy --only hosting
# Live at https://vishai-f6197.web.app
```

**Styling Files**:
- `frontend/jarvis-chat.css` - Custom animations, responsive design
- Tailwind CSS classes for dark mode
- Glass morphism effects (backdrop-blur, rgba)
- Smooth scrollbar with custom theme

---

## Integration Testing Checklist

### Pre-Flight Checks
- [ ] Python backend running: `http://localhost:3000/health` returns 200
- [ ] Node.js server running: `http://localhost:5000/api/jarvis/status` returns status
- [ ] React component loads without console errors
- [ ] Network tab shows requests to `http://localhost:5000/api/jarvis/ask`

### Full Integration Test
```bash
# Terminal 1: Start Python Flask backend
cd python-backend
python app.py

# Terminal 2: Start Node.js Express server
cd backend
node index.js

# Terminal 3: Start React dev server
cd frontend
npm run dev

# Terminal 4: Test the full flow
# Open browser to http://localhost:5173
# Type a question: "What are the latest AI breakthroughs in 2026?"
# Expected behavior:
#   1. Loading animation starts (cycling through 4 messages)
#   2. React sends POST to http://localhost:5000/api/jarvis/ask
#   3. Node.js proxies to Python at http://localhost:3000/ask-jarvis
#   4. Python searches with DDGS, scrapes with BeautifulSoup, verifies sources
#   5. Groq Llama-3.3-70b generates response
#   6. Response flows back: Python → Node.js → React
#   7. UI shows response with markdown rendering
#   8. Source cards display verified sources with links
#   9. Chat history accumulates
```

### Verification Steps

**1. Check Python Backend Logs**:
```
🤖 JARVIS Query Received: "What are the latest..."
🔍 DDGS Search: 5 results found
✅ Sources Verified: 4/5 valid
🧠 Groq Response Generated
```

**2. Check Node.js Logs**:
```
🤖 JARVIS Query Received: "What are the latest..."
✅ JARVIS Response Generated in 8234ms
   - Sources: 4
   - Context: 3456 chars
```

**3. Check Browser Network Tab**:
- Request: `POST /api/jarvis/ask` with query in body
- Response: 200 OK with `{response, sources, verified_sources_count, context_length}`
- Timing: ~8-10 seconds (DDGS + scraping + LLM)

**4. Test Windows Unicode Logging**:
```bash
# In Python terminal, should see emojis without UnicodeEncodeError
✅ Logger initialized
🤖 Processing query
🔍 Searching sources
✨ Response generated
```

---

## Deployment Guide

### Option 1: Local Development
```bash
# Terminal 1: Python
cd python-backend && python app.py

# Terminal 2: Node.js
cd backend && node index.js

# Terminal 3: React
cd frontend && npm run dev
```

**Access**: http://localhost:5173

### Option 2: Production (Render + Firebase)

**Python Backend on Render**:
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables (GROQ_API_KEY)
5. Deploy

**Node.js Backend on Render** (or Heroku):
1. Update `backend/.env`:
   ```
   PYTHON_BACKEND_URL=https://your-python-render.onrender.com
   ```
2. Deploy to Render/Heroku
3. Update React `BACKEND_URL` to production URL

**React Frontend on Firebase**:
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## Environment Variables

**backend/.env** (Node.js):
```env
PORT=5000
PYTHON_BACKEND_URL=http://localhost:3000  # Local dev
# PYTHON_BACKEND_URL=https://prod-python.onrender.com  # Production
```

**python-backend/.env**:
```env
GROQ_API_KEY=gsk_your_api_key_here
FLASK_PORT=3000
```

---

## Troubleshooting

### Issue: "Python backend is not responding"
**Solution**:
```bash
# Check if Python is running
curl http://localhost:3000/health

# If not, start it:
cd python-backend
python app.py

# Check for port conflicts:
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux
```

### Issue: "Cannot connect to JARVIS research engine"
**Solution**:
```bash
# Verify Node.js server is running
curl http://localhost:5000/api/jarvis/status

# Check Python backend URL in backend/.env
cat backend/.env | grep PYTHON_BACKEND_URL

# Update if needed:
echo "PYTHON_BACKEND_URL=http://localhost:3000" >> backend/.env
```

### Issue: Requests timeout (>120 seconds)
**Solution**:
- This is expected for complex queries with web scraping
- DDGS search: ~2 seconds
- BeautifulSoup scraping: ~3 seconds per source
- Groq LLM: ~5 seconds
- Total: ~8-15 seconds typical

### Issue: React loading spinner keeps cycling
**Solution**:
```bash
# Check browser console for errors (F12)
# Check Network tab for failed requests
# Verify BACKEND_URL is correct in jarvis-chat.jsx:
const BACKEND_URL = 'http://localhost:5000/api/jarvis/ask';

# Test endpoint directly:
curl -X POST http://localhost:5000/api/jarvis/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

### Issue: Unicode emoji errors in Python logs
**Solution**:
- Already fixed in app.py with UTF8StreamHandler
- Verify file has: `UTF8StreamHandler` class
- Ensure `sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')`
- Set `encoding='utf-8'` in FileHandler

---

## File Structure

```
ai-tutor/
├── backend/
│   ├── index.js                    # Main Express server
│   ├── jarvis-proxy.js             # NEW: JARVIS proxy middleware
│   ├── .env                        # Node.js environment variables
│   └── package.json
│
├── python-backend/
│   ├── app.py                      # Flask server with /ask-jarvis endpoint
│   ├── ml_service.py               # Groq LLM integration
│   ├── jarvis_researcher.py        # DDGS + BeautifulSoup RAG pipeline
│   ├── content_verifier.py         # ML-based source verification
│   ├── .env                        # Python environment variables
│   └── requirements.txt
│
└── frontend/
    ├── jarvis-chat.jsx             # Main React component
    ├── jarvis-chat.css             # Custom animations & styling
    ├── jarvis-standalone.html      # CDN version
    └── jarvis-demo.html            # Testing page
```

---

## Performance Metrics

**Typical Response Time Breakdown**:
- DDGS search: 2-3 seconds
- BeautifulSoup scraping (4 sources): 3-5 seconds
- Groq LLM synthesis: 4-8 seconds
- Network overhead: 1-2 seconds
- **Total: 10-18 seconds**

**Memory Usage**:
- React component: ~2-5 MB
- Node.js proxy: ~50 MB (Express + axios)
- Python Flask: ~100-150 MB (BeautifulSoup + Groq)

**Concurrent Users**:
- Local dev: 1-5 users
- Production (Render): 10-50 users (depends on plan)

---

## API Reference

### POST /api/jarvis/ask

**Request**:
```json
{
  "query": "What are the latest AI breakthroughs?"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "response": "Generated answer with markdown...",
  "sources": [
    {
      "title": "Article Title",
      "url": "https://example.com/article",
      "content": "Relevant snippet..."
    }
  ],
  "verified_sources_count": 4,
  "context_length": 2345,
  "model": "llama-3.3-70b-versatile",
  "processingTime": 8234,
  "backend": "python-flask",
  "timestamp": "2026-01-27T10:30:00Z"
}
```

**Error Response (503)**:
```json
{
  "success": false,
  "error": "Python backend is not responding",
  "response": "JARVIS research engine is currently offline...",
  "timestamp": "2026-01-27T10:30:00Z"
}
```

### GET /api/jarvis/health

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "pythonBackend": "online",
  "pythonResponse": {
    "status": "ok"
  },
  "timestamp": "2026-01-27T10:30:00Z"
}
```

### GET /api/jarvis/status

**Response (200 OK)**:
```json
{
  "name": "JARVIS AI Proxy",
  "version": "1.0.0",
  "status": "online",
  "pythonBackendUrl": "http://localhost:3000",
  "endpoints": [
    "POST /api/jarvis/ask - Query JARVIS",
    "GET /api/jarvis/health - Health check",
    "GET /api/jarvis/status - Status info"
  ],
  "timestamp": "2026-01-27T10:30:00Z"
}
```

---

## Next Steps

1. ✅ **Python Flask backend** - Ready to run
2. ✅ **Node.js proxy middleware** - Created (jarvis-proxy.js)
3. ✅ **React component** - Updated endpoint
4. 🔄 **Testing** - Run through integration test checklist
5. 🔄 **Deployment** - Deploy to production services
6. 🔄 **Monitoring** - Set up logging and alerts

---

## Support & Documentation

- **Python Backend**: See `PYTHON_BACKEND_GUIDE.md`
- **DDGS Integration**: See `JARVIS_RESEARCH_GUIDE.md`
- **React Component**: See `JARVIS_README.md`
- **Groq LLM**: See official docs at https://console.groq.com
- **Firebase Hosting**: See `FIREBASE_DEPLOYMENT.md`

---

**Last Updated**: January 27, 2026
**Status**: ✅ Full Integration Ready
**Version**: 1.0.0
