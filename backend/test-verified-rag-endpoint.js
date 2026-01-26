/**
 * Simple test for the Verified RAG endpoint
 * Tests the /omniscient/verified endpoint
 */

const http = require('http');

async function testVerifiedRagEndpoint() {
    console.log('🧪 Testing /omniscient/verified endpoint...\n');

    const query = 'What is the latest AI news in January 2026?';
    const payload = JSON.stringify({
        query: query,
        userProfile: {
            tone: 'friendly',
            depth: 'expert',
            skill: 'intermediate',
            language: 'en'
        }
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/omniscient/verified',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`📊 Response Status: ${res.statusCode}`);
                console.log(`📊 Response Headers:`, res.headers);
                
                try {
                    const parsed = JSON.parse(data);
                    console.log('\n✅ Response JSON:');
                    console.log(JSON.stringify(parsed, null, 2));
                    resolve(parsed);
                } catch (e) {
                    console.log('\n📝 Response (raw):');
                    console.log(data);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request Error:', error.message);
            reject(error);
        });

        console.log(`📤 Sending POST request to /omniscient/verified`);
        console.log(`📝 Payload: ${payload}\n`);
        
        req.write(payload);
        req.end();
    });
}

// Wait a bit for server to be ready, then test
setTimeout(() => {
    testVerifiedRagEndpoint()
        .then(() => {
            console.log('\n✅ Test completed!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('\n❌ Test failed:', err);
            process.exit(1);
        });
}, 2000);
