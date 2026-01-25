/**
 * ===== USER PROFILE SYSTEM =====
 * Manages user authentication, expertise areas, and learning profiles
 * Stores user data with expertise tracking for personalized AI responses
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UserProfileSystem {
  constructor() {
    this.usersDir = path.join(__dirname, '../data/users');
    this.ensureDirectoryExists(this.usersDir);
    this.loadProfiles();
  }

  /**
   * Ensure data directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  /**
   * Load all user profiles
   */
  loadProfiles() {
    this.profiles = {};
    if (!fs.existsSync(this.usersDir)) return;

    const files = fs.readdirSync(this.usersDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = fs.readFileSync(path.join(this.usersDir, file), 'utf8');
          const profile = JSON.parse(data);
          this.profiles[profile.userId] = profile;
        } catch (error) {
          console.error(`Error loading profile ${file}:`, error.message);
        }
      }
    });
    console.log(`✅ Loaded ${Object.keys(this.profiles).length} user profiles`);
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return `user_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Create or get user profile
   */
  getOrCreateUser(userIdentifier) {
    // Try to find existing user by email or session ID
    let userId = null;

    // Check if it's an existing user ID
    if (userIdentifier && this.profiles[userIdentifier]) {
      return this.profiles[userIdentifier];
    }

    // Create new user
    userId = this.generateUserId();
    const profile = {
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expertiseAreas: [],
      expertise: {},
      preferences: {
        language: 'english',
        responseLength: 'medium',
        detailLevel: 'standard'
      },
      knowledge: {
        uploadedDocuments: 0,
        totalTokens: 0
      },
      learningHistory: [],
      conversationCount: 0
    };

    this.profiles[userId] = profile;
    this.saveProfile(userId);
    console.log(`👤 Created new user profile: ${userId}`);
    return profile;
  }

  /**
   * Save profile to file
   */
  saveProfile(userId) {
    if (!this.profiles[userId]) return;

    const profile = this.profiles[userId];
    const filePath = path.join(this.usersDir, `${userId}.json`);

    try {
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
    } catch (error) {
      console.error(`Error saving profile ${userId}:`, error.message);
    }
  }

  /**
   * Update expertise area
   */
  addExpertiseArea(userId, area, level = 'intermediate') {
    const profile = this.getOrCreateUser(userId);

    if (!profile.expertiseAreas.includes(area)) {
      profile.expertiseAreas.push(area);
    }

    profile.expertise[area] = {
      level, // beginner, intermediate, expert
      addedAt: new Date().toISOString(),
      documents: 0,
      interactions: 0
    };

    this.saveProfile(userId);
    return profile;
  }

  /**
   * Record learning interaction
   */
  recordLearning(userId, question, answer, expertFeedback = null) {
    const profile = this.getOrCreateUser(userId);

    profile.learningHistory.push({
      timestamp: new Date().toISOString(),
      question,
      answer,
      expertFeedback,
      verified: !!expertFeedback
    });

    // Keep only last 100 interactions
    if (profile.learningHistory.length > 100) {
      profile.learningHistory = profile.learningHistory.slice(-100);
    }

    this.saveProfile(userId);
    return profile;
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId, preferences) {
    const profile = this.getOrCreateUser(userId);
    profile.preferences = { ...profile.preferences, ...preferences };
    this.saveProfile(userId);
    return profile;
  }

  /**
   * Record document upload
   */
  recordDocumentUpload(userId, documentName, tokensUsed) {
    const profile = this.getOrCreateUser(userId);

    profile.knowledge.uploadedDocuments += 1;
    profile.knowledge.totalTokens += tokensUsed;

    this.saveProfile(userId);
    return profile;
  }

  /**
   * Increment conversation count
   */
  incrementConversation(userId) {
    const profile = this.getOrCreateUser(userId);
    profile.conversationCount += 1;
    profile.lastActivity = new Date().toISOString();
    this.saveProfile(userId);
    return profile;
  }

  /**
   * Get user summary (for AI context)
   */
  getUserSummary(userId) {
    const profile = this.getOrCreateUser(userId);
    return {
      userId,
      expertise: profile.expertiseAreas,
      experience: profile.expertiseAreas.map(area => profile.expertise[area]),
      conversationCount: profile.conversationCount,
      recentLearning: profile.learningHistory.slice(-5),
      preferences: profile.preferences,
      knowledgeBase: profile.knowledge
    };
  }

  /**
   * Get expertise context for AI
   */
  getExpertiseContext(userId) {
    const profile = this.getOrCreateUser(userId);

    if (profile.expertiseAreas.length === 0) {
      return '';
    }

    let context = '📚 User Expertise Areas:\n';
    profile.expertiseAreas.forEach(area => {
      const exp = profile.expertise[area];
      context += `• ${area} (${exp.level})\n`;
    });

    context += '\n🧠 Recent Learning:\n';
    profile.learningHistory.slice(-3).forEach(item => {
      context += `• Q: "${item.question.substring(0, 50)}..."\n`;
    });

    return context;
  }
}

module.exports = UserProfileSystem;
