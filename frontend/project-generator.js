// ===== JARVIS PROJECT GENERATOR =====
// Revolutionary AI-powered complete project generation

import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { getBackendURL } from './config.js';

const API_URL = `${getBackendURL()}/api`;

// Firebase Auth State
onAuthStateChanged(auth, user => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        if (user) {
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = () => {
                signOut(auth);
                window.location.href = 'login.html';
            };
        } else {
            logoutBtn.textContent = 'Login';
            logoutBtn.onclick = () => window.location.href = 'login.html';
        }
    }
});

// State
let currentProject = null;
let projectHistory = [];
let isDarkTheme = false;

// Elements
const projectIdea = document.getElementById('project-idea');
const generateBtn = document.getElementById('generate-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const outputSection = document.getElementById('output-section');
const fileTree = document.getElementById('file-tree');
const filesSection = document.getElementById('files-section');
const setupInstructions = document.getElementById('setup-instructions');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const newProjectBtn = document.getElementById('new-project-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadProjectTemplates();
    loadProjectHistory();
    console.log('🤖 JARVIS Project Generator initialized');
});

// Setup Event Listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generateProject);
    downloadBtn.addEventListener('click', downloadProject);
    copyBtn.addEventListener('click', copyAllCode);
    newProjectBtn.addEventListener('click', resetGenerator);

    // New Feature Buttons
    document.getElementById('templates-btn')?.addEventListener('click', openTemplatesModal);
    document.getElementById('history-btn')?.addEventListener('click', openHistoryModal);
    document.getElementById('explain-btn')?.addEventListener('click', explainCode);
    document.getElementById('optimize-btn')?.addEventListener('click', optimizeCode);
    document.getElementById('export-btn')?.addEventListener('click', openExportModal);

    // Enter key to generate
    projectIdea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateProject();
        }
    });
}

// Generate Project
async function generateProject() {
    const idea = projectIdea.value.trim();

    if (!idea) {
        showNotification('❌ Please describe your project idea', 'error');
        return;
    }

    if (idea.length < 10) {
        showNotification('❌ Please provide more details about your project', 'error');
        return;
    }

    showLoading(true);

    try {
        // Get selected tech stack from dropdown
        const techStackSelect = document.getElementById('tech-stack');
        const selectedTech = techStackSelect ? [techStackSelect.value] : ['auto'];

        // Get selected features
        const features = {
            auth: document.getElementById('auth')?.checked || false,
            database: document.getElementById('database')?.checked || false,
            api: document.getElementById('api')?.checked || false,
            tests: document.getElementById('tests')?.checked || false,
            docker: document.getElementById('docker')?.checked || false,
            cicd: document.getElementById('ci-cd')?.checked || false
        };

        const projectData = {
            idea,
            techStack: selectedTech,
            features
        };

        // Generate project structure using AI
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `You are an EXPERT senior full-stack developer with 10+ years of experience. Your code is production-ready, follows best practices, and is fully functional.

PROJECT BRIEF: "${idea}"

TECH STACK: ${selectedTech.join(', ') || 'Choose the most appropriate modern stack'}

REQUIRED FEATURES:
${features.auth ? '✅ Full Authentication System (signup, login, session management)' : ''}
${features.database ? '✅ Database Integration (schema, models, CRUD operations)' : ''}
${features.api ? '✅ RESTful API with proper error handling' : ''}
${features.tests ? '✅ Comprehensive Unit Tests' : ''}
${features.docker ? '✅ Docker containerization (Dockerfile, docker-compose)' : ''}
${features.cicd ? '✅ CI/CD pipeline configuration' : ''}

CRITICAL REQUIREMENTS:
1. ✅ Write COMPLETE, PRODUCTION-READY code - NO placeholders, NO "TODO", NO "Add your code here"
2. ✅ Every function must be fully implemented with real logic
3. ✅ Include ALL imports, dependencies, and configurations
4. ✅ Use modern best practices and clean code principles
5. ✅ Add proper error handling, validation, and security measures
6. ✅ Include responsive design with modern CSS (Flexbox/Grid)
7. ✅ Add detailed comments explaining complex logic
8. ✅ Make it visually appealing with professional styling
9. ✅ Ensure cross-browser compatibility
10. ✅ All code must be ready to run without modifications
11. ✅ ALWAYS include JavaScript file (script.js or app.js) with COMPLETE working code - NEVER skip JavaScript
12. ✅ For web projects: MUST include index.html, styles.css, AND script.js (all three files are MANDATORY)

CODE QUALITY STANDARDS:
- Use semantic HTML5 elements
- Modern CSS with CSS variables for theming
- Clean, modular JavaScript (ES6+)
- Proper separation of concerns
- Mobile-first responsive design
- Accessibility considerations (ARIA labels, semantic markup)
- Performance optimizations
- Security best practices (input validation, XSS prevention)

EXAMPLE OF COMPLETE CODE (NOT PLACEHOLDERS):
❌ BAD: function handleSubmit() { /* TODO: Add form handling */ }
✅ GOOD: function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    // Full validation logic
    if (!data.email || !data.email.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)) {
        showError('Invalid email format');
        return;
    }
    // Complete API call with error handling
    fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => showSuccess('Submitted successfully'))
    .catch(err => showError('Submission failed: ' + err.message));
}

FORMAT YOUR RESPONSE EXACTLY AS:

PROJECT_NAME: [descriptive project name]

FILE_STRUCTURE:
\`\`\`
project-root/
├── index.html
├── styles.css
├── script.js
├── README.md
└── package.json (if needed)
\`\`\`

FILES:

--- filename: index.html ---
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Project Name]</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    [COMPLETE HTML with all sections, forms, buttons, etc.]
    <script src="script.js"></script>
</body>
</html>
\`\`\`

--- filename: styles.css ---
\`\`\`css
/* COMPLETE CSS with:
   - CSS variables for theming
   - Responsive design (mobile, tablet, desktop)
   - Modern layouts (Flexbox/Grid)
   - Smooth animations and transitions
   - Professional color schemes
   - All component styles */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... all variables */
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    /* ... complete styling */
}

/* [ALL OTHER STYLES - FULLY IMPLEMENTED] */
\`\`\`

--- filename: script.js ---
\`\`\`javascript
// COMPLETE JavaScript with:
// - All event listeners
// - All functions fully implemented
// - Error handling
// - API calls (if needed)
// - Data validation
// - State management
// - DOM manipulation

// [COMPLETE WORKING CODE]
\`\`\`

--- filename: package.json ---
\`\`\`json
{
  "name": "[project-name]",
  "version": "1.0.0",
  "description": "[description]",
  "main": "index.html",
  "scripts": {
    "start": "live-server",
    "dev": "live-server"
  },
  "dependencies": {
    [IF NEEDED]
  }
}
\`\`\`

SETUP_INSTRUCTIONS:
1. Create a new folder and navigate to it
2. Create all the files listed above
3. [IF package.json exists] Run: npm install
4. [IF backend] Run: npm start
5. [IF static HTML] Open index.html in browser or use Live Server
6. The application is now running and fully functional

⚠️ CRITICAL REMINDER:
- For web projects: MUST provide index.html, styles.css, AND script.js (ALL THREE FILES)
- JavaScript file is MANDATORY for interactive features
- Every file must have COMPLETE, working code
- NO placeholders, NO TODOs, NO incomplete functions
- Code must run immediately without modifications

REMEMBER: Every line of code must be COMPLETE and FUNCTIONAL. This code will be used immediately without any modifications. Make it PRODUCTION-READY!`
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate project');
        }

        const data = await response.json();
        const projectContent = data.response;

        // Parse the generated project
        currentProject = parseProjectResponse(projectContent);

        if (!currentProject || !currentProject.files || currentProject.files.length === 0) {
            throw new Error('Failed to parse project structure');
        }

        // Display the project
        displayProject(currentProject);

        // Award XP for generating project
        if (typeof window.addXP === 'function') {
            window.addXP(50, 'Generated a project');

            // Check for project starter badge
            if (typeof window.unlockBadge === 'function') {
                window.unlockBadge('project_starter');
            }
        }

        showLoading(false);
        showNotification('✅ Project generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating project:', error);
        showLoading(false);
        showNotification('❌ Failed to generate project. Please try again.', 'error');
    }
}

// Parse AI Response into Project Structure
function parseProjectResponse(content) {
    const project = {
        name: '',
        structure: '',
        files: [],
        setup: ''
    };

    // Extract project name
    const nameMatch = content.match(/PROJECT_NAME:\s*(.+)/i);
    project.name = nameMatch ? nameMatch[1].trim() : 'Generated Project';

    // Extract file structure
    const structureMatch = content.match(/FILE_STRUCTURE:\s*```([^`]+)```/is);
    project.structure = structureMatch ? structureMatch[1].trim() : 'Structure not available';

    // Extract files
    const fileRegex = /---\s*filename:\s*(.+?)\s*---\s*```(\w+)?\s*\n([\s\S]+?)```/gi;
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
        const filename = match[1].trim();
        const language = match[2] || detectLanguage(filename);
        const code = match[3].trim();

        project.files.push({
            name: filename,
            language,
            content: code
        });
    }

    // If no files found with new format, try alternative parsing
    if (project.files.length === 0) {
        const altFileRegex = /```(\w+)\s*\/\/\s*(.+?)\n([\s\S]+?)```/gi;
        while ((match = altFileRegex.exec(content)) !== null) {
            const language = match[1];
            const filename = match[2].trim();
            const code = match[3].trim();

            project.files.push({
                name: filename,
                language,
                content: code
            });
        }
    }

    // Extract setup instructions
    const setupMatch = content.match(/SETUP_INSTRUCTIONS:\s*([\s\S]+?)(?=\n\n|$)/i);
    
    // Generate smart setup instructions if not provided
    if (setupMatch && setupMatch[1].trim()) {
        project.setup = setupMatch[1].trim();
    } else {
        project.setup = generateSmartSetupInstructions(project.files);
    }

    return project;
}

// Generate smart setup instructions based on files
function generateSmartSetupInstructions(files) {
    const hasPackageJson = files.some(f => f.name === 'package.json');
    const hasRequirementsTxt = files.some(f => f.name === 'requirements.txt');
    const hasPython = files.some(f => f.name.endsWith('.py'));
    const hasHTML = files.some(f => f.name.endsWith('.html'));
    const hasReact = files.some(f => f.content && f.content.includes('import React'));
    
    let instructions = '📋 Setup Instructions:\n\n';
    
    instructions += '1️⃣ Create Project Folder\n';
    instructions += '   mkdir my-project && cd my-project\n\n';
    
    instructions += '2️⃣ Create Files\n';
    instructions += '   Create all the files shown below and paste the code\n\n';
    
    if (hasPackageJson) {
        instructions += '3️⃣ Install Dependencies\n';
        instructions += '   npm install\n\n';
        instructions += '4️⃣ Run the Project\n';
        if (hasReact) {
            instructions += '   npm start\n';
            instructions += '   Open http://localhost:3000\n';
        } else {
            instructions += '   npm run dev  (or)  npm start\n';
        }
    } else if (hasRequirementsTxt) {
        instructions += '3️⃣ Install Dependencies\n';
        instructions += '   pip install -r requirements.txt\n\n';
        instructions += '4️⃣ Run the Project\n';
        const pyFile = files.find(f => f.name.endsWith('.py'));
        instructions += `   python ${pyFile ? pyFile.name : 'app.py'}\n`;
    } else if (hasPython) {
        instructions += '3️⃣ Run the Project\n';
        const pyFile = files.find(f => f.name.endsWith('.py'));
        instructions += `   python ${pyFile ? pyFile.name : 'app.py'}\n`;
    } else if (hasHTML) {
        instructions += '3️⃣ Run the Project\n';
        instructions += '   Open index.html in your browser\n';
        instructions += '   Or use Live Server in VS Code\n';
    } else {
        instructions += '3️⃣ Run the Project\n';
        instructions += '   Follow the standard instructions for your language/framework\n';
    }
    
    return instructions;
}

// Detect Language from Filename
function detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'py': 'python',
        'json': 'json',
        'md': 'markdown',
        'yml': 'yaml',
        'yaml': 'yaml',
        'sh': 'bash',
        'dockerfile': 'dockerfile'
    };
    return langMap[ext] || 'text';
}

// Display Generated Project
function displayProject(project) {
    console.log('📦 Displaying project:', project);
    
    // Show output section
    outputSection.classList.remove('hidden');
    outputSection.style.display = 'block';
    outputSection.scrollIntoView({ behavior: 'smooth' });

    // Save to history
    saveToHistory(project);

    // Display file tree
    fileTree.innerHTML = `<pre>${escapeHtml(project.structure)}</pre>`;

    // Display files - ALL EXPANDED BY DEFAULT
    filesSection.innerHTML = '<h3 style="margin-bottom: 20px;">💻 All Project Files (Click file name to collapse)</h3>';
    project.files.forEach((file, index) => {
        const fileBlock = createFileBlock(file, index);
        filesSection.appendChild(fileBlock);
    });

    // Display setup instructions - ALWAYS VISIBLE
    setupInstructions.innerHTML = `
        <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; border-left: 4px solid #00d4ff;">
            <pre style="color: #d4d4d4; margin: 0; white-space: pre-wrap; font-family: 'Courier New', monospace; line-height: 1.6;">${escapeHtml(project.setup)}</pre>
        </div>
    `;
    
    console.log('✅ Project display complete');
}

// Check if project can be previewed
function checkIfPreviewable(files) {
    // Check if there's an HTML file or web-based project
    return files.some(f => 
        f.name.endsWith('.html') || 
        f.name === 'index.html' ||
        f.name.endsWith('.htm')
    );
}

// Show live preview of the project
function showLivePreview(files) {
    const previewSection = document.getElementById('preview-section');
    const previewFrame = document.getElementById('preview-frame');
    const deviceFrame = document.getElementById('device-frame');
    const deviceSelector = document.getElementById('device-selector');
    const refreshBtn = document.getElementById('refresh-preview');
    const fullscreenBtn = document.getElementById('fullscreen-preview');
    
    // Check if preview elements exist
    if (!previewSection || !previewFrame) {
        console.log('Preview section not available');
        return;
    }
    
    // Show preview section
    previewSection.style.display = 'block';
    
    // Find HTML file
    const htmlFile = files.find(f => 
        f.name === 'index.html' || 
        f.name.endsWith('.html')
    );
    
    if (!htmlFile) return;
    
    // Build complete HTML with inline CSS and JS
    let completeHTML = htmlFile.content;
    
    // Inject CSS files
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    if (cssFiles.length > 0) {
        const cssContent = cssFiles.map(f => `<style>\n${f.content}\n</style>`).join('\n');
        if (completeHTML.includes('</head>')) {
            completeHTML = completeHTML.replace('</head>', `${cssContent}\n</head>`);
        } else {
            completeHTML = `<head>${cssContent}</head>\n${completeHTML}`;
        }
    }
    
    // Inject JS files
    const jsFiles = files.filter(f => f.name.endsWith('.js') && !f.name.includes('node_modules'));
    if (jsFiles.length > 0) {
        const jsContent = jsFiles.map(f => `<script>\n${f.content}\n</script>`).join('\n');
        if (completeHTML.includes('</body>')) {
            completeHTML = completeHTML.replace('</body>', `${jsContent}\n</body>`);
        } else {
            completeHTML = `${completeHTML}\n${jsContent}`;
        }
    }
    
    // Load preview
    try {
        const blob = new Blob([completeHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
        
        // Cleanup
        previewFrame.onload = () => {
            URL.revokeObjectURL(url);
        };
    } catch (error) {
        console.error('Preview error:', error);
        previewSection.innerHTML = `
            <div class="preview-error">
                <p>❌ Could not generate preview</p>
                <p style="font-size: 14px; margin-top: 8px;">${error.message}</p>
            </div>
        `;
    }
    
    // Device selector
    deviceSelector.addEventListener('change', (e) => {
        deviceFrame.className = 'device-frame ' + e.target.value;
    });
    
    // Refresh button
    refreshBtn.addEventListener('click', () => {
        showLivePreview(files);
    });
    
    // Fullscreen button
    fullscreenBtn.addEventListener('click', () => {
        if (previewSection.classList.contains('preview-fullscreen')) {
            previewSection.classList.remove('preview-fullscreen');
            fullscreenBtn.innerHTML = '⛶ Fullscreen';
        } else {
            previewSection.classList.add('preview-fullscreen');
            fullscreenBtn.innerHTML = '✖ Exit Fullscreen';
        }
    });
}

// Create File Block
function createFileBlock(file, index) {
    const block = document.createElement('div');
    block.className = 'file-block expanded'; // Add 'expanded' class by default
    block.innerHTML = `
        <div class="file-header" onclick="toggleFile(${index})" style="cursor: pointer;">
            <span class="file-name">📄 ${escapeHtml(file.name)}</span>
            <div style="display: flex; gap: 10px; align-items: center;">
                <span class="file-lines" style="color: #888; font-size: 12px;">${file.content.split('\n').length} lines</span>
                <button class="copy-file-btn" onclick="event.stopPropagation(); copyFileCode(${index})">
                    📋 Copy
                </button>
                <i class="fas fa-chevron-up" id="icon-${index}" style="color: #888;"></i>
            </div>
        </div>
        <div class="file-content" id="content-${index}" style="display: block;">
            <pre><code class="language-${file.language}">${escapeHtml(file.content)}</code></pre>
        </div>
    `;
    return block;
}

// Toggle file visibility
window.toggleFile = function(index) {
    const content = document.getElementById(`content-${index}`);
    const icon = document.getElementById(`icon-${index}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
    }
};

// Copy Single File Code
window.copyFileCode = function (index) {
    if (!currentProject || !currentProject.files[index]) return;

    const file = currentProject.files[index];
    copyToClipboard(file.content);
    showNotification(`✅ Copied ${file.name} to clipboard`, 'success');
};

// Copy All Code
function copyAllCode() {
    if (!currentProject || !currentProject.files) return;

    let allCode = `# ${currentProject.name}\n\n`;
    allCode += `## File Structure\n${currentProject.structure}\n\n`;
    allCode += `## Files\n\n`;

    currentProject.files.forEach(file => {
        allCode += `### ${file.name}\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n\n`;
    });

    allCode += `## Setup Instructions\n${currentProject.setup}`;

    copyToClipboard(allCode);
    showNotification('✅ Copied all code to clipboard', 'success');
}

// Download Project as ZIP
async function downloadProject() {
    if (!currentProject || !currentProject.files) {
        showNotification('❌ No project to download', 'error');
        return;
    }

    try {
        const zip = new JSZip();
        const projectName = currentProject.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();

        // Add all files to ZIP
        currentProject.files.forEach(file => {
            zip.file(file.name, file.content);
        });

        // Add README with setup instructions
        const readme = `# ${currentProject.name}\n\n## Setup Instructions\n${currentProject.setup}\n\n## File Structure\n\`\`\`\n${currentProject.structure}\n\`\`\``;
        zip.file('README.md', readme);

        // Generate and download ZIP
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('✅ Project downloaded successfully!', 'success');

    } catch (error) {
        console.error('Error downloading project:', error);
        showNotification('❌ Failed to download project', 'error');
    }
}

// Reset Generator
function resetGenerator() {
    projectIdea.value = '';
    outputSection.style.display = 'none';
    currentProject = null;

    // Deselect all tech buttons
    document.querySelectorAll('.tech-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show/Hide Loading
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Utility: Copy to Clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const colors = {
        'info': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'success': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'error': 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

console.log('🚀 JARVIS Project Generator loaded!');

// ===== NEW FEATURES =====

// Theme Toggle
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('#theme-toggle i');
    icon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    showNotification(`${isDarkTheme ? '🌙 Dark' : '☀️ Light'} theme activated`, 'success');
}

// Load Project Templates
function loadProjectTemplates() {
    const templates = [
        {
            icon: '🛒',
            name: 'E-Commerce Store',
            description: 'Complete online store with cart, payments, and admin panel',
            tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            prompt: 'Create a full-featured e-commerce website with product catalog, shopping cart, user authentication, payment integration with Stripe, order management, and admin dashboard'
        },
        {
            icon: '📱',
            name: 'Social Media App',
            description: 'Instagram-like app with posts, likes, comments, and followers',
            tags: ['React', 'Firebase', 'Real-time'],
            prompt: 'Build a social media application with user profiles, image posts, likes, comments, followers system, real-time notifications, and direct messaging'
        },
        {
            icon: '📝',
            name: 'Blog Platform',
            description: 'Modern blogging platform with markdown support',
            tags: ['Next.js', 'MDX', 'SEO'],
            prompt: 'Create a blog platform with markdown editor, syntax highlighting, SEO optimization, categories, tags, comments system, and RSS feed'
        },
        {
            icon: '💬',
            name: 'Chat Application',
            description: 'Real-time chat with rooms and direct messages',
            tags: ['Socket.io', 'Express', 'MongoDB'],
            prompt: 'Build a real-time chat application with chat rooms, direct messaging, file sharing, user presence indicators, typing indicators, and message history'
        },
        {
            icon: '📊',
            name: 'Dashboard Analytics',
            description: 'Business dashboard with charts and metrics',
            tags: ['React', 'Chart.js', 'REST API'],
            prompt: 'Create an analytics dashboard with interactive charts, data tables, filters, export functionality, and real-time data updates'
        },
        {
            icon: '🎮',
            name: 'Game Portal',
            description: 'Browser-based games collection',
            tags: ['Canvas', 'JavaScript', 'Phaser'],
            prompt: 'Build a gaming portal with multiple browser games, leaderboards, user profiles, achievements, and game statistics'
        },
        {
            icon: '🎓',
            name: 'Learning Platform',
            description: 'Online courses with video lessons and quizzes',
            tags: ['React', 'Node.js', 'Video Streaming'],
            prompt: 'Create an e-learning platform with video courses, progress tracking, quizzes, certificates, discussion forums, and instructor dashboard'
        },
        {
            icon: '🏋️',
            name: 'Fitness Tracker',
            description: 'Track workouts, meals, and progress',
            tags: ['React Native', 'Firebase', 'Charts'],
            prompt: 'Build a fitness tracking app with workout logs, meal planning, progress charts, goal setting, and calendar integration'
        }
    ];

    const gridElement = document.getElementById('template-grid');
    if (!gridElement) return;

    gridElement.innerHTML = templates.map(template => `
        <div class="template-card" onclick='useTemplate(${JSON.stringify(template.prompt)})'>
            <h3>${template.icon} ${template.name}</h3>
            <p>${template.description}</p>
            <div class="template-tags">
                ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Use Template
window.useTemplate = function(prompt) {
    document.getElementById('project-idea').value = prompt;
    closeTemplatesModal();
    showNotification('✅ Template loaded! Click Generate Project', 'success');
};

// Modal Functions
function openTemplatesModal() {
    document.getElementById('templates-modal').classList.add('active');
}

window.closeTemplatesModal = function() {
    document.getElementById('templates-modal').classList.remove('active');
};

function openExportModal() {
    if (!currentProject) {
        showNotification('❌ Generate a project first', 'error');
        return;
    }
    document.getElementById('export-modal').classList.add('active');
}

window.closeExportModal = function() {
    document.getElementById('export-modal').classList.remove('active');
};

function openHistoryModal() {
    document.getElementById('history-modal').classList.add('active');
}

window.closeHistoryModal = function() {
    document.getElementById('history-modal').classList.remove('active');
};

window.closeExplanationModal = function() {
    document.getElementById('explanation-modal').classList.remove('active');
};

window.closeOptimizationModal = function() {
    document.getElementById('optimization-modal').classList.remove('active');
};

// Voice Input
let recognition;
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('❌ Voice input not supported in your browser', 'error');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const voiceBtn = document.getElementById('voice-input-btn');
    voiceBtn.classList.add('listening');
    voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('project-idea').value = transcript;
        showNotification('✅ Voice input captured!', 'success');
    };

    recognition.onerror = (event) => {
        showNotification('❌ Voice input error: ' + event.error, 'error');
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };

    recognition.start();
    showNotification('🎤 Listening... Speak now!', 'info');
}

// Explain Code
async function explainCode() {
    if (!currentProject) {
        showNotification('❌ Generate a project first', 'error');
        return;
    }

    document.getElementById('explanation-modal').classList.add('active');
    const contentDiv = document.getElementById('explanation-content');
    contentDiv.innerHTML = '<p>🧠 Analyzing code...</p>';

    try {
        // Get first code file for explanation
        const firstFile = currentProject.files[0];
        
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Explain this code in simple terms with examples:\n\nFile: ${firstFile.name}\n\n${firstFile.content}`
            })
        });

        const data = await response.json();
        contentDiv.innerHTML = `
            <h4>📄 ${firstFile.name}</h4>
            <div class="explanation-content">${data.response.replace(/\n/g, '<br>')}</div>
        `;
    } catch (error) {
        contentDiv.innerHTML = '<p>❌ Failed to generate explanation</p>';
    }
}

// Optimize Code
async function optimizeCode() {
    if (!currentProject) {
        showNotification('❌ Generate a project first', 'error');
        return;
    }

    document.getElementById('optimization-modal').classList.add('active');
    const contentDiv = document.getElementById('optimization-content');
    contentDiv.innerHTML = '<p>⚡ Analyzing code for optimizations...</p>';

    try {
        const allCode = currentProject.files.map(f => `${f.name}:\n${f.content}`).join('\n\n');
        
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Analyze this code and provide optimization suggestions:\n\n${allCode.substring(0, 3000)}`
            })
        });

        const data = await response.json();
        const suggestions = data.response.split('\n').filter(line => line.trim());
        
        contentDiv.innerHTML = `
            <h4>⚡ Optimization Suggestions</h4>
            ${suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('')}
        `;
    } catch (error) {
        contentDiv.innerHTML = '<p>❌ Failed to generate suggestions</p>';
    }
}

// Calculate Code Metrics
function calculateMetrics(project) {
    const fileCount = project.files.length;
    const totalLines = project.files.reduce((sum, file) => sum + file.content.split('\n').length, 0);
    const languages = [...new Set(project.files.map(f => f.language))];
    const qualityScore = Math.min(100, Math.floor((fileCount * 10) + (totalLines / 100) + (languages.length * 5)));

    // Only update if elements exist
    const fileCountEl = document.getElementById('file-count');
    const lineCountEl = document.getElementById('line-count');
    const languageCountEl = document.getElementById('language-count');
    const qualityScoreEl = document.getElementById('quality-score');
    
    if (fileCountEl) fileCountEl.textContent = fileCount;
    if (lineCountEl) lineCountEl.textContent = totalLines.toLocaleString();
    if (languageCountEl) languageCountEl.textContent = languages.length;
    if (qualityScoreEl) qualityScoreEl.textContent = qualityScore + '%';
}

// Save to History
function saveToHistory(project) {
    const historyItem = {
        ...project,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    projectHistory.unshift(historyItem);
    if (projectHistory.length > 10) projectHistory.pop();
    
    localStorage.setItem('projectHistory', JSON.stringify(projectHistory));
    loadProjectHistory();
}

// Load Project History
function loadProjectHistory() {
    const saved = localStorage.getItem('projectHistory');
    if (saved) {
        projectHistory = JSON.parse(saved);
    }
    
    const container = document.getElementById('history-list-container');
    if (!container) return;

    if (projectHistory.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No history yet</p>';
        return;
    }

    container.innerHTML = projectHistory.map(item => `
        <div class="history-item" onclick='loadFromHistory(${item.id})'>
            <div class="history-item-header">
                <span class="history-item-title">${item.name}</span>
                <span class="history-item-date">${new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="history-item-stats">
                <span>📄 ${item.files.length} files</span>
                <span>💻 ${item.files.reduce((sum, f) => sum + f.content.split('\n').length, 0)} lines</span>
            </div>
        </div>
    `).join('');
}

// Load from History
window.loadFromHistory = function(id) {
    const project = projectHistory.find(p => p.id === id);
    if (project) {
        currentProject = project;
        displayProject(project);
        closeHistoryModal();
        showNotification('✅ Project loaded from history', 'success');
    }
};

// Export Functions
window.exportToGitHub = function() {
    showNotification('🚀 Opening GitHub... Create a new repository and upload files', 'info');
    window.open('https://github.com/new', '_blank');
    closeExportModal();
};

window.exportToCodePen = function() {
    if (!currentProject) return;
    
    const htmlFile = currentProject.files.find(f => f.name.endsWith('.html'));
    const cssFile = currentProject.files.find(f => f.name.endsWith('.css'));
    const jsFile = currentProject.files.find(f => f.name.endsWith('.js'));

    const data = {
        title: currentProject.name,
        html: htmlFile?.content || '',
        css: cssFile?.content || '',
        js: jsFile?.content || ''
    };

    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    closeExportModal();
    showNotification('✅ Opening CodePen...', 'success');
};

window.exportToJSFiddle = function() {
    showNotification('🚀 Opening JSFiddle...', 'info');
    window.open('https://jsfiddle.net/', '_blank');
    closeExportModal();
};

window.exportToStackBlitz = function() {
    showNotification('🚀 Opening StackBlitz...', 'info');
    window.open('https://stackblitz.com/', '_blank');
    closeExportModal();
};

window.shareViaEmail = function() {
    if (!currentProject) return;
    
    const subject = encodeURIComponent(`Check out my project: ${currentProject.name}`);
    const body = encodeURIComponent(`I just generated this project:\n\n${currentProject.name}\n\nFiles: ${currentProject.files.length}\nLines: ${currentProject.files.reduce((sum, f) => sum + f.content.split('\n').length, 0)}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    closeExportModal();
};

window.generateQRCode = function() {
    showNotification('📱 QR Code feature coming soon!', 'info');
    closeExportModal();
};
