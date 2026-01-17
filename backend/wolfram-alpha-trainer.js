// Wolfram Alpha Integration for JARVIS
// Purpose: Use Wolfram Alpha API for computational knowledge, facts, and advanced queries
// Updates: Real-time API queries + daily knowledge updates

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Wolfram Alpha Configuration
const WOLFRAM_CONFIG = {
  apiKey: process.env.WOLFRAM_ALPHA_API_KEY || '',
  baseUrl: 'https://api.wolframalpha.com/v2/query',
  shortAnswerUrl: 'https://api.wolframalpha.com/v1/result',
  fullResultUrl: 'https://api.wolframalpha.com/v2/query',
  dataFile: path.join(__dirname, '../data/wolfram_knowledge.json'),
  cacheFolder: path.join(__dirname, '../data/wolfram_cache'),
  maxStoredDays: 30,
};

// Initialize Wolfram Alpha storage
const initializeWolframStorage = () => {
  const dataDir = path.dirname(WOLFRAM_CONFIG.dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(WOLFRAM_CONFIG.cacheFolder)) {
    fs.mkdirSync(WOLFRAM_CONFIG.cacheFolder, { recursive: true });
  }

  if (!fs.existsSync(WOLFRAM_CONFIG.dataFile)) {
    const initialData = {
      lastUpdate: null,
      queries: [],
      knowledgeCache: [],
      queryCount: 0,
      categories: {
        math: 0,
        science: 0,
        facts: 0,
        conversions: 0,
        definitions: 0,
        other: 0
      }
    };
    fs.writeFileSync(WOLFRAM_CONFIG.dataFile, JSON.stringify(initialData, null, 2));
    console.log('✅ Wolfram Alpha knowledge base initialized');
  }
};

// Get short answer from Wolfram Alpha
const getShortAnswer = async (query) => {
  try {
    if (!WOLFRAM_CONFIG.apiKey || WOLFRAM_CONFIG.apiKey === '') {
      return null;
    }

    const response = await axios.get(WOLFRAM_CONFIG.shortAnswerUrl, {
      params: {
        i: query,
        appid: WOLFRAM_CONFIG.apiKey
      },
      timeout: 10000
    });

    return response.data || null;

  } catch (error) {
    console.error('⚠️ Wolfram Alpha short answer error:', error.message);
    return null;
  }
};

// Get detailed result from Wolfram Alpha
const getDetailedResult = async (query) => {
  try {
    if (!WOLFRAM_CONFIG.apiKey || WOLFRAM_CONFIG.apiKey === '') {
      return null;
    }

    const response = await axios.get(WOLFRAM_CONFIG.fullResultUrl, {
      params: {
        input: query,
        appid: WOLFRAM_CONFIG.apiKey,
        output: 'json',
        format: 'plaintext'
      },
      timeout: 10000
    });

    if (response.data && response.data.queryresult) {
      return response.data.queryresult;
    }

    return null;

  } catch (error) {
    console.error('⚠️ Wolfram Alpha detailed query error:', error.message);
    return null;
  }
};

// Query Wolfram Alpha and cache result
const queryWolframAlpha = async (query) => {
  try {
    console.log(`🔍 Querying Wolfram Alpha for: "${query.substring(0, 50)}..."`);

    // Try short answer first
    const shortAnswer = await getShortAnswer(query);
    if (shortAnswer && shortAnswer.trim()) {
      console.log('✅ Got short answer from Wolfram Alpha');
      return {
        success: true,
        answer: shortAnswer,
        type: 'short',
        timestamp: new Date().toISOString(),
        source: 'Wolfram Alpha'
      };
    }

    // Try detailed result
    const detailedResult = await getDetailedResult(query);
    if (detailedResult && detailedResult.success) {
      let resultText = '';

      // Extract pods (answer sections)
      if (detailedResult.pods && Array.isArray(detailedResult.pods)) {
        const mainPod = detailedResult.pods[0];
        if (mainPod && mainPod.subpods && mainPod.subpods[0]) {
          const plaintext = mainPod.subpods[0].plaintext;
          if (plaintext) {
            resultText = plaintext;
          }
        }
      }

      if (resultText) {
        console.log('✅ Got detailed result from Wolfram Alpha');
        return {
          success: true,
          answer: resultText,
          type: 'detailed',
          timestamp: new Date().toISOString(),
          source: 'Wolfram Alpha'
        };
      }
    }

    console.log('⚠️ Wolfram Alpha returned no results');
    return {
      success: false,
      answer: null,
      type: 'none',
      timestamp: new Date().toISOString(),
      source: 'Wolfram Alpha'
    };

  } catch (error) {
    console.error('❌ Wolfram Alpha query error:', error.message);
    return {
      success: false,
      answer: null,
      error: error.message,
      timestamp: new Date().toISOString(),
      source: 'Wolfram Alpha'
    };
  }
};

// Save query to knowledge base
const saveToKnowledgeBase = (query, result) => {
  try {
    const currentData = JSON.parse(fs.readFileSync(WOLFRAM_CONFIG.dataFile, 'utf8'));

    // Add to queries
    if (result.success && result.answer) {
      currentData.queries.unshift({
        query: query,
        answer: result.answer,
        type: result.type,
        timestamp: result.timestamp,
        source: 'Wolfram Alpha'
      });

      // Keep only last 500 queries
      currentData.queries = currentData.queries.slice(0, 500);

      // Update category statistics
      const category = categorizeQuery(query);
      if (currentData.categories[category]) {
        currentData.categories[category]++;
      } else {
        currentData.categories['other']++;
      }

      currentData.queryCount = (currentData.queryCount || 0) + 1;
      currentData.lastUpdate = new Date().toISOString();

      // Save updated file
      fs.writeFileSync(WOLFRAM_CONFIG.dataFile, JSON.stringify(currentData, null, 2));
      return currentData;
    }

  } catch (error) {
    console.error('❌ Error saving to knowledge base:', error.message);
  }

  return null;
};

// Categorize query type
const categorizeQuery = (query) => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.match(/^(solve|calculate|derivative|integral|integrate|differentiate|limit|sum)/)) {
    return 'math';
  }
  if (lowerQuery.match(/(physics|chemistry|biology|quantum|atom|element|reaction|force|energy)/)) {
    return 'science';
  }
  if (lowerQuery.match(/(convert|=|\s(to|in|as)\s)/)) {
    return 'conversions';
  }
  if (lowerQuery.match(/(define|definition|meaning|what is)/)) {
    return 'definitions';
  }
  if (lowerQuery.match(/(who|when|where|how|fact|population|capital|history)/)) {
    return 'facts';
  }

  return 'other';
};

// Get cached knowledge
const getCachedKnowledge = (query) => {
  try {
    const data = JSON.parse(fs.readFileSync(WOLFRAM_CONFIG.dataFile, 'utf8'));
    
    // Search in queries
    const cached = data.queries.find(q => 
      q.query.toLowerCase() === query.toLowerCase()
    );

    if (cached) {
      console.log('✅ Found in Wolfram knowledge cache');
      return cached;
    }

    return null;

  } catch (error) {
    return null;
  }
};

// Smart query handler - uses cache first, then API
const smartWolframQuery = async (query) => {
  try {
    // Check cache first
    const cached = getCachedKnowledge(query);
    if (cached) {
      return {
        success: true,
        answer: cached.answer,
        source: 'Wolfram Alpha (Cached)',
        cached: true,
        timestamp: cached.timestamp
      };
    }

    // Query API
    const result = await queryWolframAlpha(query);

    // Save to knowledge base if successful
    if (result.success) {
      saveToKnowledgeBase(query, result);
    }

    return result;

  } catch (error) {
    console.error('❌ Smart Wolfram query error:', error.message);
    return {
      success: false,
      answer: null,
      error: error.message
    };
  }
};

// Get knowledge base statistics
const getWolframStats = () => {
  try {
    const data = JSON.parse(fs.readFileSync(WOLFRAM_CONFIG.dataFile, 'utf8'));

    return {
      totalQueries: data.queryCount || 0,
      cachedResults: data.queries.length,
      lastUpdate: data.lastUpdate,
      categories: data.categories,
      oldestQuery: data.queries[data.queries.length - 1]?.timestamp,
      newestQuery: data.queries[0]?.timestamp
    };

  } catch (error) {
    return null;
  }
};

// Get recent knowledge for training
const getRecentKnowledge = (count = 10) => {
  try {
    const data = JSON.parse(fs.readFileSync(WOLFRAM_CONFIG.dataFile, 'utf8'));
    
    const recent = data.queries.slice(0, count);
    
    return recent.map(q => ({
      query: q.query,
      answer: q.answer,
      category: categorizeQuery(q.query)
    }));

  } catch (error) {
    return [];
  }
};

// Initialize on module load
initializeWolframStorage();

// Module exports
module.exports = {
  initializeWolframStorage,
  queryWolframAlpha,
  getShortAnswer,
  getDetailedResult,
  smartWolframQuery,
  saveToKnowledgeBase,
  getCachedKnowledge,
  getWolframStats,
  getRecentKnowledge,
  categorizeQuery,
  WOLFRAM_CONFIG
};

// If run directly
if (require.main === module) {
  initializeWolframStorage();
  console.log('✅ Wolfram Alpha trainer module loaded');

  // Show stats every 5 minutes
  setInterval(() => {
    const stats = getWolframStats();
    if (stats && stats.totalQueries > 0) {
      console.log('📊 Wolfram Alpha knowledge base:');
      console.log(`   Total queries: ${stats.totalQueries}`);
      console.log(`   Cached results: ${stats.cachedResults}`);
      console.log(`   Last update: ${stats.lastUpdate}`);
      console.log(`   Categories:`, stats.categories);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}
