# 🐍 JARVIS Python Backend - Complete Guide

## 📋 Overview

The Python Flask backend provides AI/ML capabilities for JARVIS AI platform, handling:
- Machine Learning predictions
- Image processing and analysis
- Natural Language Processing (NLP)
- Code quality analysis
- Data science operations

---

## 🚀 Quick Start

### **1. Install Python** (if not installed)
Download from: https://www.python.org/downloads/
- Minimum version: Python 3.8+
- Recommended: Python 3.11+

### **2. Start Python Backend**
```powershell
.\START_PYTHON_BACKEND.bat
```

This script will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Start Flask server on port 5002

---

## 📦 Installation (Manual)

```powershell
# Navigate to python-backend folder
cd python-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

---

## 🔌 API Endpoints

### **Health Check**
```bash
GET http://localhost:5002/
GET http://localhost:5002/health
```

### **ML Prediction**
```bash
POST http://localhost:5002/predict
Content-Type: application/json

{
  "features": [1.5, 2.3, 0.8, 4.1, 3.2]
}
```

### **Image Analysis**
```bash
POST http://localhost:5002/analyze-image
Content-Type: multipart/form-data

image: <file>
```

### **Sentiment Analysis**
```bash
POST http://localhost:5002/sentiment
Content-Type: application/json

{
  "text": "I love this product! It's amazing!"
}
```

### **Text Summarization**
```bash
POST http://localhost:5002/summarize
Content-Type: application/json

{
  "text": "Long text to summarize...",
  "max_length": 150
}
```

### **Code Quality Analysis**
```bash
POST http://localhost:5002/analyze-code
Content-Type: application/json

{
  "code": "def hello():\n    print('Hello')",
  "language": "python"
}
```

### **Model Training**
```bash
POST http://localhost:5002/train-model
Content-Type: application/json

{
  "X": [[1,2], [3,4], [5,6]],
  "y": [0, 1, 1]
}
```

---

## 🔐 Environment Variables

Create `.env` file in `python-backend/` folder:

```env
PORT=5002
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Optional: API Keys for external services
OPENAI_API_KEY=your-key
HUGGINGFACE_TOKEN=your-token
```

---

## 📁 Project Structure

```
python-backend/
├── app.py                 # Main Flask application
├── ml_service.py          # ML functions and models
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore file
├── venv/                 # Virtual environment (auto-created)
└── python-backend.log    # Application logs
```

---

## 🧪 Testing Endpoints

### **Test with PowerShell:**
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5002/" -Method GET

# Prediction
$body = @{
    features = @(1.5, 2.3, 0.8, 4.1, 3.2)
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5002/predict" -Method POST -Body $body -ContentType "application/json"

# Sentiment analysis
$body = @{
    text = "I love this amazing product!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5002/sentiment" -Method POST -Body $body -ContentType "application/json"
```

### **Test with curl:**
```bash
# Health check
curl http://localhost:5002/

# Prediction
curl -X POST http://localhost:5002/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1.5, 2.3, 0.8, 4.1, 3.2]}'

# Sentiment
curl -X POST http://localhost:5002/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this!"}'
```

---

## 🔧 Troubleshooting

### **Problem: Python not found**
**Solution:**
```powershell
# Install Python from python.org
# Add Python to PATH during installation
# Or add manually:
$env:Path += ";C:\Python311;C:\Python311\Scripts"
```

### **Problem: pip install fails**
**Solution:**
```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v
```

### **Problem: Port 5002 already in use**
**Solution:**
```powershell
# Change port in app.py or use environment variable
$env:PORT = "5003"
python app.py
```

### **Problem: Import errors**
**Solution:**
```powershell
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 💾 Backup System

### **Create Backup**
```powershell
.\BACKUP_SYSTEM.bat
```

This backs up:
- ✅ Python backend code
- ✅ Node.js backend code
- ✅ Frontend files
- ✅ Configuration files

### **Restore Backup**
```powershell
.\RESTORE_BACKUP.bat
```

### **Manual Backup**
```powershell
# Backup Python backend
xcopy python-backend backups\manual\python-backend\ /E /I /Y
```

---

## 🚀 Deployment

### **Deploy to Render.com**

1. **Create new Web Service**
   - Connect GitHub repo
   - Select `python-backend` as root directory

2. **Configure Build**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

3. **Environment Variables**
   ```
   PORT=10000  (Render auto-assigns)
   FLASK_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5 minutes)

### **Deploy to Railway**

1. **Connect Repository**
2. **Set Root Directory:** `python-backend`
3. **Railway Auto-detects:** Python + Flask
4. **Deploy automatically**

---

## 📊 Performance

| Endpoint | Avg Response Time | Notes |
|----------|------------------|-------|
| /health | ~10ms | Instant |
| /predict | ~50ms | Basic ML |
| /sentiment | ~30ms | Text analysis |
| /summarize | ~100ms | Text processing |
| /analyze-code | ~80ms | Static analysis |
| /train-model | ~500ms+ | Depends on data size |

---

## 🔮 Future Enhancements

- [ ] Add TensorFlow/PyTorch models
- [ ] Implement image recognition (OpenCV)
- [ ] Add advanced NLP (spaCy, Transformers)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Caching layer (Redis)
- [ ] WebSocket support for streaming
- [ ] Model versioning and A/B testing
- [ ] Prometheus metrics
- [ ] Docker containerization

---

## 📞 Support

**Issues?**
1. Check logs: `python-backend/python-backend.log`
2. Test endpoints with curl/Postman
3. Verify dependencies: `pip list`
4. Check Python version: `python --version`

**Need Help?**
- GitHub Issues: https://github.com/VISHAL-1272007/ai-tutor-jarvis/issues
- Developer: VISHAL

---

## ✅ Verification Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Flask server starts successfully
- [ ] Health endpoint returns 200
- [ ] ML endpoints respond correctly
- [ ] Logs are being written
- [ ] No error messages in console

---

**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Last Updated:** December 4, 2025
