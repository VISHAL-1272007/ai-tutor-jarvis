/**
 * ===== USER PROFILE MANAGER =====
 * Frontend component to manage user profiles, expertise, and preferences
 */

class UserProfileManager {
  constructor() {
    this.userId = this.getUserId();
    this.profile = null;
    this.loadProfile();
  }

  /**
   * Get or create user ID from localStorage
   */
  getUserId() {
    let userId = localStorage.getItem('jarvis_userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('jarvis_userId', userId);
    }
    return userId;
  }

  /**
   * Load user profile from backend
   */
  async loadProfile() {
    try {
      const response = await fetch(`/api/user/profile?userId=${this.userId}`);
      const data = await response.json();
      this.profile = data.profile;
      console.log('👤 User profile loaded:', this.userId);
      return this.profile;
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  /**
   * Add expertise area
   */
  async addExpertise(area, level = 'intermediate') {
    try {
      const response = await fetch('/api/user/expertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          area,
          level
        })
      });
      const data = await response.json();
      this.profile = data.profile;
      console.log(`✅ Added expertise: ${area}`);
      return data;
    } catch (error) {
      console.error('Error adding expertise:', error);
      throw error;
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(prefs) {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          preferences: prefs
        })
      });
      const data = await response.json();
      this.profile = data.profile;
      console.log('✅ Preferences updated');
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Render profile UI
   */
  renderProfileUI() {
    if (!this.profile) return '';

    const expertise = this.profile.expertiseAreas
      .map(area => `<span class="tag">${area}</span>`)
      .join('');

    return `
      <div class="user-profile-panel">
        <h3>👤 Your Profile</h3>
        <div class="profile-info">
          <p><strong>ID:</strong> ${this.profile.userId.substring(0, 12)}...</p>
          <p><strong>Conversations:</strong> ${this.profile.conversationCount}</p>
          <p><strong>Documents Uploaded:</strong> ${this.profile.knowledge.uploadedDocuments}</p>
        </div>
        
        <div class="expertise-section">
          <h4>📚 Expertise Areas</h4>
          <div class="expertise-tags">
            ${expertise || '<p>No expertise areas added yet</p>'}
          </div>
          <div class="add-expertise">
            <input type="text" id="newExpertise" placeholder="e.g., Machine Learning">
            <select id="expertiseLevel">
              <option value="beginner">Beginner</option>
              <option value="intermediate" selected>Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <button onclick="profileManager.addExpertiseFromUI()">Add</button>
          </div>
        </div>

        <div class="preferences-section">
          <h4>⚙️ Preferences</h4>
          <label>
            <input type="checkbox" ${this.profile.preferences.language === 'tanglish' ? 'checked' : ''} 
              onchange="profileManager.updatePref('language', this.checked ? 'tanglish' : 'english')">
            Tanglish Mode
          </label>
          <label>
            Response Length:
            <select onchange="profileManager.updatePref('responseLength', this.value)">
              <option value="short" ${this.profile.preferences.responseLength === 'short' ? 'selected' : ''}>Short</option>
              <option value="medium" ${this.profile.preferences.responseLength === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="long" ${this.profile.preferences.responseLength === 'long' ? 'selected' : ''}>Long</option>
            </select>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Helper to add expertise from UI
   */
  async addExpertiseFromUI() {
    const area = document.getElementById('newExpertise')?.value;
    const level = document.getElementById('expertiseLevel')?.value || 'intermediate';
    if (area) {
      await this.addExpertise(area, level);
      document.getElementById('newExpertise').value = '';
      this.renderProfileUI(); // Refresh UI
    }
  }

  /**
   * Helper to update preference
   */
  async updatePref(key, value) {
    const prefs = { [key]: value };
    await this.updatePreferences(prefs);
  }

  /**
   * Get user context for AI
   */
  async getUserContext() {
    try {
      const response = await fetch(`/api/user/context?userId=${this.userId}`);
      const data = await response.json();
      return data.context;
    } catch (error) {
      console.error('Error getting user context:', error);
      return '';
    }
  }
}

// Global instance
const profileManager = new UserProfileManager();
