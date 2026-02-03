"""
Quick diagnostic for vision endpoint
"""
import requests

BACKEND = "https://ai-tutor-jarvis.onrender.com"

print("=" * 60)
print("J.A.R.V.I.S Backend Diagnostic")
print("=" * 60)

# 1. Check health
print("\n1️⃣ Checking /health...")
try:
    r = requests.get(f"{BACKEND}/health", timeout=10)
    health = r.json()
    print(f"   Status: {health.get('status')}")
    print(f"   Groq: {health.get('groq_available')}")
    print(f"   Tavily: {health.get('tavily_available')}")
    print(f"   Gemini: {health.get('gemini_available')}")
    print(f"   MoE Router: {health.get('moe_router')}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# 2. Check home endpoint
print("\n2️⃣ Checking / (home)...")
try:
    r = requests.get(f"{BACKEND}/", timeout=10)
    home = r.json()
    print(f"   Version: {home.get('version')}")
    print(f"   Endpoints: {list(home.get('endpoints', {}).keys())}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# 3. Test ask endpoint
print("\n3️⃣ Testing /ask endpoint...")
try:
    r = requests.post(
        f"{BACKEND}/ask",
        json={"question": "hi"},
        timeout=30
    )
    result = r.json()
    print(f"   Success: {result.get('success')}")
    print(f"   Model: {result.get('model')}")
    print(f"   Answer: {result.get('answer')[:50]}...")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ Diagnostic complete")
print("=" * 60)
