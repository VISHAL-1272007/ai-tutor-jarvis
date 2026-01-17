/**
 * Voice Input Integration for JARVIS
 * Features: Browser native Web Speech API + Deepgram fallback
 * Cost: 100% FREE (Web Speech API) + FREE tier (Deepgram 600 min/month)
 */

class VoiceInput {
    constructor() {
        this.isListening = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        
        // Initialize Web Speech API (browser native)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.setupWebSpeechAPI();
        }
        
        this.setupUI();
    }
    
    /**
     * Setup Web Speech API (FREE, browser native, fastest)
     */
    setupWebSpeechAPI() {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            console.log('🎤 Web Speech API: Listening...');
            this.updateUI('listening');
        };
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                console.log(`✅ Recognized: "${finalTranscript}"`);
                this.handleVoiceInput(finalTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('⚠️ Web Speech API error:', event.error);
            this.updateUI('error', `Error: ${event.error}`);
            
            // Fallback to Deepgram for offline support
            if (event.error === 'network') {
                this.recordWithFallback();
            }
        };
        
        this.recognition.onend = () => {
            console.log('🎤 Web Speech API: Stopped');
            this.isListening = false;
            this.updateUI('idle');
        };
    }
    
    /**
     * Start voice input using Web Speech API
     */
    startListening() {
        if (!this.recognition) {
            alert('Speech Recognition not supported in your browser.\nSupported: Chrome, Edge, Safari');
            return;
        }
        
        this.isListening = true;
        this.audioChunks = [];
        this.recognition.start();
    }
    
    /**
     * Stop voice input
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
    
    /**
     * Fallback: Record audio and use Deepgram API
     */
    async recordWithFallback() {
        try {
            console.log('📱 Fallback: Recording with Deepgram...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                await this.sendToDeepgram(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.updateUI('recording');
            
            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                }
            }, 10000);
            
        } catch (error) {
            console.error('❌ Microphone access denied:', error);
            this.updateUI('error', 'Microphone access required');
        }
    }
    
    /**
     * Send audio to Deepgram backend endpoint
     */
    async sendToDeepgram(audioBlob) {
        try {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const audioBase64 = e.target.result.split(',')[1];
                
                const response = await fetch('/api/stt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audioBuffer: audioBase64,
                        mimeType: 'audio/wav'
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.text) {
                    console.log(`✅ Deepgram: "${data.text}" (${(data.confidence * 100).toFixed(0)}%)`);
                    this.handleVoiceInput(data.text);
                } else {
                    this.updateUI('error', 'No speech detected');
                }
            };
            
            reader.readAsDataURL(audioBlob);
            
        } catch (error) {
            console.error('❌ Deepgram error:', error);
            this.updateUI('error', 'STT processing failed');
        }
    }
    
    /**
     * Handle recognized voice input
     */
    handleVoiceInput(text) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = text;
            this.updateUI('idle');
            
            // Auto-send if configured
            const autoSend = localStorage.getItem('voiceAutoSend') === 'true';
            if (autoSend) {
                const sendBtn = document.getElementById('sendBtn');
                if (sendBtn) sendBtn.click();
            }
        }
    }
    
    /**
     * Setup UI controls
     */
    setupUI() {
        // Add voice button to chat interface
        const chatContainer = document.querySelector('.chat-input-container');
        if (!chatContainer) return;
        
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'voiceInputBtn';
        voiceBtn.className = 'voice-input-btn';
        voiceBtn.innerHTML = '🎤';
        voiceBtn.title = 'Click to speak (uses free Web Speech API)';
        
        voiceBtn.onclick = (e) => {
            e.preventDefault();
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        };
        
        chatContainer.insertBefore(voiceBtn, chatContainer.firstChild);
        
        // Add status indicator
        const statusDiv = document.createElement('div');
        statusDiv.id = 'voiceStatus';
        statusDiv.className = 'voice-status';
        statusDiv.textContent = '🎤 Ready';
        chatContainer.appendChild(statusDiv);
        
        // Add settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'voice-settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Voice settings';
        settingsBtn.onclick = () => this.showSettings();
        chatContainer.appendChild(settingsBtn);
    }
    
    /**
     * Update UI status
     */
    updateUI(state, message = '') {
        const status = document.getElementById('voiceStatus');
        if (!status) return;
        
        const voiceBtn = document.getElementById('voiceInputBtn');
        
        switch (state) {
            case 'listening':
                status.textContent = '🎤 Listening... (Web Speech API)';
                status.style.color = '#4CAF50';
                if (voiceBtn) voiceBtn.style.opacity = '1';
                break;
            case 'recording':
                status.textContent = '🔴 Recording... (Deepgram)';
                status.style.color = '#FF5722';
                if (voiceBtn) voiceBtn.style.opacity = '1';
                break;
            case 'processing':
                status.textContent = '⏳ Processing...';
                status.style.color = '#2196F3';
                if (voiceBtn) voiceBtn.style.opacity = '0.5';
                break;
            case 'error':
                status.textContent = `❌ ${message}`;
                status.style.color = '#F44336';
                if (voiceBtn) voiceBtn.style.opacity = '0.5';
                break;
            case 'idle':
            default:
                status.textContent = '🎤 Ready';
                status.style.color = '#666';
                if (voiceBtn) voiceBtn.style.opacity = '0.7';
        }
    }
    
    /**
     * Show voice settings modal
     */
    showSettings() {
        const modal = document.createElement('div');
        modal.className = 'voice-settings-modal';
        modal.innerHTML = `
            <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3>🎤 Voice Settings</h3>
                <label>
                    <input type="checkbox" id="autoSend" ${localStorage.getItem('voiceAutoSend') === 'true' ? 'checked' : ''}>
                    Auto-send after speech recognition
                </label>
                <br><br>
                <p style="font-size: 12px; color: #666;">
                    <strong>Primary:</strong> Web Speech API (100% free, instant)<br>
                    <strong>Fallback:</strong> Deepgram (600 min/month free)<br>
                    <strong>Cost:</strong> $0/month forever!
                </p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const autoSendCheckbox = modal.querySelector('#autoSend');
        autoSendCheckbox.onchange = (e) => {
            localStorage.setItem('voiceAutoSend', e.target.checked);
        };
    }
}

// Initialize voice input when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.voiceInput = new VoiceInput();
    console.log('✅ Voice Input initialized (Web Speech API + Deepgram fallback)');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceInput;
}
