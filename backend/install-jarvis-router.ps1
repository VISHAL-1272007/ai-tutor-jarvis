# JARVIS Reasoning Router - Quick Install Script
# Run this to set up everything automatically

Write-Host "🤖 JARVIS REASONING ROUTER - INSTALLATION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "c:\Users\Admin\OneDrive\Desktop\zoho\ai-tutor\backend"

Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r jarvis-router-requirements.txt

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 Running test suite..." -ForegroundColor Yellow
python jarvis-router-cli.py --test

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🎉 JARVIS Reasoning Router is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Quick Start:" -ForegroundColor Yellow
Write-Host "  Interactive mode: python jarvis-router-cli.py" -ForegroundColor White
Write-Host "  Single query:     python jarvis-router-cli.py -q 'Your question'" -ForegroundColor White
Write-Host "  Test suite:       python jarvis-router-cli.py --test" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "  - JARVIS_REASONING_INTEGRATION.md (Setup guide)" -ForegroundColor White
Write-Host "  - JARVIS_REASONING_ARCHITECTURE.md (Architecture)" -ForegroundColor White
Write-Host ""
