@echo off
title AI Resume Analyzer - Startup Launcher
echo ======================================================
echo   AI RESUME ANALYZER - Multi-Service Launcher
echo ======================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Checking Python virtual environment in ai-service...
if not exist "ai-service\.venv\Scripts\python.exe" (
    echo Notice: Python virtualenv not found in ai-service\.venv
    echo Creating virtualenv and installing requirements...
    cd ai-service
    python -m venv .venv
    .venv\Scripts\pip install -r requirements.txt
    cd ..
)

echo [3/3] Launching all services (AI Service + Backend + Frontend)...
echo.
echo Application will be accessible at:
echo   Frontend UI:  http://localhost:5173
echo   Backend API:  http://localhost:5000
echo   AI Service:   http://localhost:8000
echo.
echo Press Ctrl+C at any time in this window to stop all services.
echo.

node dev.js
pause
