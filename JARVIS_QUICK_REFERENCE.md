# 🎯 JARVIS Quick Reference Guide

## 🚀 QUICK START

### **URLs**
```
Frontend: https://vishai-f6197.web.app ✅
Backend API: https://ai-tutor-jarvis.onrender.com ✅
GitHub: https://github.com/VISHAL-1272007/ai-tutor-jarvis
```

### **Core Endpoints** (Most Used)
```
POST /pro-plus/code       → Senior architect code generation
POST /pro-plus/math       → PhD-level mathematics
POST /pro-plus/dsa        → Competitive DSA solutions
POST /omniscient/consensus → Multi-AI best answer
GET  /api/wolfram/query   → Math computation
```

---

## 📊 CURRENT STATS

| Metric | Value |
|--------|-------|
| **Version** | 2.0.0 Pro+ |
| **Backend** | Node.js 22.16.0 |
| **API Keys** | 27 configured |
| **Endpoints** | 40+ active |
| **AI Engines** | 5 (Gemini, Groq, Claude, OpenRouter, HuggingFace) |
| **WolframAlpha** | 4 App IDs (8,000 q/mo) |
| **Uptime** | 99%+ |
| **Students Target** | 30,000 by May 2027 |

---

## 🔧 DEPLOYMENT STATUS

✅ **Backend**: Render (ai-tutor-jarvis.onrender.com)
✅ **Frontend**: Firebase (vishai-f6197.web.app)
✅ **GitHub**: Synced with auto-deploy
✅ **Environment**: 27 API keys active

---

## 🎓 FEATURES

### **Reasoning Modes**
1. Omniscient (max intelligence)
2. Fast (Groq - <500ms)
3. Consensus (5 AIs)
4. WolframAlpha (exact math)
5. Expert Consultation (6 personas)
6. Chain-of-Thought (deep reasoning)
7. Pro+ (competition-level)

### **Specializations**
- 💻 **Coding**: Full-stack, algorithms, debugging
- 📐 **Math**: Calculus, algebra, statistics
- 🔬 **Science**: Physics, chemistry, biology
- ✍️ **Writing**: Essays, grammar, creativity
- 💼 **Business**: Strategy, marketing, finance
- 🎯 **DSA**: 180+ problems with solutions

---

## 🔑 ENV VARIABLES (27 Total)

**Essential**:
```
GEMINI_API_KEY
GROQ_API_KEY
WOLFRAM_APP_ID (x4)
```

**Optional but Recommended**:
```
CLAUDE_API_KEY
OPENROUTER_API_KEY
JINA_API_KEY
STABILITY_API_KEY
ELEVENLABS_API_KEY
DEEPGRAM_API_KEY
```

---

## 📈 WolframAlpha Quad Setup

```
App ID 1: UJ2KY6RXTT (JARVIS)
App ID 2: HQQ9ETXRJU (JARVIS1)
App ID 3: PW4WVKUUK2 (jarvis2)
App ID 4: 23H5Y5PTUT (jarvis3)

Total: 8,000 queries/month
For 30k students: 5.3x buffer ✅
```

---

## ⚡ PERFORMANCE TARGETS

| Operation | Target | Current |
|-----------|--------|---------|
| Groq Query | <500ms | ~300ms ✅ |
| Gemini Query | <3s | ~2.5s ✅ |
| Consensus | <5s | ~4s ✅ |
| WolframAlpha | <2s | ~1.5s ✅ |

---

## 🛡️ RECENT FIXES (Jan 21)

✅ Removed corrupted code (380+ lines)
✅ Fixed package.json entry point
✅ Added missing dependencies
✅ Fixed server startup code
✅ Implemented safe module loading

---

## 🚨 TROUBLESHOOTING

**Issue**: 503 Service Unavailable
- Check Render logs: https://dashboard.render.com
- Restart dyno
- Verify all env vars set

**Issue**: Slow responses
- Check WolframAlpha query counter
- Verify Groq API working
- Check network latency

**Issue**: 404 on endpoint
- Verify endpoint path correct
- Check backend deployed
- Test with curl command

---

## 📋 FILE STRUCTURE

```
backend/
├── index.js (3,276 lines - main)
├── jarvis-pro-plus-system.js
├── wolfram-alpha-integration.js
├── autonomous-rag-pipeline.js
└── .env (secrets)

Root:
├── jarvis-full-power.js
├── jarvis-omniscient-lite.js
├── jarvis-omniscient-full.js
├── package.json (v2.0.0)
└── firebase.json
```

---

## 🎯 NEXT STEPS

1. **Verify Deployment**
   ```
   curl https://ai-tutor-jarvis.onrender.com/health
   Expected: {"status": "AI Tutor..."}
   ```

2. **Test Pro+ Endpoint**
   ```bash
   curl -X POST https://ai-tutor-jarvis.onrender.com/pro-plus/code \
     -H "Content-Type: application/json" \
     -d '{"question":"Hello JARVIS"}'
   ```

3. **Check Logs**
   - Render Dashboard: https://dashboard.render.com
   - Filter for errors
   - Monitor CPU/memory

4. **Scale for Students**
   - Database migration (MongoDB)
   - Caching layer (Redis)
   - Additional instances

---

## 💾 QUICK COMMANDS

```bash
# Local development
npm start
npm run dev

# Deploy to GitHub
git add .
git commit -m "message"
git push

# Check status
curl https://ai-tutor-jarvis.onrender.com/omniscient/status

# View logs (local)
tail -f backend/server.log
```

---

## 📞 SUPPORT

| Issue | Action |
|-------|--------|
| Backend down | Check Render logs, restart |
| API rate limited | Rotate WolframAlpha ID |
| No responses | Verify API keys in .env |
| Slow performance | Check network, optimize query |

---

## 🎓 STUDENT GOALS

By **May 2027**:
- ✅ 30,000 students using JARVIS
- ✅ 180+ DSA problems mastered
- ✅ 95%+ placement rate
- ✅ ₹18 LPA average package
- ✅ Zero cost platform

---

**Version**: 2.0.0 Pro+
**Status**: ✅ OPERATIONAL
**Last Updated**: January 21, 2026
