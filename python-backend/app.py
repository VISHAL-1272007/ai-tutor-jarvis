"""
JARVIS AI - Python Flask Backend with Agentic Search Workflow
Using Groq Llama-3.3-70B + Tavily Advanced Search
==============================================================

Architecture:
- classify_intent() -> Determines if research is needed + generates 3 optimized queries
- conduct_research() -> Tavily search with advanced depth and aggregation
- generate_final_response() -> Llama synthesis with research context
- ask_jarvis() -> Main endpoint orchestrating the agentic workflow
"""

import io
import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Try to import Tavily (may not be installed)
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False
    print("WARNING: Tavily SDK not installed - install with: pip install tavily-python")


ROOT_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.join(ROOT_DIR, '..', 'backend', '.env')
LOG_PATH = os.path.join(ROOT_DIR, 'python-backend.log')

# Load environment variables
load_dotenv(ENV_PATH)

# API Keys
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set!")
if not TAVILY_API_KEY:
    print("WARNING: TAVILY_API_KEY is not set!")


def configure_logging():
    """Configure UTF-8 safe logging"""
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger("jarvis-agentic")


logger = configure_logging()

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Initialize Tavily client
tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if (TAVILY_AVAILABLE and TAVILY_API_KEY) else None

PORT = int(os.environ.get("FLASK_PORT", 3000))


# ============================================================================
# AGENTIC WORKFLOW FUNCTIONS
# ============================================================================

def classify_intent(user_query: str) -> Dict:
    """
    Step 1: Analyze query intent using Llama-3.3
    Determines if query needs real-time 2026 data and generates 3 optimized searches
    """
    if not groq_client:
        return {"needs_search": False, "reason": "Groq not configured"}
    
    try:
        logger.info(f"[CLASSIFY] Analyzing: '{user_query}'")
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Analyze query - does it need real-time 2026 data?

Query: "{user_query}"

NEEDS WEB SEARCH if mentions: today, now, latest, current, 2026, news, breaking, live, trending, recent
NO SEARCH for: general knowledge, concepts, how-to, history, definitions

If YES, generate 3 different search queries:
1. Natural language question
2. Keyword optimized
3. Alternative angle

RESPOND ONLY with valid JSON:
{{"needs_search": true, "queries": ["q1", "q2", "q3"]}}
or
{{"needs_search": false}}"""
            }],
            temperature=0.3,
            max_tokens=200,
        )
        
        result = json.loads(response.choices[0].message.content.strip())
        logger.info(f"OK Intent: needs_search={result.get('needs_search')}")
        return result
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return {"needs_search": False}


def conduct_research(queries: List[str]) -> tuple:
    """
    Step 2: Execute Tavily searches and aggregate results
    Returns: (context_string, sources_list) for LLM and frontend
    """
    if not tavily_client:
        logger.warning("Tavily not configured")
        return "", []
    
    try:
        logger.info(f"[RESEARCH] Searching {len(queries)} queries...")
        
        all_results = []
        sources_list = []  # For frontend display
        
        for i, query in enumerate(queries, 1):
            try:
                logger.info(f"  Query {i}: {query[:50]}...")
                
                search_result = tavily_client.search(
                    query=query,
                    topic="news",
                    search_depth="advanced",
                    max_results=5,
                    include_answer=True
                )
                
                if search_result.get("results"):
                    for result in search_result["results"]:
                        all_results.append({
                            "title": result.get("title", ""),
                            "snippet": result.get("snippet", ""),
                            "url": result.get("url", "")
                        })
                
                if search_result.get("answer"):
                    all_results.append({
                        "title": "Tavily Direct Answer",
                        "snippet": search_result.get("answer"),
                        "url": "https://tavily.com"
                    })
                    
            except Exception as e:
                logger.warning(f"Search error for query {i}: {e}")
                continue
        
        # Build context string for LLM and sources list for frontend
        context = ""
        for idx, result in enumerate(all_results, 1):
            context += f"[{idx}] {result['title']}\n{result['snippet']}\n"
            if result['url']:
                context += f"URL: {result['url']}\n"
            context += "\n"
            
            # Add to sources list for frontend (with real URLs)
            sources_list.append({
                "title": result['title'],
                "url": result['url'] if result['url'] else "https://tavily.com"
            })
        
        logger.info(f"OK Found {len(all_results)} sources")
        return context.strip(), sources_list
        
    except Exception as e:
        logger.error(f"Research error: {e}")
        return "", []


def generate_final_response(user_query: str, research_context: str, sources_list: list) -> tuple:
    """
    Step 3: Generate final response using Llama-3.3 with Perplexity-style inline citations
    Returns: (response_text, sources_list)
    """
    if not groq_client:
        return "JARVIS is offline", []
    
    try:
        logger.info("[SYNTHESIZE] Generating response with inline citations...")
        
        system_prompt = """You are JARVIS, a witty and sophisticated AI assistant with deep knowledge.

Your traits:
- Articulate and refined communication
- Humorous when appropriate
- Accurate and fact-based
- Perplexity-style citations
- Intelligent connections

CITATION RULES (January 28, 2026):
1. Use inline citations [1], [2], [3] when referencing sources
2. Place citations immediately after the fact: "According to latest reports [1], AI has..."
3. Multiple sources: "Recent studies [1][2] show that..."
4. Do NOT create a Sources section - frontend will render it automatically
5. Be precise and verify all claims against the provided sources"""
        
        if research_context.strip():
            full_system = f"{system_prompt}\n\nVERIFIED SOURCES (Jan 28, 2026):\n{research_context}\n\nUSE INLINE CITATIONS [1], [2], [3] FOR ALL FACTS."
        else:
            full_system = system_prompt
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": full_system},
                {"role": "user", "content": user_query}
            ],
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9
        )
        
        final_response = response.choices[0].message.content
        logger.info(f"OK Response generated: {len(final_response)} chars")
        return final_response, sources_list
        
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return f"Error: {str(e)}", []


# ============================================================================
# CORE ROUTES
# ============================================================================

@app.route("/", methods=["GET"])
def root():
    """Service info"""
    return jsonify({
        "status": "online",
        "service": "JARVIS Agentic AI Backend v2.0",
        "groq": "configured" if groq_client else "missing",
        "tavily": "configured" if tavily_client else "missing",
        "timestamp": datetime.utcnow().isoformat(),
    })


@app.route("/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({
        "status": "healthy",
        "groq": "ok" if groq_client else "missing",
        "tavily": "ok" if tavily_client else "missing",
        "timestamp": datetime.utcnow().isoformat(),
    })


@app.route("/api/jarvis/ask", methods=["POST"])
def ask_jarvis():
    """
    Main JARVIS endpoint - Agentic workflow orchestration
    
    Workflow:
    1. Classify intent (does query need web search?)
    2. Conduct research (Tavily search if needed)
    3. Generate response (Llama synthesis with context)
    """
    if not groq_client:
        return jsonify({
            "success": False,
            "error": "Groq not configured",
            "response": "JARVIS is offline"
        }), 503

    payload = request.get_json(silent=True) or {}
    user_query = (payload.get("query") or "").strip()

    if not user_query:
        return jsonify({"success": False, "error": "Empty query"}), 400

    try:
        logger.info(f"\n{'='*70}\n[AGENTIC] {user_query[:100]}")
        
        # STEP 1: Classify intent
        intent = classify_intent(user_query)
        needs_search = intent.get("needs_search", False)
        
        # STEP 2: Conduct research
        research_context = ""
        sources_list = []
        if needs_search and tavily_client:
            queries = intent.get("queries", [])
            if queries:
                research_context, sources_list = conduct_research(queries)
        
        # STEP 3: Generate response with inline citations
        response, sources_list = generate_final_response(user_query, research_context, sources_list)
        
        logger.info(f"[COMPLETE]\n{'='*70}\n")
        
        return jsonify({
            "success": True,
            "response": response,
            "sources": sources_list,  # Real URLs for frontend
            "model": "llama-3.3-70b-versatile",
            "needs_search": needs_search,
            "has_research": bool(research_context),
            "verified_sources_count": len(sources_list),
            "context_length": len(research_context),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "response": "JARVIS encountered an error"
        }), 500


@app.route("/api/jarvis/workflow", methods=["POST"])
def jarvis_workflow():
    """Debug endpoint - see full workflow"""
    payload = request.get_json(silent=True) or {}
    query = (payload.get("query") or "").strip()
    
    if not query:
        return jsonify({"error": "Query required"}), 400
    
    try:
        intent = classify_intent(query)
        context = ""
        if intent.get("needs_search") and tavily_client:
            context = conduct_research(intent.get("queries", []))
        response = generate_final_response(query, context)
        
        return jsonify({
            "query": query,
            "step_1_intent": intent,
            "step_2_research": context[:300] if context else "No web search needed",
            "step_3_response": response
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error"}), 500


if __name__ == "__main__":
    print("\n" + "="*70)
    print("JARVIS AGENTIC AI BACKEND v2.0")
    print("="*70)
    print(f"Groq: {'Configured' if groq_client else 'MISSING'}")
    print(f"Tavily: {'Configured' if tavily_client else 'MISSING'}")
    print(f"Port: {PORT}")
    print("="*70 + "\n")
    app.run(host="0.0.0.0", port=PORT, debug=False)
