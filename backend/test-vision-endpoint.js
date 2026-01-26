#!/usr/bin/env node

/**
 * Test script for /api/analyze-media endpoint
 * Run: node test-vision-endpoint.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function testVisionEndpoint() {
    console.log('🧪 Testing /api/analyze-media endpoint...\n');

    try {
        // Test 1: Status check
        console.log('📊 [TEST 1] Checking endpoint status...');
        const statusRes = await axios.get(`${BASE_URL}/api/analyze-media/status`);
        console.log('✅ Status:', statusRes.data.status);
        console.log('✅ Model:', statusRes.data.model);
        console.log('✅ Features:', statusRes.data.features.join(', '));
        console.log();

        // Test 2: Analyze image from URL
        console.log('🖼️ [TEST 2] Analyzing image from URL...');
        const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg';
        
        const urlTest = await axios.post(`${BASE_URL}/api/analyze-media`, {
            imageUrl,
            query: 'What is in this image?'
        });

        console.log('✅ Vision Analysis Success!');
        console.log('📝 Summary:', urlTest.data.vision_analysis.summary);
        console.log('🔤 Detected Text:', urlTest.data.vision_analysis.detected_text || 'None');
        console.log('🏷️ Entities:', urlTest.data.vision_analysis.technical_entities.join(', '));
        console.log('📚 Related Docs:', urlTest.data.knowledge_base.related_documents.length);
        console.log('⏱️ Processing Time:', urlTest.data.metadata.processing_time_ms, 'ms');
        console.log();

        // Test 3: Test with base64 (sample image)
        console.log('📝 [TEST 3] Testing base64 input...');
        // Create a small test image (1x1 red pixel PNG)
        const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
        
        const base64Test = await axios.post(`${BASE_URL}/api/analyze-media`, {
            base64Data: testBase64,
            mimeType: 'image/png',
            query: 'What color is this?'
        });

        console.log('✅ Base64 Analysis Success!');
        console.log('📝 Summary:', base64Test.data.vision_analysis.summary);
        console.log();

        // Test 4: Error handling - invalid input
        console.log('❌ [TEST 4] Testing error handling (no input)...');
        try {
            await axios.post(`${BASE_URL}/api/analyze-media`, {
                query: 'What is this?'
            });
            console.log('❌ Should have failed!');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Correctly rejected invalid input');
                console.log('   Error:', err.response.data.error);
            } else {
                console.log('❌ Unexpected error:', err.message);
            }
        }
        console.log();

        // Test 5: Error handling - unsupported MIME type
        console.log('❌ [TEST 5] Testing MIME type validation...');
        try {
            await axios.post(`${BASE_URL}/api/analyze-media`, {
                base64Data: testBase64,
                mimeType: 'application/json',  // Invalid
                query: 'What is this?'
            });
            console.log('❌ Should have failed!');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Correctly rejected invalid MIME type');
                console.log('   Error:', err.response.data.error);
            } else {
                console.log('❌ Unexpected error:', err.message);
            }
        }
        console.log();

        console.log('✨ All tests completed!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to server at', BASE_URL);
            console.error('   Make sure the backend is running: npm start');
        } else if (error.response) {
            console.error('❌ Error:', error.response.status);
            console.error('   Message:', error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

testVisionEndpoint();
