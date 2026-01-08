// ===== GEMINI VISION AI INTEGRATION =====
// Google Gemini API for image analysis

import { API_KEYS } from './config.js';

class GeminiVisionAPI {
    constructor() {
        this.apiKey = API_KEYS.gemini;
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.model = 'gemini-1.5-flash';
    }

    /**
     * Analyze image with text prompt
     * @param {string} imageBase64 - Base64 encoded image
     * @param {string} prompt - User's question about the image
     * @returns {Promise<string>} AI response
     */
    async analyzeImage(imageBase64, prompt) {
        try {
            const requestBody = {
                contents: [{
                    parts: [
                        {
                            text: prompt || "What's in this image? Describe it in detail."
                        },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageBase64
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

            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error:', errorData);
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract text from response
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Gemini Vision API Error:', error);
            throw error;
        }
    }

    /**
     * Check if API key is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY';
    }

    /**
     * Get available features
     * @returns {Array<string>}
     */
    getFeatures() {
        return [
            'Image Description',
            'Object Detection',
            'Text Extraction (OCR)',
            'Scene Understanding',
            'Question Answering',
            'Code Recognition',
            'Math Problem Solving',
            'Document Analysis'
        ];
    }
}

// Initialize and export
const geminiVision = new GeminiVisionAPI();
export { geminiVision };

// Test function (for debugging)
export async function testGeminiVision() {
    if (!geminiVision.isConfigured()) {
        console.warn('⚠️ Gemini API key not configured');
        return false;
    }
    
    console.log('✅ Gemini Vision API configured');
    console.log('📋 Available features:', geminiVision.getFeatures());
    return true;
}
