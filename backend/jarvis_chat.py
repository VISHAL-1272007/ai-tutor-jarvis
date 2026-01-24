import os
from google import genai
from pinecone import Pinecone
from dotenv import load_dotenv
from pathlib import Path

# 1. Path setup & .env load
base_path = Path(__file__).resolve().parent
load_dotenv(dotenv_path=base_path / ".env")

# 2. Initialize Clients
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index(os.getenv('PINECONE_INDEX_NAME', 'jarvis-knowledge'))

print("✅ API Keys & Pinecone connected successfully.")

def get_context(query):
    """Pinecone memory search"""
    # Embedding generation (Latest way)
    res = client.models.embed_content(
        model='text-embedding-004',
        contents=query
    )
    query_emb = res.embeddings[0].values
    
    # Pinecone search
    results = index.query(vector=query_emb, top_k=3, include_metadata=True)
    
    context_text = ""
    for match in results['matches']:
        meta = match['metadata']
        context_text += f"\n- {meta.get('title', 'No Title')} (Source: {meta.get('source', 'Unknown')})"
    
    return context_text

def jarvis_talk():
    print("\n🤖 JARVIS: Online. Inniku tech news pathi kelunga nanba!")
    print("-" * 60)

    while True:
        user_input = input("\n👤 YOU: ")
        
        if user_input.lower() in ['exit', 'quit', 'bye']:
            print("🤖 JARVIS: Bye nanba! See you soon.")
            break

        try:
            # 1. Memory retrieval
            context = get_context(user_input)
            
            # 2. Prompt for Jarvis
            prompt = f"""
            You are JARVIS, a helpful AI assistant.
            Use this context: {context}
            Question: {user_input}
            Answer in a friendly way (Tamil-English mix if possible).
            """

            # 3. Generate response (Using 2.0 Flash - the most supported model now)
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            print(f"\n🤖 JARVIS: {response.text}")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    jarvis_talk()