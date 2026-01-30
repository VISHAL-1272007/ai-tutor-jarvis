"""
Vision Module for JARVIS
Uses Groq Llama 3.2 Vision to analyze images
"""

import base64
import os
from groq import Groq

# API Key check
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def analyze_image(image_path, prompt="Describe this image in detail"):
    """
    Analyze an image using Llama 3.2 Vision model.
    
    Args:
        image_path (str): Path to the image file
        prompt (str): Custom prompt for image analysis
        
    Returns:
        str: Description of the image or error message
    """
    try:
        # 1. Read and encode the image
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        # 2. Vision Model: llama-3.2-11b-vision-preview
        completion = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview", 
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{encoded_string}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.7,  # 0.7 is stable for vision tasks
            max_tokens=1024
        )
        return completion.choices[0].message.content

    except Exception as e:
        return f"❌ Vision Error: {str(e)}"
