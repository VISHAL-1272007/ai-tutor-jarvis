# 🚀 DEPLOYMENT GUIDE - AI Tutor JARVIS

## ✅ **STEP 1: Frontend Deployment (Firebase)**

### Your Firebase Project: `vishai-f6197`

Firebase hosting is already configured! Just run:

```bash
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
firebase deploy --only hosting
```

### Your site will be live at:
- **Primary URL:** https://vishai-f6197.web.app
- **Alternative URL:** https://vishai-f6197.firebaseapp.com

---

## ✅ **STEP 2: Backend Deployment (Render)**

### Your Render Service: `ai-tutor-jarvis`

### Manual Deployment via Render Dashboard:

1. **Go to:** https://dashboard.render.com
2. **Select your service:** `ai-tutor-jarvis`
3. **Click:** "Manual Deploy" → "Deploy latest commit"

### OR Deploy via Git Push:

```bash
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
git add .
git commit -m "Deploy fixed frontend and backend"
git push origin main
```

Render will automatically detect and deploy!

---

## ⚙️ **STEP 3: Configure Environment Variables on Render**

Go to your Render dashboard → Service Settings → Environment and add:

### Required Variables:
```env
NODE_ENV=production
PORT=10000
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_random_secret_here
```

### Optional (for full features):
```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
YOUTUBE_API_KEY=your_youtube_api_key
STABILITY_API_KEY=your_stability_ai_key
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_huggingface_key
AIML_API_KEY=your_aiml_api_key
PEXELS_API_KEY=your_pexels_key
PIXABAY_API_KEY=your_pixabay_key
```

---

## ✅ **STEP 4: Verify CORS Configuration**

Your backend already has CORS configured for:
- ✅ https://vishai-f6197.web.app
- ✅ https://vishai-f6197.firebaseapp.com
- ✅ http://localhost:3000
- ✅ http://localhost:5001

**Location:** `backend/index.js` line 223-226

---

## 🧪 **STEP 5: Test Deployment**

### Test Backend:
```bash
curl https://ai-tutor-jarvis.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T..."
}
```

### Test Frontend:
Open: https://vishai-f6197.web.app

---

## 📋 **Quick Deployment Checklist:**

- [x] Frontend cleaned and error-free
- [x] Firebase project configured (`vishai-f6197`)
- [ ] Deploy frontend: `firebase deploy --only hosting`
- [ ] Commit backend changes to Git
- [ ] Push to trigger Render deployment
- [ ] Add environment variables on Render
- [ ] Test backend health endpoint
- [ ] Test frontend Firebase URL
- [ ] Verify API calls work between frontend/backend

---

## 🔥 **Quick Deploy Commands:**

### Deploy Frontend (Firebase):
```bash
firebase deploy --only hosting
```

### Deploy Backend (Render - via Git):
```bash
git add .
git commit -m "Updated backend with fixes"
git push origin main
```

---

## 🎯 **Your Live URLs:**

**Frontend:** https://vishai-f6197.web.app  
**Backend API:** https://ai-tutor-jarvis.onrender.com

---

Ready to deploy! 🚀
