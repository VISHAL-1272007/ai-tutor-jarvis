"""
JARVIS AI - Python Flask Backend
ML/AI Service for heavy computational tasks
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

# Import ML services (will create this file)
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
    ML_AVAILABLE = False
    logger.warning(f"⚠️ ML services not available: {e}")

# Health check
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'service': 'JARVIS Python ML Backend',
        'version': '1.0.0',
        'port': PORT,
        'ml_available': ML_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

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
    if not ML_AVAILABLE:
        return jsonify({'error': 'ML services not available'}), 503
    
    try:
        data = request.get_json()
        features = data.get('features', [])
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
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
