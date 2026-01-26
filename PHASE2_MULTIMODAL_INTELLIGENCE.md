# JARVIS Phase 2: Multimodal Intelligence

## Overview

Phase 2 implements **Multimodal Intelligence** using **Gemini 2.0 Flash (google/gemini-2.0-flash-exp)** for advanced image and document analysis with seamless integration into the existing RAG pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTIMODAL INTELLIGENCE                      │
│                   (Phase 2 Implementation)                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐        ┌──────────────────┐
│   User Input     │        │  Image/File      │
│   (Text Query)   │        │  (URL/Base64)    │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │                           ▼
         │              ┌─────────────────────────────┐
         │              │  GEMINI 2.0 FLASH VISION    │
         │              │  - OCR (Text Detection)     │
         │              │  - Scene Description        │
         │              │  - Entity Extraction        │
         │              │  - Spatial Reasoning        │
         │              └──────────┬──────────────────┘
         │                         │
         │                         │ Visual Context
         │                         ▼
         │              ┌─────────────────────────────┐
         │              │  PINECONE KNOWLEDGE BASE    │
         │              │  Semantic Search on         │
         │              │  Extracted Entities         │
         │              └──────────┬──────────────────┘
         │                         │
         ▼                         ▼
┌────────────────────────────────────────────────────────────┐
│              JARVIS AUTONOMOUS RAG PIPELINE                │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Conversation │  │    Visual    │  │   Serper +   │   │
│  │   History    │  │   Context    │  │     Jina     │   │
│  │   (Last 5)   │  │  (Gemini)    │  │  (Web Data)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │            │
│         └─────────────────┴──────────────────┘            │
│                           ▼                                │
│         ┌─────────────────────────────────────┐           │
│         │ LLAMA 4 MAVERICK (Verifier)         │           │
│         │ - Cross-Modal Fact Checking         │           │
│         │ - Citation Mapping                  │           │
│         └──────────────┬──────────────────────┘           │
│                        ▼                                   │
│         ┌─────────────────────────────────────┐           │
│         │ GPT-OSS-120B (Synthesizer)          │           │
│         │ - Unified Ground Truth Response     │           │
│         │ - Multi-Modal Integration           │           │
│         └──────────────┬──────────────────────┘           │
│                        ▼                                   │
│              Final Answer with:                            │
│              - Text Citations [1], [2]                     │
│              - Visual Insights                             │
│              - Knowledge Base Context                      │
└────────────────────────────────────────────────────────────┘
```

## Components

### 1. Core Modules

#### **gemini-vision-analyzer.js**
- Gemini 2.0 Flash initialization
- Image preprocessing (URL/base64/multipart)
- Two-stage analysis:
  - **Stage 1**: Vision Extraction (OCR, description, entities)
  - **Stage 2**: Contextual Synthesis (KB integration)
- JSON schema enforcement
- MIME validation & payload size limits

#### **vision-routes.js**
- Express route handler for `/api/analyze-media`
- Multer middleware for file uploads
- Rate limiting (20 req/15min)
- Error handling with proper status codes

### 2. RAG Integration

#### **jarvis-autonomous-rag.js** (Enhanced)
- `smartRagAnswer()` now accepts `visualContext` parameter
- Llama 4 Maverick prompts include visual insights
- GPT-OSS-120B synthesis merges text + vision
- `answer()` method supports multimodal queries

## API Endpoints

### POST /api/analyze-media

**Multimodal Intelligence Endpoint**

#### Request (JSON)
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "query": "What is in this diagram?"
}
```

#### Request (Multipart)
```bash
curl -X POST http://localhost:3000/api/analyze-media \
  -F "file=@path/to/image.jpg" \
  -F "query=Explain this chart"
```

#### Request (Base64)
```json
{
  "base64Data": "iVBORw0KGgoAAAANSUhEUg...",
  "mimeType": "image/png",
  "query": "What does this show?"
}
```

#### Response
```json
{
  "success": true,
  "vision_analysis": {
    "summary": "The image shows a neural network architecture diagram...",
    "detected_text": "Input Layer → Hidden Layer → Output Layer",
    "technical_entities": ["neural network", "deep learning", "tensorflow"],
    "scene_description": "Detailed visual analysis...",
    "answer_to_query": "This diagram illustrates..."
  },
  "knowledge_base": {
    "related_documents": [
      {
        "title": "Neural Network Basics",
        "source": "Knowledge Base",
        "snippet": "Neural networks consist of...",
        "score": 0.87
      }
    ],
    "synthesis": "Based on visual + knowledge base..."
  },
  "metadata": {
    "processing_time_ms": 2843,
    "model": "gemini-2.0-flash-exp",
    "stages_completed": ["vision_extraction", "contextual_synthesis"]
  }
}
```

### GET /api/analyze-media/status

Check service availability and configuration.

#### Response
```json
{
  "success": true,
  "status": "active",
  "model": "gemini-2.0-flash-exp",
  "features": [
    "OCR (Text Detection)",
    "Scene Description",
    "Entity Extraction",
    "Spatial Reasoning",
    "Knowledge Base Integration"
  ],
  "limits": {
    "max_file_size": "10MB",
    "supported_formats": ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif", "application/pdf"],
    "rate_limit": "20 requests per 15 minutes"
  }
}
```

## Technical Specifications

### Supported Formats
- **Images**: JPEG, PNG, GIF, WebP, HEIC, HEIF
- **Documents**: PDF
- **Max Size**: 10MB
- **Input Methods**: URL, base64, multipart/form-data

### Rate Limiting
- **20 requests per 15 minutes** (vision processing is resource-intensive)
- Returns 429 status code when limit exceeded

### Error Handling
| Error | Status | Description |
|-------|--------|-------------|
| No input | 400 | Missing imageUrl, base64Data, or file |
| Invalid MIME | 400 | Unsupported file format |
| File too large | 413 | Exceeds 10MB limit |
| URL fetch failed | 400 | Cannot access remote image |
| Service unavailable | 503 | GEMINI_API_KEY not configured |
| Generic error | 500 | Internal processing failure |

### Logging Prefixes
All vision operations use `[VISION-LOG]` prefix for easy debugging:
```
✅ [VISION-LOG] Gemini 2.0 Flash Vision initialized
📥 [VISION-LOG] Fetching image from URL: https://...
👁️ [VISION-LOG] Stage 1: Vision Extraction started
✅ [VISION-LOG] Stage 1 complete in 1523ms
🔍 [VISION-LOG] Stage 2: Contextual Synthesis started
✅ [VISION-LOG] Stage 2 complete in 487ms (3 docs)
🚀 [VISION-LOG] Starting multimodal analysis pipeline
✅ [VISION-LOG] Pipeline complete in 2843ms
```

## Integration with RAG

### How Visual Context Flows

1. **User sends image + query** → `/api/analyze-media`
2. **Gemini extracts**:
   - Summary
   - OCR text
   - Technical entities
3. **Pinecone searches** using entities → Related documents
4. **Visual context passed** to `jarvisAutonomousRAG.answer(query, userId, visualContext)`
5. **Llama 4 Maverick** receives:
   - Query
   - Conversation history
   - **Visual context** ← NEW
   - Web search results
6. **GPT-OSS-120B** synthesizes:
   - Verified facts
   - Visual insights
   - Knowledge base context
7. **Final response** includes multimodal understanding

### Example: Cross-Modal Query

**Input**:
```json
{
  "imageUrl": "https://example.com/python-code-screenshot.png",
  "query": "Find the bug in this code"
}
```

**Processing**:
1. Gemini OCR extracts code text
2. Gemini identifies entities: `["Python", "syntax error", "indentation"]`
3. Pinecone finds related docs about Python debugging
4. Llama 4 Maverick verifies against Python documentation
5. GPT-OSS-120B explains the bug with visual + textual context

**Response**:
```
The code has an indentation error on line 5. The 'else' statement 
is not properly aligned with its corresponding 'if' block [1][2]. 

Based on the visual analysis, the code snippet extracted shows:
```python
if x > 0:
    print("positive")
  else:  # ← Incorrect indentation
    print("negative")
```

This violates Python's indentation rules [3]. Fix by aligning 
'else' with 'if'.

[1] https://python.org/docs/indentation
[2] Knowledge Base: Python Style Guide
[3] Visual Context: Code screenshot analysis
```

## Configuration

### Required Environment Variables
```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Existing RAG components
GROQ_API_KEY=your_groq_key
SERPER_KEYS=key1,key2,key3
JINA_API_KEY=your_jina_key
```

### Optional Configuration
```env
# Firebase (for chat history)
FIREBASE_CONFIG={"project_id":"...","private_key":"..."}

# Pinecone (for knowledge base)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=jarvis-knowledge
```

## Testing

### Run Test Suite
```bash
cd backend
node test-vision-endpoint.js
```

### Manual Testing

**Test 1: URL Input**
```bash
curl -X POST http://localhost:3000/api/analyze-media \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg",
    "query": "What animal is this?"
  }'
```

**Test 2: File Upload**
```bash
curl -X POST http://localhost:3000/api/analyze-media \
  -F "file=@image.jpg" \
  -F "query=Describe this image"
```

**Test 3: Base64 Input**
```bash
curl -X POST http://localhost:3000/api/analyze-media \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "iVBORw0KGgoAAAANSUhEUg...",
    "mimeType": "image/png",
    "query": "What is in this image?"
  }'
```

## Performance Characteristics

- **Average Processing Time**: 2-5 seconds
- **Peak Memory Usage**: +200MB during vision processing
- **Gemini API Latency**: 1-3 seconds
- **KB Search Latency**: 200-500ms
- **Total Pipeline**: 3-7 seconds (vision + RAG + synthesis)

## Future Enhancements

- [ ] Video analysis (frame extraction + temporal reasoning)
- [ ] Audio transcription integration
- [ ] Multi-image comparison
- [ ] Drawing/annotation interpretation
- [ ] 3D model analysis
- [ ] Real-time streaming vision
- [ ] Vision embeddings for similarity search
- [ ] Fine-tuned vision models for domain-specific tasks

## Status

✅ **Phase 2 Complete**
- Gemini 2.0 Flash integration
- /api/analyze-media endpoint
- Multimodal RAG pipeline
- Cross-modal reasoning
- Knowledge base enrichment
- Comprehensive error handling
- Rate limiting & validation
- Test suite

---

**Created**: January 26, 2026  
**Status**: ✅ Production Ready  
**Next Phase**: Phase 3 - Advanced Features
