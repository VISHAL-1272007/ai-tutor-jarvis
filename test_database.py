"""
Test SQLite database functionality [cite: 03-02-2026]
Tests chat history storage and retrieval
"""

import requests
import time

BACKEND_URL = "http://localhost:10000"  # Python backend port (Render uses 10000)

def test_chat_with_storage():
    """Test /chat endpoint with database storage"""
    print("\n" + "="*70)
    print("🧪 Testing Chat with Database Storage")
    print("="*70)
    
    test_messages = [
        "What is Python?",
        "Tell me about Flask",
        "How does SQLite work?"
    ]
    
    for msg in test_messages:
        print(f"\n📝 Sending: {msg}")
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/chat",
                json={"message": msg},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")
                print(f"✅ Response: {answer[:100]}...")
                time.sleep(1)
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
        
        except Exception as e:
            print(f"❌ Request failed: {e}")

def test_history_retrieval():
    """Test /history endpoint"""
    print("\n" + "="*70)
    print("🧪 Testing History Retrieval")
    print("="*70)
    
    try:
        response = requests.get(f"{BACKEND_URL}/history", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            messages = data.get("messages", [])
            count = data.get("count", 0)
            
            print(f"✅ Retrieved {count} messages")
            print(f"\n📜 Last 5 messages:")
            
            for msg in messages[-5:]:
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                timestamp = msg.get("timestamp", "")
                
                print(f"\n🔹 [{role}] @ {timestamp}")
                print(f"   {content[:80]}...")
        
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_health():
    """Test backend health"""
    print("\n" + "="*70)
    print("🧪 Testing Backend Health")
    print("="*70)
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            status = data.get("status", "unknown")
            print(f"✅ Backend status: {status}")
        else:
            print(f"❌ Error: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Backend not running: {e}")
        print("\n⚠️ Start backend with: python python-backend/app.py")
        return False
    
    return True

if __name__ == "__main__":
    print("\n🚀 Starting Database Tests")
    print(f"🎯 Target: {BACKEND_URL}")
    
    # Check if backend is running
    if not test_health():
        exit(1)
    
    # Test chat with storage
    test_chat_with_storage()
    
    time.sleep(2)
    
    # Test history retrieval
    test_history_retrieval()
    
    print("\n" + "="*70)
    print("✅ Tests Complete")
    print("="*70)
    print("\n💡 Tip: Check jarvis_chat_history.db file in python-backend folder")
