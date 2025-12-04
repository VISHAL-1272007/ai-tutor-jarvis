// ============================================================================
// JARVIS LEARNING HUB - PROFESSIONAL LOGIC
// Handles course data, filtering, sorting, and interactions
// ============================================================================

// Course Data (Mock Database)
const coursesData = [
    {
        id: 1,
        title: "Complete Python Mastery: From Zero to Hero",
        description: "Master Python programming with real-world projects. Learn data structures, algorithms, web development with Django, and AI basics.",
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "programming",
        difficulty: "beginner",
        rating: 4.9,
        students: 12500,
        duration: "45h",
        lessons: 120
    },
    {
        id: 2,
        title: "IoT & Arduino: Build Smart Devices",
        description: "Hands-on guide to Internet of Things. Build home automation systems, weather stations, and smart robots using Arduino and ESP32.",
        image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "iot",
        difficulty: "intermediate",
        rating: 4.8,
        students: 8300,
        duration: "32h",
        lessons: 85
    },
    {
        id: 3,
        title: "Artificial Intelligence & Machine Learning",
        description: "Deep dive into AI. Learn neural networks, computer vision, and NLP using TensorFlow and PyTorch. Build your own AI models.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "ai",
        difficulty: "advanced",
        rating: 4.9,
        students: 15000,
        duration: "60h",
        lessons: 150
    },
    {
        id: 4,
        title: "Modern Web Development Bootcamp",
        description: "Become a full-stack developer. HTML5, CSS3, JavaScript, React, Node.js, and MongoDB. Build professional websites.",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "web",
        difficulty: "beginner",
        rating: 4.7,
        students: 22000,
        duration: "55h",
        lessons: 140
    },
    {
        id: 5,
        title: "Cybersecurity: Ethical Hacking",
        description: "Learn network security, penetration testing, and ethical hacking. Protect systems from cyber threats and vulnerabilities.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "programming",
        difficulty: "advanced",
        rating: 4.8,
        students: 9500,
        duration: "40h",
        lessons: 95
    },
    {
        id: 6,
        title: "Data Science with R and Python",
        description: "Analyze data like a pro. Statistics, visualization, and predictive modeling. Master libraries like Pandas, NumPy, and Matplotlib.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "ai",
        difficulty: "intermediate",
        rating: 4.6,
        students: 11000,
        duration: "38h",
        lessons: 100
    },
    {
        id: 7,
        title: "Cloud Computing with AWS",
        description: "Deploy scalable applications on the cloud. Master EC2, S3, Lambda, and DynamoDB. Prepare for AWS certification.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "web",
        difficulty: "advanced",
        rating: 4.8,
        students: 7800,
        duration: "42h",
        lessons: 90
    },
    {
        id: 8,
        title: "Mobile App Development with Flutter",
        description: "Build native iOS and Android apps with a single codebase. Learn Dart, widgets, state management, and API integration.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "programming",
        difficulty: "intermediate",
        rating: 4.7,
        students: 13500,
        duration: "48h",
        lessons: 110
    }
];

// State Management
let currentCategory = 'all';
let currentDifficulty = 'all';
let currentSort = 'popular';
let searchQuery = '';

// DOM Elements
const coursesGrid = document.getElementById('coursesGrid');
const filterTabs = document.querySelectorAll('.filter-tab');
const difficultyFilter = document.getElementById('difficultyFilter');
const sortFilter = document.getElementById('sortBy');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading delay for skeleton effect
    setTimeout(() => {
        renderCourses();
    }, 1500);

    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Category Tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Update state
            currentCategory = tab.dataset.category;
            // Re-render
            renderCourses();
        });
    });

    // Difficulty Filter
    difficultyFilter.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        renderCourses();
    });

    // Sort Filter
    sortFilter.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderCourses();
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderCourses();
    });

    // Load More (Mock functionality)
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        setTimeout(() => {
            // In a real app, this would fetch more data
            alert('You have reached the end of the demo content! 🚀');
            loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Courses Loaded';
            loadMoreBtn.disabled = true;
        }, 1000);
    });
}

// Filter and Sort Courses
function getFilteredCourses() {
    let filtered = coursesData.filter(course => {
        // Category Filter
        const categoryMatch = currentCategory === 'all' || course.category === currentCategory;

        // Difficulty Filter
        const difficultyMatch = currentDifficulty === 'all' || course.difficulty === currentDifficulty;

        // Search Filter
        const searchMatch = course.title.toLowerCase().includes(searchQuery) ||
            course.description.toLowerCase().includes(searchQuery);

        return categoryMatch && difficultyMatch && searchMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'popular':
                return b.students - a.students;
            case 'newest':
                return b.id - a.id;
            case 'rating':
                return b.rating - a.rating;
            case 'duration':
                return parseInt(a.duration) - parseInt(b.duration);
            default:
                return 0;
        }
    });

    return filtered;
}

// Render Courses
function renderCourses() {
    const courses = getFilteredCourses();
    coursesGrid.innerHTML = '';

    if (courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 0.5rem;">No courses found</h3>
                <p style="color: var(--text-secondary);">Try adjusting your filters or search query</p>
            </div>
        `;
        return;
    }

    courses.forEach((course, index) => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0'; // Initial state for animation

        card.innerHTML = `
            <div class="course-image">
                <img src="${course.image}" alt="${course.title}" loading="lazy">
                <div class="course-overlay">
                    <span class="course-category">
                        <i class="fas fa-tag"></i> ${capitalize(course.category)}
                    </span>
                </div>
            </div>
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-desc">${course.description}</p>
                
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-signal"></i>
                        ${capitalize(course.difficulty)}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        ${course.rating}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        ${formatNumber(course.students)}
                    </div>
                </div>

                <button class="start-course-btn" onclick="startCourse(${course.id})">
                    Start Learning <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        coursesGrid.appendChild(card);
    });
}

// Helper Functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatNumber(num) {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
}

// Start Course Action
window.startCourse = function (courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (course) {
        // In a real app, this would navigate to the course player
        // For now, we'll use the course generator to create a custom lesson plan
        const confirmStart = confirm(`Ready to start "${course.title}"? 🚀\n\nWe'll generate a personalized lesson plan for you.`);

        if (confirmStart) {
            // Redirect to course generator with pre-filled data (simulated)
            // Ideally pass parameters via URL
            window.location.href = `course-generator.html?course=${encodeURIComponent(course.title)}&difficulty=${course.difficulty}`;
        }
    }
};

// Add keyframes for animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
