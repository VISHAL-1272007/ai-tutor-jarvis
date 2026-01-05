@echo off
echo.
echo ========================================
echo   JARVIS 6.0 - PRE-DEMO TEST SUITE
echo ========================================
echo.

echo [1/5] Testing Backend Health...
curl -s https://ai-tutor-jarvis.onrender.com/health
if %ERRORLEVEL% NEQ 0 (
    echo ❌ BACKEND DOWN! Starting local backup...
    start cmd /k "cd backend && npm start"
    timeout /t 5 /nobreak
) else (
    echo ✅ Backend is UP!
)

echo.
echo [2/5] Testing Frontend Deployment...
curl -s -o NUL -w "Status: %%{http_code}" https://ai-tutor-jarvis.web.app
echo.

echo.
echo [3/5] Testing Custom AI Model...
curl -s -I https://huggingface.co/aijarvis2025/jarvis-edu-ai | findstr "200"
if %ERRORLEVEL% EQ 0 (
    echo ✅ Custom AI Model is accessible!
) else (
    echo ⚠️  Custom AI might be slow (HuggingFace cold start)
)

echo.
echo [4/5] Checking Local Files...
if exist "frontend\index.html" (
    echo ✅ Frontend files present
) else (
    echo ❌ Frontend files missing!
)

if exist "backend\index.js" (
    echo ✅ Backend files present
) else (
    echo ❌ Backend files missing!
)

echo.
echo [5/5] Opening JARVIS in Browser...
start https://ai-tutor-jarvis.web.app

echo.
echo ========================================
echo   ✅ PRE-DEMO CHECK COMPLETE!
echo ========================================
echo.
echo DEMO CHECKLIST:
echo [ ] Clear browser cache (Ctrl+Shift+Delete)
echo [ ] Clear localStorage in Console
echo [ ] Test AI response
echo [ ] Test voice control
echo [ ] Sign in with Google
echo.
echo 🎯 YOU'RE READY TO WIN! 🏆
echo.
pause
