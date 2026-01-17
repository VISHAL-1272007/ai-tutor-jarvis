// Clean Wolfram Alpha API Handler using Axios
// Purpose: Fetch Full Result API data and extract primary answer for JARVIS
// AppID: X3ALYR52E9

const axios = require('axios');

// Configuration
const WOLFRAM_CONFIG = {
  appId: 'X3ALYR52E9',
  baseUrl: 'https://api.wolframalpha.com/v2/query',
  timeout: 10000
};

/**
 * Query Wolfram Alpha and extract primary result
 * @param {string} query - The question/query to send to Wolfram Alpha
 * @returns {Promise<Object>} - { success: boolean, answer: string, pod: string, timestamp: string }
 */
async function queryWolframAlpha(query) {
  try {
    console.log(`🔍 Querying Wolfram Alpha: "${query}"`);

    // Make API request
    const response = await axios.get(WOLFRAM_CONFIG.baseUrl, {
      params: {
        input: query,
        appid: WOLFRAM_CONFIG.appId,
        output: 'json',
        format: 'plaintext'
      },
      timeout: WOLFRAM_CONFIG.timeout
    });

    // Check if query was successful
    if (!response.data.queryresult.success) {
      console.log('⚠️ Wolfram Alpha: No results found');
      return {
        success: false,
        answer: null,
        pod: null,
        timestamp: new Date().toISOString()
      };
    }

    // Extract the primary answer from pods
    const answer = extractPrimaryAnswer(response.data.queryresult);

    if (!answer) {
      console.log('⚠️ Wolfram Alpha: Could not extract answer');
      return {
        success: false,
        answer: null,
        pod: null,
        timestamp: new Date().toISOString()
      };
    }

    console.log('✅ Answer extracted successfully');
    return {
      success: true,
      answer: answer.text,
      pod: answer.pod,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Wolfram Alpha Error:', error.message);
    return {
      success: false,
      answer: null,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Extract primary answer from Wolfram Alpha response
 * Prioritizes: Result pod > Primary pod > First pod with plaintext
 * @param {Object} queryresult - The queryresult object from Wolfram Alpha
 * @returns {Object|null} - { text: string, pod: string } or null
 */
function extractPrimaryAnswer(queryresult) {
  if (!queryresult.pods || !Array.isArray(queryresult.pods)) {
    return null;
  }

  // 1. Try to find "Result" pod first
  let resultPod = queryresult.pods.find(pod => pod.id === 'Result');
  if (resultPod && resultPod.subpods && resultPod.subpods[0]) {
    const plaintext = resultPod.subpods[0].plaintext;
    if (plaintext) {
      return {
        text: plaintext.trim(),
        pod: 'Result'
      };
    }
  }

  // 2. Try to find "Primary" pod second
  let primaryPod = queryresult.pods.find(pod => pod.primary === true);
  if (primaryPod && primaryPod.subpods && primaryPod.subpods[0]) {
    const plaintext = primaryPod.subpods[0].plaintext;
    if (plaintext) {
      return {
        text: plaintext.trim(),
        pod: primaryPod.title || 'Primary'
      };
    }
  }

  // 3. Fall back to first pod with plaintext
  for (let pod of queryresult.pods) {
    if (pod.subpods && pod.subpods[0]) {
      const plaintext = pod.subpods[0].plaintext;
      if (plaintext) {
        return {
          text: plaintext.trim(),
          pod: pod.title || 'Result'
        };
      }
    }
  }

  return null;
}

/**
 * Simple wrapper for direct JARVIS responses
 * @param {string} query - User's question
 * @returns {Promise<string>} - Direct answer text or error message
 */
async function getDirectAnswer(query) {
  const result = await queryWolframAlpha(query);
  
  if (result.success && result.answer) {
    return result.answer;
  } else {
    return `Sorry, I couldn't find an answer for "${query}"`;
  }
}

// Export functions
module.exports = {
  queryWolframAlpha,
  extractPrimaryAnswer,
  getDirectAnswer,
  WOLFRAM_CONFIG
};

// Test if run directly
if (require.main === module) {
  (async () => {
    console.log('🧪 Testing Wolfram Alpha Integration\n');

    // Test queries
    const testQueries = [
      '2+2',
      'solve x^2 - 5x + 6 = 0',
      'capital of France',
      'derivative of x^3',
      '100 miles to kilometers',
      'what is photosynthesis'
    ];

    for (const query of testQueries) {
      const result = await queryWolframAlpha(query);
      
      if (result.success) {
        console.log(`\n📝 Query: "${query}"`);
        console.log(`💡 Answer: ${result.answer}`);
        console.log(`📍 Pod: ${result.pod}`);
      } else {
        console.log(`\n📝 Query: "${query}"`);
        console.log(`❌ No answer found`);
      }
    }
  })();
}
