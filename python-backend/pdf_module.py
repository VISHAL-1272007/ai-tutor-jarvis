"""
PDF Module for JARVIS
Extracts text from PDF documents for analysis
"""

from pypdf import PdfReader
import os

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
