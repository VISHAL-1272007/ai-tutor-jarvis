# JARVIS AI - HuggingFace Space Deployment
# Zero-Failure Resilient Agent with Web Search Fallback

FROM python:3.10-slim

WORKDIR /app

# Install dependencies including ddgs for web search
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY jarvis_standalone.py .

# Expose port (HuggingFace uses 7860)
EXPOSE 7860

# Run the JARVIS API
CMD ["python", "app.py"]
