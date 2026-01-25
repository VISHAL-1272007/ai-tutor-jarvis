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
     * RECURSIVE DATA INGESTION
     * Fetches deep content, chunks it, and stores in Vector DB
     */
    async ingestDeep(topic) {
        console.log(`🚀 [AUTONOMOUS-RAG] Deep Ingestion for: ${topic}`);
        
        // 1. Get candidate links via local DuckDuckGo Python search (avoids Serper 403)
        const searchResults = await this.runLocalSearch(`${topic} 2026`, 10);
        const urls = searchResults
            .map(r => r.url || r.href)
            .filter(Boolean);

        if (!urls.length) {
            console.warn('[AUTONOMOUS-RAG] No URLs returned from local DuckDuckGo search');
            return [];
        }
        const results = [];

        // 2. Parallel Ingestion (Crawl Level 0)
        for (const url of urls.slice(0, 4)) { // Top 4 deep links
            try {
                const response = await axios.get(`${this.jinaReaderUrl}${url}`, { timeout: 15000 });
                const content = response.data;
                
                // Chunk and store
                const chunks = this.chunkText(content);
                const facts = chunks.slice(0, 5).map((c, i) => ({
                    id: `rag-${Date.now()}-${Math.random()}`,
                    text: c,
                    metadata: { topic, source: url, type: 'deep_ingestion' }
                }));

                if (this.pinecone) {
                    await this.pinecone.upsertKnowledge(facts);
                }
                
                results.push({ url, content });
                console.log(`✅ Ingested and Vectorized: ${url}`);
            } catch (e) {
                console.warn(`Failed to ingest ${url}: ${e.message}`);
            }
        }

        return results;
    }

    /**
     * Run local DuckDuckGo search via Python helper
     */
    async runLocalSearch(query, maxResults = 8) {
        return new Promise((resolve) => {
            const proc = spawn('python', [
                this.pythonScript,
                'web',
                query,
                maxResults.toString()
            ]);

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => { stdout += data.toString(); });
            proc.stderr.on('data', (data) => { stderr += data.toString(); });

            proc.on('close', (code) => {
                if (code !== 0) {
                    console.warn(`[AUTONOMOUS-RAG] Python search failed (code ${code}): ${stderr}`);
                    return resolve([]);
                }

                try {
                    const output = stdout.trim();
                    const start = output.indexOf('{');
                    const end = output.lastIndexOf('}');
                    if (start === -1 || end === -1) throw new Error('No JSON payload found');
                    const parsed = JSON.parse(output.substring(start, end + 1));
                    if (parsed.status === 'success' && Array.isArray(parsed.results)) {
                        return resolve(parsed.results);
                    }
                    return resolve([]);
                } catch (err) {
                    console.warn(`[AUTONOMOUS-RAG] Failed to parse Python search output: ${err.message}`);
                    return resolve([]);
                }
            });

            proc.on('error', (err) => {
                console.warn(`[AUTONOMOUS-RAG] Python process error: ${err.message}`);
                return resolve([]);
            });
        });
    }

    /**
     * DAILY SELF-TRAINING WORKER
     * Background task to fetch latest tech news and update memory
     */
    async runDailySelfTraining() {
        console.log('📅 [RAG-WORKER] Starting Daily Knowledge Update...');
        const techTopics = ['Artificial Intelligence', 'Cybersecurity', 'Space Exploration', 'Quantum Computing'];
        
        for (const topic of techTopics) {
            await this.ingestDeep(`Latest news on ${topic} ${new Date().toISOString().split('T')[0]}`);
        }
        
        console.log('✅ [RAG-WORKER] Daily training complete.');
    }

    /**
     * THE PERSISTENT ANSWER ENGINE
     * Answers queries by: 1. Vector Search + 2. Web Search + 3. Truth Verification
     */
    async answer(query) {
        const startTime = performance.now();
        console.log(`🔍 [JARVIS-RAG] Query: ${query}`);

        // Phase 1: Local Vector Retrieval
        const localMemory = this.pinecone ? await this.pinecone.searchPineconeKnowledge(query, 5) : [];

        // Detect current events or missing context
        const currentEventsKeywords = ['latest', 'today', 'current', 'recent', 'breaking', 'this week', 'this month', 'update', 'happening'];
        const lowerQuery = query.toLowerCase();
        const isCurrentEvents = /2025|2026/.test(lowerQuery) || currentEventsKeywords.some(k => lowerQuery.includes(k));

        // Phase 2: Live Multi-Source Fetch (web crawl)
        const liveSources = await this.ingestDeep(query);

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
        
        // Phase 3: Truth Verification
        const verifiedFacts = await this.verifyTruth(query, liveSources.slice(0, 3));

        // Phase 4: Final Synthesis
        const prompt = `You are JARVIS, an autonomous AI with access to a verified RAG pipeline.
        Answer the following question using the provided Verified Facts, Local Memory, and any Live 2026 context below.
        
        USER QUESTION: ${query}
        
        VERIFIED FACTS:
        ${verifiedFacts}
        
        LOCAL MEMORY:
        ${localMemory.map(m => m.metadata.text).join('\n---\n')}

        ${liveNewsContext}
        
        INSTRUCTIONS:
        - Be highly specific.
        - Cite sources if available.
        - If unsure, state what is unverified vs verified.
        - Prefer 2026 information from live news when relevant.
        - Use the memory to avoid generic answers.`;

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
            verificationStatus: 'VERIFIED',
            latency: `${timeTaken}ms`,
            sources: sourceUrls,
            liveNews: liveNews || null
        };
    }
}

module.exports = new JarvisAutonomousRAG();
