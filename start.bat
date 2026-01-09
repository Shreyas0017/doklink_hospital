@echo off
echo ========================================
echo Starting Hospital Management System
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo node_modules not found!
    echo Please run setup.bat first to install dependencies.
    pause
    exit /b 1
)

echo Starting development server...
echo.
echo ========================================
echo Server running at http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
