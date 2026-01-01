// ===== JARVIS CODE PLAYGROUND WITH AI =====

// Backend API URL
const API_URL = 'https://ai-tutor-jarvis.onrender.com';

// Piston API for code execution (supports 50+ languages)
const PISTON_API = 'https://emkc.org/api/v2/piston';

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
        case 'java':
            mode = 'text/x-java';
            template = `// Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, JARVIS! ☕");
        
        int sum = add(5, 3);
        System.out.println("Sum: " + sum);
    }
    
    static int add(int a, int b) {
        return a + b;
    }
}`;
            break;
        case 'cpp':
            mode = 'text/x-c++src';
            template = `// C++ Playground
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, JARVIS! ⚡" << endl;
    
    int sum = 5 + 3;
    cout << "Sum: " << sum << endl;
    
    return 0;
}`;
            break;
        case 'c':
            mode = 'text/x-csrc';
            template = `// C Playground
#include <stdio.h>

int main() {
    printf("Hello, JARVIS! 🔷\\n");
    
    int sum = 5 + 3;
    printf("Sum: %d\\n", sum);
    
    return 0;
}`;
            break;
        case 'csharp':
            mode = 'text/x-csharp';
            template = `// C# Playground
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, JARVIS! 💎");
        
        int sum = Add(5, 3);
        Console.WriteLine($"Sum: {sum}");
    }
    
    static int Add(int a, int b) {
        return a + b;
    }
}`;
            break;
        case 'php':
            mode = 'text/x-php';
            template = `<?php
// PHP Playground
echo "Hello, JARVIS! 🐘\\n";

function add($a, $b) {
    return $a + $b;
}

$sum = add(5, 3);
echo "Sum: $sum\\n";
?>`;
            break;
        case 'ruby':
            mode = 'text/x-ruby';
            template = `# Ruby Playground
puts "Hello, JARVIS! 💎"

def add(a, b)
    a + b
end

sum = add(5, 3)
puts "Sum: #{sum}"`;
            break;
        case 'go':
            mode = 'text/x-go';
            template = `// Go Playground
package main

import "fmt"

func main() {
    fmt.Println("Hello, JARVIS! 🔵")
    
    sum := add(5, 3)
    fmt.Printf("Sum: %d\\n", sum)
}

func add(a, b int) int {
    return a + b
}`;
            break;
        case 'rust':
            mode = 'text/x-rustsrc';
            template = `// Rust Playground
fn main() {
    println!("Hello, JARVIS! 🦀");
    
    let sum = add(5, 3);
    println!("Sum: {}", sum);
}

fn add(a: i32, b: i32) -> i32 {
    a + b
}`;
            break;
        case 'kotlin':
            mode = 'text/x-kotlin';
            template = `// Kotlin Playground
fun main() {
    println("Hello, JARVIS! 🤖")
    
    val sum = add(5, 3)
    println("Sum: $sum")
}

fun add(a: Int, b: Int): Int {
    return a + b
}`;
            break;
        case 'swift':
            mode = 'text/x-swift';
            template = `// Swift Playground
import Foundation

print("Hello, JARVIS! 🍎")

func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}

let sum = add(5, 3)
print("Sum: \\(sum)")`;
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

// Example: Calculate factorial
const factorial = (n) => {
    return n <= 1 ? 1 : n * factorial(n - 1);
};

console.log("Factorial of 5:", factorial(5));

// Example: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`;
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
            // Use Piston API for Python
            await executePistonCode(code, 'python', '3.10.0');
        } else {
            // Use Piston API for other languages
            const languageMap = {
                'java': { lang: 'java', version: '15.0.2' },
                'cpp': { lang: 'c++', version: '10.2.0' },
                'c': { lang: 'c', version: '10.2.0' },
                'csharp': { lang: 'csharp', version: '6.12.0' },
                'php': { lang: 'php', version: '8.2.3' },
                'ruby': { lang: 'ruby', version: '3.0.1' },
                'go': { lang: 'go', version: '1.16.2' },
                'rust': { lang: 'rust', version: '1.68.2' },
                'kotlin': { lang: 'kotlin', version: '1.8.20' },
                'swift': { lang: 'swift', version: '5.3.3' }
            };

            const langConfig = languageMap[language];
            if (langConfig) {
                await executePistonCode(code, langConfig.lang, langConfig.version);
            } else {
                displayOutput('❌ Language not supported for execution', 'error');
            }
        }

        // Award XP for running code
        if (typeof window.addXP === 'function') {
            window.addXP(10, 'Ran code');
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
        line.style.whiteSpace = 'pre-wrap';
        line.style.lineHeight = '1.8';
        if (type === 'info') {
            line.style.color = '#60a5fa';
            line.style.background = 'rgba(59, 130, 246, 0.1)';
            line.style.padding = '1rem';
            line.style.borderRadius = '8px';
            line.style.border = '1px solid rgba(59, 130, 246, 0.3)';
        }
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

// Execute code using Piston API
async function executePistonCode(code, language, version) {
    try {
        const response = await fetch(`${PISTON_API}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: language,
                version: version,
                files: [{
                    content: code
                }]
            })
        });

        const result = await response.json();

        if (result.run) {
            let output = '';

            if (result.run.stdout) {
                output += result.run.stdout;
            }

            if (result.run.stderr) {
                output += '\n❌ Error:\n' + result.run.stderr;
            }

            if (result.run.code !== 0) {
                output += `\n\n⚠️ Exit code: ${result.run.code}`;
            }

            if (!output.trim()) {
                output = '✅ Code executed successfully (no output)';
            }

            displayOutput(output, result.run.stderr ? 'error' : 'success');
        } else if (result.message) {
            displayOutput(`❌ ${result.message}`, 'error');
        } else {
            displayOutput('❌ Failed to execute code', 'error');
        }
    } catch (error) {
        displayOutput(`❌ Execution error: ${error.message}`, 'error');
    }
}

// Execute Python using Skulpt (keeping as backup)
async function executePythonSkulpt(code) {
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
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loadingOverlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
                <p id="loadingText">${text}</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    } else {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) loadingText.textContent = text;
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Event Listeners (with null checks)
const runBtn = document.getElementById('runBtn');
const debugBtn = document.getElementById('debugBtn');
const optimizeBtn = document.getElementById('optimizeBtn');
const explainBtn = document.getElementById('explainBtn');
const clearBtn = document.getElementById('clearBtn');
const clearOutputBtn = document.getElementById('clearOutputBtn');
const closeAiBtn = document.getElementById('closeAiBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const shareBtn = document.getElementById('shareBtn');
const githubBtn = document.getElementById('githubBtn');
if (runBtn) runBtn.addEventListener('click', runCode);
if (debugBtn) debugBtn.addEventListener('click', debugCode);
if (optimizeBtn) optimizeBtn.addEventListener('click', optimizeCode);
if (explainBtn) explainBtn.addEventListener('click', explainCode);
if (clearBtn) clearBtn.addEventListener('click', clearEditor);
if (clearOutputBtn) clearOutputBtn.addEventListener('click', clearOutput);
if (closeAiBtn) closeAiBtn.addEventListener('click', hideAIPanel);

// Vision-to-Code functionality
const visionBtn = document.getElementById('visionBtn');
const visionInput = document.getElementById('visionInput');

if (visionBtn && visionInput) {
    visionBtn.addEventListener('click', () => visionInput.click());
    visionInput.addEventListener('change', handleVisionUpload);
}

async function handleVisionUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show loading
    showLoading('JARVIS is analyzing your design...');
    showAIPanel();

    try {
        // Convert image to base64
        const base64Image = await convertToBase64(file);

        // Call Vision API
        const response = await fetch(`${API_URL}/api/vision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64Image,
                prompt: "Analyze this UI design and generate the complete HTML, CSS, and JavaScript code to recreate it. Use modern, responsive design principles. Return ONLY the code in a single HTML file structure."
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Vision analysis failed';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.details || errorData.error || errorMessage;
            } catch (e) {
                console.error('Raw error response:', errorText);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Set code to editor
        if (data.answer) {
            // Switch to HTML mode first
            document.getElementById('languageSelect').value = 'html';
            editor.setOption('mode', 'htmlmixed');
            editor.setValue(data.answer);

            displayAIResponse("✅ **Design Analyzed!** I've generated the code for you. You can now run it to see the preview.", '👁️ AI Vision');

            // Auto-run if it's HTML
            runCode();
        } else {
            throw new Error('No code generated');
        }

    } catch (error) {
        console.error('Vision error:', error);
        displayAIResponse(`❌ **Vision Error:** ${error.message}`, '👁️ AI Vision');
    } finally {
        hideLoading();
        // Reset input
        visionInput.value = '';
    }
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Fullscreen Toggle
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// Share Code
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const code = editor.getValue();
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jarvis-code-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showSimpleNotification('✅ Code downloaded successfully!', 'success');
    });
}

// GitHub Integration - Simple placeholder
if (githubBtn) {
    githubBtn.addEventListener('click', () => {
        showSimpleNotification('🚧 GitHub integration coming soon! Use copy/paste for now.', 'info');
    });
}

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

// Simple notification system
function showSimpleNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `simple-notification ${type}`;
    notif.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('codeEditor')) {
        initializeEditor();
        console.log('🚀 JARVIS Code Playground initialized!');
    }
});
