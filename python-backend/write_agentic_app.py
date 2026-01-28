#!/usr/bin/env python3
"""Generate new agentic app.py"""

# New app code
new_app_code = '''"""
JARVIS AI - Python Flask Backend with Agentic Search Workflow
Using Groq Llama-3.3-70B + Tavily Advanced Search
==============================================================

Architecture:
- classify_intent() → Determines if research is needed + generates 3 optimized queries
- conduct_research() → Tavily search with advanced depth and aggregation
- generate_final_response() → Llama synthesis with research context
- ask_jarvis() → Main endpoint orchestrating the agentic workflow
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
    print("   Agentic search will be disabled. Get key from: https://tavily.com")


def configure_logging() -> logging.Logger:
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
        logger.info(f"✅ Intent: needs_search={result.get('needs_search')}")
        return result
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return {"needs_search": False}


def conduct_research(queries: List[str]) -> str:
    """
    Step 2: Execute Tavily searches and aggregate results
    Uses advanced depth and quality-over-quantity approach
    """
    if not tavily_client:
        logger.warning("Tavily not configured")
        return ""
    
    try:
        logger.info(f"[RESEARCH] Searching {len(queries)} queries...")
        
        all_results = []
        
        for i, query in enumerate(queries, 1):
            try:
                logger.info(f"  Query {i}: {query[:50]}...")
                
                search_result = tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=2,
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
                        "title": "Direct Answer",
                        "snippet": search_result.get("answer"),
                        "url": ""
                    })
                    
            except Exception as e:
                logger.warning(f"Search error for query {i}: {e}")
                continue
        
        # Aggregate results
        context = ""
        for idx, result in enumerate(all_results, 1):
            context += f"[Source {idx}: {result['title']}]\\n{result['snippet']}\\n"
            if result['url']:
                context += f"URL: {result['url']}\\n"
            context += "\\n"
        
        logger.info(f"✅ Found {len(all_results)} sources")
        return context.strip()
        
    except Exception as e:
        logger.error(f"Research error: {e}")
        return ""


def generate_final_response(user_query: str, research_context: str) -> str:
    """
    Step 3: Generate final response using Llama-3.3 with research context
    """
    if not groq_client:
        return "JARVIS is offline"
    
    try:
        logger.info("[SYNTHESIZE] Generating response...")
        
        system_prompt = """You are JARVIS, a witty and sophisticated AI assistant with deep knowledge.

Your traits:
- Articulate and refined communication
- Humorous when appropriate
- Accurate and fact-based
- Well-cited responses
- Intelligent connections

Guidelines:
- Use research context for accurate answers
- Cite sources: "According to [Source 1]..."
- If context incomplete, acknowledge and explain
- Be professional but conversational"""
        
        if research_context.strip():
            full_system = f"{system_prompt}\\n\\nRESEARCH CONTEXT:\\n{research_context}"
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
        logger.info(f"✅ Response generated: {len(final_response)} chars")
        return final_response
        
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return f"Error: {str(e)}"


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
        logger.info(f"\\n{'='*70}\\n[AGENTIC] {user_query[:100]}")
        
        # STEP 1: Classify intent
        intent = classify_intent(user_query)
        needs_search = intent.get("needs_search", False)
        
        # STEP 2: Conduct research
        research_context = ""
        if needs_search and tavily_client:
            queries = intent.get("queries", [])
            if queries:
                research_context = conduct_research(queries)
        
        # STEP 3: Generate response
        response = generate_final_response(user_query, research_context)
        
        logger.info(f"[COMPLETE]\\n{'='*70}\\n")
        
        return jsonify({
            "success": True,
            "response": response,
            "model": "llama-3.3-70b-versatile",
            "needs_search": needs_search,
            "has_research": bool(research_context),
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
    print("\\n" + "="*70)
    print("🚀 JARVIS AGENTIC AI BACKEND v2.0")
    print("="*70)
    print(f"✅ Groq: {'Configured' if groq_client else 'MISSING'}")
    print(f"✅ Tavily: {'Configured' if tavily_client else 'MISSING'}")
    print(f"📡 Port: {PORT}")
    print("="*70 + "\\n")
    app.run(host="0.0.0.0", port=PORT, debug=False)
'''

# Write the file
with open('app.py', 'w') as f:
    f.write(new_app_code)

print("✅ New agentic app.py written successfully")
print("📦 Now run: pip install tavily-python")
print("🚀 Agentic workflow ready!")
