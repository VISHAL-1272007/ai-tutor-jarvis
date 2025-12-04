/*
 * ===== QUIZ PAGE JAVASCRIPT =====
 * 
 * SETUP INSTRUCTIONS:
 * 1. Ensure this file is in the same folder as quiz.html
 * 2. URL params: ?module=<id>&lesson=<number>
 * 3. To test locally: Open quiz.html?module=python-basics&lesson=1
 * 4. To deploy: Copy to Firebase public folder and run 'firebase deploy --only hosting'
 * 5. Quiz data stored in this file (could be moved to Firebase Firestore in production)
 * 
 * FEATURES:
 * - Multiple choice questions (3 per lesson)
 * - Progress tracking
 * - Score calculation
 * - Answer review
 * - Retake functionality
 * - Saves quiz results to localStorage
 */

// ===== QUIZ DATA =====
const quizData = {
    'python-basics-1': {
        title: 'Introduction to Python',
        questions: [
            {
                question: 'What is the correct way to print "Hello, World!" in Python?',
                options: [
                    'echo("Hello, World!")',
                    'print("Hello, World!")',
                    'console.log("Hello, World!")',
                    'System.out.println("Hello, World!")'
                ],
                correct: 1,
                explanation: 'In Python, we use print() to output text to the console.'
            },
            {
                question: 'Which of the following is a valid Python comment?',
                options: [
                    '// This is a comment',
                    '/* This is a comment */',
                    '# This is a comment',
                    '<!-- This is a comment -->'
                ],
                correct: 2,
                explanation: 'Python uses # for single-line comments.'
            },
            {
                question: 'What type of language is Python?',
                options: [
                    'Compiled only',
                    'Interpreted',
                    'Assembly',
                    'Machine code'
                ],
                correct: 1,
                explanation: 'Python is an interpreted language, meaning code is executed line by line.'
            }
        ]
    },
    'python-basics-2': {
        title: 'Variables and Data Types',
        questions: [
            {
                question: 'Which data type is "Hello" in Python?',
                options: [
                    'int',
                    'float',
                    'str',
                    'bool'
                ],
                correct: 2,
                explanation: 'Text enclosed in quotes is a string (str) data type.'
            },
            {
                question: 'What is the correct way to create a variable in Python?',
                options: [
                    'var x = 5',
                    'int x = 5',
                    'x = 5',
                    'let x = 5'
                ],
                correct: 2,
                explanation: 'Python uses simple assignment: variable_name = value'
            },
            {
                question: 'What is the output of: type(3.14)?',
                options: [
                    '<class \'int\'>',
                    '<class \'float\'>',
                    '<class \'str\'>',
                    '<class \'decimal\'>'
                ],
                correct: 1,
                explanation: 'Numbers with decimal points are float type in Python.'
            }
        ]
    },
    'python-basics-3': {
        title: 'Operators and Expressions',
        questions: [
            {
                question: 'What is the result of 10 % 3 in Python?',
                options: [
                    '3.33',
                    '3',
                    '1',
                    '10'
                ],
                correct: 2,
                explanation: 'The modulus operator (%) returns the remainder: 10 ÷ 3 = 3 remainder 1'
            },
            {
                question: 'Which operator is used for exponentiation?',
                options: [
                    '^',
                    '**',
                    'pow',
                    '^^'
                ],
                correct: 1,
                explanation: 'Python uses ** for exponentiation, e.g., 2**3 = 8'
            },
            {
                question: 'What is the result of (5 > 3) and (8 < 10)?',
                options: [
                    'True',
                    'False',
                    'Error',
                    'None'
                ],
                correct: 0,
                explanation: 'Both conditions are true, so the AND operation returns True.'
            }
        ]
    },
    'java-basics-1': {
        title: 'Introduction to Java',
        questions: [
            {
                question: 'What is the entry point of a Java program?',
                options: [
                    'start() method',
                    'run() method',
                    'main() method',
                    'execute() method'
                ],
                correct: 2,
                explanation: 'Java programs start execution from the main() method.'
            },
            {
                question: 'Which keyword is used to print in Java?',
                options: [
                    'print',
                    'System.out.println',
                    'console.log',
                    'echo'
                ],
                correct: 1,
                explanation: 'Java uses System.out.println() to print output.'
            },
            {
                question: 'Java is known for which principle?',
                options: [
                    'Write Once, Run Anywhere',
                    'Code Once, Deploy Everywhere',
                    'Single Platform Language',
                    'Script-based Language'
                ],
                correct: 0,
                explanation: 'Java\'s "Write Once, Run Anywhere" (WORA) means compiled code runs on any platform with JVM.'
            }
        ]
    },
    'iot-fundamentals-1': {
        title: 'Introduction to IoT',
        questions: [
            {
                question: 'What does IoT stand for?',
                options: [
                    'Internet of Technology',
                    'Internet of Things',
                    'Integration of Technology',
                    'Interface of Things'
                ],
                correct: 1,
                explanation: 'IoT stands for Internet of Things - connecting physical devices to the internet.'
            },
            {
                question: 'Which is NOT a common IoT platform?',
                options: [
                    'Arduino',
                    'Raspberry Pi',
                    'Microsoft Word',
                    'ESP32'
                ],
                correct: 2,
                explanation: 'Microsoft Word is word processing software, not an IoT platform.'
            },
            {
                question: 'What is the first step in IoT architecture?',
                options: [
                    'Data Processing',
                    'User Interface',
                    'Sensors/Devices',
                    'Cloud Storage'
                ],
                correct: 2,
                explanation: 'IoT starts with sensors and devices that collect data from the physical world.'
            }
        ]
    },
    'docker-basics-1': {
        title: 'Introduction to Docker Quiz',
        questions: [
            {
                question: 'What is Docker primarily used for?',
                options: [
                    'Running virtual machines',
                    'Containerizing applications',
                    'Cloud storage',
                    'Database management'
                ],
                correct: 1,
                explanation: 'Docker is primarily used for containerizing applications, packaging them with all dependencies for consistent deployment.'
            },
            {
                question: 'Which advantage does Docker provide?',
                options: [
                    'Requires more resources than VMs',
                    'Slower startup times',
                    'Consistency across environments',
                    'Requires separate OS for each app'
                ],
                correct: 2,
                explanation: 'Docker ensures applications run consistently across development, testing, and production environments.'
            },
            {
                question: 'What is the difference between containers and VMs?',
                options: [
                    'Containers are heavier than VMs',
                    'VMs share the host OS kernel',
                    'Containers share the host OS kernel',
                    'Containers require full OS installation'
                ],
                correct: 2,
                explanation: 'Containers share the host OS kernel, making them lightweight and efficient compared to VMs which run full operating systems.'
            }
        ]
    },
    'docker-basics-2': {
        title: 'Installing Docker Quiz',
        questions: [
            {
                question: 'Which Windows versions support Docker Desktop?',
                options: [
                    'Windows 7 and later',
                    'Windows 10/11 Home only',
                    'Windows 10/11 Pro, Enterprise, or Education',
                    'Any Windows version'
                ],
                correct: 2,
                explanation: 'Docker Desktop requires Windows 10/11 Pro, Enterprise, or Education (64-bit) with Hyper-V and WSL 2 support.'
            },
            {
                question: 'What command verifies Docker installation?',
                options: [
                    'docker test',
                    'docker --version',
                    'docker check',
                    'docker status'
                ],
                correct: 1,
                explanation: 'The command "docker --version" displays the installed Docker version, verifying successful installation.'
            },
            {
                question: 'What does "docker run hello-world" do?',
                options: [
                    'Deletes all containers',
                    'Tests Docker installation',
                    'Opens Docker Desktop',
                    'Creates a new image'
                ],
                correct: 1,
                explanation: 'The hello-world image is used to test Docker installation by downloading and running a simple test container.'
            }
        ]
    },
    'docker-basics-3': {
        title: 'Images and Containers Quiz',
        questions: [
            {
                question: 'What is a Docker image?',
                options: [
                    'A running application',
                    'A read-only template for creating containers',
                    'A virtual machine snapshot',
                    'A configuration file'
                ],
                correct: 1,
                explanation: 'A Docker image is a read-only template containing code, runtime, libraries, and dependencies used to create containers.'
            },
            {
                question: 'Which command pulls an image from Docker Hub?',
                options: [
                    'docker download ubuntu',
                    'docker get ubuntu',
                    'docker pull ubuntu',
                    'docker fetch ubuntu'
                ],
                correct: 2,
                explanation: 'The "docker pull" command downloads images from Docker Hub or other registries.'
            },
            {
                question: 'What does "-it" flag do in "docker run -it ubuntu bash"?',
                options: [
                    'Install tools',
                    'Internet connection',
                    'Interactive terminal',
                    'Image transfer'
                ],
                correct: 2,
                explanation: 'The -it flags combine -i (interactive, keep STDIN open) and -t (allocate pseudo-TTY) to provide an interactive terminal.'
            }
        ]
    },
    'docker-basics-4': {
        title: 'Creating Dockerfiles Quiz',
        questions: [
            {
                question: 'What is the purpose of a Dockerfile?',
                options: [
                    'Store container logs',
                    'Define instructions to build a Docker image',
                    'List running containers',
                    'Configure Docker Desktop'
                ],
                correct: 1,
                explanation: 'A Dockerfile contains instructions (FROM, RUN, COPY, CMD, etc.) to automate building Docker images.'
            },
            {
                question: 'Which instruction specifies the base image?',
                options: [
                    'BASE',
                    'IMAGE',
                    'FROM',
                    'USE'
                ],
                correct: 2,
                explanation: 'The FROM instruction specifies the base image (e.g., FROM node:18-alpine) that your image builds upon.'
            },
            {
                question: 'What is the benefit of multi-stage builds?',
                options: [
                    'Slower build times',
                    'Larger image size',
                    'Smaller final image size',
                    'More complex syntax'
                ],
                correct: 2,
                explanation: 'Multi-stage builds reduce final image size by separating build and production stages, excluding unnecessary build tools.'
            }
        ]
    },
    'docker-basics-5': {
        title: 'Docker Compose Quiz',
        questions: [
            {
                question: 'What is Docker Compose used for?',
                options: [
                    'Building single containers',
                    'Defining multi-container applications',
                    'Removing images',
                    'Monitoring logs'
                ],
                correct: 1,
                explanation: 'Docker Compose defines and runs multi-container applications using a YAML file to configure services, networks, and volumes.'
            },
            {
                question: 'Which command starts all services defined in docker-compose.yml?',
                options: [
                    'docker-compose start',
                    'docker-compose run',
                    'docker-compose up',
                    'docker-compose launch'
                ],
                correct: 2,
                explanation: 'The "docker-compose up" command builds, creates, and starts all services defined in the docker-compose.yml file.'
            },
            {
                question: 'What does "depends_on" specify in docker-compose.yml?',
                options: [
                    'Image dependencies',
                    'Service startup order',
                    'Network configuration',
                    'Volume mounts'
                ],
                correct: 1,
                explanation: 'The depends_on key specifies service dependencies, ensuring one service starts before another (e.g., app waits for database).'
            }
        ]
    },
    'docker-basics-6': {
        title: 'Best Practices & Deployment Quiz',
        questions: [
            {
                question: 'Why should you avoid running containers as root?',
                options: [
                    'Better performance',
                    'Security vulnerability',
                    'Faster startup',
                    'Smaller image size'
                ],
                correct: 1,
                explanation: 'Running as root poses security risks. Use USER instruction to run as non-root user, limiting potential damage from exploits.'
            },
            {
                question: 'What is the purpose of .dockerignore?',
                options: [
                    'List images to delete',
                    'Configure Docker Desktop',
                    'Exclude files from build context',
                    'Define environment variables'
                ],
                correct: 2,
                explanation: '.dockerignore excludes files (node_modules, .git, logs) from the build context, reducing image size and build time.'
            },
            {
                question: 'Which command removes unused Docker resources?',
                options: [
                    'docker clean',
                    'docker remove --all',
                    'docker system prune',
                    'docker delete unused'
                ],
                correct: 2,
                explanation: 'The "docker system prune" command removes unused containers, networks, images, and optionally volumes to free disk space.'
            }
        ]
    }
};

// ===== STATE =====
let currentModule = '';
let currentLesson = 0;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizId = '';
let questions = [];

// ===== DOM ELEMENTS =====
const quizSubtitle = document.getElementById('quizSubtitle');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quizContent = document.getElementById('quizContent');
const quizActions = document.getElementById('quizActions');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const quizResults = document.getElementById('quizResults');
const scoreDisplay = document.getElementById('scoreDisplay');
const showAnswersBtn = document.getElementById('showAnswersBtn');
const retakeBtn = document.getElementById('retakeBtn');
const answersReview = document.getElementById('answersReview');
const reviewContent = document.getElementById('reviewContent');

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Quiz page loaded');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentModule = urlParams.get('module') || 'python-basics';
    currentLesson = parseInt(urlParams.get('lesson')) || 1;
    
    quizId = `${currentModule}-${currentLesson}`;
    
    loadQuiz();
    setupEventListeners();
});

// ===== LOAD QUIZ =====
function loadQuiz() {
    const quiz = quizData[quizId];
    
    if (!quiz) {
        quizContent.innerHTML = '<p style="color: red; text-align: center;">Quiz not available for this lesson.</p>';
        return;
    }
    
    questions = quiz.questions;
    quizSubtitle.textContent = quiz.title;
    userAnswers = new Array(questions.length).fill(null);
    
    displayQuestion();
    
    console.log(`✅ Loaded quiz: ${quiz.title} (${questions.length} questions)`);
}

// ===== DISPLAY QUESTION =====
function displayQuestion() {
    const question = questions[currentQuestionIndex];
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // Render question
    quizContent.innerHTML = `
        <div class="question-card">
            <p class="question-number">Question ${currentQuestionIndex + 1}</p>
            <h2 class="question-text">${question.question}</h2>
            <ul class="options-list">
                ${question.options.map((option, index) => `
                    <li class="option-item ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" 
                        onclick="selectOption(${index})">
                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                        <span class="option-text">${option}</span>
                        <i class="fas fa-check-circle option-icon"></i>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Show appropriate button
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
        submitBtn.disabled = userAnswers[currentQuestionIndex] === null;
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
        nextBtn.disabled = userAnswers[currentQuestionIndex] === null;
    }
}

// ===== SELECT OPTION =====
function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;
    
    // Update UI
    document.querySelectorAll('.option-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Enable next/submit button
    if (currentQuestionIndex === questions.length - 1) {
        submitBtn.disabled = false;
    } else {
        nextBtn.disabled = false;
    }
}

// ===== NEXT QUESTION =====
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

// ===== SUBMIT QUIZ =====
function submitQuiz() {
    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    // Save to localStorage
    saveQuizResult(correctCount, questions.length, percentage);
    
    // Display results
    displayResults(correctCount, questions.length, percentage);
    
    console.log(`✅ Quiz submitted: ${correctCount}/${questions.length} (${percentage}%)`);
}

// ===== DISPLAY RESULTS =====
function displayResults(correct, total, percentage) {
    // Hide quiz content
    document.querySelector('.quiz-progress').style.display = 'none';
    quizContent.style.display = 'none';
    quizActions.style.display = 'none';
    
    // Show results
    quizResults.style.display = 'block';
    
    // Determine message and emoji
    let message, emoji, feedbackText;
    if (percentage >= 90) {
        message = 'Outstanding! 🎉';
        emoji = '🏆';
        feedbackText = 'You\'ve mastered this lesson!';
    } else if (percentage >= 70) {
        message = 'Great Job! 👏';
        emoji = '⭐';
        feedbackText = 'You have a solid understanding!';
    } else if (percentage >= 50) {
        message = 'Good Effort! 💪';
        emoji = '👍';
        feedbackText = 'Review the lesson and try again.';
    } else {
        message = 'Keep Learning! 📚';
        emoji = '📖';
        feedbackText = 'Practice makes perfect. Retake after reviewing.';
    }
    
    scoreDisplay.innerHTML = `
        <div class="score-circle">
            <div class="score-number">${percentage}%</div>
            <div class="score-label">${correct}/${total} correct</div>
        </div>
        <h3 class="score-message">${message}</h3>
        <p class="score-feedback">${feedbackText}</p>
    `;
}

// ===== SHOW ANSWERS =====
function showAnswers() {
    quizResults.style.display = 'none';
    answersReview.style.display = 'block';
    
    reviewContent.innerHTML = questions.map((question, qIndex) => {
        const userAnswer = userAnswers[qIndex];
        const isCorrect = userAnswer === question.correct;
        
        return `
            <div class="review-question">
                <h3>Question ${qIndex + 1}: ${question.question}</h3>
                <div class="review-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    <strong>Your answer:</strong> ${question.options[userAnswer]}
                    <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                </div>
                ${!isCorrect ? `
                    <div class="review-answer correct">
                        <strong>Correct answer:</strong> ${question.options[question.correct]}
                        <i class="fas fa-check-circle"></i>
                    </div>
                ` : ''}
                <p style="margin-top: 1rem; color: #666;">
                    <strong>Explanation:</strong> ${question.explanation}
                </p>
            </div>
        `;
    }).join('');
}

// ===== RETAKE QUIZ =====
function retakeQuiz() {
    // Reset state
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    
    // Reset UI
    document.querySelector('.quiz-progress').style.display = 'block';
    quizContent.style.display = 'block';
    quizActions.style.display = 'flex';
    quizResults.style.display = 'none';
    answersReview.style.display = 'none';
    
    // Reload first question
    displayQuestion();
}

// ===== SAVE QUIZ RESULT =====
function saveQuizResult(correct, total, percentage) {
    const quizResults = JSON.parse(localStorage.getItem('quizResults')) || {};
    
    if (!quizResults[currentModule]) {
        quizResults[currentModule] = {};
    }
    
    quizResults[currentModule][currentLesson] = {
        correct,
        total,
        percentage,
        date: new Date().toISOString(),
        passed: percentage >= 70
    };
    
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    
    // Update XP
    updateXP(correct * 10);
}

// ===== UPDATE XP =====
function updateXP(points) {
    let totalXP = parseInt(localStorage.getItem('totalXP')) || 0;
    totalXP += points;
    localStorage.setItem('totalXP', totalXP.toString());
}

// ===== RETURN TO LESSON =====
function returnToLesson() {
    window.location.href = `lesson.html?module=${currentModule}&lesson=${currentLesson}`;
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', submitQuiz);
    showAnswersBtn.addEventListener('click', showAnswers);
    retakeBtn.addEventListener('click', retakeQuiz);
}

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE =====
window.selectOption = selectOption;
window.returnToLesson = returnToLesson;

console.log('✅ Quiz JavaScript loaded successfully');
