/**
 * WolframAlpha Integration for JARVIS
 * Perfect for: Math, Physics, Chemistry, Data Analysis, Factual Queries
 * Free: 2,000 queries/month per AppID (supports 3 AppIDs = 6,000 total)
 */

const axios = require('axios');

class WolframAlphaIntegration {
  constructor(primaryAppId, secondaryAppId = null, tertiaryAppId = null) {
    this.appIds = [primaryAppId];
    if (secondaryAppId) this.appIds.push(secondaryAppId);
    if (tertiaryAppId) this.appIds.push(tertiaryAppId);
    
    this.primaryAppId = primaryAppId;
    this.secondaryAppId = secondaryAppId;
    this.tertiaryAppId = tertiaryAppId;
    this.currentAppIdIndex = 0;
    this.baseURL = 'http://api.wolframalpha.com/v2/query';
    this.shortAnswerURL = 'http://api.wolframalpha.com/v1/simple';
    this.fullResultsURL = 'http://api.wolframalpha.com/v2/query';
    this.queryCount = 0;
    
    console.log(`✅ WolframAlpha initialized with ${this.appIds.length} App IDs (${this.appIds.length * 2000} queries/month):`);
    this.appIds.forEach((id, idx) => {
      console.log(`   AppID ${idx + 1}: ${id}`);
    });
    if (this.appIds.length > 1) {
      console.log(`   🔄 Load balancing ENABLED`);
    }
  }

  /**
   * Get next App ID (load balancing between multiple IDs)
   */
  getNextAppId() {
    if (this.appIds.length === 1) return this.appIds[0];
    
    this.currentAppIdIndex = (this.currentAppIdIndex + 1) % this.appIds.length;
    const currentAppId = this.appIds[this.currentAppIdIndex];
    
    this.queryCount++;
    if (this.queryCount % 10 === 0) {
      console.log(`📊 WolframAlpha queries: ${this.queryCount} | Using AppID ${this.currentAppIdIndex + 1} of ${this.appIds.length}`);
    }
    
    return currentAppId;
  }

  /**
   * Get quick answer from WolframAlpha (best for direct answers)
   */
  async getQuickAnswer(query) {
    try {
      console.log(`[WolframAlpha] Quick Query: ${query}`);
      const appId = this.getNextAppId();
      
      const response = await axios.get(this.shortAnswerURL, {
        params: {
          appid: appId,
          i: query,
          timeout: 5
        },
        timeout: 10000
      });

      return {
        success: true,
        answer: response.data,
        source: 'WolframAlpha Quick',
        queryType: 'quick'
      };
    } catch (error) {
      console.error('[WolframAlpha] Quick Answer Error:', error.message);
      return {
        success: false,
        error: error.message,
        queryType: 'quick'
      };
    }
  }

  /**
   * Get detailed results from WolframAlpha (best for complex queries)
   */
  async getDetailedResults(query) {
    try {
      console.log(`[WolframAlpha] Detailed Query: ${query}`);
      const appId = this.getNextAppId();
      
      const response = await axios.get(this.baseURL, {
        params: {
          appid: appId,
          input: query,
          output: 'json',
          timeout: 5,
          maxrecalculation: 1
        },
        timeout: 10000
      });

      const data = response.data;
      
      if (data.queryresult.error) {
        return {
          success: false,
          error: 'WolframAlpha could not understand the query',
          suggestion: 'Try rephrasing the question',
          queryType: 'detailed'
        };
      }

      // Extract pods (results sections)
      const pods = data.queryresult.pods || [];
      const results = this.extractPodResults(pods);

      return {
        success: true,
        query: data.queryresult.input,
        results: results,
        source: 'WolframAlpha Detailed',
        queryType: 'detailed',
        success: data.queryresult.success,
        numpods: data.queryresult.numpods,
        timing: data.queryresult.timing
      };
    } catch (error) {
      console.error('[WolframAlpha] Detailed Query Error:', error.message);
      return {
        success: false,
        error: error.message,
        queryType: 'detailed'
      };
    }
  }

  /**
   * Extract useful information from pods
   */
  extractPodResults(pods) {
    const results = {};
    
    pods.forEach((pod, index) => {
      const podTitle = pod.title || `Result ${index + 1}`;
      const subpods = pod.subpods || [];
      
      results[podTitle] = subpods.map(subpod => ({
        plaintext: subpod.plaintext || '',
        image: subpod.img?.src || null
      })).filter(item => item.plaintext); // Filter out empty results
    });

    return results;
  }

  /**
   * Math-specific query (equations, calculus, linear algebra)
   */
  async solveMathProblem(problem) {
    console.log(`[WolframAlpha] Math Problem: ${problem}`);
    
    const enhancedQuery = `solve ${problem}`;
    const result = await this.getDetailedResults(enhancedQuery);
    
    return {
      ...result,
      category: 'mathematics'
    };
  }

  /**
   * Physics-specific query (mechanics, thermodynamics, electromagnetism)
   */
  async solvePhysicsProblem(problem) {
    console.log(`[WolframAlpha] Physics Problem: ${problem}`);
    
    const enhancedQuery = `physics: ${problem}`;
    const result = await this.getDetailedResults(enhancedQuery);
    
    return {
      ...result,
      category: 'physics'
    };
  }

  /**
   * Chemistry-specific query (reactions, molecular weight, stoichiometry)
   */
  async solveChemistryProblem(problem) {
    console.log(`[WolframAlpha] Chemistry Problem: ${problem}`);
    
    const enhancedQuery = `chemistry: ${problem}`;
    const result = await this.getDetailedResults(enhancedQuery);
    
    return {
      ...result,
      category: 'chemistry'
    };
  }

  /**
   * Data analysis query
   */
  async analyzeData(query) {
    console.log(`[WolframAlpha] Data Analysis: ${query}`);
    
    return await this.getDetailedResults(query);
  }

  /**
   * Factual query (history, geography, science facts)
   */
  async queryFact(question) {
    console.log(`[WolframAlpha] Fact Query: ${question}`);
    
    const result = await this.getQuickAnswer(question);
    
    if (result.success) {
      return {
        ...result,
        category: 'factual'
      };
    }
    
    // If quick answer fails, try detailed
    return await this.getDetailedResults(question);
  }

  /**
   * Convert units or values
   */
  async convert(from, to) {
    console.log(`[WolframAlpha] Convert: ${from} to ${to}`);
    
    const query = `convert ${from} to ${to}`;
    return await this.getQuickAnswer(query);
  }

  /**
   * Step-by-step solution
   */
  async getStepByStepSolution(problem) {
    console.log(`[WolframAlpha] Step-by-step: ${problem}`);
    
    // WolframAlpha doesn't have direct step-by-step in free tier
    // But we can return the detailed results in order
    const result = await this.getDetailedResults(problem);
    
    if (result.success) {
      return {
        ...result,
        note: 'Results shown in calculation order',
        category: 'step-by-step'
      };
    }
    
    return result;
  }

  /**
   * Intelligent query router - determines best method based on query
   */
  async intelligentQuery(question) {
    console.log(`[WolframAlpha] Intelligent Query: ${question}`);
    
    const lowerQuery = question.toLowerCase();
    
    // Detect query type
    if (this.isMathQuery(lowerQuery)) {
      return await this.solveMathProblem(question);
    } else if (this.isPhysicsQuery(lowerQuery)) {
      return await this.solvePhysicsProblem(question);
    } else if (this.isChemistryQuery(lowerQuery)) {
      return await this.solveChemistryProblem(question);
    } else if (this.isConversionQuery(lowerQuery)) {
      return await this.getDetailedResults(question);
    } else {
      // Default: try quick answer first, then detailed
      const quickResult = await this.getQuickAnswer(question);
      if (quickResult.success && quickResult.answer.trim()) {
        return quickResult;
      }
      return await this.getDetailedResults(question);
    }
  }

  /**
   * Query type detection helpers
   */
  isMathQuery(query) {
    const mathKeywords = [
      'solve', 'equation', 'derivative', 'integral', 'limit', 'sum',
      'factorial', 'prime', 'gcd', 'lcm', 'matrix', 'vector',
      'calculus', 'algebra', 'geometry', 'statistics', 'probability',
      'sqrt', 'sin', 'cos', 'tan', 'log', 'exp', 'simplify'
    ];
    return mathKeywords.some(keyword => query.includes(keyword));
  }

  isPhysicsQuery(query) {
    const physicsKeywords = [
      'force', 'velocity', 'acceleration', 'momentum', 'energy', 'power',
      'wavelength', 'frequency', 'resistance', 'capacitance', 'inductance',
      'gravity', 'friction', 'pressure', 'temperature', 'heat', 'newton',
      'joule', 'watts', 'pressure', 'mechanics', 'thermodynamics', 'electromagnetism'
    ];
    return physicsKeywords.some(keyword => query.includes(keyword));
  }

  isChemistryQuery(query) {
    const chemistryKeywords = [
      'atomic', 'molecular', 'element', 'compound', 'reaction', 'bond',
      'valence', 'electron', 'proton', 'neutron', 'pH', 'molarity',
      'stoichiometry', 'oxidation', 'reduction', 'organic', 'inorganic',
      'atom', 'ion', 'isotope', 'mole', 'mass'
    ];
    return chemistryKeywords.some(keyword => query.includes(keyword));
  }

  isConversionQuery(query) {
    const conversionKeywords = ['convert', 'to', 'equals', 'in', 'per'];
    return conversionKeywords.some(keyword => query.includes(keyword));
  }
}

module.exports = WolframAlphaIntegration;
