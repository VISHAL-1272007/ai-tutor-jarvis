"""
J.A.R.V.I.S Backend - Render (Free Tier)
Ultra-stable Flask API with Groq Model Routing

Key Requirements:
- Model Selector: Route to different Groq models [cite: 03-02-2026]
- Coding Model: mixtral-8x7b-32768 [cite: 31-01-2026]
- General Model: llama3-70b-8192 [cite: 31-01-2026]
- Gemma Model: gemma-7b-it [cite: 31-01-2026]
- Default: llama3-8b-8192 (fallback) [cite: 03-02-2026]
- Zero-Failure Fallback with greeting on error
- Render-specific port: os.environ.get('PORT', 10000) and debug=False [cite: 31-01-2026]
"""

from __future__ import annotations

import os
import re
from datetime import datetime
from typing import Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    import httpx
    GROQ_AVAILABLE = True
except Exception:
    GROQ_AVAILABLE = False


# =============================
# Configuration
# =============================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
PORT = int(os.environ.get("PORT", 10000))

FALLBACK_MESSAGE = "I appreciate your question! I'm currently in internal reasoning mode to maintain stability for this important demonstration. Please try again in a moment."

# Model Mapping [cite: 03-02-2026]
GROQ_MODELS = {
    "coding": "mixtral-8x7b-32768",      # Coding Model [cite: 31-01-2026]
    "general": "llama3-70b-8192",         # General Model [cite: 31-01-2026]
    "gemma": "gemma-7b-it",               # Gemma Model [cite: 31-01-2026]
    "jarvis60": "llama3-8b-8192",        # Default JARVIS 6.0
}

# Initialize Flask
app = Flask(__name__)
CORS(app, resources={
    r"/": {"origins": "*", "methods": ["GET", "OPTIONS"]},
    r"/ask": {"origins": "*", "methods": ["POST", "OPTIONS"]},
    r"/chat": {"origins": "*", "methods": ["POST", "OPTIONS"]},
    r"/health": {"origins": "*", "methods": ["GET", "OPTIONS"]},
})


# =============================
# Intent Routing (Fast Path)
# =============================

def is_greeting(text: str) -> bool:
    text = text.strip().lower()
    return text in {"hi", "hello", "hey", "hiya", "yo", "good morning", "good afternoon", "good evening"}


def is_identity_question(text: str) -> bool:
    text = text.strip().lower()
    patterns = [
        r"who are you\??",
        r"what are you\??",
        r"who built you\??",
        r"who made you\??",
        r"who created you\??",
    ]
    return any(re.search(p, text) for p in patterns)


# =============================
# Groq Integration with Model Routing [cite: 03-02-2026]
# =============================

def call_groq(user_query: str, model: str = "jarvis60") -> str:
    """
    Call Groq API with model selection [cite: 03-02-2026]
    Falls back to stable greeting on error [cite: 03-02-2026]
    """
    if not GROQ_API_KEY:
        return FALLBACK_MESSAGE

    # Get selected model or default [cite: 03-02-2026]
    groq_model = GROQ_MODELS.get(model, "llama3-8b-8192")
    
    try:
        client = httpx.Client()
        response = client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": groq_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are J.A.R.V.I.S, a helpful AI assistant. Be concise and accurate."
                    },
                    {
                        "role": "user", 
                        "content": user_query
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000,
            },
            timeout=30.0
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return answer if answer else FALLBACK_MESSAGE
        else:
            return FALLBACK_MESSAGE
            
    except Exception as e:
        print(f"⚠️ Groq API error: {str(e)}")
        return FALLBACK_MESSAGE


# =============================
# Response Handler with Model Routing [cite: 03-02-2026]
# =============================

def handle_query(user_query: str, model: str = "jarvis60") -> Dict:
    """Handle query with model selection [cite: 03-02-2026]"""
    # Fast path for greetings (no API call needed)
    if is_greeting(user_query):
        return {
            "success": True,
            "answer": "Hello! I'm J.A.R.V.I.S. How can I help you today?",
            "engine": "fast-path",
            "model_used": model,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    if is_identity_question(user_query):
        return {
            "success": True,
            "answer": "I'm J.A.R.V.I.S, your AI assistant. I was built to be fast, stable, and helpful for demonstrations.",
            "engine": "fast-path",
            "model_used": model,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    # Route to selected Groq model [cite: 03-02-2026]
    answer = call_groq(user_query, model)

    return {
        "success": True,
        "answer": answer,
        "engine": f"Groq {GROQ_MODELS.get(model, 'llama3-8b-8192')}",
        "model_used": model,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# =============================
# API Endpoints
# =============================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "J.A.R.V.I.S backend is running",
        "version": "6.0-render",
        "models": {
            "coding": "mixtral-8x7b-32768",
            "general": "llama3-70b-8192",
            "gemma": "gemma-7b-it",
            "jarvis60": "llama3-8b-8192 (default)"
        },
        "endpoints": {
            "/": "GET - status",
            "/ask": "POST - main endpoint with model selection",
            "/chat": "POST - alias for /ask",
            "/health": "GET - health check",
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }), 200


@app.route("/ask", methods=["POST", "OPTIONS"])
def ask():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    user_query = (data.get("question") or data.get("query") or data.get("message") or "").strip()
    model = data.get("model", "jarvis60")  # Get selected model [cite: 03-02-2026]

    if not user_query:
        return jsonify({
            "success": False,
            "answer": "Please provide a query.",
            "engine": "validation",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400

    result = handle_query(user_query, model)
    return jsonify(result), 200


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}

    if "messages" in data:
        messages = data.get("messages") or []
        user_query = (messages[-1].get("content") if messages else "") or ""
    else:
        user_query = data.get("message") or data.get("query") or ""

    user_query = user_query.strip()
    model = data.get("model", "jarvis60")  # Get selected model [cite: 03-02-2026]

    if not user_query:
        return jsonify({
            "success": False,
            "answer": "Please provide a message.",
            "engine": "validation",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400

    result = handle_query(user_query, model)
    return jsonify(result), 200


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return "", 204

    return jsonify({
        "status": "healthy",
        "groq_available": GROQ_AVAILABLE,
        "api_key_set": bool(GROQ_API_KEY),
        "models_supported": list(GROQ_MODELS.keys()),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }), 200


if __name__ == "__main__":
    print("=" * 70)
    print("🤖 J.A.R.V.I.S 6.0 Backend - Render Deployment")
    print("=" * 70)
    print(f"🚀 Server starting on port {PORT}...")
    print(f"✅ Groq API: {'Available' if GROQ_API_KEY else 'NOT configured'}")
    print(f"📦 Models:")
    for name, model in GROQ_MODELS.items():
        print(f"   - {name}: {model}")
    print("=" * 70)
    app.run(host="0.0.0.0", port=PORT, debug=False, use_reloader=False)
