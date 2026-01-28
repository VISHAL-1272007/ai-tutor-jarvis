#!/usr/bin/env python3
"""Test smart search logic"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from ml_service import MLService

ml = MLService()

print("\n" + "=" * 70)
print("TESTING SMART SEARCH LOGIC")
print("=" * 70)

test_queries = [
    # Should NOT search web (general knowledge)
    ("What is Python?", False),
    ("Explain machine learning", False),
    ("Who is Albert Einstein?", False),
    ("How to write a for loop?", False),
    ("What is LeetCode?", False),
    
    # SHOULD search web (current/live info)
    ("What is today's news?", True),
    ("Latest AI developments", True),
    ("Current Tamil Nadu news", True),
    ("What happened today in 2026?", True),
    ("Breaking news actor Vijay", True),
]

print("\n📋 Testing query classification:\n")

for query, expected_web_search in test_queries:
    needs_search = ml._needs_web_search(query)
    status = "✅" if needs_search == expected_web_search else "❌"
    search_mode = "🌐 WEB SEARCH" if needs_search else "🧠 BUILT-IN"
    
    print(f"{status} {search_mode:20} | {query}")

print("\n" + "=" * 70)
print("CLASSIFICATION TEST COMPLETE")
print("=" * 70)
