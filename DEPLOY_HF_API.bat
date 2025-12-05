@echo off
echo ========================================
echo   DEPLOY FREE AI API TO HUGGING FACE
echo ========================================
echo.

REM Replace YOUR_USERNAME with your actual Hugging Face username
set /p USERNAME="Enter your Hugging Face username: "

echo.
echo Cloning your Space repository...
git clone https://huggingface.co/spaces/%USERNAME%/ai-tutor-api
cd ai-tutor-api

echo.
echo Copying API files...
copy ..\huggingface-api\Dockerfile . /Y
copy ..\huggingface-api\app.py . /Y
copy ..\huggingface-api\requirements.txt . /Y

echo.
echo Committing files...
git add .
git commit -m "Deploy FREE AI API"

echo.
echo Pushing to Hugging Face...
git push

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your API will be available at:
echo https://%USERNAME%-ai-tutor-api.hf.space
echo.
echo Wait 5-10 minutes for build to complete.
echo.
pause
