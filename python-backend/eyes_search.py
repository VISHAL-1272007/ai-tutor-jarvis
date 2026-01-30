"""
SearXNG search client for JARVIS.
Returns top 3 web results for analysis.
"""

import os
from typing import List, Dict
import requests

# Docker illaama vĕla sĕiyya, public instance-ah default-ah kudukkurōm
# Neenga apram Docker fix pannitta thirumba 'http://localhost:8080' nu maathikkalaam
SEARXNG_BASE_URL = os.environ.get("SEARXNG_BASE_URL", "https://searx.be")
SEARXNG_TIMEOUT = int(os.environ.get("SEARXNG_TIMEOUT", "12"))
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
TAVILY_TIMEOUT = int(os.environ.get("TAVILY_TIMEOUT", "12"))


def _call_searxng(query: str) -> List[Dict[str, str]]:
    params = {
        "q": query.strip(),
        "format": "json",
        "categories": "general",
        "language": "en",
        "safesearch": 1,
    }

    url = f"{SEARXNG_BASE_URL.rstrip('/')}/search"
    response = requests.get(url, params=params, timeout=SEARXNG_TIMEOUT)
    response.raise_for_status()

    data = response.json() or {}
    results = data.get("results", [])

    top_results: List[Dict[str, str]] = []
    for item in results[:3]:
        top_results.append(
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "snippet": item.get("content", "") or item.get("snippet", ""),
            }
        )
    return top_results


def _call_tavily(query: str) -> List[Dict[str, str]]:
    if not TAVILY_API_KEY:
        raise RuntimeError("TAVILY_API_KEY is not set")

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query.strip(),
        "search_depth": "advanced",
        "max_results": 3,
        "include_answer": False,
    }

    response = requests.post(
        "https://api.tavily.com/search",
        json=payload,
        timeout=TAVILY_TIMEOUT,
    )
    response.raise_for_status()

    data = response.json() or {}
    results = data.get("results", [])

    top_results: List[Dict[str, str]] = []
    for item in results[:3]:
        top_results.append(
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "snippet": item.get("content", "") or item.get("snippet", ""),
            }
        )
    return top_results

def search_web(query: str) -> List[Dict[str, str]]:
    """
    Query SearXNG and return top 3 results.
    Each result: {"title": str, "url": str, "snippet": str}
    """
    if not query or not query.strip():
        return []

    # 1. Try SearXNG First (Primary)
    try:
        results = _call_searxng(query)
        if results:
            return results
    except Exception as e:
        print(f"⚠️ SearXNG Down... Switching to Tavily ({e})")

    # 2. Fallback to Tavily (Backup)
    try:
        return _call_tavily(query)
    except Exception as e:
        print(f"❌ Tavily Error: {e}")
        return []