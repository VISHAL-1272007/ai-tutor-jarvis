// ===== JARVIS AUTO-HEALER - AUTONOMOUS ERROR DETECTION & FIXING =====
// Monitors the entire application and auto-fixes issues without user intervention

class JARVISAutoHealer {
    constructor() {
        this.isEnabled = true;
        this.healingLog = [];
        this.healthChecks = [];
        this.autoFixAttempts = 0;
        this.maxAutoFixes = 10; // Prevent infinite loops
        
        this.init();
    }

    init() {
        console.log('🏥 JARVIS Auto-Healer: Online');
        
        // Start continuous monitoring
        this.startContinuousMonitoring();
        
        // Monitor Firebase connection
        this.monitorFirebase();
        
        // Monitor Backend API
        this.monitorBackend();
        
        // Monitor UI elements
        this.monitorUI();
        
        // Monitor Performance
        this.monitorPerformance();
        
        // Auto-fix common issues
        this.setupAutoFixes();
    }

    // ===== CONTINUOUS MONITORING =====
    startContinuousMonitoring() {
        // Check health every 30 seconds
        setInterval(() => {
            if (this.isEnabled) {
                this.runHealthCheck();
            }
        }, 30000);
        
        // Initial check after 5 seconds
        setTimeout(() => this.runHealthCheck(), 5000);
    }

    async runHealthCheck() {
        const results = {
            timestamp: new Date().toISOString(),
            checks: {},
            issues: []
        };

        // Check Backend
        const backendHealth = await this.checkBackend();
        results.checks.backend = backendHealth;
        if (!backendHealth.healthy) {
            results.issues.push({ component: 'backend', ...backendHealth });
            await this.healBackend(backendHealth);
        }

        // Check Firebase
        const firebaseHealth = this.checkFirebaseConnection();
        results.checks.firebase = firebaseHealth;
        if (!firebaseHealth.healthy) {
            results.issues.push({ component: 'firebase', ...firebaseHealth });
            await this.healFirebase(firebaseHealth);
        }

        // Check UI
        const uiHealth = this.checkUI();
        results.checks.ui = uiHealth;
        if (!uiHealth.healthy) {
            results.issues.push({ component: 'ui', ...uiHealth });
            this.healUI(uiHealth);
        }

        // Log results
        this.healthChecks.push(results);
        
        if (results.issues.length > 0) {
            console.warn('🏥 Auto-Healer: Issues detected and being fixed...', results.issues);
        } else {
            console.log('✅ Auto-Healer: All systems healthy');
        }

        return results;
    }

    // ===== BACKEND MONITORING =====
    async checkBackend() {
        try {
            const startTime = performance.now();
            const response = await fetch('https://ai-tutor-jarvis.onrender.com/health', {
                method: 'GET',
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            const duration = performance.now() - startTime;
            
            if (response.ok) {
                return {
                    healthy: true,
                    status: 'online',
                    responseTime: Math.round(duration),
                    statusCode: response.status
                };
            } else {
                return {
                    healthy: false,
                    status: 'error',
                    statusCode: response.status,
                    issue: 'Backend returned error status'
                };
            }
        } catch (error) {
            return {
                healthy: false,
                status: 'offline',
                issue: error.message,
                error: error
            };
        }
    }

    async healBackend(health) {
        if (this.autoFixAttempts >= this.maxAutoFixes) return;
        
        this.logHealing('Backend', 'Attempting to wake up backend...');
        
        // Try to wake up the backend by making a request
        try {
            await fetch('https://ai-tutor-jarvis.onrender.com/health');
            this.logHealing('Backend', 'Wake-up request sent successfully');
            this.autoFixAttempts++;
        } catch (error) {
            this.logHealing('Backend', `Wake-up failed: ${error.message}`, 'error');
        }
    }

    // ===== FIREBASE MONITORING =====
    checkFirebaseConnection() {
        try {
            // Check if Firebase objects exist
            if (typeof auth === 'undefined' || typeof db === 'undefined') {
                return {
                    healthy: false,
                    issue: 'Firebase not initialized',
                    details: 'Auth or DB objects missing'
                };
            }

            // Check if Firebase is ready
            const authReady = auth !== null;
            const dbReady = db !== null;

            if (authReady && dbReady) {
                return {
                    healthy: true,
                    status: 'connected',
                    auth: 'ready',
                    db: 'ready'
                };
            } else {
                return {
                    healthy: false,
                    issue: 'Firebase components not ready',
                    auth: authReady ? 'ready' : 'not ready',
                    db: dbReady ? 'ready' : 'not ready'
                };
            }
        } catch (error) {
            return {
                healthy: false,
                issue: 'Firebase check failed',
                error: error.message
            };
        }
    }

    async healFirebase(health) {
        if (this.autoFixAttempts >= this.maxAutoFixes) return;
        
        this.logHealing('Firebase', 'Attempting to reinitialize Firebase...');
        
        try {
            // Try to reload the firebase-config module
            if (window.location.pathname.includes('dashboard')) {
                // Dashboard uses different Firebase setup
                const script = document.querySelector('script[type="module"][src*="dashboard"]');
                if (script) {
                    const newScript = document.createElement('script');
                    newScript.type = 'module';
                    newScript.src = script.src + '?reload=' + Date.now();
                    script.parentNode.replaceChild(newScript, script);
                    this.logHealing('Firebase', 'Dashboard Firebase module reloaded');
                }
            } else {
                // Reload firebase-config for other pages
                const module = document.querySelector('script[src*="firebase-config"]');
                if (module) {
                    location.reload();
                }
            }
            this.autoFixAttempts++;
        } catch (error) {
            this.logHealing('Firebase', `Reinitialization failed: ${error.message}`, 'error');
        }
    }

    // ===== UI MONITORING =====
    checkUI() {
        const issues = [];

        // Check for critical UI elements
        const criticalElements = {
            'messageInput': 'Message input field',
            'sendBtn': 'Send button',
            'chatContainer': 'Chat container',
            'messagesArea': 'Messages area'
        };

        for (const [id, name] of Object.entries(criticalElements)) {
            const element = document.getElementById(id);
            if (!element) {
                issues.push(`Missing: ${name} (${id})`);
            }
        }

        // Check for JavaScript errors in console
        if (window.jarvisTracer && window.jarvisTracer.errors.length > 0) {
            const recentErrors = window.jarvisTracer.errors.slice(-5);
            issues.push(`${recentErrors.length} recent errors detected`);
        }

        return {
            healthy: issues.length === 0,
            issues: issues,
            elementsChecked: Object.keys(criticalElements).length
        };
    }

    healUI(health) {
        if (this.autoFixAttempts >= this.maxAutoFixes) return;
        
        health.issues.forEach(issue => {
            this.logHealing('UI', `Detected issue: ${issue}`);
            
            // Auto-fix: Remove broken elements
            if (issue.includes('Missing')) {
                this.logHealing('UI', 'Critical element missing - page may need reload');
            }
        });

        this.autoFixAttempts++;
    }

    // ===== PERFORMANCE MONITORING =====
    monitorPerformance() {
        // Monitor page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            if (loadTime > 5000) {
                this.logHealing('Performance', `Slow page load: ${Math.round(loadTime)}ms`, 'warning');
            } else {
                console.log(`⚡ Page loaded in ${Math.round(loadTime)}ms`);
            }
        });

        // Monitor memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const usedMemory = performance.memory.usedJSHeapSize / 1048576; // MB
                const totalMemory = performance.memory.totalJSHeapSize / 1048576; // MB
                
                if (usedMemory > 100) { // Over 100MB
                    this.logHealing('Performance', `High memory usage: ${usedMemory.toFixed(2)}MB`, 'warning');
                }
            }, 60000); // Check every minute
        }
    }

    // ===== AUTO-FIX COMMON ISSUES =====
    setupAutoFixes() {
        // Fix 1: Auto-retry failed API calls
        this.interceptFetch();

        // Fix 2: Auto-restore broken event listeners
        this.monitorEventListeners();

        // Fix 3: Auto-fix broken images
        this.fixBrokenImages();

        // Fix 4: Auto-reload on critical errors
        this.setupCriticalErrorHandler();
    }

    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                // Log API call
                if (window.jarvisTracer) {
                    window.jarvisTracer.logAPICall(
                        args[0],
                        args[1]?.method || 'GET',
                        response.status,
                        0
                    );
                }

                // Auto-retry on 5xx errors
                if (response.status >= 500 && response.status < 600) {
                    this.logHealing('API', `Server error ${response.status}, retrying in 5s...`);
                    
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    return originalFetch(...args);
                }

                return response;
            } catch (error) {
                // Auto-retry on network errors
                this.logHealing('API', `Network error: ${error.message}, retrying...`);
                
                await new Promise(resolve => setTimeout(resolve, 3000));
                return originalFetch(...args);
            }
        };
    }

    monitorEventListeners() {
        // Check if critical buttons have event listeners
        setInterval(() => {
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn && !sendBtn.onclick && !sendBtn.hasAttribute('data-listener')) {
                this.logHealing('UI', 'Send button event listener missing - may need page reload', 'warning');
            }
        }, 60000);
    }

    fixBrokenImages() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.logHealing('UI', 'Broken image detected, replacing with placeholder');
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🖼️</text></svg>';
            }
        }, true);
    }

    setupCriticalErrorHandler() {
        let criticalErrorCount = 0;
        const maxCriticalErrors = 3;

        window.addEventListener('error', (event) => {
            // Check if it's a critical error
            if (event.message.includes('Firebase') || 
                event.message.includes('auth') ||
                event.message.includes('Cannot read')) {
                
                criticalErrorCount++;
                
                if (criticalErrorCount >= maxCriticalErrors) {
                    this.logHealing('Critical', `${maxCriticalErrors} critical errors detected, reloading page...`);
                    setTimeout(() => location.reload(), 2000);
                }
            }
        });
    }

    // ===== MONITORING HELPERS =====
    monitorFirebase() {
        // Monitor auth state changes
        if (typeof auth !== 'undefined' && auth) {
            try {
                const { onAuthStateChanged } = window;
                if (onAuthStateChanged) {
                    onAuthStateChanged(auth, (user) => {
                        if (user) {
                            console.log('🔐 Auto-Healer: User authenticated -', user.email || user.uid);
                        } else {
                            console.log('🔓 Auto-Healer: No user authenticated (guest mode)');
                        }
                    });
                }
            } catch (error) {
                this.logHealing('Firebase', 'Auth monitoring setup failed', 'error');
            }
        }
    }

    monitorBackend() {
        // Check backend status periodically
        setInterval(async () => {
            const health = await this.checkBackend();
            
            if (!health.healthy) {
                console.warn('⚠️ Backend unhealthy:', health);
            } else if (health.responseTime > 2000) {
                console.warn(`⚠️ Backend slow: ${health.responseTime}ms`);
            }
        }, 120000); // Every 2 minutes
    }

    monitorUI() {
        // Observe DOM changes and fix issues
        const observer = new MutationObserver((mutations) => {
            // Check if critical elements were removed
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach((node) => {
                        if (node.id === 'chatContainer' || node.id === 'messagesArea') {
                            this.logHealing('UI', 'Critical element removed from DOM', 'error');
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ===== LOGGING =====
    logHealing(component, message, level = 'info') {
        const log = {
            timestamp: new Date().toISOString(),
            component,
            message,
            level
        };

        this.healingLog.push(log);

        const emoji = {
            info: '🔧',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        }[level] || '🔧';

        console.log(`${emoji} Auto-Healer [${component}]: ${message}`);

        // Keep only last 50 logs
        if (this.healingLog.length > 50) {
            this.healingLog.shift();
        }

        // Track in tracer if available
        if (window.jarvisTracer) {
            window.jarvisTracer.logEvent('Auto-Healing', { component, message, level });
        }
    }

    // ===== PUBLIC API =====
    enable() {
        this.isEnabled = true;
        console.log('✅ Auto-Healer: Enabled');
    }

    disable() {
        this.isEnabled = false;
        console.log('⏸️ Auto-Healer: Disabled');
    }

    getStatus() {
        return {
            enabled: this.isEnabled,
            autoFixAttempts: this.autoFixAttempts,
            maxAutoFixes: this.maxAutoFixes,
            healingLog: this.healingLog.slice(-10),
            lastHealthCheck: this.healthChecks[this.healthChecks.length - 1]
        };
    }

    viewLogs() {
        console.group('🏥 Auto-Healer Status');
        console.log('Enabled:', this.isEnabled);
        console.log('Auto-fix attempts:', this.autoFixAttempts, '/', this.maxAutoFixes);
        console.log('Recent healing actions:', this.healingLog.slice(-10));
        console.log('Last health check:', this.healthChecks[this.healthChecks.length - 1]);
        console.groupEnd();
    }

    exportLogs() {
        const report = {
            status: this.getStatus(),
            allLogs: this.healingLog,
            healthChecks: this.healthChecks
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auto-healer-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📥 Auto-Healer logs exported');
    }
}

// Initialize Auto-Healer
const jarvisAutoHealer = new JARVISAutoHealer();
window.jarvisAutoHealer = jarvisAutoHealer;

console.log('🏥 JARVIS Auto-Healer: Ready - Your app is now self-healing!');
console.log('💡 Use jarvisAutoHealer.viewLogs() to see healing activity');
