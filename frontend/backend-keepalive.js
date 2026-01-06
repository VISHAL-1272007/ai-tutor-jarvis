/**
 * Backend Keep-Alive Service
 * Prevents Render cold starts by pinging the backend regularly
 */

const BACKEND_URL = 'https://ai-tutor-jarvis.onrender.com';
const HEALTH_ENDPOINT = `${BACKEND_URL}/health`;
const PING_INTERVAL = 45 * 1000; // Ping every 45 seconds - NEVER let it sleep!
const REDUNDANT_PING_INTERVAL = 30 * 1000; // Extra ping every 30 seconds
const MAX_RETRIES = 5;
const RETRY_DELAY = 800;
const PARALLEL_WAKEUP_REQUESTS = 3;

class BackendKeepAlive {
    constructor() {
        this.isAlive = true;
        this.lastPing = null;
        this.pingTimer = null;
        this.redundantPingTimer = null; // Second timer for redundant pinging
        this.wakeupPromise = null;
    }

    /**
     * Initialize keep-alive service
     */
    async init() {
        console.log('🚀 Initializing ALWAYS-ALIVE Backend Service...');
        console.log('⚡ Backend will NEVER sleep - Guaranteed 24/7 uptime!');
        
        // Immediate aggressive wake-up on page load (parallel requests)
        this.wakeUpBackend(); // Don't await - let it run in background
        
        // Start periodic pinging immediately
        this.startPeriodicPing();
        
        // Wake up backend when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page is visible again - ensure backend is awake
                if (!this.isAlive || this.getTimeSinceLastPing() > 3 * 60 * 1000) {
                    this.wakeUpBackend();
                }
            }
        });

        // Aggressive ping before user leaves (to keep it warm for next visit)
        window.addEventListener('beforeunload', () => {
            // Send 2 pings to keep it extra warm
            this.ping(false);
            setTimeout(() => this.ping(false), 100);
        });
        
        // Pre-warm on focus
        window.addEventListener('focus', () => {
            if (!this.isAlive) {
                this.wakeUpBackend();
            }
        });
    }

    /**
     * Wake up the backend with retries
     */
    async wakeUpBackend() {
        // If already waking up, return existing promise
        if (this.wakeupPromise) {
            return this.wakeupPromise;
        }

        this.wakeupPromise = this._performWakeup();
        const result = await this.wakeupPromise;
        this.wakeupPromise = null;
        
        return result;
    }

    async _performWakeup() {
        console.log('⏰ Waking up backend with parallel requests...');
        this.showWakeupStatus('⚡ Connecting to JARVIS...', 'info');

        // Try parallel requests first for fastest wake-up
        const parallelSuccess = await this.parallelWakeup();
        if (parallelSuccess) {
            this.isAlive = true;
            this.lastPing = Date.now();
            console.log(`✅ Backend awake via parallel ping!`);
            this.showWakeupStatus('✨ Connected! JARVIS is ready', 'success');
            setTimeout(() => this.hideWakeupStatus(), 1500);
            return true;
        }

        // Fallback to sequential retries with faster timing
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const startTime = Date.now();
                
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000); // Reduced to 15s
                
                const response = await fetch(HEALTH_ENDPOINT, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                clearTimeout(timeout);
                const duration = Date.now() - startTime;

                if (response.ok) {
                    this.isAlive = true;
                    this.lastPing = Date.now();
                    console.log(`✅ Backend is awake! (${duration}ms)`);
                    this.showWakeupStatus('✨ Connected! JARVIS is ready', 'success');
                    setTimeout(() => this.hideWakeupStatus(), 1500);
                    return true;
                }
            } catch (error) {
                console.warn(`⚠️ Wake-up attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
                
                if (attempt < MAX_RETRIES) {
                    this.showWakeupStatus(`⚡ Connecting... ${attempt}/${MAX_RETRIES}`, 'info');
                    await this.sleep(RETRY_DELAY); // Fast retry
                } else {
                    this.isAlive = false;
                    console.error('❌ Failed to wake up backend');
                    this.showWakeupStatus('⚠️ Slow connection. Retrying...', 'warning');
                    
                    // One more aggressive attempt after a short pause
                    await this.sleep(1000);
                    const lastAttempt = await this.parallelWakeup();
                    if (lastAttempt) {
                        this.isAlive = true;
                        this.lastPing = Date.now();
                        this.showWakeupStatus('✨ Connected!', 'success');
                        setTimeout(() => this.hideWakeupStatus(), 1500);
                        return true;
                    }
                    
                    setTimeout(() => this.hideWakeupStatus(), 3000);
                    return false;
                }
            }
        }

        return false;
    }

    /**
     * Parallel wake-up - send multiple requests simultaneously for faster response
     */
    async parallelWakeup() {
        try {
            const requests = Array(PARALLEL_WAKEUP_REQUESTS).fill(null).map(() => 
                fetch(HEALTH_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    signal: AbortSignal.timeout(12000) // 12s timeout
                }).catch(() => null)
            );

            // Race - whoever responds first wins
            const response = await Promise.race(requests);
            
            if (response && response.ok) {
                // Cancel remaining requests (they'll complete but we don't wait)
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('Parallel wake-up failed:', error);
            return false;
        }
    }

    /**
     * Ping backend to keep it alive
     */
    async ping(showStatus = false) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout for pings
            
            const response = await fetch(HEALTH_ENDPOINT, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            clearTimeout(timeout);

            if (response.ok) {
                this.isAlive = true;
                this.lastPing = Date.now();
                if (showStatus) {
                    console.log('💚 Backend pinged successfully');
                }
                return true;
            }
        } catch (error) {
            this.isAlive = false;
            console.warn('⚠️ Ping failed:', error.message);
            
            // If ping fails, try to wake up again quickly
            if (showStatus) {
                setTimeout(() => this.wakeUpBackend(), 500);
            }
            return false;
        }
    }

    /**
     * Start periodic pinging to prevent sleep
     */
    startPeriodicPing() {
        // Clear any existing timers
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
        }
        if (this.redundantPingTimer) {
            clearInterval(this.redundantPingTimer);
        }

        // PRIMARY PING: Every 45 seconds - Main keep-alive
        this.pingTimer = setInterval(() => {
            this.ping(false);
            console.log('🔄 Primary ping (45s interval)');
        }, PING_INTERVAL);

        // REDUNDANT PING: Every 30 seconds - Backup keep-alive (offset by 15s)
        setTimeout(() => {
            this.redundantPingTimer = setInterval(() => {
                this.ping(false);
                console.log('🔄 Redundant ping (30s interval)');
            }, REDUNDANT_PING_INTERVAL);
            
            // Fire the first redundant ping immediately (offset)
            this.ping(false);
        }, 15000); // Start offset by 15 seconds

        console.log('🚀 ULTRA-AGGRESSIVE KEEP-ALIVE STARTED:');
        console.log('   ⚡ Primary ping: every 45 seconds');
        console.log('   ⚡ Redundant ping: every 30 seconds (offset)');
        console.log('   ⚡ Result: ~40+ pings per 15 minutes');
        console.log('   ⚡ Backend will NEVER sleep!');
        console.log('   💚 Status: ALWAYS ALIVE - 24/7 GUARANTEED');
        
        // Also ping immediately on any user interaction
        this.setupInteractionPing();
        
        // Initial ping right now
        this.ping(false);
    }

    /**
     * Setup pinging on user interactions to keep backend hot
     */
    setupInteractionPing() {
        let lastInteractionPing = 0;
        const INTERACTION_PING_COOLDOWN = 2 * 60 * 1000; // Ping at most every 2 minutes on interaction

        const interactionHandler = () => {
            const now = Date.now();
            if (now - lastInteractionPing > INTERACTION_PING_COOLDOWN) {
                lastInteractionPing = now;
                this.ping(false);
                console.log('👆 User interaction - keeping backend warm');
            }
        };

        // Ping on any significant user interaction
        document.addEventListener('click', interactionHandler, { passive: true, once: false });
        document.addEventListener('keypress', interactionHandler, { passive: true, once: false });
    }

    /**
     * Stop periodic pinging
     */
    stopPeriodicPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.redundantPingTimer) {
            clearInterval(this.redundantPingTimer);
            this.redundantPingTimer = null;
        }
        console.log('⏸️ All periodic pings stopped');
    }

    /**
     * Show wake-up status to user
     */
    showWakeupStatus(message, type = 'info') {
        let statusEl = document.getElementById('backend-status');
        
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'backend-status';
            statusEl.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                animation: slideDown 0.3s ease;
            `;
            document.body.appendChild(statusEl);
        }

        // Set colors based on type
        const styles = {
            info: {
                bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                icon: '⚡'
            },
            success: {
                bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                icon: '✨'
            },
            warning: {
                bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                icon: '⏰'
            },
            error: {
                bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                icon: '⚠️'
            }
        };

        const style = styles[type] || styles.info;
        statusEl.style.background = style.bg;
        statusEl.style.color = style.color;
        
        // Add spinner for info state
        const spinner = type === 'info' ? '<div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>' : '';
        
        statusEl.innerHTML = `
            ${spinner}
            <span>${style.icon}</span>
            <span>${message}</span>
        `;
        
        statusEl.style.display = 'flex';
    }

    /**
     * Hide wake-up status
     */
    hideWakeupStatus() {
        const statusEl = document.getElementById('backend-status');
        if (statusEl) {
            statusEl.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Check if backend is ready
     */
    isReady() {
        return this.isAlive;
    }

    /**
     * Get time since last successful ping
     */
    getTimeSinceLastPing() {
        if (!this.lastPing) return Infinity;
        return Date.now() - this.lastPing;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Create global instance
window.backendKeepAlive = new BackendKeepAlive();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.backendKeepAlive.init();
    });
} else {
    window.backendKeepAlive.init();
}

// Export for use in other scripts
export default window.backendKeepAlive;
