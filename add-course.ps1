# Quick Course Generator for JARVIS Learning Platform
# This script helps you add new courses without manual editing

Write-Host "🎓 JARVIS Course Generator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get course details
Write-Host "Let's create a new course!" -ForegroundColor Green
Write-Host ""

$courseId = Read-Host "Course ID (e.g., 'docker-basics', 'nodejs-advanced')"
$courseTitle = Read-Host "Course Title (e.g., 'Docker Basics', 'Node.js Advanced')"
$courseDesc = Read-Host "Course Description"
$lessonCount = Read-Host "Number of Lessons (e.g., 10)"
$duration = Read-Host "Duration (e.g., '5 weeks', '2 months')"
$level = Read-Host "Level (Beginner/Intermediate/Advanced)"

# Icon selection
Write-Host ""
Write-Host "Select an icon:" -ForegroundColor Yellow
Write-Host "1. fa-code (Code)"
Write-Host "2. fa-laptop-code (Laptop)"
Write-Host "3. fa-database (Database)"
Write-Host "4. fa-docker (Docker)"
Write-Host "5. fa-node (Node.js)"
Write-Host "6. fa-react (React)"
Write-Host "7. fa-python (Python)"
Write-Host "8. fa-java (Java)"
$iconChoice = Read-Host "Choose (1-8)"

$icons = @{
    "1" = "fa-code"
    "2" = "fa-laptop-code"
    "3" = "fa-database"
    "4" = "fa-docker"
    "5" = "fa-node"
    "6" = "fa-react"
    "7" = "fa-python"
    "8" = "fa-java"
}
$icon = $icons[$iconChoice]

# Color selection
Write-Host ""
Write-Host "Select a color:" -ForegroundColor Yellow
Write-Host "1. Blue (#3776ab)"
Write-Host "2. Orange (#f89820)"
Write-Host "3. Red (#e34c26)"
Write-Host "4. Cyan (#61dafb)"
Write-Host "5. Green (#47a248)"
Write-Host "6. Purple (#9c27b0)"
$colorChoice = Read-Host "Choose (1-6)"

$colors = @{
    "1" = "#3776ab"
    "2" = "#f89820"
    "3" = "#e34c26"
    "4" = "#61dafb"
    "5" = "#47a248"
    "6" = "#9c27b0"
}
$color = $colors[$colorChoice]

# Generate course object
$courseCode = @"
    {
        id: '$courseId',
        title: '$courseTitle',
        description: '$courseDesc',
        icon: '$icon',
        lessonCount: $lessonCount,
        duration: '$duration',
        level: '$level',
        color: '$color'
    },
"@

Write-Host ""
Write-Host "✅ Course Code Generated!" -ForegroundColor Green
Write-Host ""
Write-Host "Copy this code and paste it into frontend/courses.js (inside the courses array):" -ForegroundColor Cyan
Write-Host ""
Write-Host $courseCode -ForegroundColor White
Write-Host ""

# Save to clipboard if possible
try {
    $courseCode | Set-Clipboard
    Write-Host "📋 Code copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not copy to clipboard, please copy manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open: frontend/courses.js"
Write-Host "2. Find the 'courses' array (around line 26)"
Write-Host "3. Add the code above before the closing bracket ]"
Write-Host "4. Save the file"
Write-Host "5. Deploy: firebase deploy --only hosting"
Write-Host ""

# Ask if they want to add lessons
$addLessons = Read-Host "Do you want to generate lesson template? (y/n)"

if ($addLessons -eq "y") {
    Write-Host ""
    Write-Host "Generating lesson template..." -ForegroundColor Cyan
    
    $lessonCode = @"
    '$courseId': {
        title: '$courseTitle',
        lessons: [
            {
                number: 1,
                title: 'Introduction to $courseTitle',
                content: ``
# Welcome to $courseTitle

## What You'll Learn

In this course, you will learn:
- Topic 1
- Topic 2
- Topic 3

## Prerequisites

- Basic knowledge of...
- Familiarity with...

Let's get started!
                ``
            },
            {
                number: 2,
                title: 'Lesson 2 Title',
                content: ``
# Lesson 2

Add your content here using Markdown...

## Code Example

``````javascript
console.log('Hello World');
``````
                ``
            }
            // Add more lessons...
        ]
    },
"@

    Write-Host ""
    Write-Host "📝 Lesson Template Generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copy this code and paste it into frontend/lesson.js (inside LESSON_DATA):" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $lessonCode -ForegroundColor White
    Write-Host ""
}

# Ask if they want to add quiz
$addQuiz = Read-Host "Do you want to generate quiz template? (y/n)"

if ($addQuiz -eq "y") {
    Write-Host ""
    Write-Host "Generating quiz template..." -ForegroundColor Cyan
    
    $quizCode = @"
    '$courseId': {
        1: [
            {
                question: 'Sample question for lesson 1?',
                options: [
                    'Option A (Correct)',
                    'Option B',
                    'Option C',
                    'Option D'
                ],
                correct: 0,
                explanation: 'Explain why Option A is correct...'
            },
            {
                question: 'Second question?',
                options: ['A', 'B', 'C', 'D'],
                correct: 1,
                explanation: 'Explanation here...'
            },
            {
                question: 'Third question?',
                options: ['A', 'B', 'C', 'D'],
                correct: 2,
                explanation: 'Explanation here...'
            }
        ],
        2: [
            // Add 3 questions for lesson 2
        ]
    },
"@

    Write-Host ""
    Write-Host "❓ Quiz Template Generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copy this code and paste it into frontend/quiz.js (inside QUIZ_DATA):" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $quizCode -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "🚀 All Done! Your course is ready to add to JARVIS!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
