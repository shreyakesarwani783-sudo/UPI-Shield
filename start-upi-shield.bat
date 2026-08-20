@echo off
echo ========================================
echo   Starting UPI Shield Dashboard
echo ========================================
echo.

REM Start Backend in a new window
echo Starting Backend (FastAPI)...
start "UPI Shield - BACKEND" cmd /k "cd /d C:\Users\pc\OneDrive\Desktop\SIH_BYTERIGHTS\upi-phishing-detector\backend && call C:\Users\pc\OneDrive\Desktop\SIH_BYTERIGHTS\.venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000"

REM Wait 3 seconds so backend starts loading first
timeout /t 3 /nobreak >nul

REM Start Frontend in a new window
echo Starting Frontend (Vite)...
start "UPI Shield - FRONTEND" cmd /k "cd /d C:\Users\pc\OneDrive\Desktop\SIH_BYTERIGHTS\upi-phishing-detector\dashboard && npm run dev"

REM Wait a bit then open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo   Both servers starting in new windows!
echo   Browser will open automatically.
echo ========================================
echo.
echo This window can be closed - servers run in their own windows.
pause
