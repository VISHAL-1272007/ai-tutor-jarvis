// ============================================================================
// AI COURSE GENERATOR - JAVASCRIPT (WORKING VERSION using /ask endpoint)
// JARVIS Learning Platform
// ============================================================================

import { getBackendURL } from './config.js';

const BACKEND_URL = getBackendURL();
let generatedCourse = null;

// ============================================================================
// MAIN COURSE GENERATION FUNCTION
// ============================================================================

document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateCourse();
});

async function generateCourse() {
    // Get form values
    const courseTitle = document.getElementById('courseTitle').value.trim();
    const difficulty = document.getElementById('difficulty').value;
    const lessonCount = parseInt(document.getElementById('lessonCount').value);
    const courseDescription = document.getElementById('courseDescription').value.trim();
    const questionsPerLesson = parseInt(document.getElementById('questionsPerLesson').value);

    // Validate
    if (!courseTitle || lessonCount < 1) {
        alert('Please fill in all required fields');
        return;
    }

    // Show progress
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const generatedContent = document.getElementById('generatedContent');
    const generateBtn = document.getElementById('generateBtn');
    const resultsSection = document.getElementById('resultsSection');

    progressSection.classList.add('active');
    resultsSection.classList.remove('active');
    generateBtn.disabled = true;

    // Initialize course object
    generatedCourse = {
        title: courseTitle,
        difficulty: difficulty,
        description: courseDescription || `Complete ${courseTitle} course for ${difficulty} level students`,
        lessons: []
    };

    try {
        // Generate each lesson
        for (let i = 1; i <= lessonCount; i++) {
            const progress = Math.round((i / lessonCount) * 100);
            progressBar.style.width = progress + '%';
            progressBar.textContent = progress + '%';
            progressStatus.textContent = `Generating Lesson ${i} of ${lessonCount}...`;

            // Generate lesson content
            const lessonTopic = `${courseTitle} - Lesson ${i}`;
            const lesson = await generateLesson(lessonTopic, difficulty, i);

            // Generate quiz for this lesson
            progressStatus.textContent = `Generating quiz for Lesson ${i}...`;
            const quiz = await generateQuiz(lessonTopic, difficulty, questionsPerLesson);

            // Add to course
            generatedCourse.lessons.push({
                lessonNumber: i,
                ...lesson,
                quiz: quiz
            });

            // Small delay to avoid rate limiting
            await sleep(1000);
        }

        // Complete!
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        progressStatus.textContent = '✅ Course generation complete!';

        // Display results
        displayGeneratedCourse();

    } catch (error) {
        console.error('Course generation error:', error);
        progressStatus.textContent = '❌ Error: ' + error.message;
        progressStatus.style.color = '#ef4444';
    } finally {
        generateBtn.disabled = false;
    }
}

// ============================================================================
// API CALLS - Using /ask endpoint (Groq API - WORKING!)
// ============================================================================

async function generateLesson(topic, difficulty, lessonNumber) {
    const prompt = `Create a comprehensive educational lesson on "${topic}" for ${difficulty || 'Beginner'} level students. This is lesson ${lessonNumber}.

Structure the lesson as follows:
1. **Introduction** - Brief overview (2-3 sentences)
2. **Learning Objectives** - What students will learn (3-5 bullet points)
3. **Main Content** - Detailed explanation with examples
4. **Code Examples** (if applicable) - Practical demonstrations with syntax
5. **Key Takeaways** - Summary points (3-5 bullet points)
6. **Practice Exercise** - Simple task to reinforce learning

Format the response in Markdown with proper headings (##, ###), code blocks (\`\`\`language\`\`\`), and bullet points (-).
Make it engaging, clear, and educational!`;

    const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: prompt,
            systemPrompt: "You are an expert educator creating structured, comprehensive learning content. Focus on clarity and practical examples."
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to generate lesson ${lessonNumber}`);
    }

    const data = await response.json();

    if (!data.answer) {
        throw new Error('Lesson generation failed');
    }

    return {
        title: `Lesson ${lessonNumber}: ${topic}`,
        content: data.answer,
        difficulty: difficulty || 'Beginner',
        topic: topic
    };
}

async function generateQuiz(topic, difficulty, questionCount) {
    const prompt = `Generate ${questionCount} multiple-choice quiz questions about "${topic}" for ${difficulty || 'Beginner'} level students.

For each question, provide:
1. Question text
2. Four answer options (A, B, C, D)
3. The correct answer (letter: A, B, C, or D)
4. Brief explanation

Format as JSON array ONLY (no markdown, no extra text):
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "A",
    "explanation": "Why this is correct"
  }
]`;

    const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: prompt,
            systemPrompt: "You are an expert educator. Respond ONLY with valid JSON array, no markdown formatting, no explanations."
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate quiz');
    }

    const data = await response.json();

    if (!data.answer) {
        throw new Error('Quiz generation failed');
    }

    // Extract JSON from response
    try {
        let jsonContent = data.answer;
        // Remove markdown code blocks if present
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        // Find JSON array
        const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            return questions;
        } else {
            throw new Error('No valid JSON found');
        }
    } catch (e) {
        console.error('Quiz parsing error:', e);
        // Return empty quiz if parsing fails
        return [];
    }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

function displayGeneratedCourse() {
    const generatedContent = document.getElementById('generatedContent');
    const resultsSection = document.getElementById('resultsSection');
    const progressSection = document.getElementById('progressSection');

    progressSection.classList.remove('active');
    resultsSection.classList.add('active');

    let html = '';

    generatedCourse.lessons.forEach((lesson, index) => {
        html += `
            <div class="generator-card lesson-item">
                <div class="lesson-header" onclick="toggleLesson(${index})">
                    <div class="lesson-title">
                        <i class="fas fa-book-open"></i>
                        Lesson ${lesson.lessonNumber}: ${lesson.title}
                    </div>
                    <i class="fas fa-chevron-down" id="chevron-${index}"></i>
                </div>
                <div class="lesson-content" id="lesson-content-${index}">
                    <div class="lesson-text">
                        ${formatMarkdown(lesson.content)}
                    </div>
                    ${lesson.quiz && lesson.quiz.length > 0 ? `
                        <div class="quiz-section">
                            <div class="quiz-title">
                                <i class="fas fa-question-circle"></i>
                                Quiz Questions
                            </div>
                            ${lesson.quiz.map((q, qIndex) => `
                                <div class="quiz-question">
                                    <div class="quiz-question-text">
                                        ${qIndex + 1}. ${q.question}
                                    </div>
                                    <div class="quiz-options">
                                        ${q.options.map((opt, optIndex) => `
                                            ${String.fromCharCode(65 + optIndex)}) ${opt}<br>
                                        `).join('')}
                                    </div>
                                    <div class="quiz-answer">
                                        ✓ Correct Answer: ${q.correct}
                                        ${q.explanation ? `<br><em>${q.explanation}</em>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    generatedContent.innerHTML = html;
}

function toggleLesson(index) {
    const content = document.getElementById(`lesson-content-${index}`);
    const chevron = document.getElementById(`chevron-${index}`);

    content.classList.toggle('expanded');

    if (content.classList.contains('expanded')) {
        chevron.className = 'fas fa-chevron-up';
    } else {
        chevron.className = 'fas fa-chevron-down';
    }
}

function formatMarkdown(text) {
    // Simple markdown-to-HTML conversion
    return text
        .replace(/### (.*)/g, '<h4>$1</h4>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// ============================================================================
// ACTION FUNCTIONS
// ============================================================================

function clearResults() {
    const resultsSection = document.getElementById('resultsSection');
    const generatedContent = document.getElementById('generatedContent');
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');

    resultsSection.classList.remove('active');
    progressSection.classList.remove('active');
    generatedContent.innerHTML = '';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    generatedCourse = null;

    document.getElementById('courseForm').reset();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.clearResults = clearResults;
window.toggleLesson = toggleLesson;

// ============================================================================
// PDF DOWNLOAD FUNCTION
// ============================================================================
function downloadCoursePDF() {
    if (!generatedCourse) {
        alert('No course generated yet');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(generatedCourse.title, margin, yPosition);
    yPosition += 10;

    // Difficulty
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Difficulty: ${generatedCourse.difficulty}`, margin, yPosition);
    yPosition += 7;

    // Description
    if (generatedCourse.description) {
        const descLines = doc.splitTextToSize(generatedCourse.description, maxWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += (descLines.length * 7) + 5;
    }

    yPosition += 5;

    // Lessons
    generatedCourse.lessons.forEach((lesson, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }

        // Lesson title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`Lesson ${lesson.lessonNumber}: ${lesson.title}`, margin, yPosition);
        yPosition += 8;

        // Lesson content
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const contentLines = doc.splitTextToSize(lesson.content || '', maxWidth);
        
        contentLines.forEach(line => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += 6;
        });

        yPosition += 5;

        // Quiz section
        if (lesson.quiz && lesson.quiz.questions) {
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Quiz Questions:', margin, yPosition);
            yPosition += 8;

            lesson.quiz.questions.forEach((q, qIndex) => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                const questionText = `Q${qIndex + 1}. ${q.question}`;
                const qLines = doc.splitTextToSize(questionText, maxWidth);
                doc.text(qLines, margin, yPosition);
                yPosition += (qLines.length * 6) + 3;

                doc.setFont(undefined, 'normal');
                q.options.forEach((opt, optIndex) => {
                    if (yPosition > pageHeight - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    const marker = optIndex === q.correctAnswer ? '✓ ' : '  ';
                    doc.text(`${marker}${String.fromCharCode(65 + optIndex)}. ${opt}`, margin + 5, yPosition);
                    yPosition += 5;
                });

                yPosition += 3;
            });
        }

        yPosition += 10;
    });

    // Save PDF
    doc.save(`${generatedCourse.title.replace(/\s+/g, '-').toLowerCase()}-course.pdf`);
    alert('✅ Course downloaded as PDF successfully!');
}

// ============================================================================
// WORD/DOCX DOWNLOAD FUNCTION
// ============================================================================
function downloadCourseWord() {
    if (!generatedCourse) {
        alert('No course generated yet');
        return;
    }

    // Create HTML content for Word document
    let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${generatedCourse.title}</title></head>
        <body>
            <h1>${generatedCourse.title}</h1>
            <p><strong>Difficulty:</strong> ${generatedCourse.difficulty}</p>
            <p>${generatedCourse.description}</p>
            <hr/>
    `;

    generatedCourse.lessons.forEach(lesson => {
        htmlContent += `
            <h2>Lesson ${lesson.lessonNumber}: ${lesson.title}</h2>
            <p>${lesson.content || ''}</p>
        `;

        if (lesson.quiz && lesson.quiz.questions) {
            htmlContent += '<h3>Quiz Questions:</h3>';
            lesson.quiz.questions.forEach((q, qIndex) => {
                htmlContent += `<p><strong>Q${qIndex + 1}. ${q.question}</strong></p><ul>`;
                q.options.forEach((opt, optIndex) => {
                    const marker = optIndex === q.correctAnswer ? ' ✓' : '';
                    htmlContent += `<li>${String.fromCharCode(65 + optIndex)}. ${opt}${marker}</li>`;
                });
                htmlContent += '</ul>';
            });
        }
        htmlContent += '<hr/>';
    });

    htmlContent += '</body></html>';

    // Create blob and download
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedCourse.title.replace(/\s+/g, '-').toLowerCase()}-course.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ Course downloaded as Word document successfully!');
}

function downloadCourse() {
    // Keep old JSON download as backup
    downloadCoursePDF();
}

function copyCourse() {
    if (!generatedCourse) {
        alert('No course generated yet');
        return;
    }

    const courseText = JSON.stringify(generatedCourse, null, 2);
    navigator.clipboard.writeText(courseText).then(() => {
        alert('✅ Course JSON copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('❌ Failed to copy to clipboard');
    });
}

window.downloadCourse = downloadCourse;
window.downloadCoursePDF = downloadCoursePDF;
window.downloadCourseWord = downloadCourseWord;
window.copyCourse = copyCourse;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
