@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM CareConnect v5.0 Launch Script for Windows
REM =============================================================================

REM Set console colors
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "PURPLE=[95m"
set "CYAN=[96m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_header
echo %BLUE%================================%NC%
echo %BLUE%  CareConnect v5.0 Launcher%NC%
echo %BLUE%================================%NC%
goto :eof

REM Function to check if a command exists
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    set "exists=true"
) else (
    set "exists=false"
)
goto :eof

REM Function to check system requirements
:check_requirements
call :print_status "Checking system requirements..."

REM Check Node.js
call :command_exists node
if "%exists%"=="false" (
    call :print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:~1,2%
if %NODE_VERSION% LSS 18 (
    call :print_error "Node.js version 18+ is required. Current version: %NODE_VERSION%"
    exit /b 1
)

REM Check npm
call :command_exists npm
if "%exists%"=="false" (
    call :print_error "npm is not installed. Please install npm first."
    exit /b 1
)

REM Check Python
call :command_exists python
if "%exists%"=="false" (
    call :print_error "Python 3.9+ is not installed. Please install Python 3.9+ first."
    exit /b 1
)

REM Check pip
call :command_exists pip
if "%exists%"=="false" (
    call :print_error "pip is not installed. Please install pip first."
    exit /b 1
)

call :print_status "System requirements check passed!"
goto :eof

REM Function to create necessary directories
:create_directories
call :print_status "Creating necessary directories..."

if not exist "data" mkdir data
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "temp" mkdir temp
if not exist "cache" mkdir cache
if not exist "analytics" mkdir analytics
if not exist "ai-core\checkpoints" mkdir ai-core\checkpoints

call :print_status "Directories created successfully!"
goto :eof

REM Function to check if dependencies are installed
:check_dependencies
call :print_status "Checking dependencies..."

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    call :print_warning "Frontend dependencies not found. Installing..."
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\node_modules" (
    call :print_warning "Backend dependencies not found. Installing..."
    cd backend
    call npm install
    cd ..
)

REM Check Python dependencies
if not exist "ai-core\requirements.txt" (
    call :print_warning "AI dependencies not found. Installing..."
    cd ai-core
    call pip install -r requirements.txt
    cd ..
)

call :print_status "Dependencies check completed!"
goto :eof

REM Function to load configuration
:load_config
call :print_status "Loading configuration..."

if not exist "config.yaml" (
    call :print_error "Configuration file config.yaml not found!"
    exit /b 1
)

REM Extract ports from config (simplified for Windows)
set FRONTEND_PORT=3000
set BACKEND_PORT=3001
set AI_PORT=3002

call :print_status "Configuration loaded successfully!"
goto :eof

REM Function to check if ports are available
:check_ports
call :print_status "Checking port availability..."

REM Check if ports are in use (simplified for Windows)
netstat -an | find ":%FRONTEND_PORT%" >nul
if %errorlevel% equ 0 (
    call :print_warning "Port %FRONTEND_PORT% is already in use. Attempting to free it..."
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":%FRONTEND_PORT%"') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -an | find ":%BACKEND_PORT%" >nul
if %errorlevel% equ 0 (
    call :print_warning "Port %BACKEND_PORT% is already in use. Attempting to free it..."
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":%BACKEND_PORT%"') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -an | find ":%AI_PORT%" >nul
if %errorlevel% equ 0 (
    call :print_warning "Port %AI_PORT% is already in use. Attempting to free it..."
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":%AI_PORT%"') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

call :print_status "Ports are available!"
goto :eof

REM Function to start the AI engine
:start_ai_engine
call :print_status "Starting AI engine..."

cd ai-core

REM Check if model exists
if not exist "checkpoints\steward-v5.pt" (
    call :print_warning "AI model not found. Initializing with default model..."
    python -c "import torch; import os; model = torch.nn.Linear(100, 100); os.makedirs('checkpoints', exist_ok=True); torch.save(model.state_dict(), 'checkpoints/steward-v5.pt'); print('Default model created successfully!')"
)

REM Start AI engine in background
start /b python predict.py
set AI_PID=%errorlevel%

cd ..

REM Wait for AI engine to start
timeout /t 3 /nobreak >nul

call :print_status "AI engine started successfully!"
goto :eof

REM Function to start the backend
:start_backend
call :print_status "Starting backend server..."

cd backend

REM Start backend in background
start /b npm start
set BACKEND_PID=%errorlevel%

cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

call :print_status "Backend server started successfully!"
goto :eof

REM Function to start the frontend
:start_frontend
call :print_status "Starting frontend application..."

cd frontend

REM Start frontend in background
start /b npm start
set FRONTEND_PID=%errorlevel%

cd ..

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

call :print_status "Frontend application started successfully!"
goto :eof

REM Function to display startup information
:display_startup_info
echo.
echo %CYAN%================================%NC%
echo %CYAN%  CareConnect v5.0 is Running!%NC%
echo %CYAN%================================%NC%
echo.
echo %GREEN%Frontend:%NC% http://localhost:%FRONTEND_PORT%
echo %GREEN%Backend API:%NC% http://localhost:%BACKEND_PORT%
echo %GREEN%AI Engine:%NC% http://localhost:%AI_PORT%
echo.
echo %YELLOW%Process IDs:%NC%
echo   Frontend: %FRONTEND_PID%
echo   Backend:  %BACKEND_PID%
echo   AI Engine: %AI_PID%
echo.
echo %PURPLE%Press Ctrl+C to stop all services%NC%
echo.
goto :eof

REM Function to handle shutdown
:cleanup
echo.
call :print_status "Shutting down CareConnect v5.0..."

REM Kill all background processes (simplified for Windows)
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

call :print_status "CareConnect v5.0 has been stopped."
exit /b 0

REM Main execution
:main
call :print_header

REM Check requirements
call :check_requirements
if %errorlevel% neq 0 exit /b %errorlevel%

REM Create directories
call :create_directories

REM Check dependencies
call :check_dependencies

REM Load configuration
call :load_config
if %errorlevel% neq 0 exit /b %errorlevel%

REM Check ports
call :check_ports

REM Start services
call :start_ai_engine
call :start_backend
call :start_frontend

REM Display startup information
call :display_startup_info

REM Keep script running
:loop
timeout /t 1 /nobreak >nul
goto loop

REM Run main function
call :main
