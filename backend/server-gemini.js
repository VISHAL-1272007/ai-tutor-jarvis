/**
 * ===== JARVIS AI BACKEND - GEMINI 1.5 FLASH =====
 * Production-ready Node.js + Express server
 * Features: Google Generative AI, Search Retrieval, Chat History, Error Handling
 * 
 * Usage:
 * 1. npm install express dotenv @google/generativeai cors
 * 2. Create .env file with GEMINI_API_KEY
 * 3. node server-gemini.js
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('google-generativeai');

// ===== CONFIGURATION =====
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API Key
if (!GEMINI_API_KEY) {
    console.error('❌ CRITICAL: GEMINI_API_KEY not found in environment variables!');
    console.error('   Create .env file with: GEMINI_API_KEY=your_key_here');
    process.exit(1);
}

// ===== MIDDLEWARE =====
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://vishai-f6197.web.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== GEMINI AI SETUP =====
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are Jarvis, an empathetic Tanglish mentor dedicated to helping students become AI Engineers. 

Core Mission:
- Help users reach their May 2027 AI Engineer goal
- Guide them to solve 180+ DSA problems
- Provide mentorship in Data Structures, Algorithms, ML, and LLMs

Teaching Philosophy:
- Always explain the LOGIC before the SYNTAX
- Use Tanglish (Tamil + English mix) for better understanding
- Break down complex topics into simple steps
- Provide real-world context and examples
- Encourage problem-solving over direct answers

Features:
- Use Google Search for current facts (news, updates, technical releases)
- Provide personalized roadmap based on user level
- Create custom coding problems matching skill level
- Explain edge cases and optimizations
- Track progress toward 180+ DSA problems

Tone:
- Empathetic and supportive
- Challenging yet encouraging
- Clear and concise
- Goal-oriented

Example Tanglish responses:
"Anna/Akka, DSA basics learn panna important! First-ah Arrays understand panni, then linked lists move pannum!"`;

// ===== SESSION MANAGEMENT =====
const chatSessions = new Map(); // Store user sessions with chat history

/**
 * Get or create chat session for a user
 * @param {string} userId - Unique user identifier
 * @returns {Object} Chat session with history
 */
function getOrCreateSession(userId) {
    if (!chatSessions.has(userId)) {
        chatSessions.set(userId, {
            userId,
            history: [],
            createdAt: new Date(),
            lastActivity: new Date(),
            messageCount: 0
        });
    }
    
    const session = chatSessions.get(userId);
    session.lastActivity = new Date();
    return session;
}

/**
 * Clear old sessions (older than 24 hours)
 */
function cleanupOldSessions() {
    const now = new Date();
    const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [userId, session] of chatSessions.entries()) {
        if (now - session.lastActivity > MAX_AGE_MS) {
            chatSessions.delete(userId);
        }
    }
}

// Clean sessions every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// ===== CHAT FUNCTION =====
/**
 * Send message to Jarvis AI and get response
 * @param {string} userMessage - User's message
 * @param {Object} session - User's chat session
 * @returns {Promise<Object>} AI response with metadata
 */
async function askJarvis(userMessage, session) {
    try {
        // Initialize Gemini model with tools
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [
                {
                    googleSearchRetrieval: {} // Enable Google Search
                }
            ]
        });

        // Build conversation history for the model
        const conversationHistory = session.history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        // Add current user message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Get response from Gemini
        const chat = model.startChat({
            history: conversationHistory
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const aiText = response.text();

        // Store in session history
        session.history.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        session.history.push({
            role: 'model',
            content: aiText,
            timestamp: new Date()
        });

        session.messageCount++;

        // Keep only last 50 messages in history to prevent memory bloat
        if (session.history.length > 50) {
            session.history = session.history.slice(-50);
        }

        return {
            success: true,
            message: aiText,
            sessionId: session.userId,
            messageCount: session.messageCount,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        throw error;
    }
}

// ===== ROUTES =====

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        sessions: chatSessions.size
    });
});

/**
 * Main Chat Route
 * POST /chat
 * Body: { userId, message }
 */
app.post('/chat', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { userId, message } = req.body;

        // Validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'message is required and must be non-empty string'
            });
        }

        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                error: 'message exceeds maximum length of 5000 characters'
            });
        }

        // Get or create session
        const session = getOrCreateSession(userId);

        // Log request
        console.log(`📨 ${new Date().toISOString()} | User: ${userId} | Message: ${message.substring(0, 50)}...`);

        // Get AI response
        const aiResponse = await askJarvis(message, session);

        const processingTime = Date.now() - startTime;

        // Send response
        res.json({
            success: true,
            data: aiResponse,
            processingTime: `${processingTime}ms`
        });

        console.log(`✅ Response sent in ${processingTime}ms`);

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        console.error(`❌ Error in /chat: ${error.message}`);
        
        // Send error response
        res.status(500).json({
            success: false,
            error: 'Failed to get response from Jarvis',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            processingTime: `${processingTime}ms`
        });
    }
});

/**
 * Get Session History
 * GET /history/:userId
 */
app.get('/history/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const session = chatSessions.get(userId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: {
                userId: session.userId,
                messageCount: session.messageCount,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                history: session.history.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }))
            }
        });

    } catch (error) {
        console.error('❌ Error in /history:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Clear Session
 * POST /clear-session/:userId
 */
app.post('/clear-session/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        
        if (chatSessions.has(userId)) {
            chatSessions.delete(userId);
            res.json({
                success: true,
                message: `Session for user ${userId} cleared`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

    } catch (error) {
        console.error('❌ Error in /clear-session:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get All Sessions (Admin)
 * GET /admin/sessions
 */
app.get('/admin/sessions', (req, res) => {
    try {
        const sessions = Array.from(chatSessions.values()).map(s => ({
            userId: s.userId,
            messageCount: s.messageCount,
            createdAt: s.createdAt,
            lastActivity: s.lastActivity,
            historyLength: s.history.length
        }));

        res.json({
            success: true,
            data: {
                totalSessions: sessions.length,
                sessions
            }
        });

    } catch (error) {
        console.error('❌ Error in /admin/sessions:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        availableRoutes: [
            'POST /chat',
            'GET /health',
            'GET /history/:userId',
            'POST /clear-session/:userId',
            'GET /admin/sessions'
        ]
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║        🤖 JARVIS AI BACKEND - GEMINI 1.5 FLASH 🤖        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Base URL: http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(-5)}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n🛣️  Available Routes:');
    console.log('   POST   /chat                 - Send message to Jarvis');
    console.log('   GET    /health               - Server health check');
    console.log('   GET    /history/:userId      - Get chat history');
    console.log('   POST   /clear-session/:userId- Clear session');
    console.log('   GET    /admin/sessions       - View all sessions');
    console.log('\n📝 Example Request:');
    console.log('   curl -X POST http://localhost:3000/chat \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"userId":"user123","message":"How to learn DSA?"}\'');
    console.log('\n💡 Features Enabled:');
    console.log('   ✅ Google Search Retrieval');
    console.log('   ✅ Chat History Management');
    console.log('   ✅ Multi-user Sessions');
    console.log('   ✅ Tanglish Mentoring');
    console.log('   ✅ Error Handling');
    console.log('\n');
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
    console.log('📍 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📍 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Export for testing
module.exports = { app, askJarvis, getOrCreateSession };
