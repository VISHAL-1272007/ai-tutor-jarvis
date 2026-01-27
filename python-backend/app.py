"""
JARVIS AI - Python Flask Backend
Primary endpoints:
- GET /health
- POST /ask-jarvis
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
try:
    from ml_service import MLService

    ml_service = MLService()
    ML_AVAILABLE = True
    logger.info("✅ ML services loaded successfully")
except Exception as exc:  # broad to catch missing deps
    ML_AVAILABLE = False
    ml_service = None
    logger.warning(f"⚠️ ML services not available: {exc}")


PORT = int(os.environ.get("FLASK_PORT", 3000))


@app.route("/", methods=["GET"])
def root():
    return jsonify(
        {
            "status": "online",
            "service": "JARVIS Python ML Backend",
            "version": "1.0.0",
            "port": PORT,
            "ml_available": ML_AVAILABLE,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "ml_available": ML_AVAILABLE})


@app.route("/ask-jarvis", methods=["POST"])
def ask_jarvis():
    """Main endpoint: accepts {query} and returns structured response."""
    if not ML_AVAILABLE or ml_service is None:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "ML services not available",
                    "response": "JARVIS research engine is offline. Please start ML services.",
                }
            ),
            503,
        )

    payload = request.get_json(silent=True) or {}
    query = (payload.get("query") or "").strip()

    if not query:
        return (
            jsonify({"success": False, "error": "Query cannot be empty"}),
            400,
        )

    try:
        logger.info(f"🤖 JARVIS query received: '{query[:120]}'")
        result = ml_service.generate_jarvis_response(query)
        status_code = 200 if result.get("success") else 500
        return jsonify(result), status_code
    except Exception as exc:  # noqa: BLE001
        logger.error(f"❌ JARVIS processing error: {exc}")
        return (
            jsonify({
                "success": False,
                "error": str(exc),
                "response": "JARVIS hit an unexpected issue. Please try again.",
            }),
            500,
        )


if __name__ == "__main__":
    logger.info(f"🚀 Starting Flask server on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'uptime': 'running',
        'ml_services': ML_AVAILABLE
    })

# ML Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    """ML prediction endpoint with fallback support"""
    try:
        data = request.get_json()
        
        # Support both 'features' and 'context'/'query' formats
        if 'features' in data:
            features = data.get('features', [])
            if not features:
                return jsonify({'error': 'No features provided'}), 400
            
            # Use class method if available
            from ml_service import MLService
            ml = MLService()
            result = ml.predict_with_model(features)
            return jsonify(result)
        
        elif 'context' in data and 'query' in data:
            context = data.get('context', '')
            query = data.get('query', '')
            
            if not context or not query:
                return jsonify({'error': 'Context and query are required'}), 400
            
            # Use standalone predict_model function
            result = predict_model(context, query)
            return jsonify(result)
        
        else:
            return jsonify({
                'error': 'Invalid request format',
                'expected': 'Either {features: [...]} or {context: "...", query: "..."}'
            }), 400
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500
        
        result = predict_model(features)
        logger.info(f"Prediction completed: {result}")
        
        return jsonify({
            'success': True,
            'prediction': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

# Image Analysis endpoint
@app.route('/analyze-image', methods=['POST'])
def analyze_image_endpoint():
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image = request.files['image']
        result = analyze_image(image)
        logger.info("Image analysis completed")
        
        return jsonify({
            'success': True,
            'analysis': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Sentiment Analysis endpoint
@app.route('/sentiment', methods=['POST'])
def sentiment():
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        result = sentiment_analysis(text)
        logger.info(f"Sentiment analysis completed: {result['sentiment']}")
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Text Summarization endpoint
@app.route('/summarize', methods=['POST'])
def summarize():
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        max_length = data.get('max_length', 150)
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        result = summarize_text(text, max_length)
        logger.info("Text summarization completed")
        
        return jsonify({
            'success': True,
            'summary': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        return jsonify({'error': str(e)}), 500

# Code Quality Analysis endpoint
@app.route('/analyze-code', methods=['POST'])
def analyze_code():
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        result = analyze_code_quality(code, language)
        logger.info(f"Code analysis completed: Score {result['quality_score']}")
        
        return jsonify({
            'success': True,
            'analysis': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Code analysis error: {e}")
        return jsonify({'error': str(e)}), 500

# Model Training endpoint
@app.route('/train-model', methods=['POST'])
def train_model():
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        X = data.get('X', [])
        y = data.get('y', [])
        
        if not X or not y:
            return jsonify({'error': 'Training data not provided'}), 400
        
        result = train_simple_model(X, y)
        logger.info(f"Model training completed: Accuracy {result['accuracy']}")
        
        return jsonify({
            'success': True,
            'training_result': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/ask-jarvis', methods=['POST'])
def ask_jarvis():
    """
    JARVIS AI Assistant Endpoint
    
    Uses JARVIS Researcher + Groq LLM pipeline to answer user queries
    with verified 2026 web context
    
    Request Body:
        {
            "query": "What are the latest AI trends in Tamil Nadu?"
        }
    
    Response:
        {
            "success": true,
            "response": "AI assistant's answer...",
            "sources": [
                {"title": "Article Title", "url": "https://..."},
                ...
            ],
            "context_length": 1234,
            "verified_sources_count": 3,
            "model": "llama3-70b-8192",
            "timestamp": "2026-01-27T..."
        }
    """
    try:
        if not ML_AVAILABLE or not generate_jarvis_response:
            logger.error("JARVIS service not available")
            return jsonify({
                'success': False,
                'error': 'JARVIS service is not available. Please check ML service configuration.',
                'response': 'The AI assistant is currently unavailable.'
            }), 503
        
        # Get query from request
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: query'
            }), 400
        
        user_query = data['query'].strip()
        if not user_query:
            return jsonify({
                'success': False,
                'error': 'Query cannot be empty'
            }), 400
        
        logger.info(f"🤖 JARVIS query received: '{user_query}'")
        
        # Generate response using JARVIS pipeline
        result = generate_jarvis_response(user_query)
        
        if result['success']:
            logger.info(f"✅ JARVIS response generated ({result.get('verified_sources_count', 0)} sources)")
        else:
            logger.error(f"❌ JARVIS response failed: {result.get('error', 'Unknown error')}")
        
        return jsonify(result), 200 if result['success'] else 500
        
    except Exception as e:
        logger.error(f"JARVIS endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'response': 'An unexpected error occurred while processing your request.'
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info(f"🐍 Starting Python Flask Backend on port {PORT}")
    logger.info(f"🔧 ML Services Available: {ML_AVAILABLE}")
    app.run(host='0.0.0.0', port=PORT, debug=True)
