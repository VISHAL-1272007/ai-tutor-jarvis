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

def search_web(query: str) -> List[Dict[str, str]]:
    """
    Query SearXNG and return top 3 results.
    Each result: {"title": str, "url": str, "snippet": str}
    """
    if not query or not query.strip():
        return []

    params = {
        "q": query.strip(),
        "format": "json",
        "categories": "general",
        "language": "en",
        "safesearch": 1,
    }

    try:
        url = f"{SEARXNG_BASE_URL.rstrip('/')}/search"
        # Requesting data from Public Eyes
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
        
    except Exception as e:
        print(f"❌ Eyes Error: {e}")
        return []