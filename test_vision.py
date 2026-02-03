#!/usr/bin/env python3
"""
J.A.R.V.I.S Vision API Test Client
Test the Gemini 1.5 Flash multimodal capabilities

Usage:
    python test_vision.py <image_path> [prompt]

Example:
    python test_vision.py screenshot.png "What's in this diagram?"
"""

import sys
import requests
from pathlib import Path

BACKEND_URL = "https://ai-tutor-jarvis.onrender.com"
VISION_ENDPOINT = f"{BACKEND_URL}/vision"

def test_vision(image_path: str, prompt: str = "Analyze this image in detail."):
    """Test the vision endpoint with an image"""
    
    # Verify file exists
    if not Path(image_path).exists():
        print(f"❌ Error: File not found: {image_path}")
        return False
    
    print(f"🔍 Testing Vision API...")
    print(f"   Image: {image_path}")
    print(f"   Prompt: {prompt}")
    print()
    
    try:
        with open(image_path, "rb") as img_file:
            files = {"file": img_file}
            data = {"prompt": prompt}
            
            response = requests.post(
                VISION_ENDPOINT,
                files=files,
                data=data,
                timeout=60
            )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Success!")
            print(f"\nResponse:")
            print("-" * 60)
            print(result.get("answer", "No answer returned"))
            print("-" * 60)
            print(f"\nEngine: {result.get('engine', 'Unknown')}")
            print(f"Timestamp: {result.get('timestamp', 'Unknown')}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return False
    
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_vision.py <image_path> [prompt]")
        print("\nExample:")
        print("  python test_vision.py diagram.png 'Explain this diagram'")
        sys.exit(1)
    
    image_path = sys.argv[1]
    prompt = sys.argv[2] if len(sys.argv) > 2 else "Analyze this image in detail."
    
    success = test_vision(image_path, prompt)
    sys.exit(0 if success else 1)
