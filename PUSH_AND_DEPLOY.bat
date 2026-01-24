@echo off
echo ========================================
echo   PUSH TO GITHUB & DEPLOY TO FIREBASE
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "🚀 INTEGRATION COMPLETE: JARVIS Semantic Knowledge Base with Pinecone & Gemini. Ready for 30,000 students."
echo.

echo Step 4: Pushing to GitHub...
git push
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Git push failed. Trying 'git push origin main'...
    git push origin main
)
echo.

echo Step 5: Deploying to Firebase...
call DEPLOY_TO_FIREBASE.bat

echo.
pause
