// ===== JARVIS CODE PLAYGROUND WITH AI =====

// Backend API URL
const API_URL = 'https://ai-tutor-jarvis.onrender.com';

// Code Editor Instance
let editor;

// Initialize CodeMirror Editor
function initializeEditor() {
    const textarea = document.getElementById('codeEditor');
    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        extraKeys: {
            'Ctrl-Enter': runCode,
            'Ctrl-D': debugCode,
            'Alt-V': toggleVoice
        }
    });

    editor.setValue(`// Welcome to JARVIS Code Playground!
// Press Ctrl+Enter to run your code

console.log("Hello, JARVIS! 🚀");

function greet(name) {
    return \`Welcome, \${name}! Let's code something amazing!\`;
}

console.log(greet("Developer"));`);

    // Update stats
    editor.on('change', () => {
        updateEditorStats();
    });

    updateEditorStats();
}

// Update Editor Statistics
function updateEditorStats() {
    const code = editor.getValue();
    const lines = code.split('\n').length;
    const chars = code.length;

    document.getElementById('lineCount').textContent = `Lines: ${lines}`;
    document.getElementById('charCount').textContent = `Chars: ${chars}`;
}

// Language Selection
document.getElementById('languageSelect').addEventListener('change', (e) => {
    const language = e.target.value;
    let mode, template;

    switch (language) {
        case 'python':
            mode = 'python';
            template = `# Welcome to Python Playground!

def greet(name):
    return f"Hello, {name}! 🐍"

print(greet("Developer"))
print("Ready to code Python!")`;
            break;
        case 'html':
            mode = 'htmlmixed';
            template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, JARVIS! 🌐</h1>
        <p>Welcome to HTML Playground!</p>
    </div>
    
    <script>
        console.log("JavaScript is working! ✨");
    </script>
</body>
</html>`;
            break;
        default:
            mode = 'javascript';
            template = `// JavaScript Playground

console.log("Hello, JARVIS! 🚀");

const factorial = (n) => {
    return n <= 1 ? 1 : n * factorial(n - 1);
};

console.log("Factorial of 5:", factorial(5));`;
    }

    editor.setOption('mode', mode);
    editor.setValue(template);
});

// Run Code
async function runCode() {
    const code = editor.getValue();
    const language = document.getElementById('languageSelect').value;
    const outputArea = document.getElementById('outputArea');

    // Clear output
    outputArea.innerHTML = '';

    showLoading('Running your code...');

    try {
        if (language === 'javascript') {
            // Execute JavaScript locally
            const output = captureConsoleOutput(code);
            displayOutput(output, 'success');
        } else if (language === 'html') {
            // Render HTML in iframe
            renderHTML(code);
        } else if (language === 'python') {
            // Python execution via Skulpt
            await executePython(code);
        }

        // Award XP for running code
        if (typeof window.addXP === 'function') {
            window.addXP(10, 'Ran code');

            // Check for first code badge
            if (typeof window.unlockBadge === 'function') {
                window.unlockBadge('first_code');
            }
        }
    } catch (error) {
        displayOutput(`❌ Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Capture Console Output for JavaScript
function captureConsoleOutput(code) {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
        logs.push({ type: 'log', content: args.join(' ') });
        originalLog.apply(console, args);
    };

    console.error = (...args) => {
        logs.push({ type: 'error', content: args.join(' ') });
        originalError.apply(console, args);
    };

    try {
        eval(code);
    } catch (error) {
        logs.push({ type: 'error', content: error.message });
    }

    console.log = originalLog;
    console.error = originalError;

    return logs;
}

// Display Output
function displayOutput(output, type = 'log') {
    const outputArea = document.getElementById('outputArea');

    if (Array.isArray(output)) {
        output.forEach(item => {
            const line = document.createElement('div');
            line.className = `output-line output-${item.type}`;
            line.textContent = item.content;
            outputArea.appendChild(line);
        });
    } else {
        const line = document.createElement('div');
        line.className = `output-line output-${type}`;
        line.textContent = output;
        outputArea.appendChild(line);
    }

    outputArea.scrollTop = outputArea.scrollHeight;
}

// Render HTML
function renderHTML(code) {
    const outputArea = document.getElementById('outputArea');
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'white';
    iframe.style.borderRadius = '8px';

    outputArea.innerHTML = '';
    outputArea.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
}

// Execute Python using Skulpt
async function executePython(code) {
    // Load Skulpt if not already loaded
    if (typeof Sk === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js');
    }

    return new Promise((resolve, reject) => {
        const output = [];

        Sk.configure({
            output: (text) => {
                output.push({ type: 'log', content: text });
            },
            read: (filename) => {
                if (Sk.builtinFiles && Sk.builtinFiles.files[filename]) {
                    return Sk.builtinFiles.files[filename];
                }
                throw new Error(`File not found: ${filename}`);
            }
        });

        Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true))
            .then(() => {
                displayOutput(output, 'success');
                resolve();
            })
            .catch((err) => {
                displayOutput(`❌ Python Error: ${err.toString()}`, 'error');
                reject(err);
            });
    });
}

// Load External Script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// AI Debug Code
async function debugCode() {
    const code = editor.getValue();
    const language = document.getElementById('languageSelect').value;

    showLoading('AI is analyzing your code...');
    showAIPanel();

    // Award XP for debugging
    if (typeof window.addXP === 'function') {
        window.addXP(15, 'Debugged code');
    }

    try {
        // Use smart API call if available, otherwise fallback to regular fetch
        let response;
        if (window.jarvisBackend && typeof window.jarvisBackend.smartCall === 'function') {
            response = await window.jarvisBackend.smartCall('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Debug this ${language} code and explain any errors or improvements:\n\n${code}`,
                    conversationHistory: []
                })
            });
        } else {
            response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Debug this ${language} code and explain any errors or improvements:\n\n${code}`,
                    conversationHistory: []
                })
            });
        }

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        displayAIResponse(data.response, '🐛 AI Debugger');
    } catch (error) {
        console.error('Debug error:', error);
        const errorMsg = error.message.includes('Failed to fetch')
            ? '❌ Cannot connect to AI server. The backend may be sleeping. Please try again in 30 seconds.'
            : '❌ Failed to connect to AI. Error: ' + error.message;
        displayAIResponse(errorMsg, '🐛 AI Debugger');
    } finally {
        hideLoading();
    }
}

// AI Optimize Code
async function optimizeCode() {
    const code = editor.getValue();
    const language = document.getElementById('languageSelect').value;

    showLoading('AI is optimizing your code...');
    showAIPanel();

    try {
        let response;
        if (window.jarvisBackend && typeof window.jarvisBackend.smartCall === 'function') {
            response = await window.jarvisBackend.smartCall('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Optimize this ${language} code for better performance and readability:\n\n${code}`,
                    conversationHistory: []
                })
            });
        } else {
            response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Optimize this ${language} code for better performance and readability:\n\n${code}`,
                    conversationHistory: []
                })
            });
        }

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        displayAIResponse(data.response, '⚡ AI Optimizer');
    } catch (error) {
        console.error('Optimize error:', error);
        const errorMsg = error.message.includes('Failed to fetch')
            ? '❌ Cannot connect to AI server. The backend may be sleeping. Please try again in 30 seconds.'
            : '❌ Failed to connect to AI. Error: ' + error.message;
        displayAIResponse(errorMsg, '⚡ AI Optimizer');
    } finally {
        hideLoading();
    }
}

// AI Explain Code
async function explainCode() {
    const code = editor.getValue();
    const language = document.getElementById('languageSelect').value;

    showLoading('AI is explaining your code...');
    showAIPanel();

    try {
        let response;
        if (window.jarvisBackend && typeof window.jarvisBackend.smartCall === 'function') {
            response = await window.jarvisBackend.smartCall('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Explain this ${language} code in detail, line by line:\n\n${code}`,
                    conversationHistory: []
                })
            });
        } else {
            response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Explain this ${language} code in detail, line by line:\n\n${code}`,
                    conversationHistory: []
                })
            });
        }

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        displayAIResponse(data.response, '💡 AI Explainer');
    } catch (error) {
        console.error('Explain error:', error);
        const errorMsg = error.message.includes('Failed to fetch')
            ? '❌ Cannot connect to AI server. The backend may be sleeping. Please try again in 30 seconds.'
            : '❌ Failed to connect to AI. Error: ' + error.message;
        displayAIResponse(errorMsg, '💡 AI Explainer');
    } finally {
        hideLoading();
    }
}

// Show AI Panel
function showAIPanel() {
    document.getElementById('aiPanel').classList.add('active');
}

// Hide AI Panel
function hideAIPanel() {
    document.getElementById('aiPanel').classList.remove('active');
}

// Display AI Response
function displayAIResponse(response, title) {
    const aiContent = document.getElementById('aiPanelContent');
    aiContent.innerHTML = `
        <div class="ai-response">
            <h3 style="color: var(--primary-500); font-family: 'Inter', sans-serif; margin-bottom: 1rem;">
                ${title}
            </h3>
            <div style="line-height: 1.8; color: var(--text-secondary);">
                ${marked.parse(response)}
            </div>
        </div>
    `;
}

// Voice Control handled by voice-control.js
function toggleVoice() {
    if (window.toggleJARVISVoice) {
        window.toggleJARVISVoice();
    } else {
        console.warn('JARVIS Voice not loaded');
    }
}

// Speak function using global synthesis
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Clear Output
function clearOutput() {
    document.getElementById('outputArea').innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-rocket"></i>
            <h3>Output Cleared</h3>
            <p>Ready for new code execution</p>
        </div>
    `;
}

// Clear Editor
function clearEditor() {
    if (confirm('Are you sure you want to clear the editor?')) {
        editor.setValue('');
    }
}

// Show/Hide Loading
function showLoading(text = 'Processing...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Event Listeners (with null checks)
const runBtn = document.getElementById('runBtn');
const debugBtn = document.getElementById('debugBtn');
const optimizeBtn = document.getElementById('optimizeBtn');
const explainBtn = document.getElementById('explainBtn');
const clearBtn = document.getElementById('clearBtn');
const clearOutputBtn = document.getElementById('clearOutputBtn');
const voiceBtn = document.getElementById('voiceBtn');
const closeAiBtn = document.getElementById('closeAiBtn');

if (runBtn) runBtn.addEventListener('click', runCode);
if (debugBtn) debugBtn.addEventListener('click', debugCode);
if (optimizeBtn) optimizeBtn.addEventListener('click', optimizeCode);
if (explainBtn) explainBtn.addEventListener('click', explainCode);
if (clearBtn) clearBtn.addEventListener('click', clearEditor);
if (clearOutputBtn) clearOutputBtn.addEventListener('click', clearOutput);
if (voiceBtn) voiceBtn.addEventListener('click', toggleVoice);
if (closeAiBtn) closeAiBtn.addEventListener('click', hideAIPanel);

// AI Suggestion Buttons
document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'debug') debugCode();
        if (action === 'optimize') optimizeCode();
        if (action === 'explain') explainCode();
        if (action === 'generate') generateProject();
    });
});

// Generate Project
async function generateProject() {
    const projectIdea = prompt('What project would you like to build?\n\nExamples:\n- Todo app\n- Weather dashboard\n- Calculator\n- Quiz game');

    if (!projectIdea) return;

    showLoading('AI is generating your project...');
    showAIPanel();

    try {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Generate complete working code for: ${projectIdea}. Include HTML, CSS, and JavaScript in a single file format.`,
                conversationHistory: []
            })
        });

        const data = await response.json();
        displayAIResponse(data.response, '🎨 Project Generator');
    } catch (error) {
        displayAIResponse('❌ Failed to generate project. Please try again.', '🎨 Project Generator');
    } finally {
        hideLoading();
    }
}

// Fullscreen Toggle
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// Share Code
document.getElementById('shareBtn').addEventListener('click', () => {
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis-code-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// GitHub Integration
const githubModal = document.getElementById('githubModal');
const repoList = document.getElementById('repoList');
const fileList = document.getElementById('fileList');
const filesContainer = document.getElementById('filesContainer');
let currentRepo = '';

document.getElementById('githubBtn').addEventListener('click', showGithubModal);
document.getElementById('closeGithubBtn').addEventListener('click', hideGithubModal);
document.getElementById('backToReposBtn').addEventListener('click', showRepoList);

function showGithubModal() {
    githubModal.classList.remove('hidden');
    fetchGithubRepos();
}

function hideGithubModal() {
    githubModal.classList.add('hidden');
    currentRepo = '';
    showRepoList();
}

function showRepoList() {
    repoList.classList.remove('hidden');
    fileList.classList.add('hidden');
}

async function fetchGithubRepos() {
    repoList.innerHTML = '<div class="loading-text">Loading repositories...</div>';

    try {
        const response = await fetch(`${API_URL}/api/github/repos`);
        const data = await response.json();

        if (data.success) {
            displayRepos(data.repos);
        } else {
            repoList.innerHTML = `<div class="error-text">Error: ${data.message || 'Failed to load repos'}</div>`;
        }
    } catch (error) {
        repoList.innerHTML = `<div class="error-text">Error: ${error.message}</div>`;
    }
}

function displayRepos(repos) {
    repoList.innerHTML = '';

    if (repos.length === 0) {
        repoList.innerHTML = '<div class="empty-text">No repositories found.</div>';
        return;
    }

    repos.forEach(repo => {
        const div = document.createElement('div');
        div.className = 'repo-item';
        div.innerHTML = `
            <div class="repo-name"><i class="fas fa-book"></i> ${repo.name}</div>
            <div class="repo-desc">${repo.description || 'No description'}</div>
            <div class="repo-meta">
                <span><i class="fas fa-star"></i> ${repo.stars}</span>
                <span><i class="fas fa-code"></i> ${repo.language || 'Text'}</span>
            </div>
        `;
        div.onclick = () => loadRepoFiles(repo.full_name);
        repoList.appendChild(div);
    });
}

async function loadRepoFiles(repoName, path = '') {
    currentRepo = repoName;
    repoList.classList.add('hidden');
    fileList.classList.remove('hidden');
    filesContainer.innerHTML = '<div class="loading-text">Loading files...</div>';

    try {
        // Use the content endpoint. If path is empty, it lists root files.
        // Note: We need to handle the case where the backend endpoint expects a specific file for content,
        // or if it can handle directory listing. 
        // Looking at backend: axios.get(`https://api.github.com/repos/${repo}/contents/${path}`)
        // This GitHub API returns an array for directories, and object for files.
        // The backend implementation I saw earlier:
        // if (response.data.content) { ... return content ... }
        // This implies the backend might strictly expect a file. 
        // Let's check the backend code again mentally.
        // Backend: 
        // const response = await axios.get(...)
        // if (response.data.content) { ... } else { throw new Error('No content found') }
        // This backend implementation is too simple for directory listing. It assumes it's fetching a file.
        // I need to update the backend to handle directory listing (array response) vs file content.

        // Let's assume for now I'll fix the backend.
        const response = await fetch(`${API_URL}/api/github/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo: repoName, path: path })
        });

        const data = await response.json();

        if (data.success) {
            // If it's a file content (string), load it into editor
            if (typeof data.content === 'string') {
                editor.setValue(data.content);
                hideGithubModal();
                showNotification(`Loaded ${path} from GitHub`, 'success');
            } else if (Array.isArray(data.content)) {
                // It's a directory listing
                displayFiles(data.content, repoName);
            }
        } else {
            // If backend failed because it's a directory and backend expects file, we might need to adjust.
            filesContainer.innerHTML = `<div class="error-text">Error: ${data.message}</div>`;
        }
    } catch (error) {
        filesContainer.innerHTML = `<div class="error-text">Error: ${error.message}</div>`;
    }
}

function displayFiles(files, repoName) {
    filesContainer.innerHTML = '';

    // Sort: folders first, then files
    files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });

    files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-item';
        const icon = file.type === 'dir' ? 'fa-folder' : 'fa-file-code';
        div.innerHTML = `<i class="fas ${icon}"></i> ${file.name}`;

        div.onclick = () => {
            if (file.type === 'dir') {
                loadRepoFiles(repoName, file.path);
            } else {
                loadRepoFiles(repoName, file.path);
            }
        };
        filesContainer.appendChild(div);
    });
}

function showNotification(message, type) {
    // Reuse existing notification logic or create simple one
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('codeEditor')) {
        initializeEditor();
        console.log('🚀 JARVIS Code Playground initialized!');
    }
});
