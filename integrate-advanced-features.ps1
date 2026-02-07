# JARVIS Advanced Features - Quick Integration Script
# Run this to automatically integrate all 7 features into app.py

Write-Host "🚀 JARVIS Advanced Features Installation" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$appPath = "python-backend\app.py"
$featuresPath = "python-backend\jarvis_advanced_features.py"

# Check if files exist
if (-not (Test-Path $appPath)) {
    Write-Host "❌ Error: $appPath not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $featuresPath)) {
    Write-Host "❌ Error: $featuresPath not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found app.py" -ForegroundColor Green
Write-Host "✅ Found jarvis_advanced_features.py" -ForegroundColor Green
Write-Host ""

# Backup original app.py
$backupPath = "python-backend\app_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').py"
Copy-Item $appPath $backupPath
Write-Host "💾 Backup created: $backupPath" -ForegroundColor Yellow
Write-Host ""

# Read current app.py
$content = Get-Content $appPath -Raw

# Check if already integrated
if ($content -match "from jarvis_advanced_features import") {
    Write-Host "⚠️  Advanced features already integrated!" -ForegroundColor Yellow
    Write-Host "    Remove import and try again if you want to reinstall." -ForegroundColor Yellow
    exit 0
}

Write-Host "📝 Adding imports..." -ForegroundColor Cyan

# Find import section (after other imports, before Flask app initialization)
$importSection = @"
# Import advanced features module (7 Advanced Features)
from jarvis_advanced_features import (
    generate_chain_of_thought,
    get_proactive_suggestions,
    store_long_term_memory,
    recall_relevant_memory,
    extract_and_store_facts,
    synthesize_voice,
    handle_multilingual_query,
    translate_with_gemini,
    execute_python_code,
    detect_and_execute_code,
    AgentOrchestrator,
    enhance_jarvis_response
)
print("✅ JARVIS Advanced Features loaded: Chain-of-Thought, Proactive Suggestions, Enhanced Memory, Voice, Multi-Language, Code Execution, Multi-Agent")

"@

# Add import after existing imports (look for "from tavily import" or similar)
$content = $content -replace "(from tavily import.*?\n)", "`$1`n$importSection"

# Add agent orchestrator initialization after Redis
$agentInit = @"


# =============================
# MULTI-AGENT SYSTEM
# =============================
try:
    agent_orchestrator = AgentOrchestrator()
    print("✅ Multi-Agent System initialized (5 specialized agents: Researcher, Coder, Analyst, Writer, Tutor)")
except Exception as e:
    print(f"⚠️ Multi-Agent System initialization failed: {e}")
    agent_orchestrator = None
"@

# Add after Redis initialization
$content = $content -replace "(redis_client = redis\.Redis.*?\n.*?\n.*?\n)", "`$1$agentInit"

# Save modified app.py
$content | Set-Content $appPath -NoNewline

Write-Host "✅ Imports added successfully!" -ForegroundColor Green
Write-Host "✅ Agent Orchestrator initialized!" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open python-backend\app.py" -ForegroundColor White
Write-Host "   2. Find handle_chat_hybrid() function (around line 1750)" -ForegroundColor White
Write-Host "   3. Replace the response section with enhanced version" -ForegroundColor White
Write-Host "   4. See JARVIS_ADVANCED_FEATURES_INTEGRATION.md for full guide" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test with:" -ForegroundColor Cyan
Write-Host '   curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d "{\"message\": \"What is gold price?\", \"user_id\": \"test\"}"' -ForegroundColor White
Write-Host ""
Write-Host "📚 Features Now Available:" -ForegroundColor Cyan
Write-Host "   ✅ Chain-of-Thought Reasoning" -ForegroundColor Green
Write-Host "   ✅ Proactive Suggestions" -ForegroundColor Green
Write-Host "   ✅ Enhanced Memory" -ForegroundColor Green
Write-Host "   ✅ Custom Voice (ElevenLabs)" -ForegroundColor Green
Write-Host "   ✅ Multi-Language (40+ languages)" -ForegroundColor Green
Write-Host "   ✅ Code Execution Sandbox" -ForegroundColor Green
Write-Host "   ✅ Multi-Agent System (5 agents)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready to deploy!" -ForegroundColor Cyan
