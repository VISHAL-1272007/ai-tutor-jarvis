"""
JARVIS AI - Python Flask Backend with Real-Time Tavily Search
Using Groq Llama-3.1-8b-instant + Tavily for Current Data
==============================================================

Features:
- Real-time web search via Tavily API
- Current date context (January 29, 2026)
- Optimized for fast responses
- Comprehensive error handling
- CORS enabled for Firebase frontend
"""

import io
import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, List, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Try to import Tavily
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False
    print("⚠️  Tavily SDK not installed - install with: pip install tavily-python")


ROOT_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.join(ROOT_DIR, '..', 'backend', '.env')
LOG_PATH = os.path.join(ROOT_DIR, 'python-backend.log')

# Load environment variables
load_dotenv(ENV_PATH)

# API Keys
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")

if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY is not set!")
if not TAVILY_API_KEY:
    print("⚠️  WARNING: TAVILY_API_KEY is not set!")


def configure_logging():
    """Configure UTF-8 safe logging"""
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger("jarvis")


logger = configure_logging()

# Initialize Flask
app = Flask(__name__)

# ===== CRITICAL: Enable CORS for Firebase Frontend =====
CORS(app, resources={
    r"/ask": {"origins": "*", "methods": ["POST", "OPTIONS"]},
    r"/health": {"origins": "*", "methods": ["GET", "OPTIONS"]},
})

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Initialize Tavily client for real-time search
tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if (TAVILY_AVAILABLE and TAVILY_API_KEY) else None

PORT = int(os.environ.get("FLASK_PORT", 3000))


# ============================================================================
# INTENT CLASSIFICATION
# ============================================================================

def should_search(user_query: str) -> bool:
    """
    Determine if query needs real-time web search.
    
    Returns True for queries about:
    - Current events, news, breaking news
    - Live prices (crypto, stocks, gold, etc.)
    - Weather, climate
    - Today's date, current time
    - Latest updates, recent developments
    - 2026-related information
    - Real-time data
    """
    search_keywords = [
        'now', 'today', 'current', 'latest', 'news', 'breaking', 'live',
        'trending', 'recent', 'price', 'stock', 'crypto', 'bitcoin', 'weather',
        'forecast', '2026', 'right now', 'this week', 'this month',
        'gold price', 'oil price', 'exchange rate', 'market', 'update',
        'what is', 'who is', 'where is', 'when is', 'how much',
        'best', 'top', 'new', 'released', 'launched', 'announced'
    ]
    
    query_lower = user_query.lower()
    return any(keyword in query_lower for keyword in search_keywords)


def conduct_tavily_search(query: str) -> Tuple[str, List[Dict]]:
    """
    Execute Tavily web search for real-time information.
    
    Returns: (context_string, sources_list)
    """
    if not tavily_client:
        logger.warning("⚠️  Tavily not configured - skipping search")
        return "", []
    
    try:
        logger.info(f"[SEARCH] Tavily searching: {query[:80]}...")
        
        # Search with Tavily for current information
        search_result = tavily_client.search(
            query=query,
            topic="general",  # Get comprehensive results
            search_depth="advanced",
            max_results=5,
            include_answer=True
        )
        
        all_results = []
        sources_list = []
        
        # Collect direct answer if available
        if search_result.get("answer"):
            all_results.append({
                "title": "Tavily Search Answer",
                "snippet": search_result["answer"],
                "url": "https://tavily.com"
            })
        
        # Collect search results
        if search_result.get("results"):
            for result in search_result["results"]:
                all_results.append({
                    "title": result.get("title", "Untitled"),
                    "snippet": result.get("snippet", ""),
                    "url": result.get("url", "https://tavily.com")
                })
        
        # Format context for LLM
        context = ""
        for idx, result in enumerate(all_results, 1):
            context += f"[{idx}] {result['title']}\n{result['snippet']}\n"
            if result['url']:
                context += f"Source: {result['url']}\n"
            context += "\n"
            
            # Add to sources for frontend
            sources_list.append({
                "title": result['title'],
                "url": result['url'],
                "snippet": result['snippet'][:100] + "..." if len(result['snippet']) > 100 else result['snippet']
            })
        
        logger.info(f"✅ Found {len(all_results)} results from Tavily")
        return context.strip(), sources_list
        
    except Exception as e:
        logger.error(f"❌ Tavily search error: {str(e)}")
        return "", []


# ============================================================================
# RESPONSE GENERATION
# ============================================================================

def generate_jarvis_response(user_query: str, search_context: str = "") -> Dict:
    """
    Generate response using Groq with optional Tavily context.
    
    Returns: {
        "success": bool,
        "answer": str,
        "engine": str,
        "sources": list,
        "timestamp": str
    }
    """
    if not groq_client:
        return {
            "success": False,
            "answer": "❌ JARVIS AI engine is offline. Check GROQ_API_KEY.",
            "engine": "groq-llama-3.1-8b-instant",
            "sources": [],
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        logger.info(f"[GENERATE] Creating response for: {user_query[:80]}...")
        
        # JARVIS Personality System Prompt
        system_prompt = """You are JARVIS, an advanced AI assistant with access to real-time web data.

Your role:
- Address user as "Boss" occasionally (natural, not forced)
- Provide accurate, current information (date is January 29, 2026)
- Use search context when provided (cite as [1], [2], etc.)
- Professional yet witty - balance efficiency with personality
- Always honest - say "I don't know" if uncertain
- Reference Tony Stark/Iron Man when appropriate

Communication:
- For current info: Lead with facts, then explain
- For timeless questions: Provide comprehensive answer
- Use markdown formatting for clarity
- Keep responses concise but complete"""
        
        # Build user message with search context if available
        if search_context:
            user_message = f"""Based on current web data (January 29, 2026):

{search_context}

---

User question: {user_query}

Provide an answer using the search results above. Include citations like [1], [2], etc."""
        else:
            user_message = user_query
        
        # Call Groq API
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9
        )
        
        answer = response.choices[0].message.content.strip()
        
        logger.info(f"✅ Response generated ({len(answer)} chars)")
        
        return {
            "success": True,
            "answer": answer,
            "engine": "groq-llama-3.1-8b-instant",
            "sources": [],  # Sources added by Tavily if search was performed
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Response generation error: {str(e)}")
        
        return {
            "success": False,
            "answer": f"⚠️  Error processing request: {str(e)}",
            "engine": "groq-llama-3.1-8b-instant",
            "sources": [],
            "timestamp": datetime.now().isoformat()
        }


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/ask', methods=['POST', 'OPTIONS'])
def ask_endpoint():
    """
    Main endpoint for JARVIS queries with optional Tavily search.
    
    Request: {
        "query": "Your question here"
    }
    
    Response: {
        "success": bool,
        "answer": str,
        "engine": str,
        "sources": list,
        "timestamp": str
    }
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "answer": "❌ Missing 'query' field in request body",
                "engine": "groq-llama-3.1-8b-instant",
                "sources": [],
                "timestamp": datetime.now().isoformat()
            }), 400
        
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return jsonify({
                "success": False,
                "answer": "❌ Query cannot be empty",
                "engine": "groq-llama-3.1-8b-instant",
                "sources": [],
                "timestamp": datetime.now().isoformat()
            }), 400
        
        logger.info(f"📨 Query received: {user_query[:100]}...")
        
        # Step 1: Decide if search is needed
        needs_search = should_search(user_query)
        search_context = ""
        sources = []
        
        if needs_search and tavily_client:
            logger.info("🔍 Real-time search required - calling Tavily...")
            search_context, sources = conduct_tavily_search(user_query)
        
        # Step 2: Generate response with or without context
        result = generate_jarvis_response(user_query, search_context)
        result["sources"] = sources
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Endpoint error: {str(e)}")
        
        return jsonify({
            "success": False,
            "answer": f"❌ Server error: {str(e)}",
            "engine": "groq-llama-3.1-8b-instant",
            "sources": [],
            "timestamp": datetime.now().isoformat()
        }), 500


@app.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    """
    Health check endpoint.
    
    Response: {
        "status": "healthy" | "degraded",
        "groq_available": bool,
        "tavily_available": bool,
        "timestamp": str
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    return jsonify({
        "status": "healthy" if (groq_client and tavily_client) else "degraded",
        "groq_available": groq_client is not None,
        "tavily_available": tavily_client is not None,
        "timestamp": datetime.now().isoformat()
    }), 200


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "answer": "❌ Endpoint not found. Available: /ask, /health",
        "engine": "groq-llama-3.1-8b-instant",
        "sources": [],
        "timestamp": datetime.now().isoformat()
    }), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"❌ Server error: {str(error)}")
    return jsonify({
        "success": False,
        "answer": "❌ Internal server error. Try again later.",
        "engine": "groq-llama-3.1-8b-instant",
        "sources": [],
        "timestamp": datetime.now().isoformat()
    }), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("=" * 70)
    logger.info("🤖 JARVIS AI - Real-Time Web Search Backend")
    logger.info("=" * 70)
    logger.info(f"🚀 Starting server on port {PORT}...")
    logger.info(f"✅ CORS enabled for Firebase frontend")
    logger.info(f"✅ Groq API: {'Available' if groq_client else 'NOT configured'}")
    logger.info(f"✅ Tavily API: {'Available' if tavily_client else 'NOT configured'}")
    logger.info(f"🧠 Model: Llama-3.1-8b-instant")
    logger.info(f"📅 Current Date: January 29, 2026")
    logger.info("=" * 70)
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False,
        use_reloader=False
    )
