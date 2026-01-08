// ===== IRON MAN JARVIS VOICE MODE =====
// Makes JARVIS speak like in the movies!

class JarvisVoiceMode {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = null;
        this.isEnabled = localStorage.getItem('jarvisVoiceMode') === 'true';
        this.autoSpeak = localStorage.getItem('jarvisAutoSpeak') !== 'false'; // Default true
        this.wakeWord = 'hey jarvis';
        this.isListeningForWakeWord = false;
        this.isSpeaking = false;
        this.orbElement = null;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.orbElement = document.getElementById('jarvisOrb');
        this.setupSpeechRecognition();
        this.createControlUI();
        this.setupMutationObserver();
        
        if (this.isEnabled) {
            this.enable();
        }
        
        console.log('🎬 IRON MAN JARVIS Mode initialized');
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let transcript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript.toLowerCase();
                }
                
                // Check for wake word
                if (this.isListeningForWakeWord && transcript.includes(this.wakeWord)) {
                    this.onWakeWordDetected();
                    this.speak("Yes, sir? How may I assist you?");
                }
            };

            this.recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
            };
        }
    }

    createControlUI() {
        // Add JARVIS mode toggle to sidebar
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const controlsHTML = `
            <div class="jarvis-mode-controls" style="
                padding: 16px;
                margin: 16px 0;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                border-radius: 12px;
                border: 1px solid rgba(102, 126, 234, 0.2);
            ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-robot" style="color: #667eea; font-size: 20px;"></i>
                        <span style="font-weight: 600; color: var(--text-primary);">IRON MAN Mode</span>
                    </div>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                        <input type="checkbox" id="jarvisVoiceModeToggle" ${this.isEnabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                        <span style="
                            position: absolute;
                            cursor: pointer;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: #ccc;
                            transition: 0.4s;
                            border-radius: 24px;
                        "></span>
                    </label>
                </div>
                
                <div id="jarvisVoiceSettings" style="display: ${this.isEnabled ? 'block' : 'none'};">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 13px; color: var(--text-secondary);">Auto-Speak Responses</span>
                        <label class="switch-toggle-small" style="position: relative; display: inline-block; width: 38px; height: 20px;">
                            <input type="checkbox" id="jarvisAutoSpeakToggle" ${this.autoSpeak ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                            <span style="
                                position: absolute;
                                cursor: pointer;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background-color: #667eea;
                                transition: 0.4s;
                                border-radius: 20px;
                            "></span>
                        </label>
                    </div>
                    
                    <div style="margin-top: 12px; padding: 12px; background: rgba(102, 126, 234, 0.05); border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                            <div style="margin-bottom: 6px;"><i class="fas fa-check" style="color: #00ff88; margin-right: 6px;"></i>Say "<strong>Hey JARVIS</strong>" to activate</div>
                            <div style="margin-bottom: 6px;"><i class="fas fa-check" style="color: #00ff88; margin-right: 6px;"></i>JARVIS speaks responses automatically</div>
                            <div><i class="fas fa-check" style="color: #00ff88; margin-right: 6px;"></i>Hands-free conversation mode</div>
                        </div>
                    </div>
                    
                    <div id="jarvisStatus" style="
                        margin-top: 12px;
                        padding: 8px 12px;
                        background: rgba(0, 212, 255, 0.1);
                        border-radius: 8px;
                        font-size: 12px;
                        color: #00d4ff;
                        text-align: center;
                        display: none;
                    ">
                        <i class="fas fa-circle-notch fa-spin"></i> Initializing...
                    </div>
                </div>
            </div>
        `;

        // Insert before history section
        const historySection = sidebar.querySelector('#history');
        if (historySection) {
            historySection.insertAdjacentHTML('beforebegin', controlsHTML);
        }

        // Add CSS for toggle switches
        const style = document.createElement('style');
        style.textContent = `
            .switch-toggle input:checked + span {
                background-color: #667eea !important;
            }
            .switch-toggle span:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            .switch-toggle input:checked + span:before {
                transform: translateX(20px);
            }
            
            .switch-toggle-small input:checked + span {
                background-color: #00ff88 !important;
            }
            .switch-toggle-small span:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            .switch-toggle-small input:checked + span:before {
                transform: translateX(18px);
            }
        `;
        document.head.appendChild(style);

        // Add event listeners
        const modeToggle = document.getElementById('jarvisVoiceModeToggle');
        const autoSpeakToggle = document.getElementById('jarvisAutoSpeakToggle');
        const settingsDiv = document.getElementById('jarvisVoiceSettings');

        if (modeToggle) {
            modeToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enable();
                    settingsDiv.style.display = 'block';
                } else {
                    this.disable();
                    settingsDiv.style.display = 'none';
                }
            });
        }

        if (autoSpeakToggle) {
            autoSpeakToggle.addEventListener('change', (e) => {
                this.autoSpeak = e.target.checked;
                localStorage.setItem('jarvisAutoSpeak', this.autoSpeak);
                this.showStatus(this.autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled');
            });
        }
    }

    enable() {
        this.isEnabled = true;
        localStorage.setItem('jarvisVoiceMode', 'true');
        
        // Start listening for wake word
        if (this.recognition) {
            try {
                this.recognition.start();
                this.isListeningForWakeWord = true;
                this.showStatus('🎤 Listening for "Hey JARVIS"...');
                this.animateOrb('listening');
            } catch (e) {
                console.warn('Recognition already started');
            }
        }
        
        // Greet user
        this.speak("JARVIS voice mode activated. How may I assist you today, sir?");
        
        console.log('🎬 IRON MAN Mode enabled');
    }

    disable() {
        this.isEnabled = false;
        localStorage.setItem('jarvisVoiceMode', 'false');
        
        // Stop listening
        if (this.recognition) {
            this.recognition.stop();
            this.isListeningForWakeWord = false;
        }
        
        // Stop speaking
        this.synthesis.cancel();
        
        this.showStatus('Voice mode disabled');
        this.animateOrb('idle');
        
        console.log('🎬 IRON MAN Mode disabled');
    }

    onWakeWordDetected() {
        console.log('🎬 Wake word detected!');
        this.showStatus('✨ JARVIS activated');
        this.animateOrb('activated');
        
        // Trigger mic button click to start listening
        setTimeout(() => {
            const micBtn = document.getElementById('micBtn');
            if (micBtn) {
                micBtn.click();
            }
        }, 1000);
    }

    speak(text) {
        if (!this.isEnabled || !this.autoSpeak || !text) return;
        
        // Stop any ongoing speech
        this.synthesis.cancel();
        
        // Clean text for speech
        const cleanText = this.cleanTextForSpeech(text);
        
        if (cleanText.length === 0) return;
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // JARVIS voice settings - British accent, deeper tone
        utterance.lang = 'en-GB'; // British English like JARVIS
        utterance.rate = 0.95; // Slightly slower, more authoritative
        utterance.pitch = 0.85; // Deeper voice
        utterance.volume = 1.0;
        
        // Prefer a male British voice if available
        const voices = this.synthesis.getVoices();
        const britishVoice = voices.find(voice => 
            voice.lang.includes('en-GB') && voice.name.toLowerCase().includes('male')
        ) || voices.find(voice => voice.lang.includes('en-GB'));
        
        if (britishVoice) {
            utterance.voice = britishVoice;
        }
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.animateOrb('speaking');
            this.showStatus('🔊 JARVIS speaking...');
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.animateOrb('listening');
            this.showStatus('🎤 Ready for next command...');
        };
        
        utterance.onerror = (e) => {
            console.error('Speech error:', e);
            this.isSpeaking = false;
            this.animateOrb('listening');
        };
        
        this.synthesis.speak(utterance);
    }

    cleanTextForSpeech(text) {
        return text
            .replace(/[#*_`]/g, '') // Remove markdown
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
            .replace(/```[\s\S]*?```/g, 'code block') // Replace code blocks
            .replace(/`[^`]+`/g, 'code') // Replace inline code
            .replace(/\n+/g, '. ') // Convert newlines to pauses
            .replace(/https?:\/\/[^\s]+/g, 'link') // Replace URLs
            .replace(/[📚🎯💡🚀✨🌟👍🎓💪😊]/g, '') // Remove emojis
            .replace(/\s+/g, ' ') // Clean up spaces
            .trim();
    }

    setupMutationObserver() {
        // Watch for new AI messages and speak them automatically
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    // Check if it's an AI message
                    if (node.classList && node.classList.contains('ai') && this.isEnabled && this.autoSpeak) {
                        // Wait a bit for the typing animation to complete
                        setTimeout(() => {
                            const messageContent = node.querySelector('p');
                            if (messageContent) {
                                this.speak(messageContent.textContent);
                            }
                        }, 1000);
                    }
                });
            });
        });

        observer.observe(messagesArea, {
            childList: true,
            subtree: true
        });
    }

    animateOrb(state) {
        if (!this.orbElement) return;

        // Remove all state classes
        this.orbElement.classList.remove('listening', 'speaking', 'activated', 'idle');
        
        // Add current state
        this.orbElement.classList.add(state);

        // Add custom animations
        switch(state) {
            case 'listening':
                this.orbElement.style.animation = 'pulse 2s ease-in-out infinite, glow 3s ease-in-out infinite';
                break;
            case 'speaking':
                this.orbElement.style.animation = 'pulse 0.5s ease-in-out infinite, glow 1s ease-in-out infinite';
                break;
            case 'activated':
                this.orbElement.style.animation = 'flash 0.5s ease-out';
                break;
            case 'idle':
                this.orbElement.style.animation = 'pulse 4s ease-in-out infinite';
                break;
        }
    }

    showStatus(message) {
        const statusElement = document.getElementById('jarvisStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
    }
}

// Add orb animation styles
const orbStyles = document.createElement('style');
orbStyles.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 0.8;
        }
        50% {
            transform: scale(1.05);
            opacity: 1;
        }
    }

    @keyframes glow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.5),
                        0 0 40px rgba(102, 126, 234, 0.3),
                        0 0 60px rgba(102, 126, 234, 0.1);
        }
        50% {
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.8),
                        0 0 60px rgba(102, 126, 234, 0.6),
                        0 0 90px rgba(102, 126, 234, 0.4);
        }
    }

    @keyframes flash {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.3;
            transform: scale(1.2);
        }
    }

    #jarvisOrb.listening {
        background: radial-gradient(circle, #00d4ff 0%, #667eea 50%, #764ba2 100%);
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.8),
                    0 0 60px rgba(102, 126, 234, 0.6),
                    0 0 90px rgba(118, 75, 162, 0.4);
    }

    #jarvisOrb.speaking {
        background: radial-gradient(circle, #00ff88 0%, #00d4ff 50%, #667eea 100%);
        box-shadow: 0 0 40px rgba(0, 255, 136, 0.9),
                    0 0 80px rgba(0, 212, 255, 0.7),
                    0 0 120px rgba(102, 126, 234, 0.5);
    }

    #jarvisOrb.activated {
        background: radial-gradient(circle, #ffffff 0%, #00ff88 50%, #00d4ff 100%);
        box-shadow: 0 0 50px rgba(255, 255, 255, 1),
                    0 0 100px rgba(0, 255, 136, 0.8),
                    0 0 150px rgba(0, 212, 255, 0.6);
    }
`;
document.head.appendChild(orbStyles);

// Initialize JARVIS Voice Mode
const jarvisVoiceMode = new JarvisVoiceMode();

// Export for external use
window.jarvisVoiceMode = jarvisVoiceMode;
