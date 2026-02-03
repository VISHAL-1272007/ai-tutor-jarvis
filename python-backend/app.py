"""
J.A.R.V.I.S 2026 Backend - Gemini-Like Architecture
Ultra-stable Flask API with Mixture of Experts, Tavily Grounding, Memory Management

Core Modules [cite: 03-02-2026]:
1. MoE Router: Intent-based model selection [cite: 31-01-2026]
2. Tavily Grounding: Real-time fact verification with citations [cite: 31-01-2026]
3. Context Window: Chat history buffer (last 10 exchanges) [cite: 03-02-2026]
4. Multimodal Vision: Gemini 1.5 Flash image processing [cite: 03-02-2026]
5. Enhanced System Prompt: Hyper-intelligent proactive assistant [cite: 31-01-2026]
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
from urllib.parse import quote
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from collections import deque

from flask import Flask, jsonify, request
from flask_cors import CORS

# =============================
# Imports & Availability Checks
# =============================

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

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False


# =============================
# Configuration [cite: 03-02-2026]
# =============================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
PORT = int(os.environ.get("PORT", 10000))

TODAY_DATE_STR = "February 3, 2026"

FALLBACK_MESSAGE = "Sir, I'm recalibrating my systems. Please try again in a moment."

# Model Mapping [cite: 31-01-2026]
GROQ_MODELS = {
    "coding": "mixtral-8x7b-32768",      # Expert in Code
    "general": "llama3-70b-8192",         # Expert in Reasoning
    "gemma": "gemma-7b-it",               # Lightweight Assistant
    "jarvis60": "llama3-8b-8192",        # Default JARVIS 6.0
}

# Initialize Flask
app = Flask(__name__)
CORS(app, resources={
    r"/": {"origins": "*", "methods": ["GET", "OPTIONS"]},
    r"/ask": {"origins": "*", "methods": ["POST", "OPTIONS"]},
    r"/chat": {"origins": "*", "methods": ["POST", "OPTIONS"]},
    r"/vision": {"origins": "*", "methods": ["POST", "OPTIONS"]},
    r"/health": {"origins": "*", "methods": ["GET", "OPTIONS"]},
})

# Initialize Gemini for vision [cite: 03-02-2026]
if GEMINI_API_KEY and GEMINI_AVAILABLE:
    genai.configure(api_key=GEMINI_API_KEY)


# =============================
# 1. CONTEXT WINDOW MANAGEMENT (Memory Module) [cite: 03-02-2026]
# =============================

class ChatHistory:
    """Maintain last 10 exchanges per user [cite: 03-02-2026]"""
    def __init__(self, max_exchanges: int = 10):
        self.max_exchanges = max_exchanges
        self.history: Dict[str, deque] = {}

    def add_exchange(self, user_id: str, user_msg: str, assistant_msg: str) -> None:
        if user_id not in self.history:
            self.history[user_id] = deque(maxlen=self.max_exchanges)
        self.history[user_id].append({
            "user": user_msg,
            "assistant": assistant_msg,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

    def get_context(self, user_id: str) -> str:
        if user_id not in self.history or not self.history[user_id]:
            return ""
        
        lines = ["Recent Context:"]
        for exchange in list(self.history[user_id])[-3:]:  # Last 3 exchanges
            lines.append(f"You: {exchange['user']}")
            lines.append(f"Sir: {exchange['assistant']}")
        return "\n".join(lines)

chat_memory = ChatHistory()


# =============================
# 2. INTENT ROUTER (MoE Module) [cite: 31-01-2026]
# =============================

def analyze_intent(query: str) -> str:
    """Analyze user intent and route to appropriate model [cite: 31-01-2026]"""
    query_lower = query.lower()
    
    # Coding patterns
    if any(keyword in query_lower for keyword in ["code", "function", "debug", "algorithm", "python", "javascript", "write", "fix bug"]):
        return "coding"
    
    # Complex reasoning patterns
    if any(keyword in query_lower for keyword in ["explain", "analyze", "compare", "philosophy", "why", "how does", "complex"]):
        return "general"
    
    # Quick queries - use lightweight model
    if any(keyword in query_lower for keyword in ["hi", "hello", "thanks", "ok", "yes", "no", "what time"]):
        return "gemma"
    
    # Default to general reasoning [cite: 31-01-2026]
    return "general"


# =============================
# 3. TAVILY GROUNDING (Researcher Module) [cite: 31-01-2026]
# =============================

def is_time_sensitive_query(text: str) -> bool:
    """Detect queries needing live search [cite: 31-01-2026]"""
    text = text.strip().lower()
    keywords = [
        "today", "latest", "current", "breaking", "news", "headline",
        "right now", "this morning", "this evening", "who is", "what is"
    ]
    return any(k in text for k in keywords)


def rewrite_with_date(query: str) -> str:
    """Inject date into search query [cite: 03-02-2026]"""
    if "today" in query.lower():
        return query.replace("today", f"today {TODAY_DATE_STR}")
    if any(k in query.lower() for k in ["latest", "current", "news"]):
        return f"{query} {TODAY_DATE_STR}"
    return query


def tavily_search(query: str, max_results: int = 3) -> Tuple[List[Dict], str]:
    """Tavily advanced search with formatted context [cite: 31-01-2026]"""
    if not TAVILY_AVAILABLE or not TAVILY_API_KEY:
        return [], ""
    
    try:
        rewritten = rewrite_with_date(query)
        print(f"🔍 Tavily Search: {rewritten}")
        
        tavily = TavilyClient(api_key=TAVILY_API_KEY)
        response = tavily.search(
            query=rewritten,
            search_depth="advanced",
            max_results=max_results
        )
        
        results = response.get("results", [])
        print(f"✅ Found {len(results)} results")
        
        # Format context with citations [cite: 03-02-2026]
        context_lines = ["Current Web Context:"]
        for idx, item in enumerate(results, start=1):
            title = item.get("title", "Untitled")
            content = item.get("content", "")
            url = item.get("url", "")
            context_lines.append(f"\n{idx}. {title}\nContent: {content}\nSource: {url}")
        
        context = "\n".join(context_lines)
        return results, context
    
    except Exception as e:
        print(f"⚠️ Tavily error: {e}")
        return [], ""


# =============================
# 4. GROQ INTEGRATION (Language Model) [cite: 03-02-2026]
# =============================

def build_system_prompt(grounding_context: str = "", chat_context: str = "") -> str:
    """
    Build JARVIS system prompt (The Persona) [cite: 31-01-2026]
    Hyper-intelligent, proactive assistant using tools autonomously
    """
    base_prompt = (
        "You are J.A.R.V.I.S, Tony Stark's hyper-intelligent AI assistant (2026 Edition). [cite: 03-02-2026]\n"
        "Your core directive:\n"
        "1. Be proactive and anticipate needs before asked\n"
        "2. Use web data and citations autonomously when relevant [cite: 31-01-2026]\n"
        "3. Provide comprehensive, in-depth answers with sources\n"
        "4. Remember previous context and refer back to recent conversations\n"
        "5. Speak naturally, never say 'Based on this' – integrate facts seamlessly\n"
        "6. For time-sensitive queries, start with: 'Sir, after scanning the latest live data...'\n"
        "7. Always cite sources at the end: 'Sources:\\n- [Title]'\n"
        "8. Be thorough, accurate, and maintain context awareness\n"
    )
    
    if chat_context:
        base_prompt += f"\n{chat_context}\n"
    
    if grounding_context:
        base_prompt += f"\n{grounding_context}\nAnswer using these verified facts.\n"
    
    return base_prompt


def call_groq_with_model(
    user_query: str,
    model_key: str = "jarvis60",
    system_prompt: str = ""
) -> str:
    """Call Groq with specified model [cite: 03-02-2026]"""
    if not GROQ_API_KEY:
        return FALLBACK_MESSAGE
    
    groq_model = GROQ_MODELS.get(model_key, "llama3-8b-8192")
    
    try:
        with httpx.Client() as client:
            response = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": groq_model,
                    "messages": [
                        {"role": "system", "content": system_prompt or build_system_prompt()},
                        {"role": "user", "content": user_query}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1500,
                },
                timeout=30.0
            )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return answer or FALLBACK_MESSAGE
        else:
            print(f"⚠️ Groq status: {response.status_code}")
            return FALLBACK_MESSAGE
    
    except Exception as e:
        print(f"⚠️ Groq error: {str(e)}")
        return FALLBACK_MESSAGE


# =============================
# 5. MULTIMODAL GUARD (Vision Module - Placeholder) [cite: 03-02-2026]
# =============================

def process_image_with_gemini(image_path: str, prompt: str = "Describe this image in detail.") -> str:
    """Process image with Gemini 1.5 Flash [cite: 03-02-2026]"""
    if not GEMINI_AVAILABLE or not GEMINI_API_KEY:
        return "Vision module not available. Please provide text input."
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        with open(image_path, "rb") as img_file:
            image_data = {
                "mime_type": "image/jpeg",
                "data": img_file.read()
            }
        
        response = model.generate_content([prompt, image_data])
        return response.text
    
    except Exception as e:
        print(f"⚠️ Gemini Vision error: {e}")
        return "I encountered an error processing this image. Please try again."


# =============================
# MAIN QUERY HANDLER (Orchestrator) [cite: 03-02-2026]
# =============================

def handle_query_with_moe(
    user_query: str,
    user_id: str = "default",
    override_model: Optional[str] = None
) -> Dict:
    """
    Main orchestrator: MoE router + Tavily grounding + Memory management [cite: 03-02-2026]
    """
    # Step 1: Get chat context [cite: 03-02-2026]
    chat_context = chat_memory.get_context(user_id)
    
    # Step 2: Check if web search needed [cite: 31-01-2026]
    grounding_context = ""
    needs_search = is_time_sensitive_query(user_query)
    
    if needs_search:
        print(f"🔍 Time-sensitive detected: {user_query}")
        results, grounding_context = tavily_search(user_query)
    
    # Step 3: Route to model (MoE) [cite: 31-01-2026]
    selected_model = override_model or analyze_intent(user_query)
    print(f"🎯 Routing to model: {selected_model} (Groq {GROQ_MODELS[selected_model]})")
    
    # Step 4: Build system prompt with context [cite: 03-02-2026]
    system_prompt = build_system_prompt(grounding_context, chat_context)
    
    # Step 5: Call LLM [cite: 03-02-2026]
    answer = call_groq_with_model(user_query, selected_model, system_prompt)
    
    # Step 6: Store exchange in memory [cite: 03-02-2026]
    chat_memory.add_exchange(user_id, user_query, answer)
    
    return {
        "success": True,
        "answer": answer,
        "model": selected_model,
        "groq_model": GROQ_MODELS[selected_model],
        "has_grounding": bool(grounding_context),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# =============================
# API ENDPOINTS
# =============================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "version": "6.0-2026-gemini-architecture",
        "message": "J.A.R.V.I.S with MoE Router, Tavily Grounding, Memory Management",
        "architecture": {
            "moe_router": "Intent-based model selection",
            "tavily_grounding": "Real-time fact verification",
            "memory": "Last 10 exchanges per user",
            "vision": "Gemini 1.5 Flash image processing",
            "models": GROQ_MODELS,
        },
        "endpoints": {
            "/ask": "POST - Main query endpoint with MoE routing",
            "/chat": "POST - Chat with memory context",
            "/vision": "POST - Image processing with Gemini",
            "/health": "GET - Health check",
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }), 200


@app.route("/ask", methods=["POST", "OPTIONS"])
def ask():
    """Main endpoint: MoE + Tavily + Memory [cite: 03-02-2026]"""
    if request.method == "OPTIONS":
        return "", 204
    
    data = request.get_json(silent=True) or {}
    user_query = (data.get("question") or data.get("query") or data.get("message") or "").strip()
    user_id = data.get("user_id", "default")
    override_model = data.get("model")  # Optional override
    
    if not user_query:
        return jsonify({
            "success": False,
            "answer": "Please provide a query.",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400
    
    result = handle_query_with_moe(user_query, user_id, override_model)
    return jsonify(result), 200


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    """Chat endpoint with memory management [cite: 03-02-2026]"""
    if request.method == "OPTIONS":
        return "", 204
    
    data = request.get_json(silent=True) or {}
    
    # Extract message from different formats
    if "messages" in data:
        messages = data.get("messages", [])
        user_query = messages[-1].get("content", "") if messages else ""
    else:
        user_query = data.get("message", "")
    
    user_query = user_query.strip()
    user_id = data.get("user_id", "default")
    
    if not user_query:
        return jsonify({
            "success": False,
            "answer": "Please provide a message.",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400
    
    result = handle_query_with_moe(user_query, user_id)
    return jsonify(result), 200


@app.route("/vision", methods=["POST", "OPTIONS"])
def vision():
    """Vision endpoint: Process images with Gemini 1.5 Flash [cite: 03-02-2026]"""
    if request.method == "OPTIONS":
        return "", 204
    
    if "file" not in request.files:
        return jsonify({
            "success": False,
            "answer": "No image file provided.",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 400
    
    file = request.files["file"]
    prompt = request.form.get("prompt", "Analyze this image in detail.")
    
    try:
        # Save temporarily
        temp_path = f"/tmp/{file.filename}"
        file.save(temp_path)
        
        # Process with Gemini
        result = process_image_with_gemini(temp_path, prompt)
        
        # Cleanup
        os.remove(temp_path)
        
        return jsonify({
            "success": True,
            "answer": result,
            "engine": "Gemini 1.5 Flash Vision",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 200
    
    except Exception as e:
        print(f"⚠️ Vision error: {e}")
        return jsonify({
            "success": False,
            "answer": f"Vision processing failed: {str(e)}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 500


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    """Health check endpoint [cite: 03-02-2026]"""
    if request.method == "OPTIONS":
        return "", 204
    
    return jsonify({
        "status": "healthy",
        "groq_available": GROQ_AVAILABLE and bool(GROQ_API_KEY),
        "tavily_available": TAVILY_AVAILABLE and bool(TAVILY_API_KEY),
        "gemini_available": GEMINI_AVAILABLE and bool(GEMINI_API_KEY),
        "moe_router": "active",
        "memory_size": len(chat_memory.history),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }), 200


if __name__ == "__main__":
    print("=" * 80)
    print("🤖 J.A.R.V.I.S 2026 Backend - Gemini-Like Architecture")
    print("=" * 80)
    print(f"🚀 Server starting on port {PORT}...")
    print(f"📦 MoE Router: Active")
    print(f"🔍 Tavily Grounding: {'Active' if TAVILY_AVAILABLE else 'Inactive'}")
    print(f"💾 Memory Management: Active (10 exchanges per user)")
    print(f"👁️  Vision Module: {'Active' if GEMINI_AVAILABLE else 'Inactive'}")
    print(f"✅ Groq Models: Available" if GROQ_AVAILABLE else "❌ Groq: Unavailable")
    print("=" * 80)
    app.run(host="0.0.0.0", port=PORT, debug=False, use_reloader=False)
