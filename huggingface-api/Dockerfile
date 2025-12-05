# Hugging Face Space - FREE AI API
# This runs completely free on Hugging Face infrastructure

FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    flask==3.0.0 \
    flask-cors==4.0.0 \
    transformers==4.36.0 \
    torch==2.1.0 \
    accelerate==0.25.0 \
# Copy application
COPY app.py .

# Expose port (HuggingFace uses 7860)
EXPOSE 7860

# Run the API
CMD ["python", "app.py"]
