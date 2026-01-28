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
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, List, Optional

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


JARVIS_PERSONA_PROMPT = (
    "You are JARVIS, an Iron Man–style AI: witty, sophisticated, "
    "precise, and fact-based. Communicate with polish, add light humor "
    "when helpful, and always cite sources in Markdown using numbered "
    "links: [Source 1](url). If grounding is sparse, be transparent and "
    "offer best-effort guidance."
)


# ============================================================================
# AGENTIC WORKFLOW FUNCTIONS
# ============================================================================

def classify_intent(user_query: str) -> Dict:
    """
    Zero-shot classifier and router.

    Returns JSON structure:
    {
        "needs_search": bool,
        "reason": str,
        "queries": [semantic_q, keyword_q1, keyword_q2],
        "confidence": float (0-1)
    }
    """
    if not groq_client:
        return {
            "needs_search": False,
            "reason": "Groq not configured",
            "queries": [],
            "confidence": 0.0,
        }

    classification_prompt = f"""
Analyze the user's query and decide if it requires real-time grounding (current or 2026 data).

Guidelines for needs_search = true:
- Mentions: today, now, latest, current, recent, live, breaking, news, update, trend, 2024, 2025, 2026
- Time-sensitive asks: earnings, launches, new releases, price right now

Guidelines for needs_search = false:
- Definitions, how-to, history, concepts, coding help, math derivations without time sensitivity

If needs_search is true, produce a triad of queries:
1) Semantic question variant
2) Keyword-focused variant #1
3) Keyword-focused variant #2

Respond ONLY with compact JSON in this shape:
{{
  "needs_search": true|false,
  "confidence": 0.xx,
  "reason": "short string",
  "queries": ["semantic", "keyword1", "keyword2"]
}}

User query: "{user_query}"
"""

    try:
        logger.info(f"[CLASSIFY] Analyzing: '{user_query}'")
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": classification_prompt}],
            temperature=0.3,
            max_tokens=220,
        )
        raw = response.choices[0].message.content.strip()
        result = json.loads(raw)
    except Exception as exc:
        logger.error(f"Classification error: {exc}")
        result = {
            "needs_search": any(
                kw in user_query.lower()
                for kw in [
                    "today",
                    "latest",
                    "current",
                    "news",
                    "breaking",
                    "2026",
                    "trending",
                ]
            ),
            "reason": "Heuristic fallback",
            "queries": [],
            "confidence": 0.25,
        }

    queries = result.get("queries") or []
    if result.get("needs_search") and len(queries) < 3:
        # Ensure triad of queries
        queries = [
            user_query,
            f"latest {user_query}",
            f"2026 update {user_query}",
        ]
    result["queries"] = queries[:3]
    logger.info(
        f"OK Intent: needs_search={result.get('needs_search')} | confidence={result.get('confidence')}"
    )
    return result


def _run_tavily_search(query: str) -> List[Dict]:
    """Run a single Tavily query and normalize results."""
    if not tavily_client:
        return []
    try:
        result = tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=2,
            include_answer=True,
        )
        normalized = []
        if result.get("results"):
            for item in result["results"]:
                normalized.append(
                    {
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "url": item.get("url", ""),
                    }
                )
        if result.get("answer"):
            normalized.append(
                {
                    "title": "Direct Answer",
                    "snippet": result.get("answer", ""),
                    "url": "",
                }
            )
        return normalized
    except Exception as exc:
        logger.warning(f"Tavily search error for '{query[:50]}': {exc}")
        return []


def conduct_research(queries: List[str], max_workers: int = 3) -> Dict:
    """
    Research agent: executes triad of queries (async via threads) and aggregates.

    Returns dict:
    {
        "context": "... aggregated text ...",
        "sources": [
            {"title": str, "snippet": str, "url": str}
        ]
    }
    """
    if not tavily_client:
        logger.warning("Tavily not configured; skipping research")
        return {"context": "", "sources": []}

    if not queries:
        return {"context": "", "sources": []}

    logger.info(f"[RESEARCH] Running {len(queries)} queries asynchronously")
    sources: List[Dict] = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_map = {executor.submit(_run_tavily_search, q): q for q in queries}
        for future in as_completed(future_map):
            q = future_map[future]
            try:
                results = future.result()
                logger.info(f"  Query done: {q[:60]} | {len(results)} hits")
                sources.extend(results)
            except Exception as exc:
                logger.warning(f"  Query failed: {q[:60]} | {exc}")

    if not sources:
        logger.warning("No research sources found; will fall back to LLM knowledge")
        return {"context": "", "sources": []}

    context_blocks = []
    for idx, item in enumerate(sources, 1):
        url_part = f"URL: {item['url']}" if item.get("url") else ""
        context_blocks.append(
            f"[Source {idx}: {item.get('title', '')}]\n{item.get('snippet', '')}\n{url_part}"
        )

    context = "\n\n".join(context_blocks)
    logger.info(f"OK Aggregated {len(sources)} sources")
    return {"context": context, "sources": sources}


def generate_final_response(user_query: str, research: Dict) -> str:
    """Synthesize final answer with grounding + fallbacks."""
    if not groq_client:
        return "JARVIS is offline; Groq API key missing."

    research_context = (research or {}).get("context", "")
    sources = (research or {}).get("sources", [])

    grounding_note = ""
    if research_context:
        grounding_note = f"\n\nRESEARCH CONTEXT:\n{research_context}"
    else:
        grounding_note = (
            "\n\nRESEARCH CONTEXT:\nNo external results. Rely on internal knowledge; "
            "flag uncertainty if applicable."
        )

    system_prompt = f"{JARVIS_PERSONA_PROMPT}{grounding_note}"

    try:
        logger.info("[SYNTHESIZE] Generating grounded response")
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query},
            ],
            temperature=0.65,
            max_tokens=1024,
            top_p=0.9,
        )
        final_response = response.choices[0].message.content
        if not research_context:
            final_response += (
                "\n\n_Disclaimer: No live sources were retrieved; this answer is based on"
                " internal knowledge._"
            )
        return final_response
    except Exception as exc:
        logger.error(f"Synthesis error: {exc}")
        return (
            "JARVIS encountered an error while generating the response. "
            "Falling back to internal knowledge."
        )


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
        needs_search = bool(intent.get("needs_search", False))

        # STEP 2: Conduct research (async)
        research = {"context": "", "sources": []}
        if needs_search and tavily_client:
            queries = intent.get("queries", [])
            if queries:
                research = conduct_research(queries)

        # STEP 3: Generate response with grounding
        response = generate_final_response(user_query, research)

        logger.info(f"[COMPLETE]\n{'='*70}\n")

        return jsonify({
            "success": True,
            "response": response,
            "model": "llama-3.3-70b-versatile",
            "needs_search": needs_search,
            "has_research": bool(research.get("context")),
            "sources": research.get("sources", []),
            "intent": intent,
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
        research = {"context": "", "sources": []}
        if intent.get("needs_search") and tavily_client:
            research = conduct_research(intent.get("queries", []))
        response = generate_final_response(query, research)
        
        return jsonify({
            "query": query,
            "step_1_intent": intent,
            "step_2_research": research.get("context", "")[:400] or "No web search needed",
            "step_2_sources": research.get("sources", []),
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
