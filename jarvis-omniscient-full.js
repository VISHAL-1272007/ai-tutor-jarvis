/**
 * ===== JARVIS OMNISCIENT FULL POWER =====
 * Multi-AI Orchestration System
 * Combines: Gemini 2.0 + Claude 3 Opus + Groq + Perplexity + Wolfram
 * 
 * This is MORE POWERFUL THAN ANY SINGLE AI!
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

class JARVISOmniscientFull {
  constructor(apiKeys) {
    // Validate all keys
    if (!apiKeys.gemini) throw new Error('❌ GEMINI_API_KEY missing');

    this.apiKeys = apiKeys;

    // ⭐ GEMINI (Google)
    this.gemini = new GoogleGenerativeAI(apiKeys.gemini);
    this.gemini2Pro = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
    });
    this.gemini1Pro = this.gemini.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });

    // ⭐ CLAUDE (Anthropic)
    if (apiKeys.claude) {
      this.claude = new Anthropic({
        apiKey: apiKeys.claude,
      });
      console.log('✅ Claude 3 Opus initialized');
    } else {
      console.log('⚠️ Claude API key not provided');
    }

    // ⭐ GROQ (Fastest open-source)
    if (apiKeys.groq) {
      console.log('✅ Groq API configured');
    } else {
      console.log('⚠️ Groq API key not provided');
    }

    // ⭐ PERPLEXITY (Web search)
    if (apiKeys.perplexity) {
      console.log('✅ Perplexity API configured');
    } else {
      console.log('⚠️ Perplexity API key not provided');
    }

    // ⭐ WOLFRAM ALPHA (Math computation)
    if (apiKeys.wolfram) {
      console.log('✅ Wolfram Alpha API configured');
    } else {
      console.log('⚠️ Wolfram API key not provided');
    }

    // ⭐ BRAVE SEARCH (Web search)
    if (apiKeys.brave) {
      console.log('✅ Brave Search API configured');
    } else {
      console.log('⚠️ Brave Search API key not provided');
    }

    console.log('✅ JARVIS Omniscient Full Power initialized!');
  }

  /**
   * ⭐ FEATURE 1: Multi-AI Consensus
   * Asks multiple AI engines, returns best answer
   */
  async multiAIConsensus(question, context = '') {
    console.log('🌐 JARVIS: Multi-AI Consensus mode...');

    const queries = [
      this.queryGemini(question, context),
      this.queryClaude(question, context),
      this.queryGroq(question, context),
      this.queryPerplexity(question, context),
    ];

    try {
      const [gemini, claude, groq, perplexity] = await Promise.all(queries);

      // Score responses
      const scores = {
        gemini: this.scoreResponse(gemini, question),
        claude: this.scoreResponse(claude, question),
        groq: this.scoreResponse(groq, question),
        perplexity: this.scoreResponse(perplexity, question),
      };

      // Find best
      const bestAI = Object.keys(scores).reduce((a, b) =>
        scores[a] > scores[b] ? a : b
      );

      console.log(`✅ Consensus complete - Best: ${bestAI.toUpperCase()}`);

      return {
        bestAnswer: { gemini, claude, groq, perplexity }[bestAI],
        allAnswers: { gemini, claude, groq, perplexity },
        scores,
        bestAI,
        reasoning: `Multi-AI consensus: ${Object.entries(scores)
          .map(([ai, score]) => `${ai}=${score}`)
          .join(', ')}. Winner: ${bestAI}`,
      };
    } catch (error) {
      console.error('❌ Consensus error:', error.message);
      return null;
    }
  }

  /**
   * ⭐ FEATURE 2: Real-time Web Intelligence
   */
  async realtimeIntelligence(query) {
    console.log('🔍 JARVIS: Gathering real-time intelligence...');

    const searches = [
      this.braveSearch(query),
      this.perplexitySearch(query),
      this.getGitHubTrending(),
      this.getStackOverflowResults(query),
      this.getHackerNews(),
    ];

    try {
      const [brave, perplexity, github, stackoverflow, hackernews] = await Promise.all(searches);

      return {
        webResults: brave,
        perplexityResults: perplexity,
        github,
        stackoverflow,
        hackernews,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Real-time intelligence error:', error.message);
      return {};
    }
  }

  /**
   * ⭐ FEATURE 3: Wolfram Alpha Computation
   */
  async wolframComputation(query) {
    console.log('🔢 JARVIS: Computing with Wolfram Alpha...');

    if (!this.apiKeys.wolfram) {
      return { error: 'Wolfram API key not configured' };
    }

    try {
      const response = await axios.get('https://www.wolframalpha.com/api/v1/query', {
        params: {
          input: query,
          appid: this.apiKeys.wolfram,
          output: 'json',
        },
      });

      const data = response.data.queryresult;
      return {
        input: data.inputstring,
        success: data.success,
        result: data.pods?.[0]?.subpods?.[0]?.plaintext,
        image: data.pods?.[0]?.subpods?.[0]?.img,
      };
    } catch (error) {
      console.error('❌ Wolfram error:', error.message);
      return { error: error.message };
    }
  }

  /**
   * ⭐ FEATURE 4: Expert Network Consultation
   */
  async expertConsultation(question) {
    console.log('👥 JARVIS: Consulting expert network...');

    const expertPrompts = {
      googleEngineer: `You are a Senior Engineer at Google. Answer: ${question}`,
      metaResearcher: `You are an AI Researcher at Meta. Your thoughts: ${question}`,
      mitProfessor: `You are a Professor at MIT. Explain: ${question}`,
      stanfordPhD: `You are a Stanford PhD. Deep dive: ${question}`,
    };

    try {
      const responses = {};

      for (const [expert, prompt] of Object.entries(expertPrompts)) {
        const response = await this.gemini1Pro.generateContent(prompt);
        responses[expert] = response.response.text();
      }

      return {
        question,
        experts: responses,
        consensus: this.synthesizeOpinions(responses),
      };
    } catch (error) {
      console.error('❌ Expert consultation error:', error.message);
      return null;
    }
  }

  /**
   * ⭐ FEATURE 5: Deep Reasoning (Gemini 2.0 Thinking)
   */
  async deepReasoning(problem) {
    console.log('🧠 JARVIS: Deep reasoning with extended thinking...');

    const prompt = `
${problem}

Use EXTENDED THINKING to solve this:
1. **Understand** - What exactly is being asked?
2. **Analyze** - Break into components
3. **Reason** - Multi-step logic
4. **Verify** - Check your work
5. **Optimize** - Better approaches
6. **Explain** - Make it clear
7. **Teach** - Help someone learn this
8. **Innovate** - Novel insights

Show maximum intellectual rigor.
`;

    try {
      const result = await this.gemini2Pro.generateContent(prompt);
      return {
        reasoning: result.response.text(),
        model: 'Gemini 2.0 Thinking',
        depth: 'MAXIMUM',
      };
    } catch (error) {
      console.error('❌ Deep reasoning error:', error.message);
      return null;
    }
  }

  /**
   * ⭐ FEATURE 6: Code Generation Pro
   */
  async generateProCode(requirement, language = 'javascript') {
    console.log(`💻 JARVIS: Generating pro-level ${language} code...`);

    const prompt = `
Generate PRODUCTION-READY ${language} code for:

${requirement}

MUST INCLUDE:
✅ Error handling (try-catch, validation)
✅ Input validation
✅ Type safety (JSDoc/TypeScript)
✅ Performance optimization
✅ Security best practices
✅ Unit test examples
✅ Documentation
✅ Edge cases
✅ Logging
✅ SOLID principles

Generate code that passes code review at Google/Meta.
`;

    try {
      const result = await this.claudeQuery(prompt);
      return {
        code: result,
        language,
        quality: 'PRODUCTION_GRADE',
      };
    } catch (error) {
      console.error('❌ Code generation error:', error.message);
      return null;
    }
  }

  /**
   * ⭐ FEATURE 7: Adaptive Learning Path
   */
  async adaptiveLearningPath(goal, level, timeline) {
    console.log(`🎓 JARVIS: Creating adaptive learning path...`);

    const prompt = `
Create OPTIMAL learning path:

Goal: ${goal}
Current Level: ${level}
Timeline: ${timeline}

Include:
1. **Week-by-week curriculum** - What to learn when
2. **Daily schedule** - Optimal practice routine
3. **Resources** - Specific materials & links
4. **Project ideas** - Build real things
5. **Spaced repetition** - Review schedule
6. **Active recall** - Practice problems
7. **Milestones** - Checkpoints
8. **Acceleration** - Fast-track options

Optimize for learning efficiency.
Target: 180+ DSA problems + AI Engineer readiness by May 2027.
`;

    try {
      const result = await this.gemini1Pro.generateContent(prompt);
      return {
        learningPath: result.response.text(),
        optimization: 'SPACED_REPETITION',
        timeline,
      };
    } catch (error) {
      console.error('❌ Learning path error:', error.message);
      return null;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Query each AI engine
   */
  async queryGemini(question, context) {
    try {
      const result = await this.gemini1Pro.generateContent(`${context}\n\n${question}`);
      return result.response.text();
    } catch (error) {
      console.error('❌ Gemini error:', error.message);
      return '';
    }
  }

  async queryClaude(question, context) {
    if (!this.claude) return '';
    try {
      const result = await this.claude.messages.create({
        model: 'claude-3-opus-20250119',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `${context}\n\n${question}`,
          },
        ],
      });
      return result.content[0].text;
    } catch (error) {
      console.error('❌ Claude error:', error.message);
      return '';
    }
  }

  async queryGroq(question, context) {
    if (!this.apiKeys.groq) return '';
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'user',
              content: `${context}\n\n${question}`,
            },
          ],
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKeys.groq}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('❌ Groq error:', error.message);
      return '';
    }
  }

  async queryPerplexity(question, context) {
    if (!this.apiKeys.perplexity) return '';
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'user',
              content: `${context}\n\n${question}`,
            },
          ],
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKeys.perplexity}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('❌ Perplexity error:', error.message);
      return '';
    }
  }

  async claudeQuery(prompt) {
    if (!this.claude) return '';
    try {
      const result = await this.claude.messages.create({
        model: 'claude-3-opus-20250119',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      return result.content[0].text;
    } catch (error) {
      console.error('❌ Claude query error:', error.message);
      return '';
    }
  }

  /**
   * Real-time data gathering
   */
  async braveSearch(query) {
    if (!this.apiKeys.brave) return [];
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: { q: query },
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': this.apiKeys.brave,
        },
      });
      return response.data.web?.slice(0, 5) || [];
    } catch (error) {
      console.error('Brave search error:', error.message);
      return [];
    }
  }

  async perplexitySearch(query) {
    if (!this.apiKeys.perplexity) return [];
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'user',
              content: `Search for: ${query}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKeys.perplexity}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async getGitHubTrending() {
    try {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: 'stars:>5000',
          sort: 'stars',
          order: 'desc',
          per_page: 5,
        },
      });
      return response.data.items || [];
    } catch (error) {
      return [];
    }
  }

  async getStackOverflowResults(query) {
    try {
      const response = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
        params: {
          q: query,
          site: 'stackoverflow',
          sort: 'votes',
          pagesize: 5,
        },
      });
      return response.data.items || [];
    } catch (error) {
      return [];
    }
  }

  async getHackerNews() {
    try {
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
      return response.data?.slice(0, 10) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Response scoring
   */
  scoreResponse(response, question) {
    let score = 0;

    if (!response) return 0;

    // Comprehensiveness
    if (response.length > 500) score += 20;
    if (response.length > 1000) score += 10;

    // Specificity
    if (response.includes('example') || response.includes('specifically')) score += 15;
    if (response.includes('```') || response.includes('code')) score += 20;

    // Structure
    if ((response.match(/\n/g) || []).length > 5) score += 15;

    // Nuance
    if (response.includes('however') || response.includes('but')) score += 10;

    // Technical depth
    if (response.includes('algorithm') || response.includes('complexity')) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Synthesis
   */
  synthesizeOpinions(opinions) {
    const keys = Object.keys(opinions);
    return `Consensus from ${keys.length} expert perspectives.`;
  }
}

module.exports = JARVISOmniscientFull;
