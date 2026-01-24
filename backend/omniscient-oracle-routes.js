/**
 * OMNISCIENT ORACLE API ENDPOINT
 * 
 * Express route handlers for the advanced AI verification system
 * Integrates with: Groq, Gemini, OpenRouter, HuggingFace, SerpAPI
 */

const express = require('express');
const { OmniscientOracle } = require('./omniscient-oracle');
const { GlobalKnowledgeEngine } = require('./global-knowledge-engine');
const autonomousRAG = require('./jarvis-autonomous-rag');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const oracle = new OmniscientOracle();
const gke = new GlobalKnowledgeEngine();

// ============================================================================
// ENDPOINT 8: Autonomous RAG (The New Standard)
// ============================================================================

/**
 * POST /api/oracle/autonomous-rag
 * High-precision answer using the new autonomous RAG pipeline
 */
router.post('/autonomous-rag', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        const result = await autonomousRAG.answer(query);
        res.json(result);
    } catch (error) {
        console.error('Autonomous RAG Route Error:', error);
        res.status(500).json({ error: 'RAG Pipeline Failure' });
    }
});

// Rate limiting: 30 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests, please try again later'
});

// ============================================================================
// ENDPOINT 1: Advanced Query with Full Reasoning
// ============================================================================

/**
 * POST /api/oracle/query
 * 
 * Process query through advanced verification pipeline
 * Returns: Answer + Sources + Confidence + Reasoning
 * 
 * @param {string} query - User's question
 * @param {boolean} includeReasoning - Show thought process (default: true)
 * 
 * Example Response:
 * {
 *   "answer": "...",
 *   "confidence": { "score": 92, "level": "HIGH" },
 *   "verification": "VERIFIED",
 *   "sources": [...],
 *   "reasoning": [...]
 * }
 */
router.post('/query', limiter, async (req, res) => {
  try {
    const { query, includeReasoning = true } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query cannot be empty' });
    }

    if (query.length > 1000) {
      return res.status(400).json({ error: 'Query too long (max 1000 characters)' });
    }

    // Process through oracle
    const result = await oracle.process(query);

    // Filter response if reasoning not requested
    if (!includeReasoning) {
      delete result.reasoning;
    }

    res.json(result);
  } catch (error) {
    console.error('Oracle query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// ENDPOINT 2: Compare Multiple AI Models
// ============================================================================

/**
 * POST /api/oracle/compare
 * 
 * Get raw responses from all AI models for comparison
 * Useful for seeing how different models handle the same query
 * 
 * Returns: Array of responses with confidence scores
 */
router.post('/compare', limiter, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    const results = await oracle.orchestrator.queryAllModels(query);

    // Sort by confidence
    const sorted = results.responses.sort((a, b) => b.confidence - a.confidence);

    res.json({
      query,
      modelsQueried: sorted.length,
      responses: sorted.map(r => ({
        model: r.model,
        confidence: `${r.confidence}%`,
        response: r.response.substring(0, 300) + '...',
        executionTime: r.time_ms
      })),
      executionTime: results.totalTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ENDPOINT 3: Web Search Verification
// ============================================================================

/**
 * POST /api/oracle/verify
 * 
 * Search internet for live information about a topic
 * Useful for fact-checking or getting current information
 * 
 * Returns: Top sources with snippets and URLs
 */
router.post('/verify', limiter, async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    const searchResults = await oracle.searchEngine.search(query, { results: limit });

    res.json({
      query,
      sourceCount: searchResults.sources.length,
      sources: searchResults.sources.map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.snippet.substring(0, 200),
        source: s.source,
        type: s.type
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ENDPOINT 4: Cache Status
// ============================================================================

/**
 * GET /api/oracle/cache-stats
 * 
 * Returns cache performance metrics
 */
router.get('/cache-stats', (req, res) => {
  const cacheSize = oracle.orchestrator.cache.size;
  
  res.json({
    cacheSize,
    cacheCapacity: 1000,
    utilizationPercent: Math.round((cacheSize / 1000) * 100),
    ttl: '1 hour'
  });
});

// ============================================================================
// ENDPOINT 5: Health Check
// ============================================================================

/**
 * GET /api/oracle/health
 * 
 * Check system status and API connectivity
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    components: {
      groq: process.env.GROQ_API_KEY ? 'CONFIGURED' : 'MISSING',
      gemini: process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'MISSING',
      openrouter: process.env.OPENROUTER_KEY ? 'CONFIGURED' : 'MISSING',
      huggingface: process.env.HUGGINGFACE_API_KEY ? 'CONFIGURED' : 'MISSING',
      serpapi: process.env.SERPAPI_KEY ? 'CONFIGURED' : 'MISSING'
    },
    timestamp: new Date().toISOString()
  };

  res.json(health);
});

// ============================================================================
// ENDPOINT 6: Autonomous "A-Z" Training
// ============================================================================

/**
 * POST /api/oracle/train
 * Deeply research a topic from A-Z and store in Long-Term Memory
 */
router.post('/train', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  try {
    const result = await gke.autonomousTrain(topic);
    res.json(result);
  } catch (error) {
    console.error('Training route error:', error);
    res.status(500).json({ error: 'Training failed' });
  }
});

// ============================================================================
// ENDPOINT 7: "God-Mode" Hybrid Inquiry
// ============================================================================

/**
 * POST /api/oracle/ask-god
 * Hybrid query: Permanent memory + Live Oracle
 */
router.post('/ask-god', async (req, res) => {
  const { question } = req.body;
  if (!question) res.status(400).json({ error: 'Question is required' });

  try {
    const result = await gke.queryGodMode(question);
    res.json(result);
  } catch (error) {
    console.error('God-mode route error:', error);
    res.status(500).json({ error: 'Knowledge synthesis failed' });
  }
});

module.exports = router;
