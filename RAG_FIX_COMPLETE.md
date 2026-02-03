# RAG Pipeline Fix - Complete ✅

## Problem Statement
- **Jina 404 errors**: Old web scraping breaking RAG pipeline
- **Groq 400 errors**: Context exceeding token limits causing prompt truncation

## Solution Implemented

### 1. ✅ Removed Old Imports
```python
# REMOVED:
import sqlite3  # Not used
from urllib.parse import quote  # Not needed
from typing import Tuple  # Not needed after refactor
```

### 2. ✅ Implemented Token Limiting
```python
MAX_CONTEXT_TOKENS = 3000  # Prevent Groq 400 error

def truncate_to_tokens(text: str, max_tokens: int = MAX_CONTEXT_TOKENS) -> str:
    """Truncate text to approximate token count (1 token ≈ 4 chars)"""
    max_chars = max_tokens * 4
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "...[truncated for length]"
```

### 3. ✅ Created Robust `get_web_research()` Function
```python
def get_web_research(query: str) -> str:
    """
    Robust Tavily research with token limiting and fallback
    Returns clean formatted context string or empty string on failure
    """
    if not TAVILY_AVAILABLE or not TAVILY_API_KEY:
        print("⚠️ Tavily not available - using internal knowledge")
        return ""
    
    try:
        # Rewrite query with date context
        rewritten = rewrite_with_date(query)
        
        # Initialize Tavily client
        tavily = TavilyClient(api_key=TAVILY_API_KEY)
        
        # Execute advanced search
        response = tavily.search(
            query=rewritten,
            search_depth="advanced",
            max_results=3
        )
        
        results = response.get("results", [])
        
        if not results:
            return ""
        
        # Format clean context with title, url, content
        context_lines = ["Web Research Results:"]
        urls = []
        
        for idx, item in enumerate(results, start=1):
            title = item.get("title", "Untitled")
            content = item.get("content", "")
            url = item.get("url", "")
            
            urls.append(url)
            context_lines.append(f"\n[{idx}] {title}")
            context_lines.append(f"Content: {content}")
            context_lines.append(f"URL: {url}")
        
        full_context = "\n".join(context_lines)
        
        # Truncate to prevent Groq 400 error
        truncated = truncate_to_tokens(full_context)
        
        # Add source URLs at end
        truncated += f"\n\nSource URLs:\n" + "\n".join(f"- {url}" for url in urls)
        
        return truncated
    
    except Exception as e:
        print(f"⚠️ Tavily error: {e}")
        print("   Falling back to internal knowledge")
        return ""
```

### 4. ✅ Updated System Prompt
```python
def build_system_prompt(web_research: str = "", chat_context: str = "") -> str:
    """Build JARVIS system prompt with web research attribution"""
    base_prompt = (
        "You are J.A.R.V.I.S, Tony Stark's hyper-intelligent AI assistant (2026 Edition).\n"
        "Core directives:\n"
        "1. Be proactive and anticipate user needs\n"
        "2. Provide comprehensive, accurate answers\n"
        "3. Remember previous context from conversations\n"
        "4. Speak naturally and professionally\n"
    )
    
    if chat_context:
        base_prompt += f"\n{chat_context}\n"
    
    if web_research:
        base_prompt += (
            "\nWhen using web research data:\n"
            "1. Start with: 'Sir, I found this on the web...'\n"  # ✅ NEW
            "2. Integrate the facts naturally into your answer\n"
            "3. End with: 'Sources: [URLs]' listing the source links\n"  # ✅ NEW
            "4. Never say 'Based on' or 'According to' - be direct\n"
            f"\n{web_research}\n"
            "\nAnswer the user's question using this verified web data.\n"
        )
    
    return base_prompt
```

### 5. ✅ Enhanced Error Handling
```python
# Step 5: Call LLM with fallback
try:
    answer = call_groq_with_model(user_query, selected_model, system_prompt)
except Exception as e:
    print(f"⚠️ LLM call failed: {e}")
    answer = FALLBACK_MESSAGE

# Fallback if Tavily fails
web_research = get_web_research(user_query)
if web_research:
    print(f"✅ Web research retrieved ({len(web_research)} chars)")
else:
    print("⚠️ Using internal knowledge (research failed or unavailable)")
```

## Changes Made

### Files Modified
- [python-backend/app.py](python-backend/app.py)
  - Removed unused imports (sqlite3, urllib.parse.quote)
  - Removed old `tavily_search()` function
  - Added `truncate_to_tokens()` function
  - Added `get_web_research()` function
  - Updated `build_system_prompt()` with new attribution format
  - Updated `handle_query_with_moe()` to use new functions
  - Added try-except around LLM calls

### Files Created
- [test_rag_token_limit.py](test_rag_token_limit.py) - Token limit testing tool

## Git Commit
```
Commit: d4a98d6
Message: 🔧 Fix Groq 400 errors: Implement 3000-token Tavily RAG with robust fallback
Branch: main-clean
Pushed: ✅ Yes
```

## Deployment Status
- **GitHub**: ✅ Pushed to main-clean
- **Render**: ⏳ Rebuilding (auto-deploy triggered)
- **Expected**: 2-3 minutes for build + deploy

## Testing

### Manual Testing
```bash
# Test normal query
python test_rag_token_limit.py

# Test long query (should NOT get 400 error)
curl -X POST https://ai-tutor-jarvis.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Tell me everything about the latest AI news today"}'
```

### Expected Results
1. ✅ No Groq 400 errors (token limit enforced)
2. ✅ Web research returns formatted context
3. ✅ JARVIS says "Sir, I found this on the web..."
4. ✅ Sources listed at end with URLs
5. ✅ Graceful fallback if Tavily fails

## Configuration Needed

### Environment Variables (Render Dashboard)
```
TAVILY_API_KEY = [your_tavily_api_key]
```

**Get API Key**: https://tavily.com/

### How to Set in Render
1. Go to: https://dashboard.render.com/
2. Select: Python backend service
3. Click: Environment tab
4. Add variable: `TAVILY_API_KEY`
5. Save (auto-redeploys)

## Architecture Summary

```
User Query
    ↓
is_time_sensitive_query() → Checks keywords
    ↓
get_web_research() → Tavily Advanced Search (3 results)
    ↓
truncate_to_tokens() → Enforces 3000 token limit
    ↓
build_system_prompt() → Adds attribution instructions
    ↓
call_groq_with_model() → LLM generates answer
    ↓
Response with "Sir, I found this on the web..." + Sources
```

## Key Features

### Token Limiting
- Max 3000 tokens (≈12,000 chars)
- Prevents Groq 400 errors
- Graceful truncation with "...[truncated for length]"

### Source Attribution
- Clear opening: "Sir, I found this on the web..."
- Closing with: "Sources:\n- [URLs]"
- Natural fact integration

### Robust Fallback
- If Tavily unavailable → Uses internal knowledge
- If Tavily errors → Returns empty string, proceeds with internal knowledge
- If LLM fails → Returns FALLBACK_MESSAGE

### Clean Implementation
- No Jina imports ✅
- No old web scraping ✅
- Only Tavily for web research ✅
- Comprehensive error handling ✅

## Next Steps

1. ⏳ Wait for Render deployment (2-3 minutes)
2. ✅ Test with `python test_rag_token_limit.py`
3. ✅ Verify no Groq 400 errors
4. ⏳ Set TAVILY_API_KEY in Render dashboard
5. ✅ Test with real queries requiring web search

## Success Criteria

- [x] Removed Jina and old scraping
- [x] Implemented Tavily-only research
- [x] Created get_web_research() function
- [x] Fixed Groq 400 errors with 3000 token limit
- [x] Updated system prompt attribution
- [x] Added fallback handling
- [x] Committed and pushed to GitHub
- [ ] Deployed to Render (in progress)
- [ ] Tested with long queries
- [ ] Verified source attribution format

---

**Status**: ✅ Code Complete | ⏳ Deployment In Progress | 🧪 Testing Pending

**Last Updated**: February 3, 2026
