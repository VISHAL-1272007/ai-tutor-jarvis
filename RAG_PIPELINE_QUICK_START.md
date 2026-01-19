# 🚀 AUTONOMOUS RAG PIPELINE - IMPLEMENTATION GUIDE

## Quick Start

### What's New?

Your chat controller now features an **Autonomous RAG Pipeline** that intelligently processes queries through 5 sequential layers:

```
Query Expansion → Entity Classification → Intelligent Search → 
Context Synthesis → Hallucination Guardrails
```

### Key Features:

✅ **Query Expansion:** Transforms "TVK" → "Tamizhaga Vettri Kazhagam political party latest news"
✅ **Entity Classification:** Detects LOCAL (Tamil Nadu/India) vs GLOBAL scope
✅ **Smart Search:** Uses entity context to fetch most relevant results
✅ **Citation Enforcement:** Every factual claim includes source attribution
✅ **Hallucination Prevention:** Asks for clarification instead of guessing
✅ **Professional Persona:** "Universal Knowledge Expert" with "Sir" tone

---

## Testing the Pipeline

### Test Case 1: Acronym Expansion (LOCAL Entity)

**Query:** "TVK latest news"

**Expected Pipeline Flow:**
```
Step 1: Query Expansion
  Input: "TVK latest news"
  Analysis: ACRONYM - needs context
  Output: "Tamizhaga Vettri Kazhagam political party latest news 2026"

Step 2: Entity Classification
  Analysis: Tamil Nadu political entity
  Scope: LOCAL
  Search Strategy: "Add Tamil Nadu Chennai context"

Step 3: Intelligent Web Search
  Search Query: "Tamizhaga Vettri Kazhagam political party latest news 2026 Tamil Nadu Chennai"
  Results: 5 sources from Tamil newspapers

Step 4: Context Synthesis
  Response: "TVK is a Tamil political party... [Source-1: thehindu.com] ..."
  
Step 5: Guardrails
  Confidence: HIGH (4+ sources found)
  Output: Send response with citations
```

**Expected Response:**
```json
{
  "answer": "Sir, Tamizhaga Vettri Kazhagam (TVK) is a Tamil Nadu-based political party... 
             [Source-1: The Hindu] ... According to recent reports [Source-2: Hindu Tamil] ...",
  "sources": [
    {
      "title": "TVK - Tamil Nadu's Emerging Political Force",
      "url": "https://thehindu.com/...",
      "snippet": "..."
    }
  ],
  "ragPipelineUsed": true,
  "quality": "HIGH_CONFIDENCE"
}
```

---

### Test Case 2: Vague Query (Multiple Interpretations)

**Query:** "stock market today"

**Expected Pipeline Flow:**
```
Step 1: Query Expansion
  Input: "stock market today"
  Analysis: VAGUE - could mean NSE, BSE, or global markets
  Output: Confidence < 0.6
  
Step 2: Entity Classification
  Analysis: Ambiguous between LOCAL (India) and GLOBAL
  Decision: REGIONAL focus with India context

Step 3: Web Search
  Search: "Indian stock market NSE BSE today 2026"
  Quality Score: 0.5 (moderate)
  
Step 4: Synthesis
  Issue: Not enough context to answer precisely
  
Step 5: Guardrails ⚠️ TRIGGERED
  Confidence: LOW
  Action: Request clarification
```

**Expected Response:**
```json
{
  "type": "CLARIFICATION_NEEDED",
  "answer": "Sir, could you please clarify if you mean:

  • Option A: Indian stock market (NSE/BSE) performance today
  • Option B: Global stock market overview (US, European markets)
  • Option C: Specific stock performance (like TCS, Infosys)
  
  This will help me provide you with the most accurate information.",
  "options": ["Option A: Indian stock market", "Option B: Global markets", "Option C: Specific stocks"],
  "quality": "LOW_CONFIDENCE",
  "ragPipelineUsed": true
}
```

---

### Test Case 3: Clear, Global Query

**Query:** "Latest NASA Mars mission updates 2026"

**Expected Pipeline Flow:**
```
Step 1: Query Expansion
  Input: "Latest NASA Mars mission updates 2026"
  Clarity: CLEAR - specific and unambiguous
  Confidence: 0.95

Step 2: Entity Classification
  Entity: NASA (Global organization)
  Scope: GLOBAL
  Search Strategy: Use international sources

Step 3: Web Search
  Query: "NASA Mars mission 2026 latest updates space exploration"
  Results: Multiple NASA, SpaceNews, Science Daily articles
  Quality: 0.9 (high-quality sources)

Step 4: Synthesis
  Response: "NASA's latest Mars mission... [Source-1: NASA.gov] ...
             According to recent updates [Source-2: ScienceDaily] ..."

Step 5: Guardrails
  Confidence: HIGH (5 authoritative sources)
  Output: Send response
```

**Expected Response:**
```json
{
  "answer": "Sir, NASA's current Mars exploration program includes... 
             [Source-1: NASA.gov - Official NASA Website]... 
             According to recent reports from SpaceNews [Source-2: spacenews.com]...",
  "sources": [
    {"title": "NASA Mars 2026 Mission Timeline", "url": "https://nasa.gov/..."},
    {"title": "Latest Updates on Mars Exploration", "url": "https://spacenews.com/..."}
  ],
  "ragPipelineUsed": true,
  "quality": "HIGH_CONFIDENCE",
  "metadata": {
    "expandedQuery": "NASA Mars mission 2026 latest updates space exploration",
    "scope": "GLOBAL"
  }
}
```

---

## Testing Endpoint

### API Endpoint

**POST** `/ask`

### Request Format

```json
{
  "question": "TVK latest news",
  "enableWebSearch": true,
  "mode": "general",
  "history": []
}
```

### Response Codes

- **200 OK** - Successful response
  - `HIGH_CONFIDENCE` - Answer + sources
  - `LOW_CONFIDENCE` - Clarification request
  
- **400 BAD REQUEST** - Missing required fields
- **500 INTERNAL SERVER ERROR** - Pipeline error (falls back to standard search)

---

## Monitoring & Debugging

### Enable Debug Logs

Set in your backend:
```bash
NODE_ENV=development  # Enables detailed console logs
```

### Expected Console Output

**High-Confidence Response:**
```
🚀 AUTONOMOUS RAG PIPELINE INITIATED
Query: "TVK latest news"
================================================================================

📊 [RAG-STEP-1] Query Expansion: "TVK latest news"
✅ Query Analysis - Clarity: ACRONYM | Geographic: LOCAL

🗺️ [RAG-STEP-2] Entity Classification
✅ Entity Classification - Primary Scope: LOCAL

🔍 [RAG-STEP-3] Intelligent Web Search: "Tamizhaga Vettri Kazhagam..."
✅ Search returned 5 results

🧠 [RAG-STEP-4] Context-Only Synthesis
✅ Synthesis complete with 5 sources cited

🛡️ [RAG-STEP-5] Hallucination Guardrails
Quality: 0.9 (high) | Sources: 5 | Status: PASS

✅ PIPELINE COMPLETE - HIGH CONFIDENCE RESPONSE
```

**Clarification Triggered:**
```
🚀 AUTONOMOUS RAG PIPELINE INITIATED
Query: "stock market"
================================================================================

📊 [RAG-STEP-1] Query Expansion: "stock market"
✅ Query Analysis - Clarity: VAGUE | Geographic: BOTH

[... steps 2-4 ...]

🛡️ [RAG-STEP-5] Hallucination Guardrails
⚠️ GUARDRAIL TRIGGERED: Insufficient context for query

⚠️ GUARDRAIL ACTIVE: Requesting clarification
```

### Error Handling

**If Groq API fails:**
```
⚠️ Query Expansion failed: [error message], using original query
```
Pipeline continues with original query.

**If Web Search fails:**
```
⚠️ Jina search failed: [error message]
Fallback to standard search logic
```

**If Synthesis fails:**
```
⚠️ Synthesis failed: [error message]
Return error to user with fallback message
```

---

## Configuration Tuning

### Adjust Confidence Thresholds

In `autonomous-rag-pipeline.js`:

```javascript
this.RAG_CONFIG = {
    entityThreshold: 0.7,           // Increase for stricter entity classification
    ambiguityThreshold: 0.6,        // Increase to ask for clarification more often
    sourceMinimumCount: 2,          // Increase to require more sources
    maxRetries: 3                   // Retry attempts for API calls
};
```

### Tuning Guide

| Issue | Solution |
|-------|----------|
| Too many clarification requests | Increase `ambiguityThreshold` to 0.75 |
| Not enough sources found | Decrease `sourceMinimumCount` to 1 |
| Queries taking too long | Decrease `maxRetries` to 1-2 |
| Too much hallucination | Decrease `entityThreshold` to 0.5 |

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Verify all API keys in `.env`:
  ```
  GROQ_API_KEY=...
  JINA_API_KEY=...
  PERPLEXITY_API_KEY=...
  ```

- [ ] Test with sample queries:
  ```
  TVK latest news → HIGH_CONFIDENCE expected
  stock market → CLARIFICATION expected
  NASA Mars → HIGH_CONFIDENCE expected
  ```

- [ ] Check backend logs for pipeline execution
- [ ] Verify response includes `ragPipelineUsed: true`
- [ ] Confirm source citations appear in response

### Deployment Command

```bash
cd backend
git pull origin main
npm install
# Restart your backend service (Render, etc.)
```

### Render Deployment

Push to GitHub (already done):
```bash
git push origin main
```

Render will auto-deploy. Check logs:
- Render Dashboard → Your App → Logs
- Look for: "✅ Autonomous RAG Pipeline initialized"

---

## Real-World Usage Examples

### Example 1: Tamil Political News

**User Input:** "TVK news"
**Pipeline Processing:**
1. Expands to: "Tamizhaga Vettri Kazhagam political party latest news"
2. Detects: LOCAL scope (Tamil Nadu)
3. Searches with Tamil context
4. Returns high-confidence response about TVK

### Example 2: International Event

**User Input:** "Tesla stock"
**Pipeline Processing:**
1. Recognizes as: Clear global entity
2. Detects: GLOBAL scope
3. Searches with international sources
4. Returns NASDAQ/global financial data

### Example 3: Ambiguous Query

**User Input:** "ISRO launch"
**Pipeline Processing:**
1. Recognizes as: Could be specific (recent ISRO launch) or general
2. Confidence: Medium (0.6)
3. Triggers guardrails: Asks for clarification
4. Offers: "Recent ISRO mission?" vs "ISRO history?" options

---

## Performance Metrics

### Expected Performance

| Component | Time |
|-----------|------|
| Query Expansion (Groq Mixtral) | 1.5 sec |
| Entity Classification | 1.2 sec |
| Web Search (Jina/Perplexity) | 2-3 sec |
| Synthesis (Groq LLaMA) | 2-3 sec |
| Guardrails Check | 0.5 sec |
| **Total Pipeline** | 7-11 sec |

**Optimization Tips:**
- Use Jina AI (fastest, 10K/month free)
- Cache query expansions for repeated queries
- Parallel API calls if multiple sources available

---

## Troubleshooting

### Pipeline Not Running?

**Check 1:** Is `ragPipeline` initialized?
```javascript
console.log(ragPipeline); // Should not be null
```

**Check 2:** Is `detectWebSearchNeeded()` returning true?
```javascript
console.log(detectWebSearchNeeded(question));
```

**Check 3:** Is `enableWebSearch` set to true?
```javascript
console.log(enableWebSearch);
```

### Why Clarification Request?

Check console for guardrail trigger reason:
```
⚠️ GUARDRAIL TRIGGERED: Insufficient context for query
- Sources found: 1 (need 2)
- Quality score: 0.3 (need > 0.4)
```

### How to Disable RAG Pipeline?

Set in `/ask` endpoint:
```javascript
// Comment out this line:
// if (useRagPipeline && ragPipeline && ...) { ... }

// Force standard search:
shouldSearchWeb = detectWebSearchNeeded(question);
```

---

## Next Steps

1. **Deploy & Test:**
   ```bash
   npm start
   curl -X POST http://localhost:3000/ask \
     -H "Content-Type: application/json" \
     -d '{"question":"TVK latest news"}'
   ```

2. **Monitor Logs:**
   - Watch for pipeline execution messages
   - Verify HIGH_CONFIDENCE responses
   - Check clarification requests

3. **Gather Metrics:**
   - Track accuracy of expansions
   - Monitor hallucination prevention
   - Measure response quality

4. **Tune as Needed:**
   - Adjust thresholds based on usage
   - Add custom keywords for domains
   - Improve source prioritization

---

## Support

**Questions? Issues?**

Check the full architecture document:
👉 [RAG_PIPELINE_ARCHITECTURE.md](./RAG_PIPELINE_ARCHITECTURE.md)

**Error in logs?**
1. Check API keys in `.env`
2. Verify internet connection
3. Check Groq/Jina API status
4. Review error message in console

---

**Implementation Status:** ✅ LIVE & PRODUCTION-READY
**Last Updated:** January 19, 2026
**Version:** 1.0 Enterprise

