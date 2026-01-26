/**
 * JARVIS MULTIMODAL INTELLIGENCE ROUTES
 * POST /api/analyze-media - Image & Document Analysis Endpoint
 */

const express = require('express');
const multer = require('multer');
const geminiVision = require('./gemini-vision-analyzer');
const pineconeIntegration = require('./pinecone-integration');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Configure multer for multipart/form-data (in-memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/heic',
            'image/heif',
            'application/pdf'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
    }
});

// Rate limiter: 20 requests per 15 minutes (vision is resource-intensive)
const visionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: 'Too many vision analysis requests. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * POST /api/analyze-media
 * 
 * Multimodal Intelligence Endpoint
 * Accepts: URL, base64, or multipart file upload
 * 
 * Request Body (JSON):
 * {
 *   "imageUrl": "https://example.com/image.jpg",  // Option 1: URL
 *   "base64Data": "base64string...",              // Option 2: Base64
 *   "mimeType": "image/jpeg",                     // Required for base64
 *   "query": "What is this?"                      // Optional: specific question
 * }
 * 
 * OR multipart/form-data:
 * - file: [image file]
 * - query: "What is this?"
 * 
 * Response:
 * {
 *   "success": true,
 *   "vision_analysis": {
 *     "summary": "...",
 *     "detected_text": "...",
 *     "technical_entities": [...],
 *     "scene_description": "...",
 *     "answer_to_query": "..."
 *   },
 *   "knowledge_base": {
 *     "related_documents": [...],
 *     "synthesis": "..."
 *   },
 *   "metadata": {
 *     "processing_time_ms": 2500,
 *     "model": "gemini-2.0-flash-exp",
 *     "stages_completed": [...]
 *   }
 * }
 */
router.post('/analyze-media', visionLimiter, upload.single('file'), async (req, res) => {
    console.log(`📥 [VISION-ENDPOINT] New request received`);

    try {
        let input = {};
        let userQuery = req.body.query || '';

        // Check if Gemini Vision is initialized
        if (!geminiVision || !geminiVision.visionModel) {
            return res.status(503).json({
                success: false,
                error: 'Vision analysis service unavailable. GEMINI_API_KEY not configured.'
            });
        }

        // Handle multipart file upload
        if (req.file) {
            console.log(`📁 [VISION-ENDPOINT] Processing uploaded file: ${req.file.originalname}`);
            
            input = {
                base64Data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            };
        }
        // Handle JSON body (URL or base64)
        else if (req.body.imageUrl) {
            console.log(`🔗 [VISION-ENDPOINT] Processing image URL`);
            input = { imageUrl: req.body.imageUrl };
        }
        else if (req.body.base64Data) {
            console.log(`📝 [VISION-ENDPOINT] Processing base64 data`);
            input = {
                base64Data: req.body.base64Data,
                mimeType: req.body.mimeType || 'image/jpeg'
            };
        }
        else {
            return res.status(400).json({
                success: false,
                error: 'No image input provided. Send imageUrl, base64Data, or upload a file.'
            });
        }

        // Execute multimodal analysis pipeline
        const result = await geminiVision.analyzeMedia(
            input,
            userQuery,
            pineconeIntegration
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error(`❌ [VISION-ENDPOINT] Error: ${error.message}`);

        // Handle specific errors
        if (error.message.includes('Unsupported MIME type')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('File too large')) {
            return res.status(413).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('Failed to fetch')) {
            return res.status(400).json({
                success: false,
                error: 'Unable to fetch image from URL. Please check the URL and try again.'
            });
        }

        // Generic error response
        return res.status(500).json({
            success: false,
            error: 'Vision analysis failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/analyze-media/status
 * Check if vision analysis service is available
 */
router.get('/analyze-media/status', (req, res) => {
    const isAvailable = geminiVision && geminiVision.visionModel;
    
    return res.status(200).json({
        success: true,
        status: isAvailable ? 'active' : 'unavailable',
        model: 'gemini-2.0-flash-exp',
        features: [
            'OCR (Text Detection)',
            'Scene Description',
            'Entity Extraction',
            'Spatial Reasoning',
            'Knowledge Base Integration'
        ],
        limits: {
            max_file_size: '10MB',
            supported_formats: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/heic',
                'image/heif',
                'application/pdf'
            ],
            rate_limit: '20 requests per 15 minutes'
        }
    });
});

module.exports = router;
