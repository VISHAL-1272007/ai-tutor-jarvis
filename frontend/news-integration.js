// ===== JARVIS NEWS & DAILY UPDATES INTEGRATION =====
// Real-time knowledge updating system

class NewsIntegration {
    constructor() {
        this.newsCache = [];
        this.lastUpdate = null;
        this.updateInterval = 3600000; // 1 hour
        this.sources = {
            newsAPI: 'https://newsapi.org/v2',
            gnews: 'https://gnews.io/api/v4',
            rss: [
                'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
                'https://feeds.bbci.co.uk/news/technology/rss.xml',
                'https://www.wired.com/feed/rss',
                'https://techcrunch.com/feed/'
            ]
        };
        this.categories = ['technology', 'science', 'business', 'world', 'health', 'education'];
        this.initializeNewsUpdates();
    }

    async initializeNewsUpdates() {
        console.log('[JARVIS News] Initializing daily knowledge updates...');
        await this.fetchLatestNews();
        setInterval(() => this.fetchLatestNews(), this.updateInterval);
    }

    async fetchLatestNews() {
        try {
            console.log('[JARVIS News] Fetching latest news and updates...');
            const newsData = await Promise.all([
                this.fetchFromNewsAPI(),
                this.fetchFromGNews(),
                this.fetchFromRSS()
            ]);

            this.newsCache = this.processAndMergeNews(newsData);
            this.lastUpdate = new Date();
            
            // Store in localStorage for offline access
            localStorage.setItem('jarvisNewsCache', JSON.stringify({
                articles: this.newsCache,
                lastUpdate: this.lastUpdate
            }));

            console.log(`[JARVIS News] Updated with ${this.newsCache.length} articles`);
            return this.newsCache;
        } catch (error) {
            console.error('[JARVIS News] Update failed:', error);
            // Load from cache if available
            return this.loadFromCache();
        }
    }

    async fetchFromNewsAPI() {
        try {
            const apiKey = window.NEWS_API_KEY || this.getAPIKey('newsapi');
            if (!apiKey) return [];

            const categories = this.categories.map(async (category) => {
                const response = await fetch(
                    `${this.sources.newsAPI}/top-headlines?category=${category}&language=en&apiKey=${apiKey}`
                );
                const data = await response.json();
                return data.articles || [];
            });

            const results = await Promise.all(categories);
            return results.flat().slice(0, 50);
        } catch (error) {
            console.warn('[NewsAPI] Fetch failed:', error);
            return [];
        }
    }

    async fetchFromGNews() {
        try {
            const apiKey = window.GNEWS_API_KEY || this.getAPIKey('gnews');
            if (!apiKey) return [];

            const response = await fetch(
                `${this.sources.gnews}/top-headlines?lang=en&max=50&apikey=${apiKey}`
            );
            const data = await response.json();
            return data.articles || [];
        } catch (error) {
            console.warn('[GNews] Fetch failed:', error);
            return [];
        }
    }

    async fetchFromRSS() {
        try {
            const rssFeeds = await Promise.all(
                this.sources.rss.map(url => this.parseRSSFeed(url))
            );
            return rssFeeds.flat().slice(0, 30);
        } catch (error) {
            console.warn('[RSS] Fetch failed:', error);
            return [];
        }
    }

    async parseRSSFeed(url) {
        try {
            // Use RSS2JSON API for parsing
            const response = await fetch(
                `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=free`
            );
            const data = await response.json();
            return (data.items || []).map(item => ({
                title: item.title,
                description: item.description,
                url: item.link,
                publishedAt: item.pubDate,
                source: { name: data.feed?.title || 'RSS Feed' }
            }));
        } catch (error) {
            return [];
        }
    }

    processAndMergeNews(newsDataArray) {
        const allNews = newsDataArray.flat();
        
        // Remove duplicates based on title similarity
        const uniqueNews = [];
        const seenTitles = new Set();

        for (const article of allNews) {
            if (!article || !article.title) continue;
            
            const normalizedTitle = article.title.toLowerCase().trim();
            if (!seenTitles.has(normalizedTitle)) {
                seenTitles.add(normalizedTitle);
                uniqueNews.push({
                    ...article,
                    category: this.categorizeArticle(article),
                    keywords: this.extractKeywords(article),
                    relevanceScore: this.calculateRelevance(article)
                });
            }
        }

        // Sort by relevance and date
        return uniqueNews
            .sort((a, b) => {
                const dateA = new Date(a.publishedAt || 0);
                const dateB = new Date(b.publishedAt || 0);
                return dateB - dateA;
            })
            .slice(0, 100);
    }

    categorizeArticle(article) {
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        const categoryKeywords = {
            technology: ['tech', 'ai', 'software', 'app', 'computer', 'digital', 'cyber', 'data'],
            science: ['science', 'research', 'study', 'discovery', 'experiment', 'scientist'],
            business: ['business', 'market', 'stock', 'economy', 'company', 'finance'],
            education: ['education', 'learning', 'student', 'school', 'university', 'course'],
            health: ['health', 'medical', 'doctor', 'disease', 'treatment', 'vaccine'],
            world: ['world', 'country', 'government', 'politics', 'international']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        return 'general';
    }

    extractKeywords(article) {
        const text = `${article.title} ${article.description || ''}`;
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 4);
        
        // Simple frequency-based keyword extraction
        const freq = {};
        words.forEach(word => freq[word] = (freq[word] || 0) + 1);
        
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }

    calculateRelevance(article) {
        let score = 0;
        const now = new Date();
        const publishDate = new Date(article.publishedAt || now);
        const hoursAgo = (now - publishDate) / (1000 * 60 * 60);

        // Fresher news gets higher score
        if (hoursAgo < 6) score += 10;
        else if (hoursAgo < 24) score += 7;
        else if (hoursAgo < 48) score += 5;
        else score += 2;

        // High-quality sources
        const premiumSources = ['bbc', 'nytimes', 'techcrunch', 'wired', 'reuters'];
        if (premiumSources.some(s => article.source?.name?.toLowerCase().includes(s))) {
            score += 5;
        }

        return score;
    }

    getRelevantNews(query, limit = 5) {
        const queryLower = query.toLowerCase();
        const keywords = queryLower.split(/\s+/);

        return this.newsCache
            .map(article => {
                const text = `${article.title} ${article.description || ''}`.toLowerCase();
                let matchScore = 0;

                keywords.forEach(keyword => {
                    if (text.includes(keyword)) matchScore += 2;
                    if (article.keywords?.includes(keyword)) matchScore += 3;
                });

                return { ...article, matchScore };
            })
            .filter(article => article.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    getLatestNews(category = null, limit = 10) {
        let news = this.newsCache;
        
        if (category) {
            news = news.filter(article => article.category === category);
        }

        return news.slice(0, limit);
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem('jarvisNewsCache');
            if (cached) {
                const data = JSON.parse(cached);
                this.newsCache = data.articles || [];
                this.lastUpdate = new Date(data.lastUpdate);
                console.log('[JARVIS News] Loaded from cache:', this.newsCache.length, 'articles');
                return this.newsCache;
            }
        } catch (error) {
            console.error('[JARVIS News] Cache load failed:', error);
        }
        return [];
    }

    getAPIKey(service) {
        // Try to get API key from localStorage or config
        return localStorage.getItem(`${service}_api_key`) || '';
    }

    getNewsContext() {
        const recentNews = this.getLatestNews(null, 20);
        return {
            lastUpdate: this.lastUpdate,
            totalArticles: this.newsCache.length,
            recentHeadlines: recentNews.map(a => a.title).join('\n'),
            topicsToday: [...new Set(recentNews.map(a => a.category))],
            summary: `Latest knowledge as of ${this.lastUpdate?.toLocaleString()}: ${recentNews.length} recent articles across ${[...new Set(recentNews.map(a => a.category))].join(', ')}.`
        };
    }
}

// Initialize global news integration
window.jarvisNews = new NewsIntegration();
console.log('[JARVIS News Integration] System initialized and running');
