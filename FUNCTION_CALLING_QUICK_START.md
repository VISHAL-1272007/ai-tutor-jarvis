# 🔧 FUNCTION CALLING - QUICK START & TESTING GUIDE

## Setup & Deployment

### 1. Verify Installation

```bash
# Check Function Calling Engine exists
ls backend/function-calling-engine.js

# Should output: function-calling-engine.js
```

### 2. Backend Startup

```bash
cd backend
npm install  # If needed
npm start

# Expected output:
# ✅ Function Calling Engine initialized with 10 tools
```

### 3. Test the Endpoint

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What time is it?"}'
```

---

## Test Cases

### ✅ Test 1: Tool Not Needed (Knowledge Base Query)

**Query:**
```json
{
  "question": "Explain quantum computing"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, quantum computing is a revolutionary paradigm...",
  functionCallingUsed: false,
  toolsUsed: [],
  toolsInfo: null
}
```

**What it shows:**
- Engine correctly identified this as educational (no tools needed)
- Response came from knowledge base
- No tool execution occurred

---

### ✅ Test 2: getCurrentTime Tool

**Query:**
```json
{
  "question": "What is the current time in IST?"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, the current time is...",
  functionCallingUsed: true,
  toolsUsed: ["getCurrentTime"],
  toolsInfo: {
    totalToolsCalled: 1,
    successfulTools: 1,
    failedTools: 0
  },
  toolResults: [
    {
      toolName: "getCurrentTime",
      success: true,
      data: "Current Date & Time (IST): 1/19/2026, 10:30:45 AM"
    }
  ]
}
```

**What it shows:**
- getCurrentTime tool was automatically selected
- Tool executed successfully
- Result integrated into response
- Metadata shows 1 tool called, 1 successful

---

### ✅ Test 3: calculateMath Tool

**Query:**
```json
{
  "question": "Calculate sqrt(144) plus 5 times 3"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, let me calculate that for you. The square root of 144 is 12, and 5 times 3 is 15. So the total would be 27.",
  functionCallingUsed: true,
  toolsUsed: ["calculateMath"],
  toolsInfo: {
    totalToolsCalled: 1,
    successfulTools: 1,
    failedTools: 0
  }
}
```

**What it shows:**
- calculateMath tool was selected
- Mathematical expression evaluated
- Result formatted professionally

---

### ✅ Test 4: listTools (Meta Tool)

**Query:**
```json
{
  "question": "What tools are available?"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, here are all the available tools:\n\n**searchWeb**: Search the web...\n**getSystemInfo**: Retrieve system information...\n...",
  functionCallingUsed: true,
  toolsUsed: ["listTools"],
  toolsInfo: {
    totalToolsCalled: 1,
    successfulTools: 1,
    failedTools: 0
  }
}
```

**What it shows:**
- listTools (meta tool) displays all available tools
- Comprehensive tool documentation returned
- User can discover available capabilities

---

### ✅ Test 5: getSystemInfo Tool

**Query:**
```json
{
  "question": "How much memory does the server have?"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, based on the current system information, the server has a total memory of X.XX GB with Y.YY GB currently available...",
  functionCallingUsed: true,
  toolsUsed: ["getSystemInfo"],
  toolsInfo: {
    totalToolsCalled: 1,
    successfulTools: 1,
    failedTools: 0
  }
}
```

**What it shows:**
- System introspection tool works
- Server metrics retrieved
- Infrastructure monitoring capability

---

### ⚠️ Test 6: Failed Tool Execution (Graceful Degradation)

**Query:**
```json
{
  "question": "What is the weather on Mars?"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, I attempted to retrieve weather data, but Mars is beyond the scope of current weather services. However, I can tell you that based on NASA data...",
  functionCallingUsed: true,
  toolsUsed: ["getWeather"],
  toolsInfo: {
    totalToolsCalled: 1,
    successfulTools: 0,
    failedTools: 1
  },
  toolResults: [
    {
      toolName: "getWeather",
      success: false,
      error: "Weather data not available for Mars"
    }
  ]
}
```

**What it shows:**
- Tool was attempted
- Tool failed gracefully
- Fallback response provided
- Error tracking in metadata

---

### ✅ Test 7: Multiple Tools Execution

**Query:**
```json
{
  "question": "What time is it and what's 100 plus 200?"
}
```

**Expected Response:**
```javascript
{
  answer: "Sir, the current time is [TIME] and 100 plus 200 equals 300.",
  functionCallingUsed: true,
  toolsUsed: ["getCurrentTime", "calculateMath"],
  toolsInfo: {
    totalToolsCalled: 2,
    successfulTools: 2,
    failedTools: 0
  },
  toolResults: [
    {
      toolName: "getCurrentTime",
      success: true,
      data: "..."
    },
    {
      toolName: "calculateMath",
      success: true,
      data: "Result: 300"
    }
  ]
}
```

**What it shows:**
- Multiple tools can be called
- Results integrated together
- Metadata tracks all tools

---

## Manual Testing via cURL

### Test getCurrentTime

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What time is it now?"}'
```

### Test calculateMath

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Calculate 2 to the power of 10"}'
```

### Test listTools

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"List all available tools"}'
```

### Test Educational Query (No Tools)

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Explain the concept of OOP in programming"}'
```

---

## Console Log Monitoring

Watch the backend console for Function Calling execution:

### Successful Tool Call

```
🔧 Checking if Function Calling is needed...
✅ Function Calling TRIGGERED - Executing tools...
📋 Tools to Call: getCurrentTime
⚙️ [FUNCTION CALLING] Executing 1 tool(s)...
⏳ Executing: getCurrentTime with params: { timezone: 'IST', format: 'full' }
✅ getCurrentTime completed successfully
🔗 [FUNCTION CALLING] Integrating tool results into response...
✅ Tool results integrated into final response
✅ FUNCTION CALLING PIPELINE COMPLETE
```

### No Tools Needed

```
🔧 Checking if Function Calling is needed...
ℹ️ No tools required for this query
```

### Tool Execution Error

```
🔧 Checking if Function Calling is needed...
✅ Function Calling TRIGGERED - Executing tools...
📋 Tools to Call: getWeather
⚙️ [FUNCTION CALLING] Executing 1 tool(s)...
⏳ Executing: getWeather with params: { location: 'Mars' }
❌ getWeather execution failed: Weather data not available for Mars
⚠️ Function Calling error: [error message], continuing without tools
```

---

## Response Structure

### When Tools Are Used

```javascript
{
  // Main response
  answer: "Sir, here is the information...",
  
  // Query classification
  queryType: "general",
  expertMode: "JARVIS (Just A Rather Very Intelligent System)",
  
  // Function Calling metadata
  functionCallingUsed: true,
  toolsUsed: ["searchWeb", "calculateMath"],
  toolResults: [
    {
      toolName: "searchWeb",
      success: true,
      data: "...",
      timestamp: "2026-01-19T10:30:00.000Z"
    },
    ...
  ],
  toolsInfo: {
    totalToolsCalled: 2,
    successfulTools: 2,
    failedTools: 0
  },
  
  // Web search (if also used)
  webSearchUsed: false,
  sources: null,
  
  // RAG Pipeline (if used)
  ragPipelineUsed: false,
  quality: "KNOWLEDGE_BASE",
  
  // Suggestions
  followUpSuggestions: [...]
}
```

### When No Tools Are Used

```javascript
{
  answer: "Sir, here is the information from my knowledge base...",
  queryType: "general",
  expertMode: "JARVIS",
  functionCallingUsed: false,
  toolsUsed: [],
  toolResults: [],
  toolsInfo: null,
  webSearchUsed: false,
  followUpSuggestions: [...]
}
```

---

## Debugging Commands

### Check if Engine is Initialized

Backend will show during startup:
```
🔧 Function Calling Engine initialized with 10 tools
```

### Verify Tool Availability

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What tools do I have available?"}'
```

### Monitor Real-Time Execution

```bash
# In another terminal, watch backend logs
tail -f backend_output.log | grep -i "function"
```

---

## Common Test Queries

### Category: Time/Date
```
- "What time is it?"
- "What's the current date?"
- "Tell me the time in UTC"
```

### Category: Calculation
```
- "Calculate 2^10"
- "What's 99 * 75?"
- "Solve: sqrt(256) / 2"
```

### Category: System Info
```
- "How much RAM does this server have?"
- "What's the CPU info?"
- "Check server uptime"
```

### Category: No Tools (Educational)
```
- "Explain machine learning"
- "Teach me about AI"
- "What is quantum physics?"
```

### Category: Mixed Queries
```
- "What time is it and calculate 2+2?"
- "Get system memory and the current time"
```

---

## Performance Benchmarks

### Expected Response Times

| Query Type | Tool Execution | LLM Response | Total |
|-----------|-----------------|--------------|-------|
| No tools needed | ~0ms | 1-2s | 1-2s |
| 1 simple tool | 0.5-1s | 1-2s | 1.5-3s |
| 2 tools | 1-2s | 2-3s | 3-5s |
| Complex tool | 2-3s | 2-3s | 4-6s |

---

## Deployment Checklist

- [ ] Function Calling Engine created (`function-calling-engine.js`)
- [ ] Import added to `backend/index.js`
- [ ] Engine initialized in startup code
- [ ] Integration added to `/ask` endpoint
- [ ] Response metadata includes tool info
- [ ] Error handling verified
- [ ] Console logging works
- [ ] All test cases pass
- [ ] Documentation complete
- [ ] Git committed and pushed

---

## Troubleshooting

### Issue: "Function Calling Engine not initialized"

**Solution:**
```bash
# Check GROQ_API_KEY is set
echo $GROQ_API_KEY

# If empty:
export GROQ_API_KEY="your_key_here"
# Or add to backend/.env
```

### Issue: Tools always return "No tools needed"

**Check:**
1. LLM is able to analyze queries
2. Query contains keywords that suggest tool use
3. Tool analysis prompt is correct

### Issue: Tool execution timeout

**Solution:**
- Increase timeout in function-calling-engine.js
- Check network connectivity
- Verify external API availability

### Issue: Tool results not in response

**Solution:**
1. Check `functionCallingUsed` is true
2. Verify tool execution succeeded
3. Check integration logic in index.js

---

## Production Considerations

### Scalability
- ✅ Tools execute sequentially (no concurrent issues)
- ✅ Thread-safe API calls
- ✅ Error handling prevents cascading failures

### Monitoring
- Log all tool executions
- Track tool success/failure rates
- Monitor average response times
- Alert on repeated failures

### Performance
- Cache tool results for frequent queries
- Implement tool timeout policies
- Use parallel execution for independent tools
- Monitor API rate limits

### Security
- Validate all tool parameters
- Sanitize external inputs
- Limit code execution scope
- Track API keys securely

---

## Advanced Usage

### Custom Tool Configuration

In `function-calling-engine.js`:

```javascript
// Adjust tool execution options
this.toolExecutionOptions = {
    maxRetries: 3,
    timeoutMs: 15000,
    allowParallel: true,
    requireConfidence: 0.8
};
```

### Monitoring Tool Usage

```javascript
// Access execution history
console.log(functionCallingEngine.toolExecutionHistory);

// Returns: [{tool, params, success, timestamp}, ...]
```

### Extending with New Tools

Add to `defineTools()`:

```javascript
myCustomTool: {
    name: 'myCustomTool',
    description: 'My custom functionality',
    category: 'custom',
    requiredParameters: ['param1'],
    schema: { ... },
    execute: this.executeMyCustomTool.bind(this)
}
```

---

## Summary

The Function Calling Engine is now:
- ✅ Fully implemented with 10 tools
- ✅ Integrated into the /ask endpoint
- ✅ Automatically deciding when to use tools
- ✅ Executing tools and integrating results
- ✅ Maintaining professional responses
- ✅ Production-ready

**Start testing now!** 🚀

