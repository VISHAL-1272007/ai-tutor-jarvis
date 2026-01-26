/**
 * JARVIS GEMINI 2.0 FLASH VISION ANALYZER
 * 
 * Multimodal Intelligence Layer for Image & Document Analysis
 * - OCR (Optical Character Recognition)
 * - Scene Description & Spatial Reasoning
 * - Technical Entity Extraction
 * - Cross-Modal RAG Integration
 * 
 * Model: google/gemini-2.0-flash-001
 * Author: JARVIS Development Team
 * Date: January 26, 2026
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

class GeminiVisionAnalyzer {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = null;
        this.visionModel = null;
        this.maxPayloadSize = 10 * 1024 * 1024; // 10MB
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/heic',
            'image/heif',
            'application/pdf'
        ];
        
        if (!this.apiKey) {
            console.warn('⚠️ [VISION-LOG] GEMINI_API_KEY not configured - Vision analysis disabled');
            return;
        }

        try {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.visionModel = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp'
            });
            console.log('✅ [VISION-LOG] Gemini 2.0 Flash Vision initialized');
        } catch (err) {
            console.error(`❌ [VISION-LOG] Failed to initialize Gemini: ${err.message}`);
        }
    }

    /**
     * Validate MIME type
     */
    isValidMimeType(mimeType) {
        return this.allowedMimeTypes.includes(mimeType?.toLowerCase());
    }

    /**
     * Validate payload size
     */
    isValidSize(dataLength) {
        return dataLength <= this.maxPayloadSize;
    }

    /**
     * Convert URL to base64 inline data for Gemini
     */
    async fetchImageFromUrl(url) {
        console.log(`📥 [VISION-LOG] Fetching image from URL: ${url}`);
        
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                maxContentLength: this.maxPayloadSize,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(response.data);
            const mimeType = response.headers['content-type'] || 'image/jpeg';

            if (!this.isValidMimeType(mimeType)) {
                throw new Error(`Unsupported MIME type: ${mimeType}`);
            }

            if (!this.isValidSize(buffer.length)) {
                throw new Error(`File too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
            }

            console.log(`✅ [VISION-LOG] Fetched ${(buffer.length / 1024).toFixed(2)}KB, MIME: ${mimeType}`);

            return {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType
                }
            };
        } catch (err) {
            throw new Error(`Failed to fetch image from URL: ${err.message}`);
        }
    }

    /**
     * Convert base64 string to Gemini InlineData format
     */
    parseBase64Input(base64String, mimeType = 'image/jpeg') {
        console.log(`🔄 [VISION-LOG] Parsing base64 input (MIME: ${mimeType})`);

        // Remove data URL prefix if present
        const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        if (!this.isValidMimeType(mimeType)) {
            throw new Error(`Unsupported MIME type: ${mimeType}`);
        }

        if (!this.isValidSize(buffer.length)) {
            throw new Error(`File too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
        }

        console.log(`✅ [VISION-LOG] Parsed ${(buffer.length / 1024).toFixed(2)}KB base64 data`);

        return {
            inlineData: {
                data: base64Data,
                mimeType
            }
        };
    }

    /**
     * Stage 1: Vision Extraction with JSON Schema Enforcement
     * Performs OCR, scene description, and entity extraction
     */
    async analyzeVisualContent(imagePart, userQuery = '') {
        if (!this.visionModel) {
            throw new Error('Gemini Vision Model not initialized');
        }

        console.log(`👁️ [VISION-LOG] Stage 1: Vision Extraction started`);
        const startTime = Date.now();

        const prompt = userQuery 
            ? `Analyze this image and answer: "${userQuery}"\n\nProvide a detailed analysis including:\n1. Overall description of the image\n2. Any text detected (OCR)\n3. Technical entities, objects, or concepts visible\n4. Spatial relationships and composition\n5. Answer to the user's specific question\n\nFormat your response as JSON with these exact keys:\n- summary: string (brief overview)\n- detected_text: string (all text found via OCR)\n- technical_entities: array of strings (key objects/concepts)\n- scene_description: string (detailed visual analysis)\n- answer_to_query: string (direct answer to user's question)`
            : `Analyze this image in detail. Provide:\n1. A comprehensive description\n2. Any text detected (OCR)\n3. Technical entities or objects present\n4. Spatial layout and composition\n\nFormat your response as JSON with these exact keys:\n- summary: string (brief overview)\n- detected_text: string (all text found via OCR)\n- technical_entities: array of strings (key objects/concepts)\n- scene_description: string (detailed visual analysis)`;

        try {
            const result = await this.visionModel.generateContent([
                prompt,
                imagePart
            ]);

            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ [VISION-LOG] Stage 1 complete in ${Date.now() - startTime}ms`);

            // Try to parse as JSON, fallback to structured object
            let structured;
            try {
                // Extract JSON from response (may have markdown code blocks)
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                structured = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            } catch (parseErr) {
                console.warn(`⚠️ [VISION-LOG] JSON parsing failed, creating fallback structure`);
            }

            if (!structured) {
                structured = {
                    summary: text.substring(0, 300),
                    detected_text: '',
                    technical_entities: [],
                    scene_description: text,
                    answer_to_query: userQuery ? text : ''
                };
            }

            return {
                ...structured,
                raw_text: text,
                processing_time_ms: Date.now() - startTime
            };

        } catch (err) {
            console.error(`❌ [VISION-LOG] Stage 1 failed: ${err.message}`);
            throw new Error(`Vision analysis failed: ${err.message}`);
        }
    }

    /**
     * Stage 2: Contextual Synthesis with Knowledge Base
     * Performs semantic search against Pinecone/Local KB using extracted entities
     */
    async enrichWithKnowledgeBase(visionData, pineconeIntegration = null) {
        console.log(`🔍 [VISION-LOG] Stage 2: Contextual Synthesis started`);
        const startTime = Date.now();

        const entities = visionData.technical_entities || [];
        const detectedText = visionData.detected_text || '';
        
        // Create search query from entities and detected text
        const searchQuery = [
            ...entities,
            detectedText.substring(0, 200)
        ].filter(Boolean).join(' ');

        if (!searchQuery.trim() || !pineconeIntegration) {
            console.log(`⚠️ [VISION-LOG] Stage 2 skipped (no entities or KB unavailable)`);
            return {
                related_documents: [],
                synthesis: visionData.scene_description
            };
        }

        try {
            const matches = await pineconeIntegration.searchPineconeKnowledge(searchQuery, 3);
            const relatedDocs = matches.map(m => ({
                title: m.metadata?.title || 'Unknown',
                source: m.metadata?.source || 'Knowledge Base',
                snippet: m.text?.substring(0, 200) || '',
                score: m.score || 0
            }));

            console.log(`✅ [VISION-LOG] Stage 2 complete in ${Date.now() - startTime}ms (${relatedDocs.length} docs)`);

            return {
                related_documents: relatedDocs,
                synthesis: `Based on the visual analysis and ${relatedDocs.length} related documents from the knowledge base, here's the synthesis:\n\n${visionData.scene_description}`
            };

        } catch (err) {
            console.warn(`⚠️ [VISION-LOG] Stage 2 KB search failed: ${err.message}`);
            return {
                related_documents: [],
                synthesis: visionData.scene_description
            };
        }
    }

    /**
     * Complete Multimodal Analysis Pipeline
     */
    async analyzeMedia(input, userQuery = '', pineconeIntegration = null) {
        console.log(`🚀 [VISION-LOG] Starting multimodal analysis pipeline`);
        const pipelineStart = Date.now();

        try {
            // Step 1: Preprocess input (URL or base64)
            let imagePart;
            if (input.imageUrl) {
                imagePart = await this.fetchImageFromUrl(input.imageUrl);
            } else if (input.base64Data) {
                imagePart = this.parseBase64Input(input.base64Data, input.mimeType || 'image/jpeg');
            } else {
                throw new Error('No image input provided (imageUrl or base64Data required)');
            }

            // Step 2: Stage 1 - Vision Extraction
            const visionData = await this.analyzeVisualContent(imagePart, userQuery);

            // Step 3: Stage 2 - Contextual Synthesis
            const enrichedData = await this.enrichWithKnowledgeBase(visionData, pineconeIntegration);

            // Step 4: Build final response
            const result = {
                success: true,
                vision_analysis: {
                    summary: visionData.summary,
                    detected_text: visionData.detected_text,
                    technical_entities: visionData.technical_entities,
                    scene_description: visionData.scene_description,
                    answer_to_query: visionData.answer_to_query || null
                },
                knowledge_base: {
                    related_documents: enrichedData.related_documents,
                    synthesis: enrichedData.synthesis
                },
                metadata: {
                    processing_time_ms: Date.now() - pipelineStart,
                    model: 'gemini-2.0-flash-exp',
                    stages_completed: ['vision_extraction', 'contextual_synthesis']
                }
            };

            console.log(`✅ [VISION-LOG] Pipeline complete in ${result.metadata.processing_time_ms}ms`);
            return result;

        } catch (err) {
            console.error(`❌ [VISION-LOG] Pipeline failed: ${err.message}`);
            throw err;
        }
    }

    /**
     * Create visual context string for RAG integration
     */
    createVisualContext(visionAnalysis) {
        if (!visionAnalysis || !visionAnalysis.vision_analysis) return '';

        const va = visionAnalysis.vision_analysis;
        const kb = visionAnalysis.knowledge_base;

        let context = `📸 VISUAL CONTEXT:\n`;
        context += `Summary: ${va.summary}\n`;
        
        if (va.detected_text) {
            context += `Text Detected (OCR): ${va.detected_text}\n`;
        }
        
        if (va.technical_entities && va.technical_entities.length > 0) {
            context += `Entities: ${va.technical_entities.join(', ')}\n`;
        }

        if (kb.related_documents && kb.related_documents.length > 0) {
            context += `\nRelated Documentation:\n`;
            kb.related_documents.forEach((doc, idx) => {
                context += `[${idx + 1}] ${doc.title} - ${doc.snippet}\n`;
            });
        }

        return context;
    }
}

module.exports = new GeminiVisionAnalyzer();
