#!/bin/bash

# Comprehensive Test Runner for Hope Platform
# This script runs all types of tests with proper reporting and coverage

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COVERAGE_DIR="$PROJECT_ROOT/coverage"
TEST_RESULTS_DIR="$PROJECT_ROOT/test-results"
PLAYWRIGHT_REPORT_DIR="$PROJECT_ROOT/playwright-report"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$PROJECT_ROOT/test-logs/test-run-${TIMESTAMP}.log"

# Create necessary directories
mkdir -p "$COVERAGE_DIR"
mkdir -p "$TEST_RESULTS_DIR"
mkdir -p "$PLAYWRIGHT_REPORT_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies if needed
install_dependencies() {
    print_status "Checking and installing dependencies..."
    
    if ! command_exists pnpm; then
        print_warning "pnpm not found. Installing pnpm..."
        npm install -g pnpm
    fi
    
    if ! command_exists node; then
        print_error "Node.js is required but not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Install project dependencies
    print_status "Installing project dependencies..."
    pnpm install
    
    # Install Playwright browsers if not already installed
    if [ ! -d "$PROJECT_ROOT/node_modules/.cache/playwright" ]; then
        print_status "Installing Playwright browsers..."
        npx playwright install
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    local exit_code=0
    
    # Run unit tests for main project
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        print_status "Running main project unit tests..."
        cd "$PROJECT_ROOT"
        pnpm test:unit --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    # Run unit tests for web app
    if [ -f "$PROJECT_ROOT/apps/web/package.json" ]; then
        print_status "Running web app unit tests..."
        cd "$PROJECT_ROOT/apps/web"
        pnpm test:unit --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    # Run unit tests for AI superplatform
    if [ -f "$PROJECT_ROOT/Ai-superplatform-master/package.json" ]; then
        print_status "Running AI superplatform unit tests..."
        cd "$PROJECT_ROOT/Ai-superplatform-master"
        pnpm test:unit --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    return $exit_code
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    local exit_code=0
    
    # Run integration tests for main project
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        print_status "Running main project integration tests..."
        cd "$PROJECT_ROOT"
        pnpm test:integration --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    # Run integration tests for web app
    if [ -f "$PROJECT_ROOT/apps/web/package.json" ]; then
        print_status "Running web app integration tests..."
        cd "$PROJECT_ROOT/apps/web"
        pnpm test:integration --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    # Run integration tests for AI superplatform
    if [ -f "$PROJECT_ROOT/Ai-superplatform-master/package.json" ]; then
        print_status "Running AI superplatform integration tests..."
        cd "$PROJECT_ROOT/Ai-superplatform-master"
        pnpm test:integration --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    return $exit_code
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    local exit_code=0
    
    # Start development server for E2E tests
    print_status "Starting development server for E2E tests..."
    cd "$PROJECT_ROOT"
    pnpm dev &
    local dev_pid=$!
    
    # Wait for server to start
    sleep 10
    
    # Run E2E tests for web app
    if [ -f "$PROJECT_ROOT/apps/web/package.json" ]; then
        print_status "Running web app E2E tests..."
        cd "$PROJECT_ROOT/apps/web"
        pnpm test:e2e --reporter=html || exit_code=$?
    fi
    
    # Run E2E tests for AI superplatform
    if [ -f "$PROJECT_ROOT/Ai-superplatform-master/package.json" ]; then
        print_status "Running AI superplatform E2E tests..."
        cd "$PROJECT_ROOT/Ai-superplatform-master"
        pnpm test:e2e --reporter=html || exit_code=$?
    fi
    
    # Stop development server
    kill $dev_pid 2>/dev/null || true
    
    return $exit_code
}

# Function to run API tests
run_api_tests() {
    print_status "Running API tests..."
    
    local exit_code=0
    
    # Start backend server for API tests
    print_status "Starting backend server for API tests..."
    cd "$PROJECT_ROOT/backend"
    node server.js &
    local backend_pid=$!
    
    # Wait for server to start
    sleep 5
    
    # Run API tests
    if [ -f "$PROJECT_ROOT/apps/web/package.json" ]; then
        print_status "Running API tests..."
        cd "$PROJECT_ROOT/apps/web"
        pnpm test --testPathPattern="__tests__/api" --coverage --watchAll=false --passWithNoTests || exit_code=$?
    fi
    
    # Stop backend server
    kill $backend_pid 2>/dev/null || true
    
    return $exit_code
}

# Function to run security tests
run_security_tests() {
    print_status "Running security tests..."
    
    local exit_code=0
    
    # Run npm audit
    print_status "Running npm audit..."
    cd "$PROJECT_ROOT"
    pnpm audit || exit_code=$?
    
    # Run security scan with snyk if available
    if command_exists snyk; then
        print_status "Running Snyk security scan..."
        snyk test || exit_code=$?
    else
        print_warning "Snyk not found. Install with: npm install -g snyk"
    fi
    
    return $exit_code
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    local exit_code=0
    
    # Run Lighthouse CI if available
    if command_exists lhci; then
        print_status "Running Lighthouse CI performance tests..."
        lhci autorun || exit_code=$?
    else
        print_warning "Lighthouse CI not found. Install with: npm install -g @lhci/cli"
    fi
    
    return $exit_code
}

# Function to generate test reports
generate_reports() {
    print_status "Generating test reports..."
    
    # Generate coverage report
    if [ -d "$COVERAGE_DIR" ]; then
        print_status "Generating coverage report..."
        cd "$PROJECT_ROOT"
        pnpm test:coverage
    fi
    
    # Generate test summary
    print_status "Generating test summary..."
    {
        echo "Test Run Summary - $(date)"
        echo "========================"
        echo "Timestamp: $TIMESTAMP"
        echo "Coverage Directory: $COVERAGE_DIR"
        echo "Test Results Directory: $TEST_RESULTS_DIR"
        echo "Playwright Report Directory: $PLAYWRIGHT_REPORT_DIR"
        echo "Log File: $LOG_FILE"
    } > "$TEST_RESULTS_DIR/test-summary-${TIMESTAMP}.txt"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Kill any remaining processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node server.js" 2>/dev/null || true
    
    # Remove temporary files
    find "$PROJECT_ROOT" -name "*.tmp" -delete 2>/dev/null || true
}

# Main execution
main() {
    print_status "Starting comprehensive test suite..."
    print_status "Project root: $PROJECT_ROOT"
    print_status "Timestamp: $TIMESTAMP"
    
    # Install dependencies
    install_dependencies
    
    # Initialize exit codes
    local unit_exit_code=0
    local integration_exit_code=0
    local e2e_exit_code=0
    local api_exit_code=0
    local security_exit_code=0
    local performance_exit_code=0
    
    # Run tests
    run_unit_tests || unit_exit_code=$?
    run_integration_tests || integration_exit_code=$?
    run_e2e_tests || e2e_exit_code=$?
    run_api_tests || api_exit_code=$?
    run_security_tests || security_exit_code=$?
    run_performance_tests || performance_exit_code=$?
    
    # Generate reports
    generate_reports
    
    # Cleanup
    cleanup
    
    # Print summary
    print_status "Test run completed!"
    echo ""
    echo "Test Results Summary:"
    echo "===================="
    echo "Unit Tests: $([ $unit_exit_code -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
    echo "Integration Tests: $([ $integration_exit_code -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
    echo "E2E Tests: $([ $e2e_exit_code -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
    echo "API Tests: $([ $api_exit_code -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
    echo "Security Tests: $([ $security_exit_code -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
    echo "Performance Tests: $([ $performance_exit_code -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
    echo ""
    echo "Reports generated in:"
    echo "- Coverage: $COVERAGE_DIR"
    echo "- Test Results: $TEST_RESULTS_DIR"
    echo "- Playwright Reports: $PLAYWRIGHT_REPORT_DIR"
    echo "- Log File: $LOG_FILE"
    
    # Exit with appropriate code
    local total_exit_code=$((unit_exit_code + integration_exit_code + e2e_exit_code + api_exit_code + security_exit_code + performance_exit_code))
    
    if [ $total_exit_code -eq 0 ]; then
        print_success "All tests passed! 🎉"
        exit 0
    else
        print_error "Some tests failed. Check the logs for details."
        exit 1
    fi
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
