/**
 * JARVIS Training Routes
 * Endpoints for teaching JARVIS new knowledge from URLs
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const { verifierGroq } = require('./jarvis-autonomous-rag-verified');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const router = require('express').Router();

// Initialize knowledge base directory
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '../data/knowledge_base');
const pinecone = require('./pinecone-integration');

/**
 * Ensure knowledge base directory exists
 */
async function ensureKnowledgeBaseDir() {
    try {
        await fs.mkdir(KNOWLEDGE_BASE_DIR, { recursive: true });
    } catch (err) {
        console.warn(`⚠️ Could not create knowledge base directory: ${err.message}`);
    }
}

/**
 * Fetch and clean content from URL using Jina Reader
 */
async function fetchContentFromUrl(url) {
    const jinaReaderUrl = process.env.JINA_READER_BASE_URL || 'https://r.jina.ai/';
    const jinaApiKey = process.env.JINA_API_KEY;

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        if (jinaApiKey) {
            headers['Authorization'] = `Bearer ${jinaApiKey}`;
        }

        const response = await axios.get(`${jinaReaderUrl}${url}`, {
            headers,
            timeout: 15000
        });

        if (!response.data || typeof response.data !== 'string') {
            throw new Error('Empty or invalid content received');
        }

        return response.data;
    } catch (err) {
        throw new Error(`Failed to fetch URL content: ${err.message}`);
    }
}

/**
 * Create structured summary using Llama 4 Maverick
 */
async function createSummary(content, url) {
    try {
        const prompt = `You are a knowledge extraction expert. Analyze the following content and create a structured summary in JSON format with these fields:
- title: The main topic/title
- summary: A 2-3 sentence concise summary
- key_points: Array of 3-5 key points
- topics: Array of relevant topics/tags
- source_url: The URL where this was found
- timestamp: Current date

Content to analyze:
${content.substring(0, 8000)}`;

        const response = await verifierGroq.chat.completions.create({
            model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
            temperature: 0.3,
            max_tokens: 1000,
            messages: [
                {
                    role: 'system',
                    content: 'You are a knowledge extraction expert. Extract and structure key information from content. Always respond with valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const summaryText = response.choices?.[0]?.message?.content || '';
        
        // Try to parse as JSON, otherwise create structured object
        let structured;
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
            structured = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                title: 'Unknown',
                summary: summaryText.substring(0, 300),
                key_points: [],
                topics: [],
                source_url: url,
                timestamp: new Date().toISOString()
            };
        } catch (parseErr) {
            structured = {
                title: 'Unknown',
                summary: summaryText.substring(0, 300),
                key_points: [],
                topics: [],
                source_url: url,
                timestamp: new Date().toISOString()
            };
        }

        return structured;
    } catch (err) {
        throw new Error(`Failed to create summary: ${err.message}`);
    }
}

/**
 * Save summary to knowledge base and Pinecone
 */
async function saveSummary(summary) {
    try {
        // Ensure directory exists
        await ensureKnowledgeBaseDir();

        // Save to local knowledge base as JSON
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.json`;
        const filepath = path.join(KNOWLEDGE_BASE_DIR, filename);
        
        await fs.writeFile(filepath, JSON.stringify(summary, null, 2));
        console.log(`✅ Saved summary to local knowledge base: ${filepath}`);

        // Also save to Pinecone for semantic search
        if (pinecone) {
            try {
                const vectors = [
                    {
                        id: `knowledge-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                        text: `${summary.title}: ${summary.summary}`,
                        metadata: {
                            title: summary.title,
                            source: summary.source_url,
                            topics: summary.topics ? summary.topics.join(',') : '',
                            type: 'trained_url',
                            timestamp: summary.timestamp
                        }
                    }
                ];

                await pinecone.upsertKnowledge(vectors);
                console.log(`✅ Saved summary to Pinecone index`);
            } catch (pineconeErr) {
                console.warn(`⚠️ Failed to save to Pinecone: ${pineconeErr.message}`);
                // Don't fail completely if Pinecone fails
            }
        }

        return true;
    } catch (err) {
        throw new Error(`Failed to save summary: ${err.message}`);
    }
}

/**
 * POST /api/train-url
 * Train JARVIS with content from a URL
 */
router.post('/train-url', async (req, res) => {
    try {
        const { url } = req.body;

        // Validate input
        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid URL in request body'
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }

        console.log(`🧠 [TRAIN-URL] Starting training for: ${url}`);

        // Step 1: Fetch content from URL
        console.log(`📥 [TRAIN-URL] Fetching content from ${url}...`);
        const content = await fetchContentFromUrl(url);

        if (!content || content.length < 100) {
            return res.status(400).json({
                success: false,
                error: 'URL returned empty or insufficient content'
            });
        }

        console.log(`✅ [TRAIN-URL] Fetched ${content.length} characters of content`);

        // Step 2: Create structured summary with Llama 4 Maverick
        console.log(`🧠 [TRAIN-URL] Creating summary with Llama 4 Maverick...`);
        const summary = await createSummary(content, url);

        console.log(`✅ [TRAIN-URL] Summary created: ${summary.title}`);

        // Step 3: Save to knowledge base and Pinecone
        console.log(`💾 [TRAIN-URL] Saving to knowledge base...`);
        await saveSummary(summary);

        console.log(`✅ [TRAIN-URL] Training complete!`);

        return res.status(200).json({
            success: true,
            message: 'URL learned and added to JARVIS memory!',
            summary: {
                title: summary.title,
                key_points: summary.key_points || [],
                topics: summary.topics || [],
                source_url: summary.source_url,
                timestamp: summary.timestamp
            }
        });

    } catch (error) {
        console.error(`❌ [TRAIN-URL] Error: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to train from URL'
        });
    }
});

/**
 * GET /api/train-url/status
 * Check training endpoint status
 */
router.get('/train-url/status', (req, res) => {
    return res.status(200).json({
        success: true,
        status: 'Training endpoint is active',
        models: {
            verification: 'meta-llama/llama-4-maverick-17b-128e-instruct',
            temperature: 0.3,
            max_tokens: 1000
        },
        storage: {
            local: KNOWLEDGE_BASE_DIR,
            vector_db: 'Pinecone (if configured)'
        }
    });
});

module.exports = router;
