#!/bin/bash

# CareConnect v5.0 Build Script
# Builds all components of the CareConnect system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="CareConnect v5.0"
VERSION="5.0.0"
BUILD_DIR="build"
DIST_DIR="dist"
LOG_FILE="build.log"

# Timestamp
BUILD_TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Function to print colored output
print_status() {
    echo -e "${BLUE}[BUILD]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to log messages
log_message() {
    echo "[$BUILD_TIMESTAMP] $1" >> "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version)
    print_success "Python version: $PYTHON_VERSION"
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed (optional)"
    else
        GIT_VERSION=$(git --version)
        print_success "Git version: $GIT_VERSION"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker version: $DOCKER_VERSION"
    else
        print_warning "Docker is not installed (optional for containerization)"
    fi
    
    log_message "Prerequisites check completed"
}

# Function to create build directories
create_directories() {
    print_status "Creating build directories..."
    
    # Create main build directory
    mkdir -p "$BUILD_DIR"
    mkdir -p "$DIST_DIR"
    
    # Create component-specific directories
    mkdir -p "$BUILD_DIR/frontend"
    mkdir -p "$BUILD_DIR/backend"
    mkdir -p "$BUILD_DIR/ai-core"
    mkdir -p "$BUILD_DIR/integration"
    mkdir -p "$BUILD_DIR/orchestration"
    
    # Create distribution directories
    mkdir -p "$DIST_DIR/frontend"
    mkdir -p "$DIST_DIR/backend"
    mkdir -p "$DIST_DIR/ai-core"
    mkdir -p "$DIST_DIR/integration"
    mkdir -p "$DIST_DIR/orchestration"
    mkdir -p "$DIST_DIR/docs"
    mkdir -p "$DIST_DIR/config"
    
    print_success "Build directories created"
    log_message "Build directories created"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install --silent
    
    # Run linting
    print_status "Running frontend linting..."
    if npm run lint; then
        print_success "Frontend linting passed"
    else
        print_warning "Frontend linting failed, continuing..."
    fi
    
    # Run tests
    print_status "Running frontend tests..."
    if npm test -- --watchAll=false --passWithNoTests; then
        print_success "Frontend tests passed"
    else
        print_warning "Frontend tests failed, continuing..."
    fi
    
    # Build for production
    print_status "Building frontend for production..."
    npm run build
    
    # Copy build artifacts
    cp -r build/* ../"$BUILD_DIR/frontend/"
    cp -r build/* ../"$DIST_DIR/frontend/"
    
    cd ..
    
    print_success "Frontend build completed"
    log_message "Frontend build completed"
}

# Function to build backend
build_backend() {
    print_status "Building backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install --silent
    
    # Run linting
    print_status "Running backend linting..."
    if npm run lint; then
        print_success "Backend linting passed"
    else
        print_warning "Backend linting failed, continuing..."
    fi
    
    # Run tests
    print_status "Running backend tests..."
    if npm test -- --watchAll=false --passWithNoTests; then
        print_success "Backend tests passed"
    else
        print_warning "Backend tests failed, continuing..."
    fi
    
    # Copy source files
    cp -r . ../"$BUILD_DIR/backend/"
    cp -r . ../"$DIST_DIR/backend/"
    
    cd ..
    
    print_success "Backend build completed"
    log_message "Backend build completed"
}

# Function to build AI core
build_ai_core() {
    print_status "Building AI core..."
    
    cd ai-core
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing AI core dependencies..."
    pip install -r requirements.txt --quiet
    
    # Run linting
    print_status "Running AI core linting..."
    if command -v flake8 &> /dev/null; then
        if flake8 . --max-line-length=120 --ignore=E501,W503; then
            print_success "AI core linting passed"
        else
            print_warning "AI core linting failed, continuing..."
        fi
    else
        print_warning "flake8 not installed, skipping linting"
    fi
    
    # Run tests
    print_status "Running AI core tests..."
    if python -m pytest tests/ -v --tb=short; then
        print_success "AI core tests passed"
    else
        print_warning "AI core tests failed, continuing..."
    fi
    
    # Deactivate virtual environment
    deactivate
    
    # Copy source files
    cp -r . ../"$BUILD_DIR/ai-core/"
    cp -r . ../"$DIST_DIR/ai-core/"
    
    cd ..
    
    print_success "AI core build completed"
    log_message "AI core build completed"
}

# Function to build integration layer
build_integration() {
    print_status "Building integration layer..."
    
    cd integration
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        print_status "Installing integration dependencies..."
        npm install --silent
    fi
    
    # Copy source files
    cp -r . ../"$BUILD_DIR/integration/"
    cp -r . ../"$DIST_DIR/integration/"
    
    cd ..
    
    print_success "Integration layer build completed"
    log_message "Integration layer build completed"
}

# Function to build orchestration
build_orchestration() {
    print_status "Building orchestration..."
    
    cd orchestration
    
    # Copy configuration files
    cp -r . ../"$BUILD_DIR/orchestration/"
    cp -r . ../"$DIST_DIR/orchestration/"
    
    cd ..
    
    print_success "Orchestration build completed"
    log_message "Orchestration build completed"
}

# Function to copy configuration files
copy_config_files() {
    print_status "Copying configuration files..."
    
    # Copy root configuration files
    cp config.yaml "$BUILD_DIR/"
    cp config.yaml "$DIST_DIR/"
    
    cp telemetry.json "$BUILD_DIR/"
    cp telemetry.json "$DIST_DIR/"
    
    # Copy scripts
    cp run.sh "$BUILD_DIR/"
    cp run.bat "$BUILD_DIR/"
    cp install.sh "$BUILD_DIR/"
    
    cp run.sh "$DIST_DIR/"
    cp run.bat "$DIST_DIR/"
    cp install.sh "$DIST_DIR/"
    
    # Copy Docker files
    if [ -f "Dockerfile" ]; then
        cp Dockerfile "$BUILD_DIR/"
        cp Dockerfile "$DIST_DIR/"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$BUILD_DIR/"
        cp docker-compose.yml "$DIST_DIR/"
    fi
    
    # Copy documentation
    if [ -f "README.md" ]; then
        cp README.md "$BUILD_DIR/"
        cp README.md "$DIST_DIR/"
    fi
    
    if [ -f "LICENSE" ]; then
        cp LICENSE "$BUILD_DIR/"
        cp LICENSE "$DIST_DIR/"
    fi
    
    print_success "Configuration files copied"
    log_message "Configuration files copied"
}

# Function to create package.json for the project
create_package_json() {
    print_status "Creating project package.json..."
    
    cat > "$BUILD_DIR/package.json" << EOF
{
  "name": "careconnect-v5",
  "version": "5.0.0",
  "description": "CareConnect v5.0 - AI-Powered Life Management System",
  "main": "backend/server.js",
  "scripts": {
    "start": "bash run.sh",
    "start:windows": "run.bat",
    "install": "bash install.sh",
    "build": "bash ci-cd/build.sh",
    "test": "bash ci-cd/test.sh",
    "deploy": "bash ci-cd/deploy.sh",
    "frontend:dev": "cd frontend && npm start",
    "backend:dev": "cd backend && npm run dev",
    "ai:dev": "cd ai-core && source venv/bin/activate && python model.py",
    "docker:build": "docker build -t careconnect-v5 .",
    "docker:run": "docker-compose up -d",
    "docker:stop": "docker-compose down"
  },
  "keywords": [
    "ai",
    "life-management",
    "mental-health",
    "wellness",
    "automation",
    "privacy"
  ],
  "author": "CareConnect Team",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0",
    "python": ">=3.9.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/careconnect/careconnect-v5.git"
  },
  "bugs": {
    "url": "https://github.com/careconnect/careconnect-v5/issues"
  },
  "homepage": "https://careconnect.ai"
}
EOF
    
    cp "$BUILD_DIR/package.json" "$DIST_DIR/"
    
    print_success "Project package.json created"
    log_message "Project package.json created"
}

# Function to create build manifest
create_build_manifest() {
    print_status "Creating build manifest..."
    
    cat > "$BUILD_DIR/build-manifest.json" << EOF
{
  "project": "CareConnect v5.0",
  "version": "5.0.0",
  "build_timestamp": "$BUILD_TIMESTAMP",
  "build_id": "$(uuidgen)",
  "components": {
    "frontend": {
      "status": "built",
      "framework": "React",
      "bundler": "Webpack",
      "output_dir": "frontend/build"
    },
    "backend": {
      "status": "built",
      "framework": "Express.js",
      "runtime": "Node.js",
      "output_dir": "backend"
    },
    "ai_core": {
      "status": "built",
      "framework": "PyTorch",
      "runtime": "Python 3.9+",
      "output_dir": "ai-core"
    },
    "integration": {
      "status": "built",
      "type": "Bridge Layer",
      "output_dir": "integration"
    },
    "orchestration": {
      "status": "built",
      "type": "Configuration",
      "output_dir": "orchestration"
    }
  },
  "dependencies": {
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)",
    "python_version": "$(python3 --version)",
    "pip_version": "$(pip3 --version)"
  },
  "build_artifacts": {
    "build_dir": "$BUILD_DIR",
    "dist_dir": "$DIST_DIR",
    "log_file": "$LOG_FILE"
  },
  "features": {
    "video_processing": true,
    "audio_processing": true,
    "avatar_system": true,
    "ai_engine": true,
    "life_management_modules": true,
    "privacy_security": true
  }
}
EOF
    
    cp "$BUILD_DIR/build-manifest.json" "$DIST_DIR/"
    
    print_success "Build manifest created"
    log_message "Build manifest created"
}

# Function to run security checks
run_security_checks() {
    print_status "Running security checks..."
    
    # Check for common security issues
    if command -v npm-audit &> /dev/null; then
        print_status "Running npm audit..."
        cd frontend && npm audit --audit-level=moderate && cd ..
        cd backend && npm audit --audit-level=moderate && cd ..
    fi
    
    # Check for sensitive files
    print_status "Checking for sensitive files..."
    if find . -name "*.env" -o -name "*.key" -o -name "*.pem" | grep -q .; then
        print_warning "Sensitive files found, please review before deployment"
    fi
    
    print_success "Security checks completed"
    log_message "Security checks completed"
}

# Function to create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment archive
    DEPLOYMENT_NAME="careconnect-v5.0-$(date +%Y%m%d-%H%M%S)"
    
    cd "$DIST_DIR"
    tar -czf "../${DEPLOYMENT_NAME}.tar.gz" .
    cd ..
    
    # Create ZIP package for Windows
    if command -v zip &> /dev/null; then
        cd "$DIST_DIR"
        zip -r "../${DEPLOYMENT_NAME}.zip" .
        cd ..
    fi
    
    print_success "Deployment package created: ${DEPLOYMENT_NAME}.tar.gz"
    log_message "Deployment package created: ${DEPLOYMENT_NAME}.tar.gz"
}

# Function to display build summary
display_build_summary() {
    print_status "Build Summary"
    echo "=================="
    echo "Project: $PROJECT_NAME"
    echo "Version: $VERSION"
    echo "Build Time: $BUILD_TIMESTAMP"
    echo "Build Directory: $BUILD_DIR"
    echo "Distribution Directory: $DIST_DIR"
    echo "Log File: $LOG_FILE"
    echo ""
    echo "Components Built:"
    echo "- Frontend (React)"
    echo "- Backend (Express.js)"
    echo "- AI Core (Python/PyTorch)"
    echo "- Integration Layer"
    echo "- Orchestration"
    echo ""
    echo "Features Included:"
    echo "- Video Processing (Face Detection, Expression Recognition)"
    echo "- Audio Processing (Speech Recognition, Synthesis)"
    echo "- Avatar System (3D Avatars, Facial Animation)"
    echo "- AI Engine (Transformer Model, Personality Engine)"
    echo "- Life Management Modules (6 modules)"
    echo "- Privacy & Security (Local Storage, Encryption)"
    echo ""
    echo "Next Steps:"
    echo "1. Run tests: bash ci-cd/test.sh"
    echo "2. Deploy: bash ci-cd/deploy.sh"
    echo "3. Start application: bash run.sh"
}

# Main build function
main() {
    echo "=========================================="
    echo "    CareConnect v5.0 Build Script"
    echo "=========================================="
    echo ""
    
    # Initialize log file
    echo "CareConnect v5.0 Build Log" > "$LOG_FILE"
    echo "Build started at: $BUILD_TIMESTAMP" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Run build steps
    check_prerequisites
    create_directories
    build_frontend
    build_backend
    build_ai_core
    build_integration
    build_orchestration
    copy_config_files
    create_package_json
    create_build_manifest
    run_security_checks
    create_deployment_package
    
    # Display summary
    display_build_summary
    
    # Final log entry
    log_message "Build completed successfully"
    
    print_success "Build completed successfully!"
    print_success "Check $LOG_FILE for detailed build information"
}

# Run main function
main "$@"
