# 🚀 AI Tutor JARVIS - Deployment Guide

## Deployment Options

### Option 1: Azure App Service (Recommended for Production)
**Best for:** Enterprise deployment with OAuth, scalability, and HTTPS

#### Steps:
1. **Install Azure CLI**
   ```powershell
   winget install Microsoft.AzureCLI
   ```

2. **Login to Azure**
   ```powershell
   az login
   ```

3. **Create Resource Group**
   ```powershell
   az group create --name ai-tutor-rg --location eastus
   ```

4. **Create App Service Plan**
   ```powershell
   az appservice plan create --name ai-tutor-plan --resource-group ai-tutor-rg --sku B1 --is-linux
   ```

5. **Create Web App**
   ```powershell
   az webapp create --resource-group ai-tutor-rg --plan ai-tutor-plan --name ai-tutor-jarvis --runtime "NODE|20-lts"
   ```

6. **Configure Environment Variables**
   ```powershell
   az webapp config appsettings set --resource-group ai-tutor-rg --name ai-tutor-jarvis --settings `
     GROQ_API_KEY="your_groq_api_key" `
     GOOGLE_CLIENT_ID="your_google_client_id" `
     GOOGLE_CLIENT_SECRET="your_google_client_secret" `
     SESSION_SECRET="your_session_secret" `
     PORT="8080"
   ```

7. **Update Google OAuth Callback**
   - Go to Google Cloud Console
   - Update callback URL to: `https://vishal-ai-tutor.azurewebsites.net/auth/google/callback`

8. **Deploy using ZIP**
   ```powershell
   cd backend
   npm install --production
   cd ..
   Compress-Archive -Path backend,frontend -DestinationPath deploy.zip
   az webapp deployment source config-zip --resource-group ai-tutor-rg --name ai-tutor-jarvis --src deploy.zip
   ```

9. **Access Your App**
   - URL: `https://ai-tutor-jarvis.azurewebsites.net`

---

### Option 2: Vercel (Easy & Free)
**Best for:** Quick deployment, free tier, automatic HTTPS

#### Steps:
1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login**
   ```powershell
   vercel login
   ```

3. **Create vercel.json** (already included)

4. **Deploy**
   ```powershell
   cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
   vercel --prod
   ```

5. **Set Environment Variables**
   ```powershell
   vercel env add GROQ_API_KEY
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add SESSION_SECRET
   ```

6. **Update Google OAuth**
   - Callback URL: `https://vishal.vercel.app/auth/google/callback`

---

### Option 3: Railway (Simplest)
**Best for:** Full-stack apps, automatic deployments

#### Steps:
1. **Install Railway CLI**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login & Initialize**
   ```powershell
   railway login
   cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor
   railway init
   ```

3. **Add Environment Variables**
   ```powershell
   railway variables set GROQ_API_KEY=your_key
   railway variables set GOOGLE_CLIENT_ID=your_id
   railway variables set GOOGLE_CLIENT_SECRET=your_secret
   railway variables set SESSION_SECRET=random_string
   ```

4. **Deploy**
   ```powershell
   railway up
   ```

5. **Get Domain**
   ```powershell
   railway domain
   ```

---

### Option 4: Render (Free Tier)
**Best for:** Simple deployment with free SSL

#### Steps:
1. Push your code to GitHub
2. Go to https://render.com
3. Create New > Web Service
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node index.js`
   - **Environment Variables:** Add all from `.env`
6. Update Google OAuth callback to your Render URL

---

### Option 5: Local Network (Development)
**Best for:** Testing on local network

```powershell
# Find your local IP
ipconfig

# Start server on all interfaces
$env:HOST="0.0.0.0"
cd backend
node index.js

# Access from other devices
# http://YOUR_LOCAL_IP:5001
```

---

## Pre-Deployment Checklist

### Security
- [ ] Remove debug console.log statements
- [ ] Use strong SESSION_SECRET
- [ ] Verify CORS settings for production domain
- [ ] Enable rate limiting for /ask endpoint
- [ ] Validate all user inputs

### Environment Variables Required
```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=random_long_string_min_32_chars
PORT=5001
NODE_ENV=production
```

### Google OAuth Setup
1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to APIs & Services > Credentials
4. Update **Authorized redirect URIs** to include:
   - Development: `http://localhost:5001/auth/google/callback`
   - Production: `https://vishal.vercel.app/auth/google/callback`

### Performance Optimizations
- [ ] Enable gzip compression
- [ ] Add CDN for static assets
- [ ] Implement caching headers
- [ ] Minify frontend assets
- [ ] Set up monitoring/logging

---

## Quick Deploy Commands

### For Azure (Full Script)
```powershell
# Run from ai-tutor directory
.\deploy-azure.ps1
```

### For Vercel
```powershell
vercel --prod
```

### For Railway
```powershell
railway up
```

---

## Troubleshooting

### OAuth Errors
- Verify callback URL matches exactly (http vs https, trailing slash)
- Check Google Console credentials are correct
- Ensure domain is whitelisted in Google OAuth

### Port Issues
- Production platforms usually require PORT from environment
- Update backend to use `process.env.PORT || 5001`

### Build Failures
- Ensure Node version is 18+ or 20+
- Check all dependencies in package.json
- Verify file paths are relative, not absolute

---

## Cost Estimates

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel | ✅ Generous | Starts $20/mo |
| Railway | ✅ $5 credit | $5-20/mo |
| Render | ✅ Limited | Starts $7/mo |
| Azure | ❌ Trial only | ~$13/mo (B1) |

---

## Support

For deployment issues:
1. Check platform-specific logs
2. Verify all environment variables
3. Test OAuth callback URLs
4. Review CORS configuration

**Recommended:** Start with Vercel or Railway for easiest deployment!
