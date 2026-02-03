"""
J.A.R.V.I.S Backend - Render (Free Tier)
Ultra-stable Flask API with Gemini 1.5 Flash

Key Requirements:
- High-Speed Intent Routing for greetings/identity (no external API call) [cite: 03-02-2026]
- Gemini 1.5 Flash only (fast inference) [cite: 31-01-2026]
- Zero-Failure Fallback on any tool error
- Render-specific port: os.environ.get('PORT', 10000) and debug=False [cite: 31-01-2026]
- No-Link Protocol unless explicitly requested [cite: 31-01-2026]
"""

from __future__ import annotations

import os
import re
from datetime import datetime
from typing import Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except Exception:
    GENAI_AVAILABLE = False


# =============================
# Configuration
# =============================

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
PORT = int(os.environ.get("PORT", 10000))

FALLBACK_MESSAGE = "I am currently operating in internal reasoning mode to ensure stability."

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


def wants_links(text: str) -> bool:
    text = text.lower()
    keywords = ["link", "links", "url", "urls", "sources", "citations", "reference", "references", "research", "evidence"]
    return any(k in text for k in keywords)


def strip_links(text: str) -> str:
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"www\.\S+", "", text)
    return re.sub(r"\s{2,}", " ", text).strip()


# =============================
# Gemini Integration
# =============================

def build_system_prompt(user_query: str) -> str:
    return (
        "You are J.A.R.V.I.S, a concise and reliable assistant. "
        "Follow the No-Link Protocol: do not include URLs unless the user explicitly asks for sources, links, or research. "
        "If you are uncertain, say so briefly and avoid speculation. "
        "Keep responses short and focused for live demos."
    )


def call_gemini(user_query: str) -> str:
    if not GENAI_AVAILABLE or not GEMINI_API_KEY:
        return FALLBACK_MESSAGE

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"{build_system_prompt(user_query)}\n\nUser: {user_query}\nAssistant:"
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.6,
                "max_output_tokens": 800,
                "top_p": 0.9,
            },
        )
        text = (response.text or "").strip()
        if not text:
            return FALLBACK_MESSAGE
        return text
    except Exception:
        return FALLBACK_MESSAGE


# =============================
# Response Handler
# =============================

def handle_query(user_query: str) -> Dict:
    if is_greeting(user_query):
        return {
            "success": True,
            "answer": "Hello! I’m J.A.R.V.I.S. How can I help you today?",
            "engine": "fast-path",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    if is_identity_question(user_query):
        return {
            "success": True,
            "answer": "I’m J.A.R.V.I.S, your AI assistant. I was built to be fast, stable, and helpful for demos.",
            "engine": "fast-path",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    answer = call_gemini(user_query)

    if answer != FALLBACK_MESSAGE and not wants_links(user_query):
        answer = strip_links(answer)

    return {
        "success": True,
        "answer": answer,
        "engine": "gemini-1.5-flash",
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
        "endpoints": {
            "/": "GET - status",
            "/ask": "POST - main endpoint",
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
    user_query = (data.get("query") or data.get("message") or "").strip()

    if not user_query:
        return jsonify({
            "success": False,
            "answer": "Please provide a query.",
            "engine": "validation",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400

    result = handle_query(user_query)
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

    if not user_query:
        return jsonify({
            "success": False,
            "answer": "Please provide a message.",
            "engine": "validation",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400

    result = handle_query(user_query)
    return jsonify(result), 200


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return "", 204

    return jsonify({
        "status": "healthy",
        "gemini_available": GENAI_AVAILABLE,
        "api_key_set": bool(GEMINI_API_KEY),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False, use_reloader=False)
