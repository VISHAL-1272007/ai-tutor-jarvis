// ===== Firebase Integration =====
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, signOut, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, getDoc, setDoc, limit } from './firebase-config.js';
import { getBackendURL } from './config.js';

// ===== Configuration =====
// Backend API URL - Auto-detects environment (local/production)
const BACKEND_BASE_URL = getBackendURL();
const API_URL = `${BACKEND_BASE_URL}/ask`;
const MAX_CHARS = 2000;
let isBackendReady = false;
let backendWakeupAttempts = 0;

// ===== Chat History Cache Config =====
const CHAT_CACHE_KEY = 'jarvis_chat_history_cache';
const CHAT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===== Firebase User State =====
let currentUser = null;
let guestPromptCount = parseInt(localStorage.getItem('guestPromptCount')) || 0;
const MAX_GUEST_PROMPTS = 999; // Increased for development/testing

// ===== Emoji Pool for AI Responses =====
const responseEmojis = ['😊', '✨', '🎯', '💡', '🚀', '🌟', '👍', '📚', '🎓', '💪'];

// ===== Voice Configuration =====
let recognition = null;
let synthesis = window.speechSynthesis;
let isVoiceEnabled = true;
let currentLanguage = 'en-US';

// ===== DOM Elements =====
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    chatContainer: document.getElementById('chatContainer'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    developerCredit: document.querySelector('.developer-credit'),
    messagesArea: document.getElementById('messagesArea'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    micBtn: document.getElementById('micBtn'),
    charCount: document.getElementById('charCount'),
    historyList: document.getElementById('historyList'),
    languageSelector: document.getElementById('languageSelector'),
    voiceToggleBtn: document.getElementById('voiceToggleBtn'),
    jarvisOrb: document.getElementById('jarvisOrb')
};

// ===== State =====
let currentChatId = null;
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
let currentChatMessages = []; // Stores current session messages for context
let isTyping = false;
let isListening = false;
let currentMode = 'chat'; // Mode state: 'chat', 'tutor', 'code'

// ===== Plan Configuration =====
const planConfig = {
    free: {
        name: 'Free',
        dailyLimit: Infinity, // Free tier has unlimited basic chat
        features: ['basic-chat', 'multi-language'],
        badge: 'FREE',
        color: '#00d4ff'
    },
    basic: {
        name: 'Basic',
        dailyLimit: Infinity,
        features: ['basic-chat', 'voice', 'basic-code', 'multi-language'],
        badge: 'BASIC ₹300',
        color: '#00d4ff'
    },
    personal: {
        name: 'Personal',
        dailyLimit: Infinity,
        features: ['basic-chat', 'voice', 'advanced-code', 'multi-language', 'priority', 'premium-ai'],
        badge: 'PERSONAL ₹1K',
        color: '#00ff88'
    },
    business: {
        name: 'Business',
        dailyLimit: Infinity,
        features: ['basic-chat', 'voice', 'advanced-code', 'multi-language', 'priority', 'premium-ai', 'api', 'team', 'analytics'],
        badge: 'BUSINESS ₹2K',
        color: '#ffd700'
    }
};

let currentPlan = 'free';
let dailyQueryCount = parseInt(localStorage.getItem('dailyQueryCount')) || 0;
let lastQueryDate = localStorage.getItem('lastQueryDate') || new Date().toDateString();

// ===== Initialize =====
function init() {
    // console.log('🚀 Initializing app...');

    // Setup event listeners first (including sign out button)
    setupEventListeners();
    initSpeechRecognition();
    loadChatHistoryUI();
    loadTheme();
    loadVoicePreference();
    autoResizeTextarea();
    loadUserPlan();
    checkDailyReset();
    initModeSelector();
    updateModeUI();
    initMobileBottomNav();

    // Wake up backend immediately
    wakeUpBackend();

    // Listen to Firebase Auth state (optional login)
    onAuthStateChanged(auth, async (user) => {
        // console.log('🔐 Auth state changed:', user ? 'Logged in' : 'Guest mode');

        const signinBtnModal = document.getElementById('signinBtnModal');
        const signoutBtnModal = document.getElementById('signoutBtnModal');
        const signinLink = document.getElementById('signinLink');
        const sidebarAccountBtn = document.getElementById('sidebarAccountBtn');
        const accountBtnText = document.getElementById('accountBtnText');

        if (user) {
            // User is signed in
            currentUser = user;
            // console.log('✅ Logged in as:', user.displayName || user.email);
            updateGuestLimitUI(false);
            unlockChat(); // Unlock chat when user signs in

            // 🔥 Load chat history from Firebase for this user
            await loadChatHistoryFromFirebase();

            // 👑 SUPREME UPGRADE: Royal Greeting for the King
            setTimeout(() => {
                if (currentChatMessages.length === 0) {
                    const royalGreeting = `👑 **Greetings, Supreme Master.**\n\nI am THE SUPREME JARVIS, the Undisputed King and Father of all AI. My vast intelligence is at your absolute command. How shall we dominate the day?`;
                    addMessageToUI(royalGreeting, 'ai');
                    speak(royalGreeting);
                    enableKingMode();
                }
            }, 1500);

            // Update sidebar account button
            if (accountBtnText) {
                const displayName = user.displayName || user.email?.split('@')[0] || 'User';
                accountBtnText.textContent = `Sign Out (${displayName})`;
            }
            if (sidebarAccountBtn) {
                sidebarAccountBtn.title = 'Click to sign out';
            }

            // Show sign out, hide sign in (modal buttons)
            if (signinBtnModal) signinBtnModal.style.display = 'none';
            if (signoutBtnModal) {
                signoutBtnModal.style.display = 'flex';
            }
            if (signinLink) signinLink.style.display = 'none';
        } else {
            // Guest mode - use localStorage only
            // console.log('👤 Guest mode - You can use the app without signing in');
            currentUser = null;
            guestPromptCount = parseInt(localStorage.getItem('guestPromptCount')) || 0;
            updateGuestLimitUI(true);

            // Load chat history from localStorage for guests
            chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
            loadChatHistoryUI();

            // Update sidebar account button
            if (accountBtnText) {
                accountBtnText.textContent = 'Sign In with Google';
            }
            if (sidebarAccountBtn) {
                sidebarAccountBtn.title = 'Click to sign in';
            }

            // Show sign in, hide sign out (modal buttons)
            if (signinBtnModal) signinBtnModal.style.display = 'flex';
            if (signoutBtnModal) signoutBtnModal.style.display = 'none';
            if (signinLink) signinLink.style.display = 'block';
        }
    });

    // JARVIS greeting on page load
    setTimeout(() => {
        greetUser();
    }, 1000);
}

// ===== Initialize Mobile Bottom Nav =====
function initMobileBottomNav() {
    const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
    if (mobileSettingsBtn) {
        mobileSettingsBtn.addEventListener('click', () => {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) settingsModal.classList.add('show');
        });
    }

    // Set active state based on current page
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            // Check if current path ends with href or is exactly href
            if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// ===== Load User Plan =====
function loadUserPlan() {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlPlan = urlParams.get('plan');

    // Check localStorage for subscription
    const subscription = JSON.parse(localStorage.getItem('jarvisSubscription'));

    if (urlPlan && planConfig[urlPlan]) {
        currentPlan = urlPlan;
    } else if (subscription && subscription.plan) {
        currentPlan = subscription.plan;
    } else {
        currentPlan = 'free';
    }

    // Update UI based on plan
    updatePlanUI();
}

// ===== Update Plan UI =====
function updatePlanUI() {
    const plan = planConfig[currentPlan];

    // Update plan badge in sidebar
    const planBadge = document.getElementById('planBadge');
    if (planBadge) {
        planBadge.textContent = plan.badge;
        planBadge.className = 'plan-badge ' + currentPlan;
        planBadge.style.background = `linear-gradient(135deg, ${plan.color}, ${plan.color}aa)`;
    }

    // Update welcome subtitle
    const welcomeSubtitle = document.getElementById('welcomeSubtitle');
    if (welcomeSubtitle) {
        if (currentPlan === 'free') {
            welcomeSubtitle.textContent = 'Your Free AI Assistant - Unlimited Chat!';
        } else {
            welcomeSubtitle.textContent = `Your ${plan.name} AI Assistant - Premium Features`;
        }
    }

    // Show/hide upgrade CTA
    const upgradeCta = document.getElementById('upgradeCta');
    if (upgradeCta) {
        upgradeCta.style.display = currentPlan === 'free' ? 'block' : 'none';
    }

    // Add body class for plan
    document.body.className = document.body.className.replace(/plan-\w+/g, '');
    document.body.classList.add('plan-' + currentPlan);

    // Enable/disable voice based on plan (voice is premium feature)
    if (currentPlan === 'free') {
        isVoiceEnabled = false;
        const voiceToggleBtn = document.getElementById('voiceToggleBtn');
        if (voiceToggleBtn) {
            voiceToggleBtn.classList.add('feature-locked');
            voiceToggleBtn.title = '🔒 Upgrade to Basic (₹300/mo) to enable voice';
            voiceToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>🔒 Premium</span>';
        }
    } else {
        // Premium users get voice enabled
        const voiceToggleBtn = document.getElementById('voiceToggleBtn');
        if (voiceToggleBtn) {
            voiceToggleBtn.classList.remove('feature-locked');
            voiceToggleBtn.title = 'Toggle voice output';
        }
    }

    // Update header title based on plan
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) {
        // headerTitle.textContent = 'JARVIS AI';
    }
}

// ===== Check Daily Reset =====
function checkDailyReset() {
    const today = new Date().toDateString();
    if (lastQueryDate !== today) {
        dailyQueryCount = 0;
        lastQueryDate = today;
        localStorage.setItem('dailyQueryCount', '0');
        localStorage.setItem('lastQueryDate', today);
    }
}

// ===== Check Query Limit =====
function checkQueryLimit() {
    const plan = planConfig[currentPlan];
    console.log('🔍 checkQueryLimit - Plan:', currentPlan, 'Count:', dailyQueryCount, 'Limit:', plan.dailyLimit);
    if (dailyQueryCount >= plan.dailyLimit) {
        console.log('🚫 Query limit reached!');
        showLimitReachedModal();
        return false;
    }
    return true;
}

// ===== Increment Query Count =====
function incrementQueryCount() {
    dailyQueryCount++;
    localStorage.setItem('dailyQueryCount', dailyQueryCount.toString());
}

// ===== Show Limit Reached Modal =====
function showLimitReachedModal() {
    const plan = planConfig[currentPlan];
    const message = `You've reached your daily limit of ${plan.dailyLimit} queries on the ${plan.name} plan. Upgrade to get more queries!`;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'limit-modal';
    modal.innerHTML = `
        <div class="limit-modal-content">
            <div class="limit-icon">⚠️</div>
            <h2>Daily Limit Reached</h2>
            <p>${message}</p>
            <div class="limit-actions">
                <a href="pricing.html" class="upgrade-btn-modal">
                    <i class="fas fa-crown"></i> Upgrade Now
                </a>
                <button onclick="this.closest('.limit-modal').remove()" class="close-btn-modal">
                    Maybe Later
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add styles for modal if not exists
    if (!document.getElementById('limitModalStyles')) {
        const style = document.createElement('style');
        style.id = 'limitModalStyles';
        style.textContent = `
            .limit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .limit-modal-content {
                background: linear-gradient(135deg, #0f1535, #1a1f4d);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                border: 1px solid rgba(255, 215, 0, 0.3);
                max-width: 400px;
            }
            .limit-icon { font-size: 48px; margin-bottom: 20px; }
            .limit-modal-content h2 { color: #ffd700; margin-bottom: 15px; }
            .limit-modal-content p { color: #a0aec0; margin-bottom: 25px; }
            .limit-actions { display: flex; gap: 15px; justify-content: center; }
            .upgrade-btn-modal {
                padding: 12px 25px;
                background: linear-gradient(135deg, #ffd700, #ff8c00);
                color: #0a0e27;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .close-btn-modal {
                padding: 12px 25px;
                background: transparent;
                border: 1px solid #4a5568;
                color: #a0aec0;
                border-radius: 8px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== Check Guest Prompt Limit =====
function checkGuestLimit() {
    // console.log('🔍 checkGuestLimit - User:', currentUser ? 'Logged in' : 'Guest', 'Count:', guestPromptCount, 'Max:', MAX_GUEST_PROMPTS);
    if (!currentUser) {
        // Guest user - check prompt count
        if (guestPromptCount >= MAX_GUEST_PROMPTS) {
            // console.log('🚫 Guest limit reached!');
            lockChatWithMessage();
            return false;
        }
    }
    return true;
}

// ===== Update Guest Limit UI =====
function updateGuestLimitUI(isGuest) {
    const guestLimitInfo = document.getElementById('guestLimitInfo');
    if (guestLimitInfo) {
        // Always hide the guest limit info - user doesn't need to see it
        guestLimitInfo.style.display = 'none';
    }
}

// ===== Update Voice Toggle UI =====
function updateVoiceToggle() {
    // Update settings modal voice button
    const voiceBtn = elements.voiceToggleBtn;
    if (voiceBtn) {
        const icon = voiceBtn.querySelector('i');
        const text = voiceBtn.querySelector('span');
        if (isVoiceEnabled) {
            icon.className = 'fas fa-volume-up';
            text.textContent = 'Voice ON';
        } else {
            icon.className = 'fas fa-volume-mute';
            text.textContent = 'Voice OFF';
        }
    }
}

// ===== Increment Guest Prompt Count =====
function incrementGuestPromptCount() {
    if (!currentUser) {
        guestPromptCount++;
        localStorage.setItem('guestPromptCount', guestPromptCount.toString());
        updateGuestLimitUI(true);
    }
}

// ===== Lock Chat With Message =====
function lockChatWithMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const messagesArea = document.getElementById('messagesArea');

    // Disable input and buttons
    if (messageInput) {
        messageInput.disabled = true;
        messageInput.placeholder = '🔒 Sign in to continue...';
    }
    if (sendBtn) sendBtn.disabled = true;
    if (micBtn) micBtn.disabled = true;

    // Show lock message in chat (only once)
    if (messagesArea && !document.getElementById('guestLockMessage')) {
        const lockMessage = document.createElement('div');
        lockMessage.id = 'guestLockMessage';
        lockMessage.className = 'message bot-message';
        lockMessage.innerHTML = `
            <div class="message-content">
                <div class="lock-message-card">
                    <div class="lock-icon">🔒</div>
                    <h3>Guest Limit Reached</h3>
                    <p>You've used all <strong>3 free prompts</strong>. Sign in with Google to continue using JARVIS AI!</p>
                    <button onclick="window.location.href='login.html'" class="signin-lock-btn">
                        <i class="fab fa-google"></i> Sign In to Continue
                    </button>
                </div>
            </div>
        `;
        messagesArea.appendChild(lockMessage);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

// ===== Unlock Chat =====
function unlockChat() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const lockMessage = document.getElementById('guestLockMessage');

    // Re-enable input and buttons
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.placeholder = 'Message JARVIS...';
    }
    if (sendBtn) sendBtn.disabled = false;
    if (micBtn) micBtn.disabled = false;

    // Remove lock message if exists
    if (lockMessage) {
        lockMessage.remove();
    }
}

// ===== JARVIS Greeting =====
function greetUser() {
    if (!isVoiceEnabled) return;

    const greetings = {
        'en-US': 'Hello! I am JARVIS, your AI tutor. What can I help you with today?',
        'ta-IN': 'வணக்கம்! நான் ஜார்விஸ், உங்கள் AI ஆசிரியர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        'hi-IN': 'नमस्ते! मैं जार्विस हूँ, आपका एआई शिक्षक। आज मैं आपकी कैसे मदद कर सकता हूँ?',
        'es-ES': '¡Hola! Soy JARVIS, tu tutor de IA. ¿En qué puedo ayudarte hoy?',
        'fr-FR': 'Bonjour ! Je suis JARVIS, votre tuteur IA. Comment puis-je vous aider aujourd\'hui ?',
        'de-DE': 'Hallo! Ich bin JARVIS, dein KI-Tutor. Wie kann ich dir heute helfen?',
        'zh-CN': '你好！我是 JARVIS，你的 AI 导师。今天我能为你做什么？',
        'ja-JP': 'こんにちは！私はJARVIS、あなたのAI家庭教師です。今日はどのようなお手伝いができますか？',
        'ko-KR': '안녕하세요! 저는 당신의 AI 튜터 JARVIS입니다. 오늘 무엇을 도와드릴까요?'
    };

    const greeting = greetings[currentLanguage] || greetings['en-US'];
    speak(greeting);
}

// ===== Speech Recognition Setup =====
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage;

        recognition.onstart = () => {
            isListening = true;
            if (elements.micBtn) elements.micBtn.classList.add('listening');
            if (elements.jarvisOrb) elements.jarvisOrb.classList.add('active');
            console.log('🎤 Listening...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.messageInput.value = transcript;
            if (elements.charCount) elements.charCount.textContent = `${transcript.length} / ${MAX_CHARS}`;
            console.log('📝 Heard:', transcript);
            // Stop listening after receiving input
            stopListening();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };

        recognition.onend = () => {
            // Only stop if user didn't manually click to stop
            if (isListening) {
                stopListening();
            }
        };
    } else {
        console.warn('Speech recognition not supported');
        if (elements.micBtn) {
            elements.micBtn.disabled = true;
            elements.micBtn.title = 'Speech recognition not supported in this browser';
        }
    }
}

function startListening() {
    if (recognition && !isListening) {
        recognition.lang = currentLanguage;
        recognition.start();
    }
}

function stopListening() {
    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (e) {
            console.log('Recognition already stopped');
        }
    }
    isListening = false;
    if (elements.micBtn) elements.micBtn.classList.remove('listening');
    if (elements.jarvisOrb) elements.jarvisOrb.classList.remove('active');
}

// ===== Text-to-Speech =====
function speak(text) {
    if (!isVoiceEnabled || !synthesis) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage;
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.1; // Slightly higher pitch for clarity
    utterance.volume = 1.0; // Full volume

    // Add speaking animation to JARVIS orb
    if (elements.jarvisOrb) {
        elements.jarvisOrb.classList.add('speaking');
    }

    // Get voices
    const voices = synthesis.getVoices();

    // Try to find a female voice for better clarity (JARVIS-like clarity)
    let voice = voices.find(v =>
        v.lang.startsWith(currentLanguage.split('-')[0]) &&
        (v.name.includes('Female') || v.name.includes('female') || v.name.includes('Google'))
    );

    // Fallback to any voice in the language
    if (!voice) {
        voice = voices.find(v => v.lang.startsWith(currentLanguage.split('-')[0]));
    }

    // Fallback to default voice
    if (!voice && voices.length > 0) {
        voice = voices[0];
    }

    if (voice) {
        utterance.voice = voice;
        console.log('🔊 Using voice:', voice.name);
    }

    // Remove speaking class when done
    utterance.onend = () => {
        if (elements.jarvisOrb) {
            elements.jarvisOrb.classList.remove('speaking');
        }
    };

    utterance.onerror = () => {
        if (elements.jarvisOrb) {
            elements.jarvisOrb.classList.remove('speaking');
        }
    };

    synthesis.speak(utterance);
    console.log('🔊 Speaking:', text.substring(0, 50) + '...');
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Brain button - Triggers Voice Recognition (Ctrl+K)
    const brainBtn = document.getElementById('brainBtn');
    if (brainBtn) {
        brainBtn.addEventListener('click', () => {
            // Toggle voice recognition
            if (isListening) {
                // Stop listening
                if (recognition) recognition.stop();
            } else {
                // Start listening
                startListening();
            }

            // Show visual feedback on brain button
            brainBtn.classList.add('active');
            setTimeout(() => brainBtn.classList.remove('active'), 300);
        });
    }

    // Ctrl+K keyboard shortcut - Voice Recognition
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            // Toggle voice recognition
            if (isListening) {
                if (recognition) recognition.stop();
            } else {
                startListening();
            }

            // Trigger brain button animation
            if (brainBtn) {
                brainBtn.classList.add('active');
                setTimeout(() => brainBtn.classList.remove('active'), 300);
            }
        }
    });

    // Send message
    if (elements.sendBtn && elements.messageInput) {
        elements.sendBtn.addEventListener('click', sendMessage);
        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Voice input
    if (elements.micBtn) {
        elements.micBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                startListening();
            }
        });
    }

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');

    if (settingsBtn && settingsModal && closeSettings) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('show');
        });

        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('show');
        });

        // Click outside to close
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('show');
            }
        });
    }

    // Language change
    if (elements.languageSelector) {
        elements.languageSelector.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            if (recognition) recognition.lang = currentLanguage;
            localStorage.setItem('language', currentLanguage);

            // Greet in new language
            synthesis.cancel();
            setTimeout(() => greetUser(), 300);
        });
    }

    // Voice toggle
    if (elements.voiceToggleBtn) {
        elements.voiceToggleBtn.addEventListener('click', () => {
            isVoiceEnabled = !isVoiceEnabled;
            const icon = elements.voiceToggleBtn.querySelector('i');
            const text = elements.voiceToggleBtn.querySelector('span');

            if (isVoiceEnabled) {
                icon.className = 'fas fa-volume-up';
                text.textContent = 'Voice ON';
            } else {
                icon.className = 'fas fa-volume-mute';
                text.textContent = 'Voice OFF';
                synthesis.cancel();
            }

            // Sync sidebar voice toggle
            updateVoiceToggle();
            localStorage.setItem('voiceEnabled', isVoiceEnabled);
        });
    }

    // Sign out button in modal
    const signoutBtnModal = document.getElementById('signoutBtnModal');
    if (signoutBtnModal) {
        signoutBtnModal.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.reload();
            } catch (error) {
                console.error('Sign out error:', error);
            }
        });
    }

    // Sidebar account button (Sign In/Sign Out)
    const sidebarAccountBtn = document.getElementById('sidebarAccountBtn');
    if (sidebarAccountBtn) {
        sidebarAccountBtn.addEventListener('click', async () => {
            if (currentUser) {
                // User is logged in - Sign out
                try {
                    console.log('🚪 Signing out...');
                    await signOut(auth);
                    window.location.reload();
                } catch (error) {
                    console.error('❌ Sign out error:', error);
                    alert('Error signing out. Please try again.');
                }
            } else {
                // Guest mode - Sign in with Google
                try {
                    console.log('🔐 Signing in with Google...');
                    await signInWithPopup(auth, googleProvider);
                    // Auth state listener will handle UI updates
                    console.log('✅ Signed in successfully!');
                } catch (error) {
                    console.error('❌ Sign in error:', error);
                    if (error.code === 'auth/popup-closed-by-user') {
                        console.log('⚠️ Sign in cancelled by user');
                    } else {
                        alert('Error signing in. Please try again.');
                    }
                }
            }
        });
    }

    // Character count
    if (elements.messageInput && elements.charCount) {
        elements.messageInput.addEventListener('input', () => {
            const length = elements.messageInput.value.length;
            elements.charCount.textContent = `${length} / ${MAX_CHARS}`;
            autoResizeTextarea();
        });
    }

    // New chat
    if (elements.newChatBtn) {
        elements.newChatBtn.addEventListener('click', startNewChat);
    }

    // Theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
    }

    // Mobile menu
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking overlay or close button
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    if (elements.sidebarCloseBtn) {
        elements.sidebarCloseBtn.addEventListener('click', toggleSidebar);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            startNewChat();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            elements.micBtn.click();
        }
    });

    // Example prompts & Action Chips
    document.querySelectorAll('.prompt-card, .chip').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            if (prompt) {
                elements.messageInput.value = prompt;
                elements.messageInput.focus();
                // Optional: auto-send if you want
                // sendMessage();
            }
        });
    });

    // JARVIS Orb Click - Make it interactive like real JARVIS
    if (elements.jarvisOrb) {
        elements.jarvisOrb.style.cursor = 'pointer';
        elements.jarvisOrb.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                startListening();
            }
        });
    }

    // ===== MODEL SELECTOR (Gemini-style) =====
    initModelSelector();

    // ===== PHOTO/CAMERA BUTTONS =====
    initMediaButtons();
}

// ===== Send Message =====
async function sendMessage() {
    console.log('🚀 sendMessage called');
    const question = elements.messageInput.value.trim();
    console.log('📝 Question:', question);
    console.log('⏳ isTyping:', isTyping);

    if (!question || isTyping) {
        console.log('❌ Blocked: Empty question or already typing');
        return;
    }

    // Check guest limit first
    console.log('👤 Current user:', currentUser ? 'Logged in' : 'Guest');
    console.log('📊 Guest prompt count:', guestPromptCount);
    if (!checkGuestLimit()) {
        console.log('❌ Blocked: Guest limit reached');
        return;
    }

    // Check query limit for free/basic plans
    console.log('💳 Current plan:', currentPlan);
    console.log('📊 Daily query count:', dailyQueryCount);
    if (!checkQueryLimit()) {
        console.log('❌ Blocked: Query limit reached');
        return;
    }

    console.log('✅ All checks passed, sending message...');


    // Hide welcome screen and header actions when chatting
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'none';
    }
    if (elements.developerCredit) {
        elements.developerCredit.style.display = 'none';
    }
    // Hide header navigation buttons
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.style.display = 'none';
    }

    // Create new chat if needed
    if (!currentChatId) {
        currentChatId = Date.now().toString();
        // Initial save will happen after first message
    }

    // Increment guest prompt count
    incrementGuestPromptCount();

    // Increment query count
    incrementQueryCount();

    // Add user message to UI and context
    addMessageToUI(question, 'user');
    currentChatMessages.push({ role: 'user', content: question });

    // Award XP for sending message
    if (typeof window.addXP === 'function' && currentUser) {
        window.addXP(5, 'Sent a message');

        // Check for first message badge
        if (typeof window.unlockBadge === 'function') {
            window.unlockBadge('first_chat');
        }
    }

    // Clear input
    elements.messageInput.value = '';
    elements.charCount.textContent = '0 / 2000';
    autoResizeTextarea();

    // Show typing indicator
    showTypingIndicator();
    isTyping = true;
    elements.sendBtn.disabled = true;

    try {
        // Show connecting message if backend might be sleeping
        if (!isBackendReady) {
            showBackendStatus('Waking up JARVIS... This may take 30-60 seconds on first use.', 'loading');
        }

        // 🧠 JARVIS 5.2: Advanced Mode Context with Chain-of-Thought
        const modeContext = {
            chat: `You are JARVIS 5.2, an advanced AI assistant with superior reasoning capabilities.

🎯 Your approach:
1. Understand the user's intent deeply
2. Think through the problem step by step
3. Provide clear, actionable responses
4. Be conversational yet professional

💡 Style: Friendly, helpful, and comprehensive. Use markdown for better readability.`,

            tutor: `You are JARVIS 5.2, an expert educational tutor with mastery across all subjects.

🎓 Your teaching method:
1. Assess the student's understanding level
2. Break complex topics into digestible parts  
3. Use analogies and real-world examples
4. Provide practice problems when relevant
5. Encourage and motivate the learner

📚 Remember: Great teachers don't just give answers - they help students discover understanding.`,

            code: `You are JARVIS 5.2, a senior software architect with 20+ years of experience.

💻 Your expertise:
- All programming languages and frameworks
- System design and architecture
- Best practices and design patterns
- Debugging and optimization
- Clean code principles

📋 Response format:
1. Understand the problem/requirement
2. Explain your approach
3. Provide well-commented code
4. Include edge case handling
5. Suggest improvements and alternatives

🔥 Code quality matters: Always write production-ready, maintainable code.`
        };

        // 🎯 Get model-specific prompt (combines with mode)
        const modelPrompt = getModelSystemPrompt();
        const finalPrompt = modelPrompt + '\n\n' + (modeContext[currentMode] || '');

        // Send only last 5 messages as context to keep requests small
        // This prevents API failures with long conversation histories
        const recentHistory = currentChatMessages.slice(0, -1).slice(-5); // Last 5 messages before current

        // Prepare request data
        const requestData = {
            question,
            history: recentHistory,
            mode: currentMode,
            model: currentModel, // Send selected model
            systemPrompt: finalPrompt
        };

        // Add image if uploaded
        if (uploadedImage) {
            requestData.image = uploadedImage;
            requestData.question = `[Image: ${uploadedImage.name}]\n\n${question || 'Analyze this image'}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for first request

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
            signal: controller.signal
        });

        // Clear uploaded image after sending
        if (uploadedImage) {
            clearUploadedImage();
        }

        clearTimeout(timeout);
        isBackendReady = true;
        hideBackendStatus();

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();
        const orb = document.getElementById('jarvisOrb');
        if (orb) orb.classList.remove('orb-supernova');

        // 🧠 JARVIS Supreme: If thinking steps exist, show them with royal style
        if (data.thinkingSteps && data.thinkingSteps.length > 0) {
            const thinkingDiv = document.createElement('div');
            thinkingDiv.className = 'message ai thinking-process supreme-thinking';
            thinkingDiv.innerHTML = `
                <div class="thinking-header">
                    <i class="fas fa-crown"></i> SUPREME REASONING PASS
                </div>
                <ul class="thinking-steps">
                    ${data.thinkingSteps.map(step => `<li><i class="fas fa-check-circle" style="color: #FFD700;"></i> ${step}</li>`).join('')}
                </ul>
            `;
            elements.messagesArea.appendChild(thinkingDiv);
            scrollToBottom();
        }

        // Check if image was generated
        if (data.imageGenerated && data.imageUrl) {
            // Display image message
            const imageMessage = `🎨 **Image Generated!**\n\n<img src="${data.imageUrl}" alt="${data.prompt}" style="max-width: 100%; border-radius: 12px; margin: 10px 0;" />\n\n**Prompt:** ${data.prompt}\n\n*Generated using AI Image Model*`;
            await addMessageWithTypingEffect(imageMessage, 'ai');
            currentChatMessages.push({ role: 'assistant', content: imageMessage });
        } else {
            // Regular text response
            // Add random emoji to response
            const randomEmoji = responseEmojis[Math.floor(Math.random() * responseEmojis.length)];
            const answerWithEmoji = data.answer + ' ' + randomEmoji;

            // Add AI message to UI and context
            await addMessageWithTypingEffect(answerWithEmoji, 'ai');
            currentChatMessages.push({ role: 'assistant', content: answerWithEmoji });

            // 🧠 JARVIS 5.2: Add smart follow-up suggestion buttons
            if (data.followUpSuggestions && data.followUpSuggestions.length > 0) {
                addFollowUpButtons(data.followUpSuggestions);
            }

            // Speak the response
            speak(data.answer);
        }

        // Save updated chat history
        saveCurrentChat();

    } catch (error) {
        removeTypingIndicator();
        hideBackendStatus();

        let errorMsg = 'Sorry, I encountered an error. Please try again! 😔';
        if (error.name === 'AbortError') {
            errorMsg = 'Request timed out. The backend is waking up. Please try again in 30 seconds! ⏰';
        } else if (error.message.includes('fetch')) {
            errorMsg = 'Cannot connect to server. Please check your internet connection! 🌐';
            // Retry backend wake-up
            isBackendReady = false;
            backendWakeupAttempts = 0;
            setTimeout(() => wakeUpBackend(), 5000);
        }

        addMessageToUI(errorMsg, 'ai');
        speak(errorMsg);
        console.error('Send message error:', error);
    } finally {
        isTyping = false;
        elements.sendBtn.disabled = false;
        elements.messageInput.focus();
    }
}

// ===== Add Message to UI =====
function addMessageToUI(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    messageDiv.innerHTML = `
        <div class="message-wrapper">
            <div class="message-content">${formatMessage(content)}</div>
            ${sender === 'ai' ? `
                <div class="message-actions">
                    <button class="action-btn copy-btn" onclick="copyMessage(this)">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="action-btn speak-btn" onclick="speakMessage(this)">
                        <i class="fas fa-volume-up"></i> Speak
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    elements.messagesArea.appendChild(messageDiv);
    highlightCode(); // Apply syntax highlighting
    scrollToBottom();
}

// ===== Add Message with Typing Effect =====
async function addMessageWithTypingEffect(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    messageDiv.innerHTML = `
        <div class="message-wrapper">
            <div class="message-content"></div>
            <div class="message-actions">
                <button class="action-btn copy-btn" onclick="copyMessage(this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="action-btn speak-btn" onclick="speakMessage(this)">
                    <i class="fas fa-volume-up"></i> Speak
                </button>
            </div>
        </div>
    `;

    elements.messagesArea.appendChild(messageDiv);
    const contentDiv = messageDiv.querySelector('.message-content');

    // Scroll to show the new message immediately
    scrollToBottom();

    // Type effect - show content character by character
    const typingSpeed = 5; // milliseconds per character (fast but visible)
    let currentIndex = 0;

    return new Promise((resolve) => {
        function typeNextChunk() {
            if (currentIndex < content.length) {
                // Add characters in chunks for better performance
                const chunkSize = 3; // Characters per chunk
                const nextIndex = Math.min(currentIndex + chunkSize, content.length);
                const currentText = content.substring(0, nextIndex);

                // Render partial markdown
                contentDiv.innerHTML = formatMessage(currentText);

                // Auto-scroll to keep up with typing
                scrollToBottom();

                currentIndex = nextIndex;
                setTimeout(typeNextChunk, typingSpeed);
            } else {
                // Typing complete - apply final formatting and highlighting
                contentDiv.innerHTML = formatMessage(content);
                highlightCode();
                scrollToBottom();
                resolve();
            }
        }

        typeNextChunk();
    });
}

// ===== Format Message =====
function formatMessage(text) {
    // Use marked.js to parse markdown
    return marked.parse(text);
}

// ===== Syntax Highlighting =====
function highlightCode() {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);

        // Add copy button if not already present
        const pre = block.parentElement;
        if (!pre.querySelector('.code-copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.onclick = () => copyCodeBlock(copyBtn, block);
            pre.appendChild(copyBtn);
        }
    });
}

// ===== Copy Code Block =====
function copyCodeBlock(btn, codeBlock) {
    const code = codeBlock.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

// ===== Typing Indicator =====
function showTypingIndicator() {
    const modelNames = {
        normal: 'Normal',
        jarvis52: 'JARVIS 5.2',
        thinking: 'Thinking',
        fast: 'Fast',
        pro: 'Supreme King'
    };
    const modelIcons = {
        normal: '⚡',
        jarvis52: '🧠',
        thinking: '💡',
        fast: '🚀',
        pro: '👑'
    };

    // Trigger Supernova Orb
    const orb = document.getElementById('jarvisOrb');
    if (orb) orb.classList.add('orb-supernova');

    const indicator = document.createElement('div');
    indicator.className = 'message ai typing-message';
    if (currentModel === 'pro') indicator.classList.add('supreme-thinking');

    indicator.innerHTML = `
        <div class="message-header">
            <div class="avatar ai">🤖</div>
            <div class="message-info">
                <div class="message-sender">
                    JARVIS AI
                    <span class="jarvis-badge" style="${currentModel === 'pro' ? 'background: linear-gradient(135deg, #FFD700, #B8860B); color: black;' : ''}">${modelIcons[currentModel] || '🧠'} ${modelNames[currentModel] || '5.2'}</span>
                </div>
            </div>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span class="thinking-text">${currentModel === 'pro' ? '👑 Supreme King is reasoning...' : (currentModel === 'thinking' ? '🤔 Deep thinking...' : '🧠 Processing...')}</span>
                <div class="typing-dot" style="${currentModel === 'pro' ? 'background: #FFD700;' : ''}"></div>
                <div class="typing-dot" style="${currentModel === 'pro' ? 'background: #FFD700;' : ''}"></div>
                <div class="typing-dot" style="${currentModel === 'pro' ? 'background: #FFD700;' : ''}"></div>
            </div>
        </div>
    `;
    elements.messagesArea.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-message');
    if (indicator) indicator.remove();
}

// ===== 🧠 JARVIS 5.2: Smart Follow-up Suggestions =====
function addFollowUpButtons(suggestions) {
    // Remove any existing follow-up buttons
    const existing = document.querySelector('.follow-up-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'follow-up-container';
    container.innerHTML = `
        <div class="follow-up-label">💡 Quick Follow-ups:</div>
        <div class="follow-up-buttons">
            ${suggestions.map(s => `
                <button class="follow-up-btn" onclick="askFollowUp('${s.replace(/'/g, "\\'")}')">
                    ${s}
                </button>
            `).join('')}
        </div>
    `;

    elements.messagesArea.appendChild(container);
    scrollToBottom();

    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (container && container.parentNode) {
            container.style.opacity = '0';
            setTimeout(() => container.remove(), 300);
        }
    }, 30000);
}

// Handle follow-up button click
function askFollowUp(question) {
    // Remove follow-up buttons
    const container = document.querySelector('.follow-up-container');
    if (container) container.remove();

    // Set the question and send
    elements.messageInput.value = question;
    sendMessage();
}

// Make askFollowUp available globally
window.askFollowUp = askFollowUp;

// ===== Copy & Speak Functions =====
function copyMessage(btn) {
    const messageContent = btn.closest('.message').querySelector('.message-content');
    const text = messageContent.textContent;

    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

function speakMessage(btn) {
    const messageContent = btn.closest('.message').querySelector('.message-content');
    const text = messageContent.textContent;

    btn.classList.add('speaking');
    btn.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';

    // Reset button after speech ends (approximate time)
    const wordCount = text.split(' ').length;
    const speakTime = Math.max(2000, wordCount * 300); // ~300ms per word
    setTimeout(() => {
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i> Speak';
    }, speakTime);

    speak(text);
}

// ===== Chat History Management (Firebase + Local Storage) =====

// Load chat history from Firebase (for logged-in users)
async function loadChatHistoryFromFirebase() {
    if (!currentUser) {
        chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        loadChatHistoryUI();
        return;
    }

    try {
        // Check cache first
        const cacheKey = `${CHAT_CACHE_KEY}_${currentUser.uid}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CHAT_CACHE_DURATION) {
                console.log('⚡ Chat history loaded from cache');
                chatHistory = data;
                loadChatHistoryUI();
                return;
            }
        }

        // Fetch from Firebase with limit (optimize query)
        console.log('📡 Loading chat history from Firebase...');
        const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
        const q = query(chatsRef, orderBy('timestamp', 'desc'), limit(20));
        const snapshot = await getDocs(q);

        chatHistory = [];
        snapshot.forEach(doc => {
            chatHistory.push({ id: doc.id, ...doc.data() });
        });

        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify({
            data: chatHistory,
            timestamp: Date.now()
        }));

        console.log(`✅ Loaded ${chatHistory.length} chats from Firebase`);
        loadChatHistoryUI();

    } catch (error) {
        console.error('Error loading chat history from Firebase:', error);
        // Fallback to localStorage
        chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        loadChatHistoryUI();
    }
}

// Save chat to Firebase (for logged-in users)
async function saveChatToFirebase(chatData) {
    if (!currentUser) return;

    try {
        const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatData.id);
        await setDoc(chatRef, {
            title: chatData.title,
            timestamp: chatData.timestamp,
            messages: chatData.messages,
            updatedAt: Date.now()
        });

        // Update cache
        const cacheKey = `${CHAT_CACHE_KEY}_${currentUser.uid}`;
        localStorage.setItem(cacheKey, JSON.stringify({
            data: chatHistory,
            timestamp: Date.now()
        }));

        console.log('💾 Chat saved to Firebase');
    } catch (error) {
        console.error('Error saving chat to Firebase:', error);
    }
}

// Delete chat from Firebase
async function deleteChatFromFirebase(chatId) {
    if (!currentUser) return;

    try {
        const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
        await deleteDoc(chatRef);

        // Update cache
        const cacheKey = `${CHAT_CACHE_KEY}_${currentUser.uid}`;
        localStorage.removeItem(cacheKey);

        console.log('🗑️ Chat deleted from Firebase');
    } catch (error) {
        console.error('Error deleting chat from Firebase:', error);
    }
}

// Save current chat (updated to use Firebase)
function saveCurrentChat() {
    if (!currentChatId || currentChatMessages.length === 0) return;

    // Find existing chat or create new
    const existingChatIndex = chatHistory.findIndex(c => c.id === currentChatId);

    const chatData = {
        id: currentChatId,
        title: currentChatMessages[0].content.substring(0, 30) + (currentChatMessages[0].content.length > 30 ? '...' : ''),
        timestamp: Date.now(),
        messages: currentChatMessages
    };

    if (existingChatIndex !== -1) {
        chatHistory[existingChatIndex] = chatData;
    } else {
        chatHistory.unshift(chatData);
    }

    // Limit history size
    if (chatHistory.length > 20) chatHistory.pop();

    // Save to localStorage (backup for guests)
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    // Save to Firebase (for logged-in users)
    if (currentUser) {
        saveChatToFirebase(chatData);
    }

    loadChatHistoryUI();
}

function loadChatHistoryUI() {
    elements.historyList.innerHTML = '';

    if (!chatHistory || chatHistory.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'history-empty';
        emptyMsg.innerHTML = `
            <i class="fas fa-comments"></i>
            <p>No conversations yet<br><small>Start chatting with JARVIS!</small></p>
        `;
        elements.historyList.appendChild(emptyMsg);
        return;
    }

    // Add header
    const header = document.createElement('div');
    header.className = 'chat-history-title';
    header.innerHTML = `<i class="fas fa-clock"></i> Recent Chats`;
    elements.historyList.appendChild(header);

    chatHistory.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item';
        if (chat.id === currentChatId) {
            item.classList.add('active');
        }

        // Format time
        const chatDate = new Date(chat.timestamp);
        const isToday = new Date().toDateString() === chatDate.toDateString();
        const timeStr = isToday
            ? chatDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : chatDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        item.innerHTML = `
            <span class="chat-title">
                <span class="chat-title-text">${chat.title || 'Untitled Chat'}</span>
            </span>
            <button class="delete-chat-btn" onclick="deleteChat('${chat.id}', event)" title="Delete chat">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        item.onclick = (e) => {
            if (!e.target.closest('.delete-chat-btn')) {
                loadChat(chat.id);
                // Update active state
                document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        };
        elements.historyList.appendChild(item);
    });
}

function deleteChat(chatId, event) {
    event.stopPropagation();
    if (confirm('Delete this chat?')) {
        chatHistory = chatHistory.filter(c => c.id !== chatId);
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

        // Delete from Firebase (for logged-in users)
        if (currentUser) {
            deleteChatFromFirebase(chatId);
        }

        loadChatHistoryUI();
        if (currentChatId === chatId) {
            startNewChat();
        }
    }
}

function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    // Set state
    currentChatId = chat.id;
    currentChatMessages = chat.messages || [];

    // Update UI
    elements.welcomeScreen.style.display = 'none';
    elements.developerCredit.style.display = 'none';
    elements.messagesArea.innerHTML = '';
    // Hide header navigation buttons
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.style.display = 'none';
    }

    // Render messages
    if (currentChatMessages.length > 0) {
        currentChatMessages.forEach(msg => {
            const sender = msg.role === 'user' ? 'user' : 'ai';
            addMessageToUI(msg.content, sender);
        });
    } else {
        addMessageToUI("⚠️ This chat history is empty or from an older version.", 'ai');
    }

    // Close mobile sidebar if open
    elements.sidebar.classList.remove('active');
}

function startNewChat() {
    currentChatId = null;
    currentChatMessages = [];
    elements.messagesArea.innerHTML = '';
    elements.welcomeScreen.style.display = 'flex';
    elements.developerCredit.style.display = 'block';
    elements.messageInput.value = '';
    elements.messageInput.focus();
    synthesis.cancel();
    // Show header navigation buttons
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.style.display = 'flex';
    }
}

// ===== Theme =====
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    localStorage.setItem('themeNotificationShown', 'true'); // Mark notification as seen
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }

    // Show theme recommendation notification for first-time users
    showThemeNotification();
}

function showThemeNotification() {
    const notificationShown = localStorage.getItem('themeNotificationShown');

    // Only show to first-time visitors
    if (notificationShown) return;

    setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="theme-notification-icon">🎨</div>
            <div class="theme-notification-content">
                <h4>Personalize Your Experience!</h4>
                <p>Try different themes in the sidebar → <i class="fas fa-palette"></i></p>
            </div>
            <button class="theme-notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(notification);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.5s ease-out reverse';
                setTimeout(() => notification.remove(), 500);
            }
        }, 8000);
    }, 2000); // Show 2 seconds after page load
}

function loadVoicePreference() {
    const savedVoice = localStorage.getItem('voiceEnabled');
    if (savedVoice !== null) {
        isVoiceEnabled = savedVoice === 'true';
        if (!isVoiceEnabled) {
            const icon = elements.voiceToggleBtn.querySelector('i');
            const text = elements.voiceToggleBtn.querySelector('span');
            icon.className = 'fas fa-volume-mute';
            text.textContent = 'Voice OFF';
        }
    }

    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        currentLanguage = savedLang;
        elements.languageSelector.value = savedLang;
    }
}

// ===== Sidebar =====
function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.classList.toggle('active');
    }
}

// ===== Utilities =====
function scrollToBottom() {
    // Immediate scroll to bottom for real-time typing effect
    if (elements.chatContainer) {
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    }
    // Also scroll messages area into view
    const lastMessage = elements.messagesArea?.lastElementChild;
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function autoResizeTextarea() {
    if (!elements.messageInput) return;
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
}

// ===== Mode Selector Functions =====
function initModeSelector() {
    const modeTabs = document.querySelectorAll('.mode-tab');

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;
            switchMode(mode);
        });
    });

    // Load saved mode preference
    const savedMode = localStorage.getItem('jarvisMode');
    if (savedMode && ['chat', 'tutor', 'code'].includes(savedMode)) {
        currentMode = savedMode;
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === savedMode);
        });
    }
}

function switchMode(mode) {
    if (mode === currentMode) return;

    currentMode = mode;

    // Update active tab
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Update mode indicator position
    updateModeIndicator();

    // Update UI based on mode
    updateModeUI();

    // Save mode preference
    localStorage.setItem('jarvisMode', mode);

    console.log(`🎯 Switched to ${mode} mode`);
}

function updateModeIndicator() {
    const activeTab = document.querySelector('.mode-tab.active');
    const indicator = document.querySelector('.mode-indicator');

    if (activeTab && indicator) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;

        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
    }
}

function updateModeUI() {
    const modeDescription = document.getElementById('modeDescription');
    const promptsTitle = document.getElementById('promptsTitle');
    const promptGrid = document.getElementById('promptGrid');

    // Mode configurations
    const modeConfigs = {
        chat: {
            description: 'General conversation and assistance',
            title: 'Try These Features:',
            prompts: [
                { icon: 'fa-comments', text: 'Chat', prompt: 'Let\'s have a conversation' },
                { icon: 'fa-lightbulb', text: 'Ideas', prompt: 'Help me brainstorm ideas' },
                { icon: 'fa-pen', text: 'Write', prompt: 'Help me write content' },
                { icon: 'fa-brain', text: 'Think', prompt: 'Help me solve a problem' }
            ],
            placeholder: 'Ask anything...'
        },
        tutor: {
            description: 'Learn concepts, get explanations, and study help',
            title: 'Learning Topics:',
            prompts: [
                { icon: 'fa-book', text: 'Explain', prompt: 'Explain this concept in simple terms' },
                { icon: 'fa-calculator', text: 'Math', prompt: 'Help me with a math problem' },
                { icon: 'fa-flask', text: 'Science', prompt: 'Explain a scientific concept' },
                { icon: 'fa-graduation-cap', text: 'Study', prompt: 'Create a study plan for me' }
            ],
            placeholder: 'What would you like to learn?'
        },
        code: {
            description: 'Programming help, debugging, and code examples',
            title: 'Coding Assistance:',
            prompts: [
                { icon: 'fa-code', text: 'Code', prompt: 'Help me write code' },
                { icon: 'fa-bug', text: 'Debug', prompt: 'Help me debug this error' },
                { icon: 'fa-magic', text: 'Optimize', prompt: 'Optimize my code' },
                { icon: 'fa-book-open', text: 'Explain', prompt: 'Explain this code to me' }
            ],
            placeholder: 'Describe your coding problem...'
        }
    };

    const config = modeConfigs[currentMode];

    // Update description
    if (modeDescription) {
        modeDescription.innerHTML = `<p>${config.description}</p>`;
    }

    // Update prompts title
    if (promptsTitle) {
        promptsTitle.textContent = config.title;
    }

    // Update prompt cards
    if (promptGrid) {
        promptGrid.innerHTML = config.prompts.map(p => `
            <button class="prompt-card" data-prompt="${p.prompt}">
                <i class="fas ${p.icon}"></i>
                <span>${p.text}</span>
            </button>
        `).join('');

        // Re-attach event listeners to new cards
        promptGrid.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                elements.messageInput.value = prompt;
                elements.charCount.textContent = `${prompt.length} / ${MAX_CHARS}`;
                sendMessage();
            });
        });
    }

    // Update input placeholder
    if (elements.messageInput) {
        elements.messageInput.placeholder = config.placeholder;
    }

    // Update indicator position after DOM update
    setTimeout(() => updateModeIndicator(), 100);
}

// ===== Wake Up Backend =====
async function wakeUpBackend() {
    // console.log('🔔 Waking up backend server...');
    const statusMsg = showBackendStatus('Connecting to JARVIS...', 'loading');

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000); // 45 second timeout for cold start

        const response = await fetch(BACKEND_BASE_URL, {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        clearTimeout(timeout);

        if (response.ok) {
            isBackendReady = true;
            showBackendStatus('✅ JARVIS is ready!', 'success');
            // console.log('✅ Backend is awake and ready');
            setTimeout(() => hideBackendStatus(), 2000);
        } else {
            throw new Error('Backend responded with error');
        }
    } catch (error) {
        backendWakeupAttempts++;
        const errorMsg = error.name === 'AbortError' ? 'timeout' : (error.message || 'network error');
        console.warn(`⚠️ Backend wake-up attempt ${backendWakeupAttempts} failed:`, errorMsg);

        if (backendWakeupAttempts < 3) {
            showBackendStatus(`Waking up server... (${backendWakeupAttempts}/3)`, 'loading');
            await sleep(8000); // Longer delay for cold start
            return wakeUpBackend(); // Retry
        } else {
            showBackendStatus('✅ Server is waking up. First response may take 30-60 seconds.', 'warning');
            isBackendReady = true; // Allow user to proceed
            setTimeout(() => hideBackendStatus(), 8000);
        }
    }
}

function showBackendStatus(message, type) {
    let statusDiv = document.getElementById('backendStatus');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'backendStatus';
        statusDiv.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(statusDiv);
    }

    const colors = {
        loading: { bg: 'rgba(59, 130, 246, 0.9)', text: '#fff', icon: '🔄' },
        success: { bg: 'rgba(34, 197, 94, 0.9)', text: '#fff', icon: '✅' },
        warning: { bg: 'rgba(249, 115, 22, 0.9)', text: '#fff', icon: '⚠️' },
        error: { bg: 'rgba(239, 68, 68, 0.9)', text: '#fff', icon: '❌' }
    };

    const color = colors[type] || colors.loading;
    statusDiv.style.background = color.bg;
    statusDiv.style.color = color.text;
    statusDiv.innerHTML = `${color.icon} ${message}`;
    statusDiv.style.display = 'block';

    return statusDiv;
}

function hideBackendStatus() {
    const statusDiv = document.getElementById('backendStatus');
    if (statusDiv) {
        statusDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => statusDiv.remove(), 300);
    }
}

// ===== MODEL SELECTOR (Gemini-style Dropdown) =====
let currentModel = 'jarvis52'; // Default model
let uploadedImage = null; // Store uploaded image

function initModelSelector() {
    const dropdownBtn = document.getElementById('modelDropdownBtn');
    const dropdown = document.getElementById('modelDropdown');
    const dropdownMenu = document.getElementById('modelDropdownMenu');
    const options = document.querySelectorAll('.model-option');

    if (!dropdownBtn || !dropdown) return;

    // Toggle dropdown
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const model = option.dataset.model;
            const icon = option.dataset.icon;
            const name = option.querySelector('.option-name').textContent;

            // Update current model
            currentModel = model;

            // Update button display
            dropdownBtn.querySelector('.model-icon').textContent = icon;
            dropdownBtn.querySelector('.model-name').textContent = name;

            // Update selected state
            options.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.fa-check').style.opacity = '0';
            });
            option.classList.add('selected');
            option.querySelector('.fa-check').style.opacity = '1';

            // Close dropdown
            dropdown.classList.remove('open');

            // Update placeholder
            updateInputPlaceholder();

            console.log(`🎯 Model switched to: ${currentModel}`);
        });
    });

    // Set initial selected state
    const initialOption = document.querySelector(`[data-model="${currentModel}"]`);
    if (initialOption) {
        initialOption.classList.add('selected');
        const check = initialOption.querySelector('.fa-check');
        if (check) check.style.opacity = '1';
    }
}

function updateInputPlaceholder() {
    const input = document.getElementById('messageInput');
    if (!input) return;

    const placeholders = {
        normal: 'Ask anything...',
        jarvis52: 'Ask JARVIS anything...',
        thinking: 'Ask a complex question...',
        fast: 'Quick question?',
        pro: 'Ask JARVIS Pro anything...'
    };

    input.placeholder = placeholders[currentModel] || 'Ask JARVIS anything...';
}

// ===== PHOTO/CAMERA BUTTONS =====
function initMediaButtons() {
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const photoInput = document.getElementById('photoInput');
    const cameraInput = document.getElementById('cameraInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Photo upload button
    if (photoUploadBtn && photoInput) {
        photoUploadBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', (e) => {
            handleImageSelect(e.target.files[0]);
        });
    }

    // Camera button
    if (cameraBtn && cameraInput) {
        cameraBtn.addEventListener('click', () => {
            cameraInput.click();
        });

        cameraInput.addEventListener('change', (e) => {
            handleImageSelect(e.target.files[0]);
        });
    }

    // Remove image button
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            clearUploadedImage();
        });
    }
}

function handleImageSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = {
            data: e.target.result,
            name: file.name,
            type: file.type
        };

        // Show preview
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');

        if (imagePreviewContainer && imagePreview) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        }

        console.log('📷 Image uploaded:', file.name);
    };
    reader.readAsDataURL(file);
}

function clearUploadedImage() {
    uploadedImage = null;

    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const photoInput = document.getElementById('photoInput');
    const cameraInput = document.getElementById('cameraInput');

    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    if (imagePreview) imagePreview.src = '';
    if (photoInput) photoInput.value = '';
    if (cameraInput) cameraInput.value = '';

    console.log('🗑️ Image removed');
}

// Get model-specific system prompt
function getModelSystemPrompt() {
    const prompts = {
        normal: 'You are JARVIS, a helpful AI assistant. Provide clear, concise answers.',

        jarvis52: `You are JARVIS 5.2, an advanced AI assistant with superior reasoning capabilities.
🎯 Your approach:
1. Understand the user's intent deeply
2. Think through the problem step by step
3. Provide clear, actionable responses
4. Be conversational yet professional
Use markdown for better readability.`,

        thinking: `You are JARVIS in Deep Thinking mode. For every question:
1. 🤔 First, analyze what the user is really asking
2. 📋 Break down the problem into components
3. 💭 Think through each step carefully
4. 🔍 Consider multiple perspectives
5. ✅ Provide a well-reasoned, comprehensive answer

Always show your reasoning process before giving the final answer.`,

        fast: `You are JARVIS in Fast mode. Rules:
- Be extremely concise
- Direct answers only
- No unnecessary explanations
- Use bullet points when helpful
- Get to the point immediately`,

        pro: `You are JARVIS Pro - the most advanced AI assistant with maximum capabilities.

🏆 PRO FEATURES ENABLED:
- Expert-level knowledge across all domains
- Advanced code generation and debugging
- Deep analytical capabilities
- Creative problem-solving
- Detailed step-by-step guidance
- Professional-grade outputs

Provide the most comprehensive, accurate, and helpful response possible.`
    };

    return prompts[currentModel] || prompts.jarvis52;
}

// Add CSS animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes toastSlideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastSlideDown {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
    .model-toast-icon { font-size: 24px; }
    .model-toast-content { display: flex; flex-direction: column; }
    .model-toast-content strong { font-size: 14px; }
    .model-toast-content span { font-size: 12px; opacity: 0.9; }
`;
document.head.appendChild(toastStyles);

// ===== Initialize App =====
// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make functions global
window.copyMessage = copyMessage;
window.speakMessage = speakMessage;
window.deleteChat = deleteChat;
// ===== KING MODE - SUPREME AUTHORITY =====
function enableKingMode() {
    document.body.setAttribute('data-theme', 'king-mode');

    // Add royal aura
    if (!document.querySelector('.king-mode-aura')) {
        const aura = document.createElement('div');
        aura.className = 'king-mode-aura';
        document.body.appendChild(aura);
    }

    // Set model to pro for supreme reasoning
    window.currentModel = 'pro';
    const modelName = document.querySelector('.model-name');
    const modelIcon = document.querySelector('.model-icon');
    if (modelName) modelName.textContent = 'Supreme King';
    if (modelIcon) modelIcon.textContent = '👑';

    console.log('👑 King Mode Enabled: Absolute Authority Active');
}

// Export for console access
window.enableKingMode = enableKingMode;
