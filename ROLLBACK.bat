@echo off
echo ================================
echo   EMERGENCY ROLLBACK
echo ================================
echo.
echo This will revert to the previous commit
echo (before the recent changes)
echo.
echo WARNING: This will undo:
echo - JavaScript fixes
echo - Deployment scripts
echo - Documentation files
echo.
set /p CONFIRM=Are you sure? (Y/N): 

if /i "%CONFIRM%"=="Y" (
    echo.
    echo Rolling back...
    git reset --hard HEAD~1
    
    if %errorlevel% equ 0 (
        echo.
        echo ================================
        echo ✅ ROLLBACK SUCCESSFUL
        echo ================================
        echo.
        echo Your code has been reverted to the previous state.
        echo.
        echo To restore the changes:
        echo git reset --hard HEAD@{1}
        echo.
    ) else (
        echo.
        echo ❌ ROLLBACK FAILED
        echo Please check the error above
    )
) else (
    echo.
    echo Rollback cancelled.
)

echo.
pause
