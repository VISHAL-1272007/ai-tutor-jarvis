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
        // Production - use Render deployment
        return 'https://ai-tutor-jarvis.onrender.com';
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
