"""Quick test for JARVIS Researcher"""
from jarvis_researcher import jarvis_researcher

# Simple test
print("Testing JARVIS Researcher with quick query...")
results = jarvis_researcher("Python programming", max_results=2)

print(f"\nGot {len(results)} results:")
for i, r in enumerate(results, 1):
    print(f"\n{i}. {r['title']}")
    print(f"   {r['url'][:80]}")
    print(f"   Content: {r['content'][:100]}...")
