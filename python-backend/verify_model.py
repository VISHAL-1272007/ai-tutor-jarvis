"""Quick verification of model update"""
from ml_service import MLService

# Check the model name
ml = MLService()

print("=" * 70)
print("GROQ MODEL VERIFICATION")
print("=" * 70)
print(f"\n✅ Groq client initialized: {ml.groq_client is not None}")
print(f"✅ API Key configured: {ml.groq_api_key is not None}")

# Read the ml_service.py file to verify model name
with open('ml_service.py', 'r', encoding='utf-8') as f:
    content = f.read()
    
# Check for old model
if 'llama3-70b-8192' in content:
    print("\n❌ OLD MODEL FOUND: llama3-70b-8192")
else:
    print("\n✅ Old model removed")

# Check for new model
if 'llama-3.3-70b-versatile' in content:
    print("✅ NEW MODEL CONFIGURED: llama-3.3-70b-versatile")
    count = content.count('llama-3.3-70b-versatile')
    print(f"   Found in {count} location(s)")
else:
    print("❌ New model NOT found")

print("\n" + "=" * 70)
