// ===== JARVIS PWA & APP LOGIC =====

class JARVISApp {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('🚀 JARVIS: Service Worker registered'))
                    .catch(err => console.warn('⚠️ JARVIS: Service Worker failed', err));
            });
        }

        // Handle Installation Prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPromotion();
        });

        // Handle App Installed
        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            console.log('✅ JARVIS: App installed successfully');
            this.showNotification('JARVIS installed to your home screen!', 'success');
        });

        // Detect Offline/Online
        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }

    showInstallPromotion() {
        // Create a custom install button if it doesn't exist
        if (document.getElementById('jarvis-install-btn')) return;

        const installBtn = document.createElement('button');
        installBtn.id = 'jarvis-install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Install JARVIS App';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            border: none;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
            z-index: 9999;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideUp 0.5s ease;
        `;

        installBtn.onclick = async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log(`User response to install: ${outcome}`);
                this.deferredPrompt = null;
                installBtn.remove();
            }
        };

        document.body.appendChild(installBtn);
    }

    updateOnlineStatus(isOnline) {
        if (isOnline) {
            this.showNotification('JARVIS is back online', 'success');
        } else {
            this.showNotification('JARVIS is in offline mode', 'warning');
        }
    }

    showNotification(message, type = 'info') {
        // Reuse the notification logic from voice-control if available, or create simple one
        if (window.jarvisVoice && typeof window.jarvisVoice.showNotification === 'function') {
            window.jarvisVoice.showNotification(message, type);
        } else {
            console.log(`[JARVIS Notification] ${type}: ${message}`);
        }
    }
}

// Initialize App Logic
window.jarvisApp = new JARVISApp();
