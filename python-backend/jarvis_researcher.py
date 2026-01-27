"""
JARVIS Researcher - Autonomous Web Search & Scraping Service
=============================================================
Senior Python Engineer Implementation
Independent RAG pipeline without paid APIs (Serper/Jina)

Author: JARVIS AI Development Team
Date: January 27, 2026
"""

import time
import random
from typing import List, Dict, Optional
try:
    from ddgs import DDGS  # New package name
except ImportError:
    from duckduckgo_search import DDGS  # Fallback to old name
import requests
from bs4 import BeautifulSoup

# User-Agent rotation to prevent blocking
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]


def verify_temporal_relevance(content: str) -> bool:
    """
    Verification Layer: Ensure content is recent and relevant.
    
    Rules:
    - KEEP if '2026' is present (current year)
    - REJECT if '2024' or '2023' found but no '2026' (outdated data)
    - KEEP if no year references (neutral content)
    
    Args:
        content: Scraped text content
        
    Returns:
        True if content passes verification, False otherwise
    """
    content_lower = content.lower()
    
    # Primary check: If 2026 is present, it's current → KEEP
    if '2026' in content:
        return True
    
    # Secondary check: If old years present without 2026 → REJECT
    if '2024' in content or '2023' in content:
        return False
    
    # No year references → Neutral content → KEEP
    return True


def scrape_url_content(url: str, timeout: int = 10) -> Optional[str]:
    """
    Scrape main text content from a URL using BeautifulSoup.
    
    Safety Features:
    - Random User-Agent rotation
    - Timeout protection
    - Exception handling for failed requests
    - Extracts only <p> tags for clean content
    
    Args:
        url: Target URL to scrape
        timeout: Request timeout in seconds
        
    Returns:
        Extracted text content or None if scraping failed
    """
    try:
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        response.raise_for_status()  # Raise exception for 4xx/5xx status codes
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract all paragraph tags
        paragraphs = soup.find_all('p')
        
        # Combine text from all paragraphs
        content = ' '.join([p.get_text(strip=True) for p in paragraphs])
        
        # Clean up extra whitespace
        content = ' '.join(content.split())
        
        return content if content else None
        
    except requests.exceptions.Timeout:
        print(f"⏱️ Timeout while accessing: {url}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {url}: {str(e)}")
        return None
    except Exception as e:
        print(f"⚠️ Unexpected error scraping {url}: {str(e)}")
        return None


def jarvis_researcher(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    JARVIS Autonomous Web Research Function
    
    Performs independent web search and content extraction for RAG pipeline.
    
    Pipeline:
    1. DuckDuckGo Search → Top 5 results
    2. Content Scraping → Extract <p> tags with BeautifulSoup
    3. Temporal Verification → Filter outdated content
    4. Rate Limiting → 2-second delays between requests
    
    Args:
        query: Search query string
        max_results: Maximum number of results to return (default: 5)
        
    Returns:
        List of verified results with structure:
        [
            {
                'title': 'Article Title',
                'url': 'https://example.com',
                'content': 'First 1000 characters of content...'
            },
            ...
        ]
    
    Example:
        >>> results = jarvis_researcher("Tamil Nadu education news")
        >>> print(f"Found {len(results)} verified sources")
        >>> for result in results:
        ...     print(f"- {result['title']}")
    """
    print(f"🔍 JARVIS Researcher starting query: '{query}'")
    verified_results = []
    
    try:
        # Step 1: DuckDuckGo Search
        print("📡 Fetching search results from DuckDuckGo...")
        ddgs = DDGS()
        search_results = list(ddgs.text(
            query,  # First positional argument is the query
            region='in-en',  # India English results
            safesearch='moderate',
            timelimit='m',  # Last month for freshness
            max_results=max_results
        ))
        
        print(f"✅ Found {len(search_results)} search results")
        
        # Step 2: Scrape and Verify Each Result
        for idx, result in enumerate(search_results, 1):
            title = result.get('title', 'Untitled')
            url = result.get('href', '')
            
            if not url:
                continue
            
            print(f"\n[{idx}/{len(search_results)}] Processing: {title}")
            print(f"    URL: {url}")
            
            # Scrape content from URL
            content = scrape_url_content(url)
            
            if not content:
                print("    ⚠️ Scraping failed, skipping...")
                # Add 2-second delay even on failure
                time.sleep(2)
                continue
            
            # Step 3: Temporal Verification
            if not verify_temporal_relevance(content):
                print("    ⛔ Failed temporal verification (outdated content)")
                time.sleep(2)
                continue
            
            # Limit content to 1000 characters for LLM efficiency
            content_trimmed = content[:1000]
            
            verified_results.append({
                'title': title,
                'url': url,
                'content': content_trimmed
            })
            
            print(f"    ✅ Verified and added ({len(content_trimmed)} chars)")
            
            # Step 4: Rate Limiting - 2-second delay between requests
            if idx < len(search_results):
                print("    ⏳ Waiting 2 seconds (rate limit protection)...")
                time.sleep(2)
        
    except Exception as e:
        print(f"❌ JARVIS Researcher error: {str(e)}")
        return verified_results
    
    print(f"\n🎯 Research complete: {len(verified_results)}/{max_results} verified sources")
    return verified_results


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
        return "No verified sources found."
    
    # Combine all content with source citations
    combined_content = ""
    for idx, result in enumerate(results, 1):
        combined_content += f"\n\n[Source {idx}: {result['title']}]\n{result['content']}"
    
    return combined_content.strip()


if __name__ == "__main__":
    # Test the researcher
    print("=" * 70)
    print("JARVIS RESEARCHER - TEST RUN")
    print("=" * 70)
    
    test_query = "Tamil Nadu education technology news 2026"
    results = jarvis_researcher(test_query)
    
    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)
    
    if results:
        for idx, result in enumerate(results, 1):
            print(f"\n{idx}. {result['title']}")
            print(f"   URL: {result['url']}")
            print(f"   Content preview: {result['content'][:150]}...")
    else:
        print("No results found.")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)
