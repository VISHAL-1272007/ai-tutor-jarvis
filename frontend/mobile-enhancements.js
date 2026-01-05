/**
 * Mobile UI/UX Enhancements for JARVIS 6.0
 * Provides native app-like experience on mobile devices
 */

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

// Mobile Enhancement Class
class MobileEnhancements {
    constructor() {
        this.init();
    }

    init() {
        if (!isMobile) return;

        this.setupTouchFeedback();
        this.setupSwipeGestures();
        this.setupPullToRefresh();
        this.setupSmoothScrolling();
        this.setupHapticFeedback();
        this.setupIOSSpecific();
        this.setupAndroidSpecific();
        this.optimizeAnimations();
        this.preventZoom();
        this.setupLongPress();
    }

    // Add visual feedback for all touch interactions
    setupTouchFeedback() {
        const elements = document.querySelectorAll('button, a, .header-link, .chip, .tool-card, .course-card, .stat-card');
        
        elements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.style.transform = 'scale(0.95)';
                element.style.opacity = '0.8';
            }, { passive: true });

            element.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.opacity = '';
                }, 150);
            }, { passive: true });

            element.addEventListener('touchcancel', (e) => {
                element.style.transform = '';
                element.style.opacity = '';
            }, { passive: true });
        });
    }

    // Swipe gestures for navigation
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startX, endX, startY, endY) {
        const diffX = startX - endX;
        const diffY = startY - endY;
        const threshold = 100;

        // Horizontal swipe (more than vertical)
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swipe left
                    this.onSwipeLeft();
                } else {
                    // Swipe right
                    this.onSwipeRight();
                }
            }
        }
    }

    onSwipeLeft() {
        // Navigate to next page or show sidebar
        console.log('Swiped left');
    }

    onSwipeRight() {
        // Go back or hide sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }

    // Pull to refresh functionality
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        const threshold = 80;

        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-to-refresh-indicator';
        refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshIndicator.style.cssText = `
            position: fixed;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 40px;
            background: var(--accent-primary, #667eea);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: all 0.3s ease;
            z-index: 9999;
        `;
        document.body.appendChild(refreshIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 0 && diff < threshold * 2) {
                refreshIndicator.style.top = `${diff - 60}px`;
                refreshIndicator.style.transform = `translateX(-50%) rotate(${diff * 3}deg)`;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;

            const diff = currentY - startY;
            if (diff > threshold) {
                refreshIndicator.style.top = '20px';
                refreshIndicator.querySelector('i').classList.add('fa-spin');
                
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                refreshIndicator.style.top = '-60px';
                refreshIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
            }
            
            isPulling = false;
            startY = 0;
            currentY = 0;
        });
    }

    // Smooth scrolling for better mobile UX
    setupSmoothScrolling() {
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Momentum scrolling for iOS
        document.body.style.webkitOverflowScrolling = 'touch';
    }

    // Haptic feedback (vibration)
    setupHapticFeedback() {
        if (!('vibrate' in navigator)) return;

        const buttons = document.querySelectorAll('button, .header-link, .chip');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                navigator.vibrate(10); // Short vibration
            });
        });

        // Longer vibration for important actions
        const importantButtons = document.querySelectorAll('.send-btn, .reset-btn, #sendBtn');
        importantButtons.forEach(button => {
            button.addEventListener('click', () => {
                navigator.vibrate([20, 10, 20]); // Pattern vibration
            });
        });
    }

    // iOS-specific optimizations
    setupIOSSpecific() {
        if (!isIOS) return;

        // Prevent Safari bounce effect
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.messages-area, .chat-container')) return;
            e.preventDefault();
        }, { passive: false });

        // Fix iOS viewport height
        const updateViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        updateViewportHeight();
        window.addEventListener('resize', updateViewportHeight);
        window.addEventListener('orientationchange', updateViewportHeight);

        // Handle iOS safe areas
        document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
    }

    // Android-specific optimizations
    setupAndroidSpecific() {
        if (!isAndroid) return;

        // Add to home screen prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install button
            const installBtn = document.createElement('button');
            installBtn.className = 'install-app-btn';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install JARVIS';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                z-index: 9999;
                cursor: pointer;
                animation: slideInRight 0.5s ease;
            `;

            installBtn.addEventListener('click', async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.remove();
                }
                deferredPrompt = null;
            });

            document.body.appendChild(installBtn);

            // Hide after 10 seconds
            setTimeout(() => {
                installBtn.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => installBtn.remove(), 500);
            }, 10000);
        });
    }

    // Optimize animations for mobile performance
    optimizeAnimations() {
        // Reduce motion for low-end devices
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }

        // Use GPU acceleration
        const animatedElements = document.querySelectorAll('.jarvis-orb-minimal, .stat-card, .course-card');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
            el.style.transform = 'translateZ(0)';
        });
    }

    // Prevent double-tap zoom on buttons
    preventZoom() {
        document.addEventListener('touchend', (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.classList.contains('header-link')) {
                e.preventDefault();
                target.click();
            }
        }, { passive: false });
    }

    // Long press context menu
    setupLongPress() {
        let pressTimer;
        const elements = document.querySelectorAll('.message, .course-card, .tool-card');

        elements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    navigator.vibrate && navigator.vibrate(50);
                    this.showContextMenu(element, e);
                }, 500);
            });

            element.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });

            element.addEventListener('touchmove', () => {
                clearTimeout(pressTimer);
            });
        });
    }

    showContextMenu(element, event) {
        // Custom context menu implementation
        console.log('Long press detected on:', element);
    }
}

// Initialize mobile enhancements
if (isMobile) {
    document.addEventListener('DOMContentLoaded', () => {
        new MobileEnhancements();
        
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        if (isIOS) document.body.classList.add('ios-device');
        if (isAndroid) document.body.classList.add('android-device');

        // Mobile-friendly console
        console.log('📱 JARVIS Mobile Enhancements Active');
        console.log(`Device: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other Mobile'}`);
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(200px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(200px); opacity: 0; }
    }
    
    .mobile-device * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
    }
    
    .mobile-device button,
    .mobile-device a,
    .mobile-device .header-link {
        cursor: pointer;
        user-select: none;
    }
`;
document.head.appendChild(style);
