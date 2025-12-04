@echo off
title JARVIS Python Backend
color 0A

echo ========================================
echo   JARVIS AI - Python Backend Startup
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo ✓ Python found
python --version
echo.

:: Navigate to python-backend directory
cd python-backend

:: Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
    echo.
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo ✓ Virtual environment activated
echo.

:: Install/Update dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet
echo ✓ Dependencies installed
echo.

:: Start Flask server
echo ========================================
echo   Starting Python Flask Backend
echo   Port: 5002
echo   Press Ctrl+C to stop
echo ========================================
echo.

python app.py

pause
