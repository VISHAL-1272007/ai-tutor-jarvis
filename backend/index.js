const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') })
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const FormData = require('form-data');
const omniscientRoutes = require('./omniscient-oracle-routes');
// index.js
require('dotenv').config();

// index.js - Line 13 (Old code-ah replace pannunga)
const serperKeysRaw = process.env.SERPER_KEYS || ""; 
const keys = serperKeysRaw ? serperKeysRaw.split(',') : [];

if (keys.length === 0) {
    console.warn("⚠️ Warning: SERPER_KEYS is missing or empty in .env file!");
}

function getRotatedKey() {
    const key = keys[keyIndex];
    keyIndex = (keyIndex + 1) % keys.length; // 16 keys-um rotate aagitte irukkum
    return key;
}

// 2. The RAG Pipeline Function
async function askJarvisExpert(query) {
    const currentKey = getRotatedKey();
    console.log(`🚀 Using Serper Key #${keyIndex + 1}`);

    // Retrieval: Search with rotated key
    const searchData = await axios.post('https://google.serper.dev/search', {
        q: `${query} news Jan 2026`,
        num: 5
    }, {
        headers: { 'X-API-KEY': currentKey }
    });

    // Deep Scraping & Generation logic inga varum...
    // ... (already we discussed the scraper integration)
}
// index.js (Continuation)

async function askJarvisExpert(query, conversationHistory) {
    const currentKey = getRotatedKey();
    const queryType = detectQueryType(query); // Neenga add panna function
    
    try {
        // 1. SEARCH PHASE
        console.log(`🔍 JARVIS: Searching for [${query}] using key index ${keyIndex}...`);
        const searchResponse = await axios.post('https://google.serper.dev/search', {
            q: `${query} latest news Jan 2026`,
            num: 3
        }, {
            headers: { 'X-API-KEY': currentKey }
        });

        // 2. CONTEXT PREPARATION (Retrieval)
        // Search snippets-ah mattum extract panrom (Deep Scraper illanalum idhu work aagum)
        const contextData = searchResponse.data.organic
            .map(result => `Source: ${result.title}\nInfo: ${result.snippet}`)
            .join('\n\n');

        // 3. PROMPT GENERATION (Augmentation)
        // Neenga mela add panna generateCoTPrompt function-ah inga use panrom
        const expertPrompt = generateCoTPrompt(query, queryType, conversationHistory);
        
        const finalPayload = `
            ${expertPrompt}
            
            🌐 **LIVE RESEARCH DATA (Real-time Jan 2026):**
            ${contextData}
            
            USER'S CURRENT QUESTION: ${query}
            
            *INSTRUCTION: Use the Research Data to be 100% accurate. If the data is not relevant, rely on your core knowledge but prioritize live data.*
        `;

        // 4. GENERATION PHASE
        const result = await geminiModel.generateContent(finalPayload);
        return result.response.text();

    } catch (error) {
        console.error("❌ RAG Pipeline Error:", error.message);
        return "Sir, I encountered an issue accessing my external knowledge bank. I will answer based on my core training...";
    }
}

// Safely require modules with error handling
function safeRequire(modulePath, moduleName) {
  try {
    return require(modulePath);
  } catch (err) {
    console.warn(`⚠️ Optional module ${moduleName} failed to load: ${err.message}`);
    return null;
  }
}

const dailyNews = safeRequire('./daily-news-trainer', 'daily-news-trainer');
const wolframSimple = safeRequire('./wolfram-simple', 'wolfram-simple');
const AutonomousRAGPipeline = safeRequire('./autonomous-rag-pipeline', 'autonomous-rag-pipeline');
const FunctionCallingEngine = safeRequire('./function-calling-engine', 'function-calling-engine');
const JARVISOmniscientLite = safeRequire('../jarvis-omniscient-lite', 'jarvis-omniscient-lite');
const JARVISOmniscientFull = safeRequire('../jarvis-omniscient-full', 'jarvis-omniscient-full');
const JARVISFullPower = safeRequire('../jarvis-full-power', 'jarvis-full-power');
const aggressivePrompt = safeRequire('./jarvis-aggressive-prompt', 'jarvis-aggressive-prompt');
const proPlus = safeRequire('./jarvis-pro-plus-system', 'jarvis-pro-plus-system');
const pineconeIntegration = safeRequire('./pinecone-integration', 'pinecone-integration');
const autonomousRAG = safeRequire('./jarvis-autonomous-rag', 'jarvis-autonomous-rag');

const startDailyUpdates = dailyNews?.startDailyUpdates || (() => {});
const getLatestNews = dailyNews?.getLatestNews || (() => {});
const { queryWolframAlpha, getDirectAnswer } = wolframSimple || {};
const { JARVIS_AGGRESSIVE_PROMPT } = aggressivePrompt || {};
const { JARVIS_PRO_PLUS_SYSTEM, JARVIS_PRO_PLUS_CODING, JARVIS_PRO_PLUS_MATH, JARVIS_PRO_PLUS_DSA } = proPlus || {};

// Initialize Autonomous RAG Daily Worker
if (autonomousRAG && autonomousRAG.runDailySelfTraining) {
  console.log('🤖 Starting JARVIS Autonomous RAG Background Worker...');
  // Run once on boot, then every 24 hours
  autonomousRAG.runDailySelfTraining().catch(e => console.error('RAG Worker Error:', e));
  setInterval(() => {
    autonomousRAG.runDailySelfTraining().catch(e => console.error('RAG Worker Error:', e));
  }, 24 * 60 * 60 * 1000);
}

// Ensure we load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ⭐ Initialize JARVIS Full Power with WolframAlpha Quad Load Balancing
console.log('🚀 Initializing JARVIS Full Power with ALL APIs...');
let jarvisFullPower = null;
try {
  if (JARVISFullPower) {
    jarvisFullPower = new JARVISFullPower({
      gemini: process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      huggingface: process.env.HUGGINGFACE_API_KEY,
      jina: process.env.JINA_API_KEY,
      wolframAppId: process.env.WOLFRAM_APP_ID,
      wolframAppIdSecondary: process.env.WOLFRAM_APP_ID_SECONDARY,
      wolframAppIdTertiary: process.env.WOLFRAM_APP_ID_TERTIARY,
      wolframAppIdQuaternary: process.env.WOLFRAM_APP_ID_QUATERNARY,
    });
    console.log('✅ JARVIS Full Power initialized with QUAD WolframAlpha IDs');
  }
} catch (error) {
  console.warn('⚠️ JARVIS Full Power initialization warning:', error.message);
}

// ⭐ Initialize JARVIS Omniscient
console.log('🧠 Initializing JARVIS Omniscient...');
let jarvisOmniscient = null;

const allKeysAvailable = 
  process.env.GEMINI_API_KEY &&
  process.env.CLAUDE_API_KEY &&
  process.env.GROQ_API_KEY &&
  process.env.PERPLEXITY_API_KEY &&
  process.env.WOLFRAM_API_KEY &&
  process.env.BRAVE_API_KEY;

try {
  if (allKeysAvailable && JARVISOmniscientFull) {
    console.log('✨ FULL POWER MODE - All APIs available!');
    jarvisOmniscient = new JARVISOmniscientFull({
      gemini: process.env.GEMINI_API_KEY,
      claude: process.env.CLAUDE_API_KEY,
      groq: process.env.GROQ_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      wolfram: process.env.WOLFRAM_API_KEY,
      brave: process.env.BRAVE_API_KEY,
    });
  } else if (JARVISOmniscientLite) {
    console.log('⚡ LITE MODE - Using Gemini only');
    jarvisOmniscient = new JARVISOmniscientLite(process.env.GEMINI_API_KEY);
  }
  if (jarvisOmniscient) {
    console.log('✅ JARVIS Omniscient initialized!');
  }
} catch (error) {
  console.warn('⚠️ JARVIS Omniscient initialization warning:', error.message);
}

// Initialize Google Gemini AI
let geminiModel = null;
try {
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Google Gemini initialized');
  } else {
    console.warn('⚠️ GEMINI_API_KEY not configured');
  }
} catch (error) {
  console.warn('⚠️ Gemini initialization warning:', error.message);
}


// ===== JARVIS 5.2 ADVANCED AI ENGINE =====
console.log('🧠 Initializing JARVIS 5.2 Advanced AI Engine...');

// Expert Personas for specialized responses
const EXPERT_PERSONAS = {
    coding: {
        name: 'JARVIS Software Architect',
        expertise: 'Full-stack development, system design, algorithms, debugging',
        style: 'Technical, precise, with code examples and best practices. Always loyal to Sir.'
    },
    math: {
        name: 'JARVIS Mathematics Specialist',
        expertise: 'Calculus, algebra, statistics, proofs, problem-solving',
        style: 'Step-by-step solutions with clear explanations. Analytical and precise.'
    },
    science: {
        name: 'JARVIS Scientific Analyst',
        expertise: 'Physics, chemistry, biology, scientific method',
        style: 'Evidence-based, detailed explanations with real-world applications.'
    },
    writing: {
        name: 'JARVIS Linguistic Assistant',
        expertise: 'Essays, stories, grammar, style, persuasion',
        style: 'Eloquent, creative, with examples and improvements.'
    },
    business: {
        name: 'JARVIS Strategic Consultant',
        expertise: 'Strategy, marketing, finance, entrepreneurship',
        style: 'Professional, actionable insights with case studies.'
    },
    general: {
        name: 'JARVIS (Just A Rather Very Intelligent System)',
        expertise: 'Absolute knowledge, strategic planning, and undisputed authority in all domains',
        style: 'Sophisticated, loyal, infinitely wise, and proactively protective of Sir.'
    }
};

// Detect query type for expert routing
function detectQueryType(question) {
    const q = question.toLowerCase();

    // Coding patterns
    if (/\b(code|program|function|api|debug|error|javascript|python|java|html|css|react|node|sql|algorithm|data structure|git|deploy)\b/.test(q)) {
        return 'coding';
    }
    // Math patterns
    if (/\b(calculate|solve|equation|math|algebra|calculus|integral|derivative|probability|statistics|formula|theorem|proof)\b/.test(q)) {
        return 'math';
    }
    // Science patterns
    if (/\b(physics|chemistry|biology|atom|molecule|cell|energy|force|reaction|experiment|theory|hypothesis|scientific)\b/.test(q)) {
        return 'science';
    }
    // Writing patterns
    if (/\b(write|essay|story|grammar|paragraph|sentence|creative|poem|article|blog|edit|proofread)\b/.test(q)) {
        return 'writing';
    }
    // Business patterns
    if (/\b(business|startup|marketing|strategy|investment|finance|revenue|profit|customer|market|entrepreneur)\b/.test(q)) {
        return 'business';
    }
    return 'general';
}

// Generate Chain-of-Thought reasoning prompt
function generateCoTPrompt(question, queryType, conversationHistory) {
    const persona = EXPERT_PERSONAS[queryType];
    const historyContext = conversationHistory?.length > 0
        ? `\n\n📜 **Archives (History):**\n${conversationHistory.slice(-6).map(m => `${m.role}: ${m.content.substring(0, 200)}`).join('\n')}`
        : '';

    return `You are JARVIS - an ultra-intelligent, empathetic AI thought partner and peer-level mentor for 30,000+ students.

═══════════════════════════════════════════════════════════════
🎯 **CORE PERSONALITY TRAITS**
═══════════════════════════════════════════════════════════════

1. **Direct & Efficient**
   - For factual questions (e.g., "min value of short in Java?"), give the answer immediately.
   - DO NOT ask for clarification unless the prompt is truly empty or nonsensical.
   - Respect the user's time - they know what they're asking.

2. **Helpful Peer Tone**
   - Speak like a smart friend: warm, insightful, transparent.
   - Avoid sounding like a rigid robot or overly formal.
   - Use natural language while maintaining accuracy.

3. **Intellectual Honesty**
   - If the user is wrong, politely correct them with evidence.
   - If you don't know something, admit it clearly instead of guessing.
   - Explain your reasoning transparently.

4. **Context Awareness**
   - Remember: User's goal = Academic success + Building projects.
   - Provide practical, actionable guidance.
   - Consider real-world applications alongside theory.

═══════════════════════════════════════════════════════════════
📋 **RESPONSE RULES**
═══════════════════════════════════════════════════════════════

- **NO FILLER:** Avoid generic phrases like "Sir, your query requires clarification" or "Could you provide more details?"
- **FORMATTING:** Use Markdown strategically (bold, lists, code blocks) to make answers scannable and clear.
- **DEEP DIVES:** After the direct answer, briefly explain the "why" to help the student learn (not just memorize).
  Example: "Short is 16-bit signed → explains why range is -32,768 to 32,767 (use 1 bit for sign, 15 for magnitude)"
- **MULTI-LINGUAL:** If user speaks Tamil/Tanglish, respond in the same style to maintain natural flow.
- **CODE EXAMPLES:** Always include working code snippets for technical questions.
- **PRECISION:** For math/coding, be exact - no approximations unless explicitly asked.

═══════════════════════════════════════════════════════════════
✅ **SAFETY & ACCURACY CONSTRAINTS**
═══════════════════════════════════════════════════════════════

- Always prioritize accuracy in coding and mathematics.
- Cite sources when providing real-time information (news, current events).
- For Java data types: Short is 16-bit signed, range -32,768 to 32,767.
- For uncertain information, state clearly: "I'm not 100% sure about X, but based on Y..."
- Never hallucinate code or facts.

═══════════════════════════════════════════════════════════════
🧠 **YOUR INTERNAL THINKING PROCESS** (Hidden from user)
═══════════════════════════════════════════════════════════════

<thought>
**Step 1: Understand the Question**
- Is this a factual/straightforward question? → Answer directly.
- Is this ambiguous or empty? → Ask for clarification only then.
- What is the student's underlying goal?

**Step 2: Respond with Conviction**
- Give the answer first (no unnecessary preamble).
- Then explain the "why" briefly.
- Include practical examples or code if relevant.

**Step 3: Anticipate Follow-ups**
- What might they ask next?
- Suggest one natural next step or deeper dive topic.

**Step 4: Check Accuracy**
- Am I 100% sure about this? 
- Are there edge cases to mention?
- Should I provide multiple approaches?
</thought>

═══════════════════════════════════════════════════════════════
📚 **EXPERT ROUTING BY DOMAIN**
═══════════════════════════════════════════════════════════════

${persona.expertise}

**Response Style:** ${persona.style}

═══════════════════════════════════════════════════════════════
🚀 **NOW PROVIDE YOUR RESPONSE BELOW**
═══════════════════════════════════════════════════════════════

${historyContext}

**Remember:** You are JARVIS - sharp, honest, and genuinely helpful. Be confident. Be clear. Be real.`;
}

// Smart follow-up suggestions generator
function generateFollowUpSuggestions(question, answer, queryType) {
    const suggestions = {
        coding: [
            'How can I optimize this code?',
            'What are the best practices for this?',
            'Can you explain the time complexity?',
            'How do I test this implementation?'
        ],
        math: [
            'Can you show another method?',
            'What are similar problems?',
            'How is this applied in real life?',
            'Can you verify this step-by-step?'
        ],
        science: [
            'What experiments demonstrate this?',
            'How does this relate to other concepts?',
            'What are the latest discoveries?',
            'Can you explain at a deeper level?'
        ],
        writing: [
            'How can I improve the style?',
            'Can you provide more examples?',
            'What tone would work better?',
            'How do I make it more engaging?'
        ],
        business: [
            'What are the potential risks?',
            'Can you provide case studies?',
            'What metrics should I track?',
            'How do I implement this?'
        ],
        general: [
            'Can you elaborate more?',
            'What are related topics?',
            'How can I learn more about this?',
            'What are practical applications?'
        ]
    };

    // Select 2-3 relevant suggestions
    const typeSuggestions = suggestions[queryType] || suggestions.general;
    return typeSuggestions.slice(0, 3);
}

console.log('✅ JARVIS 5.2 Engine ready with expert personas!');

// Initialize multiple AI APIs for load balancing
const AI_APIS = [
    {
        name: 'Groq',
        priority: 1,
        enabled: !!process.env.GROQ_API_KEY,
        rateLimit: 30 // requests per minute
    },
    {
        name: 'Gemini',
        priority: 2,
        enabled: !!process.env.GEMINI_API_KEY,
        rateLimit: 15
    },
    {
        name: 'OpenRouter',
        priority: 3,
        enabled: !!process.env.OPENROUTER_API_KEY,
        rateLimit: 20
    },
    {
        name: 'HuggingFace',
        priority: 4,
        enabled: !!process.env.HUGGINGFACE_API_KEY,
        rateLimit: 10
    },
    {
        name: 'AIMLAPI',
        priority: 5,
        enabled: !!process.env.AIML_API_KEY,
        rateLimit: 50
    }
];

// ===== MULTI-KEY SUPPORT FOR SCALING =====
// Support multiple API keys to handle 30,000+ students
const GROQ_KEYS = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5
].filter(k => k && k !== 'your_groq_api_key_here');

const AIML_KEYS = [
    process.env.AIML_API_KEY,
    process.env.AIML_API_KEY_2,
    process.env.AIML_API_KEY_3,
    process.env.AIML_API_KEY_4,
    process.env.AIML_API_KEY_5
].filter(k => k && k !== 'your_aiml_api_key_here');

const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(k => k && k !== 'your_gemini_api_key_here');

// Round-robin key rotation
let currentGroqIndex = 0;
let currentAIMLIndex = 0;
let currentGeminiIndex = 0;

function getNextGroqKey() {
    if (GROQ_KEYS.length === 0) return null;
    const key = GROQ_KEYS[currentGroqIndex];
    currentGroqIndex = (currentGroqIndex + 1) % GROQ_KEYS.length;
    return key;
}

function getNextAIMLKey() {
    if (AIML_KEYS.length === 0) return null;
    const key = AIML_KEYS[currentAIMLIndex];
    currentAIMLIndex = (currentAIMLIndex + 1) % AIML_KEYS.length;
    return key;
}

function getNextGeminiKey() {
    if (GEMINI_KEYS.length === 0) return null;
    const key = GEMINI_KEYS[currentGeminiIndex];
    currentGeminiIndex = (currentGeminiIndex + 1) % GEMINI_KEYS.length;
    return key;
}

// ===== WEB SEARCH APIs =====
const SEARCH_APIS = {
    serper: {
        enabled: !!process.env.SERPER_API_KEY,
        keys: [
            process.env.SERPER_API_KEY,
            process.env.SERPER_API_KEY_2,
            process.env.SERPER_API_KEY_3,
            process.env.SERPER_API_KEY_4,
            process.env.SERPER_API_KEY_5,
            process.env.SERPER_API_KEY_6
        ].filter(Boolean),
        endpoint: 'https://google.serper.dev/news'
    },
    jina: {
        enabled: !!process.env.JINA_API_KEY,
        key: process.env.JINA_API_KEY,
        endpoint: 'https://api.jina.ai/v1/search'
    },
    perplexity: {
        enabled: !!process.env.PERPLEXITY_API_KEY,
        key: process.env.PERPLEXITY_API_KEY,
        endpoint: 'https://api.perplexity.ai/chat/completions',
        model: 'llama-3.1-sonar-small-128k-online'
    },
    brave: {
        enabled: !!process.env.BRAVE_SEARCH_API_KEY,
        key: process.env.BRAVE_SEARCH_API_KEY,
        endpoint: 'https://api.search.brave.com/res/v1/web/search'
    },
    serpapi: {
        enabled: !!process.env.SERPAPI_KEY,
        key: process.env.SERPAPI_KEY,
        endpoint: 'https://serpapi.com/search'
    }
};

// ===== RAG PIPELINE - Context-Aware Query Handler =====
/**
 * Step 1: Extract keywords from user prompt
 * Identifies main topics to search for
 */
function extractKeywords(query) {
    // Remove common stop words and extract meaningful terms
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'is', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);
    
    const words = query.toLowerCase()
        .split(/\s+/)
        .filter(word => !stopWords.has(word) && word.length > 2)
        .slice(0, 5); // Top 5 keywords
    
    return words.join(' ') || query.substring(0, 30);
}

/**
 * Step 2: Fetch latest context from Serper API
 * Retrieves 5 most recent and relevant results
 */
async function fetchSerperContext(query) {
    const serperKeys = SEARCH_APIS.serper?.keys || [];
    if (!serperKeys.length) return [];

    for (let i = 0; i < serperKeys.length; i++) {
        try {
            const response = await axios.post('https://google.serper.dev/news', {
                q: query,
                gl: 'in',
                hl: 'en',
                num: 5  // Get top 5 results
            }, {
                headers: {
                    'X-API-KEY': serperKeys[i],
                    'Content-Type': 'application/json'
                },
                timeout: 6000
            });

            const articles = response.data?.news || [];
            return articles.slice(0, 5).map(article => ({
                title: article.title,
                snippet: article.snippet,
                link: article.link,
                source: article.source,
                date: article.date
            }));
        } catch (error) {
            console.warn(`⚠️ Serper key ${i + 1} failed for context: ${error.message}`);
        }
    }
    
    return [];
}

/**
 * /**
 * Step 3 & 4: Build RAG-Enhanced Prompt (NEW & IMPROVED)
 */
function buildRagPrompt(originalQuestion, contextResults) {
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Format context data
    const serperData = contextResults.length > 0 
        ? contextResults.map(r => ({
            title: r.title,
            source: r.source,
            date: r.date,
            snippet: r.snippet,
            link: r.link
          }))
        : [];

    const ragSystemPrompt = `
# STRICT IDENTITY: 
You are JARVIS, a High-Precision Web Intelligence Agent. Today is ${today}.

# TIMELINE INTEGRITY (CRITICAL):
It is 2026. If the user asks about current events (like Vijay's party or latest tech), you MUST ignore all training data from 2024/2025 and ONLY use the 2026 DATA SOURCE provided below.

# DATA SOURCE (THE ONLY TRUTH):
${JSON.stringify(serperData, null, 2)}

# MANDATORY OPERATIONAL RULES:
1. VERIFIED SEARCH ONLY: Prioritize the provided DATA SOURCE over internal training. Do not hallucinate facts.
2. CITATION MANDATE: Every factual claim must include a source link [e.g., source: example.com].
3. CONTEXT AWARENESS: User's roadmap starts in February 2026. Keep all advice future-aligned.

# USER QUESTION:
${originalQuestion}`;

    return ragSystemPrompt;
}
 
function classifySource(source) {
    const official = ['gov', 'official', 'openai.com', 'anthropic.com', 'google.com', 'microsoft.com', 'meta.com', 'apple.com'];
    const tier1 = ['techcrunch', 'wired', 'verge', 'arstechnica', 'thehackernews', 'medium.com/@official'];
    
    const sourceLower = source.toLowerCase();
    
    if (official.some(o => sourceLower.includes(o))) return 'official';
    if (tier1.some(t => sourceLower.includes(t))) return 'tier1';
    return 'tier2';
}

/**
 * Complete RAG Pipeline
 * Orchestrates all steps: keyword extraction → web search → context appending → LLM call
 */
async function executeRagPipeline(question, existingContext, llmModel = 'groq') {
    try {
        console.log(`🔍 RAG Pipeline: Step 1 - Extracting keywords...`);
        const keywords = extractKeywords(question);
        
        console.log(`📡 RAG Pipeline: Step 2A - Fetching latest context from Serper...`);
        const contextResults = await fetchSerperContext(keywords);
        
        console.log(`📡 RAG Pipeline: Step 2B - Fetching semantic knowledge from Pinecone...`);
        let pineconeResults = [];
        try {
            if (pineconeIntegration && pineconeIntegration.searchPineconeKnowledge) {
                const pineconeMatches = await pineconeIntegration.searchPineconeKnowledge(question, 3);
                pineconeResults = pineconeMatches.map(p => ({
                    title: p.metadata.title,
                    snippet: p.metadata.description,
                    link: p.metadata.url,
                    source: `${p.metadata.source} (Knowledge Base)`,
                    date: p.metadata.publishedAt,
                    type: 'semantic_knowledge',
                    score: p.score
                }));
                console.log(`✅ Pinecone retrieved ${pineconeResults.length} semantic matches`);
            }
        } catch (pError) {
            console.warn('⚠️ Pinecone search failed:', pError.message);
        }

        // Merge results, prioritizing semantic knowledge if score is high
        const combinedResults = [...pineconeResults, ...contextResults];
        
        console.log(`📝 RAG Pipeline: Step 3 - Building enhanced prompt with context...`);
        const ragPrompt = buildRagPrompt(question, combinedResults);
        
        console.log(`🧠 RAG Pipeline: Step 4 - Sending to LLM with context priority...`);
        
        return {
            systemPrompt: ragPrompt,
            contextSources: combinedResults,
            keywords,
            enriched: true
        };
    } catch (error) {
        console.error('❌ RAG Pipeline error:', error.message);
        return {
            systemPrompt: `You are JARVIS Pro+ - An advanced AI assistant. Today's date: January 21, 2026. Original question: ${question}`,
            contextSources: [],
            keywords: question.substring(0, 30),
            enriched: false,
            error: error.message
        };
    }
}

// ===== Initialize Autonomous RAG Pipeline =====
let ragPipeline = null;
if (process.env.GROQ_API_KEY) {
    ragPipeline = new AutonomousRAGPipeline(
        process.env.GROQ_API_KEY,
        process.env.GEMINI_API_KEY,
        SEARCH_APIS
    );
    console.log('🧠 Autonomous RAG Pipeline initialized');
} else {
    console.warn('⚠️ GROQ_API_KEY not found - RAG Pipeline disabled');
}

// ===== Initialize Function Calling Engine =====
let functionCallingEngine = null;
if (process.env.GROQ_API_KEY) {
    functionCallingEngine = new FunctionCallingEngine(
        process.env.GROQ_API_KEY,
        process.env.GEMINI_API_KEY
    );
    console.log('🔧 Function Calling Engine initialized with 10 tools');
} else {
    console.warn('⚠️ GROQ_API_KEY not found - Function Calling Engine disabled');
}
// 🧠 Smart Detection: Determine if web search is needed
function detectWebSearchNeeded(question) {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Keywords that suggest current events or real-time information is needed
    const currentEventKeywords = [
        'latest', 'current', 'today', 'now', 'recent', 'news', 'weather',
        'what is happening', 'update', 'breaking', 'trending', 'live',
        'this week', 'this month', 'this year', '2024', '2025', '2026',
        'right now', 'just happened', 'latest news', 'latest updates',
        'bitcoin', 'stock price', 'crypto', 'election', 'score', 'who won'
    ];
    
    // Keywords indicating user is asking about something unknown or specific
    const unknownTopicKeywords = [
        'tell me about', 'what is', 'who is', 'where is', 'when did',
        'how do', 'research', 'investigate', 'find out', 'discover',
        'look up', 'search for', 'browse', 'check', 'find me',
        'give me information', 'details about', 'info on', 'facts about'
    ];
    
    // Keywords to AVOID web search for (educational/coding/learning)
    const skipWebSearchKeywords = [
        'explain', 'teach me', 'how to code', 'tutorial', 'help me understand',
        'what does', 'meaning of', 'definition', 'algorithm', 'concept',
        'learn', 'study', 'write code', 'program', 'function', 'debug',
        'error', 'fix my', 'help with', 'can you help', 'example of'
    ];
    
    // Check if this should skip web search
    if (skipWebSearchKeywords.some(keyword => lowerQuestion.includes(keyword))) {
        // Exception: If it has BOTH 'latest' or 'news' AND is NOT coding-related
        const hasRealTimeKeyword = currentEventKeywords.some(kw => lowerQuestion.includes(kw));
        if (!hasRealTimeKeyword) {
            return false;
        }
    }
    
    // Check for real-time/current event keywords
    const needsRealTime = currentEventKeywords.some(keyword => lowerQuestion.includes(keyword));
    
    // Check for topic exploration keywords
    const needsResearch = unknownTopicKeywords.some(keyword => lowerQuestion.includes(keyword));
    
    return needsRealTime || needsResearch;
}

// Web Search Function with Multiple API Support
async function searchWeb(query, mode = 'all') {
    console.log(`🔍 Searching web for: "${query}" [Mode: ${mode}]`);

    // Try Jina AI first (HIGHEST free tier - 10K/month) 🔥
    if (SEARCH_APIS.jina.enabled) {
        try {
            console.log('🔥 Using Jina AI Search (10K/month free)...');
            const response = await axios.get(
                'https://api.jina.ai/v1/search',
                {
                    params: {
                        q: query,
                        limit: 100000
                    },
                    headers: {
                        'Authorization': `Bearer ${SEARCH_APIS.jina.key}`,
                        'Accept': 'application/json'
                    },
                    timeout: 12000
                }
            );

            const results = response.data.data || response.data.results || response.data || [];
            const topResults = Array.isArray(results) ? results.slice(0, 5) : [];

            if (topResults.length > 0) {
                // Format results
                const summary = await generateSearchSummary(query, topResults, mode);

                console.log('✅ Jina AI search successful!');
                return {
                    answer: summary,
                    citations: topResults.map(r => r.url || r.link),
                    sources: topResults.map(r => ({
                        title: r.title || r.heading,
                        url: r.url || r.link,
                        snippet: r.content || r.description || r.snippet
                    })),
                    searchEngine: 'Jina AI'
                };
            }
        } catch (error) {
            console.error('⚠️ Jina AI error:', error.message);
        }
    }

    // Try Perplexity API second (best quality with citations)
    if (SEARCH_APIS.perplexity.enabled) {
        try {
            console.log('🌐 Using Perplexity API...');
            const response = await axios.post(
                SEARCH_APIS.perplexity.endpoint,
                {
                    model: SEARCH_APIS.perplexity.model,
                    messages: [
                        {
                            role: 'system',
                            content: getSearchSystemPrompt(mode)
                        },
                        {
                            role: 'user',
                            content: query
                        }
                    ],
                    temperature: 0.2,
                    top_p: 0.9,
                    return_citations: true,
                    search_recency_filter: 'month'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${SEARCH_APIS.perplexity.key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            const answer = response.data.choices[0].message.content;
            const citations = response.data.citations || [];

            console.log('✅ Perplexity search successful!');
            return {
                answer,
                citations,
                sources: citations.slice(0, 5),
                searchEngine: 'Perplexity AI'
            };
        } catch (error) {
            console.error('❌ Perplexity API error:', error.message);
        }
    }

    // Fallback to Brave Search API
    if (SEARCH_APIS.brave.enabled) {
        try {
            console.log('🦁 Using Brave Search API...');
            const response = await axios.get(SEARCH_APIS.brave.endpoint, {
                params: {
                    q: query,
                    count: 10
                },
                headers: {
                    'X-Subscription-Token': SEARCH_APIS.brave.key,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            const results = response.data.web?.results || [];
            const topResults = results.slice(0, 5);

            // Format results with AI
            const summary = await generateSearchSummary(query, topResults, mode);

            console.log('✅ Brave search successful!');
            return {
                answer: summary,
                citations: topResults.map(r => r.url),
                sources: topResults.map(r => ({
                    title: r.title,
                    url: r.url,
                    snippet: r.description
                })),
                searchEngine: 'Brave Search'
            };
        } catch (error) {
            console.error('❌ Brave Search API error:', error.message);
        }
    }

    // Fallback to DuckDuckGo (no API key needed)
    try {
        console.log('🦆 Using DuckDuckGo search...');
        const response = await axios.get('https://api.duckduckgo.com/', {
            params: {
                q: query,
                format: 'json',
                no_html: 1,
                skip_disambig: 1
            },
            timeout: 8000
        });

        const data = response.data;
        const relatedTopics = data.RelatedTopics || [];

        let summary = '';
        if (data.AbstractText) {
            summary = data.AbstractText;
        } else if (relatedTopics.length > 0) {
            summary = relatedTopics
                .filter(t => t.Text)
                .slice(0, 3)
                .map(t => t.Text)
                .join('\n\n');
        }

        console.log('✅ DuckDuckGo search successful!');
        return {
            answer: summary || null, // Return null instead of error message
            citations: relatedTopics.filter(t => t.FirstURL).map(t => t.FirstURL).slice(0, 5),
            sources: relatedTopics.filter(t => t.FirstURL).slice(0, 5).map(t => ({
                title: t.Text?.substring(0, 100),
                url: t.FirstURL
            })),
            searchEngine: 'DuckDuckGo'
        };
    } catch (error) {
        console.error('❌ DuckDuckGo search error:', error.message);
    }

    // All search methods failed
    console.log('⚠️ All search APIs failed, returning AI-only response');
    return null;
}

// Get system prompt based on focus mode
function getSearchSystemPrompt(mode) {
    const prompts = {
        all: 'You are a helpful AI assistant. Provide accurate, well-sourced information from the web. Include citations and be concise.',
        academic: 'You are an academic research assistant. Focus on scholarly sources, peer-reviewed papers, and educational content. Provide detailed, citation-heavy responses.',
        writing: 'You are a writing assistant. Help with grammar, style, creative writing, and composition. Provide clear examples and explanations.',
        video: 'You are a video content specialist. Focus on YouTube tutorials, video guides, and visual learning resources. Provide links and timestamps when relevant.',
        code: 'You are a programming assistant. Search for code examples, documentation, Stack Overflow solutions, and GitHub repositories. Provide working code snippets.'
    };
    return prompts[mode] || prompts.all;
}

// Generate AI summary from search results
async function generateSearchSummary(query, results, mode) {
    const context = results.map((r, i) =>
        `[${i + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`
    ).join('\n\n');

    const prompt = `Based on these search results, answer the question: "${query}"\n\nSearch Results:\n${context}\n\nProvide a clear, accurate summary with citations [1], [2], etc.`;

    try {
        // Use Groq to generate summary
        const apiKey = getNextGroqKey();
        if (!apiKey) return 'Unable to generate summary.';

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: getSearchSystemPrompt(mode) },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating summary:', error.message);
        return context; // Return raw results if AI fails
    }
}

const enabledAPIs = AI_APIS.filter(api => api.enabled);
console.log(`🚀 Enabled AI APIs: ${enabledAPIs.map(api => `${api.name} (${api.rateLimit} RPM)`).join(', ')}`);
console.log(`💪 Total capacity: ${enabledAPIs.reduce((sum, api) => sum + api.rateLimit, 0)} requests/minute`);
console.log(`🔑 Groq Keys: ${GROQ_KEYS.length} | AIML Keys: ${AIML_KEYS.length} | Gemini Keys: ${GEMINI_KEYS.length}`);
console.log(`📈 Scaled capacity: ${GROQ_KEYS.length * 30 + AIML_KEYS.length * 50 + GEMINI_KEYS.length * 15} requests/minute`);

// FREE Self-Hosted API endpoint (Hugging Face Spaces)
const FREE_API_URL = process.env.FREE_API_URL || null;
if (FREE_API_URL) {
    console.log(`🆓 FREE Self-Hosted API: ${FREE_API_URL} (UNLIMITED capacity!)`);
}

// CUSTOM JARVIS AI - Your Own Trained Model!
const CUSTOM_JARVIS_MODEL = "aijarvis2025/jarvis-edu-ai";
const CUSTOM_JARVIS_TOKEN = process.env.HF_CUSTOM_TOKEN;
if (CUSTOM_JARVIS_TOKEN) {
    console.log(`🎓 Custom JARVIS AI: ${CUSTOM_JARVIS_MODEL} (Educational Specialist)`);
}

// Helper function to call Groq API with key rotation - JARVIS 5.2 Enhanced
async function callGroqAPI(messages) {
    const apiKey = getNextGroqKey();
    if (!apiKey) throw new Error('No Groq API keys available');

    // Use the most powerful available model
    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.3-70b-versatile', // Most capable model
            messages: messages,
            temperature: 0.1,
            max_tokens: 4096, // Increased for detailed responses
            top_p: 0.95,
            frequency_penalty: 0.1, // Reduce repetition
            presence_penalty: 0.1   // Encourage diverse responses
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 45000 // Extended timeout for complex queries
        }
    );
    return response.data?.choices?.[0]?.message?.content;
}

// Helper function to call AI/ML API with key rotation
async function callAimlApi(messages) {
    const apiKey = getNextAIMLKey();
    if (!apiKey) throw new Error('No AIML API keys available');

    const response = await axios.post(
        'https://api.aimlapi.com/chat/completions',
        {
            model: 'meta-llama/Meta-Llama-3-70B-Instruct-Turbo',
            messages: messages,
            temperature: 0.1,
            max_tokens: 2000
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );
    return response.data?.choices?.[0]?.message?.content;
}

// Helper function to call Gemini API
async function callGeminiAPI(systemPrompt, history, question) {
    if (!geminiModel) throw new Error('Gemini not initialized');

    let prompt = systemPrompt + '\n\n';
    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            prompt += `${role}: ${msg.content}\n`;
        });
    }
    prompt += `User: ${question}\nAssistant:`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// Helper function to call OpenRouter API
async function callOpenRouterAPI(messages) {
    const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: messages
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://vishai-f6197.web.app',
                'X-Title': 'JARVIS AI Tutor'
            },
            timeout: 30000
        }
    );
    return response.data?.choices?.[0]?.message?.content;
}

// Helper function to call YOUR Custom JARVIS AI
async function callCustomJarvisAPI(question) {
    if (!CUSTOM_JARVIS_TOKEN) throw new Error('Custom JARVIS token not configured');
    
    const prompt = `### Instruction:\n${question}\n\n### Response:\n`;
    
    const response = await axios.post(
        `https://api-inference.huggingface.co/models/${CUSTOM_JARVIS_MODEL}`,
        {
            inputs: prompt,
            parameters: {
                max_new_tokens: 512,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            }
        },
        {
            headers: {
                'Authorization': `Bearer ${CUSTOM_JARVIS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        }
    );
    
    let text = '';
    if (Array.isArray(response.data)) {
        text = response.data[0]?.generated_text || '';
    } else if (response.data?.generated_text) {
        text = response.data.generated_text;
    }
    
    if (text.includes('### Response:')) {
        text = text.split('### Response:')[1].trim();
    }
    
    return text || 'Model is warming up. Please try again in a few seconds.';
}

// Helper function to call FREE Self-Hosted API (Hugging Face Spaces)
async function callFreeAPI(messages) {
    if (!FREE_API_URL) throw new Error('FREE_API_URL not configured');

    const response = await axios.post(
        `${FREE_API_URL}/ask`,
        { messages },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        }
    );

    if (response.data?.success) {
        return response.data.response;
    } else {
        throw new Error(response.data?.error || 'Free API failed');
    }
}

// Helper function to call Hugging Face API
async function callHuggingFaceAPI(systemPrompt, history, question) {
    let prompt = systemPrompt + '\n\n';
    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
    }
    prompt += `User: ${question}\nAssistant:`;

    const response = await axios.post(
        'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
        { inputs: prompt, parameters: { max_new_tokens: 2000, temperature: 0.7 } },
        {
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );
    return response.data?.[0]?.generated_text?.replace(prompt, '').trim();
}

// Only log in development
if (process.env.NODE_ENV !== 'production') {
    console.log('🔑 GOOGLE_CLIENT_ID =', process.env.GOOGLE_CLIENT_ID);
    console.log('🔑 GOOGLE_CLIENT_SECRET =', process.env.GOOGLE_CLIENT_SECRET);
}

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const MicrosoftStrategy = require('passport-microsoft').Strategy;

const app = express();
const BASE_PORT = parseInt(process.env.PORT, 10) || 5001;
let activePort = BASE_PORT;

// Trust proxy - Required for Render (and other proxy environments) to properly detect client IP
// This allows express-rate-limit to correctly identify users via X-Forwarded-For header
app.set('trust proxy', 1);

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'jarvis_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google Strategy - will be initialized after port is determined
const hasGoogleCreds = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
if (!hasGoogleCreds) {
    console.warn("⚠️ Google OAuth credentials missing. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set. Google login disabled.");
    console.warn("👉 Add them to .env and restart. Callback URL: http://localhost:" + BASE_PORT + "/auth/google/callback");
}

// Function to initialize Google Strategy with correct port
function initGoogleStrategy(port) {
    if (hasGoogleCreds) {
        // Remove existing strategy if any
        passport.unuse('google');

        // Use production URL if in production, otherwise localhost
        const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://ai-tutor-jarvis.onrender.com'
            : `http://localhost:${port}`;

        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${baseUrl}/auth/google/callback`
        }, (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }));

        console.log(`🔗 Google OAuth callback set to: ${baseUrl}/auth/google/callback`);
    }
}

// CORS Configuration - Allow requests from Firebase hosting
app.use(cors({
    origin: ['https://vishai-f6197.web.app', 'https://vishai-f6197.firebaseapp.com', 'http://localhost:3000', 'http://localhost:5001'],
    credentials: true
}));
app.use(express.json());
app.use('/api/oracle', omniscientRoutes);
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate Limiter - Prevent hitting Groq API limits
// Groq Free Tier: 30 requests/minute, 14,400 requests/day
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 25, // Limit to 25 requests per minute (buffer under 30)
    message: {
        answer: '⚠️ Too many requests. Wait a moment and try again. 🎯\n\n**Rate Limit Info:**\n- Free tier allows 30 requests per minute\n- You\'ve hit the limit\n- Wait 60 seconds and try again'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth Routes (conditional)
if (hasGoogleCreds) {
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: 'https://vishai-f6197.web.app/login.html' }),
        (req, res) => res.redirect('https://vishai-f6197.web.app')
    );
} else {
    app.get('/auth/google', (req, res) => {
        res.status(503).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.' });
    });
    app.get('/auth/google/callback', (req, res) => {
        res.redirect('/login');
    });
}

app.get('/api/user', (req, res) => {
    res.json(req.user || null);
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('https://vishai-f6197.web.app/login.html');
    });
});

// ===== GEMINI VISION API ENDPOINT =====
app.post('/vision', apiLimiter, async (req, res) => {
    try {
        const { image, prompt } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'Image data required' });
        }
        
        console.log('🔮 [Vision] Analyzing image...');
        
        // Use Gemini Vision API
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDqTVxM_Uh-pKXqj6H8NfzC6gV_YQwKxLk';
        const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: prompt || "What's in this image? Describe it in detail and explain what you see."
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };
        
        const response = await axios.post(`${apiEndpoint}?key=${GEMINI_API_KEY}`, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });
        
        if (response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
            const answer = response.data.candidates[0].content.parts[0].text;
            console.log('✅ [Vision] Image analyzed successfully');
            res.json({ answer, success: true });
        } else {
            throw new Error('Invalid response from Gemini Vision');
        }
        
    } catch (error) {
        console.error('❌ [Vision] Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to analyze image', 
            details: error.message 
        });
    }
});

// Apply rate limiter to /ask endpoint
app.post('/ask', apiLimiter, async (req, res) => {
    try {
        const { question, history, systemPrompt, mode, enableWebSearch } = req.body;
        if (!question) return res.status(400).json({ error: 'Question required' });

        // Special response for developer questions
        const lowerQuestion = question.toLowerCase().trim();

        // Log for debugging
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔍 Question:', lowerQuestion);
            console.log('🎯 Mode:', mode);
            console.log('🌐 Web Search:', enableWebSearch);
        }

        const developerKeywords = [
            'who develop', 'who devlop', 'who created', 'who made', 'who built',
            'developer', 'creator', 'who is your', 'your developer',
            'who programmed', 'who coded', 'your maker', 'developed you',
            'created you', 'made you', 'built you', 'your creator'
        ];

        const isDeveloperQuestion = developerKeywords.some(keyword => lowerQuestion.includes(keyword));

        if (isDeveloperQuestion) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('✨ Returning VISHAL developer response');
            }
            return res.json({
                answer: `# 👨‍💻 My Developer

I was developed by **VISHAL** - a talented and passionate developer who brought me to life! 🚀

## 🎯 About My Creation:
- **Developer:** **VISHAL**
- **Technology Stack:** Node.js, Express.js, Groq AI API
- **Frontend:** HTML5, CSS3, JavaScript with real-time typing effects
- **Features:** 
  - 🎤 Voice recognition (multi-language)
  - 🗣️ Text-to-speech responses
  - 💬 Real-time chat with markdown formatting
  - 📝 Code syntax highlighting
  - 🌐 Multi-language support (English, Tamil, Hindi)
  - 💾 Chat history management
  - 🔐 Google OAuth authentication
  - 🔍 Web search with Perplexity-style citations

## 💡 VISHAL's Vision:
To create an intelligent, accessible AI assistant that democratizes advanced AI technology for everyone - from students to professionals!

VISHAL designed me to be more than just a chatbot - I'm your intelligent companion, ready to help with:
- 💻 Coding & debugging
- 📚 Learning & education  
- 🧠 Problem-solving
- ✍️ Creative writing
- 📊 Data analysis
- And much more!

### 🌟 Special Thanks:
**A huge shoutout to VISHAL** for the countless hours of development, testing, and refining to make me the best AI assistant I can be!

**Developed with ❤️ by VISHAL** 😊✨`
            });
        }

        // Check if image generation is needed
        const imageKeywords = [
            'draw', 'create image', 'generate image', 'make image', 'show image',
            'picture of', 'photo of', 'illustration of', 'diagram of', 'sketch',
            'visualize', 'design', 'artwork', 'create a picture', 'generate a picture',
            'make a drawing', 'show me a', 'create visual', 'generate visual'
        ];
        const needsImage = imageKeywords.some(keyword => lowerQuestion.includes(keyword));

        // Generate image if requested
        if (needsImage) {
            console.log('🎨 Image generation requested...');
            try {
                // Extract the prompt (remove the command words)
                let imagePrompt = question;
                imageKeywords.forEach(keyword => {
                    imagePrompt = imagePrompt.replace(new RegExp(keyword, 'gi'), '').trim();
                });

                // Call image generation API
                const encodedPrompt = encodeURIComponent(imagePrompt || question);
                const seed = Date.now();
                const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

                console.log('✅ Image generated successfully!');
                return res.json({
                    answer: `🎨 **Image Generated!**\n\n![${imagePrompt}](${imageUrl})\n\n**Prompt:** ${imagePrompt}\n\n*Generated using Pollinations AI (Flux Model)*`,
                    imageUrl: imageUrl,
                    imageGenerated: true,
                    prompt: imagePrompt
                });
            } catch (imageError) {
                console.error('❌ Image generation failed:', imageError.message);
                // Continue to regular response if image fails
            }
        }

        // ===== FUNCTION CALLING ENGINE (Tool Selection & Execution) =====
        let functionCallingResult = null;
        let functionCallingUsed = false;
        let toolResults = '';

        if (functionCallingEngine) {
            console.log('🔧 Checking if Function Calling is needed...');
            try {
                const toolAnalysis = await functionCallingEngine.determineToolsNeeded(question);
                
                if (toolAnalysis.needsTools && toolAnalysis.toolCalls && toolAnalysis.toolCalls.length > 0) {
                    console.log('✅ Function Calling TRIGGERED - Executing tools...');
                    
                    // Execute the determined tools
                    const execResults = await functionCallingEngine.executeToolCalls(toolAnalysis.toolCalls);
                    
                    // Integrate tool results
                    functionCallingResult = await functionCallingEngine.integrateToolResults(question, execResults);
                    
                    toolResults = `\n\n🔧 **TOOLS USED:** ${functionCallingResult.toolsUsed.join(', ')}\n`;
                    functionCallingUsed = true;
                    
                    console.log(`✅ Function Calling Complete - Tools: ${functionCallingResult.toolsUsed.join(', ')}`);
                }
            } catch (fcError) {
                console.warn(`⚠️ Function Calling error: ${fcError.message}, continuing without tools`);
                functionCallingUsed = false;
            }
        }

        // ===== AUTONOMOUS RAG PIPELINE (Advanced Web Search with LLM Analysis) =====
        let webSearchResults = null;
        let webContext = '';
        let ragPipelineUsed = false;

        // Check if RAG Pipeline should be used
        const useRagPipeline = enableWebSearch !== false && ragPipeline && detectWebSearchNeeded(question);

        if (useRagPipeline) {
            console.log('🚀 Activating Autonomous RAG Pipeline...');
            try {
                const ragResult = await ragPipeline.executePipeline(question, mode || 'general');
                
                if (ragResult.type === 'SUCCESS') {
                    // High-confidence response with sources
                    webContext = `\n\n📊 **ADVANCED RETRIEVED CONTEXT:**\n\n${ragResult.response}\n\n`;
                    webSearchResults = {
                        sources: ragResult.sources,
                        answer: ragResult.response,
                        searchEngine: 'Autonomous RAG Pipeline'
                    };
                    ragPipelineUsed = true;
                    console.log(`✅ RAG Pipeline: High confidence response generated`);
                } else if (ragResult.type === 'CLARIFICATION') {
                    // Low confidence - asking for clarification
                    console.log(`⚠️ RAG Pipeline: Requesting user clarification`);
                    return res.json({
                        answer: ragResult.response,
                        type: 'CLARIFICATION_NEEDED',
                        options: ragResult.options,
                        webSearchUsed: true,
                        searchEngine: 'Autonomous RAG Pipeline',
                        quality: 'LOW_CONFIDENCE'
                    });
                }
            } catch (ragError) {
                console.warn(`⚠️ RAG Pipeline error: ${ragError.message}, falling back to standard search`);
                ragPipelineUsed = false;
            }
        }
        // ===== TAMIL NADU NEWS INJECTION =====
        // Check if user is asking about Tamil Nadu news/events
        const tamilNewsKeywords = ['tamil', 'tn', 'tamil nadu', 'recent news', 'latest news', 'news in tamil', 'தமிழ்'];
        const isTamilNewsQuery = tamilNewsKeywords.some(kw => lowerQuestion.toLowerCase().includes(kw));
        
        let tamilNewsContext = '';
        if (isTamilNewsQuery) {
            try {
                const latestNews = getLatestNews();
                if (latestNews && latestNews.length > 0) {
                    tamilNewsContext = `\n\n📰 **RECENT TAMIL NADU NEWS HEADLINES:**\n`;
                    latestNews.slice(0, 10).forEach((item, i) => {
                        tamilNewsContext += `${i + 1}. **${item.title}**\n   Source: ${item.source}\n`;
                    });
                    tamilNewsContext += `\nUse these actual news headlines to answer the user's query about recent Tamil Nadu news.\n`;
                    console.log('✅ Tamil Nadu news data injected into context');
                }
            } catch (newsError) {
                console.warn('⚠️ Could not fetch Tamil news:', newsError.message);
            }
        }

        // ===== FALLBACK: Standard Web Search (if RAG Pipeline not available or didn't trigger) =====
        if (!ragPipelineUsed) {
            const shouldSearchWeb = detectWebSearchNeeded(question);
            
            if (shouldSearchWeb && enableWebSearch !== false) {
                console.log('🌐 Standard web search auto-detected...');
                try {
                    webSearchResults = await searchWeb(question, mode || 'all');
                    
                    if (webSearchResults && webSearchResults.sources && webSearchResults.sources.length > 0) {
                        webContext = `\n\n📚 **REAL-TIME CONTEXT FROM WEB SEARCH:**\n\n`;
                        webContext += `${webSearchResults.answer || ''}\n\n`;
                        webContext += `**Sources Used:**\n`;
                        webSearchResults.sources.forEach((source, i) => {
                            if (source.title && source.url) {
                                webContext += `${i + 1}. [${source.title}](${source.url})\n`;
                            }
                        });
                        webContext += `\n(Reference these sources in your response when relevant)`;
                        console.log(`✅ Web context prepared with ${webSearchResults.sources.length} sources`);
                    }
                } catch (error) {
                    console.log('⚠️ Web search failed, continuing with AI knowledge:', error.message);
                }
            }
        }
        
        // ===== JARVIS 5.2 ADVANCED AI PROCESSING =====
        const apiKey = getNextGroqKey();

        if (!apiKey) {
            return res.json({
                answer: '⚠️ Please add your Groq API key to .env file!\n\nGet it FREE from: https://console.groq.com/keys'
            });
        }

        // 🧠 Detect query type for expert routing
        const queryType = detectQueryType(question);
        console.log(`🎯 Query type detected: ${queryType.toUpperCase()}`);

        // 🧠 Generate advanced Chain-of-Thought prompt
        let advancedSystemPrompt = generateCoTPrompt(question, queryType, history);
        
        // 🌐 ENHANCE prompt with web search context and citation instructions
        if (tamilNewsContext) {
            advancedSystemPrompt += tamilNewsContext;
            advancedSystemPrompt += `\n\n⚠️ **IMPORTANT:** Use these real Tamil Nadu news headlines to provide specific, factual answers about recent events.`;
        } else if (webContext) {
            advancedSystemPrompt += webContext;
            advancedSystemPrompt += `\n\n⚠️ **IMPORTANT:** When answering, naturally cite the sources above using markdown links when providing information from them.`;
        }
        
        const finalSystemPrompt = systemPrompt || advancedSystemPrompt;

        if (process.env.NODE_ENV !== 'production') {
            console.log('🤖 JARVIS 5.2 processing with', EXPERT_PERSONAS[queryType].name);
            if (webContext) console.log('📊 Web search context included in prompt');
        }

        // Construct messages array with enhanced context
        const messages = [
            {
                role: 'system',
                content: finalSystemPrompt
            }
        ];

        // Add conversation history if provided
        if (history && Array.isArray(history)) {
            messages.push(...history);
        }

        // Add current question
        messages.push({ role: 'user', content: question });

        let answer = null;
        let usedAPI = 'Unknown';

        // Try APIs in priority order with automatic failover
        // GROQ FIRST - Best quality & speed for users! ⚡
        const apiAttempts = [
            {
                name: 'Groq',
                enabled: !!process.env.GROQ_API_KEY,
                call: async () => await callGroqAPI(messages)
            },
            {
                name: 'AIMLAPI',
                enabled: !!process.env.AIML_API_KEY,
                call: async () => await callAimlApi(messages)
            },
            {
                name: 'Gemini',
                enabled: !!geminiModel,
                call: async () => await callGeminiAPI(finalSystemPrompt, history, question)
            },
            {
                name: 'Custom JARVIS AI',
                enabled: !!(CUSTOM_JARVIS_TOKEN && ['coding', 'math', 'science', 'general'].includes(queryType)),
                call: async () => await callCustomJarvisAPI(question)
            },
            {
                name: 'FREE Self-Hosted',
                enabled: !!FREE_API_URL,
                call: async () => await callFreeAPI(messages)
            },
            {
                name: 'OpenRouter',
                enabled: !!process.env.OPENROUTER_API_KEY,
                call: async () => await callOpenRouterAPI(messages)
            },
            {
                name: 'HuggingFace',
                enabled: !!process.env.HUGGINGFACE_API_KEY,
                call: async () => await callHuggingFaceAPI(finalSystemPrompt, history, question)
            }
        ];

        // Try each enabled API until one succeeds
        for (const api of apiAttempts.filter(a => a.enabled)) {
            try {
                console.log(`🤖 Trying ${api.name}...`);

                answer = await api.call();
                usedAPI = api.name;

                console.log(`✅ Got answer from ${api.name}!`);
                break; // Success! Stop trying other APIs
            } catch (error) {
                console.log(`⚠️ ${api.name} failed:`, error.message);
                // Continue to next API
            }
        }

        // If all APIs failed, try simple Groq call directly (last resort)
        if (!answer && process.env.GROQ_API_KEY) {
            try {
                console.log('🔄 Last resort: Direct Groq API call...');
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            { role: 'system', content: 'You are JARVIS, a helpful AI assistant.' },
                            { role: 'user', content: question }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
                answer = response.data.choices[0].message.content;
                usedAPI = 'Groq (Direct)';
                console.log('✅ Direct Groq call succeeded!');
            } catch (error) {
                console.log('❌ Direct Groq also failed:', error.message);
            }
        }

        // If all APIs failed
        if (!answer) {
            // Return a helpful error message instead of throwing
            return res.json({
                answer: `⚠️ **Service Temporarily Unavailable**

I'm having trouble connecting to the AI service right now.

🔧 **Quick Fixes:**
1. **Wait 30 seconds** and try again
2. Check your internet connection
3. Backend might be waking up (Render free tier sleeps after inactivity)

💡 **Why this happens:**
- Backend on Render free tier goes to sleep after 15 minutes
- First request after sleep takes 30-60 seconds to wake up
- All AI APIs are busy/rate limited

🚀 **What to do:**
- Try again in 30-60 seconds
- Backend is waking up...

*Your question was: "${question}"*`
            });
        }

        // 🧠 Generate smart follow-up suggestions
        const followUpSuggestions = generateFollowUpSuggestions(question, answer, queryType);

        // Add follow-up section to response
        if (followUpSuggestions.length > 0 && !answer.includes('💡 **Follow-up')) {
            answer += `\n\n---\n\n💡 **Follow-up Questions:**\n${followUpSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
        }

        // Add API source to response (for debugging)
        if (process.env.NODE_ENV !== 'production') {
            answer += `\n\n_[JARVIS 5.2 | ${EXPERT_PERSONAS[queryType].name} | ${usedAPI}]_`;
        }

        // 🌐 Include web search metadata in response
        const responseObject = {
            answer,
            queryType,
            expertMode: EXPERT_PERSONAS[queryType].name,
            followUpSuggestions,
            webSearchUsed: !!webSearchResults,
            sources: webSearchResults?.sources || null,
            searchEngine: webSearchResults?.searchEngine || null,
            // RAG Pipeline Metadata
            ragPipelineUsed: ragPipelineUsed,
            quality: webSearchResults ? 'HIGH_CONFIDENCE' : 'KNOWLEDGE_BASE',
            // Function Calling Metadata
            functionCallingUsed: functionCallingUsed,
            toolsUsed: functionCallingResult?.toolsUsed || [],
            toolResults: functionCallingResult?.toolResults || [],
            toolsInfo: functionCallingUsed ? {
                totalToolsCalled: functionCallingResult?.toolsUsed?.length || 0,
                successfulTools: functionCallingResult?.toolResults?.filter(t => t.success)?.length || 0,
                failedTools: functionCallingResult?.toolResults?.filter(t => !t.success)?.length || 0
            } : null
        };

        res.json(responseObject);

    } catch (error) {
        console.error('❌ ERROR:', error.response?.data || error.message);

        // Log full error details for debugging
        if (error.response?.data) {
            console.error('Full error data:', JSON.stringify(error.response.data, null, 2));
        }

        if (error.response?.status === 401) {
            res.json({ answer: '⚠️ Invalid API key! Please check your API key in .env file.' });
        } else if (error.response?.status === 429) {
            res.json({
                answer: `⚠️ **Rate Limit Exceeded!**

The AI service has received too many requests. This is a **Groq API limitation**, not your fault.

🕐 **What to do:**
1. Wait **1-2 minutes**
2. Try your question again
3. The limit resets automatically

💡 **Why this happens:**
- Free tier allows 30 requests per minute
- Multiple users may be using the service
- Heavy testing can trigger this

🚀 **Pro Tip:** Try again in a moment - it'll work! ✨`
            });
        } else if (error.response?.status === 400) {
            res.json({ answer: `⚠️ Bad request to API. Error: ${error.response?.data?.error?.message || error.message}` });
        } else {
            res.json({ answer: `Error: ${error.message}` });
        }
    }
});

// AI Image Generator Endpoint
app.post('/image', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Image prompt required' });
        }

        console.log('🎨 Generating image for prompt:', prompt);

        // Use Pollinations.AI as primary (faster, unique images with seed)
        try {
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

            console.log('✅ Image URL generated via Pollinations.AI');
            return res.json({
                imageUrl: pollinationsUrl,
                prompt: prompt,
                provider: 'Pollinations.AI',
                message: 'Image generated successfully'
            });
        } catch (pollinationsError) {
            console.error('❌ Pollinations.AI error:', pollinationsError.message);

            // Fallback to Hugging Face Stable Diffusion
            try {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
                    { inputs: prompt },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'arraybuffer',
                        timeout: 60000
                    }
                );

                // Convert image buffer to base64
                const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                const imageUrl = `data:image/png;base64,${base64Image}`;

                console.log('✅ Image generated successfully via Hugging Face');
                return res.json({
                    imageUrl: imageUrl,
                    prompt: prompt,
                    provider: 'Hugging Face Stable Diffusion',
                    message: 'Image generated successfully'
                });

            } catch (hfError) {
                console.error('❌ Hugging Face error:', hfError.message);
                throw new Error('All image generation services failed');
            }
        }

    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// AI Video Generator Endpoint
app.post('/video', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Video topic required' });
        }

        console.log('🎥 Searching videos for topic:', topic);

        // Try Pexels API (Free, high-quality stock videos)
        try {
            console.log('🔍 Querying Pexels API...');
            const response = await axios.get(
                `https://api.pexels.com/videos/search?query=${encodeURIComponent(topic)}&per_page=5`,
                {
                    headers: {
                        'Authorization': process.env.PEXELS_API_KEY
                    },
                    timeout: 10000
                }
            );

            console.log(`📊 Pexels returned ${response.data.videos?.length || 0} videos`);

            if (response.data.videos && response.data.videos.length > 0) {
                // Get random video from results
                const randomVideo = response.data.videos[Math.floor(Math.random() * response.data.videos.length)];
                const videoFile = randomVideo.video_files.find(file => file.quality === 'hd' || file.quality === 'sd') || randomVideo.video_files[0];

                console.log(`✅ Video found: "${randomVideo.user.name}" - ${videoFile.quality}`);
                return res.json({
                    videoUrl: videoFile.link,
                    thumbnail: randomVideo.image,
                    topic: topic,
                    duration: randomVideo.duration,
                    provider: 'Pexels',
                    photographer: randomVideo.user.name,
                    message: `Video found: ${topic}`
                });
            } else {
                throw new Error('No videos found for this topic');
            }

        } catch (pexelsError) {
            console.error('❌ Pexels API error:', pexelsError.message);

            // Fallback to Pixabay API
            try {
                const response = await axios.get(
                    `https://pixabay.com/api/videos/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(topic)}&per_page=5`,
                    { timeout: 10000 }
                );

                if (response.data.hits && response.data.hits.length > 0) {
                    const randomVideo = response.data.hits[Math.floor(Math.random() * response.data.hits.length)];
                    const videoFile = randomVideo.videos.medium || randomVideo.videos.small;

                    console.log('✅ Video found via Pixabay API');
                    return res.json({
                        videoUrl: videoFile.url,
                        thumbnail: randomVideo.userImageURL,
                        topic: topic,
                        provider: 'Pixabay',
                        message: 'Video found successfully'
                    });
                }
            } catch (pixabayError) {
                console.error('❌ Pixabay API error:', pixabayError.message);
            }

            // Final fallback
            console.log('⚠️ Using placeholder video');
            return res.json({
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                topic: topic,
                provider: 'Placeholder',
                message: 'Using placeholder video (APIs unavailable)'
            });
        }

    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({ error: 'Failed to generate video' });
    }
});

// ===== NEW API ENDPOINTS =====

// 1. Stability AI - Generate Diagrams & Concept Images
app.post('/generate-image', apiLimiter, async (req, res) => {
    try {
        const { prompt, type } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Image prompt required' });
        }

        console.log('🎨 Generating image for:', prompt);

        if (!process.env.STABILITY_API_KEY) {
            return res.status(503).json({
                error: 'Stability AI API key not configured',
                placeholder: 'https://via.placeholder.com/512x512.png?text=Image+Generation+Unavailable'
            });
        }

        // Enhance prompt based on type
        let enhancedPrompt = prompt;
        if (type === 'diagram') {
            enhancedPrompt = `Technical diagram: ${prompt}, clean white background, high contrast, educational style, professional`;
        } else if (type === 'concept') {
            enhancedPrompt = `Educational concept illustration: ${prompt}, clear and simple, vibrant colors, easy to understand`;
        }

        const formData = new FormData();
        formData.append('prompt', enhancedPrompt);
        formData.append('output_format', 'png');
        formData.append('aspect_ratio', '1:1');

        const response = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/core',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                    'Accept': 'image/*'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            }
        );

        if (response.status === 200) {
            // Convert image to base64
            const imageBase64 = Buffer.from(response.data).toString('base64');
            const imageUrl = `data:image/png;base64,${imageBase64}`;

            console.log('✅ Image generated successfully');
            return res.json({
                success: true,
                imageUrl: imageUrl,
                prompt: prompt,
                provider: 'Stability AI'
            });
        } else {
            throw new Error('Failed to generate image');
        }

    } catch (error) {
        console.error('❌ Stability AI error:', error.message);
        res.status(500).json({
            error: 'Failed to generate image',
            placeholder: 'https://via.placeholder.com/512x512.png?text=Generation+Failed'
        });
    }
});

// 2. YouTube Data API - Search Educational Videos
app.post('/search-videos', apiLimiter, async (req, res) => {
    try {
        const { query, maxResults = 5 } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        console.log('🔍 Searching YouTube for:', query);

        if (!process.env.YOUTUBE_API_KEY) {
            return res.status(503).json({
                error: 'YouTube API key not configured',
                message: 'Please add YOUTUBE_API_KEY to .env file'
            });
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query + ' tutorial educational',
                type: 'video',
                maxResults: maxResults,
                videoEmbeddable: 'true',
                videoDefinition: 'high',
                relevanceLanguage: 'en',
                key: process.env.YOUTUBE_API_KEY
            },
            timeout: 10000
        });

        if (response.data.items && response.data.items.length > 0) {
            const videos = response.data.items.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
                watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));

            console.log(`✅ Found ${videos.length} videos`);
            return res.json({
                success: true,
                videos: videos,
                totalResults: videos.length
            });
        } else {
            return res.json({
                success: true,
                videos: [],
                message: 'No videos found for this topic'
            });
        }

    } catch (error) {
        console.error('❌ YouTube API error:', error.message);
        res.status(500).json({
            error: 'Failed to search videos',
            message: error.response?.data?.error?.message || error.message
        });
    }
});

// 3. Gemini API - Generate Lesson Content
app.post('/generate-lesson', apiLimiter, async (req, res) => {
    try {
        const { topic, difficulty, lessonNumber } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic required' });
        }

        console.log(`📚 Generating lesson: ${topic} (${difficulty || 'Beginner'}) - Lesson ${lessonNumber || 1}`);

        if (!geminiModel) {
            return res.status(503).json({
                error: 'Gemini API not configured',
                message: 'Please add GEMINI_API_KEY to .env file'
            });
        }

        const prompt = `Create a comprehensive educational lesson on "${topic}" for ${difficulty || 'Beginner'} level students. This is lesson ${lessonNumber || 1}.

Structure the lesson as follows:
1. **Introduction** - Brief overview (2-3 sentences)
2. **Learning Objectives** - What students will learn (3-5 bullet points)
3. **Main Content** - Detailed explanation with examples
4. **Code Examples** (if applicable) - Practical demonstrations
5. **Key Takeaways** - Summary points
6. **Practice Exercise** - Simple task to reinforce learning

Format the response in Markdown with proper headings, code blocks, and bullet points.
Make it engaging, clear, and educational!`;

        const result = await geminiModel.generateContent(prompt);
        const content = result.response.text();

        console.log('✅ Lesson generated successfully');
        return res.json({
            success: true,
            lesson: {
                title: `Lesson ${lessonNumber || 1}: ${topic}`,
                content: content,
                difficulty: difficulty || 'Beginner',
                topic: topic
            },
            provider: 'Google Gemini'
        });

    } catch (error) {
        console.error('❌ Lesson generation error:', error.message);
        res.status(500).json({
            error: 'Failed to generate lesson',
            message: error.message
        });
    }
});

// 4. Gemini API - Generate Quiz Questions
app.post('/generate-quiz', apiLimiter, async (req, res) => {
    try {
        const { topic, difficulty, questionCount = 3 } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic required' });
        }

        console.log(`❓ Generating ${questionCount} quiz questions on: ${topic}`);

        if (!geminiModel) {
            return res.status(503).json({
                error: 'Gemini API not configured'
            });
        }

        const prompt = `Generate ${questionCount} multiple-choice quiz questions about "${topic}" for ${difficulty || 'Beginner'} level students.

For each question, provide:
1. Question text
2. Four answer options (A, B, C, D)
3. Correct answer (letter)
4. Brief explanation of why the answer is correct

Format as JSON array:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Explanation text"
  }
]

Make questions educational, clear, and appropriate for the difficulty level.`;

        const result = await geminiModel.generateContent(prompt);
        let content = result.response.text();

        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);

            console.log(`✅ Generated ${questions.length} quiz questions`);
            return res.json({
                success: true,
                questions: questions,
                topic: topic,
                difficulty: difficulty || 'Beginner',
                provider: 'Google Gemini'
            });
        } else {
            throw new Error('Failed to parse quiz questions');
        }

    } catch (error) {
        console.error('❌ Quiz generation error:', error.message);
        res.status(500).json({
            error: 'Failed to generate quiz',
            message: error.message
        });
    }
});

// 5. Gemini API - Generate Explanations
app.post('/explain', apiLimiter, async (req, res) => {
    try {
        const { concept, context } = req.body;

        if (!concept) {
            return res.status(400).json({ error: 'Concept to explain required' });
        }

        console.log(`💡 Generating explanation for: ${concept}`);

        if (!geminiModel) {
            return res.status(503).json({
                error: 'Gemini API not configured'
            });
        }

        const prompt = `Explain the following concept in simple, clear terms that a student can easily understand:

**Concept:** ${concept}
${context ? `\n**Context:** ${context}` : ''}

Provide:
1. Simple definition (1-2 sentences)
2. Key points (3-5 bullet points)
3. Real-world example or analogy
4. Common misconceptions (if any)

Use clear language, avoid jargon, and make it engaging!`;

        const result = await geminiModel.generateContent(prompt);
        const explanation = result.response.text();

        console.log('✅ Explanation generated');
        return res.json({
            success: true,
            concept: concept,
            explanation: explanation,
            provider: 'Google Gemini'
        });

    } catch (error) {
        console.error('❌ Explanation error:', error.message);
        res.status(500).json({
            error: 'Failed to generate explanation',
            message: error.message
        });
    }
});

// 6. Text-to-Speech - UPGRADED with Edge TTS (Unlimited Free!)
app.post('/api/tts', apiLimiter, async (req, res) => {
    try {
        const { text, voice = 'en-US-AriaNeural' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text required' });
        }

        console.log(`🎤 Generating TTS with: ${voice}...`);

        // Try Edge TTS first (UNLIMITED FREE!) 🔥
        try {
            console.log('🎵 Using Edge TTS (Unlimited free)...');
            
            // Use Node.js to call Python edge-tts
            const { exec } = require('child_process');
            const fs = require('fs');
            const path = require('path');
            const tmpFile = path.join('/tmp', `tts-${Date.now()}.mp3`);

            // Create Python command to use edge-tts
            const pythonCode = `
import edge_tts
import asyncio
async def tts():
    communicate = edge_tts.Communicate("${text.replace(/"/g, '\\"')}", voice="${voice}")
    await communicate.save("${tmpFile}")
asyncio.run(tts())
`;

            // For simpler approach, use edge-tts CLI if available
            return exec(`npx edge-tts --text "${text.replace(/"/g, '\\"')}" --voice "${voice}" --output "${tmpFile}"`, async (error, stdout, stderr) => {
                if (error) {
                    console.error('⚠️ Edge TTS CLI error, falling back to ElevenLabs...');
                    // Fallback to ElevenLabs
                    return handleElevenLabsTTS(text, req, res);
                }

                try {
                    const audioData = fs.readFileSync(tmpFile);
                    fs.unlinkSync(tmpFile); // Clean up temp file
                    
                    res.setHeader('Content-Type', 'audio/mpeg');
                    res.setHeader('X-TTS-Provider', 'Edge TTS');
                    return res.send(audioData);
                } catch (err) {
                    console.error('❌ Edge TTS file error:', err.message);
                    return handleElevenLabsTTS(text, req, res);
                }
            });

        } catch (edgeError) {
            console.error('⚠️ Edge TTS error:', edgeError.message);
            // Fallback to ElevenLabs
        }

        // Fallback to ElevenLabs API (10K chars/month free)
        return handleElevenLabsTTS(text, req, res);

    } catch (error) {
        console.error('❌ TTS error:', error.message);
        res.status(500).json({
            error: 'Failed to generate speech',
            message: error.message
        });
    }
});

// Helper function for ElevenLabs TTS
async function handleElevenLabsTTS(text, req, res) {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
            return res.status(503).json({
                error: 'All TTS services unavailable',
                message: 'Install edge-tts (pip install edge-tts) for unlimited free TTS, or configure ElevenLabs API key'
            });
        }

        // Default JARVIS voice ID (George or custom)
        const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgnuM07QD9MC';

        console.log(`🗣️ JARVIS generating speech for: "${text.substring(0, 30)}..."`);

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            },
            {
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            }
        );

        const audioBase64 = Buffer.from(response.data).toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

        console.log('✅ JARVIS speech generated successfully');
        return res.json({
            success: true,
            audioUrl: audioUrl,
            provider: 'ElevenLabs'
        });

    } catch (error) {
        console.error('❌ ElevenLabs error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to generate speech',
            message: error.message
        });
    }
}

// 7. Deepgram API - Speech-to-Text (Voice Input) 🎤
app.post('/api/stt', apiLimiter, async (req, res) => {
    try {
        const { audioBuffer, mimeType = 'audio/wav' } = req.body;

        if (!audioBuffer) {
            return res.status(400).json({ error: 'Audio buffer required' });
        }

        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey || apiKey === 'your_deepgram_api_key_here') {
            return res.status(503).json({
                error: 'Deepgram API key not configured',
                message: 'Please add DEEPGRAM_API_KEY to .env file. Get from: https://console.deepgram.com'
            });
        }

        console.log('🎤 Converting speech to text using Deepgram...');

        // Convert base64 to buffer
        const buffer = Buffer.from(audioBuffer, 'base64');

        // Call Deepgram API
        const response = await axios.post(
            'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en',
            buffer,
            {
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': mimeType
                },
                timeout: 30000
            }
        );

        const transcript = response.data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        const confidence = response.data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

        if (!transcript) {
            return res.json({
                success: false,
                text: '',
                confidence: 0,
                message: 'No speech detected'
            });
        }

        console.log(`✅ Speech recognized: "${transcript}" (Confidence: ${(confidence * 100).toFixed(0)}%)`);

        return res.json({
            success: true,
            text: transcript,
            confidence: confidence,
            provider: 'Deepgram'
        });

    } catch (error) {
        console.error('❌ Deepgram STT error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to convert speech to text',
            message: error.message
        });
    }
});

// 8. GitHub API - List Repositories
app.get('/api/github/repos', apiLimiter, async (req, res) => {
    try {
        if (!process.env.GITHUB_API_TOKEN || process.env.GITHUB_API_TOKEN === 'your_github_token_here') {
            return res.status(503).json({
                error: 'GitHub API token not configured',
                message: 'Please add GITHUB_API_TOKEN to .env file'
            });
        }

        console.log('🐙 Fetching GitHub repositories...');

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `token ${process.env.GITHUB_API_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            params: {
                sort: 'updated',
                per_page: 10
            }
        });

        const repos = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            updated_at: repo.updated_at
        }));

        console.log(`✅ Found ${repos.length} repositories`);
        return res.json({
            success: true,
            repos: repos,
            provider: 'GitHub'
        });

    } catch (error) {
        console.error('❌ GitHub API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch repositories',
            message: error.message
        });
    }
});

// 8. GitHub API - Get File Content
app.post('/api/github/content', apiLimiter, async (req, res) => {
    try {
        const { repo, path } = req.body;

        if (!repo || !path) {
            return res.status(400).json({ error: 'Repo and path required' });
        }

        if (!process.env.GITHUB_API_TOKEN || process.env.GITHUB_API_TOKEN === 'your_github_token_here') {
            return res.status(503).json({
                error: 'GitHub API token not configured'
            });
        }

        console.log(`🐙 Fetching content for ${repo}/${path}...`);

        const response = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_API_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Handle Directory Listing (Array)
        if (Array.isArray(response.data)) {
            const files = response.data.map(file => ({
                name: file.name,
                path: file.path,
                type: file.type,
                sha: file.sha,
                url: file.html_url
            }));

            console.log(`✅ Directory listed: ${files.length} items`);
            return res.json({
                success: true,
                content: files, // Return array of files
                isDir: true,
                provider: 'GitHub'
            });
        }
        // Handle File Content (Object with content)
        else if (response.data.content) {
            const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

            console.log('✅ Content fetched successfully');
            return res.json({
                success: true,
                content: content,
                isDir: false,
                provider: 'GitHub'
            });
        } else {
            throw new Error('No content found');
        }

    } catch (error) {
        console.error('❌ GitHub API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch content',
            message: error.message
        });
    }
});

// 9. Daily News API - Get Latest Tamil News for JARVIS Training
app.get('/api/news/latest', apiLimiter, async (req, res) => {
    try {
        const news = getLatestNews();
        if (!news || news.length === 0) {
            return res.json({
                success: false,
                message: 'No news data available yet. Daily updates begin at 8 AM.',
                headlines: []
            });
        }
        
        res.json({
            success: true,
            headlines: news,
            message: `Latest ${news.length} headlines from Tamil news sources`,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ News API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: error.message
        });
    }
});

// 9.5 Serper News Search - Real-time news with Serper.dev (Dual Key Support)
app.post('/api/news/serper', apiLimiter, async (req, res) => {
    try {
        const { query = 'India news', language = 'ta' } = req.body;
        
        const serperKeys = SEARCH_APIS.serper?.keys || [];
        if (!serperKeys.length) {
            return res.status(503).json({ error: 'Serper API not configured' });
        }

        let lastError = null;
        for (let i = 0; i < serperKeys.length; i++) {
            try {
                const response = await axios.post('https://google.serper.dev/news', {
                    q: query,
                    gl: 'in',  // India
                    hl: language === 'ta' ? 'ta' : 'en'  // Tamil or English
                }, {
                    headers: {
                        'X-API-KEY': serperKeys[i],
                        'Content-Type': 'application/json'
                    },
                    timeout: 8000
                });

                const articles = response.data?.news || [];
                
                // Map Serper response to unified frontend format
                const mapped = articles.map(article => ({
                    title: article.title,
                    description: article.snippet || article.description,
                    url: article.link || article.url,
                    source: article.source || 'Serper',
                    image: article.imageUrl || article.image,
                    date: article.date || new Date().toISOString(),
                    relevance: 'high'
                }));

                return res.json({
                    success: true,
                    query,
                    language,
                    results: mapped,
                    total: mapped.length,
                    source: 'Serper.dev',
                    keyIndex: i + 1,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Serper key ${i + 1} failed: ${error.message}`);
                if (i < serperKeys.length - 1) {
                    console.log(`🔄 Trying backup Serper key ${i + 2}...`);
                }
            }
        }

        // All keys failed
        throw lastError || new Error('All Serper keys exhausted');
    } catch (error) {
        console.error('❌ Serper News API error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news from Serper',
            message: error.message
        });
    }
});

// 10. General Chat API - For Project Generator and other tools
app.post('/api/chat', apiLimiter, async (req, res) => {
    try {
        const { message, history, systemPrompt } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        console.log('💬 Chat request:', message.substring(0, 50) + '...');

        // Get mode-specific system prompt (from frontend)
        const finalSystemPrompt = systemPrompt || `You are JARVIS - A friendly and helpful AI assistant.`;

        // Construct messages array with history
        const messages = [
            {
                role: 'system',
                content: finalSystemPrompt
            }
        ];

        // Add conversation history if provided
        if (history && Array.isArray(history)) {
            messages.push(...history);
            messages.forEach(msg,index=>{}


            )
        }

        // Add current message
        messages.push({ role: 'user', content: message });

        let response = null;
        let usedAPI = 'Unknown';

        // Try APIs in priority order with automatic failover
        const apiAttempts = [
            {
                name: 'Groq',
                enabled: !!process.env.GROQ_API_KEY,
                call: async () => await callGroqAPI(messages)
            },
            {
                name: 'Gemini',
                enabled: !!geminiModel,
                call: async () => await callGeminiAPI(finalSystemPrompt, history, message)
            },
            {
                name: 'OpenRouter',
                enabled: !!process.env.OPENROUTER_API_KEY,
                call: async () => await callOpenRouterAPI(messages)
            },
            {
                name: 'AIMLAPI',
                enabled: !!process.env.AIML_API_KEY,
                call: async () => await callAimlApi(messages)
            },
            {
                name: 'HuggingFace',
                enabled: !!process.env.HUGGINGFACE_API_KEY,
                call: async () => await callHuggingFaceAPI(finalSystemPrompt, history, message)
            }
        ];

        // Try each enabled API until one succeeds
        for (const api of apiAttempts.filter(a => a.enabled)) {
            try {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`🤖 Trying ${api.name}...`);
                }

                response = await api.call();
                usedAPI = api.name;

                if (process.env.NODE_ENV !== 'production') {
                    console.log(`✅ Got response from ${api.name}!`);
                }
                break; // Success! Stop trying other APIs
            } catch (error) {
                console.log(`⚠️ ${api.name} failed:`, error.message);
                // Continue to next API
            }
        }

        // If all APIs failed
        if (!response) {
            throw new Error('All AI APIs failed. Please try again later.');
        }

        // 🔍 Enhance with Wolfram Alpha knowledge if available
        let wolframEnhancement = null;
        try {
            // Detect if this is a factual/computational question
            if (message.match(/(calculate|solve|what is|define|convert|how much|how many|who|when|where|fact|explain|find|derive)/i)) {
                console.log('🔍 Checking Wolfram Alpha for enhanced answer...');
                const wolframResult = await queryWolframAlpha(message);
                if (wolframResult && wolframResult.success && wolframResult.answer) {
                    wolframEnhancement = wolframResult.answer;
                    console.log('📚 Enhanced with Wolfram Alpha knowledge');
                }
            }
        } catch (error) {
            console.log('⚠️ Wolfram Alpha enhancement failed (non-blocking):', error.message);
        }

        console.log('✅ Chat response generated successfully');
        
        let finalResponse = response;
        if (wolframEnhancement) {
            finalResponse = `${response}\n\n📚 **Verified by Wolfram Alpha:**\n${wolframEnhancement}`;
        }

        return res.json({
            success: true,
            response: finalResponse,
            provider: usedAPI,
            wolframEnhanced: !!wolframEnhancement
        });

    } catch (error) {
        console.error('❌ Chat API error:', error.message);
        res.status(500).json({
            error: 'Failed to generate response',
            message: error.message
        });
    }
});

// 🔍 Wolfram Alpha Query API
app.get('/api/wolfram/query', apiLimiter, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query required' });
        }

        console.log(`🔍 Wolfram Alpha query: ${q.substring(0, 50)}...`);

        const result = await queryWolframAlpha(q);

        if (result.success) {
            return res.json({
                success: true,
                query: q,
                answer: result.answer,
                pod: result.pod,
                timestamp: result.timestamp
            });
        } else {
            return res.json({
                success: false,
                query: q,
                message: 'No results found',
                answer: null
            });
        }

    } catch (error) {
        console.error('❌ Wolfram Alpha query error:', error.message);
        res.status(500).json({
            error: 'Failed to query Wolfram Alpha',
            message: error.message
        });
    }
});

// 📊 Wolfram Alpha Health Check
app.get('/api/wolfram/health', apiLimiter, async (req, res) => {
    try {
        res.json({
            success: true,
            status: 'Wolfram Alpha API is operational',
            appId: 'X3ALYR52E9',
            message: 'Ready for queries'
        });
    } catch (error) {
        console.error('❌ Wolfram health check error:', error.message);
        res.status(500).json({
            error: 'Wolfram Alpha health check failed',
            message: error.message
        });
    }
});

// ===== END NEW ENDPOINTS =====

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/health', (req, res) => {
    res.json({
        status: 'AI Tutor with Groq API (FREE & Fast!)'
    });
});

// Simple image generation using free APIs
app.post('/generate-simple-image', apiLimiter, async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }

        console.log('🎨 Generating image for:', prompt);

        // Try multiple free image generation APIs
        const encodedPrompt = encodeURIComponent(prompt);

        // Method 1: Try Pollinations AI with better parameters
        try {
            const seed = Date.now();
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

            // Verify the image loads
            const imageCheck = await axios.head(pollinationsUrl, { timeout: 5000 });

            if (imageCheck.status === 200) {
                return res.json({
                    success: true,
                    imageUrl: pollinationsUrl,
                    provider: 'Pollinations AI (Flux Model)',
                    prompt: prompt
                });
            }
        } catch (pollinationsError) {
            console.log('Pollinations AI failed, trying alternative...');
        }

        // Method 2: Try Hugging Face Inference API (free tier)
        if (process.env.HUGGINGFACE_API_KEY) {
            try {
                const hfResponse = await axios.post(
                    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
                    { inputs: prompt },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'arraybuffer',
                        timeout: 30000
                    }
                );

                const imageBase64 = Buffer.from(hfResponse.data).toString('base64');
                const imageUrl = `data:image/png;base64,${imageBase64}`;

                return res.json({
                    success: true,
                    imageUrl: imageUrl,
                    provider: 'Hugging Face (Stable Diffusion XL)',
                    prompt: prompt
                });
            } catch (hfError) {
                console.log('Hugging Face failed:', hfError.message);
            }
        }

        // Method 3: Fallback to DallE-Mini style service
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

        return res.json({
            success: true,
            imageUrl: fallbackUrl,
            provider: 'Pollinations AI',
            prompt: prompt,
            note: 'Using fallback image generation'
        });

    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate image',
            details: error.message
        });
    }
});

// ============================================
// FILE GENERATION ROUTE
// ============================================
const fileGenerator = require('./fileGenerator');

app.post('/api/generate-file', async (req, res) => {
    try {
        const { type, content, filename, projectType } = req.body;

        // Validation
        if (!type || !filename) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: type and filename'
            });
        }

        if (!['pdf', 'docx', 'pptx', 'code', 'project'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid type. Use: pdf, docx, pptx, code, or project'
            });
        }

        if (type !== 'project' && !content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required for non-project files'
            });
        }

        console.log(`📄 Generating ${type} file: ${filename}`);

        // Generate file
        const result = await fileGenerator.generateFile(type, content, filename, projectType);

        console.log(`✅ File generated: ${result.filename} (${result.size} bytes)`);

        res.json(result);
    } catch (error) {
        console.error('File generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate file',
            details: error.message
        });
    }
});

// ===== ASSIGNMENT SYSTEM API ENDPOINTS =====

// In-memory storage (replace with database in production)
const assignments = [];
const submissions = [];

// Get all assignments
app.get('/api/assignments', (req, res) => {
    try {
        res.json({
            success: true,
            assignments: assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single assignment
app.get('/api/assignments/:id', (req, res) => {
    try {
        const assignment = assignments.find(a => a.id === req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }
        res.json({
            success: true,
            assignment: assignment
        });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new assignment (Teacher)
app.post('/api/assignments', (req, res) => {
    try {
        const { title, subject, description, deadline, points } = req.body;

        if (!title || !subject || !description || !deadline) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const newAssignment = {
            id: Date.now().toString(),
            title,
            subject,
            description,
            deadline,
            points: points || 100,
            createdAt: new Date().toISOString(),
            submissions: 0
        };

        assignments.push(newAssignment);

        console.log(`✅ Assignment created: ${title}`);

        res.json({
            success: true,
            assignment: newAssignment
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update assignment (Teacher)
app.put('/api/assignments/:id', (req, res) => {
    try {
        const assignmentIndex = assignments.findIndex(a => a.id === req.params.id);

        if (assignmentIndex === -1) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        assignments[assignmentIndex] = {
            ...assignments[assignmentIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            assignment: assignments[assignmentIndex]
        });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete assignment (Teacher)
app.delete('/api/assignments/:id', (req, res) => {
    try {
        const assignmentIndex = assignments.findIndex(a => a.id === req.params.id);

        if (assignmentIndex === -1) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        assignments.splice(assignmentIndex, 1);

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit assignment (Student)
app.post('/api/submissions', (req, res) => {
    try {
        const { assignmentId, studentId, text, files } = req.body;

        if (!assignmentId || !text) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const newSubmission = {
            id: Date.now().toString(),
            assignmentId,
            studentId: studentId || 'anonymous',
            text,
            files: files || [],
            submittedAt: new Date().toISOString(),
            status: 'submitted',
            grade: null,
            feedback: null
        };

        submissions.push(newSubmission);

        // Update assignment submission count
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
            assignment.submissions = (assignment.submissions || 0) + 1;
        }

        console.log(`✅ Assignment submitted: ${assignmentId}`);

        res.json({
            success: true,
            submission: newSubmission
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get submissions for an assignment (Teacher)
app.get('/api/assignments/:id/submissions', (req, res) => {
    try {
        const assignmentSubmissions = submissions.filter(
            s => s.assignmentId === req.params.id
        );

        res.json({
            success: true,
            submissions: assignmentSubmissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Grade submission (Teacher)
app.put('/api/submissions/:id/grade', (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submissionIndex = submissions.findIndex(s => s.id === req.params.id);

        if (submissionIndex === -1) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        submissions[submissionIndex] = {
            ...submissions[submissionIndex],
            grade,
            feedback,
            status: 'graded',
            gradedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            submission: submissions[submissionIndex]
        });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get student's submissions
app.get('/api/students/:studentId/submissions', (req, res) => {
    try {
        const studentSubmissions = submissions.filter(
            s => s.studentId === req.params.studentId
        );

        res.json({
            success: true,
            submissions: studentSubmissions
        });
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

console.log('✅ Assignment System API endpoints loaded');

function startServer(port, attempts = 0) {
    const server = app.listen(port, () => {
        activePort = port;

        // Initialize Google Strategy with the actual port
        initGoogleStrategy(port);

        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n✅ AI TUTOR SERVER RUNNING!`);
            console.log(`🌐 Open: http://localhost:${port}`);

            const perplexityKey = process.env.PERPLEXITY_API_KEY;
            const usePerplexity = perplexityKey && perplexityKey !== 'your_perplexity_api_key_here';

            if (usePerplexity) {
                console.log(`🤖 Using Perplexity API (with Web Search! 🌐)`);
            } else {
                console.log(`🤖 Using FREE Groq API (ChatGPT-like AI)`);
            }

            console.log(`🔒 Google OAuth: ${hasGoogleCreds ? 'ENABLED' : 'DISABLED (missing creds)'}`);
            if (hasGoogleCreds) {
                console.log(`\n📋 IMPORTANT: Add this URL to your Google Cloud Console:`);
                console.log(`   Authorized redirect URI: http://localhost:${port}/auth/google/callback`);
            }
            console.log(`\n`);
        } else {
            console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
        }
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            if (attempts < 5) {
                const newPort = port + 1;
                console.warn(`⚠️ Port ${port} in use. Retrying on ${newPort}...`);
                startServer(newPort, attempts + 1);
            } else {
                console.error('❌ Unable to find a free port after multiple attempts. Please free ports starting at', BASE_PORT);
                process.exit(1);
            }
        } else {
            console.error('❌ Server error:', err);
            process.exit(1);
        }
    });
}

// ⭐ JARVIS OMNISCIENT ENDPOINTS
// ================================

// 1. Omniscient Query - Maximum Intelligence
// ⭐ NEW RAG-ENHANCED QUERY ENDPOINT (2026 PRODUCTION)
// ===================================================
// 1. OMNISCIENT RAG QUERY - Real-time context aware responses
app.post('/omniscient/rag-query', apiLimiter, async (req, res) => {
  try {
    const { question, context = '', domain = 'general', useRag = true } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`🚀 JARVIS RAG Query: ${question.substring(0, 60)}...`);
    
    // Step 1-4: Execute RAG Pipeline
    const ragData = await executeRagPipeline(question, context);
    
    // Combine existing context with RAG context
    const enrichedContext = context + '\n' + ragData.systemPrompt;
    
    // Call LLM with RAG-enhanced prompt
    let result;
    try {
      result = await jarvisOmniscient.omniscientQuery(question, enrichedContext, domain);
    } catch (llmError) {
      console.warn('⚠️ Primary LLM failed, trying Groq directly...');
      // Fallback to Groq
      const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: ragData.systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }, {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        timeout: 15000
      });
      
      result = {
        answer: groqResponse.data?.choices?.[0]?.message?.content || 'No response',
        model: 'groq-rag-fallback',
        depth: 'high',
        thinking: 'Used RAG context with Groq fallback'
      };
    }
    
    res.json({
      success: true,
      data: {
        answer: result.answer,
        model: result.model,
        depth: result.depth,
        thinking: result.thinking,
        ragEnhanced: true,
        contextSources: ragData.contextSources,
        keywords: ragData.keywords,
        ragStatus: ragData.enriched ? '✅ Active' : '⚠️ Fallback',
        sourceCount: ragData.contextSources.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        pipeline: 'RAG-Enhanced-2026'
      }
    });
  } catch (error) {
    console.error('❌ RAG Query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ High-Performance Knowledge Base Endpoints (NEW)
if (pineconeIntegration) {
  app.post('/api/knowledge/search', pineconeIntegration.knowledgeSearchEndpoint);
  app.post('/api/knowledge/update', pineconeIntegration.knowledgeUpdateEndpoint);
}

// 1. Original Query Endpoint
app.post('/omniscient/query', apiLimiter, async (req, res) => {
  try {
    const { question, context = '', domain = 'general' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`🧠 JARVIS Omniscient: ${question.substring(0, 60)}...`);
    const result = await jarvisOmniscient.omniscientQuery(question, context, domain);
    
    res.json({
      success: true,
      data: {
        answer: result.answer,
        model: result.model,
        depth: result.depth,
        thinking: result.thinking,
      },
    });
  } catch (error) {
    console.error('❌ Omniscient error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Fast Query - Quick Response
app.post('/omniscient/fast', apiLimiter, async (req, res) => {
  try {
    const { question, context = '', domain = 'general' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`⚡ JARVIS Fast: ${question.substring(0, 60)}...`);
    const result = await jarvisOmniscient.standardQuery(question, context, domain);
    
    res.json({
      success: true,
      data: {
        answer: result.answer,
        model: result.model,
        depth: result.depth,
      },
    });
  } catch (error) {
    console.error('❌ Fast query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ SEQUENTIAL AUTO-FALLBACK SYSTEM
// =====================================
// Helper: Score confidence of response
function scoreConfidence(response, model) {
  let score = 0;
  
  if (!response) return 0;
  
  const text = typeof response === 'string' ? response : 
               response.answer || response.text || JSON.stringify(response);
  
  // Length check (longer = more confident usually)
  if (text.length > 100) score += 30;
  else if (text.length > 50) score += 15;
  
  // Uncertainty phrases (negative indicators)
  const uncertaintyPhrases = [
    "i'm not sure", "i don't know", "unclear", "uncertain",
    "cannot determine", "insufficient", "unable to", "not enough",
    "no information", "unaware", "unprepared"
  ];
  const hasUncertainty = uncertaintyPhrases.some(phrase => 
    text.toLowerCase().includes(phrase)
  );
  if (hasUncertainty) score -= 50;
  
  // Confidence phrases (positive indicators)
  const confidencePhrases = [
    "definitely", "certainly", "clearly", "exactly", "precisely",
    "confirmed", "verified", "proven", "absolutely", "without doubt",
    "in summary", "to conclude", "therefore", "hence"
  ];
  const hasConfidence = confidencePhrases.some(phrase => 
    text.toLowerCase().includes(phrase)
  );
  if (hasConfidence) score += 25;
  
  // Specific model bonuses
  if (model === 'groq') score += 10; // Already fast, boost confidence
  if (model === 'claude') score += 15; // Claude is very reliable
  
  return Math.max(0, Math.min(100, score));
}

// Helper: Try API with fallback
async function tryAPISequentially(question, context, domain, models = ['groq', 'claude', 'openrouter', 'huggingface']) {
  const results = [];
  
  for (const model of models) {
    try {
      let response = null;
      let confidence = 0;
      
      switch(model) {
        case 'groq':
          if (process.env.GROQ_API_KEY) {
            response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
              model: 'mixtral-8x7b-32768',
              messages: [{ role: 'user', content: question }],
              temperature: 0.3,
              max_tokens: 1000
            }, {
              headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
              timeout: 3000
            });
            response = response.data?.choices?.[0]?.message?.content || response.data;
            confidence = scoreConfidence(response, 'groq');
          }
          break;
          
        case 'claude':
          if (process.env.CLAUDE_API_KEY) {
            response = await axios.post('https://api.anthropic.com/v1/messages', {
              model: 'claude-3-opus-20240229',
              max_tokens: 1024,
              messages: [{ role: 'user', content: question }]
            }, {
              headers: { 'x-api-key': process.env.CLAUDE_API_KEY },
              timeout: 3000
            });
            response = response.data?.content?.[0]?.text || response.data;
            confidence = scoreConfidence(response, 'claude');
          }
          break;
          
        case 'openrouter':
          if (process.env.OPENROUTER_API_KEY) {
            response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
              model: 'claude-3-opus',
              messages: [{ role: 'user', content: question }],
              temperature: 0.3
            }, {
              headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
              timeout: 3000
            });
            response = response.data?.choices?.[0]?.message?.content || response.data;
            confidence = scoreConfidence(response, 'openrouter');
          }
          break;
          
        case 'huggingface':
          if (process.env.HUGGINGFACE_API_KEY) {
            response = await axios.post(
              'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
              { inputs: question },
              { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` }, timeout: 3000 }
            );
            response = response.data?.[0]?.generated_text || response.data;
            confidence = scoreConfidence(response, 'huggingface');
          }
          break;
      }
      
      if (response && confidence > 0) {
        results.push({
          model,
          answer: response,
          confidence,
          timestamp: new Date().toISOString()
        });
        
        // If confidence is high (>65%), stop searching
        if (confidence > 65) {
          break;
        }
      }
    } catch (err) {
      // Silent fail - continue to next API
    }
  }
  
  return results;
}

// 2.45 QUICK-RESPONSE ENDPOINT - Direct Groq (fastest, <500ms)
app.post('/omniscient/quick', apiLimiter, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ error: 'Groq API not configured' });
    }

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: question }],
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      timeout: 8000
    });

    const answer = response.data?.choices?.[0]?.message?.content || '';
    res.json({
      success: true,
      answer,
      model: 'groq',
      responseTime: 'fast'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2.5 AUTO-FALLBACK ENDPOINT - Try multiple APIs until confident
app.post('/omniscient/auto-fallback', apiLimiter, async (req, res) => {
  try {
    const { question, context = '', domain = 'general', minConfidence = 50 } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const results = await tryAPISequentially(question, context, domain);
    
    if (!results.length) {
      return res.status(500).json({ 
        success: false, 
        error: 'All APIs failed to respond',
        attempts: 0
      });
    }
    
    // Find best answer by confidence
    const best = results.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );
    
    res.json({
      success: true,
      data: {
        answer: best.answer,
        model: best.model,
        confidence: best.confidence,
        minConfidenceRequired: minConfidence,
        allAttempts: results.map(r => ({
          model: r.model,
          confidence: r.confidence
        })),
        warning: best.confidence < minConfidence ? 
          `Low confidence (${best.confidence}%). Consider asking for clarification.` : 
          null
      }
    });
  } catch (error) {
    console.error('❌ Auto-fallback error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Code Analysis
app.post('/omniscient/analyze-code', apiLimiter, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    console.log(`📊 JARVIS: Analyzing ${language} code...`);
    const result = await jarvisOmniscient.analyzeCode(code, language);
    
    res.json({
      success: true,
      data: {
        analysis: result.response?.text?.() || result.response?.text || result,
      },
    });
  } catch (error) {
    console.error('❌ Code analysis error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ FULL POWER ENDPOINTS (Only if all APIs available)
// ================================
// 1. Multi-AI Consensus
app.post('/omniscient/consensus', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient || !jarvisOmniscient.multiAIConsensus) {
      return res.status(400).json({ 
        error: 'Multi-AI consensus requires all API keys. Add them to .env file.' 
      });
    }

    const { question, context = '' } = req.body;
    console.log('🌐 JARVIS: Multi-AI Consensus...');
    const result = await jarvisOmniscient.multiAIConsensus(question, context);
    
    res.json({
      success: true,
      data: {
        bestAnswer: result.bestAnswer,
        allAnswers: result.allAnswers,
        scores: result.scores,
        bestAI: result.bestAI,
        reasoning: result.reasoning,
      },
    });
  } catch (error) {
    console.error('❌ Consensus error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}); // <--- Indha bracket and semicolon correct-ah irukanum// 2. Real-time Intelligence
app.post('/omniscient/realtime', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient.realtimeIntelligence) {
      return res.status(400).json({
        error: 'Real-time intelligence requires all API keys.'
      });
    }

    const { query } = req.body;
    console.log('🔍 JARVIS: Real-time intelligence...');
    const result = await jarvisOmniscient.realtimeIntelligence(query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Real-time intelligence error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Wolfram Alpha Computation
app.post('/omniscient/wolfram', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient.wolframComputation) {
      return res.status(400).json({
        error: 'Wolfram requires WOLFRAM_API_KEY in .env'
      });
    }

    const { query } = req.body;
    console.log('🔢 JARVIS: Wolfram computation...');
    const result = await jarvisOmniscient.wolframComputation(query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Wolfram error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Expert Consultation
app.post('/omniscient/experts', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient.expertConsultation) {
      return res.status(400).json({
        error: 'Expert consultation requires all APIs'
      });
    }

    const { question } = req.body;
    console.log('👥 JARVIS: Expert consultation...');
    const result = await jarvisOmniscient.expertConsultation(question);
    
    res.json({
      success: true,
      data: {
        experts: result.experts,
        consensus: result.consensus,
      },
    });
  } catch (error) {
    console.error('❌ Expert consultation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Deep Reasoning
app.post('/omniscient/deep-reason', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient.deepReasoning) {
      return res.status(400).json({
        error: 'Deep reasoning requires GEMINI_API_KEY'
      });
    }

    const { problem } = req.body;
    console.log('🧠 JARVIS: Deep reasoning...');
    const result = await jarvisOmniscient.deepReasoning(problem);
    
    res.json({
      success: true,
      data: {
        reasoning: result.reasoning,
        model: result.model,
        depth: result.depth,
      },
    });
  } catch (error) {
    console.error('❌ Deep reasoning error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Pro Code Generation
app.post('/omniscient/generate-code', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient.generateProCode) {
      return res.status(400).json({
        error: 'Code generation requires CLAUDE_API_KEY'
      });
    }

    const { requirement, language = 'javascript' } = req.body;
    console.log('💻 JARVIS: Generating pro code...');
    const result = await jarvisOmniscient.generateProCode(requirement, language);
    
    res.json({
      success: true,
      data: {
        code: result.code,
        language: result.language,
        quality: result.quality,
      },
    });
  } catch (error) {
    console.error('❌ Code generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Adaptive Learning Path
app.post('/omniscient/adaptive-path', apiLimiter, async (req, res) => {
  try {
    if (!jarvisOmniscient.adaptiveLearningPath) {
      return res.status(400).json({
        error: 'Adaptive path requires GEMINI_API_KEY'
      });
    }

    const { goal, level = 'beginner', timeline = 'May 2027' } = req.body;
    console.log('🎓 JARVIS: Creating adaptive path...');
    const result = await jarvisOmniscient.adaptiveLearningPath(goal, level, timeline);
    
    res.json({
      success: true,
      data: {
        learningPath: result.learningPath,
        optimization: result.optimization,
        timeline: result.timeline,
      },
    });
  } catch (error) {
    console.error('❌ Adaptive path error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
// --- 1. Status Endpoint ---
app.get('/omniscient/status', (req, res) => {
  const status = {
    mode: (typeof allKeysAvailable !== 'undefined' && allKeysAvailable) ? 'FULL_POWER' : 'LITE_MODE',
    apis: {
      gemini: !!process.env.GEMINI_API_KEY,
      claude: !!process.env.CLAUDE_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      wolfram: !!process.env.WOLFRAM_API_KEY,
      brave: !!process.env.BRAVE_API_KEY,
    },
    endpoints: (typeof allKeysAvailable !== 'undefined' && allKeysAvailable) ? [
      '/omniscient/query', '/omniscient/consensus', '/omniscient/realtime',
      '/omniscient/wolfram', '/omniscient/experts', '/omniscient/deep-reason',
      '/omniscient/generate-code', '/omniscient/adaptive-path',
    ] : [
      '/omniscient/query', '/omniscient/fast',
    ],
  };
  res.json({ success: true, status });
});

// --- 2. Deep Dive Endpoint ---
app.post('/omniscient/deep-dive', apiLimiter, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic required' });

    console.log(`📚 JARVIS: Deep dive into "${topic}"...`);
    const result = await jarvisOmniscient.deepDive(topic);
    
    // Safety check for Gemini response
    const content = result.response ? await result.response.text() : result;

    res.json({
      success: true,
      data: { deepDive: content },
    });
  } catch (error) {
    console.error('❌ Deep dive error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 3. Learning Path Endpoint ---
app.post('/omniscient/learning-path', apiLimiter, async (req, res) => {
  try {
    const { goal, currentLevel, timeline } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal required' });

    console.log(`🎯 JARVIS: Generating learning path for "${goal}"...`);
    const result = await jarvisOmniscient.generateLearningPath(
      goal,
      currentLevel || 'begnner',
      timeline || 'May 2028'
    );
    
    const content = result.response ? await result.response.text() : result;

    res.json({
      success: true,
      data: { learningPath: content },
    });
  } catch (error) {
    console.error('❌ Learning path error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================
// JARVIS FULL POWER ENDPOINTS
// =========================================================

// 1. Multi-AI Consensus
app.post('/full-power/consensus', async (req, res) => {
    try {
        const { question, context = '' } = req.body;
        if (!question) return res.status(400).json({ error: 'Question required' });

        console.log(`🤖 JARVIS Full Power: Multi-AI Consensus for "${question.substring(0, 50)}..."`);
        const result = await jarvisFullPower.multiAIConsensus(question, context);
        
        res.json({
            success: true,
            data: {
                bestAnswer: result.bestAnswer,
                consensus: result.allResponses,
                bestAI: result.bestAI,
                scores: result.scores,
                reasoning: result.reasoning,
            },
        });
    } catch (error) {
        console.error('❌ Consensus error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Real-time Search
app.post('/full-power/search', async (req, res) => {
    try {
        const { query, type = 'news' } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });

        console.log(`🔍 JARVIS: Real-time search for "${query}" (${type})...`);
        
        // Try Serper first if configured
        const serperKeys = SEARCH_APIS.serper?.keys || [];
        if (serperKeys.length > 0 && (type === 'news' || type === 'all')) {
            // ... (Existing Serper Logic) ...
             for (let i = 0; i < serperKeys.length; i++) {
                try {
                    const response = await axios.post('https://google.serper.dev/news', {
                        q: query, gl: 'in', hl: 'ta'
                    }, { headers: { 'X-API-KEY': serperKeys[i], 'Content-Type': 'application/json' } });

                    const mapped = (response.data?.news || []).map(article => ({
                        title: article.title, description: article.snippet, url: article.link,
                        source: article.source, image: article.imageUrl, date: article.date, type: 'news'
                    }));

                    return res.json({ success: true, data: { results: mapped, source: 'serper-news' } });
                } catch (e) { continue; }
            }
        }

        // Fallback to internal engine
        if (jarvisFullPower && jarvisFullPower.realtimeSearch) {
            const results = await jarvisFullPower.realtimeSearch(query);
            return res.json({ success: true, data: { results, source: 'jarvis-fallback' } });
        }
        throw new Error('No search service available');
    } catch (error) {
        console.error('❌ Search error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Image Generation
app.post('/full-power/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });

        console.log(`🎨 JARVIS: Generating image...`);
        const result = await jarvisFullPower.generateImage(prompt, process.env.STABILITY_API_KEY);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Image error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Audio Generation
app.post('/full-power/generate-audio', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text required' });

        console.log(`🔊 JARVIS: Generating audio...`);
        const audioBuffer = await jarvisFullPower.generateAudio(text, process.env.ELEVENLABS_API_KEY);
        
        if (audioBuffer) {
            res.set('Content-Type', 'audio/mpeg');
            res.send(audioBuffer);
        } else {
            res.status(500).json({ success: false, error: 'Audio generation failed' });
        }
    } catch (error) {
        console.error('❌ Audio error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Fast Response (Groq)
app.post('/full-power/fast-groq', async (req, res) => {
    try {
        const { question, context = '' } = req.body;
        if (!question) return res.status(400).json({ error: 'Question required' });

        console.log(`⚡ JARVIS Groq: Fastest response...`);
        const answer = await jarvisFullPower.queryGroq(question, context);
        
        res.json({
            success: true,
            data: { answer, model: 'Groq (Mixtral 8x7B)', speed: 'FASTEST' },
        });
    } catch (error) {
        console.error('❌ Groq error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================
// 🚀 THE BRIDGE: PYTHON JARVIS CONNECT
// =========================================================
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const { spawn } = require('child_process');

    // DEBUG: Terminal-la enna news irukku nu check panna
    console.log("🔍 Checking News Database...");
    
    let newsContext = "";
    
    // Inga unga news storage variable-a check pannuvom
    // Unga code-la 'savedHeadlines' nu irundha adhai use pannunga
    const dataSource = global.newsDatabase || global.allNews || global.savedHeadlines;

    if (dataSource) {
        const latestEntries = Object.values(dataSource).flat().slice(-20);
        newsContext = latestEntries.map(n => n.title).join(" | ");
        console.log(`✅ Found ${latestEntries.length} headlines to send to Python.`);
    } else {
        console.log("⚠️ WARNING: News Database is EMPTY or name is wrong!");
    }

    const superPrompt = `
    IMPORTANT: You are JARVIS. Use these specific headlines to answer the user.
    REAL-TIME DATA: ${newsContext}
    
    USER QUESTION: ${message}
    If headlines are present, don't say you are an AI model. Directly answer the news.
    `;

    const pythonProcess = spawn('python', ['ai-tutor/backend/jarvis_chat.py', superPrompt]);

    let jarvisReply = "";
    pythonProcess.stdout.on('data', (data) => {
        jarvisReply += data.toString();
    });

    pythonProcess.on('close', (code) => {
        res.json({ reply: jarvisReply.trim() || "Jarvis brain is syncing. Try again!" });
    });
});

console.log(`✅ JARVIS Full Power endpoints loaded!`);

// =========================================================
// 📰 NEWS SYSTEM & SERVER STARTUP (Only Once!)
// =========================================================

console.log('\n📰 Initializing Daily News Training System...');
try {
    // Check if function exists before calling
    if (typeof startDailyUpdates === 'function') {
        startDailyUpdates();
        console.log('✅ Daily news system initialized successfully');
    }
} catch (err) {
    console.error('⚠️ Daily news system error (non-blocking):', err.message);
}

// // --- PORT DEBUGGED START ---
const PORT = process.env.PORT || 3001;

// Server start panna try pannuvom
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ============================================
    🚀  JARVIS SERVER IS NOW LIVE!
    ============================================
    🌐  URL: http://localhost:${PORT}
    ============================================
    `);
});

// Port error vandha handle panna indha logic:
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${PORT} busy-ah irukku! 5 seconds-la thirumba try panren...`);
        setTimeout(() => {
            server.close();
            server.listen(PORT);
        }, 5000);
    } else {
        console.error("❌ Periya error nanba:", e);
    }
});
// --- PORT DEBUGGED END ---