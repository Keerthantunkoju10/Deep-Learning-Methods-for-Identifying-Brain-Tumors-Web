@echo off
title NeuroScan AI - Backend Diagnostic Engine
echo ==============================================================
echo       NEUROSCAN AI - FASTAPI DIAGNOSTIC BACKEND
echo   TensorFlow 2.x, U-Net Segmentation, and OpenCV Analysis
echo ==============================================================
echo.

cd /d "%~dp0"

set "PY_CMD="
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PY_CMD=%~dp0.venv\Scripts\python.exe"
    echo [INFO] Using verified virtual environment: %~dp0.venv
) else (
    py -3.12 -c "import sys" >nul 2>&1
    if not errorlevel 1 (
        set "PY_CMD=py -3.12"
        echo [INFO] Using Python 3.12 launcher
    ) else (
        set "PY_CMD=python"
        echo [WARN] Defaulting to system python
    )
)

echo [INFO] Launching backend server on http://127.0.0.1:8000 ...
echo [INFO] API Documentation: http://127.0.0.1:8000/docs
echo [INFO] Press Ctrl+C in this window to stop the server.
echo.
%PY_CMD% "%~dp0backend\app.py"

if errorlevel 1 (
    echo.
    echo [ERROR] Backend server stopped with an error.
    pause
)
