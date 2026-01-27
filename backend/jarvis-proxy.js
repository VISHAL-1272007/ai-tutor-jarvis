/**
 * JARVIS AI Proxy Middleware
 * Routes user queries from Node.js Express to Python Flask backend
 * Provides integration layer between frontend and Python ML services
 */

const axios = require('axios');
const logger = require('./logger'); // Assuming you have a logger module

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:3000';

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
 * Main endpoint that proxies queries to Python Flask backend
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

    // Forward to Python backend with timeout
    const startTime = Date.now();
    
    const pythonResponse = await axios.post(
      `${PYTHON_BACKEND_URL}/ask-jarvis`,
      { query: query.trim() },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'JARVIS-Node-Proxy/1.0'
        },
        timeout: 120000 // 120 second timeout for web scraping + LLM
      }
    );

    const duration = Date.now() - startTime;

    // Log successful response
    logger.info(`✅ JARVIS Response Generated in ${duration}ms`);
    logger.info(`   - Sources: ${pythonResponse.data.verified_sources_count}`);
    logger.info(`   - Context: ${pythonResponse.data.context_length} chars`);

    // Return successful response to client
    return res.status(200).json({
      ...pythonResponse.data,
      processingTime: duration,
      backend: 'python-flask',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Specific error handling
    if (error.code === 'ECONNREFUSED') {
      logger.error('❌ Python Backend Connection Refused - Server may be offline');
      return res.status(503).json({
        success: false,
        error: 'Python backend is not responding',
        response: 'JARVIS research engine is currently offline. Please start the Python backend at port 3000.',
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'ENOTFOUND') {
      logger.error('❌ Python Backend Not Found - Host resolution failed');
      return res.status(503).json({
        success: false,
        error: 'Python backend host not found',
        response: 'Cannot connect to JARVIS research engine. Check the backend URL.',
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      logger.error('❌ Python Backend Timeout - Request took too long');
      return res.status(504).json({
        success: false,
        error: 'Backend request timeout',
        response: 'JARVIS is thinking too long! The research engine might be overwhelmed. Try again shortly.',
        timestamp: new Date().toISOString()
      });
    }

    // Generic error handling
    return handleError(error, res);
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
