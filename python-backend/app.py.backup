"""
JARVIS AI - Python Flask Backend
Primary endpoints:
- GET /health
- GET /status  
- POST /ask-jarvis
- POST /api/jarvis/ask (alias for Node.js compatibility)
"""

import io
import json
import logging
import os
import sys
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv


ROOT_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.join(ROOT_DIR, '..', 'backend', '.env')
LOG_PATH = os.path.join(ROOT_DIR, 'python-backend.log')


# Load environment variables
load_dotenv(ENV_PATH)

# Safely get GROQ API Key with warning (don't crash if missing)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY is not set in environment variables!")
    print("   The app will start but JARVIS queries will fail.")
    print("   Please add GROQ_API_KEY to Render environment variables.")
    print("   Get your key from: https://console.groq.com/keys")


def configure_logging() -> logging.Logger:
    """Configure UTF-8 safe logging for Windows consoles."""
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

    class UTF8StreamHandler(logging.StreamHandler):
        def __init__(self):
            super().__init__()
            self.stream = sys.stderr

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(LOG_PATH, encoding='utf-8'),
            UTF8StreamHandler(),
        ],
    )
    return logging.getLogger("jarvis-backend")


logger = configure_logging()


# Initialize Flask
app = Flask(__name__)
CORS(app)


# Attempt to load ML service
ML_AVAILABLE = False
ml_service = None

try:
    from ml_service import MLService
    ml_service = MLService()
    ML_AVAILABLE = True
    logger.info("✅ ML services loaded successfully")
except Exception as exc:
    logger.warning(f"⚠️  ML services not available: {exc}")
    logger.warning("   App will run but ML endpoints will return 503")


PORT = int(os.environ.get("FLASK_PORT", 3000))


# ===== CORE ROUTES =====

@app.route("/", methods=["GET"])
def root():
    """Root endpoint - service info"""
    return jsonify({
        "status": "online",
        "service": "JARVIS Python ML Backend",
        "version": "1.0.0",
        "port": PORT,
        "ml_available": ML_AVAILABLE,
        "groq_configured": bool(GROQ_API_KEY),
        "timestamp": datetime.utcnow().isoformat(),
    })


@app.route("/health", methods=["GET"])
def health_check_final():
    """Health check endpoint - verifies backend is alive (UNIQUE NAME)"""
    return jsonify({
        "status": "healthy",
        "ml_available": ML_AVAILABLE,
        "groq_configured": bool(GROQ_API_KEY),
        "uptime": "running",
        "timestamp": datetime.utcnow().isoformat(),
    })


@app.route("/status", methods=["GET"])
def system_status():
    """System status endpoint - detailed service info"""
    return jsonify({
        "status": "operational",
        "service": "JARVIS Python Backend",
        "ml_services": ML_AVAILABLE,
        "groq_api": "configured" if GROQ_API_KEY else "missing",
        "port": PORT,
        "timestamp": datetime.utcnow().isoformat(),
    })


# ===== JARVIS AI ENDPOINTS =====

@app.route("/ask-jarvis", methods=["POST"])
def ask_jarvis_endpoint():
    """
    Main JARVIS endpoint: accepts {query} and returns structured response.
    
    Request: {"query": "What are latest AI trends?"}
    Response: {
        "success": true,
        "response": "AI synthesis...",
        "sources": [...],
        "verified_sources_count": 3
    }
    """
    if not ML_AVAILABLE or ml_service is None:
        return jsonify({
            "success": False,
            "error": "ML services not available",
            "response": "JARVIS research engine is offline. Please check ML service configuration.",
        }), 503

    if not GROQ_API_KEY:
        return jsonify({
            "success": False,
            "error": "GROQ_API_KEY not configured",
            "response": "Backend is missing GROQ_API_KEY. Please add it to Render environment variables.",
        }), 503

    payload = request.get_json(silent=True) or {}
    query = (payload.get("query") or "").strip()

    if not query:
        return jsonify({
            "success": False,
            "error": "Query cannot be empty"
        }), 400

    try:
        logger.info(f"🤖 JARVIS query received: '{query[:120]}'")
        result = ml_service.generate_jarvis_response(query)
        status_code = 200 if result.get("success") else 500
        return jsonify(result), status_code
    except Exception as exc:
        logger.error(f"❌ JARVIS processing error: {exc}")
        return jsonify({
            "success": False,
            "error": str(exc),
            "response": "JARVIS hit an unexpected issue. Please try again.",
        }), 500


@app.route("/api/jarvis/ask", methods=["POST"])
def api_jarvis_ask():
    """
    Alias endpoint for Node.js compatibility: /api/jarvis/ask
    Returns synthesis and steps for frontend research progress display.
    
    Request: {"query": "latest news"}
    Response: {
        "success": true,
        "response": "Synthesis answer...",  // This is the synthesis!
        "sources": [...],
        "steps": [
            "Searching verified 2026 sources...",
            "Filtering trusted results...",
            "Synthesizing with Llama 3.3..."
        ],
        "verified_sources_count": 4,
        "model": "llama-3.3-70b-versatile"
    }
    """
    if not ML_AVAILABLE or ml_service is None:
        return jsonify({
            "success": False,
            "error": "ML services not available",
            "response": "JARVIS research engine is offline.",
            "steps": ["❌ ML service unavailable"]
        }), 503

    if not GROQ_API_KEY:
        return jsonify({
            "success": False,
            "error": "GROQ_API_KEY not configured",
            "response": "Backend missing GROQ_API_KEY.",
            "steps": ["❌ API key not configured"]
        }), 503

    payload = request.get_json(silent=True) or {}
    query = (payload.get("query") or "").strip()

    if not query:
        return jsonify({
            "success": False,
            "error": "Query cannot be empty",
            "steps": ["❌ Empty query"]
        }), 400

    try:
        logger.info(f"🤖 [/api/jarvis/ask] Query: '{query[:100]}'")
        
        # Generate JARVIS response
        result = ml_service.generate_jarvis_response(query)
        
        # Add research steps for frontend progress display
        if result.get("success"):
            result["steps"] = [
                "✅ Searched verified 2026 sources",
                f"✅ Found {result.get('verified_sources_count', 0)} trusted results",
                f"✅ Synthesized with {result.get('model', 'Llama 3.3')}"
            ]
        else:
            result["steps"] = ["❌ Research failed"]
        
        status_code = 200 if result.get("success") else 500
        logger.info(f"✅ Response generated: {len(result.get('response', ''))} chars")
        return jsonify(result), status_code
        
    except Exception as exc:
        logger.error(f"❌ [/api/jarvis/ask] Error: {exc}")
        return jsonify({
            "success": False,
            "error": str(exc),
            "response": "JARVIS encountered an error. Please try again.",
            "steps": ["❌ Error during processing"]
        }), 500


# ===== ML SERVICE ENDPOINTS =====
def predict_endpoint():
    """ML prediction endpoint with fallback support"""
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        
        # Support both 'features' and 'context'/'query' formats
        if 'features' in data:
            features = data.get('features', [])
            if not features:
                return jsonify({'error': 'No features provided'}), 400
            
            if ml_service and hasattr(ml_service, 'predict_with_model'):
                result = ml_service.predict_with_model(features)
                return jsonify(result)
            else:
                return jsonify({'error': 'Prediction service not available'}), 503
        
        else:
            return jsonify({
                'error': 'Invalid request format',
                'expected': 'Send {features: [...]}'
            }), 400
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/analyze-image', methods=['POST'])
def analyze_image_endpoint():
    """Image analysis endpoint"""
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image = request.files['image']
        
        if ml_service and hasattr(ml_service, 'analyze_image'):
            result = ml_service.analyze_image(image)
            logger.info("Image analysis completed")
            
            return jsonify({
                'success': True,
                'analysis': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({'error': 'Image analysis service not available'}), 503
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/sentiment', methods=['POST'])
def sentiment_endpoint():
    """Sentiment analysis endpoint"""
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if ml_service and hasattr(ml_service, 'analyze_sentiment'):
            result = ml_service.analyze_sentiment(text)
            logger.info(f"Sentiment analysis completed")
            
            return jsonify({
                'success': True,
                'result': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({'error': 'Sentiment analysis service not available'}), 503
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/summarize', methods=['POST'])
def summarize_endpoint():
    """Text summarization endpoint"""
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        max_length = data.get('max_length', 150)
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if ml_service and hasattr(ml_service, 'summarize_text'):
            result = ml_service.summarize_text(text, max_length)
            logger.info("Text summarization completed")
            
            return jsonify({
                'success': True,
                'summary': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({'error': 'Summarization service not available'}), 503
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/analyze-code', methods=['POST'])
def analyze_code_endpoint():
    """Code quality analysis endpoint"""
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        if ml_service and hasattr(ml_service, 'analyze_code'):
            result = ml_service.analyze_code(code, language)
            logger.info(f"Code analysis completed")
            
            return jsonify({
                'success': True,
                'analysis': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({'error': 'Code analysis service not available'}), 503
    except Exception as e:
        logger.error(f"Code analysis error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/train-model', methods=['POST'])
def train_model_endpoint():
    """Model training endpoint"""
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        X = data.get('X', [])
        y = data.get('y', [])
        
        if not X or not y:
            return jsonify({'error': 'Training data not provided'}), 400
        
        if ml_service and hasattr(ml_service, 'train_model'):
            result = ml_service.train_model(X, y)
            logger.info(f"Model training completed")
            
            return jsonify({
                'success': True,
                'training_result': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({'error': 'Model training service not available'}), 503
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({'error': str(e)}), 500


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ===== MAIN ENTRY POINT (MUST BE AT THE END!) =====

if __name__ == "__main__":
    logger.info(f"🚀 Starting Flask server on port {PORT}")
    logger.info(f"🔧 ML Services: {'✅ Available' if ML_AVAILABLE else '❌ Unavailable'}")
    logger.info(f"🔑 GROQ API: {'✅ Configured' if GROQ_API_KEY else '❌ Missing'}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
