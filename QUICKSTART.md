# 🚀 Quick Deploy AI Tutor JARVIS

Choose your deployment platform:

## 🌟 Easiest: Vercel (Recommended)
```bash
npm install -g vercel
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
vercel
```
Then set environment variables in Vercel dashboard.

## 🚂 Simple: Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 🎨 Free: Render
1. Push to GitHub
2. Visit render.com
3. Connect repo
4. Deploy!

## ☁️ Enterprise: Azure
```powershell
.\deploy-azure.ps1
```

## 📝 Environment Variables Needed
- `GROQ_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

## ⚠️ After Deploy
Update Google OAuth callback URL to:
`https://vishal.vercel.app/auth/google/callback`

See DEPLOYMENT.md for detailed instructions!
