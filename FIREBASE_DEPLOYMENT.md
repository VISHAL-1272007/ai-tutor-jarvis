# 🚀 JARVIS AI - Firebase Deployment Guide

## 📋 **Quick Deploy to Firebase Hosting**

Since you're already using Firebase for authentication, deploying to Firebase Hosting is the perfect choice!

---

## 🔧 **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
```

---

## 🔐 **Step 2: Login to Firebase**

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

---

## 📦 **Step 3: Initialize Firebase Hosting**

```bash
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
firebase init hosting
```

**Answer the prompts:**
```
? What do you want to use as your public directory? frontend
? Configure as a single-page app (rewrite all urls to /index.html)? No
? Set up automatic builds and deploys with GitHub? No
? File frontend/index.html already exists. Overwrite? No
```

---

## 🚀 **Step 4: Deploy to Firebase**

```bash
firebase deploy --only hosting
```

Your site will be live at: `https://vishai-f6197.web.app` or `https://vishai-f6197.firebaseapp.com`

---

## 🔄 **Step 5: Update Backend CORS**

After deployment, update your backend to allow your Firebase Hosting URL.

**In backend/index.js**, add your Firebase URL to CORS:

```javascript
const allowedOrigins = [
    'https://vishai-f6197.web.app',
    'https://vishai-f6197.firebaseapp.com',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
];
```

Then redeploy your backend to Render.

---

## ✅ **Step 6: Verify Deployment**

1. Open `https://vishai-f6197.web.app` in your browser
2. Test all pages:
   - Main chat: `/index.html`
   - Courses: `/courses.html`
   - Playground: `/playground.html`
   - Dashboard: `/dashboard.html`
   - AI Tools: `/ai-tools.html`
   - Project Generator: `/project-generator.html`

---

## 🔄 **Future Updates**

To update your deployment:

```bash
# Make changes to frontend files
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
firebase deploy --only hosting
```

---

## 🎯 **Custom Domain (Optional)**

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to add your domain
4. Update DNS records as instructed

---

## 📊 **Monitoring**

View your hosting analytics:
```bash
firebase open hosting:site
```

Or go to: https://console.firebase.google.com/project/vishai-f6197/hosting

---

**🎉 Deployment is ready! Run the commands above to deploy.**

