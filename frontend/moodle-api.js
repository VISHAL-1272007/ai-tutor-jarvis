/*
 * ===== MOODLE API INTEGRATION =====
 * 
 * This module handles all interactions with Moodle's Web Services API
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Moodle (https://download.moodle.org/) or use a hosted instance
 * 2. Enable Web Services: Site administration → Advanced features → Enable web services
 * 3. Create a Web Service: Site administration → Server → Web services → External services
 * 4. Generate a token: Site administration → Server → Web services → Manage tokens
 * 5. Add your Moodle URL and token below
 * 
 * MOODLE WEB SERVICES USED:
 * - core_course_get_courses: Get all courses
 * - core_course_get_contents: Get course contents (sections, modules)
 * - core_enrol_get_users_courses: Get user's enrolled courses
 * - mod_quiz_get_quizzes_by_courses: Get quizzes for courses
 * - gradereport_user_get_grade_items: Get user grades
 */

// ===== CONFIGURATION =====
const MOODLE_CONFIG = {
    // REPLACE WITH YOUR MOODLE INSTANCE URL
    baseUrl: 'https://your-moodle-site.com', // Example: 'https://moodle.example.com' or 'http://localhost/moodle'
    
    // REPLACE WITH YOUR MOODLE WEB SERVICE TOKEN
    wsToken: 'YOUR_MOODLE_TOKEN_HERE',
    
    // Web service endpoint
    wsEndpoint: '/webservice/rest/server.php',
    
    // Response format (json recommended)
    format: 'json'
};

// ===== MOODLE API CLASS =====
class MoodleAPI {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.wsToken = config.wsToken;
        this.wsEndpoint = config.wsEndpoint;
        this.format = config.format;
        this.isConfigured = this.validateConfig();
    }

    validateConfig() {
        if (!this.baseUrl || this.baseUrl === 'https://your-moodle-site.com') {
            console.warn('⚠️ Moodle API not configured. Using local data.');
            return false;
        }
        if (!this.wsToken || this.wsToken === 'YOUR_MOODLE_TOKEN_HERE') {
            console.warn('⚠️ Moodle token not configured. Using local data.');
            return false;
        }
        console.log('✅ Moodle API configured successfully');
        return true;
    }

    // Build API URL with parameters
    buildUrl(functionName, params = {}) {
        const url = new URL(this.baseUrl + this.wsEndpoint);
        url.searchParams.append('wstoken', this.wsToken);
        url.searchParams.append('wsfunction', functionName);
        url.searchParams.append('moodlewsrestformat', this.format);
        
        // Add custom parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        return url.toString();
    }

    // Generic API call
    async call(functionName, params = {}) {
        if (!this.isConfigured) {
            console.log('📦 Moodle API not configured, using local data');
            return null;
        }

        try {
            const url = this.buildUrl(functionName, params);
            console.log(`🔗 Calling Moodle API: ${functionName}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check for Moodle error response
            if (data.exception) {
                throw new Error(`Moodle Error: ${data.message}`);
            }
            
            console.log(`✅ Moodle API response received for ${functionName}`);
            return data;
        } catch (error) {
            console.error(`❌ Moodle API Error (${functionName}):`, error);
            return null;
        }
    }

    // ===== COURSE FUNCTIONS =====

    // Get all available courses
    async getCourses() {
        return await this.call('core_course_get_courses');
    }

    // Get course contents (sections, lessons, resources)
    async getCourseContents(courseId) {
        return await this.call('core_course_get_contents', { courseid: courseId });
    }

    // Get user's enrolled courses
    async getUserCourses(userId) {
        return await this.call('core_enrol_get_users_courses', { userid: userId });
    }

    // Search courses by field
    async searchCourses(searchTerm) {
        return await this.call('core_course_search_courses', { 
            criterianame: 'search', 
            criteriavalue: searchTerm 
        });
    }

    // ===== LESSON/MODULE FUNCTIONS =====

    // Get course modules (lessons, activities)
    async getCourseModules(courseId) {
        const contents = await this.getCourseContents(courseId);
        if (!contents) return [];
        
        // Extract all modules from sections
        const modules = [];
        contents.forEach(section => {
            section.modules.forEach(module => {
                modules.push({
                    id: module.id,
                    name: module.name,
                    modname: module.modname, // Type: page, quiz, resource, etc.
                    description: module.description || '',
                    url: module.url,
                    visible: module.visible
                });
            });
        });
        
        return modules;
    }

    // ===== QUIZ FUNCTIONS =====

    // Get quizzes for courses
    async getQuizzesByCourses(courseIds) {
        const courseidsParam = courseIds.map((id, index) => 
            `courseids[${index}]=${id}`
        ).join('&');
        
        return await this.call('mod_quiz_get_quizzes_by_courses', 
            Object.fromEntries(courseIds.map((id, i) => [`courseids[${i}]`, id]))
        );
    }

    // Get quiz questions (requires admin/teacher role)
    async getQuizData(quizId) {
        return await this.call('mod_quiz_get_quiz_access_information', { quizid: quizId });
    }

    // ===== ENROLLMENT FUNCTIONS =====

    // Enroll user in course (requires permission)
    async enrollUser(courseId, userId, roleId = 5) { // roleId 5 = student
        return await this.call('enrol_manual_enrol_users', {
            'enrolments[0][roleid]': roleId,
            'enrolments[0][userid]': userId,
            'enrolments[0][courseid]': courseId
        });
    }

    // ===== PROGRESS/GRADE FUNCTIONS =====

    // Get user's grades for a course
    async getUserGrades(courseId, userId) {
        return await this.call('gradereport_user_get_grade_items', {
            courseid: courseId,
            userid: userId
        });
    }

    // Get course completion status
    async getCourseCompletion(courseId, userId) {
        return await this.call('core_completion_get_course_completion_status', {
            courseid: courseId,
            userid: userId
        });
    }

    // ===== USER FUNCTIONS =====

    // Get user by username
    async getUserByUsername(username) {
        return await this.call('core_user_get_users', {
            'criteria[0][key]': 'username',
            'criteria[0][value]': username
        });
    }

    // ===== HELPER FUNCTIONS =====

    // Transform Moodle course to our app format
    transformCourse(moodleCourse) {
        return {
            id: `moodle-${moodleCourse.id}`,
            title: moodleCourse.fullname || moodleCourse.shortname,
            description: this.stripHtml(moodleCourse.summary || 'No description available'),
            icon: this.getCourseIcon(moodleCourse.categoryid),
            lessonCount: 0, // Will be populated when fetching contents
            duration: 'Self-paced',
            level: 'All Levels',
            color: this.getCourseColor(moodleCourse.id),
            moodleId: moodleCourse.id,
            source: 'moodle'
        };
    }

    // Remove HTML tags from strings
    stripHtml(html) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Get icon based on category (customize as needed)
    getCourseIcon(categoryId) {
        const iconMap = {
            1: 'fa-code',
            2: 'fa-laptop-code',
            3: 'fa-database',
            4: 'fa-network-wired',
            5: 'fa-robot'
        };
        return iconMap[categoryId] || 'fa-graduation-cap';
    }

    // Generate color based on course ID
    getCourseColor(courseId) {
        const colors = ['#3776ab', '#f89820', '#e34c26', '#61dafb', '#47a248', '#9c27b0'];
        return colors[courseId % colors.length];
    }
}

// ===== INITIALIZE MOODLE API =====
try {
    const moodleAPI = new MoodleAPI(MOODLE_CONFIG);
    
    // ===== EXPORT API =====
    window.MoodleAPI = MoodleAPI;
    window.moodleAPI = moodleAPI;
    
    console.log('✅ Moodle API module loaded');
} catch (error) {
    console.warn('⚠️ Moodle API initialization failed:', error.message);
    window.moodleAPI = null;
}
