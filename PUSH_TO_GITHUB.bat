@echo off
echo ========================================
echo   PUSH TO GITHUB
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
git commit -m "Update courses-pro.css with yellow color scheme"
echo.

echo Step 4: Pushing to GitHub...
git push
echo.

if %ERRORLEVEL% EQ 0 (
    echo ========================================
    echo   ✅ PUSH SUCCESSFUL!
    echo ========================================
) else (
    echo ========================================
    echo   ❌ PUSH FAILED
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Make sure you're logged in to GitHub
    echo 2. Try: git push origin main
    echo 3. Or try: git push origin master
    echo.
)

echo.
pause
