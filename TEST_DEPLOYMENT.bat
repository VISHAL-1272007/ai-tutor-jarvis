@echo off
echo ================================
echo   DEPLOYMENT VERIFICATION
echo ================================
echo.
echo Checking deployment status...
echo.

REM Test Backend Health
echo [1/3] Testing Backend Health...
echo URL: https://ai-tutor-jarvis.onrender.com/health
echo.
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://ai-tutor-jarvis.onrender.com/health' -UseBasicParsing; Write-Host 'Backend Status:' $response.StatusCode; Write-Host 'Response:' $response.Content } catch { Write-Host 'Backend Error:' $_.Exception.Message }"
echo.

REM Test Frontend
echo [2/3] Testing Frontend...
echo URL: https://vishai-f6197.web.app
echo.
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://vishai-f6197.web.app' -UseBasicParsing; Write-Host 'Frontend Status:' $response.StatusCode } catch { Write-Host 'Frontend Error:' $_.Exception.Message }"
echo.

REM Test API Endpoint
echo [3/3] Testing API Endpoint...
echo URL: https://ai-tutor-jarvis.onrender.com/ask
echo.
powershell -Command "$body = @{question='Hello'} | ConvertTo-Json; try { $response = Invoke-WebRequest -Uri 'https://ai-tutor-jarvis.onrender.com/ask' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; Write-Host 'API Status:' $response.StatusCode; Write-Host 'Response:' $response.Content } catch { Write-Host 'API Error:' $_.Exception.Message }"
echo.

echo ================================
echo   VERIFICATION COMPLETE
echo ================================
echo.
echo If all tests passed, your deployment is successful!
echo.
echo Your Live URLs:
echo - Frontend: https://vishai-f6197.web.app
echo - Backend:  https://ai-tutor-jarvis.onrender.com
echo.
pause
