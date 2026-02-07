# Test Knowledge Fusion - PowerShell Script
# Tests the Node.js backend with different query types

Write-Host "Testing JARVIS Knowledge Fusion" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"

# Function to test query
function Test-Query {
    param(
        [string]$Question,
        [string]$ExpectedType,
        [string]$Description
    )
    
    Write-Host "Test: $Description" -ForegroundColor Yellow
    Write-Host "   Query: $Question" -ForegroundColor White
    Write-Host "   Expected: $ExpectedType" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $body = @{
            question = $Question
            history = @()
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/ask" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 30
        
        Write-Host "[OK] Response received!" -ForegroundColor Green
        if ($response.queryType) {
            Write-Host "   Query Type: $($response.queryType)" -ForegroundColor Cyan
        }
        if ($response.knowledgeFusion) {
            Write-Host "   Knowledge Fusion: ACTIVE" -ForegroundColor Green
        }
        if ($response.searchEngine) {
            Write-Host "   Search Engine: $($response.searchEngine)" -ForegroundColor Cyan
        }
        if ($response.sources) {
            Write-Host "   Sources: $($response.sources.Count)" -ForegroundColor Cyan
        }
        Write-Host "   Answer (first 150 chars):" -ForegroundColor White
        $shortAnswer = $response.answer.Substring(0, [Math]::Min(150, $response.answer.Length))
        Write-Host "   $shortAnswer..." -ForegroundColor Gray
        Write-Host ""
        
    } catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
    
    Start-Sleep -Seconds 1
}

# Test 1: Current Event (should use Internet only)
Test-Query `
    -Question "What is the current gold price?" `
    -ExpectedType "current_event" `
    -Description "Current Event Test"

# Test 2: Academic Query (should use books + papers + internet)
Test-Query `
    -Question "Explain quantum entanglement theory" `
    -ExpectedType "academic" `
    -Description "Academic Query Test"

# Test 3: Coding Query (should use internet + books)
Test-Query `
    -Question "How to debug Node.js memory leaks?" `
    -ExpectedType "coding" `
    -Description "Coding Query Test"

# Test 4: General Query (should use internet + books)
Test-Query `
    -Question "Tell me about Shakespeare" `
    -ExpectedType "general" `
    -Description "General Query Test"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "[OK] All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "   - All 4 query types tested" -ForegroundColor White
Write-Host "   - Knowledge Fusion should be active" -ForegroundColor White
Write-Host "   - Check sources count for each" -ForegroundColor White
Write-Host ""
