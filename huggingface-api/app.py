"""
FREE AI API using Hugging Face Models
Completely free hosting on Hugging Face Spaces
No credit card required!
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import os

app = Flask(__name__)
CORS(app)

# Load model once at startup (free GPU from Hugging Face)
print("🔄 Loading AI model...")
model_name = "microsoft/phi-2"  # Small, fast, smart model (2.7B parameters)

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto",
        trust_remote_code=True
    )
    print(f"✅ Model loaded: {model_name}")
    print(f"🚀 Using GPU: {torch.cuda.is_available()}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    tokenizer = None

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'AI Tutor - Free Self-Hosted API',
        'model': model_name,
        'gpu_available': torch.cuda.is_available(),
        'endpoints': {
            '/chat': 'POST - Chat with AI',
            '/health': 'GET - Health check'
        }
    })

@app.route('/health')
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'gpu': torch.cuda.is_available(),
        'memory': f"{torch.cuda.memory_allocated() / 1e9:.2f}GB" if torch.cuda.is_available() else "CPU"
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    Body: { "message": "Your question here" }
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Generate response
        print(f"💬 Question: {user_message[:100]}...")
        
        # Format prompt for educational context
        prompt = f"""You are a helpful AI tutor. Answer the student's question clearly and concisely.

Student: {user_message}
AI Tutor:"""
        
        # Tokenize and generate
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        
        if torch.cuda.is_available():
            inputs = {k: v.to('cuda') for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=500,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the AI's response (after "AI Tutor:")
        if "AI Tutor:" in response:
            response = response.split("AI Tutor:")[-1].strip()
        
        print(f"✅ Response generated: {len(response)} chars")
        
        return jsonify({
            'success': True,
            'response': response,
            'model': model_name,
            'gpu_used': torch.cuda.is_available()
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/ask', methods=['POST'])
def ask():
    """
    OpenAI-compatible endpoint for your existing backend
    Body: { "messages": [{"role": "user", "content": "..."}] }
    """
    try:
        data = request.json
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        # Get last user message
        user_message = messages[-1].get('content', '')
        
        # Use the chat endpoint logic
        result = chat_internal(user_message)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def chat_internal(message):
    """Internal chat function"""
    if model is None:
        return {'success': False, 'error': 'Model not loaded'}
    
    try:
        prompt = f"""You are a helpful AI tutor. Answer clearly and concisely.

Student: {message}
AI Tutor:"""
        
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        
        if torch.cuda.is_available():
            inputs = {k: v.to('cuda') for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=500,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        if "AI Tutor:" in response:
            response = response.split("AI Tutor:")[-1].strip()
        
        return {
            'success': True,
            'response': response,
            'model': model_name
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    print(f"🚀 Starting server on port {port}...")
    print(f"📊 Model: {model_name}")
    print(f"💻 GPU: {torch.cuda.is_available()}")
    app.run(host='0.0.0.0', port=port, debug=False)
