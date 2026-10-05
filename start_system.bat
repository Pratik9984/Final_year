@echo off
TITLE MahaGov-Pulse: Autonomous Maharashtra DPI Platform
COLOR 0A
echo ===============================================================================
echo                MAHAGOV-PULSE: AUTONOMOUS MAHARASHTRA DPI PLATFORM
echo          Zero Corruption - Zero Human Interference - 48H Hard SLA Escrow
echo ===============================================================================
echo.

cd /d "%~dp0backend"

echo [1/4] Checking Python Virtual Environment...
if not exist "venv\Scripts\python.exe" (
    echo Virtual environment not found. Please initialize venv first.
    pause
    exit /b 1
)

echo [2/4] Starting Next.js 14+ Frontend Server on port 3000...
start "MahaGov-Pulse Next.js Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo [3/4] Launching Browser to http://localhost:3000/ ...
timeout /t 3 /nobreak >nul
start "" http://localhost:3000/
start "" "%~dp0Docs\12_FINAL_PROJECT_PRESENTATION_DECK.html"

echo [4/4] Starting FastAPI Backend on http://127.0.0.1:8001 (Press CTRL+C to stop)...
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
pause
