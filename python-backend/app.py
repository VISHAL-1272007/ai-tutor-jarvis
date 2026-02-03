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

import json
import os
import re
from urllib.parse import quote
from datetime import datetime
from typing import Dict, List, Optional

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    import httpx
    GROQ_AVAILABLE = True
except Exception:
    GROQ_AVAILABLE = False

try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except Exception:
    TAVILY_AVAILABLE = False


# =============================
# Configuration
# =============================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
PORT = int(os.environ.get("PORT", 10000))

TODAY_DATE_STR = "February 3, 2026"

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


def is_time_sensitive_query(text: str) -> bool:
    """Detect queries needing live search [cite: 31-01-2026]"""
    text = text.strip().lower()
    keywords = [
        "today",
        "latest",
        "current",
        "current events",
        "breaking",
        "news",
        "headline",
        "right now",
        "this morning",
        "this evening",
    ]
    # Also trigger on who/what questions [cite: 31-01-2026]
    question_patterns = [
        r"^who is",
        r"^what is",
        r"^who are",
        r"^what are",
    ]
    return any(k in text for k in keywords) or any(re.match(p, text) for p in question_patterns)


def rewrite_time_sensitive_query(text: str) -> str:
    """Hardcode Feb 3, 2026 into search queries [cite: 03-02-2026]"""
    text_lower = text.lower()
    if "today" in text_lower:
        text = text.replace("today", f"today {TODAY_DATE_STR}")
    elif "latest" in text_lower or "current" in text_lower or "news" in text_lower:
        text = f"{text} {TODAY_DATE_STR}"
    return text


def tavily_search(query: str, max_results: int = 3) -> List[Dict]:
    """Tavily advanced search integration [cite: 31-01-2026]"""
    if not TAVILY_AVAILABLE or not TAVILY_API_KEY:
        print("⚠️ Tavily not available")
        return []
    try:
        rewritten = rewrite_time_sensitive_query(query)
        print(f"🔍 Tavily Advanced Search: {rewritten}")
        
        tavily = TavilyClient(api_key=TAVILY_API_KEY)
        response = tavily.search(
            query=rewritten,
            search_depth="advanced",
            max_results=max_results
        )
        
        results = response.get("results", [])
        print(f"✅ Found {len(results)} results")
        return results
    except Exception as e:
        print(f"⚠️ Tavily error: {e}")
        return []


def format_search_context(results: List[Dict]) -> str:
    """Format Tavily results with content and Google search URLs [cite: 03-02-2026]"""
    if not results:
        return ""
    lines = ["Current Web Context:"]
    for idx, item in enumerate(results, start=1):
        title = item.get("title") or "Untitled"
        content = item.get("content") or ""
        url = item.get("url") or ""
        google_link = f"https://www.google.com/search?q={quote(url)}" if url else ""
        lines.append(f"\n{idx}. {title}\nContent: {content}\nURL: {google_link}")
    return "\n".join(lines)


def ensure_jarvis_response(answer: str, has_search: bool) -> str:
    """JARVIS research-style response with citations [cite: 03-02-2026]"""
    cleaned = re.sub(r"^(Based on (this|the).*?:|According to.*?:)\s*", "", answer, flags=re.IGNORECASE).strip()

    if has_search:
        if cleaned.lower().startswith("sir, after scanning the latest live data"):
            return cleaned
        prefix = "Sir, after scanning the latest live data..."
        return f"{prefix}\n\n{cleaned}"
    return cleaned


# =============================
# Groq Integration with Direct Search [cite: 03-02-2026]
# =============================

def call_groq(user_query: str, model: str = "jarvis60", search_context: str = "") -> str:
    """
    Call Groq API with direct search context injection [cite: 03-02-2026]
    Falls back to stable greeting on error [cite: 03-02-2026]
    """
    if not GROQ_API_KEY:
        return FALLBACK_MESSAGE

    groq_model = GROQ_MODELS.get(model, "llama3-8b-8192")
    
    try:
        # JARVIS research persona system prompt [cite: 03-02-2026]
        system_content = (
            "You are J.A.R.V.I.S, Tony Stark's AI assistant. "
            "When web context is provided, you MUST:"
            "\n1. Start with: 'Sir, after scanning the latest live data...'"
            "\n2. Provide a comprehensive, in-depth answer using ONLY the provided context"
            "\n3. Never say 'Based on this' or 'According to' - speak naturally"
            "\n4. At the end, list sources as: 'Sources:\n- [Title]'"
            "\n5. Be thorough and detailed like Gemini or Perplexity"
        )
        
        if search_context:
            system_content += f"\n\n{search_context}\n\nAnswer the user's question comprehensively using these facts."
        
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
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": user_query}
                ],
                "temperature": 0.7,
                "max_tokens": 1200,
            },
            timeout=30.0
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return answer if answer else FALLBACK_MESSAGE
        else:
            print(f"⚠️ Groq API status: {response.status_code}")
            return FALLBACK_MESSAGE
            
    except Exception as e:
        print(f"⚠️ Groq API error: {str(e)}")
        return FALLBACK_MESSAGE


# =============================
# Response Handler with Model Routing [cite: 03-02-2026]
# =============================

def handle_query(user_query: str, model: str = "jarvis60") -> Dict:
    """Handle query with direct search integration [cite: 03-02-2026]"""
    # Fast path for greetings
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

    # Tavily search integration with fallback [cite: 03-02-2026]
    search_context = ""
    time_sensitive = is_time_sensitive_query(user_query)
    
    if time_sensitive:
        print(f"🔍 Time-sensitive query detected: {user_query}")
        try:
            web_results = tavily_search(user_query, max_results=3)
            if web_results:
                search_context = format_search_context(web_results)
                print(f"✅ Context prepared with {len(web_results)} results")
            else:
                print("⚠️ No search results found, using internal knowledge")
        except Exception as e:
            print(f"⚠️ Search failed: {e}, falling back to internal knowledge")

    # Call Groq with injected context [cite: 03-02-2026]
    answer = call_groq(user_query, model, search_context=search_context)

    # Apply JARVIS response format [cite: 31-01-2026]
    answer = ensure_jarvis_response(answer, has_search=bool(search_context))

    return {
        "success": True,
        "answer": answer,
        "engine": f"Groq {GROQ_MODELS.get(model, 'llama3-8b-8192')}" + (" + Web Search" if search_context else ""),
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
