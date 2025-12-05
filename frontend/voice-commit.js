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
        this.isListening = false;
        this.currentMode = 'all';
        
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
        if (this.isListening) {
            this.recognition?.stop();
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
    }

            if (data.success) {
                this.showResponse(data.response);
                this.updateStatus('Response received', 'ready');
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            this.updateStatus('Error: ' + error.message, 'error');
            alert('Failed to get response. Please try again.');
        } finally {
            this.submitBtn.disabled = false;
        }
    }

    showResponse(text) {
        if (this.responseContent && this.responseArea) {
            // Convert markdown-style formatting to HTML
            let html = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');

            this.responseContent.innerHTML = html;
            this.responseArea.style.display = 'block';
            
            // Scroll to response
            this.responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.voiceCommit = new VoiceCommit();
}

console.log('✅ Voice Commit Interface loaded');
