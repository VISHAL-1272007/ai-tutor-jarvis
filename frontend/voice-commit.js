// ===== PERPLEXITY-STYLE VOICE COMMIT INTERFACE =====
// Beautiful modal interface for voice/text queries

class VoiceCommit {
    constructor() {
        this.modal = null;
        this.backdrop = null;
        this.input = null;
        this.orb = null;
        this.submitBtn = null;
        this.responseArea = null;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentMode = 'all';
        this.autoSpeak = true; // Auto-speak responses by default
        
        this.init();
    }

    init() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get DOM elements
        this.modal = document.getElementById('voiceCommitModal');
        this.backdrop = document.getElementById('voiceCommitBackdrop');
        this.input = document.getElementById('voiceCommitInput');
        this.orb = document.getElementById('voiceOrb');
        this.submitBtn = document.getElementById('voiceSubmitBtn');
        this.responseArea = document.getElementById('voiceCommitResponse');
        this.responseContent = document.getElementById('responseContent');
        this.voiceStatus = document.getElementById('voiceStatus');

        if (!this.modal) {
            console.warn('Voice commit modal not found');
            return;
        }

        // Setup speech recognition
        this.setupSpeechRecognition();

        // Setup event listeners
        this.setupEventListeners();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('🎤 Voice Commit Interface initialized');
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.orb.classList.add('listening');
                this.updateStatus('Listening...', 'listening');
            };

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.input.value = transcript;
                this.autoResize();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.orb.classList.remove('listening');
                this.updateStatus('Ready to listen', 'ready');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateStatus('Error: ' + event.error, 'error');
                this.orb.classList.remove('listening');
            };
        }
    }

    setupEventListeners() {
        // Open modal when clicking voice button (find it in the page)
        const voiceButtons = document.querySelectorAll('.voice-btn, #voiceBtn, .jarvis-orb-3d');
        voiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });

        // Close modal
        document.getElementById('voiceCommitClose')?.addEventListener('click', () => this.close());
        this.backdrop?.addEventListener('click', () => this.close());

        // Voice orb click - start/stop listening
        this.orb?.addEventListener('click', () => this.toggleVoiceInput());

        // Submit button
        this.submitBtn?.addEventListener('click', () => this.handleSubmit());

        // Input auto-resize
        this.input?.addEventListener('input', () => this.autoResize());

        // Enter to submit (Shift+Enter for new line)
        this.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });

        // Mode buttons
        document.querySelectorAll('.voice-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.voiceMode));
        });

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.input.value = chip.dataset.query;
                this.autoResize();
                this.handleSubmit();
            });
        });

        // Response actions
        document.getElementById('copyResponseBtn')?.addEventListener('click', () => this.copyResponse());
        document.getElementById('continueInChatBtn')?.addEventListener('click', () => this.continueInChat());
        document.getElementById('responseClose')?.addEventListener('click', () => this.closeResponse());
        
        // Speaker toggle button
        document.getElementById('voiceSpeakerBtn')?.addEventListener('click', () => this.toggleAutoSpeak());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }

            // Escape to close
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.input?.focus();
        }, 300);
    }

    close() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = '';
        this.input.value = '';
        this.closeResponse();
        
        // Stop speech and recognition
        if (this.isListening) {
            this.recognition?.stop();
        }
        if (this.isSpeaking) {
            this.stopSpeaking();
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Speech recognition not supported in your browser');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.voice-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.voiceMode === mode);
        });
    }

    autoResize() {
        if (this.input) {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 150) + 'px';
        }
    }

    updateStatus(text, type = 'ready') {
        if (this.voiceStatus) {
            const icon = this.voiceStatus.querySelector('i');
            const span = this.voiceStatus.querySelector('span');
            
            span.textContent = text;
            
            this.voiceStatus.className = 'voice-status';
            if (type === 'listening') {
                this.voiceStatus.classList.add('listening');
                icon.className = 'fas fa-circle';
            } else if (type === 'processing') {
                this.voiceStatus.classList.add('processing');
                icon.className = 'fas fa-spinner fa-spin';
            } else if (type === 'error') {
                this.voiceStatus.classList.add('error');
                icon.className = 'fas fa-exclamation-circle';
            } else {
                icon.className = 'fas fa-circle';
            }
        }
    }

    async handleSubmit() {
        const query = this.input.value.trim();
        if (!query) return;

        this.updateStatus('Processing your question...', 'processing');
        this.submitBtn.disabled = true;

        try {
            // Get backend URL from config if available
            const backendUrl = window.getBackendURL ? window.getBackendURL() : 'https://ai-tutor-jarvis.onrender.com';
            
            const response = await fetch(`${backendUrl}/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: query,
                    mode: this.currentMode,
                    enableWebSearch: true, // Enable web search for voice commit
                    history: []
                })
            });

            const data = await response.json();

            if (data.answer) {
                this.showResponse(data.answer, data.citations, data.sources, data.webSearchUsed, data.searchEngine);
                this.updateStatus('Response ready!', 'ready');
                
                // Auto-speak the response
                if (this.autoSpeak) {
                    this.speakResponse(data.answer);
                }
            } else {
                throw new Error('No answer received');
            }

        } catch (error) {
            console.error('Error:', error);
            this.showResponse('❌ Sorry, I encountered an error. Please try again.', [], [], false);
            this.updateStatus('Error occurred', 'error');
        } finally {
            this.submitBtn.disabled = false;
        }
    }

    showResponse(answer, citations = [], sources = [], webSearchUsed = false, searchEngine = '') {
        if (!this.responseArea) return;

        const content = this.responseArea.querySelector('#responseContent');
        if (!content) return;

        // Convert markdown to HTML (basic conversion)
        let html = answer
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')
            .replace(/## (.*?)\n/g, '<h2>$1</h2>')
            .replace(/# (.*?)\n/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Add web search indicator if used
        if (webSearchUsed && searchEngine) {
            html = `<div class="web-search-badge">
                <i class="fas fa-globe"></i> 
                Searched the web using ${searchEngine}
            </div>` + html;
        }

        // Add citations if available
        if (citations && citations.length > 0) {
            html += '<div class="citations-section">';
            html += '<h4><i class="fas fa-link"></i> Citations</h4>';
            html += '<ol class="citations-list">';
            citations.forEach((url, i) => {
                const source = sources && sources[i];
                const title = source?.title || `Source ${i + 1}`;
                const snippet = source?.snippet || '';
                html += `<li>
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                        <strong>${title}</strong>
                        ${snippet ? `<br><small>${snippet}</small>` : ''}
                    </a>
                </li>`;
            });
            html += '</ol></div>';
        }

        content.innerHTML = html;
        this.responseArea.style.display = 'block';
        this.currentResponse = answer;

        // Scroll to response
        this.responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    speakResponse(text) {
        // Stop any ongoing speech
        if (this.isSpeaking) {
            this.synthesis.cancel();
        }

        // Clean text for speech (remove markdown, HTML, URLs)
        let cleanText = text
            .replace(/#{1,6}\s/g, '') // Remove markdown headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`([^`]+)`/g, '$1') // Remove code markers
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
            .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
            .replace(/\n+/g, '. ') // Replace newlines with periods
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

        // Limit to first 500 characters for reasonable speech length
        if (cleanText.length > 500) {
            cleanText = cleanText.substring(0, 500) + '... You can read the full response on screen.';
        }

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Voice settings
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Full volume

        // Try to use a good English voice
        const voices = this.synthesis.getVoices();
        const preferredVoices = [
            'Google US English',
            'Microsoft David',
            'Microsoft Mark',
            'Alex',
            'Samantha'
        ];

        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name.includes(preferred));
            if (voice) {
                utterance.voice = voice;
                break;
            }
        }

        // If no preferred voice, use first English voice
        if (!utterance.voice) {
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) utterance.voice = englishVoice;
        }

        // Event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.orb?.classList.add('speaking');
            this.updateStatus('🔊 Speaking...', 'speaking');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.orb?.classList.remove('speaking');
            this.updateStatus('Ready to listen', 'ready');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.orb?.classList.remove('speaking');
        };

        // Speak!
        this.synthesis.speak(utterance);
    }

    stopSpeaking() {
        if (this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.orb?.classList.remove('speaking');
            this.updateStatus('Ready to listen', 'ready');
        }
    }

    closeResponse() {
        if (this.responseArea) {
            this.responseArea.style.display = 'none';
        }
    }

    copyResponse() {
        const text = this.responseContent?.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyResponseBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    }

    continueInChat() {
        // Close modal and insert query into main chat
        const query = this.input.value;
        this.close();
        
        // Try to find and fill main chat input
        const mainInput = document.getElementById('messageInput');
        if (mainInput) {
            mainInput.value = query;
            mainInput.focus();
        }
    }

    toggleAutoSpeak() {
        this.autoSpeak = !this.autoSpeak;
        const btn = document.getElementById('voiceSpeakerBtn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (this.autoSpeak) {
                icon.className = 'fas fa-volume-up';
                btn.style.color = '#00d4ff';
                btn.title = 'Voice ON - Click to disable';
            } else {
                icon.className = 'fas fa-volume-mute';
                btn.style.color = 'rgba(255, 255, 255, 0.5)';
                btn.title = 'Voice OFF - Click to enable';
                this.stopSpeaking();
            }
        }
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.voiceCommit = new VoiceCommit();
}

console.log('✅ Voice Commit Interface loaded');
