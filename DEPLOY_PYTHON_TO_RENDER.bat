@echo off
title Deploy Python Backend to Render
color 0B

echo ========================================
echo   JARVIS Python Backend - Render Deploy
echo ========================================
echo.

echo Step-by-Step Deployment Guide:
echo.

echo [1] PREPARE FILES
echo    ✓ Procfile created
echo    ✓ runtime.txt created
echo    ✓ render.yaml created
echo    ✓ requirements.txt ready
echo.

echo [2] COMMIT TO GITHUB
echo    Running: git add python-backend/
git add python-backend/
git commit -m "Add Python backend deployment config for Render"
git push origin main
echo    ✓ Files pushed to GitHub
echo.

echo [3] DEPLOY TO RENDER
echo.
echo    Now open your browser and follow these steps:
echo.
echo    1. Go to: https://dashboard.render.com/
echo    2. Click "New +" button
echo    3. Select "Web Service"
echo    4. Connect your GitHub account (if not connected)
echo    5. Select repository: VISHAL-1272007/ai-tutor-jarvis
echo    6. Click "Connect"
echo.
echo    Configuration:
echo    ├─ Name: jarvis-python-ml-service
echo    ├─ Region: Oregon (US West)
echo    ├─ Branch: main
echo    ├─ Root Directory: python-backend
echo    ├─ Environment: Python 3
echo    ├─ Build Command: pip install -r requirements.txt
echo    ├─ Start Command: gunicorn app:app
echo    └─ Plan: Free
echo.
echo    7. Click "Create Web Service"
echo    8. Wait 5-10 minutes for deployment
echo    9. Copy the service URL (e.g., https://jarvis-python-ml-service.onrender.com)
echo.

echo [4] TEST DEPLOYMENT
echo    Once deployed, test with:
echo    curl https://your-service-url.onrender.com/health
echo.

echo ========================================
echo   Opening Render Dashboard...
echo ========================================
echo.

start https://dashboard.render.com/

echo.
echo Press any key to continue after deployment...
pause >nul
