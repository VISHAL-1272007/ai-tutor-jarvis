# 🚀 Deploy JARVIS to HuggingFace Spaces

## Quick Deploy (5 Minutes)

### Step 1: Go to Your Space

Visit: https://huggingface.co/spaces/jarvis-core-backend/VISHAI

(If space doesn't exist, create it at https://huggingface.co/new-space)

### Step 2: Upload These Files

From the `/huggingface-api/` folder, upload:

1. **app.py** - Main Flask application with JARVIS
2. **jarvis_standalone.py** - JARVIS Resilient Agent
3. **requirements.txt** - Dependencies (Flask, CORS, ddgs)
4. **Dockerfile** - Container configuration

### Step 3: Configure Space Settings

- **SDK:** Docker
- **Hardware:** CPU basic (free) or T4 GPU (also free)
- **Visibility:** Public or Private

### Step 4: Wait for Build

HuggingFace will automatically:
1. Build the Docker container
2. Install dependencies
3. Start the Flask app
4. Expose on port 7860

This takes 2-5 minutes.

### Step 5: Test the Deployment

Once running, test these endpoints:

**Health Check:**
```bash
curl https://jarvis-core-backend-vishai.hf.space/health
```

**Ask JARVIS:**
```bash
curl -X POST https://jarvis-core-backend-vishai.hf.space/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello JARVIS"}'
```

**Expected Response:**
```json
{
  "success": true,
  "answer": "Hello! I'm J.A.R.V.I.S (Just A Rather Very Intelligent System). How can I assist you today?",
  "source": "internal_llm",
  "used_search": false,
  "confidence": 0.9,
  "resources": []
}
```

## Alternative: Git Push Method

```bash
# Clone your space
git clone https://huggingface.co/spaces/jarvis-core-backend/VISHAI
cd VISHAI

# Copy files
cp ../ai-tutor/huggingface-api/* .

# Push to HuggingFace
git add .
git commit -m "deploy: JARVIS Resilient Agent v4.0"
git push
```

## Troubleshooting

### Space shows "Building..."
- Wait 2-5 minutes for first build
- Check logs tab for any errors

### Import Error for jarvis_standalone
- Ensure `jarvis_standalone.py` is uploaded
- Check that it's in the same directory as `app.py`

### DDGS Search Fails
- This is expected and handled by zero-failure logic
- JARVIS will use internal knowledge as fallback

### Port Issues
- HuggingFace uses port 7860 by default
- This is configured in `app.py`

## Files Reference

Current files in `/huggingface-api/`:
- ✅ app.py (19KB) - Updated with JARVIS integration
- ✅ jarvis_standalone.py (15KB) - Core agent
- ✅ requirements.txt (4 lines) - Flask, CORS, requests, ddgs
- ✅ Dockerfile (if present)

## After Deployment

Once deployed successfully:
1. Frontend will automatically connect (already configured)
2. Visit: https://vishai-f6197.web.app
3. Test JARVIS with: "Hello JARVIS"

The error should be resolved!
