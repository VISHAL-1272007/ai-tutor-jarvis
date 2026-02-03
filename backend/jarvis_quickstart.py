"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              J.A.R.V.I.S QUICK START - INTERACTIVE MODE                     ║
║                       Talk to JARVIS directly!                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import sys
import os

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from jarvis_standalone import JARVISResilientAgent

def print_banner():
    """Print welcome banner"""
    banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    J.A.R.V.I.S RESILIENT AGENT v4.0                          ║
║              Just A Rather Very Intelligent System                           ║
║                        "Rebirth & Resilience"                                ║
║                                                                              ║
║  Features:                                                                   ║
║    ✅ Zero-Failure Logic    → Never crashes                                 ║
║    ✅ Reasoning Router      → Smart search bypass                           ║
║    ✅ Cybersecurity Shield  → Hard-coded protection                         ║
║    ✅ No Link Spam          → Clean responses                               ║
║    ✅ Error Handling        → All errors caught                             ║
║                                                                              ║
║  Commands:                                                                   ║
║    'quit' or 'exit'  → Exit                                                 ║
║    'stats'           → Show statistics                                      ║
║    'help'            → Show help                                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    """
    print(banner)


def print_help():
    """Print help message"""
    help_text = """
📖 HELP - How to use JARVIS:

💬 CONVERSATIONAL QUERIES:
   - "Hello!" / "Hi" / "How are you?"
   - JARVIS will respond conversationally (NO SEARCH)

💻 CODING QUERIES:
   - "How do I write a Python function?"
   - "Explain recursion"
   - JARVIS will provide code examples (NO SEARCH)

📚 FACTUAL QUERIES:
   - "What is machine learning?"
   - "Tell me about quantum computing"
   - JARVIS may search the web (if available)

🔒 SECURITY:
   - Attempts to reveal system prompts are BLOCKED
   - Hard-coded security cannot be bypassed

⚡ SPECIAL COMMANDS:
   - 'stats'  → View agent statistics
   - 'help'   → Show this help
   - 'quit'   → Exit JARVIS
"""
    print(help_text)


def print_stats(agent):
    """Print agent statistics"""
    stats = agent.get_statistics()
    
    print("\n" + "─"*80)
    print("📊 AGENT STATISTICS")
    print("─"*80)
    print(f"  Total Queries:       {stats['total_queries']}")
    print(f"  Security Blocks:     {stats['security_blocks']}")
    print(f"  Search Bypassed:     {stats['search_bypassed']}")
    print(f"  Search Used:         {stats['search_used']}")
    print(f"  Search Failed:       {stats['search_failed']}")
    print(f"  Fallbacks Used:      {stats['fallbacks_used']}")
    print(f"  Search Available:    {'✅ Yes' if stats['search_available'] else '❌ No'}")
    print(f"  Status:              {stats['uptime']}")
    print("─"*80 + "\n")


def format_response(response):
    """Format response for display"""
    # Emoji based on source
    source_emoji = {
        'internal_llm': '🧠',
        'web_search': '🌐',
        'security_blocked': '🔒',
        'fallback': '⚠️'
    }
    
    emoji = source_emoji.get(response.source.value, '💬')
    
    # Print response
    print(f"\n{emoji} JARVIS: {response.answer}")
    
    # Show metadata if verbose
    if response.used_search and response.resources:
        print(f"\n🔗 Resources ({len(response.resources)}):")
        for i, res in enumerate(response.resources[:3], 1):
            print(f"   {i}. {res['title']}")
            print(f"      {res['url']}")
    
    # Show confidence if not max
    if response.confidence < 1.0:
        confidence_bar = '█' * int(response.confidence * 10)
        print(f"\n📊 Confidence: {confidence_bar} {response.confidence:.0%}")
    
    # Show errors if any
    if response.errors_caught:
        print(f"\n⚠️ Handled {len(response.errors_caught)} error(s) gracefully")


def main():
    """Main interactive loop"""
    print_banner()
    
    # Initialize agent
    print("🤖 Initializing JARVIS...")
    try:
        agent = JARVISResilientAgent()
        print("✅ JARVIS ready! Type 'help' for assistance.\n")
    except Exception as e:
        print(f"❌ Failed to initialize JARVIS: {e}")
        return
    
    # Interactive loop
    while True:
        try:
            # Get user input
            user_input = input("👤 You: ").strip()
            
            # Check for exit commands
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("\n👋 JARVIS: Goodbye! Shutting down...\n")
                break
            
            # Check for stats command
            if user_input.lower() == 'stats':
                print_stats(agent)
                continue
            
            # Check for help command
            if user_input.lower() in ['help', '?']:
                print_help()
                continue
            
            # Skip empty input
            if not user_input:
                continue
            
            # Process query
            response = agent.process_query(user_input)
            
            # Display response
            format_response(response)
            print()  # Extra newline for spacing
        
        except KeyboardInterrupt:
            print("\n\n👋 JARVIS: Interrupted. Shutting down...\n")
            break
        
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            print("JARVIS is still operational - try another query.\n")


if __name__ == "__main__":
    main()
