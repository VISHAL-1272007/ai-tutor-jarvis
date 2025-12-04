# 🚀 JARVIS AI - Complete Deployment Guide

## 📋 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment)
3. [Frontend Deployment (Vercel/Netlify)](#frontend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Steps](#post-deployment-steps)

---

## 🔧 **Prerequisites**

### Required Accounts:
- ✅ **GitHub Account** (for code hosting)
- ✅ **Render Account** (for backend) - https://render.com
- ✅ **Vercel/Netlify Account** (for frontend) - https://vercel.com or https://netlify.com
- ✅ **Firebase Account** (already set up)

### Required Tools:
```bash
- Git (for version control)
- Node.js 18+ (for backend)
- Python 3.8+ (optional, for local testing)
```

---

## 📦 **Step 1: Prepare for Deployment**

### 1.1 Initialize Git Repository (if not already done)
```bash
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
git init
git add .
git commit -m "Initial commit - JARVIS AI with all fixes"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `jarvis-ai-tutor`
3. Don't initialize with README (we already have files)
4. Copy the repository URL

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai-tutor.git
git branch -M main
git push -u origin main
```

---

## 🖥️ **Step 2: Backend Deployment (Render)**

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

```yaml
Name: jarvis-ai-backend
Region: Singapore (or closest to you)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 2.3 Add Environment Variables
In Render dashboard, add these environment variables:

```env
# API Keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
GITHUB_TOKEN=your_github_token_here
AIML_API_KEY=your_aiml_api_key_here

# Server Configuration
PORT=5001
NODE_ENV=production

# CORS Configuration (IMPORTANT!)
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:8000
```

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://jarvis-ai-backend.onrender.com`

---

## 🌐 **Step 3: Frontend Deployment**

### Option A: Deploy to Vercel (Recommended)

#### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 3.2 Deploy Frontend
```bash
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor\frontend
vercel
```

Follow the prompts:
```
? Set up and deploy? Yes
? Which scope? Your account
? Link to existing project? No
? What's your project's name? jarvis-ai-frontend
? In which directory is your code located? ./
? Want to override settings? No
```

#### 3.3 Configure Environment Variables
```bash
vercel env add VITE_BACKEND_URL
# Enter: https://jarvis-ai-backend.onrender.com

vercel env add VITE_FIREBASE_API_KEY
# Enter your Firebase API key
```

#### 3.4 Deploy to Production
```bash
vercel --prod
```

Your frontend will be live at: `https://jarvis-ai-frontend.vercel.app`

---

### Option B: Deploy to Netlify

#### 3.1 Create netlify.toml
Create this file in the frontend directory:

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3.2 Deploy via Netlify Dashboard
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub
4. Select your repository
5. Configure:
   - Base directory: `frontend`
   - Build command: (leave empty)
   - Publish directory: `.`

#### 3.3 Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:
```
VITE_BACKEND_URL=https://jarvis-ai-backend.onrender.com
```

#### 3.4 Deploy
Click **"Deploy site"**

Your site will be live at: `https://jarvis-ai-frontend.netlify.app`

---

## 🔐 **Step 4: Update Backend CORS**

### 4.1 Update backend/index.js
Add your frontend URL to CORS configuration:

```javascript
const cors = require('cors');

const allowedOrigins = [
    'https://jarvis-ai-frontend.vercel.app',  // Your Vercel URL
    'https://jarvis-ai-frontend.netlify.app', // Your Netlify URL
    'http://localhost:8000',                   // Local development
    'http://127.0.0.1:8000'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

### 4.2 Commit and Push
```bash
git add backend/index.js
git commit -m "Update CORS for production"
git push origin main
```

Render will automatically redeploy.

---

## 🔄 **Step 5: Update Frontend API URLs**

### 5.1 Update API_URL in frontend files

Update these files to use environment variable or production URL:

**frontend/script.js:**
```javascript
const API_URL = process.env.VITE_BACKEND_URL || 'https://jarvis-ai-backend.onrender.com/ask';
const BACKEND_BASE_URL = process.env.VITE_BACKEND_URL || 'https://jarvis-ai-backend.onrender.com';
```

**frontend/playground.js:**
```javascript
const API_URL = process.env.VITE_BACKEND_URL || 'https://jarvis-ai-backend.onrender.com';
```

### 5.2 Commit and Redeploy
```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

Then redeploy frontend:
```bash
vercel --prod
# or trigger redeploy in Netlify dashboard
```

---

## ✅ **Step 6: Post-Deployment Verification**

### 6.1 Test Backend
```bash
curl https://jarvis-ai-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T00:00:00.000Z"
}
```

### 6.2 Test Frontend
1. Open your frontend URL in browser
2. Open Developer Console (F12)
3. Check for errors
4. Try sending a message to JARVIS
5. Verify Firebase authentication works

### 6.3 Test All Pages
```
✅ https://your-domain.vercel.app/index.html
✅ https://your-domain.vercel.app/courses.html
✅ https://your-domain.vercel.app/playground.html
✅ https://your-domain.vercel.app/dashboard.html
✅ https://your-domain.vercel.app/ai-tools.html
✅ https://your-domain.vercel.app/project-generator.html
```

---

## 🔒 **Step 7: Security & Optimization**

### 7.1 Add Security Headers (Vercel)
Create `vercel.json` in frontend:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 7.2 Enable HTTPS
Both Vercel and Render provide free SSL certificates automatically.

### 7.3 Set Up Custom Domain (Optional)
1. Buy a domain (e.g., jarvis-ai.com)
2. In Vercel/Netlify: Add custom domain
3. Update DNS records as instructed
4. Update CORS in backend with new domain

---

## 📊 **Step 8: Monitoring & Maintenance**

### 8.1 Set Up Monitoring
- **Render:** Built-in metrics and logs
- **Vercel:** Analytics dashboard
- **Firebase:** Usage monitoring

### 8.2 Enable Logging
Backend logs are available in Render dashboard:
- Go to your service
- Click "Logs" tab
- Monitor real-time requests

### 8.3 Set Up Alerts
In Render:
- Settings → Notifications
- Add email for deployment failures
- Add Slack webhook (optional)

---

## 🚨 **Troubleshooting**

### Backend Issues:
```bash
# Check backend logs
# In Render dashboard → Your service → Logs

# Common issues:
1. Environment variables not set
2. CORS errors
3. API key issues
```

### Frontend Issues:
```bash
# Check browser console
# Common issues:
1. API_URL pointing to wrong backend
2. Firebase configuration missing
3. CORS blocking requests
```

### CORS Errors:
```javascript
// Verify backend CORS includes your frontend URL
// Check browser console for exact error
// Update backend allowedOrigins array
```

---

## 🎉 **Deployment Checklist**

- [ ] GitHub repository created and pushed
- [ ] Backend deployed to Render
- [ ] Environment variables added to Render
- [ ] Frontend deployed to Vercel/Netlify
- [ ] CORS updated with frontend URL
- [ ] API URLs updated in frontend
- [ ] All pages tested and working
- [ ] Firebase authentication working
- [ ] SSL certificates active
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

## 📞 **Support & Resources**

### Documentation:
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com
- **Firebase:** https://firebase.google.com/docs

### Your Deployment URLs:
```
Backend:  https://jarvis-ai-backend.onrender.com
Frontend: https://jarvis-ai-frontend.vercel.app
          (or https://jarvis-ai-frontend.netlify.app)
```

---

## 🔄 **Future Updates**

To update your deployment:

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Render will auto-deploy backend
# Vercel/Netlify will auto-deploy frontend
```

---

**🎯 Deployment Status:** Ready to deploy!
**⏱️ Estimated Time:** 30-45 minutes
**💰 Cost:** $0 (using free tiers)

---

*Last Updated: 2025-11-29*
*Created by: Antigravity AI Assistant*
