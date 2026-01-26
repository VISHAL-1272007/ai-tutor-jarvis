"""
DDGS Search Service - Direct scraping RAG pipeline
Replaces Serper + Jina with DuckDuckGo search + BeautifulSoup
"""

import time
import requests
from duckduckgo_search import DDGS
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from user_agents import UserAgent
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DDGSSearchService:
    """DDGS-based search with fallback and content extraction"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.session = requests.Session()
        self.max_retries = 3
        self.timeout = 10
        self.request_delay = 2  # seconds between requests
        
    def search(self, query: str, region: str = 'in-en', max_results: int = 5) -> List[Dict]:
        """
        Search using DuckDuckGo with fallback to Google
        
        Args:
            query: Search query
            region: Region code (in-en for India)
            max_results: Maximum results to fetch
            
        Returns:
            List of dicts with title, url, snippet
        """
        try:
            logger.info(f"🔍 DDGS Search: {query} (region={region})")
            
            ddgs = DDGS()
            results = ddgs.text(
                query,
                region=region,
                safesearch='off',
                timelimit='d',  # Last 24 hours
                max_results=max_results
            )
            
            # Convert to standard format
            formatted_results = [
                {
                    'title': r.get('title', ''),
                    'url': r.get('href', ''),
                    'snippet': r.get('body', '')
                }
                for r in results
            ]
            
            logger.info(f"✅ Found {len(formatted_results)} DDGS results")
            return formatted_results
            
        except Exception as e:
            logger.warning(f"⚠️ DDGS failed: {e}. Trying fallback...")
            return self._fallback_google_search(query, max_results)
    
    def _fallback_google_search(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Fallback: Direct Google search scraping
        """
        try:
            logger.info(f"🔄 Fallback Google search: {query}")
            
            # Simple Google search via requests
            headers = {'User-Agent': self.ua.random}
            params = {
                'q': query,
                'num': max_results
            }
            
            response = requests.get(
                'https://www.google.com/search',
                headers=headers,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            results = []
            
            for g in soup.find_all('div', class_='g')[:max_results]:
                try:
                    link = g.find('a', href=True)
                    if link:
                        title_elem = g.find('h3')
                        snippet_elem = g.find('span', class_='st')
                        
                        results.append({
                            'title': title_elem.get_text() if title_elem else 'No title',
                            'url': link['href'],
                            'snippet': snippet_elem.get_text() if snippet_elem else 'No snippet'
                        })
                except Exception as item_err:
                    logger.debug(f"Error parsing result: {item_err}")
                    continue
            
            logger.info(f"✅ Found {len(results)} fallback results")
            return results
            
        except Exception as e:
            logger.error(f"❌ Fallback search failed: {e}")
            return []
    
    def extract_content(self, url: str) -> Optional[str]:
        """
        Extract main content from URL using BeautifulSoup
        
        Args:
            url: URL to scrape
            
        Returns:
            Extracted text or None if failed
        """
        try:
            logger.info(f"📄 Extracting content from: {url}")
            
            # Rate limiting
            time.sleep(self.request_delay)
            
            headers = {'User-Agent': self.ua.random}
            response = requests.get(url, headers=headers, timeout=self.timeout)
            
            # Handle blocked responses
            if response.status_code in [403, 404]:
                logger.warning(f"⚠️ URL blocked ({response.status_code}): {url}")
                return None
            
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(['script', 'style']):
                script.decompose()
            
            # Try to extract article content
            article = soup.find('article')
            if article:
                text = article.get_text()
            else:
                # Fallback to body
                body = soup.find('body')
                text = body.get_text() if body else ''
            
            # Clean up whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Limit to 1000 chars to avoid token overflow
            text = text[:1000]
            
            logger.info(f"✅ Extracted {len(text)} chars from {url}")
            return text
            
        except requests.exceptions.Timeout:
            logger.warning(f"⏱️ Timeout: {url}")
            return None
        except requests.exceptions.ConnectionError:
            logger.warning(f"🔗 Connection error: {url}")
            return None
        except Exception as e:
            logger.warning(f"❌ Extraction failed for {url}: {e}")
            return None
    
    def search_and_extract(self, query: str, region: str = 'in-en', max_results: int = 5) -> List[Dict]:
        """
        Search + extract content pipeline
        
        Returns:
            List of {title, url, snippet, content}
        """
        try:
            search_results = self.search(query, region, max_results)
            
            enriched = []
            for result in search_results:
                content = self.extract_content(result['url'])
                if content:
                    enriched.append({
                        'title': result['title'],
                        'url': result['url'],
                        'snippet': result['snippet'],
                        'content': content
                    })
            
            logger.info(f"📊 Successfully extracted content from {len(enriched)}/{len(search_results)} URLs")
            return enriched
            
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return []


# Global instance
search_service = DDGSSearchService()


def get_search_results(query: str, region: str = 'in-en', max_results: int = 5) -> List[Dict]:
    """
    Public function to get search results
    """
    return search_service.search_and_extract(query, region, max_results)
