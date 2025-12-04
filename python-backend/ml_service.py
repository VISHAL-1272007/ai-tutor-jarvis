"""
Machine Learning Service Module
Provides AI/ML functionality for JARVIS
"""

import numpy as np
from datetime import datetime
import re

# Try to import ML libraries (gracefully handle if not installed)
try:
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

def predict_model(features):
    """
    Simple prediction using a pre-trained model or heuristics
    Args:
        features: List of numerical features
    Returns:
        dict: Prediction result
    """
    try:
        # Simple heuristic prediction (replace with actual model)
        features_array = np.array(features)
        prediction = np.mean(features_array) > 0.5
        confidence = abs(np.mean(features_array) - 0.5) * 2
        
        return {
            'prediction': bool(prediction),
            'confidence': float(confidence),
            'features_count': len(features),
            'method': 'heuristic'
        }
    except Exception as e:
        return {'error': str(e)}

def analyze_image(image_file):
    """
    Analyze uploaded image
    Args:
        image_file: Flask file object
    Returns:
        dict: Image analysis result
    """
    try:
        # Basic image info (expand with OpenCV/PIL for real analysis)
        filename = image_file.filename
        file_size = len(image_file.read())
        image_file.seek(0)  # Reset file pointer
        
        # Determine image type
        extension = filename.split('.')[-1].lower()
        
        return {
            'filename': filename,
            'size_bytes': file_size,
            'size_kb': round(file_size / 1024, 2),
            'format': extension,
            'analysis': 'Basic image info',
            'notes': 'Install OpenCV/Pillow for advanced analysis'
        }
    except Exception as e:
        return {'error': str(e)}

def sentiment_analysis(text):
    """
    Analyze sentiment of text
    Args:
        text: Input text string
    Returns:
        dict: Sentiment analysis result
    """
    try:
        # Simple keyword-based sentiment (replace with NLP model)
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 
                         'fantastic', 'love', 'happy', 'best', 'awesome']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'hate', 
                         'worst', 'poor', 'disappointing', 'sad', 'angry']
        
        text_lower = text.lower()
        words = text_lower.split()
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        total = positive_count + negative_count
        if total == 0:
            sentiment = 'neutral'
            score = 0.5
        elif positive_count > negative_count:
            sentiment = 'positive'
            score = 0.5 + (positive_count / (total * 2))
        else:
            sentiment = 'negative'
            score = 0.5 - (negative_count / (total * 2))
        
        return {
            'sentiment': sentiment,
            'score': round(score, 3),
            'positive_words': positive_count,
            'negative_words': negative_count,
            'word_count': len(words),
            'method': 'keyword-based'
        }
    except Exception as e:
        return {'error': str(e)}

def summarize_text(text, max_length=150):
    """
    Summarize long text
    Args:
        text: Input text
        max_length: Maximum summary length
    Returns:
        str: Summarized text
    """
    try:
        # Simple extractive summarization
        sentences = text.split('.')
        
        if len(sentences) <= 3:
            return text
        
        # Take first and most important sentences
        summary_sentences = sentences[:2]
        
        # Add middle sentence if space allows
        if len(sentences) > 4:
            middle = sentences[len(sentences) // 2]
            summary_sentences.append(middle)
        
        summary = '. '.join(s.strip() for s in summary_sentences if s.strip())
        
        # Truncate if too long
        if len(summary) > max_length:
            summary = summary[:max_length] + '...'
        
        return summary
    except Exception as e:
        return f"Error: {str(e)}"

def analyze_code_quality(code, language='python'):
    """
    Analyze code quality metrics
    Args:
        code: Source code string
        language: Programming language
    Returns:
        dict: Code quality metrics
    """
    try:
        lines = code.split('\n')
        total_lines = len(lines)
        code_lines = len([line for line in lines if line.strip() and not line.strip().startswith('#')])
        comment_lines = len([line for line in lines if line.strip().startswith('#')])
        blank_lines = total_lines - code_lines - comment_lines
        
        # Calculate complexity (simplified)
        complexity_keywords = ['if', 'for', 'while', 'elif', 'else', 'try', 'except', 'with']
        complexity = sum(code.lower().count(keyword) for keyword in complexity_keywords)
        
        # Calculate quality score
        comment_ratio = comment_lines / max(code_lines, 1)
        complexity_per_line = complexity / max(code_lines, 1)
        
        quality_score = min(100, max(0, 
            70 + (comment_ratio * 20) - (complexity_per_line * 10)
        ))
        
        # Detect potential issues
        issues = []
        if comment_ratio < 0.1:
            issues.append("Low comment coverage")
        if complexity_per_line > 0.3:
            issues.append("High complexity detected")
        if any(len(line) > 100 for line in lines):
            issues.append("Long lines detected (>100 chars)")
        
        return {
            'quality_score': round(quality_score, 2),
            'total_lines': total_lines,
            'code_lines': code_lines,
            'comment_lines': comment_lines,
            'blank_lines': blank_lines,
            'complexity': complexity,
            'comment_ratio': round(comment_ratio, 3),
            'issues': issues,
            'language': language,
            'analysis_method': 'static'
        }
    except Exception as e:
        return {'error': str(e)}

def train_simple_model(X, y):
    """
    Train a simple machine learning model
    Args:
        X: Feature matrix (list of lists)
        y: Target labels (list)
    Returns:
        dict: Training results
    """
    try:
        if not SKLEARN_AVAILABLE:
            return {
                'error': 'scikit-learn not installed',
                'note': 'Run: pip install scikit-learn'
            }
        
        X_array = np.array(X)
        y_array = np.array(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_array, y_array, test_size=0.2, random_state=42
        )
        
        # Train model
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        
        # Evaluate
        train_accuracy = accuracy_score(y_train, model.predict(X_train))
        test_accuracy = accuracy_score(y_test, model.predict(X_test))
        
        return {
            'model_type': 'LogisticRegression',
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'train_accuracy': round(train_accuracy, 4),
            'test_accuracy': round(test_accuracy, 4),
            'features': X_array.shape[1] if len(X_array.shape) > 1 else 1,
            'status': 'trained',
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {'error': str(e)}

# Export functions
__all__ = [
    'predict_model',
    'analyze_image',
    'sentiment_analysis',
    'summarize_text',
    'analyze_code_quality',
    'train_simple_model'
]
