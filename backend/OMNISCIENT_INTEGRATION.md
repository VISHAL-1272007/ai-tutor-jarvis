/**
 * INTEGRATION GUIDE: Adding Omniscient Oracle to Your JARVIS Backend
 * 
 * Add this to your main backend/index.js file
 */

// ============================================================================
// STEP 1: Add these imports to your index.js
// ============================================================================

const omniscientRoutes = require('./omniscient-oracle-routes');

// ============================================================================
// STEP 2: Register the routes (after other middleware)
// ============================================================================

// Mount omniscient oracle routes
app.use('/api/oracle', omniscientRoutes);

// ============================================================================
// STEP 3: Add required environment variables to .env
// ============================================================================

/*
# Omniscient Oracle Configuration
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_huggingface_key
SERPAPI_KEY=your_serpapi_key
*/

// ============================================================================
// STEP 4: Install dependencies
// ============================================================================

/*
npm install axios express-rate-limit
*/

// ============================================================================
// STEP 5: Full integration example
// ============================================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const omniscientRoutes = require('./omniscient-oracle-routes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/oracle', omniscientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'JARVIS Oracle' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🧠 JARVIS Omniscient Oracle running on port ${PORT}`);
});

module.exports = app;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

1. QUERY WITH FULL VERIFICATION:
   POST /api/oracle/query
   {
     "query": "What is the current version of Node.js?",
     "includeReasoning": true
   }

   Response:
   {
     "answer": "...",
     "confidence": { "score": 92, "level": "HIGH" },
     "verification": "VERIFIED",
     "sources": [...],
     "reasoning": [...]
   }

2. COMPARE AI MODELS:
   POST /api/oracle/compare
   {
     "query": "How does machine learning work?"
   }

   Response:
   {
     "query": "...",
     "modelsQueried": 4,
     "responses": [
       { "model": "Groq", "confidence": "92%", "response": "..." },
       ...
     ]
   }

3. WEB SEARCH VERIFICATION:
   POST /api/oracle/verify
   {
     "query": "Bitcoin price today",
     "limit": 5
   }

   Response:
   {
     "query": "...",
     "sourceCount": 5,
     "sources": [...]
   }

4. CACHE STATUS:
   GET /api/oracle/cache-stats

   Response:
   {
     "cacheSize": 45,
     "cacheCapacity": 1000,
     "utilizationPercent": 4.5
   }

5. HEALTH CHECK:
   GET /api/oracle/health

   Response:
   {
     "status": "OK",
     "components": {
       "groq": "CONFIGURED",
       "gemini": "CONFIGURED",
       "openrouter": "CONFIGURED",
       "huggingface": "CONFIGURED",
       "serpapi": "CONFIGURED"
     }
   }

*/
