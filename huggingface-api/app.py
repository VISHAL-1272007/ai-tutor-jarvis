"""
JARVIS AI API - Powered by Autonomous Reasoning Gateway
Hosted on Hugging Face Spaces with zero-failure resilience
Supports identity, logic, and factual reasoning with web search fallback
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json

app = Flask(__name__)
CORS(app)

# Import JARVIS standalone agent
try:
    from jarvis_standalone import JARVISResilientAgent, KnowledgeSource
    print("🤖 JARVIS Resilient Agent loaded successfully")
    agent = JARVISResilientAgent()
    JARVIS_AVAILABLE = True
except Exception as e:
    print(f"⚠️ JARVIS not available: {e}")
    print(f"   Error details: {type(e).__name__}")
    JARVIS_AVAILABLE = False
    agent = None

print("✅ JARVIS API initialized on Hugging Face Spaces")

def process_query(query: str) -> dict:
    """Process query through JARVIS with zero-failure logic"""
    if not JARVIS_AVAILABLE or agent is None:
        return {
            'success': False,
            'answer': 'AI service temporarily unavailable. Please try again.',
            'source': 'error'
        }
    
    try:
        response = agent.process_query(query)
        return {
            'success': True,
            'answer': response.answer,
            'source': response.source.value,
            'used_search': response.used_search,
            'resources': response.resources,
            'confidence': response.confidence
        }
    except Exception as e:
        return {
            'success': False,
            'answer': 'Error processing query. Please try again.',
            'error': str(e),
            'source': 'error'
        }

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'JARVIS AI - Autonomous Reasoning Gateway',
        'version': '4.0',
        'type': 'Zero-Failure Resilient Agent',
        'jarvis_available': JARVIS_AVAILABLE,
        'endpoints': {
            '/ask': 'POST - Process query with JARVIS',
            '/chat': 'POST - Chat with AI (alias for /ask)',
            '/health': 'GET - Detailed health status'
        }
    })

@app.route('/health')
def health():
    """Detailed health check"""
    try:
        if JARVIS_AVAILABLE and agent:
            stats = agent.get_statistics()
            return jsonify({
                'status': 'healthy',
                'jarvis_loaded': True,
                'version': '4.0',
                'features': {
                    'zero_failure': True,
                    'reasoning_router': True,
                    'security_shield': True,
                    'web_search': stats.get('search_available', False)
                },
                'statistics': stats
            })
        else:
            return jsonify({
                'status': 'degraded',
                'jarvis_loaded': False,
                'message': 'JARVIS not available - using fallback'
            }), 503
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/ask', methods=['POST'])
def ask():
    """Main JARVIS endpoint - process query"""
    try:
        data = request.json or {}
        query = data.get('query') or data.get('message') or ''
        
        if not query:
            return jsonify({
                'success': False,
                'answer': 'Please provide a query',
                'source': 'error'
            }), 400
        
        print(f"💬 Query: {query[:100]}...")
        
        result = process_query(query)
        
        print(f"✅ Response: {result['source']}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'answer': 'Error processing query',
            'error': str(e),
            'source': 'error'
        }), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint (alias for /ask)"""
    try:
        data = request.json or {}
        
        # Support both OpenAI and simple formats
        if 'messages' in data:
            messages = data.get('messages', [])
            if messages:
                query = messages[-1].get('content', '')
            else:
                query = ''
        else:
            query = data.get('message') or data.get('query') or ''
        
        if not query:
            return jsonify({
                'success': False,
                'answer': 'Please provide a message',
                'source': 'error'
            }), 400
        
        print(f"💬 Chat: {query[:100]}...")
        
        result = process_query(query)
        
        print(f"✅ Response: {result['source']}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'answer': 'Error processing message',
            'error': str(e),
            'source': 'error'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    print(f"\n{'='*70}")
    print("🚀 JARVIS API - Powered by HuggingFace Spaces")
    print(f"{'='*70}")
    print(f"🌐 Server starting on port {port}...")
    print(f"📍 Local: http://localhost:{port}")
    print(f"📍 HuggingFace Space: https://huggingface.co/spaces/[username]/[space-name]")
    print(f"\n✨ Features:")
    print(f"   ✅ Zero-Failure Logic (never crashes)")
    print(f"   ✅ Reasoning Router (smart query classification)")
    print(f"   ✅ Cybersecurity Shield (hard-coded protection)")
    print(f"   ✅ No Link Spam (clean responses)")
    print(f"   ✅ Error Handling (all wrapped in try-except)")
    print(f"\n📚 API Endpoints:")
    print(f"   POST /ask  - Process query with JARVIS")
    print(f"   POST /chat - Chat endpoint (alias)")
    print(f"   GET  /health - Health status")
    print(f"   GET  / - Service info")
    print(f"{'='*70}\n")
    app.run(host='0.0.0.0', port=port, debug=False)
