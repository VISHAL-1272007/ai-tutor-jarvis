const axios = require('axios');

async function run() {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}/ask`;
  const question = 'What are the latest AI policy changes announced in 2026?';

  console.log('🔎 Hitting /ask with a current-events question...');
  console.log('URL:', url);

  try {
    const res = await axios.post(
      url,
      {
        question,
        enableWebSearch: true
      },
      { timeout: 60000 }
    );

    const data = res.data || {};
    console.log('✅ Status:', res.status);
    console.log('verificationUsed:', data.verificationUsed);
    console.log('total news results:', data.searchResults?.news?.total_results || 0);
    console.log('answer preview:', (data.answer || '').slice(0, 240) + '...');
  } catch (err) {
    console.error('❌ Request failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Tip: start the backend first (node index.js).');
    }
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', err.response.data);
    }
  }
}

run();
