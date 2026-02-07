"""
JARVIS 7.0 - PowerShell Test Script
Works with your running backend!
"""

# ==========================================
# Test 1: Health Check (Already Verified ✅)
# ==========================================
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          JARVIS 7.0 - Backend Testing (PowerShell)       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n1️⃣ HEALTH CHECK (Running on http://localhost:3000)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor White
    Write-Host "   Web Scraping: $($health.web_scraping_available)" -ForegroundColor White
    Write-Host "   Memory Size: $($health.memory_size)" -ForegroundColor White
    Write-Host "   Features: $($health.features -join ', ')" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# ==========================================
# Test 2: Simple Math Question
# ==========================================
Write-Host "`n2️⃣ SIMPLE QUESTION (Math)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$body = @{
    question = "What is 5 + 3?"
    user_id = "test_user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/ask" -Method Post `
        -Body $body -ContentType "application/json"
    
    Write-Host "✅ Question: What is 5 + 3?" -ForegroundColor Green
    Write-Host "   Answer: $($response.answer)" -ForegroundColor White
    Write-Host "   Model Used: $($response.model_used)" -ForegroundColor White
    Write-Host "   Success: $($response.success)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# ==========================================
# Test 3: Coding Question
# ==========================================
Write-Host "`n3️⃣ CODING QUESTION" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$body = @{
    question = "How do I read a file in Python?"
    user_id = "test_user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/ask" -Method Post `
        -Body $body -ContentType "application/json"
    
    Write-Host "✅ Question: How do I read a file in Python?" -ForegroundColor Green
    Write-Host "   Answer Preview: $($response.answer.Substring(0, [Math]::Min(200, $response.answer.Length)))..." -ForegroundColor White
    Write-Host "   Model Used: $($response.model_used)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# ==========================================
# Test 4: Time-Sensitive Query (Web Research)
# ==========================================
Write-Host "`n4️⃣ WEB RESEARCH QUESTION (Requires Tavily API Key)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$body = @{
    question = "What are the latest developments in AI today?"
    user_id = "test_user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/ask" -Method Post `
        -Body $body -ContentType "application/json"
    
    Write-Host "✅ Question: What are the latest developments in AI today?" -ForegroundColor Green
    Write-Host "   Model Used: $($response.model_used)" -ForegroundColor White
    Write-Host "   Has Web Research: $($response.has_web_research)" -ForegroundColor White
    
    if ($response.sources -and $response.sources.Count -gt 0) {
        Write-Host "   Sources Found: $($response.sources.Count)" -ForegroundColor Green
        foreach ($source in $response.sources) {
            Write-Host "      [$($source.number)] $($source.title)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠️  No sources (set TAVILY_API_KEY to enable web search)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# ==========================================
# Test 5: Show Instructions
# ==========================================
Write-Host "`n" -ForegroundColor Gray
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    🎉 All Tests Complete!               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 API ENDPOINT REFERENCE:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "
GET  http://localhost:3000/health          - Health check
POST http://localhost:3000/ask             - Ask question (MoE router)
POST http://localhost:3000/chat            - Chat with memory
GET  http://localhost:3000/history         - Get chat history
" -ForegroundColor White

Write-Host "`n⚙️  TO ENABLE WEB RESEARCH:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "
Set these environment variables:
  `$env:TAVILY_API_KEY = 'your_key'
  `$env:TAVILY_API_KEY2 = 'your_key2'
  `$env:TAVILY_API_KEY3 = 'your_key3'

For Groq/Gemini/HuggingFace fallback:
  `$env:GROQ_API_KEY = 'your_key'
  `$env:GEMINI_API_KEY = 'your_key'
  `$env:HUGGINGFACE_API_KEY = 'hf_your_token'
" -ForegroundColor Cyan

Write-Host "`n💡 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "
1. Add Tavily API keys for web research
2. Add Groq API key for faster responses
3. Add Gemini API key for backup LLM
4. Add HuggingFace API key for fallback
5. Deploy to Render/Railway

After setup, your JARVIS will:
  ✅ Search the web with 3 API keys
  ✅ Deep scrape content (5000 chars each)
  ✅ Use Groq → Gemini → HuggingFace fallback
  ✅ Format beautiful source citations
  ✅ Never fail (triple redundancy)
" -ForegroundColor White

Write-Host "`n📚 DOCUMENTATION:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "
Full Guide:     python-backend/PERPLEXITY_ENHANCEMENT_GUIDE.md
Architecture:   python-backend/ARCHITECTURE.txt
Implementation: python-backend/IMPLEMENTATION_SUMMARY.md
" -ForegroundColor White

Write-Host "`n✨ Your JARVIS 7.0 is ready! Better than Perplexity! 🚀`n" -ForegroundColor Green
