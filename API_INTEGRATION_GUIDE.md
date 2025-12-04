# API Integration Guide

Complete guide for setting up and using all APIs in the JARVIS AI Learning Platform.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Required APIs](#required-apis)
3. [Setup Instructions](#setup-instructions)
4. [API Usage](#api-usage)
5. [Rate Limits & Costs](#rate-limits--costs)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

JARVIS uses **8 different APIs** to provide comprehensive AI-powered learning features:

### Chat & Conversation (4 APIs)
- **Groq** - Fast chat responses (30 RPM)
- **Gemini** - Intelligent conversations (15 RPM)
- **OpenRouter** - Fallback chat (20 RPM)
- **HuggingFace** - Final fallback (10 RPM)

### New Specialized APIs (5 APIs)
- **Google Gemini** - Lesson generation, quiz creation, explanations
- **Stability AI** - Diagrams & concept images
- **YouTube Data API** - Educational video search
- **Firebase** - User authentication & database
- **Moodle API** - Optional course tracking

---

## 🔑 Required APIs

### 1. Google Gemini API (FREE)
**Purpose:** Lesson generation, quizzes, explanations

**Get API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your key

**Cost:** FREE (60 requests/minute)

**Add to `.env`:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 2. Stability AI API (PAID)
**Purpose:** Generate educational diagrams & concept images

**Get API Key:**
1. Go to [Stability AI Platform](https://platform.stability.ai/)
2. Sign up for an account
3. Go to Account → API Keys
4. Create new API key
5. Copy your key

**Cost:** 
- $10 credit free for new users
- ~$0.04 per image generation
- Pay-as-you-go pricing

**Add to `.env`:**
```env
STABILITY_API_KEY=your_stability_api_key_here
```

---

### 3. YouTube Data API v3 (FREE)
**Purpose:** Search educational videos

**Get API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "YouTube Data API v3":
   - Go to APIs & Services → Library
   - Search "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy your key

**Cost:** FREE (10,000 quota units/day = ~3,000 searches)

**Add to `.env`:**
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

### 4. Firebase (FREE)
**Purpose:** User authentication, database (already configured)

**Status:** ✅ Already integrated

---

### 5. Moodle API (OPTIONAL)
**Purpose:** Course tracking integration

**Status:** ✅ Already created (350+ lines in `moodle-api.js`)

**Setup:** See [MOODLE_SETUP_GUIDE.md](./MOODLE_SETUP_GUIDE.md)

---

## 🛠️ Setup Instructions

### Step 1: Update `.env` File
Create or update `backend/.env`:

```env
# ===== CHAT APIs (Already Configured) =====
GROQ_API_KEY=your_existing_groq_key
GEMINI_API_KEY=your_existing_gemini_key
OPENROUTER_API_KEY=your_existing_openrouter_key
HUGGINGFACE_API_KEY=your_existing_huggingface_key

# ===== NEW SPECIALIZED APIs =====
STABILITY_API_KEY=your_stability_key_here
YOUTUBE_API_KEY=your_youtube_key_here

# ===== VIDEO APIs (Already Configured) =====
PEXELS_API_KEY=your_existing_pexels_key
PIXABAY_API_KEY=your_existing_pixabay_key

# ===== AUTHENTICATION =====
SESSION_SECRET=your_session_secret
```

### Step 2: Install Dependencies (Already Done ✅)
```bash
cd backend
npm install
```

**New packages added:**
- `form-data` - For Stability AI multipart requests
- `googleapis` - For YouTube Data API

### Step 3: Restart Backend
```bash
npm start
```

### Step 4: Test APIs
See "Testing" section below.

---

## 💻 API Usage

### 1. Generate Lesson Content
**Endpoint:** `POST /generate-lesson`

**Request:**
```json
{
  "topic": "Python Variables",
  "difficulty": "Beginner",
  "lessonNumber": 1
}
```

**Response:**
```json
{
  "success": true,
  "lesson": {
    "title": "Lesson 1: Python Variables",
    "content": "# Python Variables\n\n## Introduction\nVariables are...",
    "difficulty": "Beginner",
    "topic": "Python Variables"
  },
  "provider": "Google Gemini"
}
```

**Usage in Frontend:**
```javascript
const response = await fetch(`${BACKEND_URL}/generate-lesson`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    topic: 'Python Variables', 
    difficulty: 'Beginner', 
    lessonNumber: 1 
  })
});
const data = await response.json();
console.log(data.lesson.content);
```

---

### 2. Generate Quiz Questions
**Endpoint:** `POST /generate-quiz`

**Request:**
```json
{
  "topic": "JavaScript Arrays",
  "difficulty": "Intermediate",
  "questionCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "question": "Which method adds an element to the end of an array?",
      "options": ["push()", "pop()", "shift()", "unshift()"],
      "correct": 0,
      "explanation": "push() adds elements to the end of an array."
    }
  ],
  "topic": "JavaScript Arrays",
  "difficulty": "Intermediate",
  "provider": "Google Gemini"
}
```

---

### 3. Generate Diagrams & Images
**Endpoint:** `POST /generate-image`

**Request:**
```json
{
  "prompt": "Machine Learning Pipeline",
  "type": "diagram"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "prompt": "Machine Learning Pipeline",
  "provider": "Stability AI"
}
```

**Types:**
- `diagram` - Technical diagrams with clean backgrounds
- `concept` - Educational illustrations with colors
- `general` - Regular image generation

---

### 4. Search Educational Videos
**Endpoint:** `POST /search-videos`

**Request:**
```json
{
  "query": "Docker tutorial for beginners",
  "maxResults": 5
}
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "videoId": "3c-iBn73dDE",
      "title": "Docker Tutorial for Beginners",
      "description": "Learn Docker in 2 hours...",
      "thumbnail": "https://i.ytimg.com/vi/3c-iBn73dDE/hqdefault.jpg",
      "channelTitle": "TechWorld with Nana",
      "publishedAt": "2021-08-03T14:00:00Z",
      "embedUrl": "https://www.youtube.com/embed/3c-iBn73dDE",
      "watchUrl": "https://www.youtube.com/watch?v=3c-iBn73dDE"
    }
  ],
  "totalResults": 5
}
```

---

### 5. Generate Explanations
**Endpoint:** `POST /explain`

**Request:**
```json
{
  "concept": "Recursion",
  "context": "In computer science"
}
```

**Response:**
```json
{
  "success": true,
  "concept": "Recursion",
  "explanation": "## Simple Definition\nRecursion is when a function calls itself...",
  "provider": "Google Gemini"
}
```

---

## 📊 Rate Limits & Costs

### Free APIs ✅
| API | Limit | Cost |
|-----|-------|------|
| Groq | 30 requests/min | FREE |
| Gemini | 60 requests/min | FREE |
| OpenRouter | 20 requests/min | FREE |
| HuggingFace | 10 requests/min | FREE |
| YouTube Data | 10,000 units/day | FREE |
| Firebase Auth | 50,000 users | FREE |

### Paid APIs 💰
| API | Cost | Free Tier |
|-----|------|-----------|
| Stability AI | $0.04/image | $10 credit |
| Firebase Realtime DB | $5/GB | 1GB free |
| YouTube Premium | N/A | Not needed |

### Total Free Capacity
- **Chat:** 75 requests/minute
- **Videos:** 3,000 searches/day
- **Lessons:** 60 generations/minute
- **Images:** $10 credit (~250 images)

---

## 🧪 Testing APIs

### Test Lesson Generation
```bash
curl -X POST http://localhost:5001/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{"topic":"Python Lists","difficulty":"Beginner","lessonNumber":1}'
```

### Test Quiz Generation
```bash
curl -X POST http://localhost:5001/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{"topic":"HTML Basics","difficulty":"Beginner","questionCount":3}'
```

### Test Image Generation
```bash
curl -X POST http://localhost:5001/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Neural Network Architecture","type":"diagram"}'
```

### Test YouTube Search
```bash
curl -X POST http://localhost:5001/search-videos \
  -H "Content-Type: application/json" \
  -d '{"query":"Python tutorial","maxResults":3}'
```

### Test Explanation
```bash
curl -X POST http://localhost:5001/explain \
  -H "Content-Type: application/json" \
  -d '{"concept":"Binary Search","context":"Algorithm"}'
```

---

## 🔧 Troubleshooting

### Issue: "API key not configured"
**Solution:** Check `.env` file has correct API key variable names.

### Issue: "Failed to generate image"
**Causes:**
1. Invalid Stability AI API key
2. Insufficient credits ($10 starter credit used up)
3. Network timeout

**Solution:** 
- Verify API key at [platform.stability.ai](https://platform.stability.ai/)
- Check credit balance
- Add credits if needed ($10 minimum)

### Issue: "YouTube quota exceeded"
**Cause:** Used 10,000 units in one day (rare)

**Solution:** 
- Wait until next day (quota resets at midnight PT)
- Or request quota increase in Google Cloud Console

### Issue: "Gemini rate limit exceeded"
**Cause:** 60 requests/minute limit reached

**Solution:** 
- Wait 1 minute
- Implement request queuing
- Upgrade to Gemini Pro (paid) for higher limits

### Issue: Backend responds with 503
**Cause:** API key missing or invalid

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify API key format (no quotes, no spaces)
3. Restart backend: `npm start`
4. Check logs for specific error

---

## 📝 Best Practices

### 1. API Key Security
- ✅ Store in `.env` file (never commit to Git)
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in Render dashboard
- ❌ Never hardcode API keys in code

### 2. Error Handling
- Always check API response status
- Provide fallback content when API fails
- Show user-friendly error messages
- Log errors for debugging

### 3. Rate Limiting
- Implement request queuing for high traffic
- Cache responses when possible
- Use fallback APIs when primary fails
- Monitor usage in API dashboards

### 4. Cost Management
- Monitor Stability AI usage (paid)
- Set budget alerts in cloud consoles
- Use placeholders when APIs unavailable
- Implement caching for repeated requests

---

## 🚀 Deployment

### Environment Variables in Render
1. Go to Render Dashboard → Your Backend Service
2. Navigate to "Environment" tab
3. Add each API key:
   ```
   STABILITY_API_KEY = sk-xxxxx
   YOUTUBE_API_KEY = AIzaSyxxxxx
   GEMINI_API_KEY = AIzaSyxxxxx
   ```
4. Save changes
5. Render will auto-redeploy

### Testing After Deployment
```bash
# Test production backend
curl -X POST https://ai-tutor-jarvis.onrender.com/generate-lesson \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test Topic"}'
```

---

## 📚 Additional Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Stability AI Docs](https://platform.stability.ai/docs)
- [YouTube API Docs](https://developers.google.com/youtube/v3)
- [Firebase Docs](https://firebase.google.com/docs)
- [Express.js Rate Limiting](https://www.npmjs.com/package/express-rate-limit)

---

## ✅ Quick Checklist

Before deployment, ensure:
- [ ] All API keys added to `.env`
- [ ] `npm install` completed
- [ ] Backend starts without errors
- [ ] Test each endpoint locally
- [ ] Add API keys to Render dashboard
- [ ] Test production endpoints
- [ ] Monitor API usage in dashboards
- [ ] Set up budget alerts (Stability AI)

---

**Created:** January 2025  
**Last Updated:** January 2025  
**Version:** 1.0  
**Author:** VISHAL (JARVIS AI Learning Platform)
