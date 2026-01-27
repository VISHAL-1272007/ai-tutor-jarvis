"""
Machine Learning Service Module for JARVIS
Lightweight version without heavy ML dependencies
Integrated with JARVIS Researcher and Groq LLM
"""

import re
from datetime import datetime
import json
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from groq import Groq
from jarvis_researcher import jarvis_researcher, jarvis_researcher_quick

class MLService:
    """Lightweight ML/AI Service for JARVIS with Groq Integration"""
    
    def __init__(self):
        """Initialize the ML service with Groq client"""
        print("🤖 ML Service initialized (lightweight mode)")
        
        # Initialize Groq client
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        if self.groq_api_key:
            self.groq_client = Groq(api_key=self.groq_api_key)
            print("✅ Groq LLM client initialized")
        else:
            self.groq_client = None
            print("⚠️ GROQ_API_KEY not found - Groq features disabled")
    
    def predict_with_model(self, features):
        """
        Simple prediction using heuristics
        Args:
            features: List of numerical values
        Returns:
            dict: Prediction result
        """
        try:
            if not features or not isinstance(features, list):
                return {'error': 'Invalid features provided'}
            
            # Simple heuristic: average-based prediction
            avg = sum(features) / len(features)
            prediction = avg > 0.5
            confidence = abs(avg - 0.5) * 2
            
            return {
                'success': True,
                'prediction': bool(prediction),
                'confidence': round(confidence, 2),
                'features_count': len(features),
                'method': 'heuristic',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def analyze_image(self, image_data):
        """
        Basic image analysis (placeholder)
        Args:
            image_data: Image file data
        Returns:
            dict: Analysis result
        """
        try:
            # Basic file validation
            if not image_data:
                return {'error': 'No image data provided'}
            
            file_size = len(image_data) if hasattr(image_data, '__len__') else 0
            
            return {
                'success': True,
                'file_size': file_size,
                'format': 'unknown',
                'dimensions': 'N/A',
                'message': 'Basic image validation passed',
                'note': 'Full image analysis requires opencv-python (not installed)',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def analyze_sentiment(self, text):
        """
        Simple sentiment analysis using keyword matching
        Args:
            text: Text to analyze
        Returns:
            dict: Sentiment analysis result
        """
        try:
            if not text or not isinstance(text, str):
                return {'error': 'Invalid text provided'}
            
            text_lower = text.lower()
            
            # Simple keyword-based sentiment
            positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'awesome', 'perfect']
            negative_words = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing', 'useless']
            
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            total = positive_count + negative_count
            if total == 0:
                sentiment = 'neutral'
                score = 0.5
            else:
                score = positive_count / total
                if score > 0.6:
                    sentiment = 'positive'
                elif score < 0.4:
                    sentiment = 'negative'
                else:
                    sentiment = 'neutral'
            
            return {
                'success': True,
                'sentiment': sentiment,
                'score': round(score, 2),
                'positive_count': positive_count,
                'negative_count': negative_count,
                'text_length': len(text),
                'method': 'keyword_matching',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def summarize_text(self, text, max_sentences=3):
        """
        Simple text summarization
        Args:
            text: Text to summarize
            max_sentences: Number of sentences to include
        Returns:
            dict: Summary result
        """
        try:
            if not text or not isinstance(text, str):
                return {'error': 'Invalid text provided'}
            
            # Split into sentences
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if len(sentences) <= max_sentences:
                summary = text
            else:
                # Take first and last sentences, plus middle ones
                summary_sentences = sentences[:max_sentences]
                summary = '. '.join(summary_sentences) + '.'
            
            return {
                'success': True,
                'summary': summary,
                'original_length': len(text),
                'summary_length': len(summary),
                'total_sentences': len(sentences),
                'summary_sentences': min(max_sentences, len(sentences)),
                'method': 'extractive',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def analyze_code_quality(self, code):
        """
        Basic code quality analysis
        Args:
            code: Source code string
        Returns:
            dict: Code quality metrics
        """
        try:
            if not code or not isinstance(code, str):
                return {'error': 'Invalid code provided'}
            
            lines = code.split('\n')
            total_lines = len(lines)
            code_lines = len([l for l in lines if l.strip() and not l.strip().startswith('#')])
            comment_lines = len([l for l in lines if l.strip().startswith('#')])
            blank_lines = total_lines - code_lines - comment_lines
            
            # Count functions
            function_count = len(re.findall(r'\bdef\s+\w+\s*\(', code))
            class_count = len(re.findall(r'\bclass\s+\w+', code))
            
            # Calculate complexity (simple heuristic)
            complexity = code.count('if ') + code.count('for ') + code.count('while ') + function_count
            
            return {
                'success': True,
                'total_lines': total_lines,
                'code_lines': code_lines,
                'comment_lines': comment_lines,
                'blank_lines': blank_lines,
                'function_count': function_count,
                'class_count': class_count,
                'complexity_score': complexity,
                'comment_ratio': round(comment_lines / total_lines * 100, 1) if total_lines > 0 else 0,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def train_simple_model(self, data):
        """
        Placeholder for model training
        Args:
            data: Training data
        Returns:
            dict: Training result
        """
        try:
            return {
                'success': True,
                'message': 'Model training requires scikit-learn (not installed in lightweight mode)',
                'recommendation': 'Use external ML APIs like Hugging Face for model training',
                'data_received': len(data) if hasattr(data, '__len__') else 0,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def generate_jarvis_response(self, user_query: str) -> Dict:
        """
        Generate AI response using JARVIS Researcher + Groq LLM pipeline
        
        Pipeline:
        1. Call jarvis_researcher() to get verified 2026 web context
        2. Construct system prompt with context
        3. Send to Groq Llama-3-70B model
        4. Return AI response with source citations
        
        Args:
            user_query: User's question/query
            
        Returns:
            dict: {
                'success': bool,
                'response': str (AI's answer),
                'sources': list (source URLs),
                'context_length': int,
                'model': str,
                'error': str (if failed)
            }
        """
        try:
            # Step 1: Check if Groq is available
            if not self.groq_client:
                return {
                    'success': False,
                    'error': 'Groq API key not configured',
                    'response': 'JARVIS AI is currently unavailable. Please configure GROQ_API_KEY.',
                    'sources': []
                }
            
            print(f"🔍 JARVIS processing query: '{user_query}'")
            
            # Step 2: Get verified web context using JARVIS Researcher
            print("📡 Fetching verified 2026 web context...")
            research_results = jarvis_researcher(user_query, max_results=5)
            
            # Extract context and sources
            if research_results:
                context = "\n\n".join([
                    f"[Source {i+1}: {r['title']}]\n{r['content']}"
                    for i, r in enumerate(research_results)
                ])
                sources = [{'title': r['title'], 'url': r['url']} for r in research_results]
            else:
                context = ""
                sources = []
            
            print(f"✅ Retrieved {len(research_results)} verified sources ({len(context)} chars)")
            
            # Step 3: Construct System Prompt
            if context:
                system_prompt = f"""You are JARVIS, a helpful AI assistant developed for educational purposes.

Use the following verified 2026 web context to answer the user's question accurately:

{context}

Instructions:
- Provide a professional and concise answer based on the context
- Cite sources when making claims (e.g., "According to Source 1...")
- If the context doesn't fully answer the question, acknowledge what you know and what's missing
- Keep the tone helpful and educational
- Focus on information from 2026 when available"""
            else:
                system_prompt = """You are JARVIS, a helpful AI assistant.

The web research returned no verified 2026 data for this query. 

Instructions:
- Politely inform the user that you couldn't find fresh 2026 web data
- Offer to help with the question using your general knowledge
- Suggest the user try a more specific query or check back later
- Keep the tone professional and helpful"""
            
            # Step 4: Call Groq LLM
            print("🤖 Generating response with Groq Llama-3.3-70B...")
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                temperature=0.7,
                max_tokens=1024,
                top_p=0.9
            )
            
            response_text = completion.choices[0].message.content
            
            print(f"✅ Response generated ({len(response_text)} chars)")
            
            return {
                'success': True,
                'response': response_text,
                'sources': sources,
                'context_length': len(context),
                'verified_sources_count': len(research_results),
                'model': 'llama-3.3-70b-versatile',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            error_msg = f"Error generating JARVIS response: {str(e)}"
            print(f"❌ {error_msg}")
            
            return {
                'success': False,
                'error': error_msg,
                'response': 'I encountered an error while processing your request. Please try again.',
                'sources': [],
                'timestamp': datetime.now().isoformat()
            }


# ===== STANDALONE FUNCTIONS FOR EASY IMPORT =====
# These are wrappers around the MLService class for backward compatibility

_ml_service_instance = MLService()

def predict_model(context, query):
    """
    Standalone function: Predict relevance score between context and query
    
    Args:
        context (str): The document/context text
        query (str): The user query
    
    Returns:
        dict: Prediction result with confidence score
    """
    try:
        if not context or not query:
            return {
                'success': False,
                'error': 'Context and query are required',
                'confidence': 0.0
            }
        
        # Simple relevance heuristic based on keyword matching
        context_lower = str(context).lower()
        query_lower = str(query).lower()
        
        # Extract keywords from query
        query_words = set(re.findall(r'\w+', query_lower))
        query_words = {w for w in query_words if len(w) > 3}  # Filter short words
        
        if not query_words:
            return {
                'success': True,
                'confidence': 0.5,
                'method': 'default',
                'message': 'No significant keywords found'
            }
        
        # Count matches
        matches = sum(1 for word in query_words if word in context_lower)
        confidence = min(matches / len(query_words), 1.0)
        
        return {
            'success': True,
            'confidence': round(confidence, 3),
            'matches': matches,
            'total_keywords': len(query_words),
            'method': 'keyword_matching',
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'confidence': 0.0
        }

def analyze_image(image_data):
    """Standalone wrapper for image analysis"""
    return _ml_service_instance.analyze_image(image_data)

def sentiment_analysis(text):
    """Standalone wrapper for sentiment analysis"""
    return _ml_service_instance.analyze_sentiment(text)

def summarize_text(text, max_sentences=3):
    """Standalone wrapper for text summarization"""
    return _ml_service_instance.summarize_text(text, max_sentences)

def analyze_code_quality(code):
    """Standalone wrapper for code quality analysis"""
    return _ml_service_instance.analyze_code_quality(code)

def train_simple_model(data):
    """Standalone wrapper for model training"""
    return _ml_service_instance.train_simple_model(data)

def generate_jarvis_response(user_query: str) -> Dict:
    """Standalone wrapper for JARVIS response generation"""
    return _ml_service_instance.generate_jarvis_response(user_query)


# Export all functions
__all__ = [
    'MLService',
    'predict_model',
    'analyze_image',
    'sentiment_analysis',
    'summarize_text',
    'analyze_code_quality',
    'train_simple_model',
    'generate_jarvis_response'
]
