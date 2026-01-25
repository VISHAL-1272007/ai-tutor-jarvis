from duckduckgo_search import DDGS
import json
import datetime
import sys

# Note: Package renamed to 'ddgs' - consider updating: pip install ddgs

PREFERRED_SITES = "site:techcrunch.com OR site:theverge.com OR site:reuters.com"
KEYWORDS = ["ai", "intelligence", "security", "space", "quantum"]


def _augment_query(query: str) -> str:
    return f"{query} {PREFERRED_SITES}"


def _filter_results(raw_results):
    filtered = []
    for res in raw_results:
        title = res.get('title', '') or ''
        url = res.get('url') or res.get('href') or ''
        haystack = f"{title} {url}".lower()
        if any(kw in haystack for kw in KEYWORDS):
            filtered.append(res)
    return filtered


def jarvis_live_search(query, max_results=5):
    """
    JARVIS Live Internet Search using DuckDuckGo
    Returns real-time news and information
    """
    print(f"JARVIS: Searching internet for '{query}'...")

    try:
        with DDGS() as ddgs:
            search_query = _augment_query(query)
            # Get news results for current information
            results = [r for r in ddgs.news(search_query, region="us-en", safesearch="off", max_results=max_results * 2)]
            filtered = _filter_results(results)
            results = (filtered if filtered else results)[:max_results]

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
                "total_results": len(formatted_results),
                "results": formatted_results,
                "formatted_text": formatted_news.strip(),
                "timestamp": datetime.datetime.now().isoformat()
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
    General web search (not just news)
    """
    print(f"JARVIS: Performing general web search for '{query}'...")

    try:
        with DDGS() as ddgs:
            search_query = _augment_query(query)
            results = [r for r in ddgs.text(search_query, region="us-en", safesearch="off", max_results=max_results * 2)]
            filtered = _filter_results(results)
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
            for res in formatted_results:
                formatted_text += f"{res['id']}. {res['title']}\n"
                formatted_text += f"URL: {res['url']}\n"
                if res['body']:
                    formatted_text += f"Summary: {res['body']}\n"
                formatted_text += "\n"

            return {
                "status": "success",
                "query": query,
                "total_results": len(formatted_results),
                "results": formatted_results,
                "formatted_text": formatted_text.strip(),
                "timestamp": datetime.datetime.now().isoformat()
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
        print("🧪 Testing JARVIS Live Search...\n")

        # Test news search
        print("=== NEWS SEARCH TEST ===")
        news_result = jarvis_live_search("Latest AI news 2026")
        if news_result["status"] == "success":
            print("✅ News search successful!")
            print(news_result["formatted_text"][:500] + "...\n")
        else:
            print(f"❌ News search failed: {news_result['message']}\n")

        # Test general web search
        print("=== WEB SEARCH TEST ===")
        web_result = jarvis_web_search("What is quantum computing", 3)
        if web_result["status"] == "success":
            print("✅ Web search successful!")
            print(web_result["formatted_text"][:500] + "...\n")
        else:
            print(f"❌ Web search failed: {web_result['message']}\n")

        print("🎉 JARVIS Search functions ready!")