@echo off
title NeuroScan AI - Brain Tumor Diagnostic Platform
echo ==============================================================
echo       NEUROSCAN AI - BRAIN TUMOR DIAGNOSTIC PLATFORM
echo   Deep Learning Classification, U-Net Segmentation, and CV HUD
echo ==============================================================
echo.

echo [1/2] Launching FastAPI AI Diagnostic Engine on http://127.0.0.1:8000 ...
start "NeuroScan Backend Engine" cmd /k "cd /d %~dp0backend && py -3.12 -m uvicorn app:app --port 8000 --host 127.0.0.1"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Vite Modern Frontend ...
start "NeuroScan Web UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==============================================================
echo Systems initialized!
echo Open your browser at:
echo   - Web Interface:   http://localhost:5173 or http://localhost:5174
echo   - Unified Engine:  http://127.0.0.1:8000
echo   - API Swagger Docs: http://127.0.0.1:8000/docs
echo ==============================================================
echo.
pause
