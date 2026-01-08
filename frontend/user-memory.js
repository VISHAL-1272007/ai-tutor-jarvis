// ===== JARVIS USER MEMORY & PERSONALIZATION SYSTEM =====
// Continuous learning and user understanding

class UserMemory {
    constructor() {
        this.userId = this.getUserId();
        this.profile = this.loadProfile();
        this.conversationHistory = [];
        this.preferences = this.loadPreferences();
        this.knowledgeGraph = this.loadKnowledgeGraph();
        this.interactionStats = this.loadStats();
        this.maxHistorySize = 1000;
        this.initializeMemorySystem();
    }

    initializeMemorySystem() {
        console.log('[JARVIS Memory] Initializing personalization system...');
        this.startAutoSave();
        this.analyzeUserPatterns();
    }

    getUserId() {
        let userId = localStorage.getItem('jarvis_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('jarvis_user_id', userId);
        }
        return userId;
    }

    loadProfile() {
        try {
            const saved = localStorage.getItem(`jarvis_profile_${this.userId}`);
            return saved ? JSON.parse(saved) : {
                name: null,
                interests: [],
                skillLevel: 'intermediate',
                learningGoals: [],
                preferredTopics: [],
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                created: new Date(),
                lastActive: new Date()
            };
        } catch (error) {
            console.error('[JARVIS Memory] Profile load failed:', error);
            return {};
        }
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem(`jarvis_preferences_${this.userId}`);
            return saved ? JSON.parse(saved) : {
                responseStyle: 'detailed', // detailed, concise, technical
                voiceEnabled: false,
                autoSpeak: false,
                theme: 'dark',
                notificationsEnabled: true,
                codeLanguage: 'javascript',
                explainLevel: 'intermediate'
            };
        } catch (error) {
            return {};
        }
    }

    loadKnowledgeGraph() {
        try {
            const saved = localStorage.getItem(`jarvis_knowledge_${this.userId}`);
            return saved ? JSON.parse(saved) : {
                topics: {},
                concepts: {},
                connections: []
            };
        } catch (error) {
            return { topics: {}, concepts: {}, connections: [] };
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem(`jarvis_stats_${this.userId}`);
            return saved ? JSON.parse(saved) : {
                totalInteractions: 0,
                totalQuestions: 0,
                topicsExplored: [],
                averageSessionTime: 0,
                lastVisit: new Date(),
                streak: 0,
                achievements: []
            };
        } catch (error) {
            return {};
        }
    }

    addInteraction(userMessage, aiResponse, metadata = {}) {
        const interaction = {
            id: Date.now(),
            timestamp: new Date(),
            userMessage,
            aiResponse,
            metadata: {
                ...metadata,
                sentiment: this.analyzeSentiment(userMessage),
                topics: this.extractTopics(userMessage),
                complexity: this.assessComplexity(userMessage)
            }
        };

        this.conversationHistory.unshift(interaction);
        
        // Keep only recent history
        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory = this.conversationHistory.slice(0, this.maxHistorySize);
        }

        // Update knowledge graph
        this.updateKnowledgeGraph(interaction);
        
        // Update stats
        this.updateStats(interaction);

        this.saveAll();
        return interaction;
    }

    analyzeSentiment(text) {
        const positive = ['great', 'good', 'excellent', 'thanks', 'awesome', 'perfect', 'love', 'helpful'];
        const negative = ['bad', 'wrong', 'error', 'confused', 'stuck', 'frustrated', 'hate'];
        
        const textLower = text.toLowerCase();
        let score = 0;
        
        positive.forEach(word => {
            if (textLower.includes(word)) score += 1;
        });
        
        negative.forEach(word => {
            if (textLower.includes(word)) score -= 1;
        });

        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    }

    extractTopics(text) {
        const topics = {
            'programming': ['code', 'program', 'function', 'variable', 'class', 'debug'],
            'web development': ['html', 'css', 'javascript', 'react', 'frontend', 'backend'],
            'data science': ['data', 'analysis', 'machine learning', 'ai', 'model', 'dataset'],
            'mathematics': ['math', 'equation', 'calculate', 'solve', 'formula'],
            'science': ['physics', 'chemistry', 'biology', 'experiment', 'research'],
            'business': ['marketing', 'management', 'strategy', 'finance', 'startup'],
            'design': ['design', 'ui', 'ux', 'interface', 'layout', 'graphic']
        };

        const textLower = text.toLowerCase();
        const detected = [];

        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                detected.push(topic);
            }
        }

        return detected;
    }

    assessComplexity(text) {
        const words = text.split(/\s+/).length;
        const technicalTerms = (text.match(/\b[A-Z][a-z]+[A-Z][a-z]+\b/g) || []).length;
        const codeBlocks = (text.match(/```|`/g) || []).length;

        if (words > 100 || technicalTerms > 5 || codeBlocks > 2) return 'advanced';
        if (words > 50 || technicalTerms > 2 || codeBlocks > 0) return 'intermediate';
        return 'basic';
    }

    updateKnowledgeGraph(interaction) {
        const topics = interaction.metadata.topics;
        
        topics.forEach(topic => {
            if (!this.knowledgeGraph.topics[topic]) {
                this.knowledgeGraph.topics[topic] = {
                    name: topic,
                    frequency: 0,
                    lastAccessed: new Date(),
                    relatedConcepts: []
                };
            }
            this.knowledgeGraph.topics[topic].frequency += 1;
            this.knowledgeGraph.topics[topic].lastAccessed = new Date();
        });

        // Create connections between topics
        for (let i = 0; i < topics.length; i++) {
            for (let j = i + 1; j < topics.length; j++) {
                const connection = `${topics[i]}-${topics[j]}`;
                if (!this.knowledgeGraph.connections.includes(connection)) {
                    this.knowledgeGraph.connections.push(connection);
                }
            }
        }
    }

    updateStats(interaction) {
        this.interactionStats.totalInteractions += 1;
        this.interactionStats.totalQuestions += 1;
        this.interactionStats.lastVisit = new Date();
        
        // Update topics explored
        interaction.metadata.topics.forEach(topic => {
            if (!this.interactionStats.topicsExplored.includes(topic)) {
                this.interactionStats.topicsExplored.push(topic);
            }
        });

        // Calculate streak
        const lastVisit = new Date(this.interactionStats.lastVisit);
        const now = new Date();
        const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0 || daysDiff === 1) {
            this.interactionStats.streak += 1;
        } else if (daysDiff > 1) {
            this.interactionStats.streak = 1;
        }
    }

    getPersonalizedContext() {
        const recentHistory = this.conversationHistory.slice(0, 10);
        const topTopics = Object.entries(this.knowledgeGraph.topics)
            .sort((a, b) => b[1].frequency - a[1].frequency)
            .slice(0, 5)
            .map(([topic]) => topic);

        return {
            userName: this.profile.name || 'Student',
            skillLevel: this.profile.skillLevel,
            interests: this.profile.interests,
            recentTopics: topTopics,
            preferredStyle: this.preferences.responseStyle,
            conversationContext: recentHistory.map(h => ({
                user: h.userMessage.substring(0, 100),
                ai: h.aiResponse.substring(0, 100),
                topics: h.metadata.topics
            })),
            totalInteractions: this.interactionStats.totalInteractions,
            streak: this.interactionStats.streak,
            learningPath: this.generateLearningPath()
        };
    }

    generateLearningPath() {
        const topicsFreq = Object.entries(this.knowledgeGraph.topics)
            .sort((a, b) => b[1].frequency - a[1].frequency);

        if (topicsFreq.length === 0) return null;

        const primaryTopic = topicsFreq[0][0];
        const relatedTopics = topicsFreq.slice(1, 4).map(([topic]) => topic);

        return {
            current: primaryTopic,
            suggested: relatedTopics,
            level: this.profile.skillLevel,
            nextSteps: this.getNextSteps(primaryTopic)
        };
    }

    getNextSteps(topic) {
        const steps = {
            'programming': ['Master basics', 'Build projects', 'Learn algorithms', 'Contribute to open source'],
            'web development': ['HTML/CSS mastery', 'JavaScript deep dive', 'Framework learning', 'Full-stack project'],
            'data science': ['Python basics', 'Statistics', 'ML algorithms', 'Real-world projects'],
            'default': ['Continue exploring', 'Practice regularly', 'Build projects', 'Share knowledge']
        };

        return steps[topic] || steps.default;
    }

    updateProfile(updates) {
        this.profile = { ...this.profile, ...updates, lastActive: new Date() };
        this.saveProfile();
    }

    updatePreferences(updates) {
        this.preferences = { ...this.preferences, ...updates };
        this.savePreferences();
    }

    startAutoSave() {
        setInterval(() => {
            this.saveAll();
        }, 30000); // Save every 30 seconds
    }

    saveAll() {
        this.saveProfile();
        this.savePreferences();
        this.saveKnowledgeGraph();
        this.saveStats();
        this.saveHistory();
    }

    saveProfile() {
        try {
            localStorage.setItem(
                `jarvis_profile_${this.userId}`,
                JSON.stringify(this.profile)
            );
        } catch (error) {
            console.error('[JARVIS Memory] Profile save failed:', error);
        }
    }

    savePreferences() {
        try {
            localStorage.setItem(
                `jarvis_preferences_${this.userId}`,
                JSON.stringify(this.preferences)
            );
        } catch (error) {
            console.error('[JARVIS Memory] Preferences save failed:', error);
        }
    }

    saveKnowledgeGraph() {
        try {
            localStorage.setItem(
                `jarvis_knowledge_${this.userId}`,
                JSON.stringify(this.knowledgeGraph)
            );
        } catch (error) {
            console.error('[JARVIS Memory] Knowledge graph save failed:', error);
        }
    }

    saveStats() {
        try {
            localStorage.setItem(
                `jarvis_stats_${this.userId}`,
                JSON.stringify(this.interactionStats)
            );
        } catch (error) {
            console.error('[JARVIS Memory] Stats save failed:', error);
        }
    }

    saveHistory() {
        try {
            // Save only last 100 interactions to avoid storage limits
            const recentHistory = this.conversationHistory.slice(0, 100);
            localStorage.setItem(
                `jarvis_history_${this.userId}`,
                JSON.stringify(recentHistory)
            );
        } catch (error) {
            console.error('[JARVIS Memory] History save failed:', error);
        }
    }

    analyzeUserPatterns() {
        setInterval(() => {
            const patterns = {
                mostActiveTime: this.getMostActiveTime(),
                averageComplexity: this.getAverageComplexity(),
                learningVelocity: this.getLearningVelocity(),
                engagementScore: this.calculateEngagement()
            };

            console.log('[JARVIS Memory] User patterns:', patterns);
        }, 300000); // Every 5 minutes
    }

    getMostActiveTime() {
        const hours = this.conversationHistory.map(h => new Date(h.timestamp).getHours());
        const freq = {};
        hours.forEach(h => freq[h] = (freq[h] || 0) + 1);
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    }

    getAverageComplexity() {
        const complexities = this.conversationHistory
            .slice(0, 50)
            .map(h => h.metadata.complexity);
        
        const counts = { basic: 0, intermediate: 0, advanced: 0 };
        complexities.forEach(c => counts[c] = (counts[c] || 0) + 1);
        
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'intermediate';
    }

    getLearningVelocity() {
        const recentTopics = this.conversationHistory
            .slice(0, 20)
            .flatMap(h => h.metadata.topics);
        
        return new Set(recentTopics).size; // Unique topics in recent interactions
    }

    calculateEngagement() {
        const recent = this.conversationHistory.slice(0, 50);
        if (recent.length === 0) return 0;

        const positiveCount = recent.filter(h => h.metadata.sentiment === 'positive').length;
        return (positiveCount / recent.length) * 100;
    }

    clearHistory() {
        this.conversationHistory = [];
        this.saveHistory();
    }

    exportData() {
        return {
            profile: this.profile,
            preferences: this.preferences,
            knowledgeGraph: this.knowledgeGraph,
            stats: this.interactionStats,
            recentHistory: this.conversationHistory.slice(0, 100)
        };
    }
}

// Initialize global user memory
window.jarvisMemory = new UserMemory();
console.log('[JARVIS User Memory] Personalization system initialized');
