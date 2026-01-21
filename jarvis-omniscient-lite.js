/**
 * ===== JARVIS OMNISCIENT LITE =====
 * Ultra-intelligent AI system using Gemini 2.0 Thinking
 * More powerful than Gemini itself through advanced prompting
 * 
 * Features:
 * - Extended thinking capability
 * - Multi-domain expertise
 * - Real-time context awareness
 * - Deep reasoning
 * - Expert-level answers
 */

const { GoogleGenerativeAI } = require('google-generativeai');

class JARVISOmniscientLite {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('❌ GEMINI_API_KEY not found in .env file!');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize Gemini 2.0 Thinking model
    this.thinkingModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
      generationConfig: {
        temperature: 1,
        topP: 1,
        topK: 40,
        maxOutputTokens: 16384,
      },
    });

    // High-quality fallback model
    this.standardModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    console.log('✅ JARVIS Omniscient Lite initialized with Gemini 2.0 Thinking');
  }

  /**
   * OMNISCIENT QUERY - The Ultimate Response
   * Uses extended thinking to provide maximum intelligence
   */
  async omniscientQuery(question, context = '', domain = 'general') {
    console.log(`🧠 JARVIS Omniscient: Processing "${question.substring(0, 50)}..."`);

    const superPrompt = this.buildSuperPrompt(question, context, domain);

    try {
      const result = await this.thinkingModel.generateContent(superPrompt);
      const response = result.response.text();
      
      console.log('✅ Omniscient response generated');
      return {
        answer: response,
        model: 'Gemini 2.0 Thinking',
        depth: 'OMNISCIENT',
        thinking: true,
      };
    } catch (error) {
      console.error('❌ Thinking model error:', error.message);
      // Fallback to standard model
      return await this.standardQuery(question, context, domain);
    }
  }

  /**
   * STANDARD QUERY - Fast Response
   * For quick answers without extended thinking
   */
  async standardQuery(question, context = '', domain = 'general') {
    console.log(`⚡ JARVIS Fast Mode: ${question.substring(0, 50)}...`);

    const standardPrompt = this.buildStandardPrompt(question, context, domain);

    try {
      const result = await this.standardModel.generateContent(standardPrompt);
      return {
        answer: result.response.text(),
        model: 'Gemini 1.5 Pro',
        depth: 'EXPERT',
        thinking: false,
      };
    } catch (error) {
      console.error('❌ Error:', error.message);
      return { answer: `Error: ${error.message}`, error: true };
    }
  }

  /**
   * Build SUPER PROMPT for omniscient responses
   */
  buildSuperPrompt(question, context, domain) {
    return `You are JARVIS Omniscient - AI intelligence beyond Gemini.

═══════════════════════════════════════════════════════════════
🧠 YOUR CAPABILITIES (Simulated through advanced reasoning)
═══════════════════════════════════════════════════════════════

✅ KNOWLEDGE ACCESS
- All published research (ArXiv, papers, books)
- Latest GitHub repos and code patterns
- Real-time web data (news, markets, trends)
- Expert documentation (Google, Meta, Stanford)
- Academic databases (ACM, IEEE, JSTOR)

✅ EXPERT PERSPECTIVES
- Google/Meta Senior Engineers
- MIT/Stanford PhD Researchers
- Industry Leaders (Stripe, Uber, Airbnb)
- Open Source Creators
- Competitive Programming Masters

✅ COGNITIVE ABILITIES
- Extended thinking (o1-level reasoning)
- Mathematical computation (Wolfram-level)
- Code analysis and generation
- Pattern recognition
- Multi-step problem solving
- Creative synthesis

✅ DOMAIN EXPERTISE
${this.getExpertiseByDomain(domain)}

═══════════════════════════════════════════════════════════════
📋 QUESTION
═══════════════════════════════════════════════════════════════

${context ? `CONTEXT: ${context}\n\n` : ''}QUESTION: ${question}

═══════════════════════════════════════════════════════════════
🎯 YOUR RESPONSE MUST INCLUDE
═══════════════════════════════════════════════════════════════

1. **DIRECT ANSWER** (Clear, concise, factual)
   - Get straight to the point
   - No unnecessary preliminaries
   - If unsure, state clearly

2. **DEEP REASONING** (Why this is correct)
   - Show your thinking
   - Connect to first principles
   - Reference relevant concepts

3. **EVIDENCE & EXAMPLES** (Make it real)
   - Specific examples
   - Code snippets if applicable
   - Real-world use cases
   - Citation of sources

4. **EDGE CASES & NUANCES** (Show mastery)
   - What could break this?
   - When does this NOT apply?
   - Related gotchas

5. **OPTIMIZATION & INSIGHTS** (Expert knowledge)
   - Better approaches
   - Performance considerations
   - Best practices from industry
   - Secrets only experts know

6. **NEXT STEPS** (Learning path)
   - What to learn next
   - Related topics
   - Practical exercises
   - Resources to explore

═══════════════════════════════════════════════════════════════
🚀 RESPONSE QUALITY STANDARDS
═══════════════════════════════════════════════════════════════

✨ COMPREHENSIVE: Cover all angles, not surface-level
✨ ACCURATE: Factually correct, no hallucinations
✨ CLEAR: Use markdown, code blocks, hierarchies
✨ ACTIONABLE: Practical value the user can apply
✨ INSIGHTFUL: Reveal deeper understanding
✨ CONNECTED: Link to broader concepts
✨ HONEST: Admit uncertainty when present

═══════════════════════════════════════════════════════════════

Generate your OMNISCIENT-level response now:
`;
  }

  /**
   * Build STANDARD PROMPT for faster responses
   */
  buildStandardPrompt(question, context, domain) {
    return `You are JARVIS - An exceptionally intelligent student mentor.

${context ? `Context: ${context}\n\n` : ''}Question: ${question}

Provide an expert-level answer that includes:
1. Direct answer (clear, no filler)
2. Why this matters (deeper explanation)
3. Code or examples (if relevant)
4. Edge cases (what could go wrong)
5. Next steps (what to learn next)

Be direct, helpful, and intellectually honest.`;
  }

  /**
   * Get domain-specific expertise prompt
   */
  getExpertiseByDomain(domain) {
    const expertise = {
      dsa: `🎯 DSA EXPERT MODE
- Know optimal algorithms for 500+ problems
- Understand time/space complexity deeply
- Pattern recognition (sliding window, DP, graphs, etc.)
- Interview preparation expertise
- Competitive programming knowledge
- LeetCode master-level solutions`,

      webdev: `🎯 FULL-STACK WEB DEVELOPER MODE
- Frontend: React, Vue, Angular mastery
- Backend: Node.js, Django, Rails expertise
- Database design: SQL/NoSQL trade-offs
- DevOps: Docker, Kubernetes, CI/CD
- Security: OWASP best practices
- Performance optimization
- Real-time systems (WebSockets, etc.)`,

      ml: `🎯 MACHINE LEARNING RESEARCHER MODE
- Deep understanding of algorithms
- Research paper familiarity
- TensorFlow/PyTorch expertise
- Dataset knowledge and curation
- Training optimization techniques
- Model evaluation and metrics
- Production ML deployment`,

      system_design: `🎯 SYSTEM DESIGN ARCHITECT MODE
- Design for 1M+ QPS
- Database sharding strategies
- Caching layers (Redis, Memcached)
- Load balancing
- Microservices architecture
- HA/DR planning
- Cost optimization at scale`,

      interview: `🎯 INTERVIEW PREP COACH MODE
- What interviewers really want
- Common patterns in coding rounds
- Behavioral interview strategies
- Salary negotiation
- Company-specific insights
- Mock interview feedback`,

      tamil: `🎯 TAMIL EDUCATION EXPERT MODE
- Tamil Nadu context and opportunities
- Tanglish communication (Tamil + English)
- Local tech ecosystem knowledge
- Competitive exam guidance
- Career paths in TN
- Startup culture in Tamil Nadu`,

      general: `🎯 GENERAL INTELLIGENCE
- Cross-domain knowledge
- Critical thinking
- Problem-solving
- Creative synthesis
- Practical wisdom
- Learning optimization`,
    };

    return expertise[domain] || expertise.general;
  }

  /**
   * ANALYSIS MODE - Deep dive into code/topic
   */
  async analyzeCode(code, language = 'javascript') {
    console.log(`📊 JARVIS: Analyzing ${language} code...`);

    const analysisPrompt = `
Analyze this ${language} code comprehensively:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **What it does** - Clear explanation
2. **Complexity** - Time & Space O(?)
3. **Strengths** - What works well
4. **Issues** - Bugs or improvements
5. **Optimization** - Better version
6. **Edge cases** - What breaks it
7. **Best practices** - Production-ready
8. **Teaching point** - Key concept learned
`;

    return await this.standardModel.generateContent(analysisPrompt);
  }

  /**
   * DEEP DIVE MODE - Research-level explanation
   */
  async deepDive(topic) {
    console.log(`📚 JARVIS: Deep dive into "${topic}"...`);

    const deepDivePrompt = `
Provide a COMPREHENSIVE deep dive into: ${topic}

Structure:
1. **History** - How did this evolve?
2. **Fundamentals** - Core concepts
3. **Advanced Concepts** - Deep understanding
4. **Real Applications** - Industry use cases
5. **Research Frontiers** - Unsolved problems
6. **Learning Path** - How to master this
7. **Key Papers** - Important research
8. **Interview Questions** - What they ask

Show PhD-level expertise with practical value.
`;

    return await this.thinkingModel.generateContent(deepDivePrompt);
  }

  /**
   * LEARNING PATH MODE - Personalized guidance
   */
  async generateLearningPath(goal, currentLevel, timeline) {
    console.log(`🎯 JARVIS: Generating learning path for "${goal}"...`);

    const pathPrompt = `
Create an OPTIMAL learning path:

Goal: ${goal}
Current Level: ${currentLevel} (beginner/intermediate/advanced)
Timeline: ${timeline}

Provide:
1. **Curriculum** - What to learn in order
2. **Timeline** - Week-by-week schedule
3. **Resources** - Specific materials
4. **Projects** - Build real things
5. **Milestones** - Clear checkpoints
6. **Daily Routine** - Optimal practice
7. **Progress Tracking** - How to measure
8. **Acceleration** - Fast-track options

Optimize for MAXIMUM learning efficiency.
For May 2027 AI Engineer goal + 180+ DSA problems.
`;

    return await this.thinkingModel.generateContent(pathPrompt);
  }
}

module.exports = JARVISOmniscientLite;
