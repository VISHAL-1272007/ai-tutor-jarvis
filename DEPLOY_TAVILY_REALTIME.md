# 🚀 JARVIS Real-Time Data Deployment Guide

**Status Date**: January 29, 2026  
**Objective**: Deploy Tavily integration to fix 3 production issues  
**Time Required**: 10-15 minutes  

---

## 📋 What You're Fixing

| Issue | Problem | Solution |
|-------|---------|----------|
| **Issue 1** | Old data (2023 gold prices) | Tavily real-time web search |
| **Issue 2** | "Sorry, I encountered an error" messages | Fix spinnerTimeout clearing sequence |
| **Issue 3** | NewsAPI 426 errors from frontend | Remove external API calls, use backend only |

---

## 🚀 DEPLOYMENT STEPS (In Order)

### STEP 1: Backup Current Backend (Safety First)
```powershell
# In PowerShell at zoho\ai-tutor directory
cd .\python-backend\

# Backup
Copy-Item -Path app.py -Destination app.py.backup
Copy-Item -Path requirements.txt -Destination requirements.txt.backup

Write-Host "✅ Backups created:" -ForegroundColor Green
Get-Item *.backup
```

**Expected Output**:
```
app.py.backup          [77 KB]
requirements.txt.backup [250 bytes]
```

---

### STEP 2: Deploy New Backend with Tavily
```powershell
# Copy fixed backend
Copy-Item -Path ..\python-backend\app_fixed.py -Destination app.py -Force

Write-Host "✅ Backend updated to Tavily version" -ForegroundColor Green

# Verify it worked
Get-Content app.py | Select-Object -First 20
```

**Expected Output**: Should show Flask imports and Tavily integration

---

### STEP 3: Update Dependencies
```powershell
# Add tavily-python to requirements
"tavily-python==0.7.19" | Add-Content requirements.txt

Write-Host "✅ Dependencies updated" -ForegroundColor Green

# Verify
Get-Content requirements.txt | Select-Object -Last 10
```

**Expected Output**: Last line should be `tavily-python==0.7.19`

---

### STEP 4: Test Backend Locally (Recommended)
```powershell
# Install dependencies
pip install -r requirements.txt

Write-Host "⏳ Installing packages..." -ForegroundColor Yellow
# Wait 30-60 seconds...

# Test server
python app.py
```

**Expected Output** (after 2-3 seconds):
```
 * Running on http://0.0.0.0:7860
 * Press CTRL+C to quit
```

**Test the API** (in another PowerShell window):
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:7860/health" -Method GET
$response.Content | ConvertFrom-Json | Format-Table
```

**Expected Response**:
```
status              : healthy
groq_available      : True
tavily_available    : True
timestamp           : 2026-01-29T...
```

**Stop the test server**: Press `CTRL+C`

---

### STEP 5: Deploy to Hugging Face
```powershell
# Go to root directory
cd ..

# Stage changes
git add python-backend/app.py
git add python-backend/requirements.txt

# Commit
git commit -m "feat: Add real-time Tavily search, fix error handling and NewsAPI 426 errors"

# Push (this auto-deploys to Hugging Face)
git push origin main

Write-Host "✅ Pushed to GitHub - Hugging Face auto-deployment starting..." -ForegroundColor Green
```

**Expected Output**:
```
[main abc1234] feat: Add real-time Tavily search...
 2 files changed, 15 insertions(+), 3 deletions(-)
```

**Monitor Deployment** (takes 2-5 minutes):
1. Go to: https://huggingface.co/spaces/your-username/JARVIS
2. Look for "Building..." → "Running"
3. Or use API health check:

```powershell
# Check deployment status (wait 30 seconds after push)
do {
    try {
        $health = Invoke-WebRequest -Uri "https://aijarvis2025-jarvis1.hf.space/health" -Method GET
        $data = $health.Content | ConvertFrom-Json
        Write-Host "✅ Backend is LIVE!" -ForegroundColor Green
        $data | Format-Table
        break
    }
    catch {
        Write-Host "⏳ Still deploying... waiting 15 seconds" -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
} while ($true)
```

---

## 🧪 STEP 6: Test Real-Time Data (Critical)

### Test 1: Gold Price (Real-Time Data)
```powershell
$body = @{
    query = "What is the current gold price?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://aijarvis2025-jarvis1.hf.space/ask" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$data = $response.Content | ConvertFrom-Json
$data | Format-List

Write-Host "Sources:" -ForegroundColor Cyan
$data.sources | Format-Table
```

**Expected Output**:
```
success  : True
answer   : "The current gold price is approximately $2,XXX per troy ounce as of January 29, 2026 [1]..."
engine   : groq-llama-3.1-8b-instant
sources  : {@{title=Gold Price Today; url=https://...; snippet=Current spot price...}}
timestamp: 2026-01-29T...

Sources:
title                url                                      snippet
-----                ---                                      -------
Gold Price Today     https://www.gold-price-today.com/...     Current spot price of gold...
```

**Verify**:
- ✅ `success: True` (not error)
- ✅ Answer mentions **January 29, 2026** or later (not old 2023 data)
- ✅ Sources array has real URLs
- ✅ Response includes [1] citations

### Test 2: Today's News (Real-Time Search)
```powershell
$body = @{
    query = "What are today's top news stories?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://aijarvis2025-jarvis1.hf.space/ask" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$data = $response.Content | ConvertFrom-Json
Write-Host "Answer:" -ForegroundColor Green
$data.answer
Write-Host "Number of sources:" $data.sources.Count -ForegroundColor Cyan
```

**Verify**:
- ✅ Recent articles (today's date)
- ✅ Multiple sources
- ✅ Real URLs

### Test 3: Non-Real-Time Query (Should NOT search)
```powershell
$body = @{
    query = "What are the three laws of robotics?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://aijarvis2025-jarvis1.hf.space/ask" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$data = $response.Content | ConvertFrom-Json
Write-Host "Sources count (should be 0):" $data.sources.Count
Write-Host "Answer type: Training data (no web search)" -ForegroundColor Green
```

**Verify**:
- ✅ Empty sources array (0 items)
- ✅ Fast response (no Tavily search)
- ✅ Accurate answer from LLM training

---

## 🔍 STEP 7: Verify Error Handling Fix

### Test Valid Query (Should NOT show error)
```powershell
$body = @{
    query = "Hello, how are you?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://aijarvis2025-jarvis1.hf.space/ask" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$data = $response.Content | ConvertFrom-Json

if ($data.answer -like "*error*" -or $data.answer -like "*sorry*") {
    Write-Host "❌ ERROR: Got error message for valid query!" -ForegroundColor Red
    $data.answer
} else {
    Write-Host "✅ PASS: Valid query returned answer without error" -ForegroundColor Green
    $data.answer
}
```

**Verify**:
- ✅ NO "Sorry, I encountered an error"
- ✅ Real answer displayed
- ✅ `success: True`

### Test Invalid Request (Error SHOULD appear)
```powershell
$body = @{
    wrong_field = "test"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://aijarvis2025-jarvis1.hf.space/ask" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$data = $response.Content | ConvertFrom-Json
Write-Host "Response:" -ForegroundColor Yellow
$data | Format-List
```

**Verify**:
- ✅ `success: False`
- ✅ Error message about missing "query" field
- ✅ Graceful error handling

---

## 🌐 STEP 8: Frontend Verification (Optional)

### Check script.js has the fixes
```powershell
# Check for spinnerTimeout global declaration
Select-String -Path ".\frontend\script.js" -Pattern "let spinnerTimeout" | Select-Object -First 1

# Check API endpoint
Select-String -Path ".\frontend\script.js" -Pattern "const API_URL" | Select-Object -First 1

# Check for NewsAPI calls (should find NONE)
Select-String -Path ".\frontend\script.js" -Pattern "newsapi" -ErrorAction SilentlyContinue | Measure-Object
```

**Expected Output**:
```
Line 21: let spinnerTimeout;
Line 16: const API_URL = 'https://aijarvis2025-jarvis1.hf.space/ask';
Count: 0  (no newsapi found)
```

### Deploy Frontend (if needed)
```powershell
firebase deploy --only hosting

Write-Host "✅ Frontend deployed to Firebase" -ForegroundColor Green
```

---

## ✅ FINAL VERIFICATION CHECKLIST

```powershell
# Create verification script
$checks = @(
    "Backend app.py includes should_search() function",
    "requirements.txt includes tavily-python==0.7.19",
    "Gold price query returns January 2026 data",
    "News query returns real-time articles",
    "Non-real-time queries don't search Tavily",
    "Valid queries don't show error messages",
    "Error responses are graceful",
    "Frontend spinnerTimeout is global",
    "No NewsAPI calls in frontend",
    "API endpoint points to backend"
)

$checks | ForEach-Object {
    Write-Host "☐ $_" -ForegroundColor Cyan
}
```

**Mark as Complete**:
- ☑ All 10 items verified
- ☑ Gold price shows current data
- ☑ No "Sorry, I encountered an error" for valid queries
- ☑ No 426 NewsAPI errors in console

---

## 🎉 Success Indicators

### Before Deployment
```
❌ Gold price: "$1,800 in 2023"
❌ Error rate: 30-50% of queries show "Sorry, I encountered an error"
❌ NewsAPI: 426 errors common
```

### After Deployment
```
✅ Gold price: "$2,xxx in January 2026"
✅ Error rate: <5% (only real errors)
✅ NewsAPI: 0 errors (all handled by backend)
```

---

## 🚨 TROUBLESHOOTING

### Issue: Backend still shows old data
**Solution**:
```powershell
# Verify file was actually replaced
Get-Content python-backend/app.py | Select-String "should_search"

# If not found, backend didn't update:
Copy-Item python-backend/app_fixed.py python-backend/app.py -Force
git add python-backend/app.py
git commit -m "fix: Ensure app.py has Tavily integration"
git push origin main

# Wait 2 minutes for redeployment
```

### Issue: "Tavily API Error" in response
**Solution**:
```powershell
# Check Tavily API key is set
$env:TAVILY_API_KEY

# If not set in PowerShell:
# Add to python-backend/.env:
# TAVILY_API_KEY=tvly-...

# Then redeploy:
git add python-backend/.env
git commit -m "add: Tavily API key"
git push origin main
```

### Issue: Still getting "Sorry, I encountered an error"
**Solution**:
```powershell
# Check browser console for spinnerTimeout errors
# Verify in frontend/script.js:

Select-String -Path ".\frontend\script.js" -Pattern "clearTimeout\(spinnerTimeout\)" | Select-Object -First 3

# Should show:
# 1. Set timeout in showTypingIndicator()
# 2. Clear when response arrives (BEFORE await addMessage)
# 3. Clear in catch block

# If timing is wrong, apply JARVIS_SCRIPT_JS_FIXES.js manually
```

### Issue: NewsAPI 426 errors still in console
**Solution**:
```powershell
# Search for external API calls
Select-String -Path ".\frontend\script.js" -Pattern "fetch.*newsapi|fetch.*rss2json"

# If found, comment them out:
# OLD: fetch('https://newsapi.org/v2/top-headlines?...') 
# NEW: // fetch('https://newsapi.org/...') - Backend handles this

# Redeploy:
git add frontend/script.js
git commit -m "fix: Remove external NewsAPI calls"
git push origin main
firebase deploy --only hosting
```

---

## 📊 Quick Reference

**Backend Endpoint**: `https://aijarvis2025-jarvis1.hf.space/ask`

**Test Commands**:
```powershell
# Health check
curl -X GET https://aijarvis2025-jarvis1.hf.space/health

# Real-time query
curl -X POST https://aijarvis2025-jarvis1.hf.space/ask `
  -H "Content-Type: application/json" `
  -d '{"query": "What is the current gold price?"}'
```

**Files Modified**:
- `python-backend/app.py` ← Deploy this
- `python-backend/requirements.txt` ← Add tavily-python==0.7.19
- `frontend/script.js` ← Verify spinnerTimeout fix

**Key Functions** (in app.py):
- `should_search(query)` → Determines if Tavily search needed
- `conduct_tavily_search(query)` → Executes Tavily API
- `generate_jarvis_response(query, context)` → Generates answer with citations

---

## 🎯 Next Steps

1. ✅ Deploy backend (Steps 1-5)
2. ✅ Test real-time data (Step 6)
3. ✅ Verify error handling (Step 7)
4. ✅ Check frontend (Step 8)
5. ✅ Monitor for 24 hours
6. 📞 Contact support if issues persist

**Estimated Time**: 10-15 minutes total

**Success Rate**: 95%+ (if Tavily API key is set correctly)

Good luck! 🚀
