# 🔧 FUNCTION CALLING ENGINE - COMPREHENSIVE GUIDE

## Overview

The **Function Calling Engine** is an intelligent tool invocation system that enables JARVIS to automatically detect when to use specific tools (functions) and execute them to provide accurate, real-time information before generating the final response.

Think of it as JARVIS having a **toolbelt of specialized functions** that it can pick and use when needed:
- 🔍 Search the web for information
- ⏰ Get current time/date
- 🧮 Perform complex calculations
- 🖥️ Retrieve system information
- 🌍 Translate text
- 📊 Format data
- And more!

---

## Architecture

### Pipeline Flow

```
User Query
    ↓
[1] FUNCTION ANALYSIS
    → LLM analyzes query
    → Determines if tools are needed
    ↓
[2] TOOL SELECTION
    → Identifies specific tools to call
    → Extracts required parameters
    ↓
[3] TOOL EXECUTION
    → Runs determined tools
    → Collects results
    ↓
[4] RESULT INTEGRATION
    → LLM synthesizes tool results
    → Creates comprehensive response
    ↓
Final Response with Tool Metadata
```

---

## Available Tools (10 Total)

### 1. **searchWeb** 🔍
Search the web for real-time information, news, and current events.

**When to use:**
- Latest news queries
- Current events
- Recent information
- Trending topics

**Parameters:**
```javascript
{
  query: "search query string",           // REQUIRED
  limit: 5,                               // Optional (1-10)
  filter: "news|recent|academic"          // Optional
}
```

**Example:**
```json
{
  "toolName": "searchWeb",
  "parameters": {
    "query": "latest news about AI 2026",
    "limit": 5,
    "filter": "news"
  }
}
```

---

### 2. **getSystemInfo** 🖥️
Retrieve system information like CPU, memory, OS details.

**When to use:**
- Server health checks
- System capacity queries
- Infrastructure information
- Performance monitoring

**Parameters:**
```javascript
{
  infoType: "os|cpu|memory|uptime|all"  // Optional
}
```

**Example:**
```json
{
  "toolName": "getSystemInfo",
  "parameters": {
    "infoType": "all"
  }
}
```

---

### 3. **getCurrentTime** ⏰
Get current date, time, and timezone information.

**When to use:**
- Time queries
- Timezone conversions
- Schedule planning
- Event timing

**Parameters:**
```javascript
{
  timezone: "IST|UTC|EST",               // Optional
  format: "full|time|date|timestamp"     // Optional
}
```

**Example:**
```json
{
  "toolName": "getCurrentTime",
  "parameters": {
    "timezone": "IST",
    "format": "full"
  }
}
```

---

### 4. **calculateMath** 🧮
Perform mathematical calculations and solve equations.

**When to use:**
- Mathematical problems
- Formula calculations
- Complex computations
- Numeric solutions

**Parameters:**
```javascript
{
  expression: "mathematical expression",  // REQUIRED
  precision: 2                            // Optional
}
```

**Example:**
```json
{
  "toolName": "calculateMath",
  "parameters": {
    "expression": "sqrt(144) + (2 * 3)",
    "precision": 2
  }
}
```

---

### 5. **translateText** 🌍
Translate text between languages.

**When to use:**
- Language translation
- Multi-language content
- Localization
- Communication

**Parameters:**
```javascript
{
  text: "text to translate",              // REQUIRED
  targetLanguage: "Tamil|Spanish|etc",    // REQUIRED
  sourceLanguage: "English"               // Optional
}
```

**Example:**
```json
{
  "toolName": "translateText",
  "parameters": {
    "text": "Hello, how are you?",
    "targetLanguage": "Tamil",
    "sourceLanguage": "English"
  }
}
```

---

### 6. **getWeather** 🌤️
Retrieve weather information for a location.

**When to use:**
- Weather forecasts
- Climate queries
- Temperature information
- Seasonal planning

**Parameters:**
```javascript
{
  location: "city name",                  // REQUIRED
  units: "celsius|fahrenheit",            // Optional
  forecast: "current|today|week"          // Optional
}
```

**Example:**
```json
{
  "toolName": "getWeather",
  "parameters": {
    "location": "Chennai",
    "units": "celsius",
    "forecast": "current"
  }
}
```

---

### 7. **listTools** 📋
List all available tools and their capabilities (Meta tool).

**When to use:**
- Learning what tools are available
- Discovering tool capabilities
- Help queries about function calling

**Parameters:**
```javascript
{
  category: "all|information_retrieval|system|utility"  // Optional
}
```

**Example:**
```json
{
  "toolName": "listTools",
  "parameters": {
    "category": "all"
  }
}
```

---

### 8. **formatData** 📊
Format data for presentation (tables, lists, markdown).

**When to use:**
- Data presentation
- Structured formatting
- Table creation
- Data conversion

**Parameters:**
```javascript
{
  data: "data to format",                 // REQUIRED
  format: "table|list|markdown|json"      // REQUIRED
}
```

**Example:**
```json
{
  "toolName": "formatData",
  "parameters": {
    "data": "row1,row2,row3",
    "format": "table"
  }
}
```

---

### 9. **executeCode** 💻
Execute JavaScript code snippets safely (limited scope).

**When to use:**
- Code execution
- Algorithm testing
- Quick computations
- Code validation

**Parameters:**
```javascript
{
  code: "javascript code",                // REQUIRED
  language: "javascript|python"           // Optional
}
```

**Example:**
```json
{
  "toolName": "executeCode",
  "parameters": {
    "code": "const arr = [1,2,3]; return arr.reduce((a,b) => a+b);",
    "language": "javascript"
  }
}
```

---

### 10. **getStockInfo** 📈
Get stock market information, prices, and indices.

**When to use:**
- Stock prices
- Market trends
- Financial information
- Investment data

**Parameters:**
```javascript
{
  symbol: "stock symbol",                 // REQUIRED (e.g., AAPL, INFY)
  period: "1d|1w|1m|3m|1y"                // Optional
}
```

**Example:**
```json
{
  "toolName": "getStockInfo",
  "parameters": {
    "symbol": "RELIANCE",
    "period": "1d"
  }
}
```

---

## Integration with RAG Pipeline

### Sequential Processing Order

```
Query Received
    ↓
[1] FUNCTION CALLING ENGINE
    → Determine if tools are needed
    → Execute tools if needed
    → Integrate tool results
    ↓
[2] RAG PIPELINE (if needed)
    → Query Expansion
    → Entity Classification
    → Web Search
    → Context-Only Synthesis
    → Hallucination Guardrails
    ↓
[3] LLM PROCESSING
    → Generate final response using:
      • Tool results
      • Web search context
      • RAG pipeline outputs
    ↓
Final Response with Complete Metadata
```

---

## Implementation Details

### File Structure

```
backend/
├── function-calling-engine.js      (600+ lines)
│   ├── FunctionCallingEngine class
│   ├── Tool definitions (10 tools)
│   ├── determineToolsNeeded()
│   ├── executeToolCalls()
│   ├── integrateToolResults()
│   └── executeFunctionCallingPipeline()
│
├── index.js                         (Modified)
│   ├── Import FunctionCallingEngine
│   ├── Initialize engine
│   ├── /ask endpoint integration
│   └── Response metadata
```

### Code Integration (index.js)

**1. Import:**
```javascript
const FunctionCallingEngine = require('./function-calling-engine');
```

**2. Initialize:**
```javascript
let functionCallingEngine = null;
if (process.env.GROQ_API_KEY) {
    functionCallingEngine = new FunctionCallingEngine(
        process.env.GROQ_API_KEY,
        process.env.GEMINI_API_KEY
    );
    console.log('🔧 Function Calling Engine initialized with 10 tools');
}
```

**3. Use in /ask endpoint:**
```javascript
// Check if Function Calling is needed
if (functionCallingEngine) {
    const toolAnalysis = await functionCallingEngine.determineToolsNeeded(question);
    
    if (toolAnalysis.needsTools && toolAnalysis.toolCalls.length > 0) {
        // Execute tools
        const execResults = await functionCallingEngine.executeToolCalls(
            toolAnalysis.toolCalls
        );
        
        // Integrate results
        functionCallingResult = await functionCallingEngine.integrateToolResults(
            question,
            execResults
        );
        
        functionCallingUsed = true;
    }
}
```

**4. Response includes:**
```javascript
{
  answer: "...",
  functionCallingUsed: true,
  toolsUsed: ["searchWeb", "calculateMath"],
  toolResults: [...],
  toolsInfo: {
    totalToolsCalled: 2,
    successfulTools: 2,
    failedTools: 0
  }
}
```

---

## Decision Logic

### When JARVIS Calls Tools

JARVIS analyzes queries to determine tool necessity:

**WILL call tools for:**
- ✅ Latest news queries
- ✅ Current events
- ✅ Real-time information
- ✅ Mathematical expressions
- ✅ System information requests
- ✅ Weather queries
- ✅ Stock prices
- ✅ Translation requests

**WILL NOT call tools for:**
- ❌ Educational queries (explaining concepts)
- ❌ Coding help (general guidance)
- ❌ Tutorial requests
- ❌ Learning materials
- ❌ Philosophical discussions
- ❌ Creative writing

**Example Decisions:**

| Query | Tools Needed | Reason |
|-------|--------------|--------|
| "What's the latest news about AI?" | ✅ searchWeb | Current events need real-time data |
| "How do I learn JavaScript?" | ❌ None | Educational - knowledge base sufficient |
| "What's 2 + 2?" | ✅ calculateMath | Requires computation |
| "Explain quantum physics" | ❌ None | Educational content |
| "Is RELIANCE stock up today?" | ✅ getStockInfo | Real-time financial data needed |
| "How to debug a function?" | ❌ None | General coding guidance |

---

## Execution Flow (Detailed)

### Step 1: Tool Analysis

**LLM Decision Logic:**
```
PROMPT: "Analyze this query and determine which tools (if any) should be called"

INPUT: "What's the weather in Chennai today?"

OUTPUT:
{
  "needsTools": true,
  "reasoning": "User is asking for real-time weather data",
  "toolCalls": [
    {
      "toolName": "getWeather",
      "parameters": {
        "location": "Chennai",
        "units": "celsius",
        "forecast": "current"
      }
    }
  ],
  "confidence": 0.95
}
```

### Step 2: Tool Execution

**Execution Context:**
```
Tool: getWeather
Parameters: {
  location: "Chennai",
  units: "celsius",
  forecast: "current"
}

Process:
1. Validate parameters
2. Call weather API
3. Format response
4. Return structured data

Result:
{
  toolName: "getWeather",
  success: true,
  data: "Weather for Chennai: Temperature 28°C, Cloudy, Humidity 65%"
}
```

### Step 3: Result Integration

**LLM Synthesis:**
```
INPUT:
- Original Query: "What's the weather in Chennai today?"
- Tool Results: "Temperature 28°C, Cloudy, Humidity 65%"

PROCESS:
1. Format tool results
2. Integrate with LLM context
3. Generate professional response
4. Maintain "Sir" tone

OUTPUT:
"Sir, the weather in Chennai today is quite pleasant. 
The current temperature stands at 28°C with cloudy conditions. 
The humidity level is at 65%, which is moderate. 
I suggest carrying an umbrella as clouds suggest possible rainfall. 
Is there anything else you'd like to know about the weather?"
```

---

## Response Examples

### Example 1: Tool Used Successfully

**Query:** "Get me the latest AI news"

**Response:**
```javascript
{
  answer: "Sir, here are the latest developments in AI...\n\n[Tool results integrated]\n\nBased on my search, the following...",
  functionCallingUsed: true,
  toolsUsed: ["searchWeb"],
  toolsInfo: {
    totalToolsCalled: 1,
    successfulTools: 1,
    failedTools: 0
  },
  toolResults: [
    {
      toolName: "searchWeb",
      success: true,
      data: "[search results]"
    }
  ]
}
```

### Example 2: No Tools Needed

**Query:** "Explain quantum entanglement"

**Response:**
```javascript
{
  answer: "Sir, quantum entanglement is a fascinating phenomenon...",
  functionCallingUsed: false,
  toolsUsed: [],
  toolsInfo: null
}
```

### Example 3: Multiple Tools

**Query:** "Convert 100 USD to INR and tell me the current weather in New York"

**Response:**
```javascript
{
  answer: "Sir, let me provide you with both pieces of information...",
  functionCallingUsed: true,
  toolsUsed: ["calculateMath", "getWeather"],
  toolsInfo: {
    totalToolsCalled: 2,
    successfulTools: 2,
    failedTools: 0
  },
  toolResults: [
    { toolName: "calculateMath", success: true, data: "Result: 8300 INR" },
    { toolName: "getWeather", success: true, data: "New York: 15°C, Rainy" }
  ]
}
```

---

## Debugging & Monitoring

### Console Output

```
🔧 Checking if Function Calling is needed...
✅ Function Calling TRIGGERED - Executing tools...
⏳ Executing: searchWeb with params: { query: "latest AI news" }
✅ searchWeb completed successfully
🔗 [FUNCTION CALLING] Integrating tool results into response...
✅ Function Calling Complete - Tools: searchWeb
```

### Check Tool Execution History

The engine maintains `toolExecutionHistory`:

```javascript
functionCallingEngine.toolExecutionHistory
// Returns: [
//   {
//     tool: "searchWeb",
//     params: { query: "..." },
//     success: true,
//     timestamp: Date
//   },
//   ...
// ]
```

---

## Configuration & Tuning

### Tool Thresholds

Can be customized in `function-calling-engine.js`:

```javascript
this.toolExecutionOptions = {
    maxRetries: 2,                    // Retry failed tools
    timeoutMs: 10000,                 // Timeout per tool
    allowParallel: false,             // Execute tools sequentially
    requireConfidence: 0.7            // Min confidence to execute
};
```

### Disabling Tools

Comment out tools in `defineTools()`:

```javascript
// Disable specific tool
// getWeather: { ... }
```

### Adding New Tools

Template in `function-calling-engine.js`:

```javascript
newTool: {
    name: 'newTool',
    description: 'What this tool does',
    category: 'category_name',
    requiredParameters: ['param1'],
    optionalParameters: ['param2'],
    schema: { ... },
    execute: this.executeNewTool.bind(this)
}

async executeNewTool(params) {
    // Implementation
    return result;
}
```

---

## Performance Metrics

### Typical Execution Times

| Phase | Time |
|-------|------|
| Tool Analysis (LLM) | 1-2 seconds |
| Tool Execution | 0.5-3 seconds |
| Result Integration (LLM) | 2-3 seconds |
| **Total** | **3-8 seconds** |

### Resource Usage

- **Memory per engine:** ~50MB
- **Concurrent tools:** Sequential (1 at a time)
- **API calls:** 1-2 per query (tool decision + integration)

---

## Error Handling

### Graceful Degradation

If a tool fails:
1. Error is logged
2. Tool marked as failed
3. Other tools continue
4. Response includes failure status
5. Fallback answer provided

**Example:**
```
Tool Failure:
searchWeb → API timeout → Tool marked as failed
Result Integration:
"Sir, I attempted to search the web but encountered an issue. 
Here's what I know from my knowledge base..."
```

---

## Future Enhancements

### Planned Tools (v2.0)
- 📞 Call external APIs
- 📧 Send emails
- 💾 Database queries
- 🗂️ File operations
- 🔐 Authentication flows
- 📱 SMS notifications

### Advanced Features
- Tool chaining (tools calling other tools)
- Conditional tool execution
- User-defined tools
- Tool caching
- Performance optimization

---

## Best Practices

### For Users (Queries)
✅ Be specific with requirements
✅ Include relevant context
✅ Ask for real-time data when needed
✅ Specify units/formats

### For Developers
✅ Monitor tool execution logs
✅ Handle errors gracefully
✅ Cache tool results when possible
✅ Validate tool outputs
✅ Test new tools thoroughly

---

## Troubleshooting

### Tool not being called

**Check:**
1. Tool is in `defineTools()`
2. Engine is initialized
3. Query matches tool criteria
4. GROQ_API_KEY is set

### Tool execution failing

**Check:**
1. Required parameters provided
2. Parameter types are correct
3. External API is available
4. Network connection is stable

### Slow tool execution

**Check:**
1. API response times
2. Network latency
3. Tool implementation efficiency
4. Concurrent load

---

## Summary

The Function Calling Engine transforms JARVIS from a static knowledge system into a **dynamic, tool-enabled AI** that can:

✅ Automatically decide what tools to use
✅ Execute tools intelligently
✅ Integrate results seamlessly
✅ Provide real-time information
✅ Maintain professional responses

With **10 pre-built tools** and an extensible architecture, Function Calling is ready for production deployment!

---

**Status:** ✅ PRODUCTION READY
**Version:** 1.0
**Last Updated:** January 19, 2026

