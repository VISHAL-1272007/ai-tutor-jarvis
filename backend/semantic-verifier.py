"""
Semantic Verification Layer for JARVIS
Uses sentence-transformers to check if Groq's answer aligns with live 2026 search results
"""

import sys
import json
from sentence_transformers import SentenceTransformer, util

# Load the model (using a lightweight but accurate model)
print('[DEBUG] Loading Model...')
model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_similarity(text1, text2):
    """
    Calculate semantic similarity between two texts
    Returns a score between 0 and 1
    """
    print('[DEBUG] Comparison Started...')
    # Generate embeddings
    embedding1 = model.encode(text1, convert_to_tensor=True)
    embedding2 = model.encode(text2, convert_to_tensor=True)
    
    # Calculate cosine similarity
    similarity = util.cos_sim(embedding1, embedding2)
    
    return float(similarity[0][0])

def verify_answer(groq_answer, search_results_text, threshold=0.5):
    """
    Verify if Groq's answer aligns with live search results
    """
    try:
        # Calculate similarity
        similarity_score = calculate_similarity(groq_answer, search_results_text)
        
        # Determine verification status
        is_verified = similarity_score >= threshold
        
        result = {
            "status": "success",
            "similarity_score": round(similarity_score, 4),
            "is_verified": is_verified,
            "threshold": threshold,
            "verdict": "VERIFIED" if is_verified else "POTENTIALLY_OUTDATED",
            "recommendation": "Answer aligns with live data" if is_verified else "Answer may contain outdated information. Refer to live search results."
        }
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "similarity_score": 0.0,
            "is_verified": False,
            "verdict": "ERROR"
        }

if __name__ == "__main__":
    if len(sys.argv) > 2:
        # Command-line mode for Node.js integration
        groq_answer = sys.argv[1]
        search_results_text = sys.argv[2]
        threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
        
        result = verify_answer(groq_answer, search_results_text, threshold)
        
        # Output JSON for Node.js and flush
        print(json.dumps(result))
        sys.stdout.flush()
    else:
        # Interactive test mode
        print("🧪 Testing Semantic Verification...\n")
        
        # Test case 1: Similar content
        print("=== TEST 1: Similar Content ===")
        text1 = "AI technology has advanced significantly in 2026 with new regulations"
        text2 = "In 2026, artificial intelligence saw major policy changes and regulatory updates"
        result1 = verify_answer(text1, text2)
        print(f"Similarity: {result1['similarity_score']:.4f}")
        print(f"Verdict: {result1['verdict']}\n")
        
        # Test case 2: Different content
        print("=== TEST 2: Different Content ===")
        text3 = "The weather in Paris is sunny today"
        text4 = "Quantum computing breakthroughs announced by IBM in 2026"
        result2 = verify_answer(text3, text4)
        print(f"Similarity: {result2['similarity_score']:.4f}")
        print(f"Verdict: {result2['verdict']}\n")
        
        # Test case 3: Outdated vs Current
        print("=== TEST 3: Outdated vs Current ===")
        text5 = "OpenAI released GPT-4 in 2023 as their latest model"
        text6 = "In 2026, OpenAI announced GPT-5 with revolutionary multimodal capabilities"
        result3 = verify_answer(text5, text6)
        print(f"Similarity: {result3['similarity_score']:.4f}")
        print(f"Verdict: {result3['verdict']}\n")
        
        print("✅ Semantic verification tests complete!")
