@echo off
echo =====================================================
echo  FinanceAI - Starting Application
echo =====================================================

echo.
echo [1/2] Starting Backend API...
start "FinanceAI Backend" cmd /k "cd /d %~dp0backend && python main.py"

echo.
echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo [2/2] Starting Frontend...
start "FinanceAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================
echo  Application is starting!
echo  Backend:  http://localhost:8000/api/docs
echo  Frontend: http://localhost:5175
echo =====================================================
echo.
pause
