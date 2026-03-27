@echo off
REM Warehouse Inventory System - Quick Setup Script for Laragon
REM Run this script to quickly set up the project with Laragon

echo ============================================
echo  Warehouse Inventory System Setup
echo  For Laragon (MySQL)
echo ============================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [1/5] Creating .env.local file...
    copy .env.example .env.local
    echo.
    echo Please edit .env.local with your database settings:
    echo   DATABASE_HOSTNAME=localhost
    echo   DATABASE_PORT=3306
    echo   DATABASE_USERNAME=root
    echo   DATABASE_PASSWORD=
    echo   DATABASE_NAME=warehouse_inventory
    echo.
    pause
) else (
    echo [1/5] .env.local already exists
)

REM Check if node_modules exists
if not exist node_modules (
    echo [2/5] Installing npm dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
) else (
    echo [2/5] Dependencies already installed
)

echo [3/5] Checking Laragon MySQL connection...
echo.
echo Please ensure Laragon is running:
echo   1. Open Laragon and click "Start All"
echo   2. MySQL should show green status
echo.
echo Press any key when Laragon is running...
pause >nul

echo.
echo [4/5] Initializing database...
call npm run db:init
if errorlevel 1 (
    echo.
    echo ERROR: Database initialization failed
    echo Please check:
    echo   - Laragon MySQL is running
    echo   - .env.local has correct credentials
    pause
    exit /b 1
)

echo.
set /a SEED=1
echo [5/5] Would you like to seed demo data? (Y/N)
set /p SEED_INPUT=
if /i "%SEED_INPUT%"=="N" set SEED=0
if /i "%SEED_INPUT%"=="NO" set SEED=0

if %SEED%==1 (
    echo.
    Seeding database with demo data...
    call npm run db:seed
    if errorlevel 1 (
        echo WARNING: Seeding failed, but app can still run
    )
)

echo.
echo ============================================
echo  SETUP COMPLETE!
echo ============================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo The app will be available at:
echo   http://localhost:3000
echo.
if %SEED%==1 (
    echo Demo Login Credentials:
    echo   Email: demo@warehouse.com
    echo   Password: password123
)
echo.
echo ============================================
pause
