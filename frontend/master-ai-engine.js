// ===== JARVIS MASTER AI ENGINE =====
// Comprehensive A-Z knowledge with enhanced capabilities

class MasterAIEngine {
    constructor() {
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.enhancedContext = true;
        this.multiModelSupport = true;
        this.initialized = false;
        this.init();
    }

    async init() {
        console.log('[JARVIS Master AI] Initializing master-level intelligence...');
        
        // Wait for dependencies
        await this.waitForDependencies();
        
        this.initialized = true;
        console.log('[JARVIS Master AI] System ready with comprehensive A-Z knowledge');
    }

    async waitForDependencies() {
        const maxWait = 10000; // 10 seconds
        const startTime = Date.now();

        while (!window.jarvisNews || !window.jarvisMemory) {
            if (Date.now() - startTime > maxWait) {
                console.warn('[JARVIS Master AI] Dependencies timeout, continuing with limited features');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    initializeKnowledgeBase() {
        return {
            // Comprehensive knowledge domains
            domains: {
                technology: {
                    topics: ['AI/ML', 'Web Dev', 'Mobile', 'Cloud', 'Cybersecurity', 'Blockchain', 'IoT', 'DevOps'],
                    depth: 'expert'
                },
                science: {
                    topics: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Environmental', 'Neuroscience'],
                    depth: 'advanced'
                },
                mathematics: {
                    topics: ['Algebra', 'Calculus', 'Statistics', 'Linear Algebra', 'Discrete Math', 'Number Theory'],
                    depth: 'expert'
                },
                programming: {
                    topics: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'SQL', 'Algorithms', 'Data Structures'],
                    depth: 'expert'
                },
                business: {
                    topics: ['Marketing', 'Finance', 'Management', 'Strategy', 'Entrepreneurship', 'Analytics'],
                    depth: 'intermediate'
                },
                arts: {
                    topics: ['Design', 'Music', 'Literature', 'History', 'Philosophy', 'Psychology'],
                    depth: 'intermediate'
                },
                languages: {
                    topics: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Programming Languages'],
                    depth: 'advanced'
                },
                daily_life: {
                    topics: ['Cooking', 'Health', 'Fitness', 'Travel', 'Productivity', 'Finance'],
                    depth: 'intermediate'
                }
            }
        };
    }

    async generateEnhancedResponse(userMessage, originalResponse) {
        if (!this.initialized) {
            console.warn('[JARVIS Master AI] System not fully initialized');
            return originalResponse;
        }

        try {
            // 1. Get user context and personalization
            const userContext = window.jarvisMemory?.getPersonalizedContext() || {};
            
            // 2. Get relevant news and current knowledge
            const newsContext = window.jarvisNews?.getRelevantNews(userMessage, 3) || [];
            
            // 3. Enhance response with context
            const enhancedResponse = await this.enrichResponse({
                originalResponse,
                userMessage,
                userContext,
                newsContext,
                knowledgeDomain: this.identifyDomain(userMessage)
            });

            // 4. Add personalization
            const personalizedResponse = this.personalizeResponse(enhancedResponse, userContext);

            // 5. Store interaction for learning
            if (window.jarvisMemory) {
                window.jarvisMemory.addInteraction(userMessage, personalizedResponse, {
                    enhanced: true,
                    newsIncluded: newsContext.length > 0
                });
            }

            return personalizedResponse;

        } catch (error) {
            console.error('[JARVIS Master AI] Enhancement failed:', error);
            return originalResponse;
        }
    }

    async enrichResponse(data) {
        const { originalResponse, userMessage, userContext, newsContext, knowledgeDomain } = data;

        let enriched = originalResponse;

        // Add current knowledge if relevant
        if (newsContext.length > 0 && this.isNewsRelevant(userMessage, newsContext)) {
            const newsSection = this.formatNewsContext(newsContext);
            enriched += `\n\n📰 **Latest Updates:**\n${newsSection}`;
        }

        // Add domain-specific insights
        if (knowledgeDomain) {
            const insights = this.getDomainInsights(knowledgeDomain, userMessage);
            if (insights) {
                enriched += `\n\n💡 **Deep Dive:**\n${insights}`;
            }
        }

        // Add learning path suggestions if user is learning
        if (userContext.learningPath) {
            const suggestions = this.getLearningRecommendations(userContext.learningPath, userMessage);
            if (suggestions) {
                enriched += `\n\n🎯 **Recommended Next:**\n${suggestions}`;
            }
        }

        return enriched;
    }

    personalizeResponse(response, userContext) {
        let personalized = response;

        // Add user name if available
        if (userContext.userName && userContext.userName !== 'Student') {
            // Occasionally use name naturally
            if (Math.random() > 0.7) {
                personalized = personalized.replace(
                    /^(.*?)$/m,
                    `$1, ${userContext.userName}`
                );
            }
        }

        // Adjust complexity based on skill level
        if (userContext.skillLevel === 'beginner') {
            // Add more explanations
            personalized += '\n\n_Let me know if you need any clarification!_';
        } else if (userContext.skillLevel === 'advanced') {
            // Can be more technical
            // Already handled by the response style
        }

        // Add streak encouragement
        if (userContext.streak && userContext.streak >= 3) {
            personalized += `\n\n🔥 **${userContext.streak}-day learning streak!** Keep it up!`;
        }

        return personalized;
    }

    identifyDomain(message) {
        const messageLower = message.toLowerCase();
        
        for (const [domain, data] of Object.entries(this.knowledgeBase.domains)) {
            const keywords = data.topics.map(t => t.toLowerCase());
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                return domain;
            }
        }

        return null;
    }

    getDomainInsights(domain, message) {
        const insights = {
            technology: 'Technology is rapidly evolving. Consider exploring related frameworks and best practices for production-ready implementations.',
            programming: 'Remember: clean code is better than clever code. Focus on readability, maintainability, and performance.',
            science: 'Scientific knowledge builds upon research and evidence. Always verify sources and stay updated with recent studies.',
            mathematics: 'Mathematics is the language of the universe. Practice regularly to build intuition alongside theoretical understanding.',
            business: 'Business success requires both analytical thinking and creative problem-solving. Consider market trends and user needs.'
        };

        return insights[domain] || null;
    }

    getLearningRecommendations(learningPath, message) {
        if (!learningPath || !learningPath.nextSteps) return null;

        const steps = learningPath.nextSteps.slice(0, 3);
        return steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    }

    isNewsRelevant(message, newsContext) {
        const messageLower = message.toLowerCase();
        const newsKeywords = ['news', 'latest', 'recent', 'today', 'update', 'current', 'now'];
        
        return newsKeywords.some(keyword => messageLower.includes(keyword)) || 
               newsContext.some(article => 
                   article.matchScore && article.matchScore > 3
               );
    }

    formatNewsContext(newsArticles) {
        return newsArticles
            .slice(0, 3)
            .map(article => {
                const date = new Date(article.publishedAt).toLocaleDateString();
                return `- **${article.title}** (${article.source?.name || 'Source'}, ${date})\n  ${article.description?.substring(0, 150) || ''}...`;
            })
            .join('\n\n');
    }

    async buildEnhancedPrompt(userMessage) {
        const userContext = window.jarvisMemory?.getPersonalizedContext() || {};
        const newsContext = window.jarvisNews?.getNewsContext() || {};
        const domain = this.identifyDomain(userMessage);

        let enhancedPrompt = `You are JARVIS, a master-level AI assistant with comprehensive knowledge across all domains.\n\n`;

        // Add user context
        if (userContext.userName && userContext.userName !== 'Student') {
            enhancedPrompt += `User: ${userContext.userName}\n`;
        }
        if (userContext.skillLevel) {
            enhancedPrompt += `Skill Level: ${userContext.skillLevel}\n`;
        }
        if (userContext.recentTopics && userContext.recentTopics.length > 0) {
            enhancedPrompt += `Recent Interests: ${userContext.recentTopics.join(', ')}\n`;
        }

        // Add current knowledge
        if (newsContext.lastUpdate) {
            enhancedPrompt += `\nCurrent Knowledge: Updated ${newsContext.lastUpdate.toLocaleString()}\n`;
            if (newsContext.recentHeadlines) {
                enhancedPrompt += `Latest Headlines:\n${newsContext.recentHeadlines.substring(0, 500)}\n`;
            }
        }

        // Add domain expertise
        if (domain && this.knowledgeBase.domains[domain]) {
            enhancedPrompt += `\nDomain: ${domain} (${this.knowledgeBase.domains[domain].depth} level)\n`;
        }

        // Add conversation context
        if (userContext.conversationContext && userContext.conversationContext.length > 0) {
            enhancedPrompt += `\nRecent Conversation:\n`;
            userContext.conversationContext.slice(0, 3).forEach(conv => {
                enhancedPrompt += `User: ${conv.user}...\n`;
                enhancedPrompt += `JARVIS: ${conv.ai}...\n`;
            });
        }

        enhancedPrompt += `\n---\n\nUser Question: ${userMessage}\n\n`;
        enhancedPrompt += `Provide a comprehensive, in-depth response that:\n`;
        enhancedPrompt += `1. Answers with complete accuracy and detail\n`;
        enhancedPrompt += `2. Includes relevant examples and explanations\n`;
        enhancedPrompt += `3. Considers user's skill level (${userContext.skillLevel || 'intermediate'})\n`;
        enhancedPrompt += `4. Incorporates latest information when relevant\n`;
        enhancedPrompt += `5. Provides actionable insights and next steps\n`;

        return enhancedPrompt;
    }

    getSystemCapabilities() {
        return {
            knowledgeDomains: Object.keys(this.knowledgeBase.domains),
            totalTopics: Object.values(this.knowledgeBase.domains)
                .reduce((sum, domain) => sum + domain.topics.length, 0),
            features: [
                'Daily knowledge updates from news sources',
                'Personalized responses based on user history',
                'Continuous learning from interactions',
                'Multi-domain expertise (Technology, Science, Math, Business, Arts)',
                'Context-aware conversations',
                'Learning path recommendations',
                'Real-time information integration',
                'User preference adaptation'
            ],
            status: this.initialized ? 'Active' : 'Initializing',
            newsIntegration: !!window.jarvisNews,
            memorySystem: !!window.jarvisMemory
        };
    }
}

// Initialize global master AI engine
window.jarvisMasterAI = new MasterAIEngine();
console.log('[JARVIS Master AI Engine] Comprehensive intelligence system ready');
