# Hugging Face Space - FREE AI API
# Uses HF Inference API - no model download needed!

FROM python:3.10-slim

WORKDIR /app

# Install minimal dependencies (no torch/transformers!)
RUN pip install --no-cache-dir \
    flask==3.0.0 \
    flask-cors==4.0.0 \
    requests==2.31.0

# Copy application
COPY app.py .

# Expose port (HuggingFace uses 7860)
EXPOSE 7860

# Run the API
CMD ["python", "app.py"]
