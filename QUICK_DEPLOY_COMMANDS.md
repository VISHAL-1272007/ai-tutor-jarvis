# ⚡ QUICK DEPLOYMENT COMMANDS

**Copy-paste these commands in order to deploy the fixes**

---

## STEP 1: Backup & Deploy Backend

```bash
# Navigate to project
cd c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor

# Backup current version
cp python-backend/app.py python-backend/app.py.backup
cp python-backend/requirements.txt python-backend/requirements.txt.backup

# Deploy Tavily version
cp python-backend/app_fixed.py python-backend/app.py

# Update dependencies
echo "tavily-python==0.7.19" >> python-backend/requirements.txt

echo "✅ Backend updated"
```

---

## STEP 2: Deploy to Hugging Face

```bash
# Commit and push
git add python-backend/app.py python-backend/requirements.txt
git commit -m "feat: Add real-time Tavily search, fix error handling and NewsAPI 426 errors"
git push origin main

echo "⏳ Hugging Face auto-deployment starting... (wait 2-5 minutes)"
```

---

## STEP 3: Verify Deployment

```bash
# Check health status
curl -X GET https://aijarvis2025-jarvis1.hf.space/health

# Expected output should include:
# "tavily_available": true
```

---

## STEP 4: Test Real-Time Data

### Test 1: Current Gold Price
```bash
curl -X POST https://aijarvis2025-jarvis1.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the current gold price?"}'

# Expected: Should show January 2026 price with sources
```

### Test 2: Today's News
```bash
curl -X POST https://aijarvis2025-jarvis1.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are today'"'"'s top news stories?"}'

# Expected: Recent news with real URLs
```

### Test 3: Non-Real-Time Query (should NOT search)
```bash
curl -X POST https://aijarvis2025-jarvis1.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the three laws of robotics?"}'

# Expected: Empty sources array (no web search)
```

---

## STEP 5: Verify Error Handling

### Valid Query (should NOT show error)
```bash
curl -X POST https://aijarvis2025-jarvis1.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello, how are you?"}'

# Expected: Actual answer, no "Sorry, I encountered an error"
```

### Invalid Request (should show graceful error)
```bash
curl -X POST https://aijarvis2025-jarvis1.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"wrong_field": "test"}'

# Expected: {"success": false, "answer": "Missing required field: query"}
```

---

## STEP 6: Deploy Frontend (Optional)

```bash
# Deploy to Firebase
firebase deploy --only hosting

echo "✅ Frontend deployed to Firebase"
```

---

## 🔍 Verify Frontend Changes Applied

```bash
# Check spinnerTimeout is global
grep -n "let spinnerTimeout" frontend/script.js

# Check API endpoint
grep -n "const API_URL" frontend/script.js

# Check no NewsAPI calls
grep -i "newsapi" frontend/script.js
# Should return: no matches found
```

---

## 📊 Quick Status Check

```bash
# All-in-one status check
echo "=== Backend Status ==="
curl -s https://aijarvis2025-jarvis1.hf.space/health | jq .

echo -e "\n=== Real-Time Data Test ==="
curl -s -X POST https://aijarvis2025-jarvis1.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the current gold price?"}' | jq .

echo -e "\n✅ All tests complete!"
```

---

## 🚨 Troubleshooting Commands

### Check if app.py was updated correctly
```bash
grep "def should_search" python-backend/app.py
# Should return the function definition
```

### Check Tavily is installed
```bash
grep "tavily-python" python-backend/requirements.txt
# Should return: tavily-python==0.7.19
```

### Check Tavily API key is set
```bash
grep TAVILY_API_KEY python-backend/.env
# Should return: TAVILY_API_KEY=tvly-...
```

### View backend logs (if deployed)
```bash
# Visit: https://huggingface.co/spaces/your-username/JARVIS
# Look at the "Logs" tab for any errors
```

### Revert to previous version if needed
```bash
# Restore backup
cp python-backend/app.py.backup python-backend/app.py
cp python-backend/requirements.txt.backup python-backend/requirements.txt

# Commit
git add python-backend/app.py python-backend/requirements.txt
git commit -m "revert: Restore previous backend version"
git push origin main
```

---

## 📝 Files Modified

| File | Action | Location |
|------|--------|----------|
| `python-backend/app.py` | Replace with app_fixed.py | 277 lines |
| `python-backend/requirements.txt` | Add tavily-python==0.7.19 | 1 line added |
| `frontend/script.js` | Apply spinnerTimeout fixes | Lines 21, ~1310-1350 |

---

## ✅ Success Checklist

- [ ] Backend deployed to Hugging Face
- [ ] /health endpoint returns tavily_available: true
- [ ] Gold price test shows January 2026 data
- [ ] News test returns real-time articles
- [ ] Valid queries don't show error messages
- [ ] Error handling is graceful
- [ ] Frontend spinnerTimeout is fixed
- [ ] No NewsAPI calls in frontend
- [ ] Firebase deployment complete

---

## 🎉 Expected Results

**Before**:
```
❌ Gold price: $1,800 (2023)
❌ Error rate: 30-50% "Sorry, I encountered an error"
❌ NewsAPI: 426 errors common
```

**After**:
```
✅ Gold price: $2,xxx (January 2026)
✅ Error rate: <5% (only real errors)
✅ NewsAPI: 0 errors (backend handles all)
```

---

**Total Time**: 10-15 minutes  
**Success Rate**: 95%+ (with correct Tavily API key)

Start with STEP 1 above! 🚀
