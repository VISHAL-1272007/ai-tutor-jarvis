const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const DeepScraper = require('./scraper'); // Fixed: Added Scraper Import

class JARVISOmniscientFull {
  constructor(apiKeys) {
    if (!apiKeys.gemini) throw new Error('❌ GEMINI_API_KEY missing');

    this.apiKeys = apiKeys;
    this.scraper = new DeepScraper(); // Fixed: Initialized Scraper

    // ⭐ Engines
    this.gemini = new GoogleGenerativeAI(apiKeys.gemini);
    this.gemini2Pro = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' });
    this.gemini1Pro = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });

    if (apiKeys.claude) this.claude = new Anthropic({ apiKey: apiKeys.claude });
    
    console.log('✅ JARVIS Omniscient Full Power (with Deep Research) initialized!');
  }

  /**
   * ⭐ UPGRADED FEATURE: Real-time Web Intelligence with Deep Scraping
   */
  async realtimeIntelligence(query) {
    console.log('🔍 JARVIS: Gathering real-time intelligence...');

    const searches = [
      this.braveSearch(query),
      this.getGitHubTrending(),
      this.getStackOverflowResults(query),
    ];

    try {
      const [braveResults, github, stackoverflow] = await Promise.all(searches);
      
      // DEEP RESEARCH LOGIC: Links-kulla poyee padikuthu
      let deepKnowledge = "No deep research available.";
      if (braveResults.length > 0) {
        deepKnowledge = await this.scraper.getDeepInsight(braveResults);
      }

      return {
        webResults: braveResults,
        deepKnowledge: deepKnowledge, // Now contains full article text!
        github,
        stackoverflow,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Real-time intelligence error:', error.message);
      return {};
    }
  }

  /**
   * ⭐ UPGRADED FEATURE: Multi-AI Consensus with Research Data
   */
  async multiAIConsensus(question) {
    // 1. Research first
    const intel = await this.realtimeIntelligence(question);
    const context = `DEEP RESEARCH DATA:\n${intel.deepKnowledge}\n\n`;

    console.log('🌐 JARVIS: Analyzing consensus with deep research...');

    const queries = [
      this.queryGemini(question, context),
      this.queryGroq(question, context),
    ];

    const [gemini, groq] = await Promise.all(queries);
    return { bestAnswer: gemini, researchUsed: !!intel.deepKnowledge };
  }

  // ... (Keep other private methods like braveSearch, queryGemini as they were) ...
  
  async queryGemini(question, context) {
    try {
      const result = await this.gemini1Pro.generateContent(`${context}\n\nUser Question: ${question}`);
      return result.response.text();
    } catch (error) { return 'Gemini Error'; }
  }

  async braveSearch(query) {
    if (!this.apiKeys.brave) return [];
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: { q: query },
        headers: { 'X-Subscription-Token': this.apiKeys.brave },
      });
      return response.data.web?.results?.slice(0, 3) || [];
    } catch (e) { return []; }
  }
}

module.exports = JARVISOmniscientFull;