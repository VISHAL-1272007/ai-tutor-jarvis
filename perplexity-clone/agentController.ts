import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';
import Redis from 'ioredis';

/**
 * ARCHITECTURE: DECOUPLED MULTI-AGENT ORCHESTRATION
 * Role: Principal AI Engineer
 * Module: Backend Agent Controller
 */

// --- Interfaces ---

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    content?: string;
    relevanceScore?: number;
}

interface AgentResponse {
    answer: string;
    sources: SearchResult[];
    status: 'success' | 'partial' | 'restricted' | 'error';
    metadata: {
        latency: number;
        intent: string;
        tokenUsage: number;
    };
}

// --- Controller Logic ---

export class PerplexityAgentController {
    private groq: Groq;
    private gemini: any;
    private redis: Redis;
    private serperKeys: string[];

    constructor() {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        this.gemini = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: { temperature: 0.1 } // High precision for grounding
        });
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
        this.serperKeys = (process.env.SERPER_KEYS || '').split(',');
    }

    /**
     * STAGE 1: TRI-STAGE INTENT ANALYSIS (Groq Llama-3-70b)
     * Detects volatility and temporal context to decide search bypass.
     */
    private async analyzeIntent(query: string): Promise<{ bypassInternal: boolean; intent: string }> {
        const prompt = `
            Analyze this query for temporal volatility or current data requirements.
            Query: "${query}"
            Output JSON only: { "bypassSearch": boolean, "intent": string, "confidence": number }
        `;
        
        const completion = await this.groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-70b-8192',
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(completion.choices[0].message.content || '{}');
        return {
            bypassInternal: analysis.bypassSearch || analysis.confidence > 0.8,
            intent: analysis.intent
        };
    }

    /**
     * STAGE 2: PARALLELIZED WEB INTELLIGENCE (Serper)
     */
    private async fetchSearchIndices(query: string): Promise<SearchResult[]> {
        const key = this.serperKeys[Math.floor(Math.random() * this.serperKeys.length)];
        const response = await axios.post('https://google.serper.dev/search', {
            q: query,
            num: 5
        }, {
            headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' }
        });

        return response.data.organic.map((res: any) => ({
            title: res.title,
            url: res.link,
            snippet: res.snippet
        }));
    }

    /**
     * STAGE 3: RECURSIVE CONTENT SCRUBBING (Jina + Cheerio Fallback)
     */
    private async scrubContent(url: string): Promise<string> {
        // Try Jina Reader first
        try {
            const jinaResponse = await axios.get(`https://r.jina.ai/${url}`, { timeout: 8000 });
            if (jinaResponse.data) return jinaResponse.data;
        } catch (e) {
            console.warn(`Jina failed for ${url}, falling back to Cheerio...`);
        }

        // Fallback: Cheerio/Scraper logic
        try {
            const { data } = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(data);
            $('script, style, nav, footer').remove();
            return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000);
        } catch (e) {
            return `Live Access Restricted: 404/Forbidden for ${url}`;
        }
    }

    /**
     * FINAL STAGE: THE ORACLE SYNTHESIS (Gemini 1.5 Pro)
     */
    public async processQuery(query: string): Promise<AgentResponse> {
        const start = Date.now();
        
        // 1. Intent Analysis
        const { bypassInternal, intent } = await this.analyzeIntent(query);
        
        // 2. Search & Scrape
        const indices = await this.fetchSearchIndices(query);
        const richContent = await Promise.all(
            indices.map(async (idx) => ({
                ...idx,
                content: await this.scrubContent(idx.url)
            }))
        );

        // 3. Deduplication & Formatting
        const context = richContent
            .map((res, i) => `[Source ${i+1}] Title: ${res.title}\nURL: ${res.url}\nContent: ${res.content?.slice(0, 5000)}`)
            .join('\n\n---\n\n');

        // 4. Grounded Generation
        const prompt = `
            QUERY: ${query}
            CONTEXT:
            ${context}

            INSTRUCTIONS:
            - Provide a comprehensive technical response.
            - STRICT GROUNDING: Use ONLY the provided context. 
            - If data is missing or "Access Denied", report "Live Access Restricted".
            - Use STRICT MARKDOWN Cite every fact using [^n] notation.
        `;

        const result = await this.gemini.generateContent(prompt);
        const answer = result.response.text();

        return {
            answer,
            sources: richContent,
            status: answer.includes('Live Access Restricted') ? 'restricted' : 'success',
            metadata: {
                latency: Date.now() - start,
                intent,
                tokenUsage: 0 // Placeholder
            }
        };
    }
}
