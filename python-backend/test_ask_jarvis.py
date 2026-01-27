"""
Test script for JARVIS /ask-jarvis endpoint
Tests the complete pipeline: Researcher → Groq LLM → Response
"""

import requests
import json

# Flask server URL
BASE_URL = "http://localhost:5002"

def test_ask_jarvis():
    """Test the /ask-jarvis endpoint"""
    
    print("=" * 70)
    print("TESTING JARVIS AI ASSISTANT ENDPOINT")
    print("=" * 70)
    
    # Test query
    test_query = "What are the latest Python programming trends?"
    
    print(f"\n📝 Query: {test_query}")
    print("\n🔄 Sending request to /ask-jarvis endpoint...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/ask-jarvis",
            json={"query": test_query},
            timeout=60  # Allow time for research + LLM
        )
        
        print(f"\n✅ Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n" + "=" * 70)
            print("JARVIS RESPONSE")
            print("=" * 70)
            
            if data.get('success'):
                print(f"\n🤖 AI Response:\n{data['response']}\n")
                
                print(f"📊 Metadata:")
                print(f"  - Verified Sources: {data.get('verified_sources_count', 0)}")
                print(f"  - Context Length: {data.get('context_length', 0)} chars")
                print(f"  - Model: {data.get('model', 'Unknown')}")
                
                if data.get('sources'):
                    print(f"\n📚 Sources ({len(data['sources'])}):")
                    for i, source in enumerate(data['sources'], 1):
                        print(f"  {i}. {source['title']}")
                        print(f"     {source['url']}")
            else:
                print(f"❌ Error: {data.get('error', 'Unknown error')}")
                
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Flask server not running on port 5002")
        print("   Start server with: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    test_ask_jarvis()
