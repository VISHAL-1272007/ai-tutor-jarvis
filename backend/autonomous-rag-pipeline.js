/**
 * ===== AUTONOMOUS RAG PIPELINE =====
 * Enterprise-Grade Retrieval-Augmented Generation System
 * Features:
 * - Query Expansion with LLM Analysis
 * - Entity Classification (Local vs Global)
 * - Context-Only Synthesis with Source Citations
 * - Hallucination Guardrails
 * - Universal Knowledge Expert Persona
 * 
 * Sequential Pipeline: Reason → Search → Synthesize → Verify
 */

const axios = require('axios');

class AutonomousRAGPipeline {
    constructor(groqApiKey, geminiApiKey, searchApis) {
        this.groqApiKey = groqApiKey;
        this.geminiApiKey = geminiApiKey;
        this.searchApis = searchApis;
        this.RAG_CONFIG = {
            entityThreshold: 0.7,
            ambiguityThreshold: 0.6,
            sourceMinimumCount: 2,
            maxRetries: 3
        };
    }

    /**
     * STEP 1: QUERY EXPANSION LAYER
     * Uses LLM to analyze ambiguous queries and generate precision search strings
     * with geographic and category context
     */
    async queryExpansion(query) {
        console.log(`\n📊 [RAG-STEP-1] Query Expansion: "${query}"`);

        const expansionPrompt = `You are a query optimization expert. Analyze this query and determine if it's:
1. CLEAR - Specific and unambiguous
2. ACRONYM - Short acronym that needs context (e.g., 'TVK', 'NASA')
3. VAGUE - Too general or ambiguous

Query: "${query}"

Respond in JSON format ONLY:
{
  "clarity": "CLEAR|ACRONYM|VAGUE",
  "confidence": 0.0-1.0,
  "expandedQuery": "Enhanced search string with context",
  "searchCategories": ["category1", "category2"],
  "geographicContext": "Local|Global|Regional",
  "suggestedRegion": "Tamil Nadu/India/Worldwide"
}`;

        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'mixtral-8x7b-32768',
                    messages: [{
                        role: 'user',
                        content: expansionPrompt
                    }],
                    temperature: 0.3,
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const analysisText = response.data.choices[0].message.content;
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                clarity: 'CLEAR',
                expandedQuery: query,
                geographicContext: 'Global',
                searchCategories: ['general']
            };

            console.log(`✅ Query Analysis - Clarity: ${analysis.clarity} | Geographic: ${analysis.geographicContext}`);
            return analysis;
        } catch (error) {
            console.warn(`⚠️ Query Expansion failed: ${error.message}, using original query`);
            return {
                clarity: 'CLEAR',
                expandedQuery: query,
                geographicContext: 'Global',
                searchCategories: ['general'],
                confidence: 0.5
            };
        }
    }

    /**
     * STEP 2: ENTITY CLASSIFICATION
     * Distinguishes between Local (Tamil Nadu/India) and Global entities
     * Adjusts search parameters based on classification
     */
    async entityClassification(query, geographicContext) {
        console.log(`\n🗺️ [RAG-STEP-2] Entity Classification`);

        const classificationPrompt = `Classify these entities from the query and determine if they are LOCAL (Tamil Nadu/India) or GLOBAL:

Query: "${query}"

Local indicators: Tamil Nadu, Chennai, TN state, Tamil people, Tamil politics, Kerala, Karnataka, South India
Global indicators: US, Europe, international, worldwide, global, across nations

Respond in JSON format ONLY:
{
  "entities": ["entity1", "entity2"],
  "entityTypes": {
    "entity1": "LOCAL|GLOBAL|BOTH",
    "entity2": "LOCAL|GLOBAL|BOTH"
  },
  "primaryScope": "LOCAL|GLOBAL|REGIONAL",
  "searchStrategy": "Use Tamil Nadu context|Use India context|Use global context|Use hybrid search",
  "localKeywords": ["keyword1", "keyword2"],
  "requiredSources": ["Tamil news sources", "Indian sources", "Global sources"]
}`;

        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'mixtral-8x7b-32768',
                    messages: [{
                        role: 'user',
                        content: classificationPrompt
                    }],
                    temperature: 0.3,
                    max_tokens: 600
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const classificationText = response.data.choices[0].message.content;
            const jsonMatch = classificationText.match(/\{[\s\S]*\}/);
            const classification = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                primaryScope: geographicContext,
                searchStrategy: 'Use global context'
            };

            console.log(`✅ Entity Classification - Primary Scope: ${classification.primaryScope}`);
            return classification;
        } catch (error) {
            console.warn(`⚠️ Entity Classification failed: ${error.message}`);
            return {
                primaryScope: geographicContext,
                searchStrategy: geographicContext === 'Local' ? 'Use Tamil Nadu context' : 'Use global context'
            };
        }
    }

    /**
     * STEP 3: INTELLIGENT WEB SEARCH
     * Executes search with expanded query and entity-aware parameters
     */
    async intelligentWebSearch(expandedQuery, classification) {
        console.log(`\n🔍 [RAG-STEP-3] Intelligent Web Search: "${expandedQuery}"`);

        // Add geographic and category context to search
        let searchQuery = expandedQuery;
        if (classification.primaryScope === 'LOCAL') {
            searchQuery += ' Tamil Nadu Chennai India';
        } else if (classification.primaryScope === 'REGIONAL') {
            searchQuery += ' India Asia';
        }

        const searchResults = {
            sources: [],
            rawData: [],
            quality: 0
        };

        // Try primary search engine
        try {
            const response = await axios.get(
                'https://api.jina.ai/v1/search',
                {
                    params: {
                        q: searchQuery,
                        limit: 10000
                    },
                    headers: {
                        'Authorization': `Bearer ${this.searchApis.jina.key}`,
                        'Accept': 'application/json'
                    },
                    timeout: 12000
                }
            );

            const results = response.data.data || response.data.results || [];
            searchResults.rawData = Array.isArray(results) ? results.slice(0, 5) : [];
            searchResults.quality = Math.min(searchResults.rawData.length / 3, 1.0);

            searchResults.sources = searchResults.rawData.map(r => ({
                title: r.title || 'Untitled',
                url: r.url || r.link || '',
                snippet: r.content || r.description || r.snippet || '',
                relevance: 0.9
            }));

            console.log(`✅ Search returned ${searchResults.sources.length} results`);
        } catch (error) {
            console.warn(`⚠️ Jina search failed: ${error.message}`);
        }

        return searchResults;
    }

    /**
     * STEP 4: CONTEXT-ONLY SYNTHESIS
     * Generates response prioritizing web context with mandatory source citations
     */
    async contextOnlySynthesis(originalQuery, searchResults, searchAnalysis) {
        console.log(`\n🧠 [RAG-STEP-4] Context-Only Synthesis`);

        // Check if we have sufficient context
        if (searchResults.sources.length < this.RAG_CONFIG.sourceMinimumCount) {
            return null; // Will trigger hallucination guardrails
        }

        // Build context string with source attribution
        let contextBlock = '📚 **RETRIEVED CONTEXT:**\n\n';
        searchResults.sources.forEach((source, index) => {
            contextBlock += `[${index + 1}] **${source.title}**\n`;
            contextBlock += `   Source: ${new URL(source.url).hostname}\n`;
            contextBlock += `   Content: ${source.snippet.substring(0, 200)}...\n\n`;
        });

        const synthesisPrompt = `You are a Universal Knowledge Expert. Your persona is professional, authoritative, and always respectful.
CRITICAL RULES:
1. ONLY use information from the provided context below
2. MUST cite sources for EVERY factual claim using format: [Source-N: Domain.com]
3. If context doesn't answer the question, respond with a clarification request
4. Maintain professional "Sir" tone throughout
5. Format: Main answer → Citations → Additional context → Source list

USER QUERY: "${originalQuery}"

CONTEXT:
${contextBlock}

Now provide a comprehensive, well-cited response addressing the user's query. Be authoritative but respectful.`;

        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.3-70b-versatile',
                    messages: [{
                        role: 'system',
                        content: 'You are JARVIS, a Universal Knowledge Expert. You respond with authority, cite all sources, and maintain a professional Sir tone.'
                    }, {
                        role: 'user',
                        content: synthesisPrompt
                    }],
                    temperature: 0.1,
                    max_tokens: 1500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            const synthesizedResponse = response.data.choices[0].message.content;
            console.log(`✅ Synthesis complete with ${searchResults.sources.length} sources cited`);

            return {
                response: synthesizedResponse,
                sourceCount: searchResults.sources.length,
                sources: searchResults.sources
            };
        } catch (error) {
            console.warn(`⚠️ Synthesis failed: ${error.message}`);
            return null;
        }
    }

    /**
     * STEP 5: HALLUCINATION GUARDRAILS
     * Detects insufficient context and asks for clarification instead of guessing
     */
    async hallucinationGuardrails(originalQuery, searchResults, synthesisResult) {
        console.log(`\n🛡️ [RAG-STEP-5] Hallucination Guardrails`);

        // Check if synthesis was impossible due to insufficient context
        if (!synthesisResult || searchResults.quality < 0.4) {
            console.log(`⚠️ GUARDRAIL TRIGGERED: Insufficient context for query`);

            // Generate clarification options
            const clarificationPrompt = `The user query might be ambiguous. Generate 2-3 clarification options:

Query: "${originalQuery}"

Respond in JSON format ONLY:
{
  "clarificationNeeded": true,
  "options": [
    "Option A: [specific interpretation]",
    "Option B: [different interpretation]",
    "Option C: [another perspective]"
  ]
}`;

            try {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: 'mixtral-8x7b-32768',
                        messages: [{
                            role: 'user',
                            content: clarificationPrompt
                        }],
                        temperature: 0.5,
                        max_tokens: 400
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.groqApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    }
                );

                const clarificationText = response.data.choices[0].message.content;
                const jsonMatch = clarificationText.match(/\{[\s\S]*\}/);
                const clarification = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                    options: [
                        `Option A: More information about ${originalQuery}`,
                        `Option B: A different aspect of your query`,
                        `Option C: Related information`
                    ]
                };

                return {
                    type: 'CLARIFICATION_REQUEST',
                    message: `Sir, could you please clarify if you mean:\n\n${clarification.options.map(opt => `• ${opt}`).join('\n')}\n\nThis will help me provide you with the most accurate information.`,
                    options: clarification.options
                };
            } catch (error) {
                console.warn(`⚠️ Clarification generation failed`);
                return {
                    type: 'CLARIFICATION_REQUEST',
                    message: `Sir, your query requires some clarification. Could you provide more details about:\n• What specific aspect interests you?\n• Are you asking about recent events or historical information?\n• Are you interested in a local or global perspective?\n\nThis will enable me to provide more precise information.`
                };
            }
        }

        return null; // No hallucination risk detected
    }

    /**
     * MAIN PIPELINE ORCHESTRATOR
     * Executes all steps sequentially: Reason → Search → Synthesize → Verify
     */
    async executePipeline(query, mode = 'general') {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🚀 AUTONOMOUS RAG PIPELINE INITIATED`);
        console.log(`Query: "${query}"`);
        console.log(`${'='.repeat(80)}`);

        try {
            // STEP 1: Query Expansion
            const analysisResult = await this.queryExpansion(query);
            const expandedQuery = analysisResult.expandedQuery;

            // STEP 2: Entity Classification
            const classification = await this.entityClassification(query, analysisResult.geographicContext);

            // STEP 3: Intelligent Web Search
            const searchResults = await this.intelligentWebSearch(expandedQuery, classification);

            // STEP 4: Context-Only Synthesis
            const synthesisResult = await this.contextOnlySynthesis(query, searchResults, analysisResult);

            // STEP 5: Hallucination Guardrails
            const guardrailResult = await this.hallucinationGuardrails(query, searchResults, synthesisResult);

            // Return appropriate response
            if (guardrailResult) {
                console.log(`\n⚠️ GUARDRAIL ACTIVE: Requesting clarification`);
                return {
                    type: 'CLARIFICATION',
                    response: guardrailResult.message,
                    options: guardrailResult.options,
                    sources: [],
                    searchUsed: true,
                    quality: 'LOW_CONFIDENCE'
                };
            }

            console.log(`\n✅ PIPELINE COMPLETE - HIGH CONFIDENCE RESPONSE`);
            return {
                type: 'SUCCESS',
                response: synthesisResult.response,
                sources: synthesisResult.sources,
                searchUsed: true,
                quality: 'HIGH_CONFIDENCE',
                metadata: {
                    originalQuery: query,
                    expandedQuery: expandedQuery,
                    scope: classification.primaryScope,
                    sourceCount: synthesisResult.sourceCount,
                    pipelineSteps: 5
                }
            };

        } catch (pipelineError) {
            console.error(`❌ Pipeline error: ${pipelineError.message}`);
            return {
                type: 'ERROR',
                response: 'Sir, I encountered an issue processing your query. Please try again.',
                sources: [],
                searchUsed: false,
                error: pipelineError.message
            };
        }
    }
}

module.exports = AutonomousRAGPipeline;
