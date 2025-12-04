// ===== JARVIS SMART LEARNING DASHBOARD =====
// Gamification system with XP, levels, badges, skill tree, and leaderboard

import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from './firebase-config.js';

let currentUser = null;
let userData = null;

// Level System Configuration
const LEVEL_CONFIG = {
    1: { xpRequired: 100, title: 'Beginner' },
    2: { xpRequired: 250, title: 'Junior Developer' },
    3: { xpRequired: 500, title: 'Developer' },
    4: { xpRequired: 1000, title: 'Senior Developer' },
    5: { xpRequired: 2000, title: 'Expert' },
    6: { xpRequired: 4000, title: 'Master' },
    7: { xpRequired: 8000, title: 'Guru' },
    8: { xpRequired: 16000, title: 'Legend' }
};

// Badge Definitions
const BADGES = [
    { id: 'first_chat', name: 'First Steps', icon: '👋', desc: 'Send your first message', xp: 10 },
    { id: 'week_streak', name: 'Consistent Learner', icon: '🔥', desc: '7-day learning streak', xp: 50 },
    { id: 'month_streak', name: 'Dedication Master', icon: '💎', desc: '30-day learning streak', xp: 200 },
    { id: 'first_code', name: 'Code Rookie', icon: '💻', desc: 'Run your first code', xp: 25 },
    { id: 'code_master', name: 'Code Master', icon: '⚡', desc: 'Run 100 codes', xp: 150 },
    { id: 'bug_hunter', name: 'Bug Hunter', icon: '🐛', desc: 'Debug 50 errors', xp: 100 },
    { id: 'speed_coder', name: 'Speed Coder', icon: '🚀', desc: 'Complete project in 1 hour', xp: 75 },
    { id: 'night_owl', name: 'Night Owl', icon: '🦉', desc: 'Code after midnight', xp: 30 },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', desc: 'Learn before 6 AM', xp: 30 },
    { id: 'project_starter', name: 'Project Starter', icon: '🎯', desc: 'Generate first project', xp: 40 },
    { id: 'project_master', name: 'Project Master', icon: '🏆', desc: 'Complete 10 projects', xp: 250 },
    { id: 'course_complete', name: 'Course Graduate', icon: '🎓', desc: 'Complete any course', xp: 100 }
];

// Skill Tree Structure
const SKILL_TREE = {
    tier1: [
        { id: 'html', name: 'HTML', icon: '📄', xpCost: 0 },
        { id: 'css', name: 'CSS', icon: '🎨', xpCost: 0 }
    ],
    tier2: [
        { id: 'javascript', name: 'JavaScript', icon: '⚡', xpCost: 100, requires: ['html', 'css'] },
        { id: 'git', name: 'Git', icon: '🔀', xpCost: 50, requires: [] }
    ],
    tier3: [
        { id: 'react', name: 'React', icon: '⚛️', xpCost: 200, requires: ['javascript'] },
        { id: 'nodejs', name: 'Node.js', icon: '🟢', xpCost: 200, requires: ['javascript'] },
        { id: 'python', name: 'Python', icon: '🐍', xpCost: 150, requires: [] }
    ],
    tier4: [
        { id: 'typescript', name: 'TypeScript', icon: '📘', xpCost: 300, requires: ['javascript', 'react'] },
        { id: 'mongodb', name: 'MongoDB', icon: '🍃', xpCost: 250, requires: ['nodejs'] },
        { id: 'django', name: 'Django', icon: '🎸', xpCost: 300, requires: ['python'] }
    ]
};

// Initialize
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserData();
        renderDashboard();
    } else {
        // Not logged in - redirect to login page
        console.log('⚠️ User not authenticated, redirecting to login...');
        window.location.href = 'login.html';
    }
});

// Load User Data
async function loadUserData() {
    try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            userData = docSnap.data();
        } else {
            // Initialize new user data
            userData = {
                xp: 0,
                level: 1,
                streak: 0,
                lastActiveDate: new Date().toDateString(),
                coursesCompleted: 0,
                projectsBuilt: 0,
                hoursLearned: 0,
                badges: [],
                unlockedSkills: ['html', 'css'],
                totalMessages: 0,
                codeRuns: 0,
                debugSessions: 0
            };
            await setDoc(docRef, userData);
        }

        // Update streak
        await updateStreak();

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Update Streak
async function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = userData.lastActiveDate;

    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastActive === yesterdayStr) {
            // Continue streak
            userData.streak = (userData.streak || 0) + 1;
        } else {
            // Reset streak
            userData.streak = 1;
        }

        userData.lastActiveDate = today;

        await updateDoc(doc(db, 'users', currentUser.uid), {
            streak: userData.streak,
            lastActiveDate: userData.lastActiveDate
        });

        // Check streak badges
        if (userData.streak === 7) {
            await unlockBadge('week_streak');
        } else if (userData.streak === 30) {
            await unlockBadge('month_streak');
        }
    }
}

// Add XP
async function addXP(amount, reason = '') {
    userData.xp += amount;

    // Check for level up
    let newLevel = userData.level;
    for (let level in LEVEL_CONFIG) {
        if (userData.xp >= LEVEL_CONFIG[level].xpRequired) {
            newLevel = parseInt(level);
        }
    }

    if (newLevel > userData.level) {
        userData.level = newLevel;
        showNotification(`🎉 Level Up! You are now Level ${newLevel}!`, 'success');
    }

    await updateDoc(doc(db, 'users', currentUser.uid), {
        xp: userData.xp,
        level: userData.level
    });

    renderDashboard();
}

// Unlock Badge
async function unlockBadge(badgeId) {
    if (!userData.badges) userData.badges = [];

    if (!userData.badges.includes(badgeId)) {
        userData.badges.push(badgeId);
        const badge = BADGES.find(b => b.id === badgeId);

        if (badge) {
            await addXP(badge.xp);
            showAchievementNotification(badge.name);

            await updateDoc(doc(db, 'users', currentUser.uid), {
                badges: userData.badges
            });
        }
    }
}

// Unlock Skill
async function unlockSkill(skillId) {
    if (!userData.unlockedSkills) userData.unlockedSkills = ['html', 'css'];

    if (!userData.unlockedSkills.includes(skillId)) {
        // Find skill and check requirements
        let skill = null;
        let skillCost = 0;

        for (let tier in SKILL_TREE) {
            const found = SKILL_TREE[tier].find(s => s.id === skillId);
            if (found) {
                skill = found;
                skillCost = found.xpCost;
                break;
            }
        }

        if (!skill) return;

        // Check if user has enough XP
        if (userData.xp < skillCost) {
            showNotification(`❌ Need ${skillCost} XP to unlock ${skill.name}`, 'error');
            return;
        }

        // Check prerequisites
        const hasPrereqs = skill.requires.every(req => userData.unlockedSkills.includes(req));
        if (!hasPrereqs) {
            showNotification(`❌ Complete prerequisites first`, 'error');
            return;
        }

        // Unlock skill
        userData.unlockedSkills.push(skillId);
        userData.xp -= skillCost;

        await updateDoc(doc(db, 'users', currentUser.uid), {
            unlockedSkills: userData.unlockedSkills,
            xp: userData.xp
        });

        showNotification(`🌟 Unlocked ${skill.name}!`, 'success');
        renderDashboard();
    }
}

// Render Dashboard
function renderDashboard() {
    // User Info
    document.getElementById('userName').textContent = currentUser.displayName || 'Learning Master';
    document.getElementById('userTitle').textContent = LEVEL_CONFIG[userData.level]?.title || 'Beginner';

    // Streak
    document.getElementById('streakDays').textContent = userData.streak || 0;

    // Level & XP
    document.getElementById('userLevel').textContent = userData.level;
    const nextLevel = userData.level + 1;
    const currentLevelXP = LEVEL_CONFIG[userData.level]?.xpRequired || 0;
    const nextLevelXP = LEVEL_CONFIG[nextLevel]?.xpRequired || userData.xp;
    const xpProgress = ((userData.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    document.getElementById('currentXP').textContent = userData.xp;
    document.getElementById('nextLevelXP').textContent = nextLevelXP;
    document.getElementById('xpFill').style.width = `${Math.min(xpProgress, 100)}%`;

    // Stats
    document.getElementById('coursesCompleted').textContent = userData.coursesCompleted || 0;
    document.getElementById('projectsBuilt').textContent = userData.projectsBuilt || 0;
    document.getElementById('hoursLearned').textContent = userData.hoursLearned || 0;
    document.getElementById('totalAchievements').textContent = userData.badges?.length || 0;

    // Badges
    renderBadges();

    // Skill Tree
    renderSkillTree();

    // Activity Chart
    renderActivityChart();

    // Leaderboard
    renderLeaderboard();
}

// Render Badges
function renderBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';

    BADGES.forEach(badge => {
        const unlocked = userData.badges?.includes(badge.id);
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${unlocked ? 'unlocked' : 'locked'}`;
        badgeCard.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.desc}</div>
        `;
        badgesGrid.appendChild(badgeCard);
    });
}

// Render Skill Tree
function renderSkillTree() {
    const skillTree = document.getElementById('skillTree');
    skillTree.innerHTML = '';

    for (let tier in SKILL_TREE) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'skill-level';

        SKILL_TREE[tier].forEach(skill => {
            const unlocked = userData.unlockedSkills?.includes(skill.id);
            const canUnlock = skill.requires.every(req => userData.unlockedSkills?.includes(req));

            const skillNode = document.createElement('div');
            skillNode.className = `skill-node ${unlocked ? 'unlocked' : (canUnlock ? 'available' : 'locked')}`;
            skillNode.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
            `;

            if (!unlocked && canUnlock) {
                skillNode.style.cursor = 'pointer';
                skillNode.addEventListener('click', () => unlockSkill(skill.id));
            }

            levelDiv.appendChild(skillNode);
        });

        skillTree.appendChild(levelDiv);
    }
}

// Render Activity Chart
function renderActivityChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');

    // Sample data - replace with real data from Firestore
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'XP Earned',
                data: [20, 45, 30, 60, 50, 80, 40],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: { family: 'Rajdhani' }
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#8892b0' },
                    grid: { color: 'rgba(0, 212, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#8892b0' },
                    grid: { color: 'rgba(0, 212, 255, 0.1)' }
                }
            }
        }
    });
}

// Render Leaderboard
async function renderLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        let rank = 1;

        snapshot.forEach(docSnap => {
            const user = docSnap.data();
            const isCurrentUser = docSnap.id === currentUser.uid;

            const entry = document.createElement('div');
            entry.className = `leaderboard-entry ${rank <= 3 ? `top-${rank}` : ''}`;
            entry.innerHTML = `
                <div class="leaderboard-rank">${rank}</div>
                <div class="leaderboard-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${user.displayName || 'Anonymous'} ${isCurrentUser ? '(You)' : ''}</div>
                    <div class="leaderboard-title">${LEVEL_CONFIG[user.level]?.title || 'Beginner'}</div>
                </div>
                <div class="leaderboard-xp">${user.xp} XP</div>
            `;

            leaderboard.appendChild(entry);
            rank++;
        });

    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Show Achievement Notification
function showAchievementNotification(achievementName) {
    const notification = document.getElementById('achievementNotification');
    document.getElementById('achievementName').textContent = achievementName;

    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
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
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions for use in other modules
window.addXP = addXP;
window.unlockBadge = unlockBadge;
window.unlockSkill = unlockSkill;

console.log('📊 JARVIS Dashboard loaded!');
