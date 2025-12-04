// Keep Render service awake by pinging every 14 minutes
const axios = require('axios');

const BACKEND_URL = 'https://ai-tutor-jarvis.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

async function pingBackend() {
    try {
        const response = await axios.get(BACKEND_URL);
        console.log(`✅ Ping successful at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.log(`⚠️ Ping failed at ${new Date().toLocaleTimeString()}: ${error.message}`);
    }
}

// Ping immediately
pingBackend();

// Ping every 14 minutes
setInterval(pingBackend, PING_INTERVAL);

console.log(`🔔 Keep-alive service started. Pinging ${BACKEND_URL} every 14 minutes.`);
