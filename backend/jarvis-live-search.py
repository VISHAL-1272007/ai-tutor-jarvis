from duckduckgo_search import DDGS
import json
import datetime
import sys
import re

# Note: Package renamed to 'ddgs' - consider updating: pip install ddgs

PREFERRED_SITES = "site:techcrunch.com OR site:theverge.com OR site:reuters.com"
KEYWORDS = ["ai", "intelligence", "security", "space", "quantum"]

# Regional news configuration
REGIONAL_KEYWORDS = {
    'tamil_nadu': ['tamil nadu', 'tamilnadu', 'chennai', 'madurai', 'coimbatore', 'trichy'],
    'india': ['india', 'indian', 'delhi', 'mumbai', 'bangalore', 'kolkata', 'hyderabad']
}

INDIAN_NEWS_SITES = [
    "thehindu.com",
    "timesofindia.indiatimes.com",
    "indianexpress.com",
    "hindustantimes.com",
    "ndtv.com",
    "thequint.com",
    "news18.com",
    "economictimes.indiatimes.com",
    "businesstoday.in",
    "scroll.in"
]


def _detect_regional_query(query: str) -> dict:
    """Detect if query is asking for regional news"""
    query_lower = query.lower()
    
    # Check for Tamil Nadu/Chennai specific queries
    if any(kw in query_lower for kw in REGIONAL_KEYWORDS['tamil_nadu']):
        return {
            'is_regional': True,
            'region': 'tamil_nadu',
            'sites': INDIAN_NEWS_SITES,
            'region_name': 'Tamil Nadu',
            'search_region': 'in-en'  # India English region for DuckDuckGo
        }
    
    # Check for general Indian queries
    if any(kw in query_lower for kw in REGIONAL_KEYWORDS['india']):
        return {
            'is_regional': True,
            'region': 'india',
            'sites': INDIAN_NEWS_SITES,
            'region_name': 'India',
            'search_region': 'in-en'
        }
    
    return {'is_regional': False}


def _augment_query(query: str, regional_info: dict = None) -> str:
    """Augment query with site preferences"""
    if regional_info and regional_info.get('is_regional'):
        # For regional queries, prioritize local news sites
        sites = " OR ".join([f"site:{site}" for site in regional_info['sites'][:5]])
        return f"{query} ({sites})"
    return f"{query} {PREFERRED_SITES}"


def _filter_results(raw_results, regional_info: dict = None):
    """Filter results based on relevance"""
    filtered = []
    
    for res in raw_results:
        title = res.get('title', '') or ''
        url = res.get('url') or res.get('href') or ''
        source = res.get('source', '') or ''
        haystack = f"{title} {url} {source}".lower()
        
        # For regional queries, prioritize local news sites
        if regional_info and regional_info.get('is_regional'):
            is_from_local_site = any(site in url.lower() for site in regional_info['sites'])
            if is_from_local_site:
                filtered.insert(0, res)  # Prioritize local sources
                continue
        
        # For global queries, use keyword filtering
        if any(kw in haystack for kw in KEYWORDS):
            filtered.append(res)
    
    return filtered


def jarvis_live_search(query, max_results=5):
    """
    JARVIS Live Internet Search using DuckDuckGo
    Returns real-time news and information with regional awareness
    """
    print(f"JARVIS: Searching internet for '{query}'...")

    # Detect if this is a regional query
    regional_info = _detect_regional_query(query)
    
    try:
        with DDGS() as ddgs:
            # Set region based on query
            search_region = regional_info.get('search_region', 'us-en') if regional_info.get('is_regional') else 'us-en'
            
            search_query = _augment_query(query, regional_info)
            
            # Get news results with timelimit for recent news (last 24 hours)
            results = [r for r in ddgs.news(
                search_query, 
                region=search_region,
                safesearch="off",
                timelimit="d",  # Last day (24 hours)
                max_results=max_results * 3
            )]
            
            # Filter and prioritize results
            filtered = _filter_results(results, regional_info)
            results = (filtered if filtered else results)[:max_results]

            # If regional query and no results, try broader search
            if regional_info.get('is_regional') and not results:
                region_name = regional_info.get('region_name', 'the region')
                print(f"JARVIS: No recent local news found. Searching for {region_name} updates...")
                
                # Try a broader search
                broader_query = f"{region_name} latest news government announcements updates"
                print(f"JARVIS: Trying broader search: '{broader_query}'")
                
                results = [r for r in ddgs.news(
                    broader_query,
                    region=search_region,
                    safesearch="off",
                    timelimit="w",  # Last week for broader search
                    max_results=max_results * 2
                )]
                
                # Filter again with regional preference
                filtered = _filter_results(results, regional_info)
                results = (filtered if filtered else results)[:max_results]
                
                if not results:
                    return {
                        "status": "no_results",
                        "message": f"Searching for local {region_name} updates... No recent specific news found. Try checking local news websites directly.",
                        "query": query,
                        "region": region_name,
                        "timestamp": datetime.datetime.now().isoformat(),
                        "suggestion": f"Try visiting: {', '.join(regional_info['sites'][:3])}"
                    }

            if not results:
                return {
                    "status": "no_results",
                    "message": "No recent news found for your query.",
                    "query": query,
                    "timestamp": datetime.datetime.now().isoformat()
                }

            # Format the results
            formatted_results = []
            for i, res in enumerate(results):
                formatted_results.append({
                    "id": i + 1,
                    "title": res.get('title', 'No title'),
                    "source": res.get('source', 'Unknown source'),
                    "url": res.get('url', ''),
                    "date": res.get('date', ''),
                    "body": res.get('body', '')[:200] + '...' if res.get('body') else ''
                })

            formatted_news = ""
            
            # Add regional context header if applicable
            if regional_info.get('is_regional'):
                region_name = regional_info.get('region_name', 'Regional')
                formatted_news += f"🌍 {region_name} News (Last 24 hours)\n\n"
            
            for res in formatted_results:
                formatted_news += f"{res['id']}. {res['title']}\n"
                formatted_news += f"Source: {res['source']}\n"
                if res['date']:
                    formatted_news += f"Date: {res['date']}\n"
                formatted_news += f"Link: {res['url']}\n"
                if res['body']:
                    formatted_news += f"Summary: {res['body']}\n"
                formatted_news += "\n"

            return {
                "status": "success",
                "query": query,
                "region": regional_info.get('region_name') if regional_info.get('is_regional') else None,
                "total_results": len(formatted_results),
                "results": formatted_results,
                "formatted_text": formatted_news.strip(),
                "timestamp": datetime.datetime.now().isoformat(),
                "search_info": {
                    "timeframe": "Last 24 hours",
                    "region": search_region,
                    "is_regional_search": regional_info.get('is_regional', False)
                }
            }

    except Exception as e:
        error_msg = f"Error searching internet: {str(e)}"
        print(f"ERROR: {error_msg}")
        return {
            "status": "error",
            "message": error_msg,
            "query": query,
            "timestamp": datetime.datetime.now().isoformat()
        }

def jarvis_web_search(query, max_results=10):
    """
    General web search (not just news) with regional awareness
    """
    print(f"JARVIS: Performing general web search for '{query}'...")

    # Detect if this is a regional query
    regional_info = _detect_regional_query(query)

    try:
        with DDGS() as ddgs:
            # Set region based on query
            search_region = regional_info.get('search_region', 'us-en') if regional_info.get('is_regional') else 'us-en'
            
            search_query = _augment_query(query, regional_info)
            results = [r for r in ddgs.text(
                search_query,
                region=search_region,
                safesearch="off",
                timelimit="m",  # Last month
                max_results=max_results * 2
            )]
            
            filtered = _filter_results(results, regional_info)
            results = (filtered if filtered else results)[:max_results]

            if not results:
                return {
                    "status": "no_results",
                    "message": "No search results found.",
                    "query": query,
                    "timestamp": datetime.datetime.now().isoformat()
                }

            formatted_results = []
            for i, res in enumerate(results):
                formatted_results.append({
                    "id": i + 1,
                    "title": res.get('title', 'No title'),
                    "url": res.get('href', ''),
                    "body": res.get('body', '')[:300] + '...' if res.get('body') else ''
                })

            formatted_text = ""
            
            # Add regional context header if applicable
            if regional_info.get('is_regional'):
                region_name = regional_info.get('region_name', 'Regional')
                formatted_text += f"🌍 {region_name} Search Results\n\n"
            
            for res in formatted_results:
                formatted_text += f"{res['id']}. {res['title']}\n"
                formatted_text += f"URL: {res['url']}\n"
                if res['body']:
                    formatted_text += f"Summary: {res['body']}\n"
                formatted_text += "\n"

            return {
                "status": "success",
                "query": query,
                "region": regional_info.get('region_name') if regional_info.get('is_regional') else None,
                "total_results": len(formatted_results),
                "results": formatted_results,
                "formatted_text": formatted_text.strip(),
                "timestamp": datetime.datetime.now().isoformat(),
                "search_info": {
                    "region": search_region,
                    "is_regional_search": regional_info.get('is_regional', False)
                }
            }

    except Exception as e:
        error_msg = f"Error performing web search: {str(e)}"
        print(f"ERROR: {error_msg}")
        return {
            "status": "error",
            "message": error_msg,
            "query": query,
            "timestamp": datetime.datetime.now().isoformat()
        }

# Test functions
if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # Command line mode for Node.js integration
        function_name = sys.argv[1]
        query = sys.argv[2] if len(sys.argv) > 2 else "AI news"
        max_results = int(sys.argv[3]) if len(sys.argv) > 3 else 5

        if function_name == "news":
            result = jarvis_live_search(query, max_results)
        elif function_name == "web":
            result = jarvis_web_search(query, max_results)
        else:
            result = {"status": "error", "message": "Invalid function name"}

        # Emit JSON for Node.js consumers and flush immediately
        print(json.dumps(result))
        sys.stdout.flush()
    else:
        # Interactive test mode
        print("🧪 Testing JARVIS Live Search with Regional Awareness...\n")

        # Test regional news search (Tamil Nadu)
        print("=== REGIONAL NEWS TEST (Tamil Nadu) ===")
        tn_result = jarvis_live_search("Tamil Nadu latest news", 5)
        if tn_result["status"] == "success":
            print("✅ Tamil Nadu news search successful!")
            print(f"Region: {tn_result.get('region', 'N/A')}")
            print(f"Results: {tn_result['total_results']}")
            print(tn_result["formatted_text"][:500] + "...\n")
        else:
            print(f"❌ Tamil Nadu news search status: {tn_result['message']}\n")

        # Test general AI news search
        print("=== GLOBAL NEWS SEARCH TEST ===")
        news_result = jarvis_live_search("Latest AI news 2026", 3)
        if news_result["status"] == "success":
            print("✅ Global news search successful!")
            print(f"Results: {news_result['total_results']}")
            print(news_result["formatted_text"][:400] + "...\n")
        else:
            print(f"❌ Global news search failed: {news_result['message']}\n")

        # Test general web search
        print("=== WEB SEARCH TEST ===")
        web_result = jarvis_web_search("What is quantum computing", 3)
        if web_result["status"] == "success":
            print("✅ Web search successful!")
            print(web_result["formatted_text"][:400] + "...\n")
        else:
            print(f"❌ Web search failed: {web_result['message']}\n")

        print("🎉 JARVIS Regional Search functions ready!")
        print("\n📋 Supported Regions:")
        print("  • Tamil Nadu (keywords: tamil nadu, chennai, madurai, etc.)")
        print("  • India (keywords: india, delhi, mumbai, bangalore, etc.)")
        print("\n🌐 Regional news prioritizes local Indian sources:")
        for site in INDIAN_NEWS_SITES[:5]:
            print(f"  • {site}")
        print("  ... and more")