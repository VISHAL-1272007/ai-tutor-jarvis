/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                         AI TOOLS PAGE - JAVASCRIPT                            ║
║                    JARVIS Learning Platform Frontend                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 SETUP INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ BACKEND URL CONFIGURATION:
   - Update the BACKEND_URL constant below with your deployed backend URL
   - Current: https://ai-tutor-jarvis.onrender.com
   - For local testing: http://localhost:3000

2️⃣ FIREBASE DEPLOYMENT:
   Step 1: Ensure Firebase CLI is installed
           npm install -g firebase-tools
   
   Step 2: Login to Firebase
           firebase login
   
   Step 3: Deploy from your project root
           firebase deploy --only hosting
   
   Step 4: Your site will be live at:
           https://YOUR-PROJECT.web.app

3️⃣ LOCAL TESTING:
   Step 1: Start your backend server first
           cd backend
           node index.js
   
   Step 2: Open ai-tools.html in browser
           - Use Live Server extension in VS Code, or
           - Open directly: file:///path/to/ai-tools.html
   
   Step 3: Test each feature:
           ✓ AI Explainer
           ✓ Image Generator
           ✓ Quiz Generator
           ✓ Video Generator

4️⃣ TROUBLESHOOTING:
   - CORS errors? Ensure backend has CORS enabled
   - 404 errors? Check BACKEND_URL is correct
   - No response? Check browser console for errors
   - Backend down? Verify Render deployment status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// ============================================================================
// CONFIGURATION
// ============================================================================

import { getBackendURL } from './config.js';

const BACKEND_URL = getBackendURL();

// ============================================================================
// DOM ELEMENTS
// ============================================================================

// AI Explainer
const explainerInput = document.getElementById('explainerInput');
const explainBtn = document.getElementById('explainBtn');
const explainerOutput = document.getElementById('explainerOutput');

// AI Image Generator
const imageInput = document.getElementById('imageInput');
const generateBtn = document.getElementById('generateBtn');
const imageOutput = document.getElementById('imageOutput');

// AI Quiz Generator
const quizInput = document.getElementById('quizInput');
const quizBtn = document.getElementById('quizBtn');
const quizOutput = document.getElementById('quizOutput');

// AI Video Generator
const videoInput = document.getElementById('videoInput');
const videoBtn = document.getElementById('videoBtn');
const videoOutput = document.getElementById('videoOutput');

// Daily Training Center
const trainingInput = document.getElementById('trainingInput');
const trainBtn = document.getElementById('trainBtn');
const trainingOutput = document.getElementById('trainingOutput');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Shows loading state on button
 * @param {HTMLButtonElement} button - The button element
 */
function showButtonLoading(button) {
    if (!button) return;
    button.disabled = true;
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'flex';
}

/**
 * Hides loading state on button
 * @param {HTMLButtonElement} button - The button element
 */
function hideButtonLoading(button) {
    if (!button) return;
    button.disabled = false;
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
}

/**
 * Displays error message in output area
 * @param {HTMLElement} outputElement - The output container
 * @param {string} message - Error message to display
 */
function showError(outputElement, message) {
    if (!outputElement) return;
    outputElement.innerHTML = `
        <div class="error-message">
            <strong>⚠️ Error:</strong> ${message}
        </div>
    `;
}

/**
 * Auto-scrolls element to bottom
 * @param {HTMLElement} element - Element to scroll
 */
function scrollToBottom(element) {
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}

// ============================================================================
// AI EXPLAINER FEATURE
// ============================================================================

/**
 * Handles AI explanation requests
 * Sends question to backend and displays response in chat-style bubbles
 */
async function handleExplainer() {
    const question = explainerInput.value.trim();

    // Validate input
    if (!question) {
        showError(explainerOutput, 'Please enter a question or topic.');
        return;
    }

    // Show loading state
    showButtonLoading(explainBtn);
    explainerOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Generating explanation...</p></div>';

    try {
        // Use the working /ask endpoint instead of /explain
        const response = await fetch(`${BACKEND_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question,
                systemPrompt: `You are an expert educator. Explain the following concept in simple, clear terms that a student can easily understand.

Provide:
1. Simple definition (1-2 sentences)
2. Key points (3-5 bullet points)
3. Real-world example or analogy
4. Common misconceptions (if any)

Use clear language, avoid jargon, and make it engaging with emojis!`
            })
        });

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Display response with markdown formatting
        if (data.answer) {
            explainerOutput.innerHTML = `
                <div class="chat-bubble">
                    <div class="concept-title">💡 ${question}</div>
                    ${formatResponse(data.answer)}
                    <div class="provider-badge">Powered by AI</div>
                </div>
            `;
        } else {
            throw new Error('Failed to generate explanation');
        }

        // Auto-scroll to bottom
        scrollToBottom(explainerOutput);

        // Clear input
        explainerInput.value = '';

    } catch (error) {
        console.error('Explainer error:', error);
        showError(explainerOutput, `Failed to get explanation. ${error.message}`);
    } finally {
        // Hide loading state
        hideButtonLoading(explainBtn);
    }
}

/**
 * Formats response text (preserves line breaks, converts markdown-like syntax)
 * @param {string} text - Raw text to format
 * @returns {string} Formatted HTML
 */
function formatResponse(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

// ============================================================================
// AI IMAGE GENERATOR FEATURE
// ============================================================================

/**
 * Handles AI image generation requests
 * Sends description to backend and displays generated image
 */
async function handleImageGenerator() {
    const description = imageInput.value.trim();

    // Validate input
    if (!description) {
        showError(imageOutput, 'Please enter an image description.');
        return;
    }

    // Show loading state
    showButtonLoading(generateBtn);
    imageOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>🎨 Generating image with AI...</p></div>';

    try {
        const seed = Date.now();

        // Use backend API to generate image with Hugging Face
        const backendUrl = getBackendURL();

        const response = await fetch(`${backendUrl}/generate-simple-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: description })
        });

        const data = await response.json();

        if (data.success && data.imageUrl) {
            console.log('✅ Image generated successfully');

            imageOutput.innerHTML = `
                <div class="image-container">
                    <img src="${data.imageUrl}" 
                         alt="${description}" 
                         class="generated-image"
                         crossorigin="anonymous">
                    <div class="image-info">
                        <p><strong>Prompt:</strong> ${description}</p>
                        <p><strong>Provider:</strong> ${data.provider || 'AI Image Generator'}</p>
                    </div>
                    <button onclick="window.downloadImageFromUrl('${data.imageUrl}', 'jarvis-${seed}.png')" class="download-btn">
                        📥 Download Image
                    </button>
                </div>
            `;
        } else {
            throw new Error(data.error || 'Failed to generate image');
        }

        // Clear input
        imageInput.value = '';

    } catch (error) {
        console.error('Image generation error:', error);
        showError(imageOutput, `Failed to generate image. ${error.message}`);
    } finally {
        hideButtonLoading(generateBtn);
    }
}

// ============================================================================
// AI QUIZ GENERATOR FEATURE
// ============================================================================

/**
 * Handles AI quiz generation requests
 * Requests quiz questions from backend and displays them with show/hide answers
 */
async function handleQuizGenerator() {
    const topic = quizInput.value.trim();

    // Validate input
    if (!topic) {
        showError(quizOutput, 'Please enter a topic for the quiz.');
        return;
    }

    // Show loading state
    showButtonLoading(quizBtn);
    quizOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Generating quiz questions...</p></div>';

    try {
        // Create quiz prompt
        const quizPrompt = `Create a 5-question multiple choice quiz on: ${topic}. 
Format each question as:
Q1: [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Answer: [Correct answer with brief explanation]

Make the questions educational and challenging.`;

        // Send request to backend
        const response = await fetch(`${BACKEND_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: quizPrompt,
                history: []
            })
        });

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Parse and display quiz
        displayQuiz(data.answer, topic);

        // Clear input
        quizInput.value = '';

    } catch (error) {
        console.error('Quiz generation error:', error);
        showError(quizOutput, `Failed to generate quiz. ${error.message}`);
    } finally {
        // Hide loading state
        hideButtonLoading(quizBtn);
    }
}

/**
 * Parses quiz text and displays in formatted boxes
 * @param {string} quizText - Raw quiz text from AI
 * @param {string} topic - Quiz topic
 */
function displayQuiz(quizText, topic) {
    const questions = parseQuizText(quizText);

    let html = `<div class="quiz-container">`;
    html += `<h3 style="color: #667eea; margin-bottom: 20px;">📚 Quiz: ${topic}</h3>`;

    questions.forEach((q, index) => {
        html += `
            <div class="quiz-question">
                <h3>Question ${index + 1}</h3>
                <p>${q.question}</p>
                ${q.options ? q.options.map(opt => `<p>• ${opt}</p>`).join('') : ''}
                <button class="show-answer-btn" onclick="toggleAnswer(${index})">
                    Show Answer
                </button>
                <div class="quiz-answer" id="answer-${index}">
                    <strong>Answer:</strong> ${q.answer}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    quizOutput.innerHTML = html;
}

/**
 * Parses quiz text into structured format
 * @param {string} text - Raw quiz text
 * @returns {Array} Array of question objects
 */
function parseQuizText(text) {
    const questions = [];
    const lines = text.split('\n').filter(line => line.trim());

    let currentQuestion = null;
    let options = [];

    for (let line of lines) {
        line = line.trim();

        // Match question pattern (Q1:, Q2:, etc.)
        if (/^Q\d+[:.]/i.test(line)) {
            if (currentQuestion) {
                currentQuestion.options = options;
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question: line.replace(/^Q\d+[:.]?\s*/i, ''),
                options: [],
                answer: ''
            };
            options = [];
        }
        // Match options (A), B), C), D))
        else if (/^[A-D][):.]/i.test(line) && currentQuestion) {
            options.push(line);
        }
        // Match answer
        else if (/^Answer:/i.test(line) && currentQuestion) {
            currentQuestion.answer = line.replace(/^Answer:\s*/i, '');
        }
    }

    // Add last question
    if (currentQuestion) {
        currentQuestion.options = options;
        questions.push(currentQuestion);
    }

    return questions;
}

/**
 * Toggles visibility of quiz answer
 * @param {number} index - Question index
 */
function toggleAnswer(index) {
    const answer = document.getElementById(`answer-${index}`);
    const button = event.target;

    if (answer && answer.classList.contains('show')) {
        answer.classList.remove('show');
        button.textContent = 'Show Answer';
    } else if (answer) {
        answer.classList.add('show');
        button.textContent = 'Hide Answer';
    }
}

// ============================================================================
// AI VIDEO GENERATOR FEATURE
// ============================================================================

/**
 * Handles AI video generation requests
 * Sends topic to backend and displays video player
 */
async function handleVideoGenerator() {
    const topic = videoInput.value.trim();

    // Validate input
    if (!topic) {
        showError(videoOutput, 'Please enter a topic for the video.');
        return;
    }

    // Show loading state
    showButtonLoading(videoBtn);
    videoOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Searching YouTube for educational videos...</p></div>';

    try {
        // Send request to NEW /search-videos endpoint
        const response = await fetch(`${BACKEND_URL}/search-videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: topic,
                maxResults: 3
            })
        });

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Display videos
        if (data.success && data.videos && data.videos.length > 0) {
            let videosHtml = '<div class="videos-grid">';

            data.videos.forEach((video, index) => {
                videosHtml += `
                    <div class="video-card">
                        <div class="video-embed">
                            <iframe 
                                src="${video.embedUrl}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                        <div class="video-info">
                            <h3>${video.title}</h3>
                            <p class="channel-name">📺 ${video.channelTitle}</p>
                            <p class="video-description">${video.description.substring(0, 150)}...</p>
                            <a href="${video.watchUrl}" target="_blank" class="watch-btn">Watch on YouTube</a>
                        </div>
                    </div>
                `;
            });

            videosHtml += '</div>';
            videoOutput.innerHTML = videosHtml;
        } else if (data.videos && data.videos.length === 0) {
            videoOutput.innerHTML = `
                <div class="warning-message">
                    <p>😕 No videos found for "${topic}". Try a different search term.</p>
                </div>
            `;
        } else {
            throw new Error('No videos received from server');
        }

        // Clear input
        videoInput.value = '';

    } catch (error) {
        console.error('Video search error:', error);
        showError(videoOutput, `Failed to search videos. ${error.message}`);
    } finally {
        // Hide loading state
        hideButtonLoading(videoBtn);
    }
}

/**
 * Handles Daily Training requests
 * Sends information to backend to update Jarvis's knowledge
 */
async function handleDailyTraining() {
    const content = trainingInput.value.trim();

    if (!content) {
        showError(trainingOutput, 'Please enter some information to train JARVIS.');
        return;
    }

    showButtonLoading(trainBtn);
    trainingOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>🧠 Training JARVIS with new information...</p></div>';

    try {
        const response = await fetch(`${BACKEND_URL}/api/update-knowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            trainingOutput.innerHTML = `
                <div class="success-message">
                    <p>✅ <strong>Success!</strong> JARVIS has been trained with the new information.</p>
                    <p class="info-text">You can now ask JARVIS about this in the chat.</p>
                </div>
            `;
            trainingInput.value = '';
        } else {
            throw new Error(data.error || 'Failed to update knowledge');
        }
    } catch (error) {
        console.error('Training error:', error);
        showError(trainingOutput, `Failed to train JARVIS. ${error.message}`);
    } finally {
        hideButtonLoading(trainBtn);
    }
}

// ============================================================================
// UTILITY FUNCTIONS FOR NEW FEATURES
// ============================================================================

/**
 * Downloads base64 image
 * @param {string} dataUrl - Base64 data URL
 * @param {string} filename - Download filename
 */
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Downloads image from URL
 * @param {string} imageUrl - Image URL
 * @param {string} filename - Download filename
 */
async function downloadImageFromUrl(imageUrl, filename) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ Image downloaded:', filename);
    } catch (error) {
        console.error('❌ Download failed:', error);
        alert('Failed to download image. Please right-click the image and save manually.');
    }
}

// Make functions globally accessible
window.downloadImage = downloadImage;
window.downloadImageFromUrl = downloadImageFromUrl;

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Make functions globally accessible
window.downloadImage = downloadImage;
window.downloadImageFromUrl = downloadImageFromUrl;

// ============================================================================
// AI PROJECT GENERATOR
// ============================================================================

/**
 * Handles AI Project Generation
 */
async function handleProjectGenerator() {
    const projectInput = document.getElementById('projectInput');
    const projectBtn = document.getElementById('projectBtn');
    const projectOutput = document.getElementById('projectOutput');
    const projectLanguage = document.getElementById('projectLanguage');
    const projectType = document.getElementById('projectType');

    const description = projectInput.value.trim();
    const language = projectLanguage.value;
    const type = projectType.value;

    if (!description) {
        showError(projectOutput, 'Please describe your project');
        return;
    }

    // Show loading state
    showButtonLoading(projectBtn);
    projectOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>🚀 Generating your project...</p></div>';

    try {
        const backendUrl = getBackendURL();

        // Build prompt with options
        let prompt = `Create a complete project for: ${description}\n\n`;
        if (language) prompt += `Programming Language: ${language}\n`;
        if (type) prompt += `Project Type: ${type}\n`;
        prompt += `\nGenerate complete code with proper file structure. For each file, provide:
1. Filename with extension
2. Complete working code
3. Comments explaining key parts

Format the response as:
FILE: filename.ext
\`\`\`language
[code here]
\`\`\`

FILE: another-file.ext
\`\`\`language
[code here]
\`\`\``;

        const response = await fetch(`${backendUrl}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: prompt,
                systemPrompt: 'You are an expert software developer. Generate complete, production-ready code with proper file structure, comments, and best practices.'
            })
        });

        const data = await response.json();

        if (data.success && data.response) {
            displayProjectOutput(data.response, description, language, type);
        } else {
            throw new Error(data.error || 'Failed to generate project');
        }

        // Clear input
        projectInput.value = '';

    } catch (error) {
        console.error('Project generation error:', error);
        showError(projectOutput, `Failed to generate project. ${error.message}`);
    } finally {
        hideButtonLoading(projectBtn);
    }
}

/**
 * Display generated project with file structure
 */
function displayProjectOutput(response, description, language, type) {
    const projectOutput = document.getElementById('projectOutput');

    console.log('📦 Raw AI Response:', response);

    // Parse files from response
    const files = parseProjectFiles(response);

    console.log('📁 Parsed Files:', files);

    if (files.length === 0) {
        // If parsing failed, show the raw response with basic formatting
        projectOutput.innerHTML = `
            <div class="project-container">
                <div class="project-header">
                    <h3>🚀 Project Generated</h3>
                    <p>${description}</p>
                </div>
                <div class="setup-instructions">
                    <div class="setup-header">
                        <div class="setup-title">
                            <i class="fas fa-info-circle"></i>
                            <h4>📋 Generated Code</h4>
                        </div>
                    </div>
                    <div class="setup-content expanded">
                        <div class="setup-steps">
                            <pre class="code-block">${escapeHtml(response)}</pre>
                        </div>
                    </div>
                </div>
                <div class="project-info">
                    <div class="info-item">
                        <span class="info-label">⚠️ Note</span>
                        <span class="info-value">Could not parse files automatically. Copy code above.</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Generate setup instructions
    const setupInstructions = generateSetupInstructions(files, language, type);

    let html = `
        <div class="project-container">
            <div class="project-header">
                <h3>🚀 Project Generated Successfully</h3>
                <p>${description}</p>
            </div>

            <!-- Setup Instructions -->
            <div class="setup-instructions">
                <div class="setup-header" onclick="toggleSetupInstructions()">
                    <div class="setup-title">
                        <i class="fas fa-terminal"></i>
                        <h4>📋 Setup Instructions</h4>
                    </div>
                    <i class="fas fa-chevron-down" id="setup-icon"></i>
                </div>
                <div class="setup-content" id="setup-content">
                    ${setupInstructions}
                </div>
            </div>

            <!-- Full Code Output -->
            <div class="full-code-output">
                <div class="code-output-header" onclick="toggleFullCode()">
                    <div class="code-output-title">
                        <i class="fas fa-code"></i>
                        <h4>💻 Full Code Output</h4>
                        <span class="file-count">${files.length} files</span>
                    </div>
                    <i class="fas fa-chevron-down" id="fullcode-icon"></i>
                </div>
                <div class="code-output-content expanded" id="fullcode-content">
                    <div class="code-output-actions">
                        <button class="copy-all-btn" onclick="copyAllCode()">
                            <i class="fas fa-copy"></i> Copy All Code
                        </button>
                        <button class="expand-all-btn" onclick="expandAllFiles()">
                            <i class="fas fa-expand"></i> Expand All
                        </button>
                        <button class="collapse-all-btn" onclick="collapseAllFiles()">
                            <i class="fas fa-compress"></i> Collapse All
                        </button>
                    </div>
    `;

    files.forEach((file, index) => {
        const fileExt = file.name.split('.').pop();
        const icon = getFileIcon(fileExt);
        const lineCount = file.content.split('\n').length;

        html += `
            <div class="file-item">
                <div class="file-header" onclick="toggleFileContent(${index})">
                    <div class="file-name">
                        <span class="file-icon ${fileExt}">${icon}</span>
                        <span>${file.name}</span>
                        <span class="line-count">${lineCount} lines</span>
                    </div>
                    <div class="file-actions" onclick="event.stopPropagation()">
                        <button class="copy-btn" onclick="copyFileCode(${index}, this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <i class="fas fa-chevron-down file-toggle-icon" id="icon-${index}"></i>
                    </div>
                </div>
                <div class="file-content expanded" id="file-${index}">
                    <pre class="code-block" id="code-${index}">${escapeHtml(file.content)}</pre>
                </div>
            </div>
        `;
    });

    html += `
                </div>
            </div>

            <!-- Project Info -->
            <div class="project-info">
                <div class="info-item">
                    <span class="info-label">📁 Files Generated</span>
                    <span class="info-value">${files.length}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">💻 Language</span>
                    <span class="info-value">${language || 'Multiple'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🎯 Project Type</span>
                    <span class="info-value">${type || 'General'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📊 Total Lines</span>
                    <span class="info-value">${files.reduce((sum, f) => sum + f.content.split('\n').length, 0)}</span>
                </div>
            </div>

            <button class="download-all-btn" onclick="downloadAllFiles()">
                <i class="fas fa-download"></i>
                Download All Files
            </button>
        </div>
    `;

    projectOutput.innerHTML = html;

    // Store files globally for download
    window.generatedFiles = files;

    // Auto-expand setup instructions after a short delay
    setTimeout(() => {
        const setupContent = document.getElementById('setup-content');
        const setupIcon = document.getElementById('setup-icon');
        if (setupContent && setupIcon) {
            setupContent.classList.add('expanded');
            setupIcon.className = 'fas fa-chevron-up';
        }
    }, 100);
}

/**
 * Parse project files from AI response
 */
function parseProjectFiles(response) {
    const files = [];

    // Method 1: Match FILE: filename pattern followed by code block
    const filePattern1 = /FILE:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/gi;
    let match;

    while ((match = filePattern1.exec(response)) !== null) {
        files.push({
            name: match[1].trim(),
            language: match[2] || 'text',
            content: match[3].trim()
        });
    }

    // Method 2: Match ### filename or ## filename followed by code block
    if (files.length === 0) {
        const filePattern2 = /###?\s+(?:File:|Filename:|File name:)?\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/gi;
        while ((match = filePattern2.exec(response)) !== null) {
            files.push({
                name: match[1].trim().replace(/[*`]/g, ''),
                language: match[2] || 'text',
                content: match[3].trim()
            });
        }
    }

    // Method 3: Match any heading followed by code block
    if (files.length === 0) {
        const filePattern3 = /(?:^|\n)(?:###?|>)\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/gi;
        while ((match = filePattern3.exec(response)) !== null) {
            const name = match[1].trim().replace(/[*`:\-]/g, '').trim();
            if (name.includes('.') || name.length < 30) { // Likely a filename
                files.push({
                    name: name || `file${files.length + 1}.txt`,
                    language: match[2] || 'text',
                    content: match[3].trim()
                });
            }
        }
    }

    // Method 4: Just extract all code blocks
    if (files.length === 0) {
        const codePattern = /```(\w+)?\n([\s\S]*?)```/g;
        let codeBlockNum = 1;
        while ((match = codePattern.exec(response)) !== null) {
            const lang = match[1] || 'text';
            const ext = getExtensionFromLanguage(lang);
            files.push({
                name: `file${codeBlockNum}.${ext}`,
                language: lang,
                content: match[2].trim()
            });
            codeBlockNum++;
        }
    }

    console.log(`✅ Parsed ${files.length} files`);
    return files;
}

/**
 * Get file extension from language name
 */
function getExtensionFromLanguage(lang) {
    const extensions = {
        javascript: 'js',
        js: 'js',
        typescript: 'ts',
        ts: 'ts',
        python: 'py',
        py: 'py',
        java: 'java',
        cpp: 'cpp',
        'c++': 'cpp',
        c: 'c',
        csharp: 'cs',
        'c#': 'cs',
        html: 'html',
        css: 'css',
        php: 'php',
        ruby: 'rb',
        go: 'go',
        rust: 'rs',
        json: 'json',
        xml: 'xml',
        yaml: 'yml',
        markdown: 'md',
        md: 'md',
        sql: 'sql',
        bash: 'sh',
        shell: 'sh'
    };
    return extensions[lang.toLowerCase()] || 'txt';
}

/**
 * Generate setup instructions based on project files
 */
function generateSetupInstructions(files, language, type) {
    const hasPackageJson = files.some(f => f.name === 'package.json');
    const hasRequirementsTxt = files.some(f => f.name === 'requirements.txt');
    const hasHTML = files.some(f => f.name.endsWith('.html'));
    const hasReact = files.some(f => f.content.includes('import React'));
    const hasPython = files.some(f => f.name.endsWith('.py'));
    const hasJava = files.some(f => f.name.endsWith('.java'));

    let instructions = '<div class="setup-steps">';

    // Step 1: Create project folder
    instructions += `
        <div class="setup-step">
            <div class="step-number">1️⃣</div>
            <div class="step-content">
                <h5>Create Project Folder</h5>
                <pre class="command-block">mkdir my-project
cd my-project</pre>
            </div>
        </div>
    `;

    // Step 2: Create files
    instructions += `
        <div class="setup-step">
            <div class="step-number">2️⃣</div>
            <div class="step-content">
                <h5>Create Files</h5>
                <p>Create the following files and paste the code from below:</p>
                <ul class="file-list">
                    ${files.map(f => `<li><code>${f.name}</code></li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    // Step 3: Install dependencies
    if (hasPackageJson) {
        instructions += `
            <div class="setup-step">
                <div class="step-number">3️⃣</div>
                <div class="step-content">
                    <h5>Install Dependencies</h5>
                    <pre class="command-block">npm install</pre>
                    <p class="step-note">💡 Make sure you have Node.js installed</p>
                </div>
            </div>
        `;
    } else if (hasRequirementsTxt) {
        instructions += `
            <div class="setup-step">
                <div class="step-number">3️⃣</div>
                <div class="step-content">
                    <h5>Install Dependencies</h5>
                    <pre class="command-block">pip install -r requirements.txt</pre>
                    <p class="step-note">💡 Consider using a virtual environment</p>
                </div>
            </div>
        `;
    }

    // Step 4: Run the project
    if (hasReact) {
        instructions += `
            <div class="setup-step">
                <div class="step-number">4️⃣</div>
                <div class="step-content">
                    <h5>Run the Project</h5>
                    <pre class="command-block">npm start</pre>
                    <p class="step-note">🌐 Open http://localhost:3000 in your browser</p>
                </div>
            </div>
        `;
    } else if (hasPython) {
        const pythonFile = files.find(f => f.name.endsWith('.py'))?.name || 'app.py';
        instructions += `
            <div class="setup-step">
                <div class="step-number">4️⃣</div>
                <div class="step-content">
                    <h5>Run the Project</h5>
                    <pre class="command-block">python ${pythonFile}</pre>
                </div>
            </div>
        `;
    } else if (hasHTML) {
        const htmlFile = files.find(f => f.name.endsWith('.html'))?.name || 'index.html';
        instructions += `
            <div class="setup-step">
                <div class="step-number">4️⃣</div>
                <div class="step-content">
                    <h5>Run the Project</h5>
                    <p>Open <code>${htmlFile}</code> in your web browser</p>
                    <p class="step-note">💡 Or use Live Server extension in VS Code</p>
                </div>
            </div>
        `;
    } else if (hasJava) {
        const javaFile = files.find(f => f.name.endsWith('.java'))?.name || 'Main.java';
        instructions += `
            <div class="setup-step">
                <div class="step-number">4️⃣</div>
                <div class="step-content">
                    <h5>Compile and Run</h5>
                    <pre class="command-block">javac ${javaFile}
java ${javaFile.replace('.java', '')}</pre>
                </div>
            </div>
        `;
    }

    instructions += '</div>';
    return instructions;
}

/**
 * Get file icon based on extension
 */
function getFileIcon(ext) {
    const icons = {
        html: '📄',
        css: '🎨',
        js: '⚡',
        ts: '💙',
        py: '🐍',
        java: '☕',
        cpp: '⚙️',
        c: '⚙️',
        go: '🔵',
        rs: '🦀',
        php: '🐘',
        rb: '💎',
        json: '📋',
        md: '📝',
        txt: '📄',
        yml: '⚙️',
        yaml: '⚙️'
    };
    return icons[ext.toLowerCase()] || '📄';
}

/**
 * Toggle file content visibility
 */
window.toggleFileContent = function (index) {
    const content = document.getElementById(`file-${index}`);
    const icon = document.getElementById(`icon-${index}`);

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        icon.className = 'fas fa-chevron-down file-toggle-icon';
    } else {
        content.classList.add('expanded');
        icon.className = 'fas fa-chevron-up file-toggle-icon';
    }
};

/**
 * Toggle setup instructions
 */
window.toggleSetupInstructions = function () {
    const content = document.getElementById('setup-content');
    const icon = document.getElementById('setup-icon');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        icon.className = 'fas fa-chevron-down';
    } else {
        content.classList.add('expanded');
        icon.className = 'fas fa-chevron-up';
    }
};

/**
 * Toggle full code output
 */
window.toggleFullCode = function () {
    const content = document.getElementById('fullcode-content');
    const icon = document.getElementById('fullcode-icon');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        icon.className = 'fas fa-chevron-down';
    } else {
        content.classList.add('expanded');
        icon.className = 'fas fa-chevron-up';
    }
};

/**
 * Expand all files
 */
window.expandAllFiles = function () {
    document.querySelectorAll('.file-content').forEach(content => {
        content.classList.add('expanded');
    });
    document.querySelectorAll('.file-toggle-icon').forEach(icon => {
        icon.className = 'fas fa-chevron-up file-toggle-icon';
    });
};

/**
 * Collapse all files
 */
window.collapseAllFiles = function () {
    document.querySelectorAll('.file-content').forEach(content => {
        content.classList.remove('expanded');
    });
    document.querySelectorAll('.file-toggle-icon').forEach(icon => {
        icon.className = 'fas fa-chevron-down file-toggle-icon';
    });
};

/**
 * Copy all code to clipboard
 */
window.copyAllCode = function () {
    if (!window.generatedFiles || window.generatedFiles.length === 0) {
        alert('No code to copy');
        return;
    }

    let allCode = '';
    window.generatedFiles.forEach(file => {
        allCode += `// ========== ${file.name} ==========\n\n`;
        allCode += file.content + '\n\n';
    });

    navigator.clipboard.writeText(allCode).then(() => {
        const btn = event.target.closest('.copy-all-btn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied All!';
        btn.style.background = 'var(--success)';

        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code');
    });
};

/**
 * Copy file code to clipboard
 */
window.copyFileCode = function (index, button) {
    const code = document.getElementById(`code-${index}`).textContent;

    navigator.clipboard.writeText(code).then(() => {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code');
    });
};

/**
 * Download all files as ZIP
 */
window.downloadAllFiles = async function () {
    if (!window.generatedFiles || window.generatedFiles.length === 0) {
        alert('No files to download');
        return;
    }

    // Create a simple text file with all code
    let content = '='.repeat(80) + '\n';
    content += 'GENERATED PROJECT FILES\n';
    content += '='.repeat(80) + '\n\n';

    window.generatedFiles.forEach(file => {
        content += `\n${'='.repeat(80)}\n`;
        content += `FILE: ${file.name}\n`;
        content += `${'='.repeat(80)}\n\n`;
        content += file.content + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-files.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ Project files downloaded');
};

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initializeEventListeners() {
    // AI Explainer
    if (explainBtn && explainerInput) {
        explainBtn.addEventListener('click', handleExplainer);
        explainerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleExplainer();
            }
        });
        console.log('✅ AI Explainer initialized');
    } else {
        console.warn('⚠️ AI Explainer elements not found');
    }

    // AI Image Generator
    if (generateBtn && imageInput) {
        generateBtn.addEventListener('click', handleImageGenerator);
        imageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleImageGenerator();
            }
        });
        console.log('✅ AI Image Generator initialized');
    } else {
        console.warn('⚠️ AI Image Generator elements not found');
    }

    // AI Quiz Generator
    if (quizBtn && quizInput) {
        quizBtn.addEventListener('click', handleQuizGenerator);
        quizInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleQuizGenerator();
            }
        });
        console.log('✅ AI Quiz Generator initialized');
    } else {
        console.warn('⚠️ AI Quiz Generator elements not found');
    }

    // AI Video Generator
    if (videoBtn && videoInput) {
        videoBtn.addEventListener('click', handleVideoGenerator);
        videoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleVideoGenerator();
            }
        });
        console.log('✅ AI Video Generator initialized');
    } else {
        console.warn('⚠️ AI Video Generator elements not found');
    }

    // AI Project Generator
    const projectBtn = document.getElementById('projectBtn');
    const projectInput = document.getElementById('projectInput');
    if (projectBtn && projectInput) {
        projectBtn.addEventListener('click', handleProjectGenerator);
        projectInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleProjectGenerator();
            }
        });
        console.log('✅ AI Project Generator initialized');
    } else {
        console.warn('⚠️ AI Project Generator elements not found');
    }

    // Daily Training Center
    if (trainBtn && trainingInput) {
        trainBtn.addEventListener('click', handleDailyTraining);
        trainingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleDailyTraining();
            }
        });
        console.log('✅ Daily Training Center initialized');
    } else {
        console.warn('⚠️ Daily Training Center elements not found');
    }
}

// Make toggleAnswer globally accessible
window.toggleAnswer = toggleAnswer;

// ============================================================================
// INITIALIZATION
// ============================================================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🤖 JARVIS AI Tools initializing...');
        console.log(`📡 Backend URL: ${BACKEND_URL}`);
        initializeEventListeners();
        console.log('✅ All features ready to use!');
    });
} else {
    // DOM is already loaded
    console.log('🤖 JARVIS AI Tools initializing...');
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    initializeEventListeners();
    console.log('✅ All features ready to use!');
}
