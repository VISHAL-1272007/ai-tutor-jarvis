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
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        putOnlyUsedFonts: true
    });
    
    // Enable UTF-8 support
    doc.setLanguage("en-US");
    doc.setCharSpace(0);
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;

    // Helper function to clean text for UTF-8
    const cleanText = (text) => {
        if (!text) return '';
        // Decode HTML entities and ensure UTF-8
        const txt = document.createElement('textarea');
        txt.innerHTML = text;
        return txt.value
            .replace(/[\u2018\u2019]/g, "'")  // Smart quotes to regular
            .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
            .replace(/[\u2013\u2014]/g, '-')  // En/em dashes
            .replace(/[\u2026]/g, '...')      // Ellipsis
            .replace(/\u00A0/g, ' ')          // Non-breaking space
            .trim();
    };

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(cleanText(generatedCourse.title), margin, yPosition, { maxWidth: maxWidth });
    yPosition += 12;

    // Difficulty
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Difficulty: ${cleanText(generatedCourse.difficulty)}`, margin, yPosition);
    yPosition += 8;

    // Description
    if (generatedCourse.description) {
        const descLines = doc.splitTextToSize(cleanText(generatedCourse.description), maxWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += (descLines.length * 7) + 8;
    }

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, 190, yPosition);
    yPosition += 10;

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
        const lessonTitle = cleanText(`Lesson ${lesson.lessonNumber}: ${lesson.title}`);
        doc.text(lessonTitle, margin, yPosition, { maxWidth: maxWidth });
        yPosition += 10;

        // Lesson content
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const cleanContent = cleanText(lesson.content || '');
        const contentLines = doc.splitTextToSize(cleanContent, maxWidth);
        
        contentLines.forEach(line => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += 5;
        });

        yPosition += 8;

        // Quiz section - fix the array check
        if (lesson.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0) {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(13);
            doc.setFont(undefined, 'bold');
            doc.text('Quiz Questions:', margin, yPosition);
            yPosition += 8;

            lesson.quiz.forEach((q, qIndex) => {
                if (yPosition > pageHeight - 35) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                const questionText = cleanText(`Q${qIndex + 1}. ${q.question}`);
                const qLines = doc.splitTextToSize(questionText, maxWidth);
                doc.text(qLines, margin, yPosition);
                yPosition += (qLines.length * 5) + 4;

                doc.setFont(undefined, 'normal');
                if (q.options && Array.isArray(q.options)) {
                    q.options.forEach((opt, optIndex) => {
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        const isCorrect = q.correct === String.fromCharCode(65 + optIndex) || 
                                        q.correctAnswer === optIndex;
                        const marker = isCorrect ? '[✓] ' : '[ ] ';
                        const optionText = cleanText(`${marker}${String.fromCharCode(65 + optIndex)}. ${opt}`);
                        doc.text(optionText, margin + 5, yPosition);
                        yPosition += 5;
                    });
                }

                if (q.explanation) {
                    yPosition += 2;
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'italic');
                    const explLines = doc.splitTextToSize(cleanText(`Explanation: ${q.explanation}`), maxWidth - 5);
                    doc.text(explLines, margin + 5, yPosition);
                    yPosition += (explLines.length * 4) + 3;
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(10);
                }

                yPosition += 4;
            });
        }

        yPosition += 5;
        if (yPosition < pageHeight - 10) {
            doc.setLineWidth(0.2);
            doc.line(margin, yPosition, 190, yPosition);
            yPosition += 8;
        }
    });
    });

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
            `Page ${i} of ${pageCount} | ${cleanText(generatedCourse.title)}`,
            105,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Save PDF with UTF-8 encoding
    const filename = `${generatedCourse.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-course.pdf`;
    doc.save(filename);
    alert('✅ Course downloaded as PDF with UTF-8 encoding!');
}

// ============================================================================
// WORD/DOCX DOWNLOAD FUNCTION
// ============================================================================
function downloadCourseWord() {
    if (!generatedCourse) {
        alert('No course generated yet');
        return;
    }

    // Helper function to clean HTML entities
    const cleanHTML = (text) => {
        if (!text) return '';
        const txt = document.createElement('textarea');
        txt.innerHTML = text;
        return txt.value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    // Create HTML content for Word document with UTF-8
    let htmlContent = `<!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='UTF-8'>
            <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
            <title>${cleanHTML(generatedCourse.title)}</title>
            <style>
                body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
                h1 { font-size: 20pt; color: #2563eb; }
                h2 { font-size: 16pt; color: #1d4ed8; margin-top: 20pt; }
                h3 { font-size: 13pt; color: #1e40af; margin-top: 15pt; }
                p { margin: 5pt 0; }
                .quiz-option { margin-left: 20pt; }
                .correct { font-weight: bold; color: #10b981; }
                hr { border: 1px solid #e5e7eb; margin: 10pt 0; }
            </style>
        </head>
        <body>
            <h1>${cleanHTML(generatedCourse.title)}</h1>
            <p><strong>Difficulty:</strong> ${cleanHTML(generatedCourse.difficulty)}</p>
            <p>${cleanHTML(generatedCourse.description)}</p>
            <hr/>
    `;

    generatedCourse.lessons.forEach(lesson => {
        htmlContent += `
            <h2>Lesson ${lesson.lessonNumber}: ${cleanHTML(lesson.title)}</h2>
            <p>${cleanHTML(lesson.content || '').replace(/\n/g, '<br/>')}</p>
        `;

        if (lesson.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0) {
            htmlContent += '<h3>Quiz Questions:</h3>';
            lesson.quiz.forEach((q, qIndex) => {
                htmlContent += `<p><strong>Q${qIndex + 1}. ${cleanHTML(q.question)}</strong></p><div class="quiz-option">`;
                
                if (q.options && Array.isArray(q.options)) {
                    q.options.forEach((opt, optIndex) => {
                        const isCorrect = q.correct === String.fromCharCode(65 + optIndex) || 
                                        q.correctAnswer === optIndex;
                        const className = isCorrect ? ' class="correct"' : '';
                        const marker = isCorrect ? ' ✓' : '';
                        htmlContent += `<p${className}>${String.fromCharCode(65 + optIndex)}. ${cleanHTML(opt)}${marker}</p>`;
                    });
                }
                
                if (q.explanation) {
                    htmlContent += `<p><em>Explanation: ${cleanHTML(q.explanation)}</em></p>`;
                }
                
                htmlContent += '</div>';
            });
        }
        htmlContent += '<hr/>';
    });

    htmlContent += '</body></html>';

    // Create blob with UTF-8 BOM for proper encoding
    const BOM = '\ufeff';
    const blob = new Blob([BOM + htmlContent], {
        type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedCourse.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-course.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ Course downloaded as Word document with UTF-8 encoding!');
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
