const axios = require('axios');

async function testSemanticVerification() {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}/ask`;

  console.log('🧪 Testing Semantic Verification Layer...\n');

  // Test with a current events question that might have outdated info
  const question = 'What are the latest AI regulations announced in 2026?';
  console.log(`Question: "${question}"\n`);

  try {
    const res = await axios.post(
      url,
      { question, enableWebSearch: true },
      { timeout: 180000 }
    );

    const data = res.data || {};
    
    console.log('✅ Response received\n');
    console.log('=== VERIFICATION RESULTS ===');
    console.log('Verification Used:', data.verificationUsed);
    console.log('Search Results:', data.searchResults?.total_results || 0, 'news articles');
    
    if (data.semanticVerification) {
      console.log('\n=== SEMANTIC VERIFICATION ===');
      console.log('Similarity Score:', (data.semanticVerification.similarity_score * 100).toFixed(1) + '%');
      console.log('Is Verified:', data.semanticVerification.is_verified);
      console.log('Verdict:', data.semanticVerification.verdict);
      console.log('Threshold:', data.semanticVerification.threshold);
    }
    
    console.log('\n=== ANSWER PREVIEW ===');
    console.log(data.answer.substring(0, 500) + '...\n');
    
    // Check if verification badge is present
    if (data.answer.includes('✅ **Verified with Live Data**')) {
      console.log('✅ Answer verified with high similarity');
    } else if (data.answer.includes('⚠️ **Potentially Outdated**')) {
      console.log('⚠️ Answer flagged as potentially outdated - live sources provided');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Start the backend first with: node index.js');
    }
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Error:', err.response.data);
    }
  }
}

testSemanticVerification();
