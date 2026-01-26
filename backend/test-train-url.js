#!/usr/bin/env node

/**
 * Test the /api/train-url endpoint
 * Run: node test-train-url.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testTrainUrl() {
    try {
        console.log('🧪 Testing /api/train-url endpoint...\n');

        // Test 1: Status endpoint
        console.log('📊 [TEST 1] Checking endpoint status...');
        const statusRes = await axios.get(`${BASE_URL}/api/train-url/status`);
        console.log('✅ Status:', statusRes.data.status);
        console.log('✅ Model:', statusRes.data.models.verification);
        console.log('✅ Storage:', statusRes.data.storage.local);
        console.log();

        // Test 2: Train from a valid URL
        console.log('🧠 [TEST 2] Training from URL...');
        const testUrl = 'https://en.wikipedia.org/wiki/Artificial_intelligence';
        console.log(`📥 Training URL: ${testUrl}`);

        const trainRes = await axios.post(`${BASE_URL}/api/train-url`, {
            url: testUrl
        });

        console.log('✅ Training Success!');
        console.log('📝 Message:', trainRes.data.message);
        console.log('📋 Summary:', JSON.stringify(trainRes.data.summary, null, 2));
        console.log();

        // Test 3: Invalid URL
        console.log('❌ [TEST 3] Testing invalid URL handling...');
        try {
            await axios.post(`${BASE_URL}/api/train-url`, {
                url: 'not-a-valid-url'
            });
            console.log('❌ Should have failed!');
        } catch (err) {
            console.log('✅ Correctly rejected invalid URL');
            console.log('   Error:', err.response.data.error);
        }
        console.log();

        // Test 4: Missing URL
        console.log('❌ [TEST 4] Testing missing URL handling...');
        try {
            await axios.post(`${BASE_URL}/api/train-url`, {});
            console.log('❌ Should have failed!');
        } catch (err) {
            console.log('✅ Correctly rejected missing URL');
            console.log('   Error:', err.response.data.error);
        }
        console.log();

        console.log('✨ All tests completed!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to server at', BASE_URL);
            console.error('   Make sure the backend is running: npm start');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

testTrainUrl();
