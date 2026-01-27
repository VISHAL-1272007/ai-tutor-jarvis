/**
 * JARVIS AI Proxy Middleware
 * Handles user queries with DDGS web search + Groq LLM synthesis
 * Previously routed to Python Flask - now uses Node.js DDGS RAG directly
 */

const axios = require('axios');
const logger = require('./logger');
const { ddgsRagPipeline } = require('./ddgs-rag-integration'); // Direct DDGS RAG integration

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:3000'; // Legacy, not used

/**
 * Error handling helper
 */
const handleError = (error, res) => {
  const errorMsg = error.message || 'Unknown error';
  const statusCode = error.response?.status || 503;
  
  logger.error(`JARVIS Proxy Error: ${errorMsg}`);
  
  return res.status(statusCode).json({
    success: false,
    error: errorMsg,
    response: 'JARVIS is having a quick power nap! Please try again.',
    timestamp: new Date().toISOString()
  });
};

/**
 * POST /api/jarvis/ask
 * Main endpoint that uses DDGS web search + Groq LLM for synthesis
 * 
 * Request body:
 * {
 *   "query": "What are the latest AI trends?"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "response": "AI-generated answer...",
 *   "sources": [
 *     { "title": "...", "url": "..." }
 *   ],
 *   "verified_sources_count": 4,
 *   "context_length": 2345,
 *   "model": "llama-3.3-70b-versatile"
 * }
 */
async function askJarvis(req, res) {
  try {
    const { query } = req.body;

    // Validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a string',
        response: 'Please provide a valid question.'
      });
    }

    if (query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty',
        response: 'Your question seems empty. Ask me something!'
      });
    }

    // Log the incoming request
    logger.info(`🤖 JARVIS Query Received: "${query.substring(0, 100)}..."`);

    // Use DDGS RAG integration directly (no Python backend needed!)
    const startTime = Date.now();
    
    const ragResult = await ddgsRagPipeline(query.trim());
    
    const duration = Date.now() - startTime;

    // Transform RAG result to match expected frontend format
    const result = {
      success: ragResult.success,
      response: ragResult.answer || ragResult.response,
      sources: ragResult.sources || [],
      verified_sources_count: ragResult.sources?.length || 0,
      context_length: ragResult.context?.length || 0,
      model: 'llama-3.3-70b-versatile',
      source: ragResult.source || 'web'
    };

    // Log successful response
    logger.info(`✅ JARVIS Response Generated in ${duration}ms`);
    logger.info(`   - Sources: ${result.verified_sources_count}`);
    logger.info(`   - Response length: ${result.response?.length || 0} chars`);

    // Return successful response to client
    return res.status(200).json({
      ...result,
      processingTime: duration,
      backend: 'node-ddgs-groq',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Error handling
    logger.error(`❌ JARVIS Error: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      response: 'JARVIS encountered an error while processing your query. Please try again!',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Health check endpoint
 * Verifies if Python backend is accessible
 * 
 * Response:
 * {
 *   "status": "healthy",
 *   "pythonBackend": "online",
 *   "timestamp": "2026-01-27T..."
 * }
 */
async function healthCheck(req, res) {
  try {
    const response = await axios.get(`${PYTHON_BACKEND_URL}/health`, {
      timeout: 5000
    });

    return res.status(200).json({
      status: 'healthy',
      pythonBackend: 'online',
      pythonResponse: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.warn('⚠️ Python Backend Health Check Failed');
    
    return res.status(503).json({
      status: 'unhealthy',
      pythonBackend: 'offline',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Status endpoint
 * Returns current status and configuration
 */
function status(req, res) {
  return res.status(200).json({
    name: 'JARVIS AI Proxy',
    version: '1.0.0',
    status: 'online',
    pythonBackendUrl: PYTHON_BACKEND_URL,
    endpoints: [
      'POST /api/jarvis/ask - Query JARVIS',
      'GET /api/jarvis/health - Health check',
      'GET /api/jarvis/status - Status info'
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * Express route setup
 */
function setupJarvisRoutes(app) {
  // POST - Ask JARVIS
  app.post('/api/jarvis/ask', askJarvis);

  // GET - Health check
  app.get('/api/jarvis/health', healthCheck);

  // GET - Status
  app.get('/api/jarvis/status', status);

  console.log('✅ JARVIS proxy routes initialized');
  console.log(`   Python Backend: ${PYTHON_BACKEND_URL}`);
}

module.exports = {
  setupJarvisRoutes,
  askJarvis,
  healthCheck,
  status,
  PYTHON_BACKEND_URL
};
