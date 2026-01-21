# ⚡ AUTO-FALLBACK - QUICK REFERENCE

## 🚀 New Endpoint
```
POST /omniscient/auto-fallback
```

## 📝 Minimal Request
```json
{
  "question": "What is AI?"
}
```

## 📊 Minimal Response
```json
{
  "success": true,
  "data": {
    "answer": "...",
    "model": "groq",
    "confidence": 85
  }
}
```

## 🔄 How It Works
```
Groq (if confident >65%) ✅ RETURN
├─ Falls to Claude ↓
Claude (if confident >65%) ✅ RETURN
├─ Falls to OpenRouter ↓
OpenRouter (if confident >65%) ✅ RETURN
├─ Falls to HuggingFace ↓
HuggingFace ✅ RETURN
```

## 💡 Examples

### Simple
```bash
curl -X POST http://localhost:3000/omniscient/auto-fallback \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Python?"}'
```

### With Thresholds
```bash
curl -X POST http://localhost:3000/omniscient/auto-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "question":"Solve 2x+3=7",
    "domain":"math",
    "minConfidence":75
  }'
```

## 📊 Confidence Guide
| Score | Meaning |
|-------|---------|
| 85-100 | Excellent ✅ |
| 70-84 | Good ✅ |
| 60-69 | Fair ⚠️ |
| <60 | Low ❌ |

## ⏱️ Expected Times
- Groq only: 300ms ⚡
- +Claude: 2-3s ⚡
- +OpenRouter: 4-5s ⚡
- +HuggingFace: 6-8s ⚠️

## 🔑 Parameters
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| question | string | required | Your query |
| context | string | "" | Background info |
| domain | string | "general" | code/math/science/etc |
| minConfidence | number | 50 | 0-100 threshold |

## ✅ Features
- ✅ Sequential fallback
- ✅ Confidence scoring
- ✅ Smart stopping
- ✅ All attempts tracked
- ✅ Error handling
- ✅ Rate limited (100/15min)

## 🎯 When to Use
- ✅ General Q&A
- ✅ Support bots
- ✅ Learning platforms
- ✅ Unknown difficulty
- ❌ Critical decisions
- ❌ Speed essential

## 📚 Full Docs
- `AUTO_FALLBACK_SYSTEM.md` - Complete reference
- `AUTO_FALLBACK_TESTING.md` - Testing guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation details

---

**Status**: ✅ LIVE & READY
**Version**: JARVIS Pro+ 2.0.0
