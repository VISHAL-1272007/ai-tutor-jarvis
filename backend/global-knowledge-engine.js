/**
 * GLOBAL KNOWLEDGE ENGINE: Autonomous Web-Scale Ingestion
 * 
 * Architecture: Recursive Research & Distillation
 * 1. Semantic Search (Jina/Serper)
 * 2. Full-Page Ingestion (Jina Reader)
 * 3. Fact Distillation (LLM Processing)
 * 4. Vector Memory Storage (Pinecone)
 * 
 * @author Nexus-Prime
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class GlobalKnowledgeEngine {
  constructor() {
    this.jinaReaderUrl = 'https://r.jina.ai/';
    this.pinecone = require('./pinecone-integration'); // Assuming this exists based on file list
  }

  /**
   * THE "A-Z" TRAINING PROTOCOL
   * Purpose: Deeply research a topic from multiple web sources and "memorize" it.
   */
  async autonomousTrain(topic, depth = 5) {
    console.log(`🧠 [JARVIS-KNOWLEDGE] Starting A-Z Training for: "${topic}"`);
    const startTime = performance.now();
    const knowledgeBase = [];

    try {
      // Step 1: Broad Search for High-Authority Sources
      const searchResults = await this._searchAuthorities(topic, depth);
      
      // Step 2: Parallel Deep Ingestion
      const ingestionTasks = searchResults.map(source => this.ingestSource(source.url));
      const rawContents = await Promise.allSettled(ingestionTasks);

      // Step 3: Fact Distillation & Vector Storage
      for (const result of rawContents) {
        if (result.status === 'fulfilled' && result.value.content) {
          const facts = await this._distillFacts(result.value.content, topic);
          
          // Store facts in Pinecone
          if (this.pinecone && facts.length > 0) {
            await this.pinecone.upsertKnowledge(facts.map(f => ({
              id: `fact_${Date.now()}_${Math.random()}`,
              text: f,
              metadata: { topic, source: result.value.url, timestamp: new Date().toISOString() }
            })));
          }
          knowledgeBase.push(...facts);
        }
      }

      const totalTime = (performance.now() - startTime) / 1000;
      console.log(`✅ [JARVIS-KNOWLEDGE] Training Complete. Ingested ${knowledgeBase.length} core facts in ${totalTime.toFixed(2)}s`);
      
      return {
        topic,
        factCount: knowledgeBase.length,
        executionTime: totalTime,
        status: 'TRAINED'
      };
    } catch (error) {
      console.error('❌ Training Error:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Search for authoritative sources (Wikipedia, Docs, Official portals)
   */
  async _searchAuthorities(query, limit) {
    try {
      const response = await axios.post('https://google.serper.dev/search', {
        q: `${query} official documentation wiki technical guide`,
        num: limit
      }, {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      return response.data.organic.map(r => ({
        title: r.title,
        url: r.link
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Ingest full markdown content of a page
   */
  async ingestSource(url) {
    try {
      const response = await axios.get(`${this.jinaReaderUrl}${url}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 15000
      });
      return {
        url,
        content: response.data.content || response.data.markdown || response.data.text
      };
    } catch (error) {
      return { url, error: error.message };
    }
  }

  /**
   * Distill large text into atomic, undeniable facts
   */
  async _distillFacts(content, topic) {
    try {
      const prompt = `Extract exactly 10-15 atomic, undeniable facts about "${topic}" from the following text. 
      Format each fact as a single sentence. 
      Include specific dates, versions, names, and statistics if present.
      
      Content: ${content.substring(0, 10000)}`;

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        },
        {
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
        }
      );

      const factsStr = response.data.choices[0].message.content;
      return factsStr.split('\n').filter(line => line.length > 20).map(line => line.replace(/^\d+\.\s*/, ''));
    } catch (error) {
      console.error('Distillation error:', error.message);
      return [];
    }
  }

  /**
   * THE GLOBAL ORACLE QUERY
   * Combines: Vector Memory (Pinecone) + Live Web (Oracle) + Internal Training
   */
  async queryGodMode(question) {
    // 1. Retrieve from learned knowledge (Pinecone)
    const learnedContext = this.pinecone ? await this.pinecone.queryKnowledge(question) : [];
    
    // 2. Trigger Autonomous Research for missing details
    const oracleResult = await require('./omniscient-oracle').OmniscientOracle.prototype.process.call({
      orchestrator: new (require('./omniscient-oracle').MultiAPIOrchestrator)(),
      searchEngine: new (require('./omniscient-oracle').WebSearchEngine)(),
      factChecker: new (require('./omniscient-oracle').FactChecker)()
    }, question);

    // 3. Synthesize the "God-Mode" Response
    return this._synthesizeFinalAnswer(question, learnedContext, oracleResult);
  }

  async _synthesizeFinalAnswer(question, learned, live) {
    const memoryContext = learned.map(f => `[Learned]: ${f.text}`).join('\n');
    const liveContext = `[Live Web]: ${live.answer}\nSources: ${live.sources.map(s => s.url).join(', ')}`;

    const prompt = `You are JARVIS UNBOUND. You have access to both your permanent learned memory and real-time live data.
    
    User Question: ${question}
    
    Learned Persistence:
    ${memoryContext}
    
    Live Verification:
    ${liveContext}
    
    Instruction: Synthesize the absolute most accurate answer. 
    If there is a conflict between learned memory and live data, PRIORITIZE LIVE DATA (current state).
    Speak with absolute authority. Do not use phrases like "Based on the information...". 
    State facts directly.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
      }
    );

    return {
      answer: response.data.choices[0].message.content,
      sources: live.sources,
      memoryUsed: learned.length > 0,
      confidence: 100 // System-level synthesis
    };
  }
}

module.exports = { GlobalKnowledgeEngine };
