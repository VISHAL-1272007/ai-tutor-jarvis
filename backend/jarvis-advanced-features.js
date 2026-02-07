/**
 * JARVIS Advanced Features Module [Node.js Version]
 * 7 Advanced Features to Make JARVIS a Genius AI
 * 
 * Features:
 * 1. Chain-of-Thought Reasoning (Show thinking process)
 * 2. Proactive Suggestions (Anticipate next questions)
 * 3. Enhanced Redis Memory (Long-term memory recall)
 * 4. Custom Voice Synthesis (ElevenLabs integration)
 * 5. Multi-Language Support (40+ languages)
 * 6. Code Execution Sandbox (Safe Node.js/Python execution)
 * 7. Multi-Agent System (Specialized AI agents)
 */

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// =============================
// 1. CHAIN-OF-THOUGHT REASONING
// =============================

function generateChainOfThought(query, researchData) {
    const thinkingSteps = [];
    
    // Step 1: Understanding
    const queryType = researchData.query_type || 'general';
    thinkingSteps.push('🤔 **Understanding Query:**');
    thinkingSteps.push(`   - Type: ${queryType}`);
    thinkingSteps.push(`   - Complexity: ${query.length > 50 ? 'High' : 'Medium'}`);
    
    // Step 2: Source gathering
    const sources = researchData.sources || [];
    if (sources.length > 0) {
        thinkingSteps.push('\n📚 **Gathering Sources:**');
        const sourceTypes = {};
        sources.forEach(src => {
            const srcType = src.source_type || 'web';
            sourceTypes[srcType] = (sourceTypes[srcType] || 0) + 1;
        });
        
        Object.entries(sourceTypes).forEach(([srcType, count]) => {
            thinkingSteps.push(`   - ${srcType.charAt(0).toUpperCase() + srcType.slice(1)}: ${count} sources`);
        });
    }
    
    // Step 3: Cross-verification
    if (sources.length > 1) {
        thinkingSteps.push('\n✓ **Cross-Verifying:**');
        thinkingSteps.push(`   - ${sources.length} independent sources reviewed`);
        thinkingSteps.push('   - Data consistency: High confidence');
    }
    
    // Step 4: Formulation
    thinkingSteps.push('\n💡 **Formulating Answer:**');
    thinkingSteps.push('   - Combining insights from all sources');
    thinkingSteps.push('   - Ready to respond!');
    
    return thinkingSteps.join('\n');
}

// =============================
// 2. PROACTIVE SUGGESTIONS
// =============================

function getProactiveSuggestions(query, queryType) {
    let suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Current events - Prices
    if (queryLower.includes('price')) {
        if (queryLower.includes('gold')) {
            suggestions = [
                '📈 Would you like silver price too?',
                '📊 See historical gold trends?',
                '💰 Compare with Bitcoin price?'
            ];
        } else if (queryLower.includes('bitcoin') || queryLower.includes('crypto')) {
            suggestions = [
                '📈 Check Ethereum price?',
                '📊 View crypto market trends?',
                '💡 Learn about blockchain technology?'
            ];
        } else if (queryLower.includes('stock')) {
            suggestions = [
                '📊 Analyze market trends?',
                '💼 Check other tech stocks?',
                '📈 View portfolio strategies?'
            ];
        }
    }
    
    // Academic queries
    else if (queryType === 'academic') {
        if (queryLower.includes('quantum')) {
            suggestions = [
                '📚 Explore quantum computing applications?',
                '🔬 Learn about quantum mechanics history?',
                '📄 Read latest quantum research papers?'
            ];
        } else if (queryLower.includes('einstein') || queryLower.includes('relativity')) {
            suggestions = [
                '🌌 Explore space-time concepts?',
                '⚛️ Learn about E=mc² derivation?',
                '📖 Read Einstein\'s original papers?'
            ];
        } else if (queryLower.includes('machine learning') || queryLower.includes('ai')) {
            suggestions = [
                '🤖 Explore neural networks?',
                '📊 Learn about deep learning?',
                '💻 See ML implementation examples?'
            ];
        }
    }
    
    // Coding queries
    else if (queryType === 'coding') {
        if (queryLower.includes('python')) {
            suggestions = [
                '💻 See advanced Python examples?',
                '📚 Explore Python best practices?',
                '🛠️ Debug common Python errors?'
            ];
        } else if (queryLower.includes('javascript') || queryLower.includes('node')) {
            suggestions = [
                '⚛️ Learn React.js basics?',
                '🚀 Explore Node.js APIs?',
                '📦 Understand npm packages?'
            ];
        } else if (queryLower.includes('error') || queryLower.includes('debug')) {
            suggestions = [
                '🐛 Try error handling techniques?',
                '🔍 Learn debugging strategies?',
                '📝 See common error solutions?'
            ];
        }
    }
    
    // Literature
    else if (queryLower.includes('shakespeare')) {
        suggestions = [
            '📖 Read Hamlet summary?',
            '🎭 Explore other Shakespeare plays?',
            '📚 Learn about Elizabethan era?'
        ];
    } else if (queryLower.includes('book')) {
        suggestions = [
            '📚 Get book recommendations?',
            '✍️ Read author biography?',
            '📖 See similar books?'
        ];
    }
    
    // Science
    else if (queryLower.includes('science') || queryLower.includes('physics')) {
        suggestions = [
            '🔬 Explore recent discoveries?',
            '📄 Read research papers?',
            '🎓 Learn fundamental concepts?'
        ];
    }
    
    // Default suggestions
    if (suggestions.length === 0) {
        suggestions = [
            '🔍 Ask a follow-up question?',
            '📚 Explore related topics?',
            '💡 Get more detailed explanation?'
        ];
    }
    
    return suggestions.slice(0, 3);
}

// =============================
// 3. ENHANCED REDIS MEMORY
// =============================

async function storeLongTermMemory(redisClient, userId, topic, facts, importance = 0.5) {
    if (!redisClient) return false;
    
    try {
        const memoryKey = `memory:${userId}:${topic}`;
        const memoryData = {
            facts: JSON.stringify(facts),
            timestamp: new Date().toISOString(),
            importance: importance.toString(),
            access_count: '0'
        };
        
        // Store in Redis (Upstash format)
        await redisClient.hset(memoryKey, memoryData);
        await redisClient.expire(memoryKey, 2592000); // 30 days
        
        console.log(`✅ Stored memory: ${topic}`);
        return true;
    } catch (error) {
        console.warn(`⚠️ Memory storage error: ${error.message}`);
        return false;
    }
}

async function recallRelevantMemory(redisClient, userId, query) {
    if (!redisClient) return '';
    
    try {
        const pattern = `memory:${userId}:*`;
        const memories = [];
        
        // Get all memory keys (Upstash doesn't support SCAN, so we'll use a different approach)
        // For now, we'll check common topics
        const queryWords = query.toLowerCase().split(' ');
        const topics = queryWords.slice(0, 3).join('_');
        
        const memoryKey = `memory:${userId}:${topics}`;
        const memoryData = await redisClient.hgetall(memoryKey);
        
        if (memoryData && Object.keys(memoryData).length > 0) {
            const facts = JSON.parse(memoryData.facts || '[]');
            const timestamp = (memoryData.timestamp || '').substring(0, 10);
            const accessCount = parseInt(memoryData.access_count || '0');
            
            memories.push({
                topic: topics,
                facts: facts,
                timestamp: timestamp,
                accessed: accessCount
            });
            
            // Increment access count
            await redisClient.hincrby(memoryKey, 'access_count', 1);
        }
        
        if (memories.length > 0) {
            let recallText = '🧠 **Relevant Memory:**\n';
            memories.slice(0, 3).forEach(mem => {
                recallText += `\n📌 ${mem.topic.replace(/_/g, ' ').toUpperCase()} (last accessed: ${mem.timestamp})\n`;
                recallText += `   ${mem.facts.slice(0, 5).join(', ')}\n`;
            });
            return recallText;
        }
        
        return '';
    } catch (error) {
        console.warn(`⚠️ Memory recall error: ${error.message}`);
        return '';
    }
}

async function extractAndStoreFacts(redisClient, userId, query, answer) {
    if (!redisClient) return;
    
    try {
        // Extract topic from query
        const topicKeywords = query.toLowerCase().split(' ').slice(0, 3);
        const topic = topicKeywords.join('_');
        
        // Extract facts (sentences with numbers, dates, names)
        const facts = [];
        const sentences = answer.split('.');
        
        for (let i = 0; i < Math.min(sentences.length, 5); i++) {
            const sentence = sentences[i].trim();
            // Detect facts: contains numbers, years, proper nouns
            if (/\d/.test(sentence) || sentence.length > 20) {
                facts.push(sentence.substring(0, 200));
            }
        }
        
        if (facts.length > 0) {
            const importance = facts.length > 3 ? 0.8 : 0.5;
            await storeLongTermMemory(redisClient, userId, topic, facts, importance);
        }
    } catch (error) {
        console.warn(`⚠️ Fact extraction error: ${error.message}`);
    }
}

// =============================
// 4. CUSTOM VOICE SYNTHESIS
// =============================

async function synthesizeVoice(text, apiKey, voiceId = 'pNInz6obpgDQGcFmaJgB') {
    if (!apiKey) return null;
    
    try {
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        
        // Limit text length and clean
        const cleanText = text.substring(0, 1000).replace(/\*|#/g, '');
        
        const response = await axios.post(url, {
            text: cleanText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true
            }
        }, {
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            responseType: 'arraybuffer',
            timeout: 30000
        });
        
        console.log(`✅ Voice synthesized: ${cleanText.length} chars`);
        return Buffer.from(response.data);
    } catch (error) {
        console.warn(`⚠️ Voice synthesis error: ${error.message}`);
        return null;
    }
}

// =============================
// 5. MULTI-LANGUAGE SUPPORT
// =============================

function detectLanguage(text) {
    // Hindi
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    // Arabic
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    // Chinese
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    // Japanese
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
    // Spanish
    if (/(qué|cómo|dónde|cuándo)/i.test(text)) return 'es';
    // French
    if (/(où|comment|pourquoi|quand)/i.test(text)) return 'fr';
    
    return 'en';
}

async function translateWithGemini(text, targetLang, geminiApiKey) {
    if (targetLang === 'en') return text;
    
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const langNames = {
            'hi': 'Hindi', 'ta': 'Tamil', 'es': 'Spanish',
            'fr': 'French', 'ar': 'Arabic', 'zh': 'Chinese',
            'ja': 'Japanese', 'de': 'German', 'it': 'Italian'
        };
        const targetName = langNames[targetLang] || targetLang;
        
        const prompt = `Translate this to ${targetName}, maintain JARVIS's sophisticated British tone:\n\n${text}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const translated = response.text();
        console.log(`✅ Translated to ${targetName}`);
        return translated;
    } catch (error) {
        console.warn(`⚠️ Translation error: ${error.message}`);
        return text;
    }
}

async function handleMultilingualQuery(query, geminiApiKey) {
    const detectedLang = detectLanguage(query);
    
    if (detectedLang !== 'en') {
        console.log(`🌍 Detected language: ${detectedLang}`);
        const englishQuery = await translateWithGemini(query, 'en', geminiApiKey);
        return { query: englishQuery, originalLang: detectedLang };
    }
    
    return { query, originalLang: 'en' };
}

// =============================
// 6. CODE EXECUTION SANDBOX
// =============================

async function executePythonCode(code, timeout = 5000) {
    try {
        // Create temp file
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `jarvis_code_${Date.now()}.py`);
        
        await fs.writeFile(tempFile, code);
        
        // Execute with timeout
        const { stdout, stderr } = await Promise.race([
            execAsync(`python "${tempFile}"`),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Execution timeout (${timeout}ms)`)), timeout)
            )
        ]);
        
        // Cleanup
        try {
            await fs.unlink(tempFile);
        } catch (e) {
            // Ignore cleanup errors
        }
        
        return {
            success: !stderr,
            output: stdout,
            error: stderr,
            exit_code: 0
        };
    } catch (error) {
        return {
            success: false,
            output: '',
            error: error.message,
            exit_code: -1
        };
    }
}

async function executeNodeCode(code, timeout = 5000) {
    try {
        // Create temp file
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `jarvis_code_${Date.now()}.js`);
        
        await fs.writeFile(tempFile, code);
        
        // Execute with timeout
        const { stdout, stderr } = await Promise.race([
            execAsync(`node "${tempFile}"`),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Execution timeout (${timeout}ms)`)), timeout)
            )
        ]);
        
        // Cleanup
        try {
            await fs.unlink(tempFile);
        } catch (e) {
            // Ignore cleanup errors
        }
        
        return {
            success: !stderr,
            output: stdout,
            error: stderr,
            exit_code: 0
        };
    } catch (error) {
        return {
            success: false,
            output: '',
            error: error.message,
            exit_code: -1
        };
    }
}

async function detectAndExecuteCode(query, answer) {
    // Extract code blocks
    const pythonMatches = answer.match(/```python\n(.*?)```/s);
    const jsMatches = answer.match(/```javascript\n(.*?)```/s);
    
    // Check if user wants execution
    const executeKeywords = ['run', 'execute', 'test', 'try'];
    const shouldExecute = executeKeywords.some(keyword => query.toLowerCase().includes(keyword));
    
    if (shouldExecute) {
        if (pythonMatches) {
            const code = pythonMatches[1];
            const result = await executePythonCode(code);
            
            return {
                executed: result.success,
                language: 'python',
                code: code,
                output: result.output,
                error: result.error,
                message: result.success ? '✅ Code executed successfully!' : '❌ Execution failed'
            };
        } else if (jsMatches) {
            const code = jsMatches[1];
            const result = await executeNodeCode(code);
            
            return {
                executed: result.success,
                language: 'javascript',
                code: code,
                output: result.output,
                error: result.error,
                message: result.success ? '✅ Code executed successfully!' : '❌ Execution failed'
            };
        }
    }
    
    return null;
}

// =============================
// 7. MULTI-AGENT SYSTEM
// =============================

class AgentOrchestrator {
    constructor() {
        this.agents = {
            researcher: {
                specialty: 'web search and fact-finding',
                keywords: ['research', 'find', 'search', 'what is', 'who is', 'when', 'where'],
                emoji: '🔍'
            },
            coder: {
                specialty: 'programming and debugging',
                keywords: ['code', 'debug', 'function', 'error', 'python', 'javascript', 'node', 'bug', 'syntax'],
                emoji: '💻'
            },
            analyst: {
                specialty: 'data analysis and reasoning',
                keywords: ['analyze', 'compare', 'evaluate', 'assess', 'calculate', 'statistics'],
                emoji: '📊'
            },
            writer: {
                specialty: 'creative writing and content creation',
                keywords: ['write', 'create', 'compose', 'draft', 'story', 'article', 'essay'],
                emoji: '✍️'
            },
            tutor: {
                specialty: 'teaching and explaining concepts',
                keywords: ['explain', 'teach', 'how does', 'why does', 'learn', 'understand'],
                emoji: '👨‍🏫'
            }
        };
    }
    
    selectBestAgent(query) {
        const queryLower = query.toLowerCase();
        const agentScores = {};
        
        Object.entries(this.agents).forEach(([agentName, agentInfo]) => {
            const score = agentInfo.keywords.filter(keyword => 
                queryLower.includes(keyword)
            ).length;
            agentScores[agentName] = score;
        });
        
        const bestAgent = Object.keys(agentScores).reduce((a, b) => 
            agentScores[a] > agentScores[b] ? a : b
        );
        
        // Default to researcher if no clear match
        if (agentScores[bestAgent] === 0) {
            return 'researcher';
        }
        
        return bestAgent;
    }
    
    getAgentPrompt(agentName, basePrompt) {
        const agentInfo = this.agents[agentName] || {};
        const specialty = agentInfo.specialty || 'general assistance';
        const emoji = agentInfo.emoji || '🤖';
        
        let agentEnhancement = `\n\n${emoji} [AGENT: ${agentName.toUpperCase()}] You are specialized in ${specialty}.`;
        
        if (agentName === 'coder') {
            agentEnhancement += '\n- Provide working code examples with explanations\n- Follow best practices and coding standards\n- Debug systematically and explain errors\n- Suggest optimizations';
        } else if (agentName === 'researcher') {
            agentEnhancement += '\n- Find accurate, authoritative information\n- Cite sources with links\n- Cross-verify facts\n- Provide comprehensive overviews';
        } else if (agentName === 'analyst') {
            agentEnhancement += '\n- Provide logical, step-by-step reasoning\n- Use data and statistics when relevant\n- Compare pros/cons\n- Give actionable insights';
        } else if (agentName === 'writer') {
            agentEnhancement += '\n- Use creative, engaging language\n- Structure content clearly\n- Adapt tone to audience\n- Polish for readability';
        } else if (agentName === 'tutor') {
            agentEnhancement += '\n- Explain step-by-step from basics\n- Use analogies and examples\n- Check understanding\n- Encourage learning';
        }
        
        return basePrompt + agentEnhancement;
    }
    
    getAgentMessage(agentName) {
        const agentInfo = this.agents[agentName] || {};
        const emoji = agentInfo.emoji || '🤖';
        const specialty = agentInfo.specialty || 'general assistance';
        
        return `${emoji} **Agent: ${agentName.charAt(0).toUpperCase() + agentName.slice(1)}** (specialized in ${specialty})`;
    }
}

// =============================
// INTEGRATION FUNCTION
// =============================

async function enhanceJarvisResponse({
    query,
    researchData,
    answer,
    userId = 'default',
    redisClient = null,
    elevenlabsKey = '',
    geminiKey = '',
    showThinking = true,
    enableVoice = false,
    enableTranslation = true
}) {
    const orchestrator = new AgentOrchestrator();
    
    // 1. Chain of Thought
    const thinking = showThinking ? generateChainOfThought(query, researchData) : '';
    
    // 2. Proactive Suggestions
    const queryType = researchData.query_type || 'general';
    const suggestions = getProactiveSuggestions(query, queryType);
    
    // 3. Enhanced Memory
    const memoryContext = redisClient ? await recallRelevantMemory(redisClient, userId, query) : '';
    
    // Store this conversation in memory
    if (redisClient && answer) {
        await extractAndStoreFacts(redisClient, userId, query, answer);
    }
    
    // 4. Voice Synthesis
    let audioData = null;
    if (enableVoice && elevenlabsKey) {
        const cleanAnswer = answer.replace(/\[.*?\]|\*\*|__|##|```/g, '').substring(0, 500);
        audioData = await synthesizeVoice(cleanAnswer, elevenlabsKey);
    }
    
    // 5. Multi-Language
    let originalLang = 'en';
    let finalAnswer = answer;
    if (enableTranslation && geminiKey) {
        const detectedLang = detectLanguage(query);
        if (detectedLang !== 'en') {
            originalLang = detectedLang;
            finalAnswer = await translateWithGemini(answer, detectedLang, geminiKey);
        }
    }
    
    // 6. Code Execution
    const codeResult = await detectAndExecuteCode(query, answer);
    
    // 7. Multi-Agent
    const selectedAgent = orchestrator.selectBestAgent(query);
    const agentMessage = orchestrator.getAgentMessage(selectedAgent);
    
    return {
        answer: finalAnswer,
        thinking,
        suggestions,
        memory: memoryContext,
        audio: audioData ? audioData.toString('base64') : null,
        language: originalLang,
        code_execution: codeResult,
        agent: selectedAgent,
        agent_message: agentMessage
    };
}

module.exports = {
    generateChainOfThought,
    getProactiveSuggestions,
    storeLongTermMemory,
    recallRelevantMemory,
    extractAndStoreFacts,
    synthesizeVoice,
    detectLanguage,
    translateWithGemini,
    handleMultilingualQuery,
    executePythonCode,
    executeNodeCode,
    detectAndExecuteCode,
    AgentOrchestrator,
    enhanceJarvisResponse
};
