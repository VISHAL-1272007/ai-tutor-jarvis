# Quick Start Script for Node.js Backend with Knowledge Fusion
# Navigate to backend directory, install dependencies, and start server

Write-Host "========================================"
Write-Host "JARVIS Node.js Backend - Quick Start"
Write-Host "========================================" -ForegroundColor Cyan

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Navigate to backend directory
$backendPath = "C:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor\backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to backend directory..." -ForegroundColor Green
Set-Location $backendPath

# Check if index.js exists
if (-not (Test-Path "index.js")) {
    Write-Host "ERROR: index.js not found in backend directory!" -ForegroundColor Red
    exit 1
}

Write-Host "FOUND: index.js" -ForegroundColor Green
Write-Host ""

# Install xml2js dependency
Write-Host "Checking dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules\xml2js")) {
    Write-Host "Installing xml2js (required for arXiv papers)..." -ForegroundColor Yellow
    npm install xml2js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: xml2js installed!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Failed to install xml2js, but continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "OK: xml2js already installed" -ForegroundColor Green
}
Write-Host ""

# Start the server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting JARVIS Node.js Backend..."
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Features enabled:" -ForegroundColor Yellow
Write-Host "  [OK] Knowledge Fusion (Internet + 262M sources)" -ForegroundColor Green
Write-Host "  [OK] Smart Query Classification" -ForegroundColor Green
Write-Host "  [OK] 7 Advanced Features" -ForegroundColor Green
Write-Host "  [OK] Multi-Agent System" -ForegroundColor Green
Write-Host ""
Write-Host "Server will start on: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node index.js
