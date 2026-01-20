@echo off
REM JARVIS AI Backend - Quick Start (Windows)
REM This batch file sets up and starts the Gemini backend

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     🤖 JARVIS AI BACKEND - QUICK START (Windows) 🤖      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo    Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found
    echo.
    echo Please create .env file with:
    echo   GEMINI_API_KEY=your_key_here
    echo   PORT=3000
    echo.
    echo Get your API key from: https://makersuite.google.com/app/apikey
    echo.
    set /p api_key="Enter your Gemini API Key: "
    
    if "%api_key%"=="" (
        echo ❌ API key required!
        pause
        exit /b 1
    )
    
    (
        echo GEMINI_API_KEY=%api_key%
        echo PORT=3000
    ) > .env
    echo ✅ .env file created
    echo.
)

REM Install dependencies
echo 📦 Installing dependencies...
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting JARVIS AI Backend...
echo.

REM Start the server
node server-gemini.js
pause
