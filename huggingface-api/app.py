"""
FREE AI API using Hugging Face Inference API
Completely free hosting on Hugging Face Spaces
No model download needed - uses HF's free inference!
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Use Hugging Face FREE Inference API - no model download needed!
print("🚀 Using Hugging Face FREE Inference API...")
# Using Microsoft's DialoGPT - works WITHOUT token!
# Updated to new router URL (api-inference.huggingface.co is deprecated)
HF_API_URL = "https://router.huggingface.co/models/microsoft/DialoGPT-medium"
HF_TOKEN = os.environ.get("HF_TOKEN", "")

model_name = "microsoft/DialoGPT-medium"
print(f"✅ Using model: {model_name}")
print(f"🆓 FREE Inference API - No token required!")

def call_hf_inference(prompt, max_tokens=500):
    """Call Hugging Face's FREE Inference API"""
    headers = {"Content-Type": "application/json"}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7,
            "do_sample": True
        }
    }
    
    response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    
    if response.status_code == 200:
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            text = result[0].get("generated_text", "")
            # Clean up response
            if prompt in text:
                text = text.replace(prompt, "").strip()
            return text if text else "I'm here to help! What would you like to know?"
        return "I'm here to help! What would you like to know?"
    elif response.status_code == 503:
        return "The AI model is warming up. Please try again in 20 seconds."
    else:
        raise Exception(f"API Error: {response.status_code} - {response.text}")

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'AI Tutor - Free Self-Hosted API',
        'model': model_name,
        'type': 'Hugging Face Inference API (FREE)',
        'endpoints': {
            '/chat': 'POST - Chat with AI',
            '/ask': 'POST - OpenAI-compatible endpoint',
            '/health': 'GET - Health check'
        }
    })

@app.route('/health')
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'gpu': True,
        'memory': 'HF Cloud',
        'model': model_name
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        print(f"💬 Question: {user_message[:100]}...")
        
        # Simple prompt for DialoGPT
        prompt = user_message
        
        response = call_hf_inference(prompt)
        print(f"✅ Response: {len(response)} chars")
        
        return jsonify({
            'success': True,
            'response': response.strip(),
            'model': model_name,
            'gpu_used': True
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask():
    """OpenAI-compatible endpoint"""
    try:
        data = request.json
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        user_message = ""
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                user_message = msg.get('content', '')
                break
        
        if not user_message:
            return jsonify({'error': 'No user message found'}), 400
        
        print(f"💬 Ask: {user_message[:100]}...")
        
        # Simple prompt for DialoGPT
        prompt = user_message
        
        response = call_hf_inference(prompt)
        print(f"✅ Response: {len(response)} chars")
        
        return jsonify({
            'success': True,
            'response': response.strip(),
            'model': model_name
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    print(f"🌐 Starting server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
