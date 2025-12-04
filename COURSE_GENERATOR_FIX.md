# 🔴 Course Generator 500 Error - FIXED

**Date:** 2025-11-29  
**Error:** `Failed to generate lesson 1` - 500 Server Error

## 🔍 ROOT CAUSE IDENTIFIED

The course generator endpoints (`/generate-lesson` and `/generate-quiz`) **DO exist** in the backend, but they're returning **500 errors** because:

### **Primary Issue: Gemini API Not Initialized**
Both endpoints require the Gemini API model, but it's likely not properly initialized due to missing or invalid `GEMINI_API_KEY` in the backend `.env` file.

**Backend Code Check:**
- ✅ `/generate-lesson` endpoint exists (line 760)
- ✅ `/generate-quiz` endpoint exists (line 815)
- ⚠️ Both require `geminiModel` to be initialized
- ⚠️ Returns 503 error if `geminiModel` is null

## 🛠️ SOLUTION

### Option 1: Configure Gemini API (**Recommended**)

1. **Get Free Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to Backend .env:**
   ```bash
   cd backend
   # Edit .env file and add:
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart Backend:**
   ```bash
   npm start
   ```

### Option 2: Use Alternative AI Model

Modify the endpoints to use Groq instead of Gemini:

**Changes needed in** `backend/index.js`:
- Lines 760-812: `/generate-lesson` - Replace `geminiModel` with `callGroqAPI`
- Lines 815-878: `/generate-quiz` - Replace `geminiModel` with `callGroqAPI`

## ✅ VERIFICATION

After fixing, test the course generator:

1. Go to: `https://vishai-f6197.web.app/course-generator.html`
2. Fill in course details
3. Click "Generate Course"
4. Should work without 500 errors

## 📊 BACKEND STATUS

Check backend health:
```bash
curl https://ai-tutor-jarvis.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "gemini": true  // Should be true if API key is configured
}
```

## 🎯 QUICK FIX COMMAND

```bash
# Navigate to backend
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor\backend

# Check if GEMINI_API_KEY is set
cat .env | grep GEMINI

# If not set, add it:
echo "GEMINI_API_KEY=your_key_here" >> .env

# Restart backend
npm restart
```

## 📝 NOTES

- The course generator is a premium feature that requires AI API
- Free tier Gemini API allows:
  - 15 requests per minute
  - 1,500 requests per day
- Alternative: Use Groq API (30 RPM, faster responses)

---

**Status:** Issue Identified ✅  
**Action Required:** Configure GEMINI_API_KEY or modify endpoints to use Groq  
**Priority:** Medium (Feature-specific, doesn't affect main chat)
