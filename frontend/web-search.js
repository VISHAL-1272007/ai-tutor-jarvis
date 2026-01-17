// ===== JARVIS WEB SEARCH SYSTEM =====
// Perplexity AI-style web search integration

class WebSearchSystem {
    constructor() {
        this.searchAPIs = {
            google: 'https://www.googleapis.com/customsearch/v1',
            bing: 'https://api.bing.microsoft.com/v7.0/search',
            duckduckgo: 'https://api.duckduckgo.com/',
            serpapi: 'https://serpapi.com/search'
        };
        this.cache = new Map();
        this.maxCacheSize = 100;
        this.searchHistory = [];
        this.initialized = false;
        this.init();
    }

    init() {
        // Silent initialization
        this.loadSearchHistory();
        this.initialized = true;
    }

    /**
     * Search using backend server (most reliable for current data)
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    async searchWithBackend(query) {
        try {
            const BACKEND_BASE_URL = getBackendURL || window.BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${BACKEND_BASE_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) throw new Error('Backend search failed');

            const data = await response.json();
            return {
                source: 'Backend Server',
                timestamp: new Date(),
                summary: data.summary || '',
                answer: data.answer || '',
                results: data.results || []
            };
        } catch (error) {
            throw error; // Re-throw to try other methods
        }
    }

    /**
     * Detect if query needs web search
     * @param {string} query - User query
     * @param {string} aiResponse - AI's initial response
     * @returns {boolean} - True if web search needed
     */
    needsWebSearch(query, aiResponse) {
        const uncertainPhrases = [
            "i don't know",
            "i'm not sure",
            "i don't have information",
            "i cannot",
            "i can't",
            "i'm unable",
            "no information",
            "not in my knowledge",
            "as of my last update"
        ];

        const responseLower = aiResponse.toLowerCase();
        
        // Check if AI is uncertain
        if (uncertainPhrases.some(phrase => responseLower.includes(phrase))) {
            return true;
        }

        // Check for real-time queries
        const realTimeKeywords = [
            'latest', 'current', 'today', 'now', 'recent', 
            'breaking', 'live', 'update', 'news', 'happening',
            'this week', 'this month', 'this year', '2026'
        ];

        const queryLower = query.toLowerCase();
        if (realTimeKeywords.some(keyword => queryLower.includes(keyword))) {
            return true;
        }

        // Check for specific searches
        const searchIndicators = [
            'search for', 'find', 'look up', 'google', 
            'browse', 'check', 'research', 'investigate'
        ];

        if (searchIndicators.some(indicator => queryLower.includes(indicator))) {
            return true;
        }

        return false;
    }

    /**
     * Perform web search using multiple sources
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    async performWebSearch(query) {
        // Check cache first
        const cacheKey = query.toLowerCase().trim();
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Try backend search first (most reliable)
            try {
                const backendResults = await this.searchWithBackend(query);
                if (backendResults && backendResults.results && backendResults.results.length > 0) {
                    this.cacheResult(cacheKey, backendResults);
                    return backendResults;
                }
            } catch (e) {
                // Backend failed, continue to other methods
            }

            // Try multiple search methods in parallel as fallback
            const results = await Promise.race([
                this.searchWithDuckDuckGo(query),
                this.searchWithNewsAPIs(query),
                this.searchWithWikipedia(query)
            ]);

            // Cache results
            this.cacheResults(cacheKey, results);
            
            // Save to history
            this.saveToHistory(query, results);

            return results;

        } catch (error) {
            // Silent fallback
            return this.getFallbackResults(query);
        }
    }

    /**
     * Search using DuckDuckGo Instant Answer API (Free, no key needed)
     */
    async searchWithDuckDuckGo(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;

            const response = await fetch(url);
            const data = await response.json();

            const results = {
                source: 'DuckDuckGo',
                timestamp: new Date(),
                summary: data.Abstract || data.Definition || '',
                answer: data.Answer || '',
                results: []
            };

            // Add related topics
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                results.results = data.RelatedTopics
                    .filter(topic => topic.Text && topic.FirstURL)
                    .slice(0, 5)
                    .map(topic => ({
                        title: topic.Text.split(' - ')[0],
                        snippet: topic.Text,
                        url: topic.FirstURL,
                        source: 'DuckDuckGo'
                    }));
            }

            // Add abstract source
            if (data.AbstractURL) {
                results.results.unshift({
                    title: data.Heading || query,
                    snippet: data.Abstract,
                    url: data.AbstractURL,
                    source: data.AbstractSource || 'Web'
                });
            }

            return results;

        } catch (error) {
            console.warn('[DuckDuckGo Search] Failed:', error);
            throw error;
        }
    }

    /**
     * Search using News APIs (already configured)
     */
    async searchWithNewsAPIs(query) {
        try {
            if (!window.jarvisNews) {
                throw new Error('News system not available');
            }

            const newsResults = window.jarvisNews.getRelevantNews(query, 8);
            
            if (newsResults.length === 0) {
                throw new Error('No news results found');
            }

            return {
                source: 'News APIs',
                timestamp: new Date(),
                summary: `Found ${newsResults.length} relevant news articles`,
                results: newsResults.map(article => ({
                    title: article.title,
                    snippet: article.description || article.title,
                    url: article.url,
                    source: article.source?.name || 'News',
                    publishedAt: article.publishedAt
                }))
            };

        } catch (error) {
            console.warn('[News APIs Search] Failed:', error);
            throw error;
        }
    }

    /**
     * Search Wikipedia for instant answers
     */
    async searchWithWikipedia(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*&srlimit=5`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.query || !data.query.search || data.query.search.length === 0) {
                throw new Error('No Wikipedia results');
            }

            const results = {
                source: 'Wikipedia',
                timestamp: new Date(),
                summary: `Found ${data.query.search.length} Wikipedia articles`,
                results: data.query.search.map(article => ({
                    title: article.title,
                    snippet: this.cleanWikiSnippet(article.snippet),
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))}`,
                    source: 'Wikipedia'
                }))
            };

            return results;

        } catch (error) {
            console.warn('[Wikipedia Search] Failed:', error);
            throw error;
        }
    }

    /**
     * Clean Wikipedia snippet HTML
     */
    cleanWikiSnippet(snippet) {
        return snippet
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
    }

    /**
     * Get fallback results when all searches fail
     */
    getFallbackResults(query) {
        return {
            source: 'Fallback',
            timestamp: new Date(),
            summary: 'Unable to fetch live results. Here are suggested search links:',
            results: [
                {
                    title: `Search Google for "${query}"`,
                    snippet: 'Click to search on Google',
                    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    source: 'Google'
                },
                {
                    title: `Search Wikipedia for "${query}"`,
                    snippet: 'Click to search on Wikipedia',
                    url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
                    source: 'Wikipedia'
                },
                {
                    title: `Search DuckDuckGo for "${query}"`,
                    snippet: 'Privacy-focused search engine',
                    url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                    source: 'DuckDuckGo'
                }
            ]
        };
    }

    /**
     * Cache search results
     */
    cacheResults(key, results) {
        if (this.cache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, results);
    }

    /**
     * Save search to history
     */
    saveToHistory(query, results) {
        this.searchHistory.unshift({
            query,
            timestamp: new Date(),
            resultCount: results.results?.length || 0,
            source: results.source
        });

        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }

        try {
            localStorage.setItem('jarvis_search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('[JARVIS Web Search] Failed to save history:', error);
        }
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('jarvis_search_history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('[JARVIS Web Search] Failed to load history:', error);
            this.searchHistory = [];
        }
    }

    /**
     * Format search results for display
     */
    formatSearchResults(searchData) {
        if (!searchData || !searchData.results || searchData.results.length === 0) {
            return null;
        }

        let html = '<div class="web-search-results">';
        
        // Header
        html += '<div class="search-header">';
        html += '<i class="fas fa-globe"></i>';
        html += '<span class="search-title">Web Search Results</span>';
        html += `<span class="search-source">${searchData.source}</span>`;
        html += '</div>';

        // Summary if available
        if (searchData.summary) {
            html += `<div class="search-summary">${searchData.summary}</div>`;
        }

        // Instant answer if available
        if (searchData.answer) {
            html += `<div class="search-answer">
                <i class="fas fa-lightbulb"></i>
                <strong>Quick Answer:</strong> ${searchData.answer}
            </div>`;
        }

        // Results
        html += '<div class="search-results-list">';
        
        searchData.results.forEach((result, index) => {
            const publishDate = result.publishedAt ? 
                new Date(result.publishedAt).toLocaleDateString() : '';
            
            html += `
                <div class="search-result-item" data-index="${index}">
                    <div class="result-header">
                        <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="result-title">
                            <i class="fas fa-link"></i>
                            ${result.title}
                        </a>
                        <span class="result-source">${result.source}</span>
                    </div>
                    <p class="result-snippet">${result.snippet}</p>
                    ${publishDate ? `<span class="result-date">${publishDate}</span>` : ''}
                    <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="result-url">
                        ${this.shortenURL(result.url)}
                    </a>
                </div>
            `;
        });

        html += '</div>'; // search-results-list
        
        // Footer
        const timestamp = new Date(searchData.timestamp).toLocaleString();
        html += `<div class="search-footer">
            <i class="fas fa-clock"></i>
            Searched at ${timestamp}
        </div>`;

        html += '</div>'; // web-search-results

        return html;
    }

    /**
     * Shorten URL for display
     */
    shortenURL(url) {
        try {
            const urlObj = new URL(url);
            let display = urlObj.hostname.replace('www.', '');
            if (urlObj.pathname !== '/') {
                display += urlObj.pathname.substring(0, 30);
                if (urlObj.pathname.length > 30) display += '...';
            }
            return display;
        } catch (error) {
            return url.substring(0, 50) + (url.length > 50 ? '...' : '');
        }
    }

    /**
     * Clear search cache
     */
    clearCache() {
        this.cache.clear();
        console.log('[JARVIS Web Search] Cache cleared');
    }

    /**
     * Get search statistics
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            historyCount: this.searchHistory.length,
            totalSearches: this.searchHistory.length,
            recentSearches: this.searchHistory.slice(0, 5)
        };
    }
}

// Initialize global web search system (silent)
window.jarvisWebSearch = new WebSearchSystem();
