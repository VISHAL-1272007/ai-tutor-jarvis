@echo off
echo ========================================
echo   JARVIS AI - Local Development Server
echo ========================================
echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo Pages available:
echo   - http://localhost:8000/index.html
echo   - http://localhost:8000/courses.html
echo   - http://localhost:8000/playground.html
echo   - http://localhost:8000/dashboard.html
echo   - http://localhost:8000/ai-tools.html
echo   - http://localhost:8000/project-generator.html
echo.
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8000
