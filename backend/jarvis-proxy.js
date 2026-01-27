/**
 * JARVIS AI Proxy Middleware
 * Routes queries to Python Flask backend for DDGS + Groq synthesis
 */

const axios = require('axios');
const logger = require('./logger');

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'https://jarvis-python-ml-service.onrender.com';

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
 * Routes to Python Flask backend for DDGS search + Groq synthesis
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

    logger.info(`🤖 JARVIS Query: "${query.substring(0, 100)}..."`);

    // Forward to Python Flask backend
    const startTime = Date.now();
    
    const pythonResponse = await axios.post(
      `${PYTHON_BACKEND_URL}/api/jarvis/ask`,
      { query: query.trim() },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'JARVIS-Node-Proxy/2.0'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    const duration = Date.now() - startTime;

    logger.info(`✅ Response in ${duration}ms`);
    logger.info(`   Sources: ${pythonResponse.data.verified_sources_count || 0}`);

    // Return Python backend response
    return res.status(200).json({
      ...pythonResponse.data,
      processingTime: duration,
      backend: 'python-flask-ddgs-groq',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`❌ JARVIS Error: ${error.message}`);
    
    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: 'Python backend unavailable',
        response: 'JARVIS research engine is offline. Please check the Python backend.',
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        response: 'JARVIS is taking too long. Please try again.',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      response: 'JARVIS encountered an error. Please try again!',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Health check - verify Python backend connectivity
 */
async function healthCheck(req, res) {
  try {
    const response = await axios.get(`${PYTHON_BACKEND_URL}/health`, {
      timeout: 5000
    });

    return res.status(200).json({
      status: 'healthy',
      pythonBackend: 'online',
      pythonBackendUrl: PYTHON_BACKEND_URL,
      pythonResponse: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.warn('⚠️ Python Backend Health Check Failed');
    
    return res.status(503).json({
      status: 'unhealthy',
      pythonBackend: 'offline',
      pythonBackendUrl: PYTHON_BACKEND_URL,
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
  app.post('/api/jarvis/ask', askJarvis);
  app.get('/api/jarvis/health', healthCheck);
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
