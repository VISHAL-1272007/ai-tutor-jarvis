// ===== JARVIS GLOBAL VOICE CONTROL SYSTEM =====
// Revolutionary voice interaction across the entire platform

class JARVISVoice {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.wakeWord = 'hey jarvis';
        this.continuousMode = false;
        this.voiceIndicator = null;

        this.init();
    }

    // Initialize Voice Recognition
    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            this.setupRecognitionEvents();
            this.createVoiceIndicator();
            this.setupKeyboardShortcuts();

            console.log('🎤 JARVIS Voice Control initialized');
        } else {
            console.warn('⚠️ Speech recognition not supported');
        }
    }

    // Setup Recognition Events
    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.showVoiceIndicator();
            this.updateOrbState('listening');
            console.log('🎤 JARVIS: Listening for wake word...');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.hideVoiceIndicator();
            if (!this.isSpeaking) {
                this.updateOrbState('idle');
            }

            // Auto-restart for continuous listening
            if (this.continuousMode) {
                setTimeout(() => this.startListening(), 100);
            }
        };

        this.recognition.onresult = (event) => {
            const results = event.results;
            const lastResult = results[results.length - 1];

            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.toLowerCase().trim();
                console.log('🎤 JARVIS: Heard:', transcript);

                // Check for wake word
                if (transcript.includes(this.wakeWord)) {
                    this.updateOrbState('thinking');
                    this.handleWakeWord(transcript);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('🎤 JARVIS: Recognition error:', event.error);
            this.updateOrbState('idle');

            if (event.error === 'not-allowed') {
                this.showNotification('❌ Microphone access denied. Please allow microphone access.', 'error');
            } else if (event.error !== 'no-speech') {
                this.showNotification(`❌ Voice error: ${event.error}`, 'error');
            }
        };
    }

    // Handle Wake Word Detection
    handleWakeWord(transcript) {
        // Extract command after wake word
        const command = transcript.split(this.wakeWord)[1]?.trim() || '';

        if (command) {
            this.processCommand(command);
        } else {
            this.speak('At your service, Sir. What can I do for you?');
            this.showNotification('🎤 JARVIS: At your service, Sir.', 'info');
        }
    }

    // Process Voice Commands
    async processCommand(command) {
        console.log('🤖 Processing command:', command);
        this.showNotification(`Processing: "${command}"`, 'info');

        // Navigation Commands
        if (command.includes('go to') || command.includes('open') || command.includes('show me')) {
            this.handleNavigation(command);
        }
        // Learning Commands
        else if (command.includes('teach me') || command.includes('learn') || command.includes('what is') || command.includes('explain')) {
            this.handleLearningQuery(command);
        }
        // Code Commands
        else if (command.includes('run code') || command.includes('execute')) {
            this.handleCodeExecution(command);
        }
        else if (command.includes('debug') || command.includes('fix')) {
            this.handleDebug(command);
        }
        else if (command.includes('optimize')) {
            this.handleOptimize(command);
        }
        // Course Commands
        else if (command.includes('course') || command.includes('lesson')) {
            this.handleCourseCommand(command);
        }
        // AI Tools
        else if (command.includes('generate') || command.includes('create')) {
            this.handleGenerate(command);
        }
        // General Query
        else {
            this.handleGeneralQuery(command);
        }
    }

    // Navigation Handler
    handleNavigation(command) {
        const routes = {
            'home': 'index.html',

            'courses': 'courses.html',
            'playground': 'playground.html',
            'code playground': 'playground.html',
            'tools': 'ai-tools.html',
            'ai tools': 'ai-tools.html',
            'project generator': 'project-generator.html',
            'profile': 'profile.html',
            'settings': 'settings.html'
        };

        for (const [keyword, page] of Object.entries(routes)) {
            if (command.includes(keyword)) {
                this.speak(`Opening ${keyword}`);
                setTimeout(() => window.location.href = page, 500);
                return;
            }
        }

        this.speak("I'm not sure where you want to go");
    }

    // Learning Query Handler
    async handleLearningQuery(command) {
        // Extract topic
        const topic = command.replace(/teach me|learn|what is|explain/gi, '').trim();

        if (!topic) {
            this.speak("What would you like to learn about?");
            return;
        }

        this.speak(`Let me explain ${topic}`);

        // Redirect to chat with query
        setTimeout(() => {
            window.location.href = `index.html?query=${encodeURIComponent(topic)}`;
        }, 1000);
    }

    // Code Execution Handler
    handleCodeExecution(command) {
        if (window.location.pathname.includes('playground.html')) {
            if (typeof runCode === 'function') {
                this.speak('Running your code');
                runCode();
            }
        } else {
            this.speak('Opening code playground');
            setTimeout(() => window.location.href = 'playground.html', 500);
        }
    }

    // Debug Handler
    handleDebug(command) {
        if (window.location.pathname.includes('playground.html')) {
            if (typeof debugCode === 'function') {
                this.speak('Debugging your code');
                debugCode();
            }
        } else {
            this.speak('Please open the code playground first');
        }
    }

    // Optimize Handler
    handleOptimize(command) {
        if (window.location.pathname.includes('playground.html')) {
            if (typeof optimizeCode === 'function') {
                this.speak('Optimizing your code');
                optimizeCode();
            }
        } else {
            this.speak('Please open the code playground first');
        }
    }

    // Course Command Handler
    handleCourseCommand(command) {
        if (command.includes('show') || command.includes('list')) {
            this.speak('Opening courses');
            setTimeout(() => window.location.href = 'courses.html', 500);
        } else {
            this.speak('Opening courses page');
            setTimeout(() => window.location.href = 'courses.html', 500);
        }
    }

    // Generate Handler
    handleGenerate(command) {
        if (command.includes('project')) {
            this.speak('Opening project generator');
            setTimeout(() => window.location.href = 'project-generator.html', 500);
        } else if (command.includes('image')) {
            this.speak('Opening AI tools');
            setTimeout(() => window.location.href = 'ai-tools.html', 500);
        } else {
            this.speak('Opening AI tools');
            setTimeout(() => window.location.href = 'ai-tools.html', 500);
        }
    }

    // General Query Handler
    async handleGeneralQuery(command) {
        this.speak('Let me help you with that');

        // Redirect to main chat with query
        setTimeout(() => {
            window.location.href = `index.html?query=${encodeURIComponent(command)}`;
        }, 1000);
    }

    // Text-to-Speech with ElevenLabs Priority
    async speak(text) {
        if (!text) return;

        // Cancel any ongoing speech
        if (this.isSpeaking) {
            this.synthesis.cancel();
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }
        }

        this.isSpeaking = true;
        this.updateOrbState('speaking');

        // Try ElevenLabs High-Quality Voice
        try {
            const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://ai-tutor-jarvis.onrender.com';

            const response = await fetch(`${API_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.audioUrl) {
                    console.log('🔊 JARVIS: Using ElevenLabs AI Voice');
                    const audio = new Audio(data.audioUrl);
                    this.currentAudio = audio;

                    audio.onended = () => {
                        this.isSpeaking = false;
                        this.updateOrbState('idle');
                    };

                    await audio.play();
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ JARVIS: AI Voice unavailable, falling back to browser', error);
        }

        // Fallback to Browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 0.9; // Slightly deeper for JARVIS feel
        utterance.volume = 1.0;

        // Try to find a sophisticated British voice
        const voices = this.synthesis.getVoices();
        const jarvisVoice = voices.find(v => v.name.includes('UK English Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'));

        if (jarvisVoice) {
            utterance.voice = jarvisVoice;
        }

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateOrbState('idle');
        };

        this.synthesis.speak(utterance);
    }

    // Update JARVIS Orb State
    updateOrbState(state) {
        const orb = document.querySelector('.jarvis-orb-3d') || document.getElementById('jarvis-voice-toggle');
        if (!orb) return;

        orb.classList.remove('listening', 'thinking', 'speaking', 'idle');
        orb.classList.add(state);

        // Update status text if it exists
        const statusText = document.querySelector('.voice-status');
        if (statusText) {
            switch (state) {
                case 'listening': statusText.textContent = 'Listening...'; break;
                case 'thinking': statusText.textContent = 'Thinking...'; break;
                case 'speaking': statusText.textContent = 'Speaking...'; break;
                default: statusText.textContent = 'Online';
            }
        }
    }

    // Start Listening
    startListening() {
        if (!this.recognition) {
            this.showNotification('❌ Voice control not supported in this browser', 'error');
            return;
        }

        if (!this.isListening) {
            this.recognition.start();
            this.continuousMode = true;
        }
    }

    // Stop Listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.continuousMode = false;
            this.recognition.stop();
        }
    }

    // Toggle Listening
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    // Create Voice Indicator
    createVoiceIndicator() {
        // Check if already exists
        if (document.getElementById('jarvis-voice-indicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'jarvis-voice-indicator';
        indicator.innerHTML = `
            <div class="voice-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
                    <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z" fill="currentColor"/>
                    <path d="M11 21H13V24H11V21Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="voice-status">Listening...</div>
        `;

        // Create floating toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'jarvis-voice-toggle';
        toggleBtn.title = 'Toggle Voice Control (Ctrl+Shift+V)';
        toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"/>
                <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z"/>
            </svg>
            <span class="voice-toggle-text">VOICE</span>
        `;
        toggleBtn.addEventListener('click', () => this.toggleListening());

        const style = document.createElement('style');
        style.textContent = `
            #jarvis-voice-toggle {
                position: fixed;
                bottom: 90px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
                border: 2px solid rgba(0, 212, 255, 0.5);
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                z-index: 9999;
                box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4);
                transition: all 0.3s ease;
                font-family: 'Orbitron', monospace;
                border: none;
                outline: none;
            }
            
            #jarvis-voice-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 32px rgba(0, 212, 255, 0.6);
            }
            
            #jarvis-voice-toggle:active {
                transform: scale(0.95);
            }
            
            #jarvis-voice-toggle.active {
                background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
                border-color: rgba(0, 255, 136, 0.5);
                animation: voiceButtonPulse 1.5s ease-in-out infinite;
            }
            
            #jarvis-voice-toggle svg {
                width: 24px;
                height: 24px;
            }
            
            .voice-toggle-text {
                font-size: 8px;
                font-weight: 700;
                letter-spacing: 1px;
            }
            
            @keyframes voiceButtonPulse {
                0%, 100% { box-shadow: 0 8px 24px rgba(0, 255, 136, 0.4); }
                50% { box-shadow: 0 12px 36px rgba(0, 255, 136, 0.7), 0 0 20px rgba(0, 255, 136, 0.5); }
            }
            
            #jarvis-voice-indicator {
                position: fixed;
                bottom: 160px;
                right: 30px;
                background: linear-gradient(135deg, rgba(0, 212, 255, 0.95), rgba(0, 102, 255, 0.95));
                color: white;
                padding: 15px 20px;
                border-radius: 50px;
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.5);
                display: none;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: voicePulse 2s ease-in-out infinite;
                font-family: 'Rajdhani', sans-serif;
                font-weight: 600;
                font-size: 16px;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
            
            #jarvis-voice-indicator.visible {
                display: flex;
            }
            
            #jarvis-voice-indicator.pulse {
                animation: voiceActivePulse 0.5s ease-in-out;
            }
            
            .voice-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes voicePulse {
                0%, 100% { box-shadow: 0 10px 30px rgba(0, 212, 255, 0.5); }
                50% { box-shadow: 0 10px 40px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6); }
            }
            
            @keyframes voiceActivePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            @media (max-width: 768px) {
                #jarvis-voice-toggle {
                    bottom: 80px;
                    right: 20px;
                    width: 56px;
                    height: 56px;
                }
                
                #jarvis-voice-indicator {
                    bottom: 145px;
                    right: 20px;
                    padding: 12px 16px;
                    font-size: 14px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(toggleBtn);
        document.body.appendChild(indicator);
        this.voiceIndicator = indicator;
        this.voiceToggleBtn = toggleBtn;
    }

    // Show Voice Indicator
    showVoiceIndicator() {
        if (this.voiceIndicator) {
            this.voiceIndicator.classList.add('visible');
        }
        if (this.voiceToggleBtn) {
            this.voiceToggleBtn.classList.add('active');
        }
    }

    // Hide Voice Indicator
    hideVoiceIndicator() {
        if (this.voiceIndicator) {
            this.voiceIndicator.classList.remove('visible');
        }
        if (this.voiceToggleBtn) {
            this.voiceToggleBtn.classList.remove('active');
        }
    }

    // Pulse Indicator (when wake word detected)
    pulseIndicator() {
        if (this.voiceIndicator) {
            this.voiceIndicator.classList.add('pulse');
            setTimeout(() => {
                this.voiceIndicator.classList.remove('pulse');
            }, 500);
        }
    }

    // Setup Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + V to toggle voice
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    // Show Notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `jarvis-notification ${type}`;
        notification.textContent = message;

        const colors = {
            'info': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'success': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            'error': 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
            'warning': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize JARVIS Voice Control
const jarvisVoice = new JARVISVoice();

// Global functions for easy access
window.startJARVISVoice = () => jarvisVoice.startListening();
window.stopJARVISVoice = () => jarvisVoice.stopListening();
window.toggleJARVISVoice = () => jarvisVoice.toggleListening();

// Auto-start voice control when page loads (after user interaction)
document.addEventListener('click', () => {
    if (!jarvisVoice.isListening && !sessionStorage.getItem('jarvis-voice-started')) {
        sessionStorage.setItem('jarvis-voice-started', 'true');
        // Don't auto-start immediately - let user activate it
        console.log('🎤 JARVIS Voice ready! Press Ctrl+Shift+V or click the voice button');
    }
}, { once: true });

console.log('🤖 JARVIS Voice Control loaded! Say "Hey JARVIS" to activate');
