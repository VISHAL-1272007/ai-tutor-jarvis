/**
 * DDGS RAG-based Search Endpoint (Replaces Serper + Jina)
 * Uses DuckDuckGo search + BeautifulSoup + Groq synthesis
 */

const { ddgsRagPipeline } = require('./ddgs-rag-integration');

/**
 * Setup DDGS RAG Search endpoints
 */
function setupSearchEndpoints(app) {
  
  // New DDGS endpoint
  app.post('/api/search-ddgs', async (req, res) => {
    try {
      const { query, region = 'in-en' } = req.body;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: 'Query is required' 
        });
      }

      console.log(`🔍 DDGS Search: ${query}`);
      const result = await ddgsRagPipeline(query, region);
      res.json(result);

    } catch (error) {
      console.error(`❌ Search Error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message || 'Search failed'
      });
    }
  });

  // Backward compatible perplexity endpoint (now uses DDGS)
  app.post('/api/perplexity-search', async (req, res) => {
    try {
      const { query, region = 'in-en' } = req.body;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: 'Query is required' 
        });
      }

      console.log(`🔍 Perplexity Search (DDGS RAG): ${query}`);

      const result = await ddgsRagPipeline(query, region);

      if (result.success) {
        res.json({
          success: true,
          answer: result.answer,
          sources: result.sources,
          confidence: 0.85,
          timestamp: result.timestamp
        });
      } else {
        res.status(500).json(result);
      }

    } catch (error) {
      console.error('❌ Perplexity Search Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Perplexity search failed'
      });
    }
  });

  console.log('✅ DDGS RAG Search endpoints loaded!');
  console.log('   📡 /api/search-ddgs (new DDGS endpoint)');
  console.log('   📡 /api/perplexity-search (compatible via DDGS)');
}

module.exports = setupSearchEndpoints;
