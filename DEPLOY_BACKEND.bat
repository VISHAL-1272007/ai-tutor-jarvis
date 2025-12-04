@echo off
echo ================================
echo   BACKEND DEPLOYMENT (Render)
echo ================================
echo.
echo Service: ai-tutor-jarvis
echo Platform: Render.com
echo.

cd /d "%~dp0"

echo Checking git status...
git status

echo.
echo ================================
echo   DEPLOYMENT STEPS:
echo ================================
echo.
echo 1. Commit your changes (if any)
echo 2. Push to main branch
echo 3. Render will auto-deploy
echo.
echo Do you want to commit and push now? (Render will auto-deploy)
echo.
set /p DEPLOY=Continue? (Y/N): 

if /i "%DEPLOY%"=="Y" (
    echo.
    echo 📝 Adding changes...
    git add .
    
    echo.
    set /p COMMIT_MSG=Enter commit message: 
    
    echo.
    echo 💾 Committing...
    git commit -m "%COMMIT_MSG%"
    
    echo.
    echo 🚀 Pushing to remote...
    git push origin main
    
    echo.
    if %errorlevel% equ 0 (
        echo ================================
        echo ✅ PUSH SUCCESSFUL!
        echo ================================
        echo.
        echo Render will now auto-deploy your backend.
        echo.
        echo Check deployment status at:
        echo https://dashboard.render.com
        echo.
        echo Your backend will be live at:
        echo https://ai-tutor-jarvis.onrender.com
        echo.
    ) else (
        echo ================================
        echo ❌ PUSH FAILED
        echo ================================
        echo Please check the error above
    )
) else (
    echo.
    echo Deployment cancelled.
    echo.
    echo To deploy manually:
    echo 1. Go to: https://dashboard.render.com
    echo 2. Select: ai-tutor-jarvis
    echo 3. Click: Manual Deploy
)

echo.
pause
