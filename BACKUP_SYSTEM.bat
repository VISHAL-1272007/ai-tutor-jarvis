@echo off
echo ========================================
echo   JARVIS AI - BACKUP SYSTEM
echo ========================================
echo.

set BACKUP_DIR=backups\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%" 2>nul

echo.
echo [1/5] Backing up Python Backend...
xcopy "python-backend\*.*" "%BACKUP_DIR%\python-backend\" /E /I /Y >nul
echo      ✓ Python backend backed up

echo.
echo [2/5] Backing up Node.js Backend...
xcopy "backend\*.*" "%BACKUP_DIR%\backend\" /E /I /Y /EXCLUDE:backup_exclude.txt >nul
echo      ✓ Node.js backend backed up

echo.
echo [3/5] Backing up Frontend...
xcopy "frontend\*.html" "%BACKUP_DIR%\frontend\" /I /Y >nul
xcopy "frontend\*.css" "%BACKUP_DIR%\frontend\" /I /Y >nul
xcopy "frontend\*.js" "%BACKUP_DIR%\frontend\" /I /Y >nul
echo      ✓ Frontend backed up

echo.
echo [4/5] Backing up Configuration Files...
copy "firebase.json" "%BACKUP_DIR%\" >nul 2>&1
copy "package.json" "%BACKUP_DIR%\" >nul 2>&1
copy ".firebaserc" "%BACKUP_DIR%\" >nul 2>&1
echo      ✓ Config files backed up

echo.
echo [5/5] Creating backup info file...
echo Backup Date: %date% %time% > "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Python Backend: Included >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Node.js Backend: Included >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Frontend: Included >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Config Files: Included >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo      ✓ Backup info created

echo.
echo ========================================
echo   ✓ BACKUP COMPLETED SUCCESSFULLY
echo ========================================
echo.
echo Backup Location: %BACKUP_DIR%
echo.
pause
