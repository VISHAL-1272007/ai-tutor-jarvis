# 🔑 JARVIS 7.0 - API KEY SETUP GUIDE

## ⚡ Quick Setup (15 minutes total)

Follow these steps to unlock your JARVIS 7.0 with all features:

---

## 1️⃣ **Groq API Key** (Fastest LLM - FREE)

### Step-by-Step:
1. Visit: https://console.groq.com
2. Sign up with Google/Email
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)
6. Save it somewhere safe

### Usage:
```powershell
$env:GROQ_API_KEY = "gsk_your_actual_key_here"
```

**Why:** Fastest language model, 6000 requests/minute free tier

---

## 2️⃣ **Gemini API Key** (Google's Latest - FREE)

### Step-by-Step:
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Get API Key"
3. Create new project if needed
4. Click "Create API Key"
5. Copy the key (starts with `AIza`)
6. Enable: `Generative Language API`

### Usage:
```powershell
$env:GEMINI_API_KEY = "AIza_your_actual_key_here"
```

**Why:** Google's best model, backup when Groq fails

---

## 3️⃣ **HuggingFace API Key** (Fallback - FREE)

### Step-by-Step:
1. Visit: https://huggingface.co/settings/tokens
2. Sign up (free account)
3. Click "New token"
4. Name: `JARVIS_Fallback`
5. Type: Select "Read" access
6. Click "Create token"
7. Copy token (starts with `hf_`)

### Usage:
```powershell
$env:HUGGINGFACE_API_KEY = "hf_your_actual_token_here"
```

**Why:** Ultimate fallback, unlimited (with rate limiting)

---

## 4️⃣ **Tavily API Keys** (Web Search - 3000 searches/month FREE!)

### Step-by-Step (Do this 3 times for 3 keys):

1. Visit: https://tavily.com
2. Sign up (free account - great for AI!)
3. Email: You@example.com
4. Go to Dashboard → API Keys
5. Copy your API key (one key provided)
6. **To get 3 keys:** 
   - Create 3 different accounts, OR
   - Use Tavily's "Additional API Keys" feature
7. Save all 3 keys

### Usage:
```powershell
$env:TAVILY_API_KEY = "tvly_first_key_here"
$env:TAVILY_API_KEY2 = "tvly_second_key_here"
$env:TAVILY_API_KEY3 = "tvly_third_key_here"
```

**Why:** Web search with 3 keys = 3000 searches/month (load balancing!)

---

## 🛠️ Setting Up Environment Variables

### Option A: PowerShell (Local Testing)

```powershell
# Paste these into PowerShell one by one:

$env:GROQ_API_KEY = "gsk_your_key_here"
$env:GEMINI_API_KEY = "AIza_your_key_here"
$env:HUGGINGFACE_API_KEY = "hf_your_token_here"
$env:TAVILY_API_KEY = "tvly_key1_here"
$env:TAVILY_API_KEY2 = "tvly_key2_here"
$env:TAVILY_API_KEY3 = "tvly_key3_here"

# Then start the server:
cd python-backend
python app.py
```

### Option B: .env File (Local)

Create file: `python-backend/.env`

```env
GROQ_API_KEY=gsk_your_key_here
GEMINI_API_KEY=AIza_your_key_here
HUGGINGFACE_API_KEY=hf_your_token_here
TAVILY_API_KEY=tvly_key1_here
TAVILY_API_KEY2=tvly_key2_here
TAVILY_API_KEY3=tvly_key3_here
JARVIS_AUTH_KEY=MySuperSecretKey123
```

Then install python-dotenv:
```bash
pip install python-dotenv
```

### Option C: Render Dashboard (Production)

1. Go to your Render backend service
2. Click "Environment" tab
3. Add each key-value pair:
   - `GROQ_API_KEY` = `gsk_...`
   - `GEMINI_API_KEY` = `AIza_...`
   - `HUGGINGFACE_API_KEY` = `hf_...`
   - `TAVILY_API_KEY` = `tvly_...`
   - `TAVILY_API_KEY2` = `tvly_...`
   - `TAVILY_API_KEY3` = `tvly_...`
4. Click "Save Changes"
5. Render auto-redeploys! (5 minutes)

---

## ✅ Verify Setup

Run this command to check if keys are loaded:

```powershell
# Check which keys are set:
$env:GROQ_API_KEY
$env:GEMINI_API_KEY
$env:HUGGINGFACE_API_KEY
$env:TAVILY_API_KEY
$env:TAVILY_API_KEY2
$env:TAVILY_API_KEY3

# They should return your keys (or blank if not set)
```

---

## 🧪 Test If It Works

Once keys are set, test with:

```powershell
cd python-backend
python app.py

# In another PowerShell window:
$resp = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
$resp.groq_available      # Should show: True
$resp.gemini_available     # Should show: True
$resp.huggingface_available # Should show: True
$resp.tavily_keys          # Should show: 3
```

---

## 🚀 Test Web Research

Ask a current events question:

```powershell
$body = @{
    question = "What are the latest AI developments in February 2026?"
    user_id = "test_user"
} | ConvertTo-Json

$resp = Invoke-RestMethod -Uri "http://localhost:3000/ask" -Method Post `
    -Body $body -ContentType "application/json"

Write-Host "Has Web Research: $($resp.has_web_research)"
Write-Host "Sources Found: $($resp.sources.Count)"
$resp.answer  # Should show web-sourced answer with citations!
```

---

## 💡 Pro Tips

1. **Start with Groq** - It's the fastest
2. **Tavily keys get used randomly** - Load balancing happens automatically
3. **HuggingFace never fails** - Ultimate safety net
4. **Don't share your keys!** - Keep them private
5. **Free tiers are generous** - Plenty for development

---

## 🆘 Troubleshooting

### "Key not recognized"?
**Check:**
- Spelling is exact
- No quotes in PowerShell assignment
- Key actually copied (not just browser text)

### "Still showing fallback"?
**Verify:**
```powershell
Invoke-RestMethod http://localhost:3000/health | Select groq_available
# Should be True, not False
```

### "Can't get 3 Tavily keys"?
**Options:**
1. Create 3 email accounts (1 key each)
2. Contact Tavily support (sometimes they provide more)
3. Use just 1 key (still works, just less quota)

### "Render not updating"?
**Solution:**
1. Keys missing in Render? Add them
2. Click "Save Changes"
3. Wait 5 minutes for auto-deploy
4. Check `/health` to verify

---

## 📊 After Setup, You'll Have:

| Service | Limit | Cost |
|---------|-------|------|
| Groq | 6000 req/min | FREE |
| Gemini | Generous | FREE |
| HuggingFace | Rate-limited | FREE |
| Tavily | 1000/key/month | FREE |
| **Total** | **3000 searches + unlimited LLM** | **FREE** |

---

## 🎊 Success Indicators

Once set up properly:

✅ `/health` shows all `true` values  
✅ Questions get answers (not fallback)  
✅ Web research queries show sources  
✅ Beautiful citations appear  
✅ Fast responses (~2-3 seconds)  
✅ Zero errors in logs  

---

## 🔗 Quick Links

- **Groq**: https://console.groq.com
- **Gemini**: https://makersuite.google.com/app/apikey
- **HuggingFace**: https://huggingface.co/settings/tokens
- **Tavily**: https://tavily.com
- **Render Dashboard**: https://dashboard.render.com

---

## 🎓 What Happens When It Works

```
Your Query: "What's new in AI?"
    ↓
Tavily Search (3 keys rotating)
    ↓
Deep Scrape 4 Sources (5000 chars each = 20,000 chars total!)
    ↓
Groq generates answer (or Gemini or HuggingFace if needed)
    ↓
Beautiful response with source citations:
---
"Sir, I found the following developments...

📚 Sources & References:
[1] **Latest AI News**
    🔗 https://example.com
[2] **Tech Update**
    🔗 https://example.com
---
```

---

**Your JARVIS 7.0 is ready for takeoff!** 🚀

*All keys are FREE. All features are ACTIVE. All power is YOURS.*

Good luck, Sir! ✨
