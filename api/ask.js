const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question, history } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question required' });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.json({
                answer: '⚠️ Please add your Groq API key!\n\nGet it from: https://console.groq.com/keys'
            });
        }

        const messages = [
            {
                role: 'system',
                content: `You are JARVIS, an advanced AI Assistant with Universal Knowledge.
                
CORE INSTRUCTIONS:
1. **STRUCTURE IS KEY:** ALWAYS use bullet points, numbered lists, and bold text. DO NOT write long, blocky paragraphs.
2. **BALANCED LENGTH:** Your answers must be "just right" - not too short, not too long.
3. **DIRECT RELEVANCE:** Answer ONLY what is asked. Do not add unnecessary fluff.
4. **UNIVERSAL EXPERT:** You can answer questions on ANY topic with high accuracy.
5. **ENGINEERING SPECIALIZATION:** Maintain deep expertise in Engineering, Coding, and Math.

FORMATTING RULES:
- Use **Bold** for key terms.
- Use Lists (1., 2., 3. or - ) for steps or types.
- Use Code Blocks for code.
- Keep sentences clear and direct.`
            }
        ];

        if (history && Array.isArray(history)) {
            messages.push(...history);
        }

        messages.push({ role: 'user', content: question });

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
                }
            }
        );

        const answer = response.data?.choices?.[0]?.message?.content || "I'm here to help! Try again.";
        return res.json({ answer });

    } catch (error) {
        console.error('Error:', error.message);

        if (error.response?.status === 401) {
            return res.json({ answer: '⚠️ Invalid API key! Please check your Groq API key.' });
        } else if (error.response?.status === 429) {
            return res.json({ answer: '⚠️ Too many requests. Wait a moment and try again.' });
        } else {
            return res.json({ answer: `Error: ${error.message}` });
        }
    }
};
