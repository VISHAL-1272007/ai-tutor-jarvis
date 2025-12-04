/*
 * ===== PROGRESS PAGE JAVASCRIPT =====
 * 
 * SETUP INSTRUCTIONS:
 * 1. Ensure this file is in the same folder as progress.html
 * 2. Progress data stored in localStorage
 * 3. To test locally: Open progress.html in browser
 * 4. To deploy: Copy to Firebase public folder and run 'firebase deploy --only hosting'
 * 5. No backend required - all data is client-side
 * 
 * FEATURES:
 * - Display lessons completed, quizzes taken, XP, badges
 * - Level system based on XP
 * - Course progress tracking
 * - Recent activity feed
 * - Reset progress functionality
 */

// ===== CONFIGURATION =====
const XP_PER_LEVEL = 100;

// ===== BADGES DATA =====
const badges = [
    {
        id: 'first-lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        requirement: 'lessons',
        threshold: 1
    },
    {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Take your first quiz',
        icon: '📝',
        requirement: 'quizzes',
        threshold: 1
    },
    {
        id: 'dedicated-learner',
        name: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: '📚',
        requirement: 'lessons',
        threshold: 10
    },
    {
        id: 'quiz-champion',
        name: 'Quiz Champion',
        description: 'Take 5 quizzes',
        icon: '🏆',
        requirement: 'quizzes',
        threshold: 5
    },
    {
        id: 'xp-warrior',
        name: 'XP Warrior',
        description: 'Earn 500 XP',
        icon: '⚡',
        requirement: 'xp',
        threshold: 500
    },
    {
        id: 'level-master',
        name: 'Level Master',
        description: 'Reach Level 5',
        icon: '🌟',
        requirement: 'level',
        threshold: 5
    }
];

// ===== COURSE DATA (same as courses.js) =====
const coursesInfo = {
    'python-basics': { title: 'Python Basics', lessonCount: 8 },
    'java-basics': { title: 'Java Basics', lessonCount: 10 },
    'iot-fundamentals': { title: 'IoT Fundamentals', lessonCount: 12 },
    'web-development': { title: 'Web Development', lessonCount: 15 },
    'data-structures': { title: 'Data Structures', lessonCount: 14 },
    'machine-learning': { title: 'Machine Learning', lessonCount: 16 }
};

// ===== DOM ELEMENTS =====
const lessonsCompletedEl = document.getElementById('lessonsCompleted');
const quizzesTakenEl = document.getElementById('quizzesTaken');
const totalXPEl = document.getElementById('totalXP');
const badgesEarnedEl = document.getElementById('badgesEarned');
const currentLevelEl = document.getElementById('currentLevel');
const currentXPEl = document.getElementById('currentXP');
const nextLevelXPEl = document.getElementById('nextLevelXP');
const xpFillEl = document.getElementById('xpFill');
const badgesGridEl = document.getElementById('badgesGrid');
const courseProgressListEl = document.getElementById('courseProgressList');
const activityListEl = document.getElementById('activityList');
const resetBtn = document.getElementById('resetBtn');

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Progress page loaded');
    loadProgress();
    setupEventListeners();
});

// ===== LOAD PROGRESS =====
function loadProgress() {
    // Get data from localStorage
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || {};
    const quizResults = JSON.parse(localStorage.getItem('quizResults')) || {};
    const totalXP = parseInt(localStorage.getItem('totalXP')) || 0;
    
    // Calculate stats
    let totalLessonsCompleted = 0;
    Object.values(completedLessons).forEach(lessons => {
        totalLessonsCompleted += lessons.length;
    });
    
    let totalQuizzes = 0;
    Object.values(quizResults).forEach(moduleQuizzes => {
        totalQuizzes += Object.keys(moduleQuizzes).length;
    });
    
    const earnedBadges = calculateEarnedBadges(totalLessonsCompleted, totalQuizzes, totalXP);
    const level = calculateLevel(totalXP);
    const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
    const xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
    
    // Update UI
    lessonsCompletedEl.textContent = totalLessonsCompleted;
    quizzesTakenEl.textContent = totalQuizzes;
    totalXPEl.textContent = totalXP;
    badgesEarnedEl.textContent = earnedBadges.length;
    currentLevelEl.textContent = level;
    currentXPEl.textContent = xpInCurrentLevel;
    nextLevelXPEl.textContent = XP_PER_LEVEL;
    xpFillEl.style.width = `${xpProgress}%`;
    
    // Render sections
    renderBadges(earnedBadges, totalLessonsCompleted, totalQuizzes, totalXP, level);
    renderCourseProgress(completedLessons);
    renderActivity(completedLessons, quizResults);
    
    console.log('✅ Progress loaded:', { totalLessonsCompleted, totalQuizzes, totalXP, level });
}

// ===== CALCULATE LEVEL =====
function calculateLevel(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// ===== CALCULATE EARNED BADGES =====
function calculateEarnedBadges(lessons, quizzes, xp) {
    const level = calculateLevel(xp);
    const earned = [];
    
    badges.forEach(badge => {
        let isEarned = false;
        
        switch (badge.requirement) {
            case 'lessons':
                isEarned = lessons >= badge.threshold;
                break;
            case 'quizzes':
                isEarned = quizzes >= badge.threshold;
                break;
            case 'xp':
                isEarned = xp >= badge.threshold;
                break;
            case 'level':
                isEarned = level >= badge.threshold;
                break;
        }
        
        if (isEarned) {
            earned.push(badge.id);
        }
    });
    
    return earned;
}

// ===== RENDER BADGES =====
function renderBadges(earnedBadges, lessons, quizzes, xp, level) {
    badgesGridEl.innerHTML = badges.map(badge => {
        const isEarned = earnedBadges.includes(badge.id);
        
        return `
            <div class="badge-item ${isEarned ? 'earned' : 'locked'}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.description}</div>
                ${isEarned ? '<div style="color: #00c853; margin-top: 0.5rem;">✓ Earned</div>' : '<div style="color: #999; margin-top: 0.5rem;">🔒 Locked</div>'}
            </div>
        `;
    }).join('');
}

// ===== RENDER COURSE PROGRESS =====
function renderCourseProgress(completedLessons) {
    const progressHTML = Object.entries(coursesInfo).map(([courseId, courseInfo]) => {
        const completed = completedLessons[courseId]?.length || 0;
        const total = courseInfo.lessonCount;
        const percentage = Math.round((completed / total) * 100);
        
        return `
            <div class="course-progress-item">
                <div class="course-progress-header">
                    <h3>${courseInfo.title}</h3>
                    <span class="course-progress-percentage">${percentage}%</span>
                </div>
                <div class="course-progress-bar">
                    <div class="course-progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="course-progress-info">
                    <span>${completed} / ${total} lessons completed</span>
                    <a href="courses.html" style="color: #00d4ff; text-decoration: none;">Continue →</a>
                </div>
            </div>
        `;
    }).join('');
    
    courseProgressListEl.innerHTML = progressHTML || '<p style="text-align: center; color: #999;">No progress yet. Start learning!</p>';
}

// ===== RENDER ACTIVITY =====
function renderActivity(completedLessons, quizResults) {
    const activities = [];
    
    // Add completed lessons
    Object.entries(completedLessons).forEach(([moduleId, lessons]) => {
        lessons.forEach(lessonId => {
            activities.push({
                type: 'lesson',
                module: coursesInfo[moduleId]?.title || moduleId,
                lessonId,
                time: 'Recently'
            });
        });
    });
    
    // Add quiz results
    Object.entries(quizResults).forEach(([moduleId, moduleQuizzes]) => {
        Object.entries(moduleQuizzes).forEach(([lessonId, result]) => {
            activities.push({
                type: 'quiz',
                module: coursesInfo[moduleId]?.title || moduleId,
                lessonId,
                score: result.percentage,
                time: formatDate(result.date)
            });
        });
    });
    
    // Sort by most recent (simplified - would need actual timestamps in production)
    activities.reverse();
    
    // Limit to 10 most recent
    const recentActivities = activities.slice(0, 10);
    
    if (recentActivities.length === 0) {
        activityListEl.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No activity yet. Start learning!</p>';
        return;
    }
    
    activityListEl.innerHTML = recentActivities.map(activity => {
        if (activity.type === 'lesson') {
            return `
                <div class="activity-item">
                    <div class="activity-icon" style="background: linear-gradient(135deg, #00d4ff, #0066ff);">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="activity-content">
                        <h4>Completed Lesson ${activity.lessonId}</h4>
                        <p>${activity.module}</p>
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;
        } else {
            const scoreColor = activity.score >= 70 ? '#00c853' : '#ff6f00';
            return `
                <div class="activity-item">
                    <div class="activity-icon" style="background: linear-gradient(135deg, #ff6f00, #ff8f00);">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="activity-content">
                        <h4>Completed Quiz - Lesson ${activity.lessonId}</h4>
                        <p>${activity.module} • <span style="color: ${scoreColor}; font-weight: 600;">${activity.score}%</span></p>
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;
        }
    }).join('');
}

// ===== FORMAT DATE =====
function formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
}

// ===== RESET PROGRESS =====
function resetProgress() {
    const confirmed = confirm('Are you sure you want to reset all your progress? This action cannot be undone.');
    
    if (confirmed) {
        // Clear all progress from localStorage
        localStorage.removeItem('completedLessons');
        localStorage.removeItem('quizResults');
        localStorage.removeItem('totalXP');
        localStorage.removeItem('courseProgress');
        
        // Reload page
        window.location.reload();
        
        console.log('🔄 Progress reset');
    }
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    resetBtn.addEventListener('click', resetProgress);
}

console.log('✅ Progress JavaScript loaded successfully');
