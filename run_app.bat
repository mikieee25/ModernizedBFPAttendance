@echo off
echo ===================================
echo BFP Sorsogon Attendance System Setup
echo ===================================
echo.

cd %~dp0\backend

echo Setting up Python environment...
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Setting up MySQL database...
python create_db.py

echo.
echo Starting the backend server in development mode...
set FLASK_CONFIG=development
set FLASK_DEBUG=1
python run.py

pause
