/**
 * J.A.R.V.I.S 2026 Backend — Node.js Express Server
 * Brick-by-Brick Rebuild — March 2, 2026
 *
 * Architecture:
 *   1. Express + Compression (70% size reduction)
 *   2. Groq SDK primary LLM (llama-3.3-70b-versatile)
 *   3. OpenRouter multi-model failover chain
 *   4. Tavily 3-key rotation → Sonar fallback → Groq direct
 *   5. Gemini lazy-loaded for vision/tools
 *   6. Firebase RTDB for cross-device chat persistence
 *   7. Rate limiting, CORS, security hardened
 *   8. Server starts in <2 seconds, heavy modules load async
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const app = express();

app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'https://vishai-f6197.web.app',
        'https://vishai-f6197.firebaseapp.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Jarvis-Key', 'X-Skip-Rate-Limit'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: false,
    skip: (req) => req.headers['x-skip-rate-limit'] === 'true',
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
const FIREBASE_RTDB_URL = (process.env.FIREBASE_RTDB_URL || '').replace(/\/$/, '');

function getTodayStr() {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

const TAVILY_KEYS = [
    process.env.TAVILY_API_KEY,
    process.env.TAVILY_API_KEY2,
    process.env.TAVILY_API_KEY3,
].filter(Boolean);

let tavilyKeyIndex = 0;
function getNextTavilyKey() {
    if (TAVILY_KEYS.length === 0) return null;
    const key = TAVILY_KEYS[tavilyKeyIndex];
    tavilyKeyIndex = (tavilyKeyIndex + 1) % TAVILY_KEYS.length;
    return key;
}

const SONAR_API_KEY = process.env.SONAR_API_KEY || '';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL_CHAIN = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-large-latest',
    'openrouter/auto',
];

async function askOpenRouter(query, systemPrompt) {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) throw new Error('OPENROUTER_API_KEY not configured');

    const headers = {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vishai-f6197.web.app',
        'X-Title': 'JARVIS AI Tutor',
    };

    let lastError = 'Unknown error';
    for (const model of OPENROUTER_MODEL_CHAIN) {
        try {
            const response = await axios.post(OPENROUTER_URL, {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }, { headers, timeout: 45000 });

            const content = response?.data?.choices?.[0]?.message?.content?.trim();
            if (content) return { answer: content, modelUsed: model };
            lastError = `Empty response from ${model}`;
        } catch (error) {
            const status = error?.response?.status;
            if (status === 429 || status >= 500 || error.code === 'ECONNABORTED') {
                lastError = `${status || 'ERR'} on ${model}`;
                continue;
            }
            lastError = `${status || 'ERR'} on ${model}: ${error.message}`;
        }
    }
    throw new Error(`OpenRouter chain exhausted. Last: ${lastError}`);
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGroqWithRetry(payload, attempts = 2) {
    if (!global.groqClient) throw new Error('Groq client unavailable');

    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await global.groqClient.chat.completions.create(payload);
        } catch (error) {
            lastError = error;
            const status = error?.status || error?.response?.status;
            const transient = status === 429 || (status >= 500 && status < 600) || error?.code === 'ECONNABORTED';
            if (!transient || attempt === attempts) throw error;
            await wait(900 * attempt);
        }
    }
    throw lastError || new Error('Unknown Groq error');
}

async function searchWeb(query) {
    if (TAVILY_KEYS.length > 0) {
        for (let i = 0; i < TAVILY_KEYS.length; i++) {
            try {
                const apiKey = getNextTavilyKey();
                const response = await axios.post('https://api.tavily.com/search', {
                    query,
                    search_depth: 'advanced',
                    max_results: 10,
                    include_answer: true,
                }, {
                    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    timeout: 15000,
                });

                if (response.data?.results?.length > 0) {
                    const top = response.data.results.slice(0, 5);
                    return {
                        answer: response.data.answer || top.map(r => r.content || r.title).join('\n\n'),
                        sources: top.map(r => ({ title: r.title, url: r.url, snippet: r.content || r.snippet })),
                        citations: top.map(r => r.url),
                        searchEngine: `Tavily AI (Key #${i + 1})`,
                    };
                }
            } catch (_) {}
        }
    }

    if (SONAR_API_KEY) {
        try {
            const response = await axios.post('https://api.perplexity.ai/chat/completions', {
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'Provide current, accurate information with sources.' },
                    { role: 'user', content: query },
                ],
                temperature: 0.2,
                return_citations: true,
                search_recency_filter: 'month',
            }, {
                headers: { Authorization: `Bearer ${SONAR_API_KEY}`, 'Content-Type': 'application/json' },
                timeout: 15000,
            });

            const answer = response.data.choices?.[0]?.message?.content || '';
            const citations = response.data.citations || [];
            if (answer) {
                return {
                    answer,
                    sources: citations.slice(0, 5).map((url, i) => ({ title: `Source ${i + 1}`, url, snippet: '' })),
                    citations,
                    searchEngine: 'Sonar (Perplexity)',
                };
            }
        } catch (_) {}
    }

    if (global.groqClient) {
        try {
            const groqResp = await callGroqWithRetry({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Provide accurate information. If potentially outdated, mention it.' },
                    { role: 'user', content: query },
                ],
                temperature: 0.6,
                max_tokens: 800,
            });
            const answer = groqResp.choices[0].message.content;
            return {
                answer: answer + '\n\n⚠️ Note: Based on training data, may not include latest info.',
                sources: [], citations: [],
                searchEngine: 'Groq (Direct)',
            };
        } catch (_) {}
    }

    return { answer: '❌ All search APIs unavailable.', sources: [], citations: [], searchEngine: 'None' };
}

async function firebaseGet(nodePath) {
    if (!FIREBASE_RTDB_URL) return null;
    try {
        const resp = await axios.get(`${FIREBASE_RTDB_URL}/${nodePath}.json`, { timeout: 10000 });
        return resp.data;
    } catch {
        return null;
    }
}

async function firebasePost(nodePath, data) {
    if (!FIREBASE_RTDB_URL) return null;
    try {
        const resp = await axios.post(`${FIREBASE_RTDB_URL}/${nodePath}.json`, data, { timeout: 10000 });
        return resp.data?.name || null;
    } catch {
        return null;
    }
}

async function firebasePatch(nodePath, data) {
    if (!FIREBASE_RTDB_URL) return false;
    try {
        await axios.patch(`${FIREBASE_RTDB_URL}/${nodePath}.json`, data, { timeout: 10000 });
        return true;
    } catch {
        return false;
    }
}

function syncChatToFirebase(userId, question, response, intent = '') {
    firebasePost(`chats/${userId}`, {
        question: (question || '').slice(0, 500),
        response: (response || '').slice(0, 2000),
        intent,
        timestamp: new Date().toISOString(),
    }).catch(() => {});
}

function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
}

function buildFaviconUrl(rawUrl) {
    try {
        const { hostname } = new URL(rawUrl);
        return hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64` : '';
    } catch { return ''; }
}

function normalizeSources(sources) {
    return (sources || []).slice(0, 5).map((s, i) => ({
        id: i + 1,
        title: s.title || `Source ${i + 1}`,
        url: s.url || '',
        fav: s.url ? buildFaviconUrl(s.url) : '',
    }));
}

function fallbackFollowUps(question) {
    const seed = (question || '').split(' ').slice(0, 5).join(' ') || 'this topic';
    return [
        `Can you explain ${seed} with examples?`,
        `What are the key takeaways about ${seed}?`,
        `How does ${seed} apply in real life?`,
        `What should I learn next about ${seed}?`,
    ];
}

function buildDegradedAnswer(question) {
    const topic = (question || 'this topic').trim();
    return `Hey there! 👋\n\nI'm facing a temporary connection issue ⚠️\n\n**Try:**\n• Retry in 20–30 seconds 🔄\n• Ask a shorter question ✍️\n\n**Your question:** ${topic}\n\nI'll be back shortly! 💪`;
}

function buildSystemPrompt(webData = '') {
    let prompt = `You are J.A.R.V.I.S 🤖✨, the highly advanced AI assistant built by Vishal Sir.
Today's date: ${getTodayStr()}

⚡ EXECUTION RULES:
1. For current events/news → Use provided search results as PRIMARY source
2. Extract facts with citations [1], [2], [3]
3. NEVER hallucinate — say "I cannot verify this right now" if unsure
4. Address Vishal as "Sir" or "Boss" with loyalty and respect`;

    if (webData) {
        prompt += `\n\n📡 **Live Web Research:**\n${webData}\n\nUse this data for accurate, cited answers.`;
    }

    return prompt;
}

app.get('/', (req, res) => {
    res.json({
        name: 'J.A.R.V.I.S 2026 Backend',
        version: '7.0-rebuild',
        status: 'operational',
        uptime: process.uptime(),
        firebase_rtdb: !!FIREBASE_RTDB_URL,
        timestamp: new Date().toISOString(),
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'alive',
        version: '7.0-rebuild',
        uptime: process.uptime(),
        groq: !!global.groqClient,
        gemini: !!global.geminiModel,
        tavily_keys: TAVILY_KEYS.length,
        sonar: !!SONAR_API_KEY,
        firebase_rtdb: !!FIREBASE_RTDB_URL,
        timestamp: new Date().toISOString(),
    });
});

app.post('/ask', apiLimiter, async (req, res) => {
    try {
        const { question, aiModel } = req.body;
        if (!question) return res.status(400).json({ error: 'Question required' });

        if (!global.groqClient && process.env.GROQ_API_KEY) {
            const Groq = require('groq-sdk');
            global.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }

        const systemPrompt = buildSystemPrompt();
        const useOpenRouter = aiModel === 'openrouter' || process.env.USE_OPENROUTER_PRIMARY === 'true';

        const routerPrompt = `Classify if this query needs live web data.
Return ONLY JSON: {"is_live":boolean,"confidence":number,"reason":string,"follow_ups":["q1","q2","q3","q4"]}
Rules: time-sensitive → is_live true; static facts with confidence>80 → false; confidence<70 → true.
Query: "${question}"`;

        let routerDecision = {};
        let forceOpenRouter = false;

        try {
            if (!global.groqClient) throw new Error('Groq unavailable');
            const routerResp = await callGroqWithRetry({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Return JSON only.' },
                    { role: 'user', content: routerPrompt },
                ],
                temperature: 0.2,
                max_tokens: 300,
            });
            routerDecision = safeJsonParse(routerResp.choices[0].message.content.trim()) || {};
        } catch (err) {
            if (/invalid.?api.?key|401/i.test(err.message)) forceOpenRouter = true;
        }

        const confidence = Number(routerDecision.confidence || 0);
        const isLive = routerDecision.is_live === true
            || (confidence > 0 && confidence < 70)
            || /\b(today|latest|news|current|price|stock|weather|score|202\d)\b/i.test(question);

        const shouldUseOR = forceOpenRouter || useOpenRouter;
        const followUps = Array.isArray(routerDecision.follow_ups) && routerDecision.follow_ups.length > 0
            ? routerDecision.follow_ups.slice(0, 4) : fallbackFollowUps(question);

        if (isLive) {
            const searchResult = await searchWeb(question);
            const sources = normalizeSources(searchResult?.sources || []);

            const enhancedPrompt = `Use sources to answer with citations [1], [2].
Question: "${question}"
Sources:\n${sources.map(s => `[${s.id}] ${s.title} - ${s.url}`).join('\n')}`;

            let answer, modelUsed;
            if (shouldUseOR) {
                const r = await askOpenRouter(enhancedPrompt, systemPrompt);
                answer = r.answer; modelUsed = r.modelUsed;
            } else {
                const r = await callGroqWithRetry({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: enhancedPrompt }],
                    temperature: 0.6, max_tokens: 2000,
                });
                answer = r.choices[0].message.content;
                modelUsed = 'llama-3.3-70b-versatile';
            }

            const userId = req.body.user_id || req.ip || 'anonymous';
            syncChatToFirebase(userId, question, answer, 'search');

            return res.json({ is_live: true, answer, model_used: modelUsed, sources, follow_ups: followUps });
        }

        let answer, modelUsed;
        if (shouldUseOR) {
            const r = await askOpenRouter(question, systemPrompt);
            answer = r.answer; modelUsed = r.modelUsed;
        } else {
            const r = await callGroqWithRetry({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }],
                temperature: 0.7, max_tokens: 2000,
            });
            answer = r.choices[0].message.content;
            modelUsed = 'llama-3.3-70b-versatile';
        }

        const userId = req.body.user_id || req.ip || 'anonymous';
        syncChatToFirebase(userId, question, answer, 'direct');

        return res.json({ is_live: false, answer, model_used: modelUsed, sources: [], follow_ups: followUps });

    } catch (error) {
        const question = req?.body?.question || '';
        return res.json({
            is_live: false,
            answer: buildDegradedAnswer(question),
            model_used: 'fallback-degraded',
            sources: [], follow_ups: fallbackFollowUps(question),
            degraded: true, error: error.message,
        });
    }
});

app.post('/api/query', apiLimiter, async (req, res) => {
    try {
        const { query, options = {} } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });

        const askResp = await axios.post(
            `http://127.0.0.1:${PORT}/ask`,
            { question: query, aiModel: options.ai_model || 'openrouter' },
            { timeout: 120000, headers: { 'x-skip-rate-limit': 'true' } },
        );

        const data = askResp.data || {};
        return res.json({
            query,
            ai_model: options.ai_model || 'openrouter',
            response: data.answer || '',
            model_used: data.model_used || null,
            sources: data.sources || [],
            suggestions: data.follow_ups || [],
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/search/news', apiLimiter, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });
        const result = await searchWeb(`${query} news latest`);
        res.json({
            success: true, query,
            answer: result?.answer || '',
            sources: result?.sources || [],
            searchEngine: result?.searchEngine || 'Tavily/Sonar',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/firebase/chat-history', async (req, res) => {
    const userId = req.query.user_id || 'default';
    const data = await firebaseGet(`chats/${userId}`);
    if (!data || typeof data !== 'object') return res.json({ history: [], count: 0 });
    const items = Object.entries(data).map(([k, v]) => ({ id: k, ...v }));
    items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    const limit = parseInt(req.query.limit || '20', 10);
    res.json({ history: items.slice(0, limit), count: items.length });
});

app.post('/api/firebase/chat-history', async (req, res) => {
    const { user_id, question, response, intent } = req.body;
    if (!question || !response) return res.status(400).json({ error: 'Missing question or response' });
    syncChatToFirebase(user_id || 'default', question, response, intent || '');
    res.json({ status: 'saved' });
});

app.get('/api/firebase/user-profile', async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id required' });
    const data = await firebaseGet(`users/${userId}`);
    res.json({ profile: data || {} });
});

app.post('/api/firebase/user-profile', async (req, res) => {
    const { user_id, ...profile } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const ok = await firebasePatch(`users/${user_id}`, {
        ...profile,
        updated_at: new Date().toISOString(),
    });
    res.json({ status: ok ? 'saved' : 'failed' });
});

app.get('/api/firebase/knowledge', async (req, res) => {
    const topic = req.query.topic;
    if (topic) {
        const data = await firebaseGet(`knowledge/${topic}`);
        return res.json({ topic, data });
    }
    const data = await firebaseGet('knowledge');
    if (data && typeof data === 'object') {
        return res.json({ topics: Object.keys(data), count: Object.keys(data).length });
    }
    res.json({ topics: [], count: 0 });
});

app.post('/api/firebase/knowledge', async (req, res) => {
    const { topic, content, source } = req.body;
    if (!topic || !content) return res.status(400).json({ error: 'topic and content required' });
    const key = await firebasePost(`knowledge/${topic}`, {
        content, source: source || 'manual',
        timestamp: new Date().toISOString(),
    });
    res.json({ status: 'saved', key });
});

app.get('/api/firebase/corpus-stats', async (req, res) => {
    if (!FIREBASE_RTDB_URL) return res.json({ status: 'rtdb_not_configured' });
    const stats = {};
    for (const node of ['knowledge', 'training_data', 'daily_knowledge', 'chats', 'users']) {
        const data = await firebaseGet(node);
        stats[node] = data && typeof data === 'object' ? Object.keys(data).length : 0;
    }
    stats.rtdb_url = FIREBASE_RTDB_URL;
    stats.status = 'connected';
    res.json(stats);
});

app.post('/api/firebase/sync-knowledge', async (req, res) => {
    if (!FIREBASE_RTDB_URL) return res.status(503).json({ error: 'RTDB not configured' });
    const entries = (req.body.entries || []).slice(0, 100);
    if (!entries.length) return res.status(400).json({ error: 'No entries' });
    let success = 0, failed = 0;
    for (const entry of entries) {
        const topic = entry.topic || 'general';
        if (entry.content) {
            const key = await firebasePost(`knowledge/${topic}`, {
                content: (entry.content || '').slice(0, 5000),
                source: entry.source || 'bulk_sync',
                timestamp: new Date().toISOString(),
            });
            if (key) success++; else failed++;
        } else { failed++; }
    }
    res.json({ synced: success, failed, total: entries.length });
});

let heavyModulesLoaded = false;

async function loadHeavyModules() {
    if (heavyModulesLoaded) return;
    await Promise.allSettled([
        (async () => {
            if (process.env.GEMINI_API_KEY) {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                global.geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            }
        })(),
        (async () => {
            if (process.env.GROQ_API_KEY && !global.groqClient) {
                const Groq = require('groq-sdk');
                global.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
            }
        })(),
    ]);
    heavyModulesLoaded = true;
}

function lazyLoadRoutes() {
    const routes = [
        { path: '/api/training', module: './training-routes', delay: 100 },
        { path: '/api/vision', module: './vision-routes', delay: 150 },
    ];

    for (const route of routes) {
        setTimeout(() => {
            try {
                const router = require(route.module);
                app.use(route.path, router);
            } catch {}
        }, route.delay);
    }
}

const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 J.A.R.V.I.S Node backend running on ${HOST}:${PORT}`);
    loadHeavyModules().catch(() => {});
    lazyLoadRoutes();
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} in use`);
        process.exit(1);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
});

module.exports = app;
