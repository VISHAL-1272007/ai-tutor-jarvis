/**
 * DDGS Search Integration Endpoint for Node.js Backend
 * Bridges frontend → Python DDGS service → Groq synthesis
 */

const axios = require('axios');

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5002';

/**
 * Complete RAG flow: Search → Verify → Synthesize
 */
async function ddgsRagPipeline(query, region = 'in-en') {
    try {
        console.log(`🔄 DDGS RAG Pipeline: ${query}`);

        // Step 1: DDGS Search + Extract
        console.log('📌 Step 1: Searching with DDGS...');
        const searchResponse = await axios.post(`${PYTHON_BACKEND_URL}/api/ddgs-search`, {
            query,
            region,
            max_results: 5
        }, { timeout: 30000 });

        const {
            results,
            context,
            verified_count,
            total_results
        } = searchResponse.data;

        if (!results || results.length === 0) {
            return {
                success: false,
                error: 'No search results found',
                query
            };
        }

        console.log(`✅ Found ${verified_count}/${total_results} relevant results`);

        // Step 2: Groq Synthesis
        console.log('🧠 Step 2: Synthesizing with Groq...');
        const synthesisResponse = await axios.post(`${PYTHON_BACKEND_URL}/api/groq-synthesis`, {
            query,
            context,
            results
        }, { timeout: 30000 });

        const { answer, sources } = synthesisResponse.data;

        console.log('✅ Synthesis complete');

        return {
            success: true,
            query,
            answer,
            sources: sources || results.slice(0, 3),
            verified_count,
            total_results,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`❌ RAG Pipeline Error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            query
        };
    }
}

module.exports = { ddgsRagPipeline };
