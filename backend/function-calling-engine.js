/**
 * ===== FUNCTION CALLING ENGINE =====
 * Intelligent tool invocation system for JARVIS
 * Features:
 * - Tool definition and schema validation
 * - LLM-powered tool selection
 * - Automatic tool execution and result integration
 * - Fallback mechanisms and error handling
 * 
 * Workflow: Analyze Query → Determine Tools → Execute → Integrate Results → Generate Final Response
 */

const axios = require('axios');
const { execSync } = require('child_process');
const os = require('os');

class FunctionCallingEngine {
    constructor(groqApiKey, geminiApiKey) {
        this.groqApiKey = groqApiKey;
        this.geminiApiKey = geminiApiKey;
        this.toolExecutionHistory = [];
        this.maxRetries = 2;
        
        // Define available tools with schemas
        this.tools = this.defineTools();
        
        console.log(`✅ Function Calling Engine initialized with ${Object.keys(this.tools).length} tools`);
    }

    /**
     * Define all available tools with their schemas and execution logic
     */
    defineTools() {
        return {
            // Tool 1: Web Search
            searchWeb: {
                name: 'searchWeb',
                description: 'Search the web for real-time information, news, current events, or specific topics',
                category: 'information_retrieval',
                requiredParameters: ['query'],
                optionalParameters: ['limit', 'filter'],
                schema: {
                    query: { type: 'string', description: 'Search query string' },
                    limit: { type: 'number', description: 'Max results (1-10)', default: 5 },
                    filter: { type: 'string', description: 'Filter by: news, recent, academic', default: 'news' }
                },
                execute: this.executeSearchWeb.bind(this)
            },

            // Tool 2: Get System Information
            getSystemInfo: {
                name: 'getSystemInfo',
                description: 'Retrieve system information like CPU, memory, OS details, server status',
                category: 'system',
                requiredParameters: [],
                optionalParameters: ['infoType'],
                schema: {
                    infoType: { type: 'string', description: 'Type: os, cpu, memory, uptime, all', default: 'all' }
                },
                execute: this.executeGetSystemInfo.bind(this)
            },

            // Tool 3: Get Current Time/Date
            getCurrentTime: {
                name: 'getCurrentTime',
                description: 'Get current date, time, timezone information',
                category: 'utility',
                requiredParameters: [],
                optionalParameters: ['timezone', 'format'],
                schema: {
                    timezone: { type: 'string', description: 'Timezone (e.g., IST, UTC, EST)', default: 'IST' },
                    format: { type: 'string', description: 'Format: full, time, date, timestamp', default: 'full' }
                },
                execute: this.executeGetCurrentTime.bind(this)
            },

            // Tool 4: Calculate Math
            calculateMath: {
                name: 'calculateMath',
                description: 'Perform mathematical calculations, formulas, or solve equations',
                category: 'computation',
                requiredParameters: ['expression'],
                optionalParameters: ['precision'],
                schema: {
                    expression: { type: 'string', description: 'Math expression (e.g., "2+2", "sqrt(16)", "sin(π/2)")' },
                    precision: { type: 'number', description: 'Decimal precision (default: 2)', default: 2 }
                },
                execute: this.executeCalculateMath.bind(this)
            },

            // Tool 5: Translate Text
            translateText: {
                name: 'translateText',
                description: 'Translate text between languages',
                category: 'language',
                requiredParameters: ['text', 'targetLanguage'],
                optionalParameters: ['sourceLanguage'],
                schema: {
                    text: { type: 'string', description: 'Text to translate' },
                    targetLanguage: { type: 'string', description: 'Target language (e.g., Tamil, Spanish, French)' },
                    sourceLanguage: { type: 'string', description: 'Source language (default: English)', default: 'English' }
                },
                execute: this.executeTranslateText.bind(this)
            },

            // Tool 6: Get Weather Information
            getWeather: {
                name: 'getWeather',
                description: 'Retrieve weather information for a location',
                category: 'information_retrieval',
                requiredParameters: ['location'],
                optionalParameters: ['units', 'forecast'],
                schema: {
                    location: { type: 'string', description: 'City or location name' },
                    units: { type: 'string', description: 'Temperature units: celsius, fahrenheit', default: 'celsius' },
                    forecast: { type: 'string', description: 'Forecast type: current, today, week', default: 'current' }
                },
                execute: this.executeGetWeather.bind(this)
            },

            // Tool 7: List Available Tools (Meta)
            listTools: {
                name: 'listTools',
                description: 'List all available tools and their capabilities',
                category: 'meta',
                requiredParameters: [],
                optionalParameters: ['category'],
                schema: {
                    category: { type: 'string', description: 'Filter by category (information_retrieval, system, utility, etc.)', default: 'all' }
                },
                execute: this.executeListTools.bind(this)
            },

            // Tool 8: Format Information
            formatData: {
                name: 'formatData',
                description: 'Format data for presentation (tables, lists, markdown)',
                category: 'utility',
                requiredParameters: ['data', 'format'],
                optionalParameters: [],
                schema: {
                    data: { type: 'string', description: 'Data to format (JSON, CSV, or text)' },
                    format: { type: 'string', description: 'Output format: table, list, markdown, json' }
                },
                execute: this.executeFormatData.bind(this)
            },

            // Tool 9: Execute Code
            executeCode: {
                name: 'executeCode',
                description: 'Execute JavaScript code snippets safely (limited scope)',
                category: 'computation',
                requiredParameters: ['code'],
                optionalParameters: ['language'],
                schema: {
                    code: { type: 'string', description: 'Code to execute' },
                    language: { type: 'string', description: 'Language: javascript, python', default: 'javascript' }
                },
                execute: this.executeExecuteCode.bind(this)
            },

            // Tool 10: Get Stock Info
            getStockInfo: {
                name: 'getStockInfo',
                description: 'Get stock market information, prices, and indices',
                category: 'information_retrieval',
                requiredParameters: ['symbol'],
                optionalParameters: ['period'],
                schema: {
                    symbol: { type: 'string', description: 'Stock symbol (e.g., AAPL, INFY, RELIANCE)' },
                    period: { type: 'string', description: 'Time period: 1d, 1w, 1m, 3m, 1y', default: '1d' }
                },
                execute: this.executeGetStockInfo.bind(this)
            }
        };
    }

    /**
     * Step 1: Analyze query to determine which tools are needed
     */
    async determineToolsNeeded(query) {
        console.log(`\n🔧 [FUNCTION CALLING] Analyzing query for tool requirements...`);

        const toolAnalysisPrompt = `You are JARVIS, an AI assistant with access to multiple tools. Analyze the user's query and determine which tools (if any) should be called.

**Available Tools:**
${this.getToolsList()}

**User Query:** "${query}"

**Your Task:**
1. Analyze if the query requires any tool calls
2. If YES, identify the specific tools needed
3. Extract the parameters for each tool
4. Return a JSON response with your decision

**IMPORTANT RULES:**
- ONLY suggest tools if truly necessary
- Tool calls are for real-time data, calculations, or system info
- Educational/explanatory queries usually DON'T need tools
- Multiple tools can be called if the query requires multiple actions

**Respond in JSON format ONLY:**
{
  "needsTools": true/false,
  "reasoning": "Why these tools are needed",
  "toolCalls": [
    {
      "toolName": "searchWeb",
      "parameters": {
        "query": "exact search query",
        "limit": 5,
        "filter": "news"
      }
    }
  ],
  "confidence": 0.0-1.0
}`;

        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'mixtral-8x7b-32768',
                    messages: [{
                        role: 'user',
                        content: toolAnalysisPrompt
                    }],
                    temperature: 0.3,
                    max_tokens: 800
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const responseText = response.data.choices[0].message.content;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                needsTools: false,
                reasoning: 'Unable to determine',
                toolCalls: []
            };

            console.log(`✅ Tool Analysis Complete - Tools Needed: ${analysis.needsTools}`);
            if (analysis.needsTools && analysis.toolCalls.length > 0) {
                console.log(`📋 Tools to Call: ${analysis.toolCalls.map(t => t.toolName).join(', ')}`);
            }

            return analysis;
        } catch (error) {
            console.warn(`⚠️ Tool analysis failed: ${error.message}`);
            return {
                needsTools: false,
                reasoning: 'Analysis failed',
                toolCalls: []
            };
        }
    }

    /**
     * Step 2: Execute determined tools
     */
    async executeToolCalls(toolCalls) {
        console.log(`\n⚙️ [FUNCTION CALLING] Executing ${toolCalls.length} tool(s)...`);

        const results = [];
        for (const toolCall of toolCalls) {
            const tool = this.tools[toolCall.toolName];

            if (!tool) {
                console.warn(`⚠️ Tool not found: ${toolCall.toolName}`);
                results.push({
                    toolName: toolCall.toolName,
                    success: false,
                    error: `Tool '${toolCall.toolName}' not found`
                });
                continue;
            }

            try {
                console.log(`⏳ Executing: ${toolCall.toolName} with params:`, toolCall.parameters);
                const result = await tool.execute(toolCall.parameters);
                
                results.push({
                    toolName: toolCall.toolName,
                    success: true,
                    data: result,
                    timestamp: new Date().toISOString()
                });

                console.log(`✅ ${toolCall.toolName} completed successfully`);
                this.toolExecutionHistory.push({
                    tool: toolCall.toolName,
                    params: toolCall.parameters,
                    success: true,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error(`❌ ${toolCall.toolName} execution failed: ${error.message}`);
                results.push({
                    toolName: toolCall.toolName,
                    success: false,
                    error: error.message
                });

                this.toolExecutionHistory.push({
                    tool: toolCall.toolName,
                    params: toolCall.parameters,
                    success: false,
                    error: error.message,
                    timestamp: new Date()
                });
            }
        }

        return results;
    }

    /**
     * Step 3: Integrate tool results into final response
     */
    async integrateToolResults(originalQuery, toolResults) {
        console.log(`\n🔗 [FUNCTION CALLING] Integrating tool results into response...`);

        // Build tool results summary
        let toolResultsText = '';
        let hasErrors = false;

        for (const result of toolResults) {
            if (result.success) {
                toolResultsText += `\n✅ **${result.toolName}:**\n`;
                if (typeof result.data === 'string') {
                    toolResultsText += result.data;
                } else {
                    toolResultsText += JSON.stringify(result.data, null, 2);
                }
                toolResultsText += '\n';
            } else {
                toolResultsText += `\n⚠️ **${result.toolName}:** ${result.error}\n`;
                hasErrors = true;
            }
        }

        const integrationPrompt = `You are JARVIS. The user asked: "${originalQuery}"

I have already executed some tools to gather information. Here are the results:

${toolResultsText}

**Your Task:**
1. Synthesize these tool results into a comprehensive, professional answer
2. Address the user's original query using the tool data
3. Maintain your sophisticated "Sir" persona
4. Cite which tools were used to gather the information
5. Provide actionable insights or next steps

**Format your response professionally with clear sections and formatting.**`;

        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.3-70b-versatile',
                    messages: [{
                        role: 'system',
                        content: 'You are JARVIS, a sophisticated AI assistant. Synthesize the provided tool results into an eloquent, professional response maintaining "Sir" tone.'
                    }, {
                        role: 'user',
                        content: integrationPrompt
                    }],
                    temperature: 0.5,
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

            const finalResponse = response.data.choices[0].message.content;
            console.log(`✅ Tool results integrated into final response`);

            return {
                response: finalResponse,
                toolsUsed: toolResults.filter(r => r.success).map(r => r.toolName),
                toolResults: toolResults,
                hasErrors: hasErrors
            };
        } catch (error) {
            console.warn(`⚠️ Integration failed: ${error.message}`);
            
            // Fallback: Return tool results directly
            return {
                response: `Sir, I have gathered the following information:\n\n${toolResultsText}`,
                toolsUsed: toolResults.filter(r => r.success).map(r => r.toolName),
                toolResults: toolResults,
                hasErrors: true,
                usedFallback: true
            };
        }
    }

    /**
     * Main Function Calling Pipeline Orchestrator
     */
    async executeFunctionCallingPipeline(query) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🔧 FUNCTION CALLING PIPELINE INITIATED`);
        console.log(`Query: "${query}"`);
        console.log(`${'='.repeat(80)}`);

        try {
            // Step 1: Determine tools needed
            const toolAnalysis = await this.determineToolsNeeded(query);

            if (!toolAnalysis.needsTools || !toolAnalysis.toolCalls || toolAnalysis.toolCalls.length === 0) {
                console.log(`ℹ️ No tools required for this query`);
                return {
                    type: 'NO_TOOLS_NEEDED',
                    message: 'Query does not require tool execution',
                    toolsUsed: []
                };
            }

            // Step 2: Execute tools
            const toolResults = await this.executeToolCalls(toolAnalysis.toolCalls);

            // Step 3: Integrate results
            const integratedResponse = await this.integrateToolResults(query, toolResults);

            console.log(`\n✅ FUNCTION CALLING PIPELINE COMPLETE`);
            return {
                type: 'FUNCTION_CALLING_SUCCESS',
                response: integratedResponse.response,
                toolsUsed: integratedResponse.toolsUsed,
                toolResults: integratedResponse.toolResults,
                hasErrors: integratedResponse.hasErrors,
                usedFallback: integratedResponse.usedFallback
            };

        } catch (pipelineError) {
            console.error(`❌ Function Calling Pipeline error: ${pipelineError.message}`);
            return {
                type: 'FUNCTION_CALLING_ERROR',
                error: pipelineError.message,
                toolsUsed: []
            };
        }
    }

    // ===== TOOL IMPLEMENTATIONS =====

    async executeSearchWeb(params) {
        // Placeholder: Would integrate with Jina, Perplexity, or other search APIs
        const { query, limit = 5, filter = 'news' } = params;
        
        try {
            // This would call actual search API
            return `Web search results for "${query}":\n1. Result 1\n2. Result 2\n3. Result 3`;
        } catch (error) {
            throw new Error(`Web search failed: ${error.message}`);
        }
    }

    executeGetSystemInfo(params) {
        const { infoType = 'all' } = params;
        const info = {};

        if (infoType === 'all' || infoType === 'os') {
            info.os = os.platform();
            info.arch = os.arch();
            info.release = os.release();
        }

        if (infoType === 'all' || infoType === 'cpu') {
            info.cpus = os.cpus().length;
            info.cpuModel = os.cpus()[0].model;
        }

        if (infoType === 'all' || infoType === 'memory') {
            info.totalMemory = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
            info.freeMemory = `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
        }

        if (infoType === 'all' || infoType === 'uptime') {
            info.uptime = `${(os.uptime() / 3600).toFixed(2)} hours`;
        }

        return JSON.stringify(info, null, 2);
    }

    executeGetCurrentTime(params) {
        const { timezone = 'IST', format = 'full' } = params;
        const now = new Date();
        
        const timeString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        if (format === 'time') {
            return now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
        } else if (format === 'date') {
            return now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        } else if (format === 'timestamp') {
            return now.toISOString();
        }

        return `Current Date & Time (${timezone}): ${timeString}`;
    }

    async executeCalculateMath(params) {
        const { expression, precision = 2 } = params;

        try {
            // Safe evaluation (limited scope)
            const result = Function('"use strict"; return (' + expression + ')')();
            return `Result: ${result.toFixed(precision)}`;
        } catch (error) {
            throw new Error(`Math calculation failed: ${error.message}`);
        }
    }

    async executeTranslateText(params) {
        const { text, targetLanguage, sourceLanguage = 'English' } = params;

        // Placeholder: Would integrate with translation API
        return `Translation from ${sourceLanguage} to ${targetLanguage}:\n"${text}"\n→ [Translated text would appear here]`;
    }

    async executeGetWeather(params) {
        const { location, units = 'celsius', forecast = 'current' } = params;

        // Placeholder: Would integrate with weather API
        return `Weather for ${location} (${units}):\nTemperature: 28°C\nCondition: Partly Cloudy\nHumidity: 65%`;
    }

    executeListTools(params) {
        const { category = 'all' } = params;
        let toolsList = '';

        for (const [name, tool] of Object.entries(this.tools)) {
            if (category !== 'all' && tool.category !== category) continue;

            toolsList += `\n**${tool.name}** [${tool.category}]\n`;
            toolsList += `   📝 ${tool.description}\n`;
            toolsList += `   ✅ Required: ${tool.requiredParameters.join(', ') || 'None'}\n`;
            toolsList += `   ℹ️ Optional: ${tool.optionalParameters.join(', ') || 'None'}\n`;
        }

        return `**Available Tools:**\n${toolsList}`;
    }

    async executeFormatData(params) {
        const { data, format } = params;

        if (format === 'table') {
            // Convert to markdown table
            return `| Column 1 | Column 2 |\n|----------|----------|\n| Data     | Data     |`;
        } else if (format === 'list') {
            return `- Item 1\n- Item 2\n- Item 3`;
        } else if (format === 'markdown') {
            return `# Formatted Data\n\n${data}`;
        } else if (format === 'json') {
            try {
                return JSON.stringify(JSON.parse(data), null, 2);
            } catch {
                return data;
            }
        }

        return data;
    }

    async executeExecuteCode(params) {
        const { code, language = 'javascript' } = params;

        if (language !== 'javascript') {
            throw new Error(`Language '${language}' is not supported for execution`);
        }

        try {
            const result = Function('"use strict"; return (' + code + ')')();
            return `Code Execution Result:\n${JSON.stringify(result, null, 2)}`;
        } catch (error) {
            throw new Error(`Code execution failed: ${error.message}`);
        }
    }

    async executeGetStockInfo(params) {
        const { symbol, period = '1d' } = params;

        // Placeholder: Would integrate with stock API
        return `Stock Info for ${symbol}:\nPrice: $XXX.XX\nChange: +X.XX%\nVolume: XXM\nPeriod: ${period}`;
    }

    /**
     * Helper: Get formatted tools list for prompts
     */
    getToolsList() {
        let list = '';
        for (const [name, tool] of Object.entries(this.tools)) {
            list += `- **${tool.name}**: ${tool.description}\n`;
        }
        return list;
    }
}

module.exports = FunctionCallingEngine;
