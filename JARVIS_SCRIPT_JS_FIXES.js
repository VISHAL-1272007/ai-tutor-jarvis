// ===== JARVIS Chat - Key Fixes for Real-Time Data & Error Handling =====
// These are the critical sections to update in script.js

// ===== 1. Ensure spinnerTimeout is declared globally (at top) =====
let spinnerTimeout; // Global: Prevents ReferenceError

// ===== 2. Update API endpoint to backend with Tavily support =====
const API_URL = 'https://aijarvis2025-jarvis1.hf.space/ask'; // Backend now handles Tavily search

// ===== 3. Fixed removeTypingIndicator function =====
function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-message');
    if (indicator) {
        indicator.remove();
    }
}

// ===== 4. Fixed showTypingIndicator function =====
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message ai typing-message';
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    elements.messagesArea.appendChild(indicator);
    scrollToBottom();
}

// ===== 5. CRITICAL: Fixed sendMessage error handling =====
async function sendMessage() {
    console.log('🚀 sendMessage called');
    const question = elements.messageInput.value.trim();
    
    // Clear previous spinner timeout
    if (spinnerTimeout) {
        clearTimeout(spinnerTimeout);
    }
    
    if (!question || isTyping) {
        return;
    }
    
    // Hide welcome screen
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'none';
    }
    
    // Show spinner and set timeout for "error" message (60 seconds max)
    showTypingIndicator();
    isTyping = true;
    elements.sendBtn.disabled = true;
    
    // If no response in 60 seconds, show error
    spinnerTimeout = setTimeout(() => {
        removeTypingIndicator();
        addMessageWithTypingEffect("❌ Request timed out. Please try again.", 'ai');
        isTyping = false;
        elements.sendBtn.disabled = false;
    }, 60000); // 60 second timeout
    
    // Clear input
    elements.messageInput.value = '';
    autoResizeTextarea();
    
    try {
        // Send to backend (which now includes Tavily search)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: question }),
            signal: AbortSignal.timeout(60000) // Timeout after 60 seconds
        });
        
        // IMPORTANT: Clear spinner timeout as soon as response arrives
        if (spinnerTimeout) {
            clearTimeout(spinnerTimeout);
            spinnerTimeout = null;
        }
        
        // Remove spinner
        removeTypingIndicator();
        
        // Parse response
        const data = await response.json();
        
        console.log('[JARVIS Response]', data);
        
        // ===== Display Response =====
        if (data.success && data.answer) {
            // Main answer
            await addMessageWithTypingEffect(data.answer, 'ai');
            
            // Display sources if available (from Tavily search)
            if (data.sources && data.sources.length > 0) {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.className = 'message ai sources-section';
                
                let sourcesHTML = '<div class="sources-header">📚 <strong>Sources:</strong></div>';
                data.sources.forEach((source, idx) => {
                    sourcesHTML += `
                        <div class="source-item">
                            <a href="${source.url}" target="_blank" rel="noopener">
                                [${idx + 1}] ${source.title}
                            </a>
                            <p class="source-snippet">${source.snippet || ''}</p>
                        </div>
                    `;
                });
                
                sourcesDiv.innerHTML = sourcesHTML;
                elements.messagesArea.appendChild(sourcesDiv);
                scrollToBottom();
            }
            
            // Speak the response if voice enabled
            if (typeof speak === 'function' && isVoiceEnabled) {
                speak(data.answer);
            }
            
            console.log(`✅ Response displayed successfully from ${data.engine}`);
            
        } else if (!data.success) {
            // Handle error response from API
            const errorMsg = data.answer || "❌ An error occurred. Please try again.";
            await addMessageWithTypingEffect(errorMsg, 'ai');
            console.error('JARVIS Error:', errorMsg);
        }
        
        // Add user message to chat history
        currentChatMessages.push({ 
            role: 'user', 
            content: question 
        });
        currentChatMessages.push({ 
            role: 'ai', 
            content: data.answer || "Error"
        });
        
        // Save to Firebase
        await saveChatToFirebase();
        
    } catch (error) {
        // Network or parsing error
        console.error('❌ Error sending message:', error);
        
        // Clear timeout if still pending
        if (spinnerTimeout) {
            clearTimeout(spinnerTimeout);
            spinnerTimeout = null;
        }
        
        removeTypingIndicator();
        
        // Show error to user
        const errorMsg = error.name === 'AbortError' 
            ? "❌ Request timed out. Please try again."
            : `❌ Error: ${error.message}`;
            
        await addMessageWithTypingEffect(errorMsg, 'ai');
        
    } finally {
        // Ensure UI is reset
        isTyping = false;
        elements.sendBtn.disabled = false;
    }
}

// ===== 6. Remove ALL NewsAPI calls =====
// COMMENT OUT or REMOVE any fetch calls to:
// - https://newsapi.org
// - https://rss2json.com  
// - Any other external news/data APIs

// ❌ EXAMPLE OF WHAT TO REMOVE (comment out):
// ----
// async function fetchNewsFromNewsAPI() {
//     try {
//         const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`);
//         const data = await response.json();
//         // ...
//     } catch (error) {
//         console.error('NewsAPI error:', error);
//     }
// }
// ----

// ✅ INSTEAD, all news comes from backend:
// The backend now handles ALL external API calls via Tavily
// Frontend just sends queries and receives results

// ===== 7. Updated addMessageWithTypingEffect =====
async function addMessageWithTypingEffect(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (role === 'ai') {
        messageDiv.className += ' jarvis-message';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Handle markdown formatting
    if (window.markdownify) {
        contentDiv.innerHTML = window.markdownify(text);
    } else {
        contentDiv.textContent = text;
    }
    
    messageDiv.appendChild(contentDiv);
    elements.messagesArea.appendChild(messageDiv);
    
    scrollToBottom();
    return messageDiv;
}

// ===== 8. Global error handler for unhandled promise rejections =====
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Clear spinner if it's hanging
    if (spinnerTimeout) {
        clearTimeout(spinnerTimeout);
        spinnerTimeout = null;
    }
    
    removeTypingIndicator();
    
    if (isTyping) {
        isTyping = false;
        elements.sendBtn.disabled = false;
        addMessageWithTypingEffect("❌ An unexpected error occurred. Please try again.", 'ai');
    }
});

// ===== End of Critical Fixes =====
// Copy these sections into your frontend/script.js
// Ensure all NewsAPI/RSS2JSON calls are commented out or removed
