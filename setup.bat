@echo off
echo ========================================
echo Hospital Management System Setup
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

echo [2/4] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo [3/4] Setup complete!
echo.

echo [4/4] Starting development server...
echo.
echo ========================================
echo Server will start at http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
