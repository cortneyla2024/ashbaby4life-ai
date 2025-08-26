@echo off
REM Hope: The Steward - Setup Script for Windows
REM This script helps set up the development environment

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

REM Function to check Node.js version
:check_node_version
call :print_status "Checking Node.js version..."
node --version > temp_version.txt 2>&1
if %errorlevel% neq 0 (
    call :print_error "Node.js is not installed"
    goto :install_node
)

for /f "tokens=*" %%i in (temp_version.txt) do set "node_version=%%i"
del temp_version.txt

REM Extract version number (remove 'v' prefix)
set "node_version=!node_version:v=!"

REM Check if version is 18 or higher
for /f "tokens=1 delims=." %%a in ("!node_version!") do set "major_version=%%a"
if !major_version! lss 18 (
    call :print_warning "Node.js version !node_version! is below 18. Recommended: Node.js 18+"
    set /p "continue=Continue anyway? (y/N): "
    if /i not "!continue!"=="y" goto :install_node
) else (
    call :print_success "Node.js version !node_version! is compatible"
)
goto :eof

REM Function to install Node.js
:install_node
call :print_status "Installing Node.js..."
call :print_warning "Please install Node.js 18+ from https://nodejs.org/"
call :print_warning "After installation, run this script again"
pause
exit /b 1

REM Function to install pnpm
:install_pnpm
call :print_status "Installing pnpm..."
npm install -g pnpm
if %errorlevel% neq 0 (
    call :print_error "Failed to install pnpm"
    exit /b 1
)
call :print_success "pnpm installed successfully"
goto :eof

REM Function to install Git
:install_git
call :print_status "Installing Git..."
call :print_warning "Please install Git from https://git-scm.com/"
call :print_warning "After installation, run this script again"
pause
exit /b 1

REM Function to create environment file
:create_env_file
call :print_status "Creating environment file..."

if not exist "apps\web\.env.local" (
    copy "apps\web\env.example" "apps\web\.env.local"
    call :print_success "Environment file created at apps\web\.env.local"
    call :print_warning "Please edit apps\web\.env.local with your configuration"
) else (
    call :print_status "Environment file already exists"
)
goto :eof

REM Function to install dependencies
:install_dependencies
call :print_status "Installing dependencies..."
pnpm install
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

REM Function to set up database
:setup_database
call :print_status "Setting up database..."

echo.
echo Choose database setup option:
echo 1. SQLite (recommended for development)
echo 2. PostgreSQL (requires local installation)
echo 3. Skip database setup
echo.
set /p "db_choice=Enter your choice (1-3): "

if "!db_choice!"=="1" (
    call :setup_sqlite
) else if "!db_choice!"=="2" (
    call :setup_postgresql
) else if "!db_choice!"=="3" (
    call :print_warning "Skipping database setup"
    goto :eof
) else (
    call :print_error "Invalid choice"
    goto :setup_database
)
goto :eof

REM Function to set up SQLite
:setup_sqlite
call :print_status "Setting up SQLite database..."
pnpm db:push
if %errorlevel% neq 0 (
    call :print_error "Failed to set up SQLite database"
    exit /b 1
)
call :print_success "SQLite database set up successfully"
goto :eof

REM Function to set up PostgreSQL
:setup_postgresql
call :print_status "Setting up PostgreSQL database..."
call :print_warning "Please ensure PostgreSQL is running and accessible"
call :print_warning "Update DATABASE_URL in apps\web\.env.local if needed"
pnpm db:push
if %errorlevel% neq 0 (
    call :print_error "Failed to set up PostgreSQL database"
    call :print_warning "Please check your PostgreSQL connection and try again"
    exit /b 1
)
call :print_success "PostgreSQL database set up successfully"
goto :eof

REM Function to start development server
:start_dev_server
call :print_status "Starting development server..."
call :print_success "Hope: The Steward is starting up!"
call :print_status "Open http://localhost:3000 in your browser"
echo.
pnpm dev
goto :eof

REM Function to show help
:show_help
echo Hope: The Steward - Setup Script
echo.
echo This script helps set up the development environment for Hope: The Steward.
echo.
echo Prerequisites:
echo - Node.js 18+
echo - Git
echo - pnpm (will be installed automatically)
echo.
echo The script will:
echo 1. Check and install prerequisites
echo 2. Create environment configuration
echo 3. Install dependencies
echo 4. Set up database
echo 5. Start development server
echo.
goto :eof

REM Main setup function
:main
echo.
echo %GREEN%========================================%NC%
echo %GREEN%  Hope: The Steward - Setup Script%NC%
echo %GREEN%========================================%NC%
echo.

REM Check for help flag
if "%~1"=="-h" (
    call :show_help
    exit /b 0
)

REM Check prerequisites
call :print_status "Checking prerequisites..."

REM Check Node.js
call :command_exists node
if "!exists!"=="false" (
    call :print_error "Node.js is not installed"
    goto :install_node
)
call :check_node_version
if %errorlevel% neq 0 exit /b 1

REM Check Git
call :command_exists git
if "!exists!"=="false" (
    call :print_error "Git is not installed"
    goto :install_git
)

REM Check pnpm
call :command_exists pnpm
if "!exists!"=="false" (
    call :install_pnpm
    if %errorlevel% neq 0 exit /b 1
)

call :print_success "All prerequisites are satisfied"
echo.

REM Create environment file
call :create_env_file
echo.

REM Install dependencies
call :install_dependencies
echo.

REM Generate Prisma client
call :generate_prisma_client
echo.

REM Set up database
call :setup_database
echo.

REM Final instructions
call :print_success "Setup completed successfully!"
echo.
echo %GREEN%Next steps:%NC%
echo 1. Edit apps\web\.env.local with your configuration
echo 2. Run 'pnpm dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo %GREEN%Useful commands:%NC%
echo - pnpm dev          # Start development server
echo - pnpm build        # Build for production
echo - pnpm test         # Run tests
echo - pnpm db:studio    # Open Prisma Studio
echo.

REM Ask if user wants to start the development server
set /p "start_server=Start development server now? (Y/n): "
if /i not "!start_server!"=="n" (
    call :start_dev_server
)

goto :eof

REM Run main function
call :main %*
