@echo off
echo ========================================
echo   JARVIS AI - Firebase Deployment
echo ========================================
echo.
echo This will deploy your JARVIS AI frontend to Firebase Hosting
echo.
echo Your site will be live at:
echo   https://vishai-f6197.web.app
echo   https://vishai-f6197.firebaseapp.com
echo.
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking Firebase CLI...
firebase --version
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Firebase CLI not found!
    echo Please install it with: npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Firebase Hosting...
echo.
firebase deploy --only hosting

if %ERRORLEVEL% EQ 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Your JARVIS AI is now live at:
    echo   🌐 https://vishai-f6197.web.app
    echo   🌐 https://vishai-f6197.firebaseapp.com
    echo.
    echo Next steps:
    echo 1. Open the URL above in your browser
    echo 2. Test all pages and functionality
    echo 3. Update backend CORS (see DEPLOY_NOW.md)
    echo.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ❌ DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Please check the error above.
    echo.
    echo Common fixes:
    echo 1. Run: firebase login
    echo 2. Make sure you're logged in with the correct account
    echo 3. Check DEPLOY_NOW.md for troubleshooting
    echo.
    echo ========================================
)

echo.
pause
