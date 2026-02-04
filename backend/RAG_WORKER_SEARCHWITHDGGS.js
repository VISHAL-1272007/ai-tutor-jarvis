/**
 * JARVIS RAG-WORKER: DDGS Search with Security Headers & Retry Logic
 * 
 * This is the updated searchWithDDGS() method for the Node.js RAG-Worker
 * that properly integrates with the Flask backend's /api/search-ddgs endpoint
 * 
 * Key Features:
 * ✅ X-Jarvis-Key security header authentication
 * ✅ Exponential backoff retry (2 retries max)
 * ✅ Proper payload stringification (topic field)
 * ✅ Detailed error logging without crashes
 */

async function searchWithDDGS(query, limit = 5, retries = 2) {
    const nodePort = process.env.NODE_PORT || process.env.PORT || 5000;
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${nodePort}`;
    const endpoint = `${baseUrl}/api/search-ddgs`;
    const securityKey = process.env.JARVIS_SECURE_KEY || 'VISHAI_SECURE_2026';
    
    // ✅ Properly stringify topic in request payload
    const requestPayload = {
        topic: String(query || '').trim(),
        region: 'in-en'
    };
    
    // ✅ Include security headers
    const axiosConfig = {
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'X-Jarvis-Key': securityKey,
            'User-Agent': 'JARVIS-RAG-Worker/1.0'
        }
    };

    console.log(`🔍 [DDGS] Searching: "${query}" | Endpoint: ${endpoint}`);

    // ✅ Retry mechanism: up to 2 retries (3 attempts total)
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await axios.post(endpoint, requestPayload, axiosConfig);
            
            if (!res.data || res.data.success !== true) {
                console.error(`[DDGS] Invalid response (Attempt ${attempt + 1}): ${JSON.stringify(res.data)}`);
                throw new Error(res.data?.error || 'DDGS search failed');
            }

            const answer = res.data.answer || '';
            const context = res.data.context || '';
            const sources = Array.isArray(res.data.sources) ? res.data.sources : [];
            
            // Build docs: prefer context for content; include top sources
            const docs = sources.slice(0, limit).map((s, i) => ({
                title: s.title || `Source ${i + 1}`,
                url: s.url || s.link || 'unknown',
                snippet: s.snippet || '',
                content: (context || answer || s.snippet || '').toString().substring(0, 8000),
                index: i + 1,
                status: 'ddgs'
            }));
            
            // If no sources, still create a single doc from synthesized answer/context
            if (docs.length === 0 && (context || answer)) {
                docs.push({
                    title: 'DDGS Synthesized Context',
                    url: 'ddgs.local',
                    snippet: (answer || '').toString().substring(0, 200),
                    content: (context || answer).toString().substring(0, 8000),
                    index: 1,
                    status: 'ddgs_context'
                });
            }
            
            console.log(`✅ [DDGS] Success: Retrieved ${docs.length} document(s)`);
            return docs;
            
        } catch (e) {
            const status = e.response?.status || e.code || 'unknown';
            const errorMsg = e.response?.data?.error || e.message || 'Unknown error';
            const isSecurityError = status === 401 || status === 403;
            const isNotFoundError = status === 404;
            
            // ✅ Detailed error logging
            console.warn(
                `⚠️ [JARVIS-RAG] Security/Connection Error (Attempt ${attempt + 1}/${retries + 1})\n` +
                `   Status: ${status}\n` +
                `   Error: ${errorMsg}\n` +
                `   Endpoint: ${endpoint}\n` +
                `   Security Header: X-Jarvis-Key=${securityKey.substring(0, 5)}***\n` +
                `   Payload: ${JSON.stringify(requestPayload)}`
            );
            
            // ✅ Retry logic: only retry on 404 or 401 (security/transient errors)
            if ((isSecurityError || isNotFoundError) && attempt < retries) {
                const delayMs = (attempt + 1) * 1000; // Exponential backoff: 1s, 2s
                console.log(`   ⏳ Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }
            
            // After all retries exhausted, return empty but log full error
            if (attempt === retries) {
                console.error(
                    `❌ [JARVIS-RAG] DDGS Endpoint Failed After ${retries + 1} Attempts\n` +
                    `   Final Status: ${status}\n` +
                    `   Final Error: ${errorMsg}\n` +
                    `   Check Flask backend: ${baseUrl}`
                );
            }
        }
    }
    
    // ✅ Graceful fallback: return empty array (won't crash)
    return [];
}


/**
 * ENVIRONMENT VARIABLES REQUIRED
 * 
 * .env file should include:
 * 
 * # Flask backend URL (auto-detected if not set)
 * BACKEND_URL=https://ai-tutor-jarvis.onrender.com
 * 
 * # Security key (defaults to 'VISHAI_SECURE_2026' if not set)
 * JARVIS_SECURE_KEY=VISHAI_SECURE_2026
 * 
 * # Node server port (defaults to 5000)
 * NODE_PORT=5000
 */


/**
 * USAGE EXAMPLE
 * 
 * const rag = new JarvisAutonomousRAG();
 * 
 * // Single search
 * const results = await rag.searchWithDDGS("latest AI news");
 * console.log(results); // [{ title, url, snippet, content, index, status }, ...]
 * 
 * // With custom limit
 * const topResults = await rag.searchWithDDGS("Python machine learning", 3);
 * 
 * // Full control over retries
 * const stable = await rag.searchWithDDGS("quantum computing", 5, 3); // 3 retries
 */


/**
 * FLASK BACKEND EXPECTATIONS
 * 
 * The Flask backend's /api/search-ddgs endpoint must:
 * 
 * 1. Accept POST requests with JSON:
 *    {
 *        "topic": "search query string",
 *        "region": "in-en"
 *    }
 * 
 * 2. Validate X-Jarvis-Key header:
 *    if request.headers.get('X-Jarvis-Key') != 'VISHAI_SECURE_2026':
 *        return {'error': 'Unauthorized'}, 401
 * 
 * 3. Return JSON response:
 *    {
 *        "success": true,
 *        "answer": "...",
 *        "context": "...",
 *        "sources": [
 *            {"title": "...", "url": "...", "snippet": "..."},
 *            ...
 *        ],
 *        "timestamp": "2026-02-04T10:30:00Z"
 *    }
 * 
 * ✅ Python Flask backend already implements this (app.py lines 1231+)
 */
