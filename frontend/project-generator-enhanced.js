// ===== ENHANCED PROJECT GENERATOR - ADD THESE IMPROVEMENTS =====

// Add this to your existing project-generator.js file

// 1. Add smooth scroll to output
function smoothScrollToOutput() {
    outputSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// 2. Add character counter for project idea
const projectIdeaInput = document.getElementById('project-idea');
if (projectIdeaInput) {
    // Create counter element
    const charCounter = document.createElement('div');
    charCounter.id = 'idea-char-counter';
    charCounter.style.cssText = `
        font-size: 12px;
        color: var(--text-tertiary);
        text-align: right;
        margin-top: 8px;
        font-family: 'JetBrains Mono', monospace;
    `;
    projectIdeaInput.parentNode.insertBefore(charCounter, projectIdeaInput.nextSibling);

    // Update counter
    function updateCharCount() {
        const length = projectIdeaInput.value.length;
        charCounter.textContent = `${length} characters`;

        if (length < 10) {
            charCounter.style.color = 'var(--error)';
        } else if (length < 50) {
            charCounter.style.color = 'var(--warning)';
        } else {
            charCounter.style.color = 'var(--success)';
        }
    }

    projectIdeaInput.addEventListener('input', updateCharCount);
    updateCharCount();
}

// 3. Add tech stack quick select buttons
function addTechStackButtons() {
    const techStackSelect = document.getElementById('tech-stack');
    if (!techStackSelect) return;

    const quickButtons = document.createElement('div');
    quickButtons.className = 'tech-quick-select';
    quickButtons.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
    `;

    const techStacks = [
        { value: 'react', label: '⚛️ React', color: '#61dafb' },
        { value: 'vue', label: '💚 Vue', color: '#42b883' },
        { value: 'python-flask', label: '🐍 Python', color: '#3776ab' },
        { value: 'nextjs', label: '▲ Next.js', color: '#000000' },
        { value: 'mern', label: '🍃 MERN', color: '#00d084' }
    ];

    techStacks.forEach(tech => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = tech.label;
        btn.style.cssText = `
            padding: 6px 14px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-default);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        btn.addEventListener('click', () => {
            techStackSelect.value = tech.value;
            techStackSelect.dispatchEvent(new Event('change'));

            // Visual feedback
            btn.style.transform = 'scale(1.05)';
            btn.style.borderColor = tech.color;
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = tech.color;
            btn.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = 'var(--border-default)';
            btn.style.transform = 'translateY(0)';
        });

        quickButtons.appendChild(btn);
    });

    techStackSelect.parentNode.appendChild(quickButtons);
}

// 4. Add feature presets
function addFeaturePresets() {
    const featuresSection = document.querySelector('.features-section');
    if (!featuresSection) return;

    const presetsDiv = document.createElement('div');
    presetsDiv.style.cssText = `
        margin-bottom: 16px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    `;

    const presets = [
        {
            name: '🚀 Starter',
            features: { auth: true }
        },
        {
            name: '💼 Full-Stack',
            features: { auth: true, database: true, api: true }
        },
        {
            name: '🎯 Production',
            features: { auth: true, database: true, api: true, tests: true, docker: true, 'ci-cd': true }
        },
        {
            name: '🧹 Clear All',
            features: {}
        }
    ];

    presets.forEach(preset => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = preset.name;
        btn.style.cssText = `
            padding: 8px 16px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-default);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        btn.addEventListener('click', () => {
            // Uncheck all first
            document.querySelectorAll('.features-section input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });

            // Check preset features
            Object.keys(preset.features).forEach(feature => {
                const checkbox = document.getElementById(feature);
                if (checkbox) checkbox.checked = preset.features[feature];
            });

            // Visual feedback
            btn.style.transform = 'scale(1.05)';
            btn.style.borderColor = 'var(--primary-500)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                btn.style.borderColor = 'var(--border-default)';
            }, 200);
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = 'var(--primary-500)';
            btn.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = 'var(--border-default)';
            btn.style.transform = 'translateY(0)';
        });

        presetsDiv.appendChild(btn);
    });

    // Insert before features grid
    const label = featuresSection.querySelector('label');
    label.parentNode.insertBefore(presetsDiv, label.nextSibling);
}

// 5. Add example ideas button
function addExampleIdeas() {
    const projectIdea = document.getElementById('project-idea');
    if (!projectIdea) return;

    const examplesBtn = document.createElement('button');
    examplesBtn.type = 'button';
    examplesBtn.textContent = '💡 Example Ideas';
    examplesBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px 12px;
        background: var(--primary-600);
        border: none;
        border-radius: 6px;
        color: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
    `;

    const examples = [
        "A todo app with React, Firebase authentication, and real-time updates",
        "E-commerce website with product catalog, shopping cart, and Stripe payment integration",
        "Blog platform with Markdown editor, user authentication, and comment system",
        "Weather dashboard showing forecasts, maps, and historical data",
        "Social media clone with posts, likes, comments, and user profiles",
        "Task management system with teams, projects, and deadline tracking",
        "Recipe sharing platform with search, ratings, and favorite collections",
        "Chat application with real-time messaging and file sharing",
        "Portfolio website with project showcase and contact form",
        "Fitness tracker with workout logging and progress charts"
    ];

    examplesBtn.addEventListener('click', () => {
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        projectIdea.value = randomExample;
        projectIdea.dispatchEvent(new Event('input'));

        // Visual feedback
        examplesBtn.textContent = '✨ Idea Added!';
        setTimeout(() => {
            examplesBtn.textContent = '💡 Example Ideas';
        }, 2000);
    });

    examplesBtn.addEventListener('mouseenter', () => {
        examplesBtn.style.background = 'var(--primary-700)';
        examplesBtn.style.transform = 'translateY(-2px)';
    });

    examplesBtn.addEventListener('mouseleave', () => {
        examplesBtn.style.background = 'var(--primary-600)';
        examplesBtn.style.transform = 'translateY(0)';
    });

    // Make parent relative
    projectIdea.parentNode.style.position = 'relative';
    projectIdea.parentNode.appendChild(examplesBtn);
}

// 6. Add keyboard shortcuts info
function addKeyboardShortcuts() {
    const inputCard = document.querySelector('.input-card');
    if (!inputCard) return;

    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.style.cssText = `
        margin-top: 16px;
        padding: 12px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        border-radius: 8px;
        font-size: 12px;
        color: var(--text-tertiary);
        text-align: center;
    `;
    shortcutsInfo.innerHTML = `
        💡 <strong>Tip:</strong> Press <kbd style="padding: 2px 6px; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 4px;">Ctrl</kbd> + 
        <kbd style="padding: 2px 6px; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 4px;">Enter</kbd> 
        to generate project
    `;

    inputCard.appendChild(shortcutsInfo);
}

// 7. Add progress bar for generation
function showProgressBar() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (!loadingSpinner) return;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 300px;
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 20px;
    `;

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, var(--primary-500), var(--primary-700));
        transition: width 0.3s ease;
        animation: progressGlow 2s ease-in-out infinite;
    `;

    progressBar.appendChild(progressFill);
    loadingSpinner.appendChild(progressBar);

    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
    }, 500);

    // Return function to complete progress
    return () => {
        clearInterval(interval);
        progressFill.style.width = '100%';
        setTimeout(() => progressBar.remove(), 500);
    };
}

// 8. Add copy success animation
function enhanceCopyButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-file-btn') ||
            e.target.closest('.copy-file-btn')) {

            const btn = e.target.classList.contains('copy-file-btn')
                ? e.target
                : e.target.closest('.copy-file-btn');

            const originalText = btn.textContent;

            // Success animation
            btn.style.background = 'var(--success)';
            btn.textContent = '✅ Copied!';

            setTimeout(() => {
                btn.style.background = 'var(--primary-600)';
                btn.textContent = originalText;
            }, 2000);
        }
    });
}

// 9. Initialize all enhancements
function initEnhancements() {
    console.log('🚀 Initializing Project Generator enhancements...');

    addTechStackButtons();
    addFeaturePresets();
    addExampleIdeas();
    addKeyboardShortcuts();
    enhanceCopyButtons();

    console.log('✅ Enhancements loaded!');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
    initEnhancements();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        smoothScrollToOutput,
        showProgressBar
    };
}