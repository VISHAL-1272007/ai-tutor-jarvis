/**
 * ===== JARVIS AUTONOMOUS RAG (RETRIEVAL-AUGMENTED GENERATION) =====
 * Three-Step Verified Search Pipeline:
 * 1. Search: Fetch top 5 results via google-it
 * 2. Judge: Verify facts using Groq (Llama 4 Maverick) with 0.0 temperature
 * 3. Communicate: Synthesize response using Groq (GPT-OSS-120B) with 0.7 temperature
 * 
 * Author: JARVIS Development Team
 * Date: January 2026
 */

const Groq = require('groq-sdk');
const googleIt = require('google-it');

// ===== INITIALIZATION =====

/**
 * Verifier Client - Strict Fact-Check Judge (Llama 4 Maverick)
 * Uses specific API key with 0.0 temperature for deterministic accuracy
 */
const verifierGroq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Chat Client - Friendly Response Generator (GPT-OSS-120B)
 * Uses environment variable for API key with 0.7 temperature for natural tone
 */
const chatGroq = new Groq({
    apiKey: process.env.GROQ_CHAT_KEY || process.env.GROQ_API_KEY
});

// ===== UTILITY FUNCTIONS =====

/**
 * Format search results into a readable context string
 * @param {Array} results - Array of search result objects from google-it
 * @returns {String} Formatted string with Title, Snippet, and URL
 */
function formatSearchResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
        return 'No search results found.';
    }

    return results
        .slice(0, 5) // Keep top 5 results
        .map((result, index) => {
            const title = result.title || 'No Title';
            const snippet = result.description || result.snippet || 'No snippet available';
            const url = result.link || result.url || 'No URL';
            return `[Result ${index + 1}]\nTitle: ${title}\nSnippet: ${snippet}\nURL: ${url}`;
        })
        .join('\n\n');
}

/**
 * Extract URLs from search results for citation
 * @param {Array} results - Array of search result objects
 * @returns {Array} Array of URLs
 */
function extractUrls(results) {
    return (results || [])
        .slice(0, 5)
        .map(r => r.link || r.url)
        .filter(Boolean);
}

// ===== MAIN PIPELINE =====

/**
 * JARVIS Autonomous Verified Search Pipeline
 * 
 * Step 1: Search with google-it
 * Step 2: Verify facts with Groq Judge (llama3-70b, temp=0.0)
 * Step 3: Synthesize response with Groq Chat (llama3-8b, temp=0.7)
 * 
 * @param {String} query - User's search query
 * @returns {Promise<Object>} { answer, sources, verified, model, fallback }
 */
async function jarvisAutonomousVerifiedSearch(query) {
    try {
        console.log(`🚀 [JARVIS RAG] Starting verified search for: "${query}"`);

        // ===== STEP 1: SEARCH =====
        console.log(`📡 [JARVIS RAG] Step 1: Fetching search results...`);
        let searchResults = [];
        
        try {
            searchResults = await googleIt({ query });
            console.log(`✅ [JARVIS RAG] Found ${searchResults.length} results`);
        } catch (searchError) {
            console.warn(`⚠️ [JARVIS RAG] Search failed: ${searchError.message}`);
            // Return early with raw results fallback
            return {
                answer: 'Note: Showing raw search results due to search timeout.',
                sources: [],
                verified: false,
                fallback: true,
                rawResults: searchResults.slice(0, 5).map(r => `${r.title}\n${r.description}\n${r.link}`).join('\n\n')
            };
        }

        // Format search results for the Judge
        const formattedResults = formatSearchResults(searchResults);
        const sourceUrls = extractUrls(searchResults);

        // ===== STEP 2: THE JUDGE (VERIFY FACTS) =====
        console.log(`⚖️  [JARVIS RAG] Step 2: Verifying facts with Judge (Llama 4 Maverick)...`);
        
        let judgeOutput = '';
        try {
            const judgeMessage = await verifierGroq.chat.completions.create({
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
                temperature: 0.0, // Deterministic accuracy
                messages: [
                    {
                        role: 'system',
                        content: `You are a Strict Fact-Check Judge. Your job is to extract only the verified, current facts from the search context provided. Map every fact to its source URL. Discard any outdated info from your internal training data. Focus on 2026 information only. Be concise and list facts as bullet points.`
                    },
                    {
                        role: 'user',
                        content: `Please verify and extract facts from these search results:\n\n${formattedResults}\n\nQuestion: ${query}`
                    }
                ],
                max_tokens: 1024
            });

            judgeOutput = judgeMessage.choices[0]?.message?.content || '';
            console.log(`✅ [JARVIS RAG] Judge verified facts`);
        } catch (judgeError) {
            console.warn(`⚠️ [JARVIS RAG] Judge verification failed: ${judgeError.message}`);
            // Fallback to raw results
            return {
                answer: 'Note: Showing raw search results due to verification timeout.',
                sources: sourceUrls,
                verified: false,
                fallback: true,
                rawResults: formattedResults
            };
        }

        // ===== STEP 3: THE COMMUNICATOR (SYNTHESIZE RESPONSE) =====
        console.log(`💬 [JARVIS RAG] Step 3: Synthesizing response with Chat (GPT-OSS-120B)...`);
        
        let finalResponse = '';
        try {
            const chatMessage = await chatGroq.chat.completions.create({
                model: 'openai/gpt-oss-120b',
                temperature: 0.7, // Natural, friendly tone
                messages: [
                    {
                        role: 'system',
                        content: `You are JARVIS, a helpful and friendly AI assistant. Synthesize a natural response based ONLY on the verified facts provided. Do not add external information. If you cite a fact, include the source. List all source links clearly at the end. Keep the tone friendly and conversational.`
                    },
                    {
                        role: 'user',
                        content: `Based on these verified facts, please answer the question: "${query}"\n\nVerified Facts:\n${judgeOutput}`
                    }
                ],
                max_tokens: 2048
            });

            finalResponse = chatMessage.choices[0]?.message?.content || '';
            console.log(`✅ [JARVIS RAG] Response synthesized successfully`);
        } catch (chatError) {
            console.warn(`⚠️ [JARVIS RAG] Response synthesis failed: ${chatError.message}`);
            // Fallback to judge output
            return {
                answer: `${judgeOutput}\n\nNote: Response synthesis experienced a timeout; showing verified facts instead.`,
                sources: sourceUrls,
                verified: true,
                fallback: false,
                rawResults: judgeOutput
            };
        }

        // ===== SUCCESS =====
        // Append sources to final response
        const responseWithSources = sourceUrls.length > 0
            ? `${finalResponse}\n\n📚 **Sources:**\n${sourceUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}`
            : finalResponse;

        console.log(`🎉 [JARVIS RAG] Verified search complete`);
        return {
            answer: responseWithSources,
            sources: sourceUrls,
            verified: true,
            fallback: false,
            model: 'groq-llama3-verified',
            judgeOutput // Include judge output for transparency
        };

    } catch (error) {
        console.error(`❌ [JARVIS RAG] Pipeline error: ${error.message}`);
        return {
            answer: `Error during verified search: ${error.message}. Please try again.`,
            sources: [],
            verified: false,
            fallback: true,
            error: error.message
        };
    }
}

// ===== EXPORTS =====
module.exports = {
    jarvisAutonomousVerifiedSearch,
    verifierGroq,
    chatGroq
};

// ===== TESTING (Optional - for local development) =====
if (require.main === module) {
    (async () => {
        console.log('🧪 Testing JARVIS Autonomous RAG...\n');
        const result = await jarvisAutonomousVerifiedSearch('What are the latest AI breakthroughs in 2026?');
        console.log('\n📝 Response:');
        console.log(result.answer);
        console.log('\n📊 Metadata:');
        console.log(`Verified: ${result.verified}`);
        console.log(`Fallback: ${result.fallback}`);
        console.log(`Sources: ${result.sources.length}`);
    })().catch(console.error);
}
