@echo off
echo ================================
echo   FIREBASE DEPLOYMENT SCRIPT
echo ================================
echo.
echo Project: vishai-f6197
echo Target: Frontend only
echo.
echo Starting deployment...
echo.

cd /d "%~dp0"

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Firebase CLI not found!
    echo Please install: npm install -g firebase-tools
    pause
    exit /b 1
)

echo ✅ Firebase CLI found
echo.
echo 📦 Deploying frontend...
echo.

firebase deploy --only hosting

echo.
if %errorlevel% equ 0 (
    echo ================================
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo ================================
    echo.
    echo Your app is live at:
    echo https://vishai-f6197.web.app
    echo https://vishai-f6197.firebaseapp.com
    echo.
) else (
    echo ================================
    echo ❌ DEPLOYMENT FAILED
    echo ================================
    echo.
    echo Please check the error above
    echo.
)

pause
