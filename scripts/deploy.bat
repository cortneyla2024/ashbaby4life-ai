@echo off
REM Hope: The Steward - Deployment Script for Windows
REM This script handles the deployment of the Hope application

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if command exists
:command_exists
where %~1 >nul 2>&1
if %errorlevel% equ 0 (
    set "exists=true"
) else (
    set "exists=false"
)
goto :eof

REM Function to check prerequisites
:check_prerequisites
call :print_status "Checking prerequisites..."

call :command_exists node
if "!exists!"=="false" (
    call :print_error "Node.js is not installed. Please install Node.js 18+"
    exit /b 1
)

call :command_exists pnpm
if "!exists!"=="false" (
    call :print_error "pnpm is not installed. Please install pnpm 8+"
    exit /b 1
)

call :command_exists git
if "!exists!"=="false" (
    call :print_error "Git is not installed. Please install Git"
    exit /b 1
)

call :print_success "All prerequisites are satisfied"
goto :eof

REM Function to install dependencies
:install_dependencies
call :print_status "Installing dependencies..."

if exist "pnpm-lock.yaml" (
    pnpm install --frozen-lockfile
) else (
    pnpm install
)

if %errorlevel% neq 0 (
    call :print_error "Failed to install dependencies"
    exit /b 1
)

call :print_success "Dependencies installed successfully"
goto :eof

REM Function to generate Prisma client
:generate_prisma_client
call :print_status "Generating Prisma client..."

pnpm db:generate

if %errorlevel% neq 0 (
    call :print_error "Failed to generate Prisma client"
    exit /b 1
)

call :print_success "Prisma client generated successfully"
goto :eof

REM Function to run database migrations
:run_migrations
call :print_status "Running database migrations..."

if "%ENVIRONMENT%"=="production" (
    pnpm db:migrate
) else (
    pnpm db:push
)

if %errorlevel% neq 0 (
    call :print_error "Failed to run database migrations"
    exit /b 1
)

call :print_success "Database migrations completed successfully"
goto :eof

REM Function to build the application
:build_application
call :print_status "Building the application..."

pnpm build

if %errorlevel% neq 0 (
    call :print_error "Failed to build application"
    exit /b 1
)

call :print_success "Application built successfully"
goto :eof

REM Function to run tests
:run_tests
call :print_status "Running tests..."

pnpm test

if %errorlevel% neq 0 (
    call :print_error "Tests failed"
    exit /b 1
)

call :print_success "All tests passed"
goto :eof

REM Function to deploy to Vercel
:deploy_vercel
call :print_status "Deploying to Vercel..."

call :command_exists vercel
if "!exists!"=="false" (
    call :print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
)

vercel --prod

if %errorlevel% neq 0 (
    call :print_error "Failed to deploy to Vercel"
    exit /b 1
)

call :print_success "Deployed to Vercel successfully"
goto :eof

REM Function to deploy with Docker
:deploy_docker
call :print_status "Building Docker image..."

docker build -t hope-steward .

if %errorlevel% neq 0 (
    call :print_error "Failed to build Docker image"
    exit /b 1
)

call :print_status "Running Docker container..."

docker run -d --name hope-steward -p 3000:3000 --env-file .env.production hope-steward

if %errorlevel% neq 0 (
    call :print_error "Failed to run Docker container"
    exit /b 1
)

call :print_success "Docker deployment completed successfully"
goto :eof

REM Function to deploy manually
:deploy_manual
call :print_status "Starting production server..."

pnpm start
goto :eof

REM Function to show help
:show_help
echo Hope: The Steward - Deployment Script
echo.
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   -e ENVIRONMENT    Set deployment environment (development, staging, production)
echo   -p PLATFORM       Set deployment platform (vercel, docker, manual)
echo   -t                Run tests before deployment
echo   -h                Show this help message
echo.
echo Examples:
echo   %~nx0 -e production -p vercel    # Deploy to Vercel in production
echo   %~nx0 -e staging -p docker       # Deploy with Docker in staging
echo   %~nx0 -e development -p manual   # Start development server
echo.
goto :eof

REM Main deployment function
:main
REM Default values
set "ENVIRONMENT=development"
set "PLATFORM=manual"
set "RUN_TESTS=false"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse
if "%~1"=="-e" (
    set "ENVIRONMENT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-p" (
    set "PLATFORM=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-t" (
    set "RUN_TESTS=true"
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    call :show_help
    exit /b 0
)
echo %RED%[ERROR]%NC% Unknown option: %~1
call :show_help
exit /b 1

:end_parse
call :print_status "Starting deployment for environment: %ENVIRONMENT%"
call :print_status "Deployment platform: %PLATFORM%"

REM Check prerequisites
call :check_prerequisites
if %errorlevel% neq 0 exit /b 1

REM Install dependencies
call :install_dependencies
if %errorlevel% neq 0 exit /b 1

REM Generate Prisma client
call :generate_prisma_client
if %errorlevel% neq 0 exit /b 1

REM Run database migrations
call :run_migrations
if %errorlevel% neq 0 exit /b 1

REM Run tests if requested
if "%RUN_TESTS%"=="true" (
    call :run_tests
    if %errorlevel% neq 0 exit /b 1
)

REM Build application
call :build_application
if %errorlevel% neq 0 exit /b 1

REM Deploy based on platform
if "%PLATFORM%"=="vercel" (
    call :deploy_vercel
    if %errorlevel% neq 0 exit /b 1
) else if "%PLATFORM%"=="docker" (
    call :deploy_docker
    if %errorlevel% neq 0 exit /b 1
) else if "%PLATFORM%"=="manual" (
    call :deploy_manual
    if %errorlevel% neq 0 exit /b 1
) else (
    call :print_error "Unknown platform: %PLATFORM%"
    exit /b 1
)

call :print_success "Deployment completed successfully!"
goto :eof

REM Run main function
call :main %*
