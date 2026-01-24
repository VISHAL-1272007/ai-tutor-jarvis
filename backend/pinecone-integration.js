/**
 * JARVIS Backend - Pinecone Knowledge Search Integration
 * Endpoint to search semantic knowledge base for RAG context
 * 
 * Usage: POST /api/knowledge/search
 * Body: { "query": "latest AI news" }
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Search Pinecone knowledge base for relevant articles
 * Runs Python script in background and returns results
 * 
 * @param {string} query - Search query
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} Array of relevant articles
 */
async function searchPineconeKnowledge(query, topK = 5) {
    return new Promise((resolve, reject) => {
        try {
            const pythonScript = path.join(__dirname, 'pinecone_embeddings.py');
            
            // Create Python process
            // Use 'python3' for Linux/Render, fallback to 'python'
            const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
            const pythonProcess = spawn(pythonCmd, [pythonScript, '--search', query, '--top-k', topK.toString()]);
            
            let stdout = '';
            let stderr = '';
            
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const results = JSON.parse(stdout);
                        resolve(results);
                    } catch (e) {
                        reject(new Error('Failed to parse Python output'));
                    }
                } else {
                    reject(new Error(`Python process exited with code ${code}: ${stderr}`));
                }
            });
            
            // Timeout after 30 seconds
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('Pinecone search timeout'));
            }, 30000);
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Upsert learned facts into Pinecone via Python bridge
 * @param {Array} facts - Array of {id, text, metadata}
 */
async function upsertKnowledge(facts) {
    return new Promise((resolve, reject) => {
        try {
            const pythonScript = path.join(__dirname, 'pinecone_embeddings.py');
            const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
            const pythonProcess = spawn(pythonCmd, [pythonScript, '--upsert-facts', JSON.stringify(facts)]);
            
            let stdout = '';
            let stderr = '';
            
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (e) {
                        console.error('JSON Parse Error:', stdout);
                        reject(new Error('Failed to parse Python output'));
                    }
                } else {
                    reject(new Error(`Python process exited with code ${code}: ${stderr}`));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Update knowledge base with latest news
 * Runs full pipeline in background
 * 
 * @returns {Promise<Object>} Pipeline status
 */
async function updateKnowledgeBase() {
    return new Promise((resolve, reject) => {
        try {
            const pythonScript = path.join(__dirname, 'pinecone_embeddings.py');
            const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
            const pythonProcess = spawn(pythonCmd, [pythonScript]);
            
            let stdout = '';
            let stderr = '';
            
            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                console.log('[Knowledge] ' + output.trim());
            });
            
            pythonProcess.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                console.error('[Knowledge Error] ' + output.trim());
            });
            
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        message: 'Knowledge base updated successfully',
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error(`Pipeline failed: ${stderr}`));
                }
            });
            
            // Timeout after 60 seconds
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('Knowledge update timeout'));
            }, 60000);
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Express middleware - Search knowledge endpoint
 * POST /api/knowledge/search
 * Body: { "query": string, "topK": number (optional) }
 */
function knowledgeSearchEndpoint(req, res) {
    const { query, topK = 5 } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
    }
    
    searchPineconeKnowledge(query, topK)
        .then(results => {
            res.json({
                success: true,
                query,
                results,
                count: results.length,
                timestamp: new Date().toISOString()
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        });
}

/**
 * Express middleware - Update knowledge endpoint
 * POST /api/knowledge/update
 */
function knowledgeUpdateEndpoint(req, res) {
    res.json({
        success: true,
        message: 'Update initiated',
        status: 'processing'
    });
    
    // Run update in background
    updateKnowledgeBase()
        .then(() => {
            console.log('✅ Knowledge base updated successfully');
        })
        .catch(error => {
            console.error('❌ Knowledge update failed:', error);
        });
}

// Export for Express app integration
module.exports = {
    searchPineconeKnowledge,
    queryKnowledge: searchPineconeKnowledge, // Alias for GlobalKnowledgeEngine
    upsertKnowledge,
    updateKnowledgeBase,
    knowledgeSearchEndpoint,
    knowledgeUpdateEndpoint
};

/**
 * USAGE IN EXPRESS APP:
 * 
 * const { knowledgeSearchEndpoint, knowledgeUpdateEndpoint } = require('./pinecone-integration');
 * 
 * // Add to your Express routes
 * app.post('/api/knowledge/search', knowledgeSearchEndpoint);
 * app.post('/api/knowledge/update', knowledgeUpdateEndpoint);
 * 
 * // Or use programmatically
 * app.post('/omniscient/rag-query', async (req, res) => {
 *     const { question } = req.body;
 *     
 *     // Get context from Pinecone
 *     const context = await searchPineconeKnowledge(question, 5);
 *     
 *     // Use in RAG pipeline
 *     const enrichedContext = context
 *         .map(c => c.metadata.description)
 *         .join('\n');
 *     
 *     // Send to LLM with context
 *     const answer = await llm.query(question, enrichedContext);
 *     
 *     res.json({ answer, context });
 * });
 */
