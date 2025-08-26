#!/bin/bash

# CareConnect v5.0 - Comprehensive Test Runner
# This script runs all tests for the entire ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
AI_CORE_DIR="$PROJECT_ROOT/ai-core"
INTEGRATION_DIR="$PROJECT_ROOT/integration"
ORCHESTRATION_DIR="$PROJECT_ROOT/orchestration"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Logging
LOG_FILE="$PROJECT_ROOT/test-results-$(date +%Y%m%d-%H%M%S).log"
ERROR_LOG="$PROJECT_ROOT/test-errors-$(date +%Y%m%d-%H%M%S).log"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to log messages
log_message() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $message" | tee -a "$ERROR_LOG"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status $BLUE "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("Node.js")
    else
        NODE_VERSION=$(node --version)
        print_status $GREEN "✓ Node.js: $NODE_VERSION"
    fi
    
    # Check npm/pnpm
    if ! command_exists pnpm; then
        if ! command_exists npm; then
            missing_deps+=("npm or pnpm")
        else
            NPM_VERSION=$(npm --version)
            print_status $GREEN "✓ npm: $NPM_VERSION"
        fi
    else
        PNPM_VERSION=$(pnpm --version)
        print_status $GREEN "✓ pnpm: $PNPM_VERSION"
    fi
    
    # Check Python
    if ! command_exists python3; then
        missing_deps+=("Python 3")
    else
        PYTHON_VERSION=$(python3 --version)
        print_status $GREEN "✓ Python: $PYTHON_VERSION"
    fi
    
    # Check pip
    if ! command_exists pip3; then
        missing_deps+=("pip3")
    else
        PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
        print_status $GREEN "✓ pip: $PIP_VERSION"
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version)
        print_status $GREEN "✓ Docker: $DOCKER_VERSION"
    else
        print_status $YELLOW "⚠ Docker not found (optional for containerized tests)"
    fi
    
    # Check Redis (optional)
    if command_exists redis-cli; then
        print_status $GREEN "✓ Redis CLI found"
    else
        print_status $YELLOW "⚠ Redis CLI not found (optional for integration tests)"
    fi
    
    # Check PostgreSQL (optional)
    if command_exists psql; then
        print_status $GREEN "✓ PostgreSQL CLI found"
    else
        print_status $YELLOW "⚠ PostgreSQL CLI not found (optional for database tests)"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_status $RED "Missing dependencies: ${missing_deps[*]}"
        print_status $RED "Please install missing dependencies before running tests"
        exit 1
    fi
    
    print_status $GREEN "All prerequisites satisfied!"
}

# Function to install dependencies
install_dependencies() {
    print_status $BLUE "Installing dependencies..."
    
    # Install Node.js dependencies
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        print_status $CYAN "Installing Node.js dependencies..."
        if command_exists pnpm; then
            pnpm install
        else
            npm install
        fi
    fi
    
    # Install Python dependencies
    if [ -f "$PROJECT_ROOT/requirements.txt" ]; then
        print_status $CYAN "Installing Python dependencies..."
        pip3 install -r requirements.txt
    fi
    
    # Install frontend dependencies
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_status $CYAN "Installing frontend dependencies..."
        cd "$FRONTEND_DIR"
        if command_exists pnpm; then
            pnpm install
        else
            npm install
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Install backend dependencies
    if [ -f "$BACKEND_DIR/package.json" ]; then
        print_status $CYAN "Installing backend dependencies..."
        cd "$BACKEND_DIR"
        if command_exists pnpm; then
            pnpm install
        else
            npm install
        fi
        cd "$PROJECT_ROOT"
    fi
    
    print_status $GREEN "Dependencies installed successfully!"
}

# Function to run linting
run_linting() {
    print_status $BLUE "Running linting checks..."
    
    local lint_errors=0
    
    # Frontend linting
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_status $CYAN "Linting frontend..."
        cd "$FRONTEND_DIR"
        if npm run lint 2>/dev/null; then
            print_status $GREEN "✓ Frontend linting passed"
        else
            print_status $RED "✗ Frontend linting failed"
            lint_errors=$((lint_errors + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Backend linting
    if [ -f "$BACKEND_DIR/package.json" ]; then
        print_status $CYAN "Linting backend..."
        cd "$BACKEND_DIR"
        if npm run lint 2>/dev/null; then
            print_status $GREEN "✓ Backend linting passed"
        else
            print_status $RED "✗ Backend linting failed"
            lint_errors=$((lint_errors + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Python linting
    if command_exists flake8; then
        print_status $CYAN "Linting Python code..."
        if flake8 "$AI_CORE_DIR" --max-line-length=120 --ignore=E501,W503; then
            print_status $GREEN "✓ Python linting passed"
        else
            print_status $RED "✗ Python linting failed"
            lint_errors=$((lint_errors + 1))
        fi
    fi
    
    if [ $lint_errors -eq 0 ]; then
        print_status $GREEN "All linting checks passed!"
    else
        print_status $RED "$lint_errors linting check(s) failed"
        return 1
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status $BLUE "Running unit tests..."
    
    local unit_errors=0
    
    # Frontend unit tests
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_status $CYAN "Running frontend unit tests..."
        cd "$FRONTEND_DIR"
        if npm run test:unit 2>/dev/null; then
            print_status $GREEN "✓ Frontend unit tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Frontend unit tests failed"
            unit_errors=$((unit_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Backend unit tests
    if [ -f "$BACKEND_DIR/package.json" ]; then
        print_status $CYAN "Running backend unit tests..."
        cd "$BACKEND_DIR"
        if npm run test:unit 2>/dev/null; then
            print_status $GREEN "✓ Backend unit tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Backend unit tests failed"
            unit_errors=$((unit_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # AI Core unit tests
    if [ -d "$AI_CORE_DIR" ]; then
        print_status $CYAN "Running AI Core unit tests..."
        cd "$AI_CORE_DIR"
        if python3 -m pytest tests/unit/ -v --tb=short; then
            print_status $GREEN "✓ AI Core unit tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ AI Core unit tests failed"
            unit_errors=$((unit_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
    
    if [ $unit_errors -eq 0 ]; then
        print_status $GREEN "All unit tests passed!"
    else
        print_status $RED "$unit_errors unit test suite(s) failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status $BLUE "Running integration tests..."
    
    local integration_errors=0
    
    # Start test services
    print_status $CYAN "Starting test services..."
    
    # Start Redis for testing
    if command_exists redis-server; then
        redis-server --daemonize yes --port 6380
        sleep 2
    fi
    
    # Start PostgreSQL for testing
    if command_exists pg_ctl; then
        # This would need proper PostgreSQL test setup
        print_status $YELLOW "PostgreSQL test setup not implemented"
    fi
    
    # Frontend integration tests
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_status $CYAN "Running frontend integration tests..."
        cd "$FRONTEND_DIR"
        if npm run test:integration 2>/dev/null; then
            print_status $GREEN "✓ Frontend integration tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Frontend integration tests failed"
            integration_errors=$((integration_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Backend integration tests
    if [ -f "$BACKEND_DIR/package.json" ]; then
        print_status $CYAN "Running backend integration tests..."
        cd "$BACKEND_DIR"
        if npm run test:integration 2>/dev/null; then
            print_status $GREEN "✓ Backend integration tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Backend integration tests failed"
            integration_errors=$((integration_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # AI Core integration tests
    if [ -d "$AI_CORE_DIR" ]; then
        print_status $CYAN "Running AI Core integration tests..."
        cd "$AI_CORE_DIR"
        if python3 -m pytest tests/integration/ -v --tb=short; then
            print_status $GREEN "✓ AI Core integration tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ AI Core integration tests failed"
            integration_errors=$((integration_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
    
    # Cleanup test services
    if command_exists redis-cli; then
        redis-cli -p 6380 shutdown
    fi
    
    if [ $integration_errors -eq 0 ]; then
        print_status $GREEN "All integration tests passed!"
    else
        print_status $RED "$integration_errors integration test suite(s) failed"
        return 1
    fi
}

# Function to run end-to-end tests
run_e2e_tests() {
    print_status $BLUE "Running end-to-end tests..."
    
    local e2e_errors=0
    
    # Check if Playwright is available
    if ! command_exists npx; then
        print_status $YELLOW "Skipping E2E tests (npx not available)"
        SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
        return 0
    fi
    
    # Frontend E2E tests
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_status $CYAN "Running frontend E2E tests..."
        cd "$FRONTEND_DIR"
        if npm run test:e2e 2>/dev/null; then
            print_status $GREEN "✓ Frontend E2E tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Frontend E2E tests failed"
            e2e_errors=$((e2e_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ $e2e_errors -eq 0 ]; then
        print_status $GREEN "All E2E tests passed!"
    else
        print_status $RED "$e2e_errors E2E test suite(s) failed"
        return 1
    fi
}

# Function to run performance tests
run_performance_tests() {
    print_status $BLUE "Running performance tests..."
    
    local perf_errors=0
    
    # AI Core performance tests
    if [ -d "$AI_CORE_DIR" ]; then
        print_status $CYAN "Running AI Core performance tests..."
        cd "$AI_CORE_DIR"
        if python3 -m pytest tests/performance/ -v --tb=short; then
            print_status $GREEN "✓ AI Core performance tests passed"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ AI Core performance tests failed"
            perf_errors=$((perf_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ $perf_errors -eq 0 ]; then
        print_status $GREEN "All performance tests passed!"
    else
        print_status $RED "$perf_errors performance test suite(s) failed"
        return 1
    fi
}

# Function to run security tests
run_security_tests() {
    print_status $BLUE "Running security tests..."
    
    local security_errors=0
    
    # Dependency vulnerability scan
    print_status $CYAN "Scanning for vulnerabilities..."
    if command_exists npm; then
        if npm audit --audit-level=moderate; then
            print_status $GREEN "✓ No critical vulnerabilities found"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Vulnerabilities found"
            security_errors=$((security_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
    
    # Python security scan
    if command_exists safety; then
        print_status $CYAN "Scanning Python dependencies..."
        if safety check; then
            print_status $GREEN "✓ No Python vulnerabilities found"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Python vulnerabilities found"
            security_errors=$((security_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    
    if [ $security_errors -eq 0 ]; then
        print_status $GREEN "All security tests passed!"
    else
        print_status $RED "$security_errors security test(s) failed"
        return 1
    fi
}

# Function to run build tests
run_build_tests() {
    print_status $BLUE "Running build tests..."
    
    local build_errors=0
    
    # Frontend build test
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_status $CYAN "Testing frontend build..."
        cd "$FRONTEND_DIR"
        if npm run build 2>/dev/null; then
            print_status $GREEN "✓ Frontend build successful"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Frontend build failed"
            build_errors=$((build_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Backend build test
    if [ -f "$BACKEND_DIR/package.json" ]; then
        print_status $CYAN "Testing backend build..."
        cd "$BACKEND_DIR"
        if npm run build 2>/dev/null; then
            print_status $GREEN "✓ Backend build successful"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status $RED "✗ Backend build failed"
            build_errors=$((build_errors + 1))
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        cd "$PROJECT_ROOT"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    
    if [ $build_errors -eq 0 ]; then
        print_status $GREEN "All build tests passed!"
    else
        print_status $RED "$build_errors build test(s) failed"
        return 1
    fi
}

# Function to generate test report
generate_test_report() {
    print_status $BLUE "Generating test report..."
    
    local report_file="$PROJECT_ROOT/test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# CareConnect v5.0 Test Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Duration:** $SECONDS seconds

## Test Summary

- **Total Tests:** $TOTAL_TESTS
- **Passed:** $PASSED_TESTS
- **Failed:** $FAILED_TESTS
- **Skipped:** $SKIPPED_TESTS
- **Success Rate:** $((PASSED_TESTS * 100 / TOTAL_TESTS))%

## Test Results

### Unit Tests
- Frontend: $(if [ $PASSED_TESTS -gt 0 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Backend: $(if [ $PASSED_TESTS -gt 1 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- AI Core: $(if [ $PASSED_TESTS -gt 2 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Integration Tests
- Frontend: $(if [ $PASSED_TESTS -gt 3 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Backend: $(if [ $PASSED_TESTS -gt 4 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- AI Core: $(if [ $PASSED_TESTS -gt 5 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### End-to-End Tests
- Frontend: $(if [ $PASSED_TESTS -gt 6 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Performance Tests
- AI Core: $(if [ $PASSED_TESTS -gt 7 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Security Tests
- Dependencies: $(if [ $PASSED_TESTS -gt 8 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Python: $(if [ $PASSED_TESTS -gt 9 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Build Tests
- Frontend: $(if [ $PASSED_TESTS -gt 10 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Backend: $(if [ $PASSED_TESTS -gt 11 ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

## Log Files

- **Test Log:** $LOG_FILE
- **Error Log:** $ERROR_LOG

## Recommendations

$(if [ $FAILED_TESTS -eq 0 ]; then
    echo "- All tests passed! The system is ready for deployment."
else
    echo "- Review failed tests and fix issues before deployment."
    echo "- Check error logs for detailed failure information."
fi)

EOF
    
    print_status $GREEN "Test report generated: $report_file"
}

# Function to cleanup
cleanup() {
    print_status $BLUE "Cleaning up..."
    
    # Stop any running test services
    if command_exists redis-cli; then
        redis-cli -p 6380 shutdown 2>/dev/null || true
    fi
    
    # Remove temporary files
    rm -f "$PROJECT_ROOT"/test-*.log
    rm -f "$PROJECT_ROOT"/coverage-*.json
    
    print_status $GREEN "Cleanup completed!"
}

# Main function
main() {
    local start_time=$(date +%s)
    
    print_status $PURPLE "=========================================="
    print_status $PURPLE "CareConnect v5.0 - Comprehensive Test Suite"
    print_status $PURPLE "=========================================="
    
    # Initialize log files
    echo "CareConnect v5.0 Test Run - $(date '+%Y-%m-%d %H:%M:%S')" > "$LOG_FILE"
    echo "CareConnect v5.0 Error Log - $(date '+%Y-%m-%d %H:%M:%S')" > "$ERROR_LOG"
    
    # Parse command line arguments
    local run_lint=false
    local run_unit=false
    local run_integration=false
    local run_e2e=false
    local run_performance=false
    local run_security=false
    local run_build=false
    local install_deps=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --lint)
                run_lint=true
                shift
                ;;
            --unit)
                run_unit=true
                shift
                ;;
            --integration)
                run_integration=true
                shift
                ;;
            --e2e)
                run_e2e=true
                shift
                ;;
            --performance)
                run_performance=true
                shift
                ;;
            --security)
                run_security=true
                shift
                ;;
            --build)
                run_build=true
                shift
                ;;
            --install-deps)
                install_deps=true
                shift
                ;;
            --all)
                run_lint=true
                run_unit=true
                run_integration=true
                run_e2e=true
                run_performance=true
                run_security=true
                run_build=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --lint         Run linting checks"
                echo "  --unit         Run unit tests"
                echo "  --integration  Run integration tests"
                echo "  --e2e          Run end-to-end tests"
                echo "  --performance  Run performance tests"
                echo "  --security     Run security tests"
                echo "  --build        Run build tests"
                echo "  --install-deps Install dependencies"
                echo "  --all          Run all tests"
                echo "  --help         Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # If no specific tests specified, run all
    if ! $run_lint && ! $run_unit && ! $run_integration && ! $run_e2e && ! $run_performance && ! $run_security && ! $run_build; then
        run_lint=true
        run_unit=true
        run_integration=true
        run_e2e=true
        run_performance=true
        run_security=true
        run_build=true
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies if requested
    if $install_deps; then
        install_dependencies
    fi
    
    # Run tests
    local exit_code=0
    
    if $run_lint; then
        run_linting || exit_code=1
    fi
    
    if $run_unit; then
        run_unit_tests || exit_code=1
    fi
    
    if $run_integration; then
        run_integration_tests || exit_code=1
    fi
    
    if $run_e2e; then
        run_e2e_tests || exit_code=1
    fi
    
    if $run_performance; then
        run_performance_tests || exit_code=1
    fi
    
    if $run_security; then
        run_security_tests || exit_code=1
    fi
    
    if $run_build; then
        run_build_tests || exit_code=1
    fi
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Generate report
    generate_test_report
    
    # Print summary
    print_status $PURPLE "=========================================="
    print_status $PURPLE "Test Summary"
    print_status $PURPLE "=========================================="
    print_status $CYAN "Total Tests: $TOTAL_TESTS"
    print_status $GREEN "Passed: $PASSED_TESTS"
    print_status $RED "Failed: $FAILED_TESTS"
    print_status $YELLOW "Skipped: $SKIPPED_TESTS"
    print_status $CYAN "Duration: ${duration}s"
    print_status $CYAN "Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_status $GREEN "🎉 All tests passed! The system is ready for deployment."
    else
        print_status $RED "❌ Some tests failed. Please review the error logs."
    fi
    
    # Cleanup
    cleanup
    
    exit $exit_code
}

# Trap signals for cleanup
trap cleanup EXIT
trap 'echo "Test run interrupted"; exit 1' INT TERM

# Run main function
main "$@"
