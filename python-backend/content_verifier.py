"""
Content Verification & Filtering Module
Filters search results for relevance and intent matching
"""

import logging
from typing import List, Dict, Tuple
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ContentVerifier:
    """Verifies and filters content for relevance"""
    
    # Keywords for different regions/intents
    REGION_KEYWORDS = {
        'tamil_nadu': ['tamil nadu', 'tamilnadu', 'tn', 'tamil', 'madras', 'tni', 'tamil cinema'],
        'tamil': ['tamil', 'tamizh', 'tamil cinema', 'tamil language', 'tamil movies'],
        'news': ['news', 'today', 'breaking', 'latest', 'update', 'report'],
        'technology': ['tech', 'technology', 'software', 'ai', 'machine learning', 'python'],
        'education': ['education', 'school', 'college', 'university', 'course', 'learning']
    }
    
    NOISE_KEYWORDS = [
        'advertisement', 'ad', 'sponsored', 'promotion', 'cookie', 'privacy policy',
        'terms of service', 'subscribe', 'paywall'
    ]
    
    def __init__(self):
        logger.info("🔍 Content Verifier initialized")
    
    def calculate_relevance_score(self, text: str, query: str, intent: str = None) -> float:
        """
        Calculate relevance score (0.0 - 1.0)
        
        Args:
            text: Content text to verify
            query: Original query
            intent: Optional intent category
            
        Returns:
            Relevance score
        """
        text_lower = text.lower()
        query_lower = query.lower()
        
        score = 0.0
        max_score = 1.0
        
        # Check query keywords (0.3)
        query_words = query_lower.split()
        matching_keywords = sum(1 for word in query_words if len(word) > 3 and word in text_lower)
        if matching_keywords > 0:
            score += min(0.3, matching_keywords * 0.1)
        
        # Check intent keywords (0.3)
        if intent and intent in self.REGION_KEYWORDS:
            intent_keywords = self.REGION_KEYWORDS[intent]
            if any(keyword in text_lower for keyword in intent_keywords):
                score += 0.3
        
        # Penalize noise (0.2)
        noise_count = sum(1 for noise in self.NOISE_KEYWORDS if noise in text_lower)
        if noise_count == 0:
            score += 0.2
        else:
            score -= min(0.2, noise_count * 0.05)
        
        # Content length check (0.2)
        if len(text) > 200:  # Reasonable content length
            score += 0.2
        
        return max(0.0, min(max_score, score))
    
    def detect_intent(self, query: str) -> str:
        """
        Detect intent from query
        
        Returns: intent category
        """
        query_lower = query.lower()
        
        for intent, keywords in self.REGION_KEYWORDS.items():
            if any(keyword in query_lower for keyword in keywords):
                return intent
        
        return 'general'
    
    def verify_and_filter(self, 
                         search_results: List[Dict], 
                         query: str,
                         min_relevance: float = 0.3) -> Tuple[List[Dict], str]:
        """
        Filter search results by relevance
        
        Args:
            search_results: List of {title, url, snippet, content}
            query: Original query
            min_relevance: Minimum relevance score threshold
            
        Returns:
            (filtered_results, combined_context)
        """
        intent = self.detect_intent(query)
        logger.info(f"🎯 Detected intent: {intent}")
        
        verified = []
        context_parts = []
        
        for result in search_results:
            content = result.get('content', '')
            if not content:
                continue
            
            relevance = self.calculate_relevance_score(content, query, intent)
            logger.info(f"📊 {result['title'][:50]}: {relevance:.2f}")
            
            if relevance >= min_relevance:
                result['relevance_score'] = relevance
                verified.append(result)
                
                # Add to context
                context_parts.append(f"[Source: {result['title']}]\n{content}")
        
        # Combine context
        combined_context = "\n\n".join(context_parts)
        
        logger.info(f"✅ Verified {len(verified)} / {len(search_results)} results")
        
        return verified, combined_context
    
    def clean_context_for_groq(self, context: str, max_tokens: int = 2000) -> str:
        """
        Clean and optimize context for Groq API
        
        Args:
            context: Raw context string
            max_tokens: Maximum tokens (~4 chars per token)
            
        Returns:
            Cleaned context
        """
        # Remove extra whitespace
        context = re.sub(r'\s+', ' ', context)
        
        # Limit length
        max_chars = max_tokens * 4
        context = context[:max_chars]
        
        # Remove URLs
        context = re.sub(r'http\S+', '[link]', context)
        
        return context.strip()


# Global instance
_verifier = ContentVerifier()


def verify_search_results(search_results: List[Dict], 
                         query: str,
                         min_relevance: float = 0.3) -> Tuple[List[Dict], str]:
    """
    Public function to verify and filter search results
    """
    return _verifier.verify_and_filter(search_results, query, min_relevance)


def clean_for_groq(context: str, max_tokens: int = 2000) -> str:
    """
    Public function to clean context for Groq
    """
    return _verifier.clean_context_for_groq(context, max_tokens)
