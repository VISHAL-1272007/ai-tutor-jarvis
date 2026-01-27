"""Test to debug the ml_service issue"""
import sys
sys.path.insert(0, '.')

# Check what's in the MLService class
from ml_service import MLService

ml = MLService()

# List all methods
methods = [m for m in dir(ml) if not m.startswith('_')]
print("MLService methods:")
for m in methods:
    print(f"  - {m}")

print(f"\nHas 'generate_jarvis_response': {'generate_jarvis_response' in methods}")
