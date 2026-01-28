#!/usr/bin/env python3
"""
Test JARVIS Live Endpoints on Render
Tests the deployed agentic workflow
"""

import requests
import json
import time

PYTHON_BACKEND = "https://jarvis-python-ml-service.onrender.com"

print("\n" + "="*70)
print("JARVIS LIVE ENDPOINT TEST")
print("="*70)
print(f"Backend: {PYTHON_BACKEND}\n")

# Test 1: Health Check
print("-"*70)
print("TEST 1: Health Check")
print("-"*70)

try:
    response = requests.get(f"{PYTHON_BACKEND}/health", timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ PASS - Backend is healthy")
    else:
        print("❌ FAIL - Unexpected status")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test 2: General Query (No Search)
print("\n" + "-"*70)
print("TEST 2: General Query - No Web Search")
print("-"*70)

query2 = {"query": "What is machine learning in simple terms?"}
print(f"Query: {query2['query']}")

try:
    response = requests.post(
        f"{PYTHON_BACKEND}/api/jarvis/ask",
        json=query2,
        timeout=15
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    
    print(f"Success: {data.get('success')}")
    print(f"Needs Search: {data.get('needs_search')}")
    print(f"Response Preview: {data.get('response', '')[:150]}...")
    
    if data.get('success') and not data.get('needs_search'):
        print("✅ PASS - General query handled correctly")
    else:
        print("⚠️  WARNING - Check response details")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test 3: News Query (With Web Search)
print("\n" + "-"*70)
print("TEST 3: News Query - WITH Web Search")
print("-"*70)

query3 = {"query": "What's the latest in artificial intelligence news today?"}
print(f"Query: {query3['query']}")

try:
    start = time.time()
    response = requests.post(
        f"{PYTHON_BACKEND}/api/jarvis/ask",
        json=query3,
        timeout=20
    )
    elapsed = time.time() - start
    
    print(f"Status: {response.status_code}")
    print(f"Response Time: {elapsed:.1f}s")
    data = response.json()
    
    print(f"Success: {data.get('success')}")
    print(f"Needs Search: {data.get('needs_search')}")
    print(f"Has Research: {data.get('has_research')}")
    print(f"Response Preview: {data.get('response', '')[:150]}...")
    
    if data.get('success') and data.get('needs_search'):
        print("✅ PASS - Web search activated correctly")
    else:
        print("⚠️  WARNING - Check response details")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test 4: Workflow Debug Endpoint
print("\n" + "-"*70)
print("TEST 4: Debug Workflow Endpoint")
print("-"*70)

query4 = {"query": "What are 2026 technology trends?"}
print(f"Query: {query4['query']}")

try:
    response = requests.post(
        f"{PYTHON_BACKEND}/api/jarvis/workflow",
        json=query4,
        timeout=20
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    
    if "step_1_intent" in data:
        print(f"Step 1 - Intent: {data['step_1_intent'].get('needs_search')}")
        print(f"Step 2 - Research (chars): {len(data.get('step_2_research', ''))}")
        print(f"Step 3 - Response: {data.get('step_3_response', '')[:100]}...")
        print("✅ PASS - Workflow endpoint working")
    else:
        print(f"Response: {data}")
except Exception as e:
    print(f"❌ ERROR: {e}")

print("\n" + "="*70)
print("LIVE ENDPOINT TEST COMPLETE")
print("="*70)
print("\nNext: Monitor Render logs for performance metrics")
print("Tavily API usage: Check account at https://tavily.com/dashboard")
print("\n")
