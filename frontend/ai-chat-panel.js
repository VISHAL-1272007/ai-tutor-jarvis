// ============================================
// AI CHAT PANEL - SMART ASSISTANT
// JARVIS Learning Platform
// ============================================

import { getBackendURL } from './config.js';

const BACKEND_URL = getBackendURL();

// ============================================
// CHAT STATE MANAGEMENT
// ============================================

class ChatManager {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.currentStreamingMessage = null;
        this.messageCount = 0;
        this.conversationId = this.generateConversationId();
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadChatHistory();
    }

    initializeElements() {
        this.chatHistory = document.getElementById('chatHistory');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.messageCountEl = document.getElementById('messageCount');
        this.attachBtn = document.getElementById('attachBtn');
    }

    generateConversationId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    attachEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());

        // Send message on Enter (Shift+Enter for new line)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => this.autoResizeTextarea());

        // Clear chat
        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        // Attach file (placeholder)
        this.attachBtn.addEventListener('click', () => this.handleAttachment());

        // Hint items click
        document.querySelectorAll('.hint-item').forEach(hint => {
            hint.addEventListener('click', () => {
                const text = hint.textContent.replace('Try: ', '').replace(/[📝💡🔧]/g, '').trim();
                this.chatInput.value = text;
                this.chatInput.focus();
            });
        });
    }

    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================

    async handleSendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.autoResizeTextarea();

        // Show typing indicator
        this.showTyping();

        try {
            // Send to AI API
            await this.sendToAI(message);
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();
            this.addMessage('ai', '❌ Sorry, I encountered an error. Please try again.');
        }
    }

    async sendToAI(message) {
        try {
            // Option 1: Use existing backend /ask endpoint
            const response = await fetch(`${BACKEND_URL}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    context: this.getConversationContext()
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Check if streaming is supported
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('text/event-stream')) {
                // Handle streaming response
                await this.handleStreamingResponse(response);
            } else {
                // Handle regular JSON response
                const data = await response.json();
                this.hideTyping();
                const sources = this.normalizeSourcesFromResponse(data);
                this.addMessage('ai', data.answer || data.response || 'No response from AI', sources);
            }

        } catch (error) {
            console.error('AI API Error:', error);
            
            // Fallback: Simulate AI response
            await this.simulateAIResponse(message);
        }
    }

    async handleStreamingResponse(response) {
        this.hideTyping();
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Create message bubble for streaming
        const messageEl = this.createStreamingMessage();
        let accumulatedText = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;
                
                // Update the streaming message
                this.updateStreamingMessage(messageEl, accumulatedText);
                
                // Small delay for visual effect
                await new Promise(resolve => setTimeout(resolve, 20));
            }
            
            // Finalize the message
            this.finalizeStreamingMessage(messageEl, accumulatedText);
            
        } catch (error) {
            console.error('Streaming error:', error);
            this.updateStreamingMessage(messageEl, accumulatedText + '\n\n❌ Connection interrupted');
        }
    }

    createStreamingMessage() {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message ai-message';
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p><span class="streaming-cursor"></span></p>
                </div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
        this.chatHistory.appendChild(messageEl);
        this.scrollToBottom();
        return messageEl;
    }

    updateStreamingMessage(messageEl, text) {
        const bubble = messageEl.querySelector('.message-bubble p');
        bubble.innerHTML = this.formatMessage(text) + '<span class="streaming-cursor"></span>';
        this.scrollToBottom();
    }

    finalizeStreamingMessage(messageEl, text) {
        const bubble = messageEl.querySelector('.message-bubble p');
        bubble.innerHTML = this.formatMessage(text);
        
        this.messages.push({
            role: 'ai',
            content: text,
            sources: [],
            timestamp: Date.now()
        });
        
        this.updateStats();
        this.saveChatHistory();
    }

    async simulateAIResponse(userMessage) {
        this.hideTyping();
        
        // Simulate streaming with a smart response
        const responses = {
            'hello': 'Hello! I\'m JARVIS, your AI assistant. I can help you with coding, debugging, learning, and more. What would you like to know?',
            'help': 'I can assist you with:\n\n🔧 **Code Debugging** - Find and fix errors\n💡 **Explanations** - Understand concepts\n📝 **Code Generation** - Create code snippets\n📚 **Learning** - Answer questions\n\nJust ask me anything!',
            'code': 'I can help you with code! Please share:\n\n1. The programming language\n2. What you want to build\n3. Any specific requirements\n\nI\'ll generate or debug the code for you.',
            'default': `Based on your question about "${userMessage}", here's my answer:\n\nI'm providing insight into this topic right now. If you need more specific information, tell me exactly what aspect interests you and I'll dive deeper!`
        };

        const lowerMessage = userMessage.toLowerCase();
        let response = responses.default;
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key) && key !== 'default') {
                response = value;
                break;
            }
        }

        // Simulate streaming effect
        await this.streamResponse(response);
    }

    async streamResponse(text) {
        const messageEl = this.createStreamingMessage();
        const words = text.split(' ');
        let accumulatedText = '';

        for (let i = 0; i < words.length; i++) {
            accumulatedText += (i > 0 ? ' ' : '') + words[i];
            this.updateStreamingMessage(messageEl, accumulatedText);
            await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 30));
        }

        this.finalizeStreamingMessage(messageEl, accumulatedText);
    }

    // ============================================
    // MESSAGE DISPLAY
    // ============================================

    addMessage(role, content, sources = []) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${role}-message`;
        
        const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
        const safeSources = this.sanitizeSources(sources);
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessage(content)}
                </div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;

        const messageContent = messageEl.querySelector('.message-content');
        const timeEl = messageContent.querySelector('.message-time');

        if (role === 'ai') {
            const sourcesEl = this.createSourcesElement(safeSources);
            if (sourcesEl) {
                messageContent.insertBefore(sourcesEl, timeEl);
            }
        }

        this.chatHistory.appendChild(messageEl);
        this.scrollToBottom();

        this.messages.push({
            role,
            content,
            sources: safeSources,
            timestamp: Date.now()
        });

        this.updateStats();
        this.saveChatHistory();
    }

    formatMessage(content) {
        // Convert markdown-style formatting
        let formatted = content
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return `<p>${formatted}</p>`;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    getConversationContext() {
        // Get last 5 messages for context
        return this.messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
        }));
    }

    normalizeSourcesFromResponse(data) {
        if (!data) return [];

        const directSources = this.sanitizeSources(data.sources);
        if (directSources.length > 0) return directSources;

        const searchResultsSources = this.sanitizeSources(data.searchResults?.results || data.searchResults?.sources);
        if (searchResultsSources.length > 0) return searchResultsSources;

        return [];
    }

    sanitizeSources(sources) {
        if (!Array.isArray(sources)) return [];
        return sources
            .map(src => {
                const url = src?.url || src?.link;
                if (!url) return null;
                return {
                    title: src.title || src.heading || src.url || 'Source',
                    url,
                    snippet: src.snippet || src.description || src.content || ''
                };
            })
            .filter(Boolean);
    }

    createSourcesElement(sources) {
        if (!Array.isArray(sources) || sources.length === 0) return null;

        const container = document.createElement('div');
        container.className = 'sources-section';

        const title = document.createElement('div');
        title.className = 'sources-title';
        title.innerHTML = '<span class="sources-dot"></span><span>Sources</span>';
        container.appendChild(title);

        const chips = document.createElement('div');
        chips.className = 'source-chips';

        sources.forEach((source) => {
            const normalizedUrl = this.normalizeUrl(source.url);
            const domain = this.extractDomain(normalizedUrl);

            if (!normalizedUrl || !domain) return;

            const chip = document.createElement('a');
            chip.className = 'source-chip';
            chip.href = normalizedUrl;
            chip.target = '_blank';
            chip.rel = 'noopener noreferrer';

            const favicon = document.createElement('img');
            favicon.className = 'source-favicon';
            favicon.src = this.getFaviconUrl(domain);
            favicon.alt = `${domain} icon`;
            favicon.onerror = () => { favicon.style.opacity = '0'; };

            const label = document.createElement('span');
            label.className = 'source-domain';
            label.textContent = domain;

            chip.appendChild(favicon);
            chip.appendChild(label);
            chips.appendChild(chip);
        });

        if (chips.childElementCount === 0) return null;

        container.appendChild(chips);
        return container;
    }

    normalizeUrl(url) {
        if (!url) return '';
        try {
            return new URL(url).toString();
        } catch (error) {
            try {
                return new URL(`https://${url}`).toString();
            } catch (err) {
                return '';
            }
        }
    }

    extractDomain(url) {
        if (!url) return '';
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace(/^www\./, '');
        } catch (error) {
            return '';
        }
    }

    getFaviconUrl(domain) {
        if (!domain) return '';
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    }

    // ============================================
    // UI HELPERS
    // ============================================

    showTyping() {
        this.isTyping = true;
        this.typingIndicator.classList.remove('hidden');
        this.sendBtn.disabled = true;
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.classList.add('hidden');
        this.sendBtn.disabled = false;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
        }, 100);
    }

    updateStats() {
        this.messageCount = this.messages.length;
        this.messageCountEl.textContent = this.messageCount;
    }

    // ============================================
    // STORAGE
    // ============================================

    saveChatHistory() {
        try {
            const chatData = {
                conversationId: this.conversationId,
                messages: this.messages,
                lastUpdated: Date.now()
            };
            localStorage.setItem('jarvis_chat_history', JSON.stringify(chatData));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('jarvis_chat_history');
            if (saved) {
                const chatData = JSON.parse(saved);
                
                // Load messages if less than 24 hours old
                const dayInMs = 24 * 60 * 60 * 1000;
                if (Date.now() - chatData.lastUpdated < dayInMs) {
                    this.messages = chatData.messages;
                    this.conversationId = chatData.conversationId;
                    
                    // Render saved messages
                    chatData.messages.forEach(msg => {
                        if (msg.role !== 'ai' || msg.content !== 'Welcome message') {
                            this.addMessageToHistory(msg.role, msg.content, msg.timestamp, msg.sources || []);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    addMessageToHistory(role, content, timestamp, sources = []) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${role}-message`;
        
        const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
        const safeSources = this.sanitizeSources(sources);
        const time = new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessage(content)}
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;

        const messageContent = messageEl.querySelector('.message-content');
        const timeEl = messageContent.querySelector('.message-time');

        if (role === 'ai') {
            const sourcesEl = this.createSourcesElement(safeSources);
            if (sourcesEl) {
                messageContent.insertBefore(sourcesEl, timeEl);
            }
        }

        this.chatHistory.appendChild(messageEl);
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.messages = [];
            this.chatHistory.innerHTML = `
                <div class="chat-message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>👋 Hello! I'm JARVIS, your AI coding assistant. How can I help you today?</p>
                        </div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
            `;
            this.conversationId = this.generateConversationId();
            this.updateStats();
            localStorage.removeItem('jarvis_chat_history');
        }
    }

    handleAttachment() {
        alert('📎 File attachment feature coming soon!\n\nYou\'ll be able to attach:\n• Code files\n• Screenshots\n• Documents');
    }
}

// ============================================
// INITIALIZE CHAT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
    console.log('✅ AI Chat Panel initialized');
});

// ============================================
// EXPORT FOR INTEGRATION
// ============================================

export { ChatManager };

// PLACEHOLDER: OpenAI Integration
// Uncomment and configure when ready to use OpenAI
/*
async function sendToOpenAI(message, conversationHistory) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are JARVIS, a helpful AI coding assistant.'
                },
                ...conversationHistory,
                {
                    role: 'user',
                    content: message
                }
            ],
            stream: true
        })
    });
    
    return response;
}
*/
