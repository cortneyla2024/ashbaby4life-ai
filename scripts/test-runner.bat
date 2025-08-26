@echo off
setlocal enabledelayedexpansion

REM Comprehensive Test Runner for Hope Platform (Windows)
REM This script runs all types of tests with proper reporting and coverage

set "PROJECT_ROOT=%~dp0.."
set "COVERAGE_DIR=%PROJECT_ROOT%\coverage"
set "TEST_RESULTS_DIR=%PROJECT_ROOT%\test-results"
set "PLAYWRIGHT_REPORT_DIR=%PROJECT_ROOT%\playwright-report"
set "TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "LOG_FILE=%PROJECT_ROOT%\test-logs\test-run-%TIMESTAMP%.log"

REM Create necessary directories
if not exist "%COVERAGE_DIR%" mkdir "%COVERAGE_DIR%"
if not exist "%TEST_RESULTS_DIR%" mkdir "%TEST_RESULTS_DIR%"
if not exist "%PLAYWRIGHT_REPORT_DIR%" mkdir "%PLAYWRIGHT_REPORT_DIR%"
if not exist "%PROJECT_ROOT%\test-logs" mkdir "%PROJECT_ROOT%\test-logs"

REM Function to print colored output
:print_status
echo [INFO] %~1
echo [INFO] %~1 >> "%LOG_FILE%"
goto :eof

:print_success
echo [SUCCESS] %~1
echo [SUCCESS] %~1 >> "%LOG_FILE%"
goto :eof

:print_warning
echo [WARNING] %~1
echo [WARNING] %~1 >> "%LOG_FILE%"
goto :eof

:print_error
echo [ERROR] %~1
echo [ERROR] %~1 >> "%LOG_FILE%"
goto :eof

REM Function to check if command exists
:command_exists
where %~1 >nul 2>&1
if %errorlevel% equ 0 (
    set "COMMAND_EXISTS=1"
) else (
    set "COMMAND_EXISTS=0"
)
goto :eof

REM Function to install dependencies
:install_dependencies
call :print_status "Checking and installing dependencies..."

call :command_exists pnpm
if "%COMMAND_EXISTS%"=="0" (
    call :print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
)

call :command_exists node
if "%COMMAND_EXISTS%"=="0" (
    call :print_error "Node.js is required but not installed. Please install Node.js 18+ first."
    exit /b 1
)

REM Install project dependencies
call :print_status "Installing project dependencies..."
cd /d "%PROJECT_ROOT%"
call pnpm install

REM Install Playwright browsers if not already installed
if not exist "%PROJECT_ROOT%\node_modules\.cache\playwright" (
    call :print_status "Installing Playwright browsers..."
    call npx playwright install
)
goto :eof

REM Function to run unit tests
:run_unit_tests
call :print_status "Running unit tests..."

set "UNIT_EXIT_CODE=0"

REM Run unit tests for main project
if exist "%PROJECT_ROOT%\package.json" (
    call :print_status "Running main project unit tests..."
    cd /d "%PROJECT_ROOT%"
    call pnpm test:unit --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "UNIT_EXIT_CODE=1"
)

REM Run unit tests for web app
if exist "%PROJECT_ROOT%\apps\web\package.json" (
    call :print_status "Running web app unit tests..."
    cd /d "%PROJECT_ROOT%\apps\web"
    call pnpm test:unit --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "UNIT_EXIT_CODE=1"
)

REM Run unit tests for AI superplatform
if exist "%PROJECT_ROOT%\Ai-superplatform-master\package.json" (
    call :print_status "Running AI superplatform unit tests..."
    cd /d "%PROJECT_ROOT%\Ai-superplatform-master"
    call pnpm test:unit --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "UNIT_EXIT_CODE=1"
)
goto :eof

REM Function to run integration tests
:run_integration_tests
call :print_status "Running integration tests..."

set "INTEGRATION_EXIT_CODE=0"

REM Run integration tests for main project
if exist "%PROJECT_ROOT%\package.json" (
    call :print_status "Running main project integration tests..."
    cd /d "%PROJECT_ROOT%"
    call pnpm test:integration --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "INTEGRATION_EXIT_CODE=1"
)

REM Run integration tests for web app
if exist "%PROJECT_ROOT%\apps\web\package.json" (
    call :print_status "Running web app integration tests..."
    cd /d "%PROJECT_ROOT%\apps\web"
    call pnpm test:integration --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "INTEGRATION_EXIT_CODE=1"
)

REM Run integration tests for AI superplatform
if exist "%PROJECT_ROOT%\Ai-superplatform-master\package.json" (
    call :print_status "Running AI superplatform integration tests..."
    cd /d "%PROJECT_ROOT%\Ai-superplatform-master"
    call pnpm test:integration --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "INTEGRATION_EXIT_CODE=1"
)
goto :eof

REM Function to run E2E tests
:run_e2e_tests
call :print_status "Running E2E tests..."

set "E2E_EXIT_CODE=0"

REM Start development server for E2E tests
call :print_status "Starting development server for E2E tests..."
cd /d "%PROJECT_ROOT%"
start /b pnpm dev

REM Wait for server to start
timeout /t 10 /nobreak >nul

REM Run E2E tests for web app
if exist "%PROJECT_ROOT%\apps\web\package.json" (
    call :print_status "Running web app E2E tests..."
    cd /d "%PROJECT_ROOT%\apps\web"
    call pnpm test:e2e --reporter=html
    if %errorlevel% neq 0 set "E2E_EXIT_CODE=1"
)

REM Run E2E tests for AI superplatform
if exist "%PROJECT_ROOT%\Ai-superplatform-master\package.json" (
    call :print_status "Running AI superplatform E2E tests..."
    cd /d "%PROJECT_ROOT%\Ai-superplatform-master"
    call pnpm test:e2e --reporter=html
    if %errorlevel% neq 0 set "E2E_EXIT_CODE=1"
)

REM Stop development server
taskkill /f /im node.exe >nul 2>&1
goto :eof

REM Function to run API tests
:run_api_tests
call :print_status "Running API tests..."

set "API_EXIT_CODE=0"

REM Start backend server for API tests
call :print_status "Starting backend server for API tests..."
cd /d "%PROJECT_ROOT%\backend"
start /b node server.js

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Run API tests
if exist "%PROJECT_ROOT%\apps\web\package.json" (
    call :print_status "Running API tests..."
    cd /d "%PROJECT_ROOT%\apps\web"
    call pnpm test --testPathPattern="__tests__/api" --coverage --watchAll=false --passWithNoTests
    if %errorlevel% neq 0 set "API_EXIT_CODE=1"
)

REM Stop backend server
taskkill /f /im node.exe >nul 2>&1
goto :eof

REM Function to run security tests
:run_security_tests
call :print_status "Running security tests..."

set "SECURITY_EXIT_CODE=0"

REM Run npm audit
call :print_status "Running npm audit..."
cd /d "%PROJECT_ROOT%"
call pnpm audit
if %errorlevel% neq 0 set "SECURITY_EXIT_CODE=1"

REM Run security scan with snyk if available
call :command_exists snyk
if "%COMMAND_EXISTS%"=="1" (
    call :print_status "Running Snyk security scan..."
    call snyk test
    if %errorlevel% neq 0 set "SECURITY_EXIT_CODE=1"
) else (
    call :print_warning "Snyk not found. Install with: npm install -g snyk"
)
goto :eof

REM Function to run performance tests
:run_performance_tests
call :print_status "Running performance tests..."

set "PERFORMANCE_EXIT_CODE=0"

REM Run Lighthouse CI if available
call :command_exists lhci
if "%COMMAND_EXISTS%"=="1" (
    call :print_status "Running Lighthouse CI performance tests..."
    call lhci autorun
    if %errorlevel% neq 0 set "PERFORMANCE_EXIT_CODE=1"
) else (
    call :print_warning "Lighthouse CI not found. Install with: npm install -g @lhci/cli"
)
goto :eof

REM Function to generate test reports
:generate_reports
call :print_status "Generating test reports..."

REM Generate coverage report
if exist "%COVERAGE_DIR%" (
    call :print_status "Generating coverage report..."
    cd /d "%PROJECT_ROOT%"
    call pnpm test:coverage
)

REM Generate test summary
call :print_status "Generating test summary..."
(
echo Test Run Summary - %date% %time%
echo ========================
echo Timestamp: %TIMESTAMP%
echo Coverage Directory: %COVERAGE_DIR%
echo Test Results Directory: %TEST_RESULTS_DIR%
echo Playwright Report Directory: %PLAYWRIGHT_REPORT_DIR%
echo Log File: %LOG_FILE%
) > "%TEST_RESULTS_DIR%\test-summary-%TIMESTAMP%.txt"
goto :eof

REM Function to clean up
:cleanup
call :print_status "Cleaning up..."

REM Kill any remaining processes
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im next.exe >nul 2>&1

REM Remove temporary files
del /q "%PROJECT_ROOT%\*.tmp" >nul 2>&1
goto :eof

REM Main execution
call :print_status "Starting comprehensive test suite..."
call :print_status "Project root: %PROJECT_ROOT%"
call :print_status "Timestamp: %TIMESTAMP%"

REM Install dependencies
call :install_dependencies
if %errorlevel% neq 0 exit /b 1

REM Initialize exit codes
set "UNIT_EXIT_CODE=0"
set "INTEGRATION_EXIT_CODE=0"
set "E2E_EXIT_CODE=0"
set "API_EXIT_CODE=0"
set "SECURITY_EXIT_CODE=0"
set "PERFORMANCE_EXIT_CODE=0"

REM Run tests
call :run_unit_tests
call :run_integration_tests
call :run_e2e_tests
call :run_api_tests
call :run_security_tests
call :run_performance_tests

REM Generate reports
call :generate_reports

REM Cleanup
call :cleanup

REM Print summary
call :print_status "Test run completed!"
echo.
echo Test Results Summary:
echo ====================
if "%UNIT_EXIT_CODE%"=="0" (
    echo Unit Tests: ✅ PASSED
) else (
    echo Unit Tests: ❌ FAILED
)
if "%INTEGRATION_EXIT_CODE%"=="0" (
    echo Integration Tests: ✅ PASSED
) else (
    echo Integration Tests: ❌ FAILED
)
if "%E2E_EXIT_CODE%"=="0" (
    echo E2E Tests: ✅ PASSED
) else (
    echo E2E Tests: ❌ FAILED
)
if "%API_EXIT_CODE%"=="0" (
    echo API Tests: ✅ PASSED
) else (
    echo API Tests: ❌ FAILED
)
if "%SECURITY_EXIT_CODE%"=="0" (
    echo Security Tests: ✅ PASSED
) else (
    echo Security Tests: ❌ FAILED
)
if "%PERFORMANCE_EXIT_CODE%"=="0" (
    echo Performance Tests: ✅ PASSED
) else (
    echo Performance Tests: ❌ FAILED
)
echo.
echo Reports generated in:
echo - Coverage: %COVERAGE_DIR%
echo - Test Results: %TEST_RESULTS_DIR%
echo - Playwright Reports: %PLAYWRIGHT_REPORT_DIR%
echo - Log File: %LOG_FILE%

REM Calculate total exit code
set /a "TOTAL_EXIT_CODE=%UNIT_EXIT_CODE%+%INTEGRATION_EXIT_CODE%+%E2E_EXIT_CODE%+%API_EXIT_CODE%+%SECURITY_EXIT_CODE%+%PERFORMANCE_EXIT_CODE%"

if %TOTAL_EXIT_CODE% equ 0 (
    call :print_success "All tests passed! 🎉"
    exit /b 0
) else (
    call :print_error "Some tests failed. Check the logs for details."
    exit /b 1
)
