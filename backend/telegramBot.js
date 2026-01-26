const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const jarvisAutonomous = require('./jarvis-autonomous-rag');
const geminiVision = require('./gemini-vision-analyzer');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const startTelegramBot = () => {
    if (!TELEGRAM_TOKEN) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN missing. Telegram Bot will not start.');
        return;
    }

    const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    console.log('✅ JARVIS Telegram Bot is standing by, Sir.');

    // Helper to check for ADMIN access
    const isAdmin = (msg) => {
        if (!ADMIN_CHAT_ID || ADMIN_CHAT_ID === 'YOUR_ADMIN_CHAT_ID_HERE') return true; // Allow all if not set or placeholder
        return msg.chat.id.toString() === ADMIN_CHAT_ID.toString();
    };

    // Welcome Command
    bot.onText(/\/start/, (msg) => {
        if (!isAdmin(msg)) return bot.sendMessage(msg.chat.id, "Sorry Sir, I am only programmed to assist the Administrator.");
        
        const welcomeMessage = `Greetings! I am JARVIS, your Personal AI Tutor.\n\n` +
            `I am equipped with Multimodal Vision, Live News Training, and Advanced RAG capabilities.\n\n` +
            `Available Commands:\n` +
            `🔹 Send me a **Photo** to analyze it\n` +
            `🔹 /dailyquiz - Generate 3 MCQs from today's news\n` +
            `🔹 Send any question for **Smart Search** resolution\n` +
            `🔹 /help - Show this message`;
        
        bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Daily Quiz Command
    bot.onText(/\/dailyquiz/, async (msg) => {
        if (!isAdmin(msg)) return;
        
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Sir, let me fetch the latest news and prepare your quiz...");

        try {
            // Read daily news database
            const newsPath = path.join(__dirname, '../data/daily_news.json');
            let newsData = [];
            if (fs.existsSync(newsPath)) {
                newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
            }

            if (newsData.length === 0) {
                return bot.sendMessage(chatId, "I apologize Sir, the news database is empty. Please run /train-news first.");
            }

            const latestNews = newsData.slice(0, 5).map(n => n.title).join('\n');
            const prompt = `Based on these news headlines:\n${latestNews}\n\nGenerate 3 Multiple Choice Questions (MCQs) for a student. For each question, provide 4 options (A, B, C, D) and specify the correct answer at the end. Format it elegantly.`;
            
            const result = await jarvisAutonomous.answer(prompt, chatId.toString());
            bot.sendMessage(chatId, `🎯 **TODAY'S KNOWLEDGE CHECK**\n\n${result.answer}`, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Quiz Generation Error:', error);
            bot.sendMessage(chatId, "Sir, I encountered an error while synthesizing the quiz.");
        }
    });

    // Handle Photos (Vision)
    bot.on('photo', async (msg) => {
        if (!isAdmin(msg)) return;
        
        const chatId = msg.chat.id;
        const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
        
        bot.sendMessage(chatId, "Analyzing image, Sir. One moment please...");

        try {
            const file = await bot.getFile(photo.file_id);
            const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;
            
            // Call our existing Vision Analyzer (analyzeMedia)
            const analysisResult = await geminiVision.analyzeMedia({ imageUrl }, "Summarize this image for a student.");
            const analysisText = analysisResult.vision_analysis?.scene_description || analysisResult.raw_text || "Analysis complete.";
            
            bot.sendMessage(chatId, `🔍 **VISION ANALYSIS:**\n\n${analysisText}`, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Vision Error:', error);
            bot.sendMessage(chatId, "Sir, my visual sensors are experiencing interference (Error analyzing image).");
        }
    });

    // Handle Text (Smart Search)
    bot.on('message', async (msg) => {
        if (!isAdmin(msg)) return;
        if (msg.text && !msg.text.startsWith('/')) {
            const chatId = msg.chat.id;
            bot.sendChatAction(chatId, 'typing');

            try {
                // Use Autonomous RAG for smart search (answer method)
                const result = await jarvisAutonomous.answer(msg.text, chatId.toString());
                bot.sendMessage(chatId, result.answer, { parse_mode: 'Markdown' });
            } catch (error) {
                console.error('Text Search Error:', error);
                bot.sendMessage(chatId, "Sir, I'm having trouble connecting to my knowledge base.");
            }
        }
    });
};

module.exports = { startTelegramBot };
