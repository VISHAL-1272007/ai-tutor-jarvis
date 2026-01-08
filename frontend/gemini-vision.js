// ===== GEMINI VISION AI INTEGRATION =====
// Routes through backend to avoid CORS issues

class GeminiVisionAPI {
    constructor() {
        // Use backend endpoint to avoid CORS
        this.backendURL = this.getBackendURL();
        console.log('🔮 Gemini Vision API initialized');
    }

    getBackendURL() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        return 'https://ai-tutor-jarvis.onrender.com';
    }

    /**
     * Analyze image with text prompt
     * @param {string} imageBase64 - Base64 encoded image
     * @param {string} prompt - User's question about the image
     * @returns {Promise<string>} AI response
     */
    async analyzeImage(imageBase64, prompt) {
        try {
            console.log('🔮 Analyzing image via backend...');
            console.log('🔮 Image size:', Math.round(imageBase64.length / 1024), 'KB');
            
            const response = await fetch(`${this.backendURL}/vision`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageBase64,
                    prompt: prompt || "What's in this image? Describe it in detail."
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Vision API Error:', errorData);
                throw new Error(errorData.error || `API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.answer) {
                console.log('✅ Gemini Vision response received');
                return data.answer;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Gemini Vision API Error:', error);
            throw error;
        }
    }

    /**
     * Check if backend is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.backendURL;
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

// Initialize and make globally available
const geminiVision = new GeminiVisionAPI();
window.geminiVision = geminiVision;

// Test function (for debugging) - available as window.testGeminiVision()
window.testGeminiVision = async function() {
    console.log('✅ Gemini Vision API configured');
    console.log('📡 Backend URL:', geminiVision.backendURL);
    console.log('📋 Available features:', geminiVision.getFeatures());
    return true;
};

console.log('🔮 JARVIS Gemini Vision API ready!');
