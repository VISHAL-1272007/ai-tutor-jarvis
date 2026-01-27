#!/bin/bash
# JARVIS Integration Verification Script
# Run this to verify all components are in place

echo "🤖 JARVIS Integration Verification"
echo "=================================="
echo ""

# Check Python files
echo "[1/6] Checking Python Backend Files..."
if [ -f "python-backend/app.py" ]; then
    echo "✅ python-backend/app.py"
else
    echo "❌ python-backend/app.py"
fi

if [ -f "python-backend/jarvis_researcher.py" ]; then
    echo "✅ python-backend/jarvis_researcher.py"
else
    echo "❌ python-backend/jarvis_researcher.py"
fi

if [ -f "python-backend/ml_service.py" ]; then
    echo "✅ python-backend/ml_service.py"
else
    echo "❌ python-backend/ml_service.py"
fi

if [ -f "python-backend/.env" ]; then
    echo "✅ python-backend/.env"
else
    echo "❌ python-backend/.env"
fi

# Check Node.js files
echo ""
echo "[2/6] Checking Node.js Backend Files..."
if [ -f "backend/index.js" ]; then
    echo "✅ backend/index.js"
else
    echo "❌ backend/index.js"
fi

if [ -f "backend/jarvis-proxy.js" ]; then
    echo "✅ backend/jarvis-proxy.js (NEW)"
else
    echo "❌ backend/jarvis-proxy.js (NEW)"
fi

if [ -f "backend/.env" ]; then
    echo "✅ backend/.env"
else
    echo "❌ backend/.env"
fi

# Check React files
echo ""
echo "[3/6] Checking React Frontend Files..."
if [ -f "frontend/jarvis-chat.jsx" ]; then
    echo "✅ frontend/jarvis-chat.jsx"
else
    echo "❌ frontend/jarvis-chat.jsx"
fi

if [ -f "frontend/jarvis-chat.css" ]; then
    echo "✅ frontend/jarvis-chat.css"
else
    echo "❌ frontend/jarvis-chat.css"
fi

# Check documentation
echo ""
echo "[4/6] Checking Documentation Files..."
if [ -f "JARVIS_FULL_INTEGRATION.md" ]; then
    echo "✅ JARVIS_FULL_INTEGRATION.md"
else
    echo "❌ JARVIS_FULL_INTEGRATION.md"
fi

if [ -f "JARVIS_QUICK_START.md" ]; then
    echo "✅ JARVIS_QUICK_START.md"
else
    echo "❌ JARVIS_QUICK_START.md"
fi

if [ -f "INTEGRATION_COMPLETE.md" ]; then
    echo "✅ INTEGRATION_COMPLETE.md"
else
    echo "❌ INTEGRATION_COMPLETE.md"
fi

# Check jarvis-proxy integration
echo ""
echo "[5/6] Checking Integration Points..."
if grep -q "setupJarvisRoutes" backend/index.js; then
    echo "✅ backend/index.js has jarvis-proxy routes"
else
    echo "❌ backend/index.js missing jarvis-proxy routes"
fi

if grep -q "http://localhost:5000/api/jarvis/ask" frontend/jarvis-chat.jsx; then
    echo "✅ frontend/jarvis-chat.jsx uses Node.js proxy"
else
    echo "❌ frontend/jarvis-chat.jsx not configured for proxy"
fi

# Check environment configuration
echo ""
echo "[6/6] Checking Environment Configuration..."
if [ -f "backend/.env" ]; then
    if grep -q "PYTHON_BACKEND_URL" backend/.env; then
        echo "✅ backend/.env has PYTHON_BACKEND_URL"
    else
        echo "❌ backend/.env missing PYTHON_BACKEND_URL"
    fi
fi

if [ -f "python-backend/.env" ]; then
    if grep -q "GROQ_API_KEY" python-backend/.env; then
        echo "✅ python-backend/.env has GROQ_API_KEY"
    else
        echo "❌ python-backend/.env missing GROQ_API_KEY"
    fi
fi

echo ""
echo "=================================="
echo "✅ Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Terminal 1: cd python-backend && python app.py"
echo "2. Terminal 2: cd backend && node index.js"
echo "3. Terminal 3: cd frontend && npm run dev"
echo "4. Browser: http://localhost:5173"
echo ""
