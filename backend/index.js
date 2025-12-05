const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const FormData = require('form-data');
// Ensure we load .env from backend directory even if process started elsewhere
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize Google Gemini AI
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Google Gemini initialized as backup');
}

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

// Helper function to call Groq API with key rotation
async function callGroqAPI(messages) {
    const apiKey = getNextGroqKey();
    if (!apiKey) throw new Error('No Groq API keys available');
    
    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            temperature: 0.7,
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

// Helper function to call AI/ML API with key rotation
async function callAimlApi(messages) {
    const apiKey = getNextAIMLKey();
    if (!apiKey) throw new Error('No AIML API keys available');
    
    const response = await axios.post(
        'https://api.aimlapi.com/chat/completions',
        {
            model: 'meta-llama/Meta-Llama-3-70B-Instruct-Turbo',
            messages: messages,
            temperature: 0.7,
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

// Apply rate limiter to /ask endpoint
app.post('/ask', apiLimiter, async (req, res) => {
    try {
        const { question, history, systemPrompt } = req.body;
        if (!question) return res.status(400).json({ error: 'Question required' });

        // Special response for developer questions
        const lowerQuestion = question.toLowerCase().trim();

        // Log for debugging
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔍 Question:', lowerQuestion);
        }

        const developerKeywords = [
            'who develop', 'who devlop', 'who created', 'who made', 'who built',
            'developer', 'creator', 'who is your', 'your developer',
            'who programmed', 'who coded', 'your maker', 'developed you',
            'created you', 'made you', 'built you', 'your creator'
        ];

        const isDeveloperQuestion = developerKeywords.some(keyword => lowerQuestion.includes(keyword));

        if (process.env.NODE_ENV !== 'production') {
            console.log('🎯 Is developer question?', isDeveloperQuestion);
        }

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

        // Check for Groq API key
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.json({
                answer: '⚠️ Please add your Groq API key to .env file!\n\nGet it FREE from: https://console.groq.com/keys'
            });
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('🤖 Asking AI using Groq...');
        }

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
        }

        // Add current question
        messages.push({ role: 'user', content: question });

        let answer = null;
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
                call: async () => await callGeminiAPI(finalSystemPrompt, history, question)
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
                call: async () => await callHuggingFaceAPI(finalSystemPrompt, history, question)
            },
            {
                name: 'FREE Self-Hosted',
                enabled: !!FREE_API_URL,
                call: async () => await callFreeAPI(messages)
            }
        ];

        // Try each enabled API until one succeeds
        for (const api of apiAttempts.filter(a => a.enabled)) {
            try {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`🤖 Trying ${api.name}...`);
                }

                answer = await api.call();
                usedAPI = api.name;

                if (process.env.NODE_ENV !== 'production') {
                    console.log(`✅ Got answer from ${api.name}!`);
                }
                break; // Success! Stop trying other APIs
            } catch (error) {
                console.log(`⚠️ ${api.name} failed:`, error.message);
                // Continue to next API
            }
        }

        // If all APIs failed
        if (!answer) {
            throw new Error('All AI APIs failed. Please try again later.');
        }

        // Add API source to response (for debugging)
        if (process.env.NODE_ENV !== 'production') {
            answer += `\n\n_[Powered by ${usedAPI}]_`;
        }

        res.json({ answer });

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

// 6. ElevenLabs API - Text-to-Speech
app.post('/api/tts', apiLimiter, async (req, res) => {
    try {
        const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = req.body; // Default voice: Rachel

        if (!text) {
            return res.status(400).json({ error: 'Text required' });
        }

        if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
            return res.status(503).json({
                error: 'ElevenLabs API key not configured',
                message: 'Please add ELEVENLABS_API_KEY to .env file'
            });
        }

        console.log(`🗣️ Generating speech for: "${text.substring(0, 30)}..."`);

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            },
            {
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                responseType: 'arraybuffer'
            }
        );

        const audioBase64 = Buffer.from(response.data).toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

        console.log('✅ Speech generated successfully');
        return res.json({
            success: true,
            audioUrl: audioUrl,
            provider: 'ElevenLabs'
        });

    } catch (error) {
        console.error('❌ ElevenLabs error:', error.message);
        res.status(500).json({
            error: 'Failed to generate speech',
            message: error.message
        });
    }
});

// 7. GitHub API - List Repositories
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

// 9. General Chat API - For Project Generator and other tools
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

        console.log('✅ Chat response generated successfully');
        return res.json({
            success: true,
            response: response,
            provider: usedAPI
        });

    } catch (error) {
        console.error('❌ Chat API error:', error.message);
        res.status(500).json({
            error: 'Failed to generate response',
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

startServer(BASE_PORT);
