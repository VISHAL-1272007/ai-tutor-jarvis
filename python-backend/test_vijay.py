#!/usr/bin/env python3
"""Test DDGS with actor Vijay query"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from jarvis_researcher import jarvis_researcher

print("\n" + "=" * 70)
print("Testing: actor vijay")
print("=" * 70)

results = jarvis_researcher("actor vijay", max_results=3)

if results:
    print(f"\n✅ Found {len(results)} results:\n")
    for i, r in enumerate(results, 1):
        print(f"{i}. {r['title']}")
        print(f"   Source: {r.get('source', 'Unknown')}")
        print(f"   URL: {r['url']}")
        print(f"   Preview: {r['content'][:100]}...\n")
else:
    print("❌ No results found")

print("=" * 70)
