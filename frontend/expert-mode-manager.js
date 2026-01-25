/**
 * ===== EXPERT MODE MANAGER =====
 * Frontend component for interactive expert learning sessions
 */

class ExpertModeManager {
  constructor(userId) {
    this.userId = userId;
    this.currentSession = null;
    this.isSessionActive = false;
  }

  /**
   * Start expert session
   */
  async startSession(expertise, level = 'intermediate') {
    try {
      const response = await fetch('/api/expert/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          expertise,
          level
        })
      });

      const data = await response.json();
      this.currentSession = data.session;
      this.isSessionActive = true;
      console.log(`🎓 Expert session started: ${expertise}`);
      return data.session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * Get next question
   */
  async getNextQuestion() {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch(`/api/expert/session/${this.currentSession.sessionId}/question`);
      const data = await response.json();
      return data.question;
    } catch (error) {
      console.error('Error getting question:', error);
      throw error;
    }
  }

  /**
   * Submit answer
   */
  async submitAnswer(answer, aiAnalysis = null) {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch(`/api/expert/session/${this.currentSession.sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer,
          aiAnalysis
        })
      });

      const data = await response.json();
      console.log(`✅ Answer recorded with ${data.learningPointsExtracted} learning points`);
      return data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Provide feedback
   */
  async provideFeedback(feedback, rating = 5) {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch(`/api/expert/session/${this.currentSession.sessionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          rating
        })
      });

      const data = await response.json();
      console.log(`📊 Feedback recorded. Session score: ${data.sessionScore}`);
      return data;
    } catch (error) {
      console.error('Error providing feedback:', error);
      throw error;
    }
  }

  /**
   * End session
   */
  async endSession() {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      const response = await fetch(`/api/expert/session/${this.currentSession.sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      this.isSessionActive = false;
      console.log(`🎉 Session completed`);
      return data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Render expert mode UI
   */
  renderExpertModeUI() {
    if (!this.isSessionActive || !this.currentSession) {
      return `
        <div class="expert-mode-start-panel">
          <h3>🎓 Expert Mode</h3>
          <p>Learn by teaching! Share your expertise and help AI improve.</p>
          
          <div class="start-session">
            <input type="text" id="expertiseInput" placeholder="e.g., Machine Learning, Web Development">
            <select id="levelSelect">
              <option value="beginner">Beginner</option>
              <option value="intermediate" selected>Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <button onclick="expertManager.startSessionFromUI()">Start Session</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="expert-mode-active-panel">
        <h3>🎓 Expert Session</h3>
        <p><strong>${this.currentSession.expertise}</strong> (${this.currentSession.level})</p>
        
        <div class="session-info">
          <p>Questions asked: ${this.currentSession.questions.length}</p>
          <p>Session score: ${this.currentSession.score}</p>
        </div>

        <div class="answer-section" id="answerSection">
          <div id="questionDisplay"></div>
          <textarea id="answerInput" placeholder="Your expert answer..."></textarea>
          <button onclick="expertManager.submitAnswerFromUI()">Submit Answer</button>
        </div>

        <button onclick="expertManager.endSessionFromUI()" class="end-session-btn">End Session</button>
      </div>
    `;
  }

  /**
   * Helper to start session from UI
   */
  async startSessionFromUI() {
    const expertise = document.getElementById('expertiseInput')?.value;
    const level = document.getElementById('levelSelect')?.value || 'intermediate';
    
    if (!expertise) {
      alert('Please enter an expertise area');
      return;
    }

    try {
      await this.startSession(expertise, level);
      const question = await this.getNextQuestion();
      this.displayQuestion(question);
      this.renderUI();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  /**
   * Helper to submit answer from UI
   */
  async submitAnswerFromUI() {
    const answer = document.getElementById('answerInput')?.value;
    if (!answer) {
      alert('Please provide an answer');
      return;
    }

    try {
      await this.submitAnswer(answer);
      document.getElementById('answerInput').value = '';
      
      // Get next question
      const question = await this.getNextQuestion();
      this.displayQuestion(question);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  /**
   * Helper to end session from UI
   */
  async endSessionFromUI() {
    if (confirm('End this expert session?')) {
      try {
        const result = await this.endSession();
        alert(`Session completed!\nTotal interactions: ${result.summary.interactions}\nLearning points: ${result.summary.knowledgePoints}`);
        this.renderUI();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  }

  /**
   * Display question
   */
  displayQuestion(question) {
    const display = document.getElementById('questionDisplay');
    if (display) {
      display.innerHTML = `<p><strong>Question:</strong><br>${question}</p>`;
    }
  }

  /**
   * Render UI (wrapper)
   */
  renderUI() {
    // Update DOM with current state
    const container = document.getElementById('expertModeContainer');
    if (container) {
      container.innerHTML = this.renderExpertModeUI();
    }
  }

  /**
   * Get expert context for AI
   */
  async getExpertContext() {
    try {
      const response = await fetch(`/api/expert/context?userId=${this.userId}`);
      const data = await response.json();
      return data.context;
    } catch (error) {
      console.error('Error getting expert context:', error);
      return '';
    }
  }
}

// Will be initialized with userId
let expertManager;
