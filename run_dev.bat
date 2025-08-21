@echo off
echo =======================================
echo BFP Sorsogon Attendance - Development Mode
echo =======================================
echo.

cd %~dp0\backend

REM Set environment variables for development
set FLASK_CONFIG=development
set FLASK_DEBUG=1

echo Starting the backend server in development mode...
python run.py

pause
