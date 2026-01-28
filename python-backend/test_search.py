#!/usr/bin/env python3
"""Test the JARVIS Researcher with NewsAPI"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from jarvis_researcher import jarvis_researcher, search_with_newsapi, search_with_ddgs

print("\n" + "=" * 70)
print("JARVIS RESEARCHER - SEARCH TEST")
print("=" * 70)

# Test 1: NewsAPI
print("\n📰 Test 1: NewsAPI Direct")
print("-" * 70)
results = search_with_newsapi("What is LeetCode?", max_results=3)
if results:
    for i, r in enumerate(results, 1):
        print(f"\n{i}. {r['title']}")
        print(f"   Source: {r['source']}")
        print(f"   URL: {r['url']}")
        print(f"   Preview: {r['content'][:100]}...")
else:
    print("❌ No results from NewsAPI")

# Test 2: Full pipeline
print("\n\n🔍 Test 2: Full JARVIS Pipeline")
print("-" * 70)
results = jarvis_researcher("What is LeetCode?", max_results=3)
if results:
    print(f"\n✅ Found {len(results)} results:")
    for i, r in enumerate(results, 1):
        print(f"\n{i}. {r['title']}")
        print(f"   Source: {r['source']}")
        print(f"   URL: {r['url']}")
        print(f"   Preview: {r['content'][:100]}...")
else:
    print("❌ No results from JARVIS")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
