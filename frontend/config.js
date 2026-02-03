// ===== ENVIRONMENT DETECTION & CONFIGURATION =====
// Automatically detects if running locally or in production

/**
 * Detects current environment
 * @returns {'local'|'production'} Current environment
 */
function detectEnvironment() {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return 'local';
    }
    
    // Production (Firebase, Render, etc.)
    return 'production';
}

/**
 * Get backend URL based on environment
 * @returns {string} Backend API URL
 */
export function getBackendURL() {
    const env = detectEnvironment();
    
    if (env === 'local') {
        // Local development - use localhost backend
        return 'http://localhost:3000';
    } else {
        // Production - use HuggingFace Spaces deployment
        return 'https://aijarvis2025-vishai.hf.space';
    }
}

/**
 * Get current environment name
 * @returns {string} Environment name
 */
export function getEnvironment() {
    return detectEnvironment();
}

/**
 * API Keys Configuration
 * News APIs for JARVIS Master AI
 * Gemini API for Vision capabilities
 */
export const API_KEYS = {
    newsapi: 'f000b146329e4dddb6116bfe6457257d',
    gnews: '04bd561bdf98168ae5a687448240cc6a',
    gemini: 'AIzaSyDqTVxM_Uh-pKXqj6H8NfzC6gV_YQwKxLk', // Gemini Vision API
};

/**
 * Initialize API keys in global scope
 */
export function initializeAPIKeys() {
    window.NEWS_API_KEY = API_KEYS.newsapi;
    window.GNEWS_API_KEY = API_KEYS.gnews;
    
    // Also set in localStorage as fallback
    if (API_KEYS.newsapi) {
        localStorage.setItem('newsapi_api_key', API_KEYS.newsapi);
    }
    if (API_KEYS.gnews) {
        localStorage.setItem('gnews_api_key', API_KEYS.gnews);
    }
    
    console.log('[JARVIS Config] API keys initialized ✅');
}

/**
 * Log configuration info (for debugging)
 */
export function logConfig() {
    const env = detectEnvironment();
    const backendURL = getBackendURL();
    
    console.log(`🌍 Environment: ${env.toUpperCase()}`);
    console.log(`🔗 Backend URL: ${backendURL}`);
}

// Auto-log on import (can be removed in production)
if (detectEnvironment() === 'local') {
    logConfig();
}
