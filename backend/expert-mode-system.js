/**
 * ===== EXPERT MODE SYSTEM =====
 * Interactive learning mode where AI asks questions and learns from expert answers
 * Builds adaptive knowledge base from expert feedback
 */

const fs = require('fs');
const path = require('path');

class ExpertModeSystem {
  constructor() {
    this.sessionsDir = path.join(__dirname, '../data/expert-sessions');
    this.ensureDirectoryExists(this.sessionsDir);
    this.loadSessions();
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created expert mode directory`);
    }
  }

  /**
   * Load all sessions
   */
  loadSessions() {
    this.sessions = {};
    const files = fs.readdirSync(this.sessionsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = fs.readFileSync(path.join(this.sessionsDir, file), 'utf8');
          const session = JSON.parse(data);
          this.sessions[session.sessionId] = session;
        } catch (error) {
          console.error(`Error loading session ${file}:`, error.message);
        }
      }
    });
  }

  /**
   * Start expert session
   */
  startSession(userId, expertise, level = 'intermediate') {
    const sessionId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = {
      sessionId,
      userId,
      expertise,
      level, // beginner, intermediate, expert
      startedAt: new Date().toISOString(),
      status: 'active',
      questions: [],
      feedback: [],
      knowledge: [],
      score: 0,
      totalInteractions: 0
    };

    this.sessions[sessionId] = session;
    this.saveSession(sessionId);

    console.log(`🎓 Expert session started: ${sessionId}`);
    return session;
  }

  /**
   * Generate learning questions based on expertise
   */
  generateQuestions(expertise, level) {
    const questions = {
      beginner: [
        `What are the fundamental concepts of ${expertise}?`,
        `How did you get started in ${expertise}?`,
        `What are the most common mistakes people make in ${expertise}?`,
        `What resources would you recommend for learning ${expertise}?`,
        `How has ${expertise} evolved in recent years?`
      ],
      intermediate: [
        `What are advanced techniques in ${expertise}?`,
        `How do you apply ${expertise} in real-world scenarios?`,
        `What challenges have you faced in ${expertise}?`,
        `How do you stay updated with trends in ${expertise}?`,
        `What best practices do you follow in ${expertise}?`
      ],
      expert: [
        `What innovations are you working on in ${expertise}?`,
        `How would you approach teaching ${expertise} to others?`,
        `What emerging technologies affect ${expertise}?`,
        `How do you mentor others in ${expertise}?`,
        `What's the future direction of ${expertise}?`
      ]
    };

    const levelQuestions = questions[level] || questions.intermediate;
    return levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
  }

  /**
   * Ask next question
   */
  getNextQuestion(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    const question = this.generateQuestions(session.expertise, session.level);

    session.questions.push({
      number: session.questions.length + 1,
      text: question,
      askedAt: new Date().toISOString(),
      answer: null,
      feedback: null
    });

    this.saveSession(sessionId);
    return question;
  }

  /**
   * Record expert answer
   */
  recordAnswer(sessionId, answerText, aiAnalysis = null) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    const lastQuestion = session.questions[session.questions.length - 1];
    lastQuestion.answer = answerText;
    lastQuestion.answerAt = new Date().toISOString();
    lastQuestion.aiAnalysis = aiAnalysis;

    // Extract key learning points
    const keyPoints = this.extractKeyPoints(answerText);
    session.knowledge.push({
      expertise: session.expertise,
      learningPoints: keyPoints,
      originalAnswer: answerText,
      learnedAt: new Date().toISOString(),
      expertise_level: session.level
    });

    session.totalInteractions += 1;
    this.saveSession(sessionId);

    return {
      recorded: true,
      learningPointsExtracted: keyPoints.length,
      nextAction: 'provide_feedback'
    };
  }

  /**
   * Extract key learning points from answer
   */
  extractKeyPoints(answer) {
    const points = [];
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim());

    // Take sentences that are substantial (more than 10 words)
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 10) {
        points.push(sentence.trim());
      }
    });

    return points.slice(0, 5); // Top 5 points
  }

  /**
   * Provide feedback on expert answer
   */
  provideFeedback(sessionId, feedbackText, rating = 5) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    const lastQuestion = session.questions[session.questions.length - 1];
    lastQuestion.feedback = feedbackText;
    lastQuestion.rating = rating;
    lastQuestion.feedbackAt = new Date().toISOString();

    // Update score
    session.score += rating;

    this.saveSession(sessionId);

    return {
      feedbackRecorded: true,
      sessionScore: session.score,
      totalInteractions: session.totalInteractions
    };
  }

  /**
   * End session
   */
  endSession(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.duration = (new Date(session.endedAt) - new Date(session.startedAt)) / 1000; // seconds

    this.saveSession(sessionId);

    return {
      sessionEnded: true,
      summary: {
        expertise: session.expertise,
        interactions: session.totalInteractions,
        score: session.score,
        knowledgePoints: session.knowledge.length,
        duration: `${Math.floor(session.duration / 60)} minutes`
      }
    };
  }

  /**
   * Save session
   */
  saveSession(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) return;

    try {
      const filePath = path.join(this.sessionsDir, `${sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      console.error(`Error saving session ${sessionId}:`, error.message);
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      sessionId,
      expertise: session.expertise,
      level: session.level,
      status: session.status,
      questions: session.questions.length,
      score: session.score,
      learningPoints: session.knowledge.length,
      startedAt: session.startedAt,
      endedAt: session.endedAt || null
    };
  }

  /**
   * Get expert knowledge base
   */
  getExpertKnowledge(userId, expertise) {
    const userSessions = Object.values(this.sessions).filter(
      s => s.userId === userId && s.expertise === expertise && s.status === 'completed'
    );

    const allKnowledge = [];
    userSessions.forEach(session => {
      allKnowledge.push(...session.knowledge);
    });

    return allKnowledge;
  }

  /**
   * Get context for AI from expert mode
   */
  getExpertContext(userId) {
    const sessions = Object.values(this.sessions).filter(s => s.userId === userId);

    if (sessions.length === 0) return '';

    let context = '🎓 Expert Mode Learning:\n';
    sessions.forEach(session => {
      if (session.knowledge.length > 0) {
        context += `\n${session.expertise} (${session.level}):\n`;
        session.knowledge.slice(0, 2).forEach(item => {
          context += `• ${item.learningPoints[0]?.substring(0, 80)}...\n`;
        });
      }
    });

    return context;
  }
}

module.exports = ExpertModeSystem;
