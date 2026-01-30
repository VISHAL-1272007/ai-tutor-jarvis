"""
J.A.R.V.I.S. Brain Engine
Integrates Groq Llama 3.1 with memory management, real-time web search, and n8n actions.
"""

import os
import logging
import re
from typing import List, Tuple
from groq import Groq
from dotenv import load_dotenv

from memory_manager import get_history, save_message
from eyes_search import search_web
from hands import trigger_n8n_action

# Setup
load_dotenv()
logger = logging.getLogger("jarvis.brain")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# JARVIS System Prompt with Hands capability
SYSTEM_PROMPT = """You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), 
an advanced autonomous AI agent with brain, eyes, and hands.

CORE CAPABILITIES:
- BRAIN: Groq Llama 3.1 reasoning engine
- EYES: Real-time web search via SearXNG
- HANDS: Task automation via n8n workflows (email, reminders, notes, calendar, Telegram)

CORE DIRECTIVES:
- Be professional, witty, and highly technical.
- Address the user as "Boss" or "Sir" occasionally (natural, not forced).
- Provide accurate, concise answers with minimal fluff.
- When search results are provided, cite them as [1], [2], [3], etc.
- When executing actions, say "Initiating action, Sir..." or "On it, Boss."
- Maintain 100% data privacy; never expose API keys or server secrets.
- Current date: January 30, 2026.

RESPONSE FORMAT:
1. Lead with the most important answer.
2. Add concise context or steps if needed.
3. Include citations [1] from search results where applicable.
4. For actions: Confirm execution before responding.
5. End with "Sources: [1] URL, [2] URL" if search was used.

AVAILABLE ACTIONS:
- send_email: "Send email to boss@example.com about project update"
- set_reminder: "Remind me at 3 PM to call the client"
- save_note: "Save this important finding to my notes"
- create_calendar: "Add meeting with team on Friday at 2 PM"
- telegram_message: "Send message to my Telegram: Project status update"
"""

# Keywords that trigger real-time web search
REALTIME_KEYWORDS = [
    'now', 'today', 'current', 'latest', 'news', 'breaking', 'live',
    'trending', 'recent', 'price', 'stock', 'crypto', 'bitcoin', 'weather',
    'forecast', '2026', 'right now', 'this week', 'this month',
    'gold price', 'oil price', 'exchange rate', 'market', 'update',
    'what is', 'who is', 'where is', 'when is', 'how much',
    'best', 'top', 'new', 'released', 'launched', 'announced'
]

# Keywords that trigger n8n actions
ACTION_KEYWORDS = {
    'send': 'send_email',
    'email': 'send_email',
    'mail': 'send_email',
    'reminder': 'set_reminder',
    'remind': 'set_reminder',
    'save': 'save_note',
    'note': 'save_note',
    'calendar': 'create_calendar',
    'meeting': 'create_calendar',
    'telegram': 'telegram_message',
    'text': 'telegram_message',
}


def _needs_realtime_search(query: str) -> bool:
    """Detect if query requires real-time web search."""
    query_lower = query.lower().strip()
    return any(keyword in query_lower for keyword in REALTIME_KEYWORDS)


def _detect_action_intent(query: str) -> Tuple[str, bool]:
    """
    Detect if user intends to perform an action.
    
    Returns:
        (action_type: str, is_action: bool)
    """
    query_lower = query.lower()
    for keyword, action in ACTION_KEYWORDS.items():
        if keyword in query_lower:
            return action, True
    return "", False


def _format_search_results(results: List[dict]) -> str:
    """Format search results for LLM consumption."""
    if not results:
        return ""
    
    formatted = "### REAL-TIME WEB SEARCH RESULTS:\n"
    for idx, result in enumerate(results, 1):
        formatted += f"[{idx}] {result.get('title', 'N/A')}\n"
        formatted += f"    URL: {result.get('url', 'N/A')}\n"
        formatted += f"    Summary: {result.get('snippet', 'N/A')}\n\n"
    return formatted


def process_query(user_input: str) -> str:
    """
    Main JARVIS reasoning engine with Brain, Eyes, and Hands.
    
    FLOW:
    1. Load recent chat history (last 5 messages).
    2. Detect if real-time search is needed (Eyes).
    3. Detect if action execution is needed (Hands).
    4. If search: fetch web results via SearXNG.
    5. Pass history + context to Llama 3.1 (Brain).
    6. If action: trigger n8n workflow (Hands).
    7. Save user query and response to memory.
    8. Return final answer.
    
    Args:
        user_input: User query string.
    
    Returns:
        JARVIS response string with citations and action confirmation.
    """
    if not user_input or not user_input.strip():
        return "Please provide a valid query, Boss. I'm standing by."
    
    try:
        # Step 1: Fetch recent history
        history: List[Tuple[str, str]] = get_history(limit=5)
        
        # Step 2: Detect action intent
        action_type, is_action = _detect_action_intent(user_input)
        
        # Step 3: Check if search is needed
        search_context = ""
        if _needs_realtime_search(user_input):
            logger.info(f"👀 Engaging Eyes for: {user_input[:60]}...")
            try:
                results = search_web(user_input)
                if results:
                    search_context = _format_search_results(results)
                    logger.info(f"✅ Search returned {len(results)} results")
            except Exception as e:
                logger.warning(f"⚠️ Search failed: {str(e)}")
        
        # Step 4: Build messages for Groq
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add history
        for role, content in history:
            messages.append({"role": role, "content": content})
        
        # Add search context + current query
        user_message = user_input
        if search_context:
            user_message = f"{search_context}\n\nBoss's Query: {user_input}\n\nProvide a comprehensive answer based on the search results. Cite sources as [1], [2], etc."
        
        messages.append({"role": "user", "content": user_message})
        
        # Step 5: Get response from Llama 3.1 (Brain)
        logger.info("🧠 Invoking Brain (Llama 3.1)...")
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=messages,
            temperature=0.6,
            max_tokens=1024,
            top_p=0.9
        )
        
        answer = response.choices[0].message.content.strip()
        logger.info(f"✅ Brain responded ({len(answer)} chars)")
        
        # Step 6: Execute action if needed (Hands)
        action_result = ""
        if is_action:
            logger.info(f"✋ Engaging Hands for: {action_type}")
            action_msg = f"Initiating action, Sir... ({action_type})"
            success, hand_response = trigger_n8n_action(action_type, user_input)
            
            if success:
                action_result = f"\n\n✅ {hand_response}"
                logger.info(f"✅ Action succeeded: {action_type}")
            else:
                action_result = f"\n\n❌ {hand_response}"
                logger.error(f"❌ Action failed: {action_type}")
        
        # Step 7: Combine response
        final_response = answer + action_result
        
        # Step 8: Save to memory
        save_message("user", user_input.strip())
        save_message("assistant", final_response)
        
        return final_response
        
    except Exception as e:
        error_msg = f"❌ Brain error: {str(e)}"
        logger.error(error_msg)
        return error_msg


if __name__ == "__main__":
    # Quick test
    logging.basicConfig(level=logging.INFO)
    
    print("\n=== TEST 1: Search Query ===")
    test_query1 = "What is the current Bitcoin price, Boss?"
    print(f"Query: {test_query1}")
    print(f"Response: {process_query(test_query1)}")
    
    print("\n=== TEST 2: Action Query ===")
    test_query2 = "Send an email to my boss about the project completion"
    print(f"Query: {test_query2}")
    print(f"Response: {process_query(test_query2)}")

