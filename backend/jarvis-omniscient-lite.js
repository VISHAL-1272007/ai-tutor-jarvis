const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class JARVISOmniscientLite {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('❌ GEMINI_API_KEY is required for JARVIS Omniscient Lite');
    }

    this.apiKey = apiKey;

    // Initialize Google Generative AI
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Use the most advanced model available
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    console.log('✅ JARVIS Omniscient Lite initialized with Google Generative AI!');
  }

  /**
   * Core AI reasoning with Google Gemini
   */
  async think(prompt, context = '') {
    try {
      const fullPrompt = context ?
        `${context}\n\nUser Query: ${prompt}\n\nProvide a comprehensive, helpful response:` :
        prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ JARVIS Lite Error:', error.message);
      return `I encountered an error: ${error.message}. Please try again.`;
    }
  }

  /**
   * Analyze and explain concepts
   */
  async explainConcept(concept, depth = 'intermediate') {
    const prompt = `Explain the concept of "${concept}" at a ${depth} level.
    Provide:
    1. A clear definition
    2. Key principles or components
    3. Real-world examples
    4. Common applications
    5. Related concepts

    Make it comprehensive but easy to understand.`;

    return await this.think(prompt);
  }

  /**
   * Solve problems step by step
   */
  async solveProblem(problem) {
    const prompt = `Solve this problem step by step:

Problem: ${problem}

Provide:
1. Understanding the problem
2. Step-by-step solution
3. Final answer
4. Alternative approaches if applicable

Show all work and reasoning clearly.`;

    return await this.think(prompt);
  }

  /**
   * Generate creative content
   */
  async generateContent(type, topic, requirements = '') {
    const prompt = `Generate ${type} about: ${topic}

Requirements: ${requirements || 'Make it engaging, informative, and well-structured.'}

Ensure the content is original, high-quality, and follows best practices for ${type}.`;

    return await this.think(prompt);
  }

  /**
   * Quick web search simulation (basic implementation)
   */
  async webSearch(query) {
    try {
      // Using a simple approach - in production you'd use actual search APIs
      const searchPrompt = `Based on your knowledge up to 2024, provide information about: "${query}"

Include:
- Key facts and information
- Recent developments (if applicable)
- Sources or references
- Related topics

Note: This is based on available knowledge and may not reflect real-time data.`;

      return await this.think(searchPrompt);
    } catch (error) {
      return `Search failed: ${error.message}`;
    }
  }

  /**
   * Code assistance
   */
  async codeHelp(language, task, code = '') {
    const prompt = `Help with ${language} programming:

Task: ${task}
${code ? `Existing code:\n${code}\n` : ''}

Provide:
1. Solution or improvement
2. Code explanation
3. Best practices
4. Potential issues to watch for`;

    return await this.think(prompt);
  }

  /**
   * Learning recommendations
   */
  async recommendLearning(topic, level = 'beginner') {
    const prompt = `Create a learning path for "${topic}" at ${level} level.

Include:
1. Prerequisites
2. Step-by-step learning plan
3. Recommended resources (books, courses, websites)
4. Practice projects
5. Time estimates
6. Milestones to track progress

Make it practical and achievable.`;

    return await this.think(prompt);
  }
}

module.exports = JARVISOmniscientLite;