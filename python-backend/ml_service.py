"""
Machine Learning Service Module for JARVIS
Lightweight version without heavy ML dependencies
"""

import re
from datetime import datetime
import json

class MLService:
    """Lightweight ML/AI Service for JARVIS"""
    
    def __init__(self):
        """Initialize the ML service"""
        print("🤖 ML Service initialized (lightweight mode)")
    
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
