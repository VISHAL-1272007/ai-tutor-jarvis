"""
DDGS-based RAG Search API Endpoint
Replaces Serper + Jina with DuckDuckGo search + BeautifulSoup
"""

from flask import request, jsonify, Blueprint
import logging
from ddgs_search import get_search_results
from content_verifier import verify_search_results, clean_for_groq
import os

logger = logging.getLogger(__name__)

# Blueprint
search_bp = Blueprint('search', __name__, url_prefix='/api')


@search_bp.route('/ddgs-search', methods=['POST'])
def ddgs_search():
    """
    DDGS-based search with content extraction
    
    Request:
        {
            "query": "Tamil Nadu news",
            "region": "in-en",
            "max_results": 5
        }
    """
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        region = data.get('region', 'in-en')
        max_results = int(data.get('max_results', 5))
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        logger.info(f"🔍 DDGS Search API: {query}")
        
        # Step 1: Search and extract
        results = get_search_results(query, region, max_results)
        
        if not results:
            return jsonify({
                'success': False,
                'error': 'No results found',
                'results': []
            }), 200
        
        # Step 2: Verify and filter
        verified, context = verify_search_results(results, query, min_relevance=0.3)
        
        # Step 3: Clean for Groq
        clean_context = clean_for_groq(context, max_tokens=2000)
        
        return jsonify({
            'success': True,
            'query': query,
            'region': region,
            'results': verified,
            'verified_count': len(verified),
            'total_results': len(results),
            'context': clean_context,
            'timestamp': str(datetime.now().isoformat())
        }), 200
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500


@search_bp.route('/verify-content', methods=['POST'])
def verify_content():
    """
    Verify and filter search results
    
    Request:
        {
            "results": [...],
            "query": "user query",
            "min_relevance": 0.3
        }
    """
    try:
        from content_verifier import verify_search_results
        
        data = request.get_json()
        results = data.get('results', [])
        query = data.get('query', '')
        min_relevance = float(data.get('min_relevance', 0.3))
        
        verified, context = verify_search_results(results, query, min_relevance)
        clean_context = clean_for_groq(context)
        
        return jsonify({
            'success': True,
            'verified': verified,
            'context': clean_context,
            'verified_count': len(verified)
        }), 200
        
    except Exception as e:
        logger.error(f"Verification error: {e}")
        return jsonify({'error': str(e)}), 500


@search_bp.route('/groq-synthesis', methods=['POST'])
def groq_synthesis():
    """
    Synthesize search results using Groq LLAMA-3
    
    Request:
        {
            "query": "user query",
            "context": "verified content",
            "results": [...]
        }
    """
    try:
        import os
        from groq import Groq
        
        data = request.get_json()
        query = data.get('query', '')
        context = data.get('context', '')
        results = data.get('results', [])
        
        if not query or not context:
            return jsonify({'error': 'Query and context are required'}), 400
        
        logger.info(f"🧠 Groq Synthesis: {query}")
        
        # Initialize Groq
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return jsonify({'error': 'GROQ_API_KEY not configured'}), 500
        
        client = Groq(api_key=api_key)
        
        # Build prompt
        sources_info = "\n".join([
            f"- {r['title']} ({r['url']})"
            for r in results[:3]
        ])
        
        prompt = f"""Based on the following verified search results, provide a comprehensive answer to the user query.

USER QUERY: {query}

VERIFIED CONTEXT:
{context}

SOURCES:
{sources_info}

Please provide:
1. A direct answer to the query
2. Key facts and details
3. Include citations like [1], [2] for the sources"""
        
        response = client.chat.completions.create(
            model='llama-3-70b-versatile',
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a knowledgeable assistant. Provide accurate, well-sourced answers based on the provided context.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000,
            top_p=0.9
        )
        
        answer = response.choices[0].message.content
        
        logger.info(f"✅ Groq synthesis completed")
        
        return jsonify({
            'success': True,
            'query': query,
            'answer': answer,
            'sources': results[:3],
            'timestamp': str(datetime.now().isoformat())
        }), 200
        
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return jsonify({'error': str(e)}), 500


# Register blueprint
def register_search_routes(app):
    """Register search routes to Flask app"""
    app.register_blueprint(search_bp)
    logger.info("✅ DDGS Search routes registered")


# Export
__all__ = ['search_bp', 'register_search_routes']
