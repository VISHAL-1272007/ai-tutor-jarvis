/**
 * Backend Keep-Alive Service
 * Prevents Render cold starts by pinging the backend regularly
 */

const BACKEND_URL = 'https://ai-tutor-jarvis.onrender.com';
const HEALTH_ENDPOINT = `${BACKEND_URL}/health`;
const PING_INTERVAL = 5 * 60 * 1000; // Ping every 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

class BackendKeepAlive {
    constructor() {
        this.isAlive = false;
        this.lastPing = null;
        this.pingTimer = null;
        this.wakeupPromise = null;
    }

    /**
     * Initialize keep-alive service
     */
    async init() {
        console.log('🚀 Initializing Backend Keep-Alive Service...');
        
        // Immediate wake-up on page load
        await this.wakeUpBackend();
        
        // Start periodic pinging
        this.startPeriodicPing();
        
        // Wake up backend when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.isAlive) {
                this.wakeUpBackend();
            }
        });

        // Ping before user leaves (to keep it warm for next visit)
        window.addEventListener('beforeunload', () => {
            this.ping(false); // Silent ping
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
        console.log('⏰ Waking up backend...');
        this.showWakeupStatus('Connecting to JARVIS...');

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const startTime = Date.now();
                
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
                
                const response = await fetch(HEALTH_ENDPOINT, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });

                clearTimeout(timeout);
                const duration = Date.now() - startTime;

                if (response.ok) {
                    this.isAlive = true;
                    this.lastPing = Date.now();
                    console.log(`✅ Backend is awake! (${duration}ms)`);
                    this.showWakeupStatus('Connected! Ready to assist you ✨', 'success');
                    
                    // Hide status after 2 seconds
                    setTimeout(() => this.hideWakeupStatus(), 2000);
                    
                    return true;
                }
            } catch (error) {
                console.warn(`⚠️ Wake-up attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
                
                if (attempt < MAX_RETRIES) {
                    this.showWakeupStatus(`Connecting... attempt ${attempt}/${MAX_RETRIES}`, 'warning');
                    await this.sleep(RETRY_DELAY * attempt); // Exponential backoff
                } else {
                    this.isAlive = false;
                    console.error('❌ Failed to wake up backend after all retries');
                    this.showWakeupStatus('Connection failed. Using offline mode...', 'error');
                    setTimeout(() => this.hideWakeupStatus(), 5000);
                    return false;
                }
            }
        }

        return false;
    }

    /**
     * Ping backend to keep it alive
     */
    async ping(showStatus = false) {
        try {
            const response = await fetch(HEALTH_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

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
            
            // If ping fails, try to wake up again
            if (showStatus) {
                this.wakeUpBackend();
            }
            return false;
        }
    }

    /**
     * Start periodic pinging to prevent sleep
     */
    startPeriodicPing() {
        // Clear any existing timer
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
        }

        // Ping every 5 minutes
        this.pingTimer = setInterval(() => {
            if (document.hidden) {
                // Don't ping if tab is not visible (save resources)
                return;
            }
            
            this.ping(false);
        }, PING_INTERVAL);

        console.log('🔄 Periodic ping started (every 5 minutes)');
    }

    /**
     * Stop periodic pinging
     */
    stopPeriodicPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
            console.log('⏸️ Periodic ping stopped');
        }
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
                icon: '🔄'
            },
            success: {
                bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                icon: '✅'
            },
            warning: {
                bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                icon: '⚠️'
            },
            error: {
                bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                icon: '❌'
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
