# 🚀 Python Backend Deployment to Render.com

## Quick Deploy (Automated)

Run this command:
```powershell
.\DEPLOY_PYTHON_TO_RENDER.bat
```

---

## Manual Deployment Steps

### **Step 1: Prepare Repository**

All necessary files are already created:
- ✅ `python-backend/Procfile` - Start command
- ✅ `python-backend/runtime.txt` - Python version
- ✅ `python-backend/render.yaml` - Configuration
- ✅ `python-backend/requirements.txt` - Dependencies
- ✅ `python-backend/app.py` - Flask application

---

### **Step 2: Commit to GitHub**

```powershell
git add python-backend/
git commit -m "Add Python backend deployment config"
git push origin main
```

---

### **Step 3: Deploy on Render**

#### **3.1 Create New Web Service**

1. Go to: https://dashboard.render.com/
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

#### **3.2 Connect Repository**

1. Click **"Connect account"** (if not connected)
2. Authorize Render to access GitHub
3. Find repository: `VISHAL-1272007/ai-tutor-jarvis`
4. Click **"Connect"**

#### **3.3 Configure Service**

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `jarvis-python-ml-service` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `python-backend` |
| **Environment** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |
| **Instance Type** | Free |

#### **3.4 Environment Variables (Optional)**

Add these if needed:
```
FLASK_ENV=production
PORT=10000
```

#### **3.5 Deploy**

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for initial deployment
3. Render will:
   - Clone your repository
   - Install dependencies
   - Start the service
   - Provide a public URL

---

### **Step 4: Get Service URL**

After deployment completes, you'll get a URL like:
```
https://jarvis-python-ml-service.onrender.com
```

**Copy this URL** - you'll need it to connect Node.js backend to Python backend.

---

### **Step 5: Test Deployment**

#### **Test Health Endpoint:**
```powershell
# PowerShell
Invoke-RestMethod -Uri "https://your-service-url.onrender.com/health"

# Or with curl
curl https://your-service-url.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": "running",
  "ml_services": true
}
```

#### **Test Prediction Endpoint:**
```powershell
$body = @{
    features = @(1.5, 2.3, 0.8, 4.1, 3.2)
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-service-url.onrender.com/predict" -Method POST -Body $body -ContentType "application/json"
```

---

### **Step 6: Connect to Node.js Backend**

Update `backend/index.js` with Python service URL:

```javascript
const PYTHON_SERVICE_URL = 'https://jarvis-python-ml-service.onrender.com';

// Add proxy route
app.post('/python-proxy', async (req, res) => {
    try {
        const { endpoint, data } = req.body;
        const response = await fetch(`${PYTHON_SERVICE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## 🔧 Troubleshooting

### **Problem: Build Fails**
**Solution:**
- Check `requirements.txt` is valid
- Remove heavy dependencies (TensorFlow, PyTorch) on free tier
- Check logs in Render dashboard

### **Problem: Service Sleeps (Free Tier)**
**Issue:** Free tier services sleep after 15 minutes of inactivity

**Solutions:**
1. **Wake-up function** (already in Node.js backend):
```javascript
async function wakeUpPythonBackend() {
    try {
        await fetch(`${PYTHON_SERVICE_URL}/health`);
    } catch (error) {
        console.log('Python backend waking up...');
    }
}
```

2. **Use UptimeRobot** (free):
   - Create account: https://uptimerobot.com/
   - Add monitor for your Python URL
   - Pings every 5 minutes to keep service awake

### **Problem: Slow Cold Starts**
**Solution:**
- Free tier cold starts take 30-60 seconds
- Implement retry logic in Node.js
- Consider paid plan ($7/month) for always-on

### **Problem: Memory Limit Exceeded**
**Solution:**
- Free tier: 512MB RAM
- Remove heavy ML libraries
- Use lighter alternatives
- Upgrade to paid plan

---

## 💰 Pricing

### **Free Tier:**
- ✅ 750 hours/month (unlimited if only service)
- ✅ 512MB RAM
- ✅ Shared CPU
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Slower cold starts

### **Starter ($7/month):**
- ✅ Always on (no sleep)
- ✅ 512MB RAM
- ✅ Faster starts
- ✅ Better for production

---

## 📊 Deployment Checklist

Before deploying:
- [ ] All files committed to GitHub
- [ ] `requirements.txt` has all dependencies
- [ ] `Procfile` configured correctly
- [ ] `runtime.txt` specifies Python version
- [ ] App runs locally with `python app.py`
- [ ] No secrets in code (use environment variables)

After deploying:
- [ ] Health endpoint returns 200
- [ ] Test each API endpoint
- [ ] Check logs for errors
- [ ] Update Node.js with Python URL
- [ ] Test full integration
- [ ] Setup UptimeRobot (optional)

---

## 🌐 Service URLs

After deployment, you'll have:

| Service | URL |
|---------|-----|
| **Python Backend** | `https://jarvis-python-ml-service.onrender.com` |
| **Node.js Backend** | `https://ai-tutor-jarvis.onrender.com` |
| **Frontend** | `https://vishai-f6197.web.app` |

---

## 📞 Support

**Render Dashboard:** https://dashboard.render.com/

**Render Docs:** https://render.com/docs

**Common Issues:**
1. Build fails → Check requirements.txt
2. Service crashes → Check logs in dashboard
3. Memory error → Remove heavy dependencies

---

## ✅ Final Test

After everything is deployed, test the full flow:

```powershell
# 1. Test Python directly
Invoke-RestMethod -Uri "https://jarvis-python-ml-service.onrender.com/health"

# 2. Test through Node.js proxy
Invoke-RestMethod -Uri "https://ai-tutor-jarvis.onrender.com/python-proxy" -Method POST -Body (@{endpoint='/health'; data=@{}} | ConvertTo-Json) -ContentType "application/json"

# 3. Test from frontend
# Visit: https://vishai-f6197.web.app
# Use ML features
```

---

**Status:** Ready to deploy!  
**Estimated Time:** 10-15 minutes  
**Cost:** FREE (with limitations)

Good luck with your deployment! 🚀
