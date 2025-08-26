@echo off
setlocal enabledelayedexpansion

REM CareConnect Deployment Script for Windows
REM This script helps you deploy to different platforms

echo 🚀 CareConnect Deployment Script
echo ================================

REM Check if platform argument is provided
if "%1"=="" (
    echo Usage: deploy.bat [PLATFORM]
    echo.
    echo Available platforms:
    echo   railway  - Deploy to Railway (recommended)
    echo   vercel   - Deploy to Vercel
    echo   fly      - Deploy to Fly.io
    echo   render   - Show Render deployment instructions
    echo   build    - Just build the application
    echo.
    echo Examples:
    echo   deploy.bat railway
    echo   deploy.bat vercel
    echo   deploy.bat fly
    exit /b 1
)

REM Check dependencies
echo [INFO] Checking dependencies...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

echo [SUCCESS] Dependencies check passed

REM Build the application
echo [INFO] Building application...

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    exit /b 1
)

echo [SUCCESS] Application built successfully

REM Deploy based on platform
if "%1"=="railway" (
    echo [INFO] Deploying to Railway...
    
    where railway >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Railway CLI not found. Installing...
        call npm install -g @railway/cli
    )
    
    call railway up
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to deploy to Railway
        exit /b 1
    )
    
    echo [SUCCESS] Deployed to Railway successfully
    echo [INFO] Get your domain with: railway domain
    
) else if "%1"=="vercel" (
    echo [INFO] Deploying to Vercel...
    
    where vercel >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Vercel CLI not found. Installing...
        call npm install -g vercel
    )
    
    call vercel --prod
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to deploy to Vercel
        exit /b 1
    )
    
    echo [SUCCESS] Deployed to Vercel successfully
    
) else if "%1"=="fly" (
    echo [INFO] Deploying to Fly.io...
    
    where fly >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Fly CLI not found. Please install from: https://fly.io/docs/hands-on/install-flyctl/
        echo [INFO] After installation, run: fly auth login
        exit /b 1
    )
    
    call fly deploy
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to deploy to Fly.io
        exit /b 1
    )
    
    echo [SUCCESS] Deployed to Fly.io successfully
    
) else if "%1"=="render" (
    echo [INFO] Render deployment requires manual setup.
    echo [INFO] Please follow these steps:
    echo 1. Go to https://render.com
    echo 2. Connect your GitHub repository
    echo 3. Create a new Web Service
    echo 4. Set build command: npm install ^&^& npm run build
    echo 5. Set start command: npm start
    echo 6. Add PostgreSQL database
    echo 7. Configure environment variables
    echo 8. Deploy
    
) else if "%1"=="build" (
    echo [SUCCESS] Build completed successfully
    
) else (
    echo [ERROR] Unknown platform: %1
    echo.
    echo Available platforms:
    echo   railway  - Deploy to Railway (recommended)
    echo   vercel   - Deploy to Vercel
    echo   fly      - Deploy to Fly.io
    echo   render   - Show Render deployment instructions
    echo   build    - Just build the application
    exit /b 1
)

echo.
echo [SUCCESS] Deployment completed successfully!
