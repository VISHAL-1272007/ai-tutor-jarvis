"""
Test the 3000-token limit for Tavily RAG [cite: 03-02-2026]
Tests that long queries don't cause Groq 400 errors
"""

import requests
import time

BACKEND_URL = "https://ai-tutor-jarvis.onrender.com"

def test_long_query():
    """Test with query that would fetch lots of content"""
    print("\n" + "="*70)
    print("🧪 Testing Token Limit (Should NOT get Groq 400 error)")
    print("="*70)
    
    # This query should trigger extensive web research
    query = "Tell me everything about the latest AI news today with full details on all recent developments"
    
    print(f"📝 Query: {query}\n")
    print("⏳ Sending request...")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/ask",
            json={"question": query},
            timeout=60
        )
        
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("answer", "")
            model = data.get("model", "")
            has_research = data.get("has_web_research", False)
            
            print(f"🤖 Model: {model}")
            print(f"🔍 Used Web Research: {has_research}")
            print(f"📏 Answer Length: {len(answer)} chars")
            print(f"\n📝 Answer Preview:\n{answer[:500]}...")
            
            # Check for expected format
            if has_research:
                if "Sir, I found this on the web" in answer:
                    print("\n✅ Correct attribution format!")
                else:
                    print("\n⚠️ Warning: Expected 'Sir, I found this on the web...'")
                
                if "Sources:" in answer:
                    print("✅ Sources listed!")
                else:
                    print("⚠️ Warning: No sources found")
            else:
                print("\n⚠️ Warning: Web research not triggered")
        
        elif response.status_code == 400:
            print(f"❌ GROQ 400 ERROR (Token limit not working!)")
            print(f"Response: {response.text}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_normal_query():
    """Test with normal query"""
    print("\n" + "="*70)
    print("🧪 Testing Normal Query")
    print("="*70)
    
    query = "Who is the current president?"
    
    print(f"📝 Query: {query}\n")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/ask",
            json={"question": query},
            timeout=30
        )
        
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("answer", "")
            has_research = data.get("has_web_research", False)
            
            print(f"🔍 Used Web Research: {has_research}")
            print(f"\n📝 Answer:\n{answer[:300]}...")
        else:
            print(f"❌ Error: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print("\n🚀 Starting RAG Token Limit Tests")
    print(f"🎯 Target: {BACKEND_URL}")
    
    # Test normal query first
    test_normal_query()
    
    time.sleep(2)
    
    # Test long query that could cause 400 error
    test_long_query()
    
    print("\n" + "="*70)
    print("✅ Tests Complete")
    print("="*70)
