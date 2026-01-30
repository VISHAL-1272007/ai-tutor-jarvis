"""
PDF Module for JARVIS
Extracts text from PDF documents and supports FAISS-based retrieval.
"""

import os
from pypdf import PdfReader

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

def extract_text_from_pdf(pdf_path):
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text (limited to 10k characters) or error message
    """
    try:
        if not os.path.exists(pdf_path):
            return "❌ Error: Boss, that PDF file path doesn't exist."
            
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        
        # Limit text to prevent overwhelming the brain (Light RAG approach)
        return text[:10000]  # First 10k characters
        
    except Exception as e:
        return f"❌ PDF Error: Boss, couldn't read that file: {str(e)}"


def process_pdf_with_faiss(pdf_path):
    """
    Load a PDF, split into chunks, and create a local FAISS index.

    Returns:
        FAISS: Vector store for similarity search
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError("❌ Error: Boss, that PDF file path doesn't exist.")

    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
    )
    docs = text_splitter.split_documents(pages)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_db = FAISS.from_documents(docs, embeddings)
    return vector_db


def ask_jarvis_pdf(vector_db, query):
    """
    Retrieve top relevant chunks from the FAISS index.

    Returns:
        str: Combined context from the top matches
    """
    docs = vector_db.similarity_search(query, k=3)
    context = "\n".join([doc.page_content for doc in docs])
    return context
