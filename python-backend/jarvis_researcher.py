"""
JARVIS Researcher - Web Search Service using NewsAPI
=============================================================
Reliable web search without subprocess dependencies

Uses: NewsAPI for real-time news search
Fallback: DDGS if NewsAPI unavailable
"""

import time
import random
import os
from typing import List, Dict, Optional
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

NEWS_API_KEY = os.getenv('NEWS_API_KEY')
GNEWS_API_KEY = os.getenv('GNEWS_API_KEY')

# Fallback to DDGS only if NewsAPI unavailable
try:
    from ddgs import DDGS
    DDGS_AVAILABLE = True
except ImportError:
    try:
        from duckduckgo_search import DDGS
        DDGS_AVAILABLE = True
    except ImportError:
        DDGS_AVAILABLE = False
        print("⚠️  DDGS library not available - will use NewsAPI instead")


def search_with_newsapi(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    Search using NewsAPI for reliable real-time news results
    
    Args:
        query: Search query
        max_results: Maximum results to return
        
    Returns:
        List of results with title, url, content
    """
    if not NEWS_API_KEY:
        print("⚠️  NEWS_API_KEY not configured")
        return []
    
    try:
        print("📰 Searching with NewsAPI...")
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': query,
            'sortBy': 'relevancy',
            'language': 'en',
            'pageSize': max_results,
            'apiKey': NEWS_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('status') != 'ok':
            print(f"⚠️  NewsAPI error: {data.get('message', 'Unknown error')}")
            return []
        
        articles = data.get('articles', [])
        print(f"✅ Found {len(articles)} articles from NewsAPI")
        
        results = []
        for article in articles[:max_results]:
            results.append({
                'title': article.get('title', 'Untitled'),
                'url': article.get('url', ''),
                'content': article.get('description', article.get('content', ''))[:500],
                'source': 'NewsAPI'
            })
        
        return results
        
    except Exception as e:
        print(f"❌ NewsAPI error: {e}")
        return []


def search_with_ddgs(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    Fallback search using DDGS
    """
    if not DDGS_AVAILABLE:
        return []
    
    try:
        print("🔍 Searching with DDGS (fallback)...")
        ddgs = DDGS()
        search_results = list(ddgs.text(
            query,
            max_results=max_results * 2
        ))
        
        print(f"✅ Found {len(search_results)} results from DDGS")
        
        results = []
        for result in search_results[:max_results]:
            results.append({
                'title': result.get('title', result.get('name', 'Untitled')),
                'url': result.get('href', result.get('url', result.get('link', ''))),
                'content': result.get('body', result.get('snippet', ''))[:500],
                'source': 'DDGS'
            })
        
        return [r for r in results if r['url']]
        
    except Exception as e:
        print(f"⚠️  DDGS error: {e}")
        return []


def jarvis_researcher(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    JARVIS Researcher - Multi-source web search
    
    Priority:
    1. NewsAPI (reliable, real-time news)
    2. DDGS fallback (free, but less reliable)
    3. Empty list (graceful failure)
    
    Args:
        query: Search query
        max_results: Maximum results to return
        
    Returns:
        List of verified results
    """
    print(f"🔍 JARVIS Researcher: '{query}'")
    
    # Try NewsAPI first
    results = search_with_newsapi(query, max_results)
    
    # Fallback to DDGS if NewsAPI returns nothing
    if not results:
        print("📌 NewsAPI empty, trying DDGS fallback...")
        results = search_with_ddgs(query, max_results)
    
    # Final fallback: return empty (ml_service will handle gracefully)
    if not results:
        print("⚠️  No search results from any source")
    
    print(f"🎯 Returning {len(results)} results")
    return results


def jarvis_researcher_quick(query: str) -> str:
    """
    Quick version: Returns concatenated content for immediate RAG usage.
    
    Args:
        query: Search query
        
    Returns:
        Combined content string ready for LLM synthesis
    """
    results = jarvis_researcher(query)
    
    if not results:
        return "No search results found for the given query."
    
    # Combine all content with source citations
    combined_content = ""
    for idx, result in enumerate(results, 1):
        combined_content += f"\n[Source {idx}: {result['title']} ({result['source']})]\n{result['content']}\n"
    
    return combined_content.strip()


if __name__ == "__main__":
    # Test the researcher
    print("=" * 70)
    print("JARVIS RESEARCHER - TEST RUN")
    print("=" * 70)
    
    test_query = "What is LeetCode?"
    results = jarvis_researcher(test_query, max_results=3)
    
    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)
    
    if results:
        for idx, result in enumerate(results, 1):
            print(f"\n{idx}. {result['title']}")
            print(f"   Source: {result['source']}")
            print(f"   URL: {result['url']}")
            print(f"   Content: {result['content'][:100]}...")
    else:
        print("No results found.")
    
    print("\n" + "=" * 70)
