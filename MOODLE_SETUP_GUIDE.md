# Moodle API Integration Guide for JARVIS Learning Platform

## 📋 Overview

This guide will help you integrate **Moodle LMS** with your JARVIS Learning Platform. Moodle is a free, open-source Learning Management System that provides comprehensive course management, quizzes, progress tracking, and enrollment features.

---

## 🚀 Quick Start

### Option 1: Use Moodle Cloud (Hosted, Free Tier)
- **Website**: https://moodle.com/cloud/
- **Free Tier**: Up to 50 users
- **Setup Time**: ~15 minutes
- **Best For**: Testing and small deployments

### Option 2: Self-Host Moodle (Fully Free)
- **Download**: https://download.moodle.org/
- **Requirements**: PHP 7.4+, MySQL/PostgreSQL, Apache/Nginx
- **Setup Time**: ~1-2 hours
- **Best For**: Full control and unlimited users

---

## 📦 Installation Steps

### A. Moodle Cloud Setup (Easiest)

1. **Sign Up for Moodle Cloud**
   - Visit: https://moodle.com/cloud/
   - Click "Get started for free"
   - Create your account
   - Choose a site name (e.g., `yourschool.moodlecloud.com`)

2. **Access Your Moodle Dashboard**
   - Log in with admin credentials
   - Your URL: `https://yourschool.moodlecloud.com`

### B. Self-Hosted Moodle Setup

#### **For Windows:**

```powershell
# 1. Download XAMPP (includes PHP + MySQL)
# Visit: https://www.apachefriends.org/download.html

# 2. Download Moodle
# Visit: https://download.moodle.org/download.php/direct/stable402/moodle-latest-402.zip

# 3. Extract Moodle to XAMPP
# Extract to: C:\xampp\htdocs\moodle

# 4. Create Database
# Open http://localhost/phpmyadmin
# Create new database: "moodle" (utf8mb4_unicode_ci)

# 5. Install Moodle
# Visit: http://localhost/moodle
# Follow installation wizard
```

#### **For Linux/Ubuntu:**

```bash
# 1. Install dependencies
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-xml php-curl php-zip php-gd php-mbstring php-intl php-soap

# 2. Download Moodle
cd /var/www/html
sudo git clone https://github.com/moodle/moodle.git
cd moodle
sudo git checkout MOODLE_402_STABLE

# 3. Set permissions
sudo mkdir /var/moodledata
sudo chown -R www-data:www-data /var/www/html/moodle
sudo chown -R www-data:www-data /var/moodledata
sudo chmod -R 755 /var/moodledata

# 4. Create database
sudo mysql -u root -p
CREATE DATABASE moodle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'moodleuser'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON moodle.* TO 'moodleuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 5. Complete installation via browser
# Visit: http://localhost/moodle
```

---

## 🔑 Enable Web Services in Moodle

### Step 1: Enable Web Services

1. Log in as **Admin**
2. Go to: **Site administration** → **Advanced features**
3. Check ✅ **Enable web services**
4. Click **Save changes**

### Step 2: Enable REST Protocol

1. Go to: **Site administration** → **Server** → **Web services** → **Manage protocols**
2. Enable **REST protocol** (click eye icon)

### Step 3: Create a Web Service

1. Go to: **Site administration** → **Server** → **Web services** → **External services**
2. Click **Add** (Custom service)
3. Fill in:
   - **Name**: `JARVIS Learning Platform`
   - **Short name**: `jarvis_api`
   - **Enabled**: ✅ Yes
   - **Authorized users only**: ✅ Yes (recommended)
4. Click **Add service**

### Step 4: Add Functions to Service

1. Click **Add functions** next to your service
2. Add these functions (search and add each):
   ```
   core_course_get_courses
   core_course_get_contents
   core_enrol_get_users_courses
   mod_quiz_get_quizzes_by_courses
   gradereport_user_get_grade_items
   core_completion_get_course_completion_status
   core_user_get_users
   core_course_search_courses
   ```

### Step 5: Create a Service User (Recommended)

1. Go to: **Site administration** → **Users** → **Accounts** → **Add a new user**
2. Create user:
   - **Username**: `jarvis_api_user`
   - **Password**: [Generate strong password]
   - **Email**: Your email
3. Click **Create user**

4. Assign role:
   - Go to: **Site administration** → **Users** → **Permissions** → **Assign system roles**
   - Select **Manager** role
   - Add your API user

### Step 6: Authorize User for Service

1. Go to: **Site administration** → **Server** → **Web services** → **External services**
2. Click **Authorized users** next to your service
3. Add your `jarvis_api_user`

### Step 7: Generate API Token

1. Go to: **Site administration** → **Server** → **Web services** → **Manage tokens**
2. Click **Add**
3. Fill in:
   - **User**: Select `jarvis_api_user`
   - **Service**: Select `JARVIS Learning Platform`
4. Click **Save changes**
5. **COPY THE TOKEN** (you'll need this!)

---

## ⚙️ Configure JARVIS Platform

### Update `moodle-api.js`

Open `frontend/moodle-api.js` and update:

```javascript
const MOODLE_CONFIG = {
    // Your Moodle URL (no trailing slash)
    baseUrl: 'https://yourschool.moodlecloud.com',  // Or 'http://localhost/moodle'
    
    // Your Web Service Token from Step 7
    wsToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',  // Replace with your actual token
    
    wsEndpoint: '/webservice/rest/server.php',
    format: 'json'
};
```

### Test the Integration

1. Open your browser console (F12)
2. Visit: `http://localhost/courses.html` (or your hosted URL)
3. Check console for:
   ```
   ✅ Moodle API configured successfully
   🔄 Loading courses from Moodle...
   ✅ Loaded X courses from Moodle
   ```

---

## 📚 Add Courses in Moodle

### Create a Course

1. In Moodle Dashboard, click **Site administration** → **Courses** → **Manage courses and categories**
2. Click **Create new course**
3. Fill in:
   - **Full name**: Python Programming Basics
   - **Short name**: PYTHON101
   - **Course summary**: Learn Python fundamentals...
   - **Course format**: Topics
4. Click **Save and display**

### Add Lessons (Activities)

1. Turn on **Edit mode** (top right)
2. Click **Add an activity or resource**
3. Choose:
   - **Page** (for lesson content)
   - **Quiz** (for assessments)
   - **Assignment** (for projects)
4. Fill in content and save

### Add Quiz

1. **Add an activity** → **Quiz**
2. Name: "Python Basics Quiz"
3. Click **Save and display**
4. Click **Edit quiz**
5. Add questions:
   - Multiple choice
   - True/False
   - Short answer
6. Save questions

---

## 🔄 API Features Available

### ✅ Implemented Features

| Feature | API Function | Status |
|---------|-------------|--------|
| Get all courses | `core_course_get_courses` | ✅ Working |
| Get course contents | `core_course_get_contents` | ✅ Working |
| Get user courses | `core_enrol_get_users_courses` | ✅ Working |
| Search courses | `core_course_search_courses` | ✅ Working |
| Get quizzes | `mod_quiz_get_quizzes_by_courses` | ✅ Working |
| Get user grades | `gradereport_user_get_grade_items` | ✅ Working |
| Course completion | `core_completion_get_course_completion_status` | ✅ Working |

### 🎯 Usage Examples

```javascript
// Get all courses
const courses = await window.moodleAPI.getCourses();

// Get course contents (lessons)
const lessons = await window.moodleAPI.getCourseModules(courseId);

// Get quizzes for a course
const quizzes = await window.moodleAPI.getQuizzesByCourses([courseId]);

// Get user's progress
const completion = await window.moodleAPI.getCourseCompletion(courseId, userId);
```

---

## 🛡️ Security Best Practices

1. **Use HTTPS**: Always use SSL for production
2. **Restrict Token**: Limit token to specific IP addresses if possible
3. **Dedicated User**: Create separate API user (don't use admin)
4. **Minimal Permissions**: Only grant required web service functions
5. **Token Rotation**: Regenerate tokens periodically
6. **Environment Variables**: Don't commit tokens to Git

### Secure Token Storage (Production)

```javascript
// Use environment variables
const MOODLE_CONFIG = {
    baseUrl: process.env.MOODLE_URL || 'https://yourschool.moodlecloud.com',
    wsToken: process.env.MOODLE_TOKEN || '',
    wsEndpoint: '/webservice/rest/server.php',
    format: 'json'
};
```

---

## 🐛 Troubleshooting

### Error: "Web services are not enabled"
- **Solution**: Enable web services in Site administration → Advanced features

### Error: "Access control exception"
- **Solution**: Check user is authorized in External services → Authorized users

### Error: "Invalid token"
- **Solution**: Regenerate token and update `moodle-api.js`

### Error: "Function not available"
- **Solution**: Add missing function to your External service

### CORS Issues (Browser)
- **Solution**: Add CORS headers in Moodle or use backend proxy

---

## 📊 Free Tier Limits

| Feature | Moodle Cloud (Free) | Self-Hosted |
|---------|-------------------|-------------|
| Users | 50 | Unlimited |
| Storage | 200 MB | Unlimited |
| Courses | Unlimited | Unlimited |
| API Calls | Unlimited | Unlimited |
| Support | Community | Community |

---

## 🔗 Useful Resources

- **Moodle Docs**: https://docs.moodle.org/
- **Web Services API**: https://docs.moodle.org/dev/Web_services
- **API Reference**: https://docs.moodle.org/dev/Web_service_API_functions
- **Moodle Community**: https://moodle.org/community/
- **Download Moodle**: https://download.moodle.org/

---

## 📝 Next Steps

1. ✅ Install Moodle (Cloud or Self-hosted)
2. ✅ Enable Web Services
3. ✅ Generate API Token
4. ✅ Update `moodle-api.js` configuration
5. ✅ Create courses in Moodle
6. ✅ Test integration in JARVIS platform
7. 🚀 Deploy to production!

---

## 💡 Tips

- Start with **Moodle Cloud** for quick testing
- Create sample courses with dummy content first
- Test all API functions in browser console
- Monitor Moodle logs: Site administration → Reports → Logs
- Use Moodle's built-in documentation for users

---

**Need Help?** Check Moodle forums or open an issue in the repository!

**Developed by VISHAL** 🚀
