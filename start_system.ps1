# MahaGov-Pulse: Autonomous Maharashtra DPI Platform Startup Script
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               MAHAGOV-PULSE: AUTONOMOUS MAHARASHTRA DPI PLATFORM" -ForegroundColor Yellow
Write-Host "         Zero Corruption - Zero Human Interference - 48H Hard SLA Escrow" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path "$scriptDir\backend\venv\Scripts\python.exe")) {
    Write-Host "Virtual environment not found at backend\venv!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Starting Next.js Frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; npm run dev"

Write-Host "[2/4] Waiting 3 seconds for server initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[3/4] Launching Web Browser to http://localhost:3000/ ..." -ForegroundColor Green
Start-Process "http://localhost:3000/"
Start-Process "$scriptDir\Docs\12_FINAL_PROJECT_PRESENTATION_DECK.html"

Write-Host "[4/4] Starting Unified FastAPI Backend on http://127.0.0.1:8001 ..." -ForegroundColor Cyan
Set-Location "$scriptDir\backend"
& "venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001
