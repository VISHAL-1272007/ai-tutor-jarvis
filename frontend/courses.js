/*
 * ===== COURSES PAGE JAVASCRIPT =====
 * 
 * SETUP INSTRUCTIONS:
 * 1. Ensure this file is in the same folder as courses.html
 * 2. Backend URL is set below (currently points to your existing backend)
 * 3. Configure Moodle API in moodle-api.js for live course data
 * 4. To test locally: Open courses.html in browser (no server needed for basic functionality)
 * 5. To deploy: Copy to Firebase public folder and run 'firebase deploy --only hosting'
 * 6. Firebase config not needed here (stateless page, uses localStorage only)
 * 
 * FEATURES:
 * - Display course modules with metadata
 * - Search/filter functionality
 * - Navigate to lesson pages with URL params
 * - Moodle API integration for live courses
 * - Fallback to local data if Moodle not configured
 * - Responsive design with mobile support
 */

// ===== CONFIGURATION =====
const BACKEND_URL = 'https://ai-tutor-jarvis.onrender.com';
const USE_MOODLE = false; // Set to true to enable Moodle API integration (requires setup)

// ===== COURSE DATA =====
// In production, this could come from Firebase Firestore or your backend
const courses = [
    {
        id: 'python-basics',
        title: 'Python Basics',
        description: 'Learn Python fundamentals: variables, loops, functions, and object-oriented programming. Perfect for beginners!',
        icon: 'fa-python',
        lessonCount: 8,
        duration: '4 weeks',
        level: 'Beginner',
        color: '#3776ab'
    },
    {
        id: 'java-basics',
        title: 'Java Basics',
        description: 'Master Java fundamentals: syntax, classes, inheritance, and exception handling. Build solid foundations.',
        icon: 'fa-java',
        lessonCount: 10,
        duration: '5 weeks',
        level: 'Beginner',
        color: '#f89820'
    },
    {
        id: 'iot-fundamentals',
        title: 'IoT Fundamentals',
        description: 'Explore Internet of Things: sensors, microcontrollers, connectivity, and smart device programming.',
        icon: 'fa-microchip',
        lessonCount: 12,
        duration: '6 weeks',
        level: 'Intermediate',
        color: '#00d4ff'
    },
    {
        id: 'web-development',
        title: 'Web Development',
        description: 'Build modern websites with HTML, CSS, and JavaScript. Learn responsive design and web APIs.',
        icon: 'fa-code',
        lessonCount: 15,
        duration: '8 weeks',
        level: 'Beginner',
        color: '#e44d26'
    },
    {
        id: 'data-structures',
        title: 'Data Structures',
        description: 'Master algorithms and data structures: arrays, linked lists, trees, graphs, sorting, and searching.',
        icon: 'fa-project-diagram',
        lessonCount: 14,
        duration: '7 weeks',
        level: 'Intermediate',
        color: '#764abc'
    },
    {
        id: 'machine-learning',
        title: 'Machine Learning',
        description: 'Introduction to AI and ML: regression, classification, neural networks, and practical applications.',
        icon: 'fa-brain',
        lessonCount: 16,
        duration: '10 weeks',
        level: 'Advanced',
        color: '#ff6f00'
    },
    {
        id: 'docker-basics',
        title: 'Docker Basics',
        description: 'Master containerization with Docker. Learn images, containers, volumes, networking, and Docker Compose.',
        icon: 'fa-docker',
        lessonCount: 6,
        duration: '3 weeks',
        level: 'Intermediate',
        color: '#2496ed'
    }
];

// ===== DOM ELEMENTS =====
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.getElementById('searchInput');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

// ===== STATE =====
let allCourses = [...courses]; // Store all courses (local + Moodle)

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📚 Courses page loaded');

    // Show loading state
    showLoading();

    // Try to load Moodle courses if configured
    if (USE_MOODLE && window.moodleAPI && window.moodleAPI.isConfigured) {
        await loadMoodleCourses();
    } else {
        console.log('📦 Using local course data');
    }

    renderCourses(allCourses);
    setupEventListeners();
    loadUserProgress();
});

// ===== LOAD MOODLE COURSES =====
async function loadMoodleCourses() {
    try {
        console.log('🔄 Loading courses from Moodle...');
        const moodleCourses = await window.moodleAPI.getCourses();

        if (moodleCourses && moodleCourses.length > 0) {
            console.log(`✅ Loaded ${moodleCourses.length} courses from Moodle`);

            // Transform Moodle courses to our format
            const transformedCourses = moodleCourses
                .filter(course => course.id !== 1) // Skip site course
                .map(course => window.moodleAPI.transformCourse(course));

            // Get lesson counts for each course
            for (const course of transformedCourses) {
                const modules = await window.moodleAPI.getCourseModules(course.moodleId);
                if (modules) {
                    course.lessonCount = modules.length;
                }
            }

            // Merge with local courses (Moodle courses first)
            allCourses = [...transformedCourses, ...courses];
            console.log(`✅ Total courses available: ${allCourses.length}`);
        }
    } catch (error) {
        console.error('❌ Error loading Moodle courses:', error);
        console.log('📦 Falling back to local courses');
    }
}

// ===== SHOW LOADING =====
function showLoading() {
    coursesGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading courses...</p>
        </div>
    `;
}

// ===== RENDER COURSES =====
function renderCourses(coursesToRender) {
    if (coursesToRender.length === 0) {
        coursesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-search"></i>
                <p>No courses found</p>
            </div>
        `;
        return;
    }

    coursesGrid.innerHTML = coursesToRender.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <div class="course-header" style="background: linear-gradient(135deg, ${course.color}, ${adjustColor(course.color, -20)})">
                <div class="course-icon">
                    <i class="fab ${course.icon}"></i>
                </div>
                <h3>${course.title}</h3>
            </div>
            <div class="course-body">
                <p>${course.description}</p>
                <div class="course-meta">
                    <span><i class="fas fa-book"></i> ${course.lessonCount} Lessons</span>
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                </div>
                <div class="course-meta">
                    <span><i class="fas fa-signal"></i> ${course.level}</span>
                    <span><i class="fas fa-check-circle"></i> <span class="progress-text">0/${course.lessonCount}</span></span>
                </div>
                <button class="open-btn" onclick="openCourse('${course.id}')">
                    <i class="fas fa-play"></i> Start Learning
                </button>
            </div>
        </div>
    `).join('');
}

// ===== SEARCH FUNCTIONALITY =====
function setupEventListeners() {
    // Search filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCourses = allCourses.filter(course =>
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm) ||
                course.level.toLowerCase().includes(searchTerm)
            );
            renderCourses(filteredCourses);
        });
    }

    // Mobile menu (basic toggle)
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            }
        });
    }
}

// ===== OPEN COURSE =====
function openCourse(courseId) {
    console.log(`🚀 Opening course: ${courseId}`);
    // Navigate to first lesson
    window.location.href = `lesson.html?module=${courseId}&lesson=1`;
}

// ===== LOAD USER PROGRESS =====
function loadUserProgress() {
    // Load progress from localStorage
    const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};

    allCourses.forEach(course => {
        const courseProgress = progress[course.id] || [];
        const completedCount = courseProgress.length;

        // Update progress display
        const progressText = document.querySelector(`[data-course-id="${course.id}"] .progress-text`);
        if (progressText) {
            progressText.textContent = `${completedCount}/${course.lessonCount}`;
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function adjustColor(color, amount) {
    // Darken/lighten hex color
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ===== EXPOSE FUNCTION TO GLOBAL SCOPE =====
window.openCourse = openCourse;

console.log('✅ Courses JavaScript loaded successfully');
