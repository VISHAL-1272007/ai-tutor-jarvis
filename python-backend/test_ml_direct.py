"""
Direct test of the generate_jarvis_response function
"""

from ml_service import generate_jarvis_response

print("=" * 70)
print("TESTING JARVIS RESPONSE GENERATION")
print("=" * 70)

test_query = "What are Python programming trends?"

print(f"\n📝 Query: {test_query}")
print("\n🔄 Generating JARVIS response...")

try:
    result = generate_jarvis_response(test_query)
    
    print("\n" + "=" * 70)
    print("RESPONSE")
    print("=" * 70)
    
    if result.get('success'):
        print(f"\n✅ SUCCESS\n")
        print(f"🤖 AI Response:\n{result['response']}\n")
        print(f"📊 Metadata:")
        print(f"  - Verified Sources: {result.get('verified_sources_count', 0)}")
        print(f"  - Context Length: {result.get('context_length', 0)} chars")
        print(f"  - Model: {result.get('model', 'Unknown')}")
        
        if result.get('sources'):
            print(f"\n📚 Sources ({len(result['sources'])}):")
            for i, source in enumerate(result['sources'], 1):
                print(f"  {i}. {source['title']}")
                print(f"     {source['url']}")
    else:
        print(f"❌ FAILED\n")
        print(f"Error: {result.get('error', 'Unknown error')}")
        print(f"Response: {result.get('response', 'N/A')}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
