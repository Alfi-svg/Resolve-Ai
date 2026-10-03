@echo off
echo ========================================================
echo Starting UPAY ResolveAI Platform
echo ========================================================
set "PATH=C:\Users\samiu\AppData\Local\Programs\nodejs;%PATH%"

start "ResolveAI Backend (FastAPI)" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
start "ResolveAI Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend API & Unified UI: http://127.0.0.1:8000/
echo Frontend Dev Server:       http://localhost:5173/
echo.
pause
