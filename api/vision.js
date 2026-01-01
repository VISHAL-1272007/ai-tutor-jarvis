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
        const { image, prompt } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image data required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.json({
                error: '⚠️ Gemini API key missing!',
                answer: 'Please add your GEMINI_API_KEY to the environment variables.'
            });
        }

        // Gemini 1.5 Flash API endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt || "Analyze this UI design and generate the complete HTML, CSS, and JavaScript code to recreate it. Use modern, responsive design principles. Return ONLY the code in a single HTML file structure." },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: image.split(',')[1] // Remove the data:image/jpeg;base64, prefix
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 4096,
            }
        };

        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate code.";

        // Clean up the response (remove markdown code blocks if present)
        let cleanCode = generatedText;
        if (cleanCode.includes('```html')) {
            cleanCode = cleanCode.split('```html')[1].split('```')[0].trim();
        } else if (cleanCode.includes('```')) {
            cleanCode = cleanCode.split('```')[1].split('```')[0].trim();
        }

        return res.json({ answer: cleanCode });

    } catch (error) {
        console.error('Vision Error:', error.response?.data || error.message);
        return res.status(500).json({
            error: 'AI Vision Error',
            details: error.response?.data?.error?.message || error.message
        });
    }
};
