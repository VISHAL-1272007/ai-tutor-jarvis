"""
JARVIS AI - Python Flask Backend (UPDATED)
ML/AI Service for heavy computational tasks + DDGS Search RAG
Port: 5002
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('python-backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
PORT = int(os.getenv('PORT', 5002))

# Import ML services with graceful fallback
ML_AVAILABLE = False
predict_model = None
analyze_image = None
sentiment_analysis = None
summarize_text = None
analyze_code_quality = None
train_simple_model = None

try:
    from ml_service import (
        predict_model,
        analyze_image,
        sentiment_analysis,
        summarize_text,
        analyze_code_quality,
        train_simple_model
    )
    ML_AVAILABLE = True
    logger.info("✅ ML services loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️ ML services not available: {e}")
    logger.info("🔄 Running in HEURISTIC MODE - basic functionality available")
    
    # Fallback heuristic functions
    def predict_model(context, query):
        """Fallback: Basic keyword matching"""
        try:
            matches = sum(1 for word in query.lower().split() if word in context.lower())
            confidence = min(matches / max(len(query.split()), 1), 1.0)
            return {
                'success': True,
                'confidence': round(confidence, 2),
                'method': 'fallback_heuristic',
                'message': 'Using basic keyword matching (ML service unavailable)'
            }
        except Exception as e:
            return {'success': False, 'error': str(e), 'confidence': 0.0}
    
    def sentiment_analysis(text):
        """Fallback: Basic sentiment"""
        return {'success': True, 'sentiment': 'neutral', 'score': 0.5, 'method': 'fallback'}
    
    def analyze_image(image_data):
        """Fallback: Image analysis unavailable"""
        return {'success': False, 'error': 'ML service not loaded', 'message': 'Image analysis requires ml_service.py'}
    
    def summarize_text(text, max_sentences=3):
        """Fallback: Basic summarization"""
        sentences = text.split('.')[:max_sentences]
        return {'success': True, 'summary': '.'.join(sentences), 'method': 'fallback'}
    
    def analyze_code_quality(code):
        """Fallback: Basic code metrics"""
        lines = len(code.split('\n'))
        return {'success': True, 'total_lines': lines, 'method': 'fallback'}
    
    def train_simple_model(data):
        """Fallback: Training unavailable"""
        return {'success': False, 'error': 'ML service not loaded'}

# Try to import DDGS routes
DDGS_AVAILABLE = False
try:
    from ddgs_routes import register_search_routes
    DDGS_AVAILABLE = True
    logger.info("✅ DDGS Search routes available")
except ImportError as e:
    logger.warning(f"⚠️ DDGS Search not available: {e}")

# Health check
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'service': 'JARVIS Python ML Backend',
        'version': '2.0.0',
        'port': PORT,
        'ml_available': ML_AVAILABLE,
        'ddgs_search_available': DDGS_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    }), 200

# ===================== DDGS SEARCH ENDPOINTS =====================

@app.route('/api/ddgs-search', methods=['POST'])
def ddgs_search():
    """DDGS Search with content extraction"""
    try:
        if not DDGS_AVAILABLE:
            return jsonify({'error': 'DDGS Search not available'}), 503
        
        from ddgs_search import get_search_results
        from content_verifier import verify_search_results, clean_for_groq
        
        data = request.get_json()
        query = data.get('query', '').strip()
        region = data.get('region', 'in-en')
        max_results = int(data.get('max_results', 5))
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        logger.info(f"🔍 DDGS Search: {query}")
        
        # Search and extract
        results = get_search_results(query, region, max_results)
        
        if not results:
            return jsonify({
                'success': False,
                'error': 'No results found',
                'results': []
            }), 200
        
        # Verify and filter
        verified, context = verify_search_results(results, query, min_relevance=0.3)
        clean_context = clean_for_groq(context, max_tokens=2000)
        
        return jsonify({
            'success': True,
            'query': query,
            'region': region,
            'results': verified,
            'verified_count': len(verified),
            'total_results': len(results),
            'context': clean_context,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/groq-synthesis', methods=['POST'])
def groq_synthesis():
    """Synthesize using Groq LLAMA-3"""
    try:
        from groq import Groq
        
        data = request.get_json()
        query = data.get('query', '')
        context = data.get('context', '')
        results = data.get('results', [])
        
        if not query or not context:
            return jsonify({'error': 'Query and context required'}), 400
        
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return jsonify({'error': 'GROQ_API_KEY not configured'}), 500
        
        logger.info(f"🧠 Groq Synthesis: {query}")
        
        client = Groq(api_key=api_key)
        
        sources_info = "\n".join([
            f"- {r.get('title', 'Source')} ({r.get('url', '#')})"
            for r in results[:3]
        ])
        
        prompt = f"""Based on verified search results, answer the user query comprehensively.

QUERY: {query}

VERIFIED CONTEXT:
{context}

SOURCES:
{sources_info}

Provide a detailed answer with citations like [1], [2] for sources."""
        
        response = client.chat.completions.create(
            model='llama-3-70b-versatile',
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a knowledgeable assistant providing accurate, well-sourced answers.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content
        
        return jsonify({
            'success': True,
            'query': query,
            'answer': answer,
            'sources': results[:3],
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return jsonify({'error': str(e)}), 500


# ===================== EXISTING ML ENDPOINTS =====================

@app.route('/api/predict', methods=['POST'])
def predict_endpoint():
    """ML Prediction endpoint"""
    try:
        data = request.get_json()
        context = data.get('context', '')
        query = data.get('query', '')
        
        if not context or not query:
            return jsonify({'error': 'Context and query required'}), 400
        
        result = predict_model(context, query)
        
        return jsonify({
            'success': True,
            'prediction': result,
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/sentiment', methods=['POST'])
def sentiment_endpoint():
    """Sentiment analysis endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text required'}), 400
        
        result = sentiment_analysis(text)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Sentiment error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/summarize', methods=['POST'])
def summarize_endpoint():
    """Text summarization endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        max_sentences = int(data.get('max_sentences', 3))
        
        if not text:
            return jsonify({'error': 'Text required'}), 400
        
        result = summarize_text(text, max_sentences)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        return jsonify({'error': str(e)}), 500


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    logger.info(f"🐍 Starting JARVIS Python Backend on port {PORT}")
    logger.info(f"🔧 ML Services: {ML_AVAILABLE}")
    logger.info(f"🔍 DDGS Search: {DDGS_AVAILABLE}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
