#!/usr/bin/env python3
"""
JARVIS Knowledge Graph - Pinecone + Gemini Embeddings
Fetches today's news, generates embeddings using Gemini, and stores in Pinecone
"""

import os
import logging
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
import json

# Third-party imports
try:
    import google.generativeai as genai
    from pinecone import Pinecone, ServerlessSpec
    import requests
except ImportError as e:
    print(f"⚠️ Missing dependency: {e}")
    print("Install with: pip install google-generativeai pinecone-client python-dotenv requests")
    exit(1)

# ===== SETUP LOGGING =====
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== LOAD ENVIRONMENT VARIABLES =====
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'jarvis-knowledge')

# ===== VALIDATION =====
if not all([GEMINI_API_KEY, PINECONE_API_KEY, NEWS_API_KEY]):
    logger.error("❌ Missing API keys in .env file")
    logger.error(f"  GEMINI_API_KEY: {'✓' if GEMINI_API_KEY else '✗'}")
    logger.error(f"  PINECONE_API_KEY: {'✓' if PINECONE_API_KEY else '✗'}")
    logger.error(f"  NEWS_API_KEY: {'✓' if NEWS_API_KEY else '✗'}")
    exit(1)

# ===== INITIALIZE APIS =====
genai.configure(api_key=GEMINI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)


class NewsEmbeddingsPipeline:
    """
    Pipeline to fetch news, generate embeddings, and store in Pinecone
    """
    
    def __init__(self):
        """Initialize the pipeline"""
        self.index = None
        self.embedding_model = "models/text-embedding-004"
        self.news_api_url = "https://newsapi.org/v2/top-headlines"
        logger.info("✅ NewsEmbeddingsPipeline initialized")
    
    def connect_pinecone(self) -> bool:
        """
        Connect to Pinecone index, create if not exists
        
        Returns:
            bool: True if successful
        """
        try:
            logger.info(f"🔌 Connecting to Pinecone index: {PINECONE_INDEX_NAME}")
            
            # Check if index exists
            indexes = pc.list_indexes()
            index_names = [idx.name for idx in indexes]
            
            if PINECONE_INDEX_NAME not in index_names:
                logger.info(f"📦 Creating new Pinecone index: {PINECONE_INDEX_NAME}")
                pc.create_index(
                    name=PINECONE_INDEX_NAME,
                    dimension=768,  # Gemini text-embedding-004 dimension
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                logger.info("✅ Index created successfully")
            else:
                logger.info("✅ Index already exists")
            
            # Connect to index
            self.index = pc.Index(PINECONE_INDEX_NAME)
            logger.info("✅ Connected to Pinecone index")
            return True
            
        except Exception as e:
            logger.error(f"❌ Pinecone connection failed: {e}")
            return False
    
    def fetch_news(self, country: str = "us", category: str = "general") -> List[Dict[str, Any]]:
        """
        Fetch today's top news from NewsAPI
        
        Args:
            country: Country code (default: 'us')
            category: News category (default: 'general')
        
        Returns:
            List of news articles
        """
        try:
            logger.info(f"📰 Fetching top news for {country}/{category}...")
            
            params = {
                'country': country,
                'category': category,
                'apiKey': NEWS_API_KEY,
                'sortBy': 'publishedAt',
                'pageSize': 20
            }
            
            response = requests.get(self.news_api_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'ok':
                logger.error(f"❌ NewsAPI error: {data.get('message', 'Unknown error')}")
                return []
            
            articles = data.get('articles', [])
            logger.info(f"✅ Fetched {len(articles)} articles")
            
            return articles
            
        except requests.RequestException as e:
            logger.error(f"❌ Failed to fetch news: {e}")
            return []
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings using Gemini in batch for speed.
        """
        try:  # <--- Indentation sariyaa function-kulla irukkanum
            if not texts:
                return []

            logger.info(f"🧠 Batch generating {len(texts)} embeddings...")
            
            # Gemini Batch API call
            response = genai.embed_content(
                model=self.embedding_model,
                content=texts,
                task_type="RETRIEVAL_DOCUMENT"
            )
            
            return response['embedding']
            
        except Exception as e:
            logger.error(f"❌ Batch embedding failed: {e}")
            return []
    
    def store_in_pinecone(self, articles: List[Dict[str, Any]], embeddings: List[List[float]]) -> bool:
        try:
            if not self.index: return False
            
            logger.info(f"💾 Storing {len(articles)} articles in Pinecone...")
            vectors = []
            
            for i, (article, embedding) in enumerate(zip(articles, embeddings)):
                vector_id = f"news-{datetime.now().strftime('%Y%m%d')}-{i}"
                
                # Metadata (handling empty descriptions)
                metadata = {
                    'title': article.get('title', '')[:100],
                    'source': article.get('source', {}).get('name', 'Unknown'),
                    'url': article.get('url', ''),
                    'description': (article.get('description') or '')[:200],
                    'publishedAt': article.get('publishedAt', ''),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Dictionary format is safer for latest Pinecone
                vectors.append({
                    "id": vector_id, 
                    "values": embedding, 
                    "metadata": metadata
                })
            
            # Upsert call
            self.index.upsert(vectors=vectors)
            logger.info(f"✅ Successfully stored {len(vectors)} vectors in Pinecone")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store in Pinecone: {e}")
            return False 
    def search_knowledge(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search the knowledge base using semantic similarity
        
        Args:
            query: Search query
            top_k: Number of results to return
        
        Returns:
            List of relevant articles
        """
        try:
            if not self.index:
                logger.error("❌ Pinecone index not connected")
                return []
            
            logger.info(f"🔍 Searching knowledge base for: '{query}'")
            
            # Generate query embedding
            query_embedding = genai.embed_content(
                model=self.embedding_model,
                content=query,
                task_type="RETRIEVAL_QUERY"
            )['embedding']
            
            # Search Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )
            
            logger.info(f"✅ Found {len(results['matches'])} relevant articles")
            
            return results['matches']
            
        except Exception as e:
            logger.error(f"❌ Search failed: {e}")
            return []
    
    def run_pipeline(self) -> bool:
        """
        Run the complete pipeline: fetch news → embed → store
        
        Returns:
            bool: True if successful
        """
        logger.info("🚀 Starting News Embeddings Pipeline...")
        logger.info("=" * 60)
        
        # Step 1: Connect to Pinecone
        if not self.connect_pinecone():
            logger.error("❌ Pipeline failed at Pinecone connection")
            return False
        
        # Step 2: Fetch news
        articles = self.fetch_news(country='us', category='general')
        if not articles:
            logger.error("❌ Pipeline failed: No articles fetched")
            return False
        
        # Step 3: Prepare texts for embedding
        texts = [
            f"{article.get('title', '')} {article.get('description', '')}"
            for article in articles
        ]
        
        # Step 4: Generate embeddings
        embeddings = self.generate_embeddings(texts)
        if not embeddings or len(embeddings) != len(articles):
            logger.error("❌ Pipeline failed at embedding generation")
            return False
        
        # Step 5: Store in Pinecone
        if not self.store_in_pinecone(articles, embeddings):
            logger.error("❌ Pipeline failed at storage")
            return False
        
        logger.info("=" * 60)
        logger.info("✅ Pipeline completed successfully!")
        
        # Demo: Search the knowledge base
        logger.info("\n📋 Demo: Searching knowledge base...")
        demo_queries = [
            "latest AI developments",
            "tech news today",
            "breaking news"
        ]
        
        for query in demo_queries:
            results = self.search_knowledge(query, top_k=3)
            if results:
                logger.info(f"\n🔍 Query: '{query}'")
                for i, match in enumerate(results, 1):
                    metadata = match.get('metadata', {})
                    logger.info(f"  {i}. {metadata.get('title', 'N/A')}")
                    logger.info(f"     Source: {metadata.get('source', 'N/A')}")
                    logger.info(f"     Score: {match.get('score', 0):.3f}")
        
        return True


def main():
    """Main entry point"""
    try:
        pipeline = NewsEmbeddingsPipeline()
        success = pipeline.run_pipeline()
        
        if success:
            logger.info("\n🎉 All systems operational!")
            logger.info("📍 Knowledge base ready for semantic searches")
            logger.info(f"📦 Index: {PINECONE_INDEX_NAME}")
            logger.info("✅ Status: PRODUCTION READY")
            exit(0)
        else:
            logger.error("\n❌ Pipeline failed")
            exit(1)
            
    except KeyboardInterrupt:
        logger.info("\n⚠️ Pipeline interrupted by user")
        exit(0)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}", exc_info=True)
        exit(1)


if __name__ == "__main__":
    main()
