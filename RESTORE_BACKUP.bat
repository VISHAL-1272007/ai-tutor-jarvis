@echo off
echo ========================================
echo   JARVIS AI - RESTORE FROM BACKUP
echo ========================================
echo.

:: List available backups
echo Available backups:
echo.
dir /b /ad backups
echo.

set /p BACKUP_NAME="Enter backup folder name to restore: "

if not exist "backups\%BACKUP_NAME%\" (
    echo ERROR: Backup folder not found!
    pause
    exit /b 1
)

echo.
echo WARNING: This will overwrite current files!
set /p CONFIRM="Are you sure? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo Restore cancelled.
    pause
    exit /b 0
)

echo.
echo Restoring from backup: %BACKUP_NAME%
echo.

echo [1/4] Restoring Python Backend...
xcopy "backups\%BACKUP_NAME%\python-backend\*.*" "python-backend\" /E /I /Y >nul
echo      ✓ Python backend restored

echo.
echo [2/4] Restoring Node.js Backend...
xcopy "backups\%BACKUP_NAME%\backend\*.*" "backend\" /E /I /Y >nul
echo      ✓ Node.js backend restored

echo.
echo [3/4] Restoring Frontend...
xcopy "backups\%BACKUP_NAME%\frontend\*.*" "frontend\" /E /I /Y >nul
echo      ✓ Frontend restored

echo.
echo [4/4] Restoring Configuration...
copy "backups\%BACKUP_NAME%\*.json" . /Y >nul 2>&1
echo      ✓ Configuration restored

echo.
echo ========================================
echo   ✓ RESTORE COMPLETED
echo ========================================
echo.
pause
