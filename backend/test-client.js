#!/usr/bin/env node

/**
 * JARVIS AI Backend - Test Client
 * Quick testing tool for the Gemini backend
 * 
 * Usage:
 * node test-client.js
 * 
 * Or use the interactive mode:
 * npm run test:interactive
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-' + Date.now();

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║        🤖 JARVIS AI BACKEND - TEST CLIENT 🤖            ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log(`📍 Backend URL: ${BACKEND_URL}`);
console.log(`👤 Test User ID: ${TEST_USER_ID}`);
console.log('\n');

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BACKEND_URL + path);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'JARVIS-Test-Client/1.0'
            }
        };

        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

/**
 * Test health endpoint
 */
async function testHealth() {
    console.log('📊 Testing Health Endpoint...');
    try {
        const res = await makeRequest('GET', '/health');
        console.log(`   ✅ Status: ${res.status}`);
        console.log(`   ✅ Server Status: ${res.body.status}`);
        console.log(`   ✅ Uptime: ${res.body.uptime} seconds`);
        console.log(`   ✅ Active Sessions: ${res.body.sessions}\n`);
        return true;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return false;
    }
}

/**
 * Test chat endpoint
 */
async function testChat() {
    console.log('💬 Testing Chat Endpoint...');
    
    const testMessages = [
        'Hello Jarvis! How are you?',
        'What is DSA?',
        'Help me with binary search'
    ];

    for (const message of testMessages) {
        try {
            const res = await makeRequest('POST', '/chat', {
                userId: TEST_USER_ID,
                message: message
            });

            if (res.status === 200 && res.body.success) {
                console.log(`   📨 Message: "${message}"`);
                console.log(`   💬 Response: ${res.body.data.message.substring(0, 100)}...`);
                console.log(`   ⏱️  Processing Time: ${res.body.processingTime}`);
                console.log(`   📊 Message Count: ${res.body.data.messageCount}\n`);
            } else {
                console.log(`   ❌ Error: ${res.body.error}\n`);
                return false;
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
            return false;
        }
    }
    return true;
}

/**
 * Test history endpoint
 */
async function testHistory() {
    console.log('📜 Testing History Endpoint...');
    try {
        const res = await makeRequest('GET', `/history/${TEST_USER_ID}`);
        
        if (res.status === 200 && res.body.success) {
            console.log(`   ✅ User ID: ${res.body.data.userId}`);
            console.log(`   ✅ Total Messages: ${res.body.data.messageCount}`);
            console.log(`   ✅ History Length: ${res.body.data.history.length}`);
            console.log(`   ✅ Created At: ${res.body.data.createdAt}`);
            console.log(`   ✅ Last Activity: ${res.body.data.lastActivity}\n`);
            return true;
        } else {
            console.log(`   ❌ Error: ${res.body.error}\n`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return false;
    }
}

/**
 * Test admin sessions endpoint
 */
async function testAdminSessions() {
    console.log('👨‍💼 Testing Admin Sessions Endpoint...');
    try {
        const res = await makeRequest('GET', '/admin/sessions');
        
        if (res.status === 200 && res.body.success) {
            console.log(`   ✅ Total Sessions: ${res.body.data.totalSessions}`);
            if (res.body.data.sessions.length > 0) {
                console.log(`   ✅ Sessions:`);
                res.body.data.sessions.forEach(s => {
                    console.log(`      - User: ${s.userId}, Messages: ${s.messageCount}`);
                });
            }
            console.log();
            return true;
        } else {
            console.log(`   ❌ Error: ${res.body.error}\n`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return false;
    }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
    console.log('⚠️  Testing Error Handling...');
    
    // Test missing userId
    try {
        const res = await makeRequest('POST', '/chat', {
            message: 'Hello'
        });
        if (res.status === 400) {
            console.log(`   ✅ Missing userId - Correctly rejected with 400`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test empty message
    try {
        const res = await makeRequest('POST', '/chat', {
            userId: TEST_USER_ID,
            message: ''
        });
        if (res.status === 400) {
            console.log(`   ✅ Empty message - Correctly rejected with 400`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test non-existent route
    try {
        const res = await makeRequest('GET', '/nonexistent');
        if (res.status === 404) {
            console.log(`   ✅ Non-existent route - Correctly rejected with 404`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log();
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Starting Tests...\n');

    const tests = [
        { name: 'Health Check', fn: testHealth },
        { name: 'Chat', fn: testChat },
        { name: 'History', fn: testHistory },
        { name: 'Admin Sessions', fn: testAdminSessions },
        { name: 'Error Handling', fn: testErrorHandling }
    ];

    const results = [];

    for (const test of tests) {
        const result = await test.fn();
        results.push({ name: test.name, passed: result });
    }

    // Summary
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ TEST SUMMARY                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    results.forEach(r => {
        console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
    });

    console.log(`\n📊 Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('\n🎉 All tests passed! Backend is working correctly.\n');
    } else {
        console.log('\n⚠️  Some tests failed. Check your configuration.\n');
    }
}

/**
 * Interactive mode
 */
async function interactiveMode() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('💬 Interactive Chat Mode');
    console.log('📝 Type your message (or "exit" to quit):\n');

    const askQuestion = () => {
        rl.question('You: ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log('\nGoodbye! 👋\n');
                rl.close();
                return;
            }

            try {
                const res = await makeRequest('POST', '/chat', {
                    userId: TEST_USER_ID,
                    message: input
                });

                if (res.body.success) {
                    console.log(`\nJarvis: ${res.body.data.message}\n`);
                } else {
                    console.log(`\nError: ${res.body.error}\n`);
                }
            } catch (error) {
                console.log(`\nConnection Error: ${error.message}\n`);
            }

            askQuestion();
        });
    };

    askQuestion();
}

// Run tests or interactive mode based on arguments
const args = process.argv.slice(2);

if (args.includes('--interactive')) {
    interactiveMode();
} else {
    runAllTests().catch(console.error);
}
