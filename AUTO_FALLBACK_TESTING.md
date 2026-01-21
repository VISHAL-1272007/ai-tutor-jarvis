# 🧪 AUTO-FALLBACK SYSTEM - TESTING GUIDE

**Status**: ✅ **LIVE & READY TO TEST**
**Date**: January 21, 2026
**Endpoint**: `POST /omniscient/auto-fallback`

---

## 🚀 Quick Start Testing

### Test 1: Simple Query (Should use Groq)
```bash
curl -X POST http://localhost:3000/omniscient/auto-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Python?"
  }'
```

**Expected**: Groq responds with ~80+ confidence, stops early ✅

---

### Test 2: Complex Query (Should fallback to Claude)
```bash
curl -X POST http://localhost:3000/omniscient/auto-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain quantum entanglement and its implications for cryptography",
    "domain": "science",
    "minConfidence": 75
  }'
```

**Expected**: Groq tries (~60%), falls back to Claude (~85+%) ✅

---

### Test 3: Math Problem (High confidence required)
```bash
curl -X POST http://localhost:3000/omniscient/auto-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Integrate: ∫(3x² + 2x + 1)dx",
    "domain": "math",
    "minConfidence": 80
  }'
```

**Expected**: May try multiple models, returns confident answer ✅

---

### Test 4: Production URL
```bash
curl -X POST https://ai-tutor-jarvis.onrender.com/omniscient/auto-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is machine learning?",
    "minConfidence": 50
  }'
```

**Expected**: Response from production backend ✅

---

## 📊 Testing Checklist

- [ ] **Groq alone** - Returns fast (<500ms)
- [ ] **Fallback triggered** - Tests Claude availability
- [ ] **All APIs fail** - Returns proper error
- [ ] **Low confidence** - Shows warning
- [ ] **High confidence** - Stops early
- [ ] **Context parameter** - Affects response
- [ ] **Domain parameter** - Routes correctly
- [ ] **Rate limiting** - Respects limits
- [ ] **Error handling** - Graceful failures
- [ ] **Response format** - All fields present

---

## 🔍 What to Look For in Response

### Success Response
```json
{
  "success": true,
  "data": {
    "answer": "...",           ← Main answer
    "model": "groq",           ← Which API responded
    "confidence": 87,          ← Confidence % (0-100)
    "minConfidenceRequired": 50, ← Your threshold
    "allAttempts": [...],      ← All tries
    "warning": null            ← No issues
  }
}
```

### Fallback Evidence
```
allAttempts: [
  { "model": "groq", "confidence": 62 },        ← Low confidence
  { "model": "claude", "confidence": 88 }       ← Fell back, better!
]
```

### Low Confidence Warning
```
"warning": "Low confidence (45%). Consider asking for clarification."
```

---

## ⏱️ Performance Testing

### Expected Times
| Scenario | Time | Status |
|----------|------|--------|
| Groq confident | 300-500ms | ✅ |
| 1 fallback | 2-3s | ✅ |
| 2 fallbacks | 4-5s | ✅ |
| 3 fallbacks | 6-8s | ⚠️ |

---

## 🐛 Debugging

### Check logs for:
```
🔄 Trying GROQ...
✅ GROQ confidence: 78%
🎯 High confidence from GROQ, stopping search
```

### Or for fallback:
```
🔄 Trying GROQ...
✅ GROQ confidence: 45%
🔄 Trying CLAUDE...
✅ CLAUDE confidence: 85%
🎯 High confidence from CLAUDE, stopping search
```

---

## 🎯 Test Cases by Query Type

### Coding Questions
```json
{
  "question": "Write a Python function to sort an array",
  "domain": "code",
  "minConfidence": 70
}
```
*Expect: High confidence from Groq (coding specialty)*

---

### Math Questions
```json
{
  "question": "What is the derivative of x²?",
  "domain": "math",
  "minConfidence": 80
}
```
*Expect: Fallback to Claude for better math precision*

---

### Science Questions
```json
{
  "question": "How does photosynthesis work?",
  "domain": "science",
  "minConfidence": 75
}
```
*Expect: Mix of APIs, good final answer*

---

### General Knowledge
```json
{
  "question": "What is AI?",
  "domain": "general",
  "minConfidence": 50
}
```
*Expect: Quick Groq response, high confidence*

---

## 🔧 Testing from Code

### JavaScript
```javascript
async function testAutoFallback() {
  const response = await fetch('http://localhost:3000/omniscient/auto-fallback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What is machine learning?',
      minConfidence: 60
    })
  });
  
  const data = await response.json();
  
  console.log('✅ Success:', data.success);
  console.log('📝 Answer:', data.data.answer);
  console.log('🤖 Model:', data.data.model);
  console.log('📊 Confidence:', data.data.confidence + '%');
  console.log('🔄 Attempts:', data.data.allAttempts);
}

testAutoFallback();
```

---

### Python
```python
import requests
import json

response = requests.post(
    'http://localhost:3000/omniscient/auto-fallback',
    json={
        'question': 'What is machine learning?',
        'minConfidence': 60
    }
)

data = response.json()
print(f"✅ Success: {data['success']}")
print(f"📝 Answer: {data['data']['answer']}")
print(f"🤖 Model: {data['data']['model']}")
print(f"📊 Confidence: {data['data']['confidence']}%")
print(f"🔄 Attempts: {data['data']['allAttempts']}")
```

---

## 📈 Monitoring During Testing

### Watch for:
- ✅ Response times decrease with confidence
- ✅ Fallbacks trigger at appropriate confidence thresholds
- ✅ All APIs tried in correct order (Groq → Claude → OpenRouter → HuggingFace)
- ✅ Rate limiting works (max 100 req/15min)
- ✅ No duplicate API calls
- ✅ Proper error handling on failures

---

## 🎓 Real-World Test Scenarios

### Scenario 1: Support Bot
```
Customer: "How do I reset my password?"
→ Query: "How do I reset my password?"
→ Expected: High confidence from Groq, instant response
→ Result: Fast, accurate answer ✅
```

### Scenario 2: Homework Help
```
Student: "Explain photosynthesis in detail"
→ Query with minConfidence: 75
→ Expected: Might fallback to Claude for depth
→ Result: High-quality educational answer ✅
```

### Scenario 3: Technical Question
```
Developer: "What's the time complexity of quicksort?"
→ Query with domain: "code"
→ Expected: Groq answers quickly and accurately
→ Result: <500ms response, high confidence ✅
```

### Scenario 4: Ambiguous Question
```
User: "Tell me about Python"
→ Query: Generic question
→ Expected: Groq tries, might fall back if low confidence
→ Result: Clear, confident answer ✅
```

---

## ✅ Success Criteria

- [ ] Response received < 2s average
- [ ] Confidence scores reasonable (20-95 range)
- [ ] Fallbacks only when confidence < 65%
- [ ] All attempts tracked in response
- [ ] No errors in production logs
- [ ] Proper error handling for failed APIs
- [ ] Rate limiting enforcement working
- [ ] All fields present in response
- [ ] Warning shown for low confidence
- [ ] Multiple test queries show variety in models used

---

## 🚨 Troubleshooting

### "All APIs failed to respond"
- Check all API keys in .env
- Verify network connectivity
- Check API quotas/rate limits
- Review Render logs

### "Confidence always low"
- Verify API keys are valid
- Check if APIs are properly returning responses
- Review scoring algorithm thresholds
- Test individual APIs

### "Always uses same model"
- Check if other APIs are configured
- Verify confidence thresholds triggering fallback
- Review response quality from first API
- Check API availability

### Timeout issues
- Verify Render instance has enough resources
- Check if requests are hitting rate limits
- Verify backend startup is complete
- Monitor response times in production

---

## 📝 Test Report Template

```
Date: January 21, 2026
Tester: [Your Name]
Environment: [Local/Production]

## Test Results

### Test 1: Simple Query
- Query: "What is Python?"
- Time: ___ ms
- Model: ___
- Confidence: ___%
- Status: ✅ ❌

### Test 2: Complex Query
- Query: "Explain quantum mechanics..."
- Time: ___ ms
- Model: ___
- Fallbacks: ___
- Status: ✅ ❌

### Test 3: High Confidence Required
- Query: [Your query]
- Time: ___ ms
- Final Model: ___
- Confidence: ___%
- Status: ✅ ❌

## Overall Status
- Performance: ⚡ ⚡⚡ ⚡⚡⚡
- Reliability: ⭐ ⭐⭐ ⭐⭐⭐ ⭐⭐⭐⭐ ⭐⭐⭐⭐⭐
- Ready for Production: ✅ ❌

Notes: [Your notes]
```

---

## 🎉 After Testing

1. **Report results** to the team
2. **Document any issues** found
3. **Note response times** for benchmarking
4. **Verify error handling** works as expected
5. **Check monitoring** captures events properly
6. **Prepare deployment** to production
7. **Set up alerts** for low confidence responses

---

**Ready to Test?** 🚀

Start with Test 1, then progress through the scenarios!
