// perplexity-endpoint.js
// Perplexity Search Endpoint for Frontend Integration

const { jarvisAutonomousVerifiedSearch } = require('./jarvis-autonomous-rag-verified');

/**
 * Setup Perplexity Search Endpoint
 * @param {Express.Application} app - Express app instance
 */
function setupPerplexityEndpoint(app) {
  app.post('/api/perplexity-search', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: 'Query is required' 
        });
      }

      console.log(`🔍 Perplexity Search Query: ${query}`);

      // Use the autonomous RAG system
      const result = await jarvisAutonomousVerifiedSearch(query);

      // Format response for frontend
      const response = {
        success: true,
        answer: result.answer || result.message || 'No answer generated',
        sources: result.sources || [],
        confidence: result.confidence || 0.8,
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Perplexity Search Error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  });

  console.log('✅ Perplexity Search endpoint loaded!');
}

module.exports = setupPerplexityEndpoint;
