// ============================================
// MONACO CODE EDITOR - JARVIS IDE
// Professional VS Code-like editor
// ============================================

import { getBackendURL } from './config.js';

const BACKEND_URL = getBackendURL();

// ============================================
// MONACO EDITOR SETUP
// ============================================

class CodeEditor {
    constructor() {
        this.editor = null;
        this.currentFile = 'main.js';
        this.files = {
            'main.js': {
                language: 'javascript',
                content: `// Welcome to JARVIS Code Editor
// A professional Monaco-powered IDE with AI assistance

function greet(name) {
    console.log(\`Hello, \${name}! Welcome to JARVIS.\`);
}

// Try AI suggestions: Press Ctrl+Space
// Format code: Alt+Shift+F
// Run code: Ctrl+Enter

greet('Developer');
`
            }
        };
        
        this.init();
    }

    init() {
        require.config({ 
            paths: { 
                'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
            }
        });

        require(['vs/editor/editor.main'], () => {
            this.createEditor();
            this.setupEventListeners();
            this.loadFileTree();
        });
    }

    createEditor() {
        this.editor = monaco.editor.create(document.getElementById('monacoEditor'), {
            value: this.files[this.currentFile].content,
            language: this.files[this.currentFile].language,
            theme: 'vs-dark',
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordBasedSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
        });

        // Track cursor position
        this.editor.onDidChangeCursorPosition((e) => {
            this.updateStatusBar(e.position);
        });

        // Track content changes
        this.editor.onDidChangeModelContent(() => {
            this.files[this.currentFile].content = this.editor.getValue();
        });

        // Setup AI completions
        this.setupAICompletions();
    }

    setupAICompletions() {
        // Register AI-powered completion provider
        const languages = ['javascript', 'typescript', 'python', 'html', 'css'];
        
        languages.forEach(lang => {
            monaco.languages.registerCompletionItemProvider(lang, {
                provideCompletionItems: (model, position) => {
                    return this.getAICompletions(model, position);
                }
            });
        });
    }

    async getAICompletions(model, position) {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        // Get word being typed
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        // AI-powered suggestions
        const suggestions = [
            {
                label: '🤖 AI: async function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'async function ${1:name}(${2:params}) {\n\t${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Create an async function with AI assistance',
                range: range
            },
            {
                label: '🤖 AI: try-catch',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'try {\n\t${1}\n} catch (error) {\n\tconsole.error(error);\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'AI-suggested error handling',
                range: range
            },
            {
                label: '🤖 AI: fetch API',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'const response = await fetch(${1:url});\nconst data = await response.json();',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'AI-suggested fetch pattern',
                range: range
            }
        ];

        return { suggestions };
    }

    setupEventListeners() {
        // Language selector
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Toolbar buttons
        document.getElementById('formatCodeBtn').addEventListener('click', () => this.formatCode());
        document.getElementById('aiSuggestBtn').addEventListener('click', () => this.getAISuggestions());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveFile());
        document.getElementById('runCodeBtn').addEventListener('click', () => this.runCode());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());

        // File explorer
        document.getElementById('newFileBtn').addEventListener('click', () => this.createNewFile());
        document.getElementById('uploadBtn').addEventListener('click', () => this.uploadFile());

        // Output panel
        document.getElementById('clearOutputBtn').addEventListener('click', () => this.clearOutput());

        // Settings
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        this.setupSettingsListeners();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S: Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveFile();
            }
            // Ctrl+Enter: Run
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            // Alt+Shift+F: Format
            if (e.altKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.formatCode();
            }
        });
    }

    updateStatusBar(position) {
        document.getElementById('statusLine').textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
    }

    changeLanguage(lang) {
        monaco.editor.setModelLanguage(this.editor.getModel(), lang);
        document.getElementById('statusLanguage').textContent = lang.toUpperCase();
        this.files[this.currentFile].language = lang;
    }

    formatCode() {
        this.editor.getAction('editor.action.formatDocument').run();
        this.showNotification('Code formatted successfully', 'success');
    }

    async getAISuggestions() {
        const code = this.editor.getValue();
        const selection = this.editor.getSelection();
        const selectedText = this.editor.getModel().getValueInRange(selection);

        this.showNotification('Getting AI suggestions...', 'info');

        try {
            const response = await fetch(`${BACKEND_URL}/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: `Analyze this code and suggest improvements:\n\n${selectedText || code}`
                })
            });

            const data = await response.json();
            this.showOutput(data.answer || 'No suggestions available', 'info');
            this.showNotification('AI suggestions received', 'success');
        } catch (error) {
            this.showNotification('Failed to get AI suggestions', 'error');
        }
    }

    saveFile() {
        const content = this.editor.getValue();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification(`File '${this.currentFile}' saved`, 'success');
    }

    async runCode() {
        const code = this.editor.getValue();
        const language = this.files[this.currentFile].language;

        this.clearOutput();
        this.showOutput('Running code...', 'info');

        try {
            if (language === 'javascript') {
                // Execute JavaScript
                this.executeJavaScript(code);
            } else if (language === 'python') {
                // For Python, you'd need a backend API
                this.showOutput('Python execution requires backend API', 'warning');
            } else {
                this.showOutput(`Execution not supported for ${language}`, 'warning');
            }
        } catch (error) {
            this.showOutput(`Error: ${error.message}`, 'error');
        }
    }

    executeJavaScript(code) {
        // Capture console output
        const originalLog = console.log;
        const originalError = console.error;
        const outputs = [];

        console.log = (...args) => {
            outputs.push({ type: 'success', message: args.join(' ') });
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            outputs.push({ type: 'error', message: args.join(' ') });
            originalError.apply(console, args);
        };

        try {
            // Execute code
            eval(code);
            
            // Show outputs
            if (outputs.length === 0) {
                this.showOutput('✓ Code executed successfully (no output)', 'success');
            } else {
                outputs.forEach(out => {
                    this.showOutput(out.message, out.type);
                });
            }
        } catch (error) {
            this.showOutput(`❌ ${error.message}`, 'error');
        } finally {
            // Restore console
            console.log = originalLog;
            console.error = originalError;
        }
    }

    showOutput(message, type = 'info') {
        const content = document.getElementById('outputContent');
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        line.textContent = message;
        content.appendChild(line);
        content.scrollTop = content.scrollHeight;
    }

    clearOutput() {
        document.getElementById('outputContent').innerHTML = '';
    }

    showNotification(message, type = 'info') {
        // Simple notification (you can enhance this)
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        console.log(`${icons[type]} ${message}`);
    }

    loadFileTree() {
        const tree = document.getElementById('fileTree');
        tree.innerHTML = '';

        // Sample file structure
        const structure = [
            { name: 'main.js', icon: 'fab fa-js', type: 'file' },
            { name: 'styles.css', icon: 'fab fa-css3', type: 'file' },
            { name: 'index.html', icon: 'fab fa-html5', type: 'file' },
            { name: 'README.md', icon: 'fas fa-file-alt', type: 'file' }
        ];

        structure.forEach(item => {
            const fileEl = document.createElement('div');
            fileEl.className = 'file-item';
            if (item.name === this.currentFile) {
                fileEl.classList.add('active');
            }
            fileEl.innerHTML = `
                <i class="${item.icon}"></i>
                <span>${item.name}</span>
            `;
            fileEl.addEventListener('click', () => this.openFile(item.name));
            tree.appendChild(fileEl);
        });
    }

    openFile(filename) {
        if (!this.files[filename]) {
            this.files[filename] = {
                language: this.getLanguageFromFilename(filename),
                content: `// ${filename}\n\n`
            };
        }

        this.currentFile = filename;
        this.editor.setValue(this.files[filename].content);
        monaco.editor.setModelLanguage(this.editor.getModel(), this.files[filename].language);
        
        this.loadFileTree();
    }

    getLanguageFromFilename(filename) {
        const ext = filename.split('.').pop();
        const langMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'java': 'java',
            'cpp': 'cpp',
            'cs': 'csharp',
            'php': 'php',
            'sql': 'sql'
        };
        return langMap[ext] || 'plaintext';
    }

    createNewFile() {
        const filename = prompt('Enter filename:', 'untitled.js');
        if (filename) {
            this.files[filename] = {
                language: this.getLanguageFromFilename(filename),
                content: ''
            };
            this.openFile(filename);
        }
    }

    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.ts,.py,.html,.css,.json,.md';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                this.files[file.name] = {
                    language: this.getLanguageFromFilename(file.name),
                    content: event.target.result
                };
                this.openFile(file.name);
            };
            reader.readAsText(file);
        };
        input.click();
    }

    openSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    setupSettingsListeners() {
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            monaco.editor.setTheme(e.target.value);
        });

        document.getElementById('fontSizeInput').addEventListener('change', (e) => {
            this.editor.updateOptions({ fontSize: parseInt(e.target.value) });
        });

        document.getElementById('tabSizeInput').addEventListener('change', (e) => {
            this.editor.updateOptions({ tabSize: parseInt(e.target.value) });
        });

        document.getElementById('miniMapCheck').addEventListener('change', (e) => {
            this.editor.updateOptions({ minimap: { enabled: e.target.checked } });
        });

        document.getElementById('lineNumbersCheck').addEventListener('change', (e) => {
            this.editor.updateOptions({ lineNumbers: e.target.checked ? 'on' : 'off' });
        });

        document.getElementById('wordWrapCheck').addEventListener('change', (e) => {
            this.editor.updateOptions({ wordWrap: e.target.checked ? 'on' : 'off' });
        });
    }
}

// ============================================
// INITIALIZE EDITOR
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.codeEditor = new CodeEditor();
    console.log('✅ JARVIS Code Editor initialized');
});

export { CodeEditor };
