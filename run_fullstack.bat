@echo off
title NeuroScan AI - Brain Tumor Diagnostic Platform
echo ==============================================================
echo       NEUROSCAN AI - BRAIN TUMOR DIAGNOSTIC PLATFORM
echo   Deep Learning Classification, U-Net Segmentation, and CV HUD
echo ==============================================================
echo.

cd /d "%~dp0"

set "PY_CMD="
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PY_CMD=%~dp0.venv\Scripts\python.exe"
) else (
    py -3.12 -c "import sys" >nul 2>&1
    if not errorlevel 1 (
        set "PY_CMD=py -3.12"
    ) else (
        set "PY_CMD=python"
    )
)

echo [1/2] Launching FastAPI AI Diagnostic Engine on http://127.0.0.1:8000 ...
start "NeuroScan Backend Engine" cmd /k "cd /d %~dp0backend && %PY_CMD% app.py"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Vite Modern Frontend ...
start "NeuroScan Web UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==============================================================
echo Systems initialized!
echo Open your browser at:
echo   - Web Interface:   http://localhost:5173
echo   - Unified Engine:  http://127.0.0.1:8000
echo   - API Swagger Docs: http://127.0.0.1:8000/docs
echo ==============================================================
echo.
pause
