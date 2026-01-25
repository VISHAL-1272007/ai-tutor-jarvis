const axios = require('axios');

async function testVerification() {
    try {
        console.log('🧪 Testing DuckDuckGo verification integration...');

        // Test with a question that might have low similarity in initial response
        console.log('📡 Making request to http://localhost:3000/ask...');
        const response = await axios.post('http://localhost:3000/ask', {
            question: 'What is the latest news about quantum computing breakthroughs?',
            enableWebSearch: true
        }, {
            timeout: 60000 // 60 second timeout
        });

        console.log('✅ Response received');
        console.log('Verification used:', response.data.verificationUsed);
        console.log('API used:', response.data.expertMode);
        console.log('Answer preview:', response.data.answer.substring(0, 200) + '...');

        if (response.data.searchResults) {
            console.log('Search results found:', {
                news: response.data.searchResults.news?.total_results || 0,
                web: response.data.searchResults.web?.total_results || 0
            });
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received. Request details:', error.request);
        }
    }
}

testVerification();