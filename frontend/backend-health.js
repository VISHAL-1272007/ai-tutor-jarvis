/**
 * JARVIS Backend Health Monitor
 * Automatically checks backend connectivity and wakes up sleeping Render servers
 */

import { getBackendURL } from './config.js';

const BACKEND_URL = getBackendURL();
let backendStatus = 'checking';
let lastHealthCheck = null;

// Health Check
async function checkBackendHealth() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(`${BACKEND_URL}/health`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            backendStatus = 'online';
            lastHealthCheck = new Date();
            console.log('✅ Backend is ONLINE');
            return true;
        } else {
            backendStatus = 'error';
            console.warn('⚠️ Backend returned error:', response.status);
            return false;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⏱️ Backend health check timed out - server may be sleeping');
            backendStatus = 'sleeping';
        } else {
            console.error('❌ Backend health check failed:', error.message);
            backendStatus = 'offline';
        }
        return false;
    }
}

// Wake Up Backend (if sleeping)
async function wakeUpBackend() {
    console.log('🔄 Attempting to wake up backend...');
    
    const statusElement = document.getElementById('backend-status');
    if (statusElement) {
        statusElement.innerHTML = '🔄 Waking up server... (may take 30-60 seconds)';
        statusElement.className = 'backend-status warning';
    }
    
    try {
        // Try multiple endpoints to wake up
        const endpoints = ['/health', '/api/chat', '/ask'];
        
        for (const endpoint of endpoints) {
            try {
                await fetch(`${BACKEND_URL}${endpoint}`, {
                    method: endpoint === '/health' ? 'GET' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: endpoint !== '/health' ? JSON.stringify({ 
                        message: 'wake up', 
                        question: 'wake up' 
                    }) : undefined
                });
            } catch (e) {
                // Ignore errors, we're just waking up
            }
        }
        
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 3000));
        const isOnline = await checkBackendHealth();
        
        if (isOnline) {
            if (statusElement) {
                statusElement.innerHTML = '✅ Backend is ONLINE';
                statusElement.className = 'backend-status online';
            }
            return true;
        } else {
            if (statusElement) {
                statusElement.innerHTML = '⏱️ Server starting... Please wait';
                statusElement.className = 'backend-status warning';
            }
            return false;
        }
    } catch (error) {
        console.error('Failed to wake backend:', error);
        return false;
    }
}

// Smart API Call with Auto-Retry
async function smartApiCall(endpoint, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Check if backend is sleeping
            if (backendStatus === 'sleeping' || backendStatus === 'offline') {
                console.log(`🔄 Attempt ${attempt}: Backend is ${backendStatus}, trying to wake...`);
                await wakeUpBackend();
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
            
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                backendStatus = 'online';
                return response;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn(`⚠️ Attempt ${attempt}/${retries} failed:`, error.message);
            
            if (attempt < retries) {
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.log(`⏱️ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Try to wake backend before retry
                if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                    await wakeUpBackend();
                }
            } else {
                throw error;
            }
        }
    }
}

// Display Backend Status
function displayBackendStatus() {
    const statusElement = document.getElementById('backend-status');
    if (!statusElement) return;
    
    switch (backendStatus) {
        case 'online':
            statusElement.innerHTML = '✅ Backend Online';
            statusElement.className = 'backend-status online';
            break;
        case 'sleeping':
            statusElement.innerHTML = '😴 Backend Sleeping (Click to wake)';
            statusElement.className = 'backend-status warning';
            statusElement.style.cursor = 'pointer';
            statusElement.onclick = wakeUpBackend;
            break;
        case 'offline':
            statusElement.innerHTML = '❌ Backend Offline';
            statusElement.className = 'backend-status offline';
            break;
        case 'checking':
            statusElement.innerHTML = '🔍 Checking backend...';
            statusElement.className = 'backend-status checking';
            break;
        case 'error':
            statusElement.innerHTML = '⚠️ Backend Error';
            statusElement.className = 'backend-status error';
            break;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing JARVIS Backend Health Monitor...');
    
    // Check backend health immediately
    await checkBackendHealth();
    displayBackendStatus();
    
    // Recheck every 2 minutes
    setInterval(async () => {
        await checkBackendHealth();
        displayBackendStatus();
    }, 120000);
});

// Export functions for use in other scripts
window.jarvisBackend = {
    checkHealth: checkBackendHealth,
    wakeUp: wakeUpBackend,
    smartCall: smartApiCall,
    getStatus: () => backendStatus
};
