/**
 * JARVIS AUTONOMOUS RAG PIPELINE
 * 
 * Purpose: Persistent, Hallucination-Free Knowledge Retrieval & Ingestion
 * Requirements: Multi-source scraping, Recursive ingestion, Truth verification, Daily self-training.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');
const path = require('path');
const googleIt = require('google-it');
const JARVISLiveSearch = require('./jarvis-live-search-wrapper');
require('dotenv').config({ path: path.join(__dirname, '.env') });

class JarvisAutonomousRAG {
    constructor() {
        this.pinecone = require('./pinecone-integration');
        this.serperKey = process.env.SERPER_API_KEY;
        this.groqKey = process.env.GROQ_API_KEY;
        this.jinaReaderUrl = 'https://r.jina.ai/';
        this.chunkSize = 1000;
        this.chunkOverlap = 200;
        this.pythonScript = path.join(__dirname, 'jarvis-live-search.py');
        this.liveSearch = new JARVISLiveSearch();
        
        // 🛑 BLOCKLIST: Domains that actively block scrapers (HTTP 451, 403, etc)
        this.blockedDomains = [
            'reuters.com',
            'theverge.com',
            'ft.com',
            'wsj.com',
            'medium.com',
            'paywall',
            'subscription',
            'archive.org',
            // Indian publishers that commonly return 451 / block scraping
            'thehindu.com',
            'indiatimes.com',
            'timesofindia.indiatimes.com',
            'economictimes.indiatimes.com',
            'indianexpress.com',
            'hindustantimes.com',
            'news18.com'
        ];
        
        // ✅ TRUSTED SOURCES: Indian news & tech sources that work well
        this.trustedDomains = [
            'dailythanthi.com',
            'dinamalar.com',
            'thanthi.tv',
            'thehindu.com',
            'deccanherald.com',
            'techcrunch.com',
            'hackernews.com'
        ];
    }
    
    /**
     * CHECK IF URL IS BLOCKED OR PROBLEMATIC
     */
    isBlockedDomain(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();
            
            // Check if in blocklist
            if (this.blockedDomains.some(blocked => domain.includes(blocked))) {
                console.warn(`⛔ URL blocked (in blocklist): ${url}`);
                return true;
            }
            
            // Additional checks for common scraper blocks
            if (url.includes('paywall') || url.includes('subscription')) {
                console.warn(`⛔ URL blocked (paywall detected): ${url}`);
                return true;
            }
            
            return false;
        } catch (e) {
            console.warn(`⚠️ Invalid URL format: ${url}`);
            return true;
        }
    }
    
    /**
     * SORT URLS BY PRIORITY (Trusted sources first)
     */
    prioritizeUrls(urls) {
        return urls.sort((a, b) => {
            const aIsTrusted = this.trustedDomains.some(domain => a.toLowerCase().includes(domain));
            const bIsTrusted = this.trustedDomains.some(domain => b.toLowerCase().includes(domain));
            return (bIsTrusted ? 1 : 0) - (aIsTrusted ? 1 : 0);
        });
    }

    /**
     * CHUNKING LOGIC
     * Splits long text into manageable chunks with overlap
     */
    chunkText(text, size = 1000, overlap = 200) {
        const chunks = [];
        let i = 0;
        while (i < text.length) {
            chunks.push(text.substring(i, i + size));
            i += (size - overlap);
        }
        return chunks;
    }

    /**
     * TRUTH VERIFICATION (CROSS-REFERENCING)
     * Compares information from multiple sources to eliminate hallucinations
     */
    async verifyTruth(query, sourcesData) {
        console.log(`[RAG-TRUTH] Cross-referencing ${sourcesData.length} sources...`);
        
        const context = sourcesData.map((s, i) => `SOURCE ${i+1} (${s.url}):\n${s.content.substring(0, 3000)}`).join('\n\n---\n\n');
        
        const prompt = `You are the JARVIS Truth Verifier. 
Analyze the following information from different sources to answer: "${query}".

RULES:
1. Identify common facts supported by at least 2 sources.
2. Flag contradictions as "UNVERIFIED".
3. Eliminate any data that looks like an advertisement or irrelevant fluff.
4. Output a "VERIFIED CONSOLIDATED REPORT" in 3-5 bullet points.

Sources Context:
${context}`;

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0
            }, {
                headers: { 'Authorization': `Bearer ${this.groqKey}` }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Truth Verification Error:', error.message);
            return sourcesData[0]?.content.substring(0, 500) || "Unable to verify.";
        }
    }

    /**
     * RECURSIVE DATA INGESTION (IMPROVED)
     * Fetches deep content, chunks it, and stores in Vector DB
     * Now with blocklist checking, retry logic, and graceful error handling
     */
    async ingestDeep(topic) {
        console.log(`🚀 [AUTONOMOUS-RAG] Deep Ingestion for: ${topic}`);
        
        // 1. Get candidate links via local DuckDuckGo Python search
        const searchResults = await this.runLocalSearch(`${topic} 2026`, 10);
        let urls = searchResults
            .map(r => r.url || r.href)
            .filter(Boolean);

        if (!urls.length) {
            console.warn('⚠️ [AUTONOMOUS-RAG] No URLs returned from local DuckDuckGo search');
            return [];
        }
        
        // 2. FILTER BLOCKED DOMAINS & PRIORITIZE TRUSTED SOURCES
        const filteredUrls = urls.filter(url => !this.isBlockedDomain(url));
        if (filteredUrls.length === 0) {
            console.warn(`⚠️ [AUTONOMOUS-RAG] All URLs were blocked by domain blocklist. Topic: ${topic}`);
            return [];
        }
        
        const prioritizedUrls = this.prioritizeUrls(filteredUrls);
        console.log(`✅ [AUTONOMOUS-RAG] Filtered ${prioritizedUrls.length}/${urls.length} URLs (blocked: ${urls.length - filteredUrls.length})`);
        
        const results = [];
        let successCount = 0;
        const maxRetries = 2;
        const targetIngestions = 3; // Try to ingest at least 3 URLs

        // 3. PARALLEL INGESTION WITH RETRY & ERROR RECOVERY
        for (const url of prioritizedUrls.slice(0, 8)) { // Try up to 8 URLs to get 3 successful ones
            if (successCount >= targetIngestions) break;
            
            let lastError = null;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`📡 [AUTONOMOUS-RAG] Fetching URL (attempt ${attempt}/${maxRetries}): ${url}`);
                    
                    const response = await axios.get(`${this.jinaReaderUrl}${url}`, { 
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    const content = response.data;
                    if (!content || typeof content !== 'string' || content.length < 100) {
                        throw new Error('Empty or invalid content received');
                    }
                    
                    // Chunk and store
                    const chunks = this.chunkText(content);
                    const facts = chunks.slice(0, 5).map((c, i) => ({
                        id: `rag-${Date.now()}-${Math.random()}`,
                        text: c,
                        metadata: { topic, source: url, type: 'deep_ingestion' }
                    }));

                    if (this.pinecone && facts.length > 0) {
                        await this.pinecone.upsertKnowledge(facts);
                    }
                    
                    results.push({ url, content });
                    successCount++;
                    console.log(`✅ [AUTONOMOUS-RAG] Successfully ingested: ${url}`);
                    break; // Success, exit retry loop
                    
                } catch (error) {
                    lastError = error;
                    const statusCode = error.response?.status || 'N/A';
                    
                    // Log specific errors
                    if (statusCode === 451) {
                        console.warn(`⛔ [AUTONOMOUS-RAG] URL blocked (451 Unavailable For Legal Reasons): ${url}`);
                        break; // Don't retry 451 errors
                    } else if (statusCode === 403 || statusCode === 429) {
                        console.warn(`⚠️ [AUTONOMOUS-RAG] Rate limited/Forbidden (${statusCode}): ${url}`);
                        if (attempt < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
                        }
                    } else {
                        console.warn(`❌ [AUTONOMOUS-RAG] Failed to ingest ${url} (Attempt ${attempt}): ${error.message}`);
                    }
                }
            }
        }
        
        if (successCount === 0) {
            console.warn(`⚠️ [AUTONOMOUS-RAG] No URLs were successfully ingested for topic: ${topic}`);
        } else {
            console.log(`📊 [AUTONOMOUS-RAG] Ingestion complete: ${successCount}/${Math.min(targetIngestions, prioritizedUrls.length)} URLs processed successfully`);
        }

        return results;
    }

    /**
     * Run local DuckDuckGo search via Python helper
     */
    async runLocalSearch(query, maxResults = 8) {
        return new Promise((resolve) => {
            // Prefer python3 if available (Render/Linux), else fallback to python (Windows)
            let triedPython3 = false;

            const spawnSearch = (pythonCmd) => {
                const proc = spawn(pythonCmd, [
                    this.pythonScript,
                    'web',
                    query,
                    maxResults.toString()
                ]);

                let stdout = '';
                let stderr = '';

                proc.stdout.on('data', (data) => { stdout += data.toString(); });
                proc.stderr.on('data', (data) => { stderr += data.toString(); });

                proc.on('close', async (code) => {
                    if (code !== 0) {
                        console.warn(`[AUTONOMOUS-RAG] Python search failed (code ${code}): ${stderr}`);
                        // Fallback to Google-it if Python fails
                        const fallback = await this._fallbackGoogleSearch(query, maxResults);
                        return resolve(fallback);
                    }

                    try {
                        const output = stdout.trim();
                        const start = output.indexOf('{');
                        const end = output.lastIndexOf('}');
                        if (start === -1 || end === -1) throw new Error('No JSON payload found');
                        const parsed = JSON.parse(output.substring(start, end + 1));
                        if (parsed.status === 'success' && Array.isArray(parsed.results) && parsed.results.length > 0) {
                            return resolve(parsed.results);
                        }
                        // Fallback if no results
                        const fallback = await this._fallbackGoogleSearch(query, maxResults);
                        return resolve(fallback);
                    } catch (err) {
                        console.warn(`[AUTONOMOUS-RAG] Failed to parse Python search output: ${err.message}`);
                        const fallback = await this._fallbackGoogleSearch(query, maxResults);
                        return resolve(fallback);
                    }
                });

                proc.on('error', async (err) => {
                    console.warn(`[AUTONOMOUS-RAG] Python process error: ${err.message}`);
                    if (!triedPython3 && /ENOENT|not recognized/.test(String(err.message))) {
                        triedPython3 = true;
                        // Try python3 once
                        return spawnSearch('python3');
                    }
                    const fallback = await this._fallbackGoogleSearch(query, maxResults);
                    return resolve(fallback);
                });
            };

            // Start with python3 on non-Windows, python on Windows
            if (process.platform === 'win32') {
                spawnSearch('python');
            } else {
                triedPython3 = true;
                spawnSearch('python3');
            }
        });
    }

    /**
     * Node-side fallback using google-it when Python/DDGS yields no results
     */
    async _fallbackGoogleSearch(query, maxResults) {
        try {
            console.warn('[AUTONOMOUS-RAG] Falling back to google-it for search results');
            const results = await googleIt({ query, limit: Math.max(5, maxResults) });
            return results.map(r => ({ title: r.title, url: r.link, source: r.snippet }));
        } catch (e) {
            console.warn(`[AUTONOMOUS-RAG] google-it fallback failed: ${e.message}`);
            return [];
        }
    }

    /**
     * DAILY SELF-TRAINING WORKER (IMPROVED)
     * Background task to fetch latest tech news and update memory
     * Now with fallback topics and graceful error handling
     */
    async runDailySelfTraining() {
        console.log('📅 [RAG-WORKER] Starting Daily Knowledge Update...');
        
        // Primary topics with good coverage
        const primaryTopics = [
            'Latest artificial intelligence breakthroughs',
            'Cybersecurity news 2026',
            'Tech industry updates'
        ];
        
        // Fallback to Indian news which has better scraping support
        const fallbackTopics = [
            'Tamil Nadu technology news',
            'Chennai tech events',
            'India AI research'
        ];
        
        let topicsProcessed = 0;
        const allTopics = [...primaryTopics, ...fallbackTopics];
        
        for (const topic of allTopics) {
            try {
                console.log(`📰 [RAG-WORKER] Processing topic: ${topic}`);
                const result = await this.ingestDeep(`Latest news on ${topic} ${new Date().toISOString().split('T')[0]}`);
                if (result.length > 0) {
                    topicsProcessed++;
                }
            } catch (error) {
                console.error(`❌ [RAG-WORKER] Error processing topic "${topic}": ${error.message}`);
                // Continue with next topic even if this one fails
            }
        }
        
        console.log(`✅ [RAG-WORKER] Daily training complete. Processed ${topicsProcessed} topics successfully.`);
    }

    /**
     * THE PERSISTENT ANSWER ENGINE (IMPROVED)
     * Answers queries by: 1. Vector Search + 2. Web Search + 3. Truth Verification
     * Now with fallback chains and graceful degradation
     */
    async answer(query) {
        const startTime = performance.now();
        console.log(`🔍 [JARVIS-RAG] Query: ${query}`);

        try {
            // Phase 1: Local Vector Retrieval
            let localMemory = [];
            try {
                localMemory = this.pinecone ? await this.pinecone.searchPineconeKnowledge(query, 5) : [];
            } catch (e) {
                console.warn(`⚠️ [JARVIS-RAG] Local memory search failed: ${e.message}`);
            }

            // Detect current events or missing context
            const currentEventsKeywords = ['latest', 'today', 'current', 'recent', 'breaking', 'this week', 'this month', 'update', 'happening'];
            const lowerQuery = query.toLowerCase();
            const isCurrentEvents = /2025|2026/.test(lowerQuery) || currentEventsKeywords.some(k => lowerQuery.includes(k));

            // Phase 2: Live Multi-Source Fetch (web crawl) - with error handling
            let liveSources = [];
            try {
                liveSources = await this.ingestDeep(query);
            } catch (e) {
                console.warn(`⚠️ [JARVIS-RAG] Deep ingestion failed: ${e.message}`);
            }

            // Phase 2b: Live News Fallback (DuckDuckGo) when memory is stale/empty
            let liveNews = null;
            let liveNewsContext = '';
            if (isCurrentEvents || !localMemory || localMemory.length === 0) {
                try {
                    const liveQuery = `${query} 2026`;
                    liveNews = await this.liveSearch.searchNews(liveQuery, 5);
                    if (liveNews?.status === 'success' && (liveNews.total_results || 0) > 0) {
                        liveNewsContext = '\n\n📰 LIVE 2026 NEWS CONTEXT:\n';
                        liveNews.results.slice(0, 3).forEach((item, i) => {
                            liveNewsContext += `${i + 1}. ${item.title} (Source: ${item.source})\nLink: ${item.url}\n`;
                        });
                    }
                } catch (e) {
                    console.warn('[JARVIS-RAG] Live news fetch failed:', e.message);
                }
            }
            
            // Phase 3: Truth Verification (with error handling)
            let verifiedFacts = '';
            try {
                if (liveSources.length > 0) {
                    verifiedFacts = await this.verifyTruth(query, liveSources.slice(0, 3));
                } else {
                    verifiedFacts = 'No verified facts from web sources available.';
                }
            } catch (e) {
                console.warn(`⚠️ [JARVIS-RAG] Truth verification failed: ${e.message}`);
                verifiedFacts = 'Unable to verify facts due to search limitations.';
            }

            // Phase 4: Final Synthesis
            const prompt = `You are JARVIS, an autonomous AI with access to a verified RAG pipeline.
Answer the following question using the provided Verified Facts, Local Memory, and any Live 2026 context below.

USER QUESTION: ${query}

VERIFIED FACTS:
${verifiedFacts || 'No verified facts available. Use your knowledge if needed.'}

LOCAL MEMORY:
${localMemory.length > 0 ? localMemory.map(m => m.metadata?.text || m.text).join('\n---\n') : 'No local memory available.'}

${liveNewsContext}

INSTRUCTIONS:
- Be highly specific.
- Cite sources if available.
- If unsure, state what is unverified vs verified.
- Prefer 2026 information from live news when relevant.
- Use available context to provide accurate information.
- If external sources failed, rely on your training knowledge.`;

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1
            }, {
                headers: { 'Authorization': `Bearer ${this.groqKey}` }
            });

            const timeTaken = (performance.now() - startTime).toFixed(0);
            const sourceUrls = liveSources.map(s => s.url).filter(Boolean);
            if (liveNews?.results) {
                liveNews.results.forEach(r => { if (r.url) sourceUrls.push(r.url); });
            }

            return {
                answer: response.data.choices[0].message.content,
                verificationStatus: liveSources.length > 0 ? 'VERIFIED' : 'FALLBACK',
                latency: `${timeTaken}ms`,
                sources: sourceUrls,
                liveNews: liveNews || null
            };
            
        } catch (error) {
            console.error(`❌ [JARVIS-RAG] Answer generation failed: ${error.message}`);
            return {
                answer: `I encountered a temporary issue accessing live data. Based on my training: The query requires current information that I cannot fully verify at this moment. Please try again or rephrase your question.`,
                verificationStatus: 'ERROR',
                latency: `${(performance.now() - startTime).toFixed(0)}ms`,
                sources: [],
                error: error.message
            };
        }
    }
}

module.exports = new JarvisAutonomousRAG();
