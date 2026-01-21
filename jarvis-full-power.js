/**
 * ===== JARVIS FULL POWER =====
 * Multi-AI Orchestration using ALL available APIs
 * More powerful than any single AI model
 * 
 * Uses:
 * - Gemini 2.0 Thinking
 * - Groq (Fastest inference)
 * - OpenRouter (100+ models)
 * - HuggingFace
 * - Jina AI Search
 * - Deepgram (Voice)
 * - ElevenLabs (Audio)
 * - Stability AI (Images)
 */

const { GoogleGenerativeAI } = require('google-generativeai');
const axios = require('axios');
const WolframAlphaIntegration = require('./backend/wolfram-alpha-integration');

class JARVISFullPower {
  constructor(apiKeys) {
    this.apiKeys = apiKeys;

    // ⭐ Gemini
    this.gemini = new GoogleGenerativeAI(apiKeys.gemini);
    this.geminiThinking = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
      generationConfig: {
        temperature: 1,
        topP: 1,
        maxOutputTokens: 16384,
      },
    });

    // ⭐ OpenRouter (Claude + other models)
    this.openRouter = apiKeys.openrouter;

    // ⭐ Groq
    this.groq = apiKeys.groq;

    // ⭐ HuggingFace
    this.huggingface = apiKeys.huggingface;

    // ⭐ Jina AI
    this.jina = apiKeys.jina;

    // ⭐ WolframAlpha (Math, Physics, Chemistry, Data Analysis)
    this.wolfram = new WolframAlphaIntegration(
      apiKeys.wolframAppId, 
      apiKeys.wolframAppIdSecondary,
      apiKeys.wolframAppIdTertiary,
      apiKeys.wolframAppIdQuaternary
    );

    console.log('✅ JARVIS Full Power initialized with ALL AI models + WolframAlpha x4 (8,000 queries/month)!');
  }

  /**
   * MULTI-AI CONSENSUS - Best answer from 4 models
   */
  async multiAIConsensus(question, context = '') {
    console.log('🌐 JARVIS Full Power: Multi-AI Consensus Mode...');

    const queries = [
      this.queryGemini(question, context),
      this.queryGroq(question, context),
      this.queryOpenRouter(question, context, 'claude'),
      this.queryHuggingFace(question, context),
    ];

    try {
      const [geminiRes, groqRes, openrouterRes, hfRes] = await Promise.allSettled(queries);

      const responses = {
        gemini: geminiRes.status === 'fulfilled' ? geminiRes.value : 'Error',
        groq: groqRes.status === 'fulfilled' ? groqRes.value : 'Error',
        openrouter: openrouterRes.status === 'fulfilled' ? openrouterRes.value : 'Error',
        huggingface: hfRes.status === 'fulfilled' ? hfRes.value : 'Error',
      };

      // Score and pick best
      const scores = this.scoreResponses(responses, question);
      const bestAI = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

      return {
        bestAnswer: responses[bestAI],
        allResponses: responses,
        scores,
        bestAI,
        reasoning: `Consensus from 4 advanced AI models. ${bestAI.toUpperCase()} was most accurate.`,
      };
    } catch (error) {
      console.error('❌ Consensus error:', error.message);
      return null;
    }
  }

  /**
   * GROQ - Fastest AI inference
   */
  async queryGroq(question, context) {
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'mixtral-8x7b-32768',
        messages: [{
          role: 'user',
          content: `${context}\n\n${question}`,
        }],
        max_tokens: 2000,
        temperature: 0.7,
      }, {
        headers: { 'Authorization': `Bearer ${this.groq}` },
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq error:', error.message);
      return 'Unable to query Groq';
    }
  }

  /**
   * OPENROUTER - 100+ models (Claude, Mistral, Llama, etc.)
   */
  async queryOpenRouter(question, context, modelType = 'claude') {
    try {
      const models = {
        claude: 'anthropic/claude-3-opus',
        mistral: 'mistralai/mistral-large',
        llama: 'meta-llama/llama-2-70b-chat',
        solar: 'upstage/solar-10.7b-instruct',
      };

      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: models[modelType] || models.claude,
        messages: [{
          role: 'user',
          content: `${context}\n\n${question}`,
        }],
        max_tokens: 2000,
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouter}`,
          'HTTP-Referer': 'https://ai-tutor-jarvis.onrender.com',
          'X-Title': 'JARVIS Full Power',
        },
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter error:', error.message);
      return 'Unable to query OpenRouter';
    }
  }

  /**
   * GEMINI 2.0 - Extended thinking
   */
  async queryGemini(question, context) {
    try {
      const result = await this.geminiThinking.generateContent(
        `${context}\n\n${question}`
      );
      return result.response.text();
    } catch (error) {
      console.error('Gemini error:', error.message);
      return 'Unable to query Gemini';
    }
  }

  /**
   * HUGGINGFACE - 100k+ models
   */
  async queryHuggingFace(question, context) {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf',
        {
          inputs: `${context}\n\n${question}`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
          },
        },
        {
          headers: { Authorization: `Bearer ${this.huggingface}` },
        }
      );

      return response.data[0]?.generated_text || 'No response';
    } catch (error) {
      console.error('HuggingFace error:', error.message);
      return 'Unable to query HuggingFace';
    }
  }

  /**
   * REAL-TIME WEB SEARCH with Jina AI
   */
  async realtimeSearch(query) {
    console.log(`🔍 JARVIS: Real-time search for "${query}"...`);

    try {
      const response = await axios.get('https://api.jina.ai/search', {
        params: { q: query },
        headers: { 'Authorization': `Bearer ${this.jina}` },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }

  /**
   * IMAGE GENERATION - Stability AI
   */
  async generateImage(prompt, apiKey) {
    console.log(`🎨 JARVIS: Generating image for "${prompt}"...`);

    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        { text_prompts: [{ text: prompt }] },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Image generation error:', error.message);
      return null;
    }
  }

  /**
   * AUDIO GENERATION - ElevenLabs
   */
  async generateAudio(text, apiKey) {
    console.log('🔊 JARVIS: Generating audio...');

    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
        { text, voice_settings: { stability: 0.5, similarity_boost: 0.75 } },
        {
          headers: { 'xi-api-key': apiKey },
          responseType: 'arraybuffer',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Audio generation error:', error.message);
      return null;
    }
  }

  /**
   * SPEECH-TO-TEXT - Deepgram
   */
  async transcribeAudio(audioUrl, apiKey) {
    console.log('🎤 JARVIS: Transcribing audio...');

    try {
      const response = await axios.post(
        'https://api.deepgram.com/v1/listen',
        { url: audioUrl },
        {
          headers: { Authorization: `Token ${apiKey}` },
          params: { model: 'nova-2', language: 'en' },
        }
      );

      return response.data.results.channels[0].alternatives[0].transcript;
    } catch (error) {
      console.error('Transcription error:', error.message);
      return null;
    }
  }

  /**
   * SCORE RESPONSES - Quality ranking
   */
  scoreResponses(responses, question) {
    const scores = {};

    for (const [ai, response] of Object.entries(responses)) {
      let score = 0;

      // Length
      if (response.length > 500) score += 20;

      // Quality signals
      if (response.includes('however') || response.includes('but')) score += 15;
      if (response.includes('code') || response.includes('```')) score += 20;
      if (response.includes('research') || response.includes('study')) score += 10;

      // Relevance
      const questionWords = question.toLowerCase().split(' ');
      const responseWords = response.toLowerCase().split(' ');
      const overlap = questionWords.filter(w => responseWords.includes(w)).length;
      score += overlap * 2;

      scores[ai] = score;
    }

    return scores;
  }

  /**
   * ====== WOLFRAM ALPHA INTEGRATION ======
   * For math, physics, chemistry, and data analysis
   */

  // Direct WolframAlpha query
  async queryWolfram(question) {
    try {
      console.log(`[JARVIS] WolframAlpha Query: ${question}`);
      const result = await this.wolfram.intelligentQuery(question);
      return result;
    } catch (error) {
      console.error('[JARVIS] WolframAlpha Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Solve math problems with step-by-step
  async solveMath(problem) {
    try {
      console.log(`[JARVIS] Math Problem: ${problem}`);
      
      // Get WolframAlpha solution
      const wolframResult = await this.wolfram.solveMathProblem(problem);
      
      // Also get AI explanation
      const aiExplanation = await this.queryGemini(
        `Explain this math problem clearly: ${problem}`,
        'Be concise and educational'
      );

      return {
        problem: problem,
        wolfram: wolframResult,
        explanation: aiExplanation,
        source: 'JARVIS Math Solver'
      };
    } catch (error) {
      console.error('[JARVIS] Math Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Solve physics problems
  async solvePhysics(problem) {
    try {
      console.log(`[JARVIS] Physics Problem: ${problem}`);
      
      const wolframResult = await this.wolfram.solvePhysicsProblem(problem);
      const aiExplanation = await this.queryGemini(
        `Explain this physics problem: ${problem}`,
        'Include formulas and physical intuition'
      );

      return {
        problem: problem,
        wolfram: wolframResult,
        explanation: aiExplanation,
        source: 'JARVIS Physics Solver'
      };
    } catch (error) {
      console.error('[JARVIS] Physics Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Solve chemistry problems
  async solveChemistry(problem) {
    try {
      console.log(`[JARVIS] Chemistry Problem: ${problem}`);
      
      const wolframResult = await this.wolfram.solveChemistryProblem(problem);
      const aiExplanation = await this.queryGemini(
        `Explain this chemistry problem: ${problem}`,
        'Include molecular structure and reactions'
      );

      return {
        problem: problem,
        wolfram: wolframResult,
        explanation: aiExplanation,
        source: 'JARVIS Chemistry Solver'
      };
    } catch (error) {
      console.error('[JARVIS] Chemistry Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Data analysis with WolframAlpha
  async analyzeData(query) {
    try {
      console.log(`[JARVIS] Data Analysis: ${query}`);
      return await this.wolfram.analyzeData(query);
    } catch (error) {
      console.error('[JARVIS] Data Analysis Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Conversion queries
  async convert(from, to) {
    try {
      console.log(`[JARVIS] Convert: ${from} to ${to}`);
      return await this.wolfram.convert(from, to);
    } catch (error) {
      console.error('[JARVIS] Conversion Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Factual queries
  async queryFact(question) {
    try {
      console.log(`[JARVIS] Fact Query: ${question}`);
      return await this.wolfram.queryFact(question);
    } catch (error) {
      console.error('[JARVIS] Fact Query Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Hybrid: WolframAlpha + AI explanation
  async hybridQuery(question) {
    try {
      console.log(`[JARVIS] Hybrid Query: ${question}`);
      
      // Get WolframAlpha answer
      const wolframResult = await this.wolfram.intelligentQuery(question);
      
      // Get AI explanation
      const aiExplanation = await this.queryGemini(
        question,
        'Provide clear, helpful explanation'
      );

      // Get fast answer from Groq
      const groqAnswer = await this.queryGroq(question, 'Be concise');

      return {
        question: question,
        wolfram: wolframResult,
        ai_explanation: aiExplanation,
        fast_answer: groqAnswer,
        source: 'JARVIS Hybrid'
      };
    } catch (error) {
      console.error('[JARVIS] Hybrid Query Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = JARVISFullPower;
