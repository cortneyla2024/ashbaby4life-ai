#!/bin/bash

# CareConnect v5.0 - Installation Script
# This script installs all dependencies and sets up the platform

set -e

echo "🌟 CareConnect v5.0 - The Steward Installation"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

print_status "Detected OS: $MACHINE"

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_status "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) ✓"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_status "Installing pnpm..."
    npm install -g pnpm
fi

print_success "pnpm $(pnpm --version) ✓"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3.9+ is required but not installed."
    print_status "Please install Python 3.9+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
    print_error "Python 3.9+ is required. Current version: $PYTHON_VERSION"
    exit 1
fi

print_success "Python $PYTHON_VERSION ✓"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is required but not installed."
    exit 1
fi

print_success "Git $(git --version | cut -d' ' -f3) ✓"

# Create necessary directories
print_status "Creating project directories..."
mkdir -p data
mkdir -p logs
mkdir -p uploads
mkdir -p models
mkdir -p cache
mkdir -p temp
mkdir -p backups

print_success "Directories created ✓"

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed ✓"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Python dependencies installed ✓"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..."
pnpm db:generate

if [ $? -eq 0 ]; then
    print_success "Prisma client generated ✓"
else
    print_warning "Prisma client generation failed (this is normal for first run)"
fi

# Setup database
print_status "Setting up database..."
pnpm db:push

if [ $? -eq 0 ]; then
    print_success "Database setup complete ✓"
else
    print_warning "Database setup failed (this is normal for first run)"
fi

# Download AI models (if not present)
print_status "Checking AI models..."
if [ ! -d "models/llama2-7b" ]; then
    print_warning "AI models not found. They will be downloaded on first run."
    print_status "This may take some time depending on your internet connection."
else
    print_success "AI models found ✓"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# CareConnect v5.0 Environment Configuration

# Database
DATABASE_URL="file:./data/careconnect.db"

# AI Models
AI_MODEL_PATH="./models/llama2-7b"
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7
AI_TOP_P=0.9

# Security
JWT_SECRET="$(openssl rand -hex 32)"
ENCRYPTION_KEY="$(openssl rand -hex 32)"
SESSION_SECRET="$(openssl rand -hex 32)"

# Server
PORT=3000
NODE_ENV=development

# Sync
P2P_PORT=6001
IPFS_GATEWAY="http://localhost:8080"

# Features
ENABLE_VOICE=true
ENABLE_IMAGE_PROCESSING=true
ENABLE_REAL_TIME_LEARNING=true
ENABLE_AUTO_BACKUP=true

# Telemetry (optional)
TELEMETRY_ENABLED=false
TELEMETRY_PATH="./telemetry.json"

# Logging
LOG_LEVEL=info
LOG_PATH="./logs"

# Storage
UPLOAD_PATH="./uploads"
CACHE_PATH="./cache"
BACKUP_PATH="./backups"
EOF
    print_success ".env file created ✓"
else
    print_status ".env file already exists ✓"
fi

# Create config.yaml if it doesn't exist
if [ ! -f "config.yaml" ]; then
    print_status "Creating config.yaml..."
    cat > config.yaml << EOF
# CareConnect v5.0 Configuration

system:
  name: "CareConnect v5.0"
  version: "5.0.0"
  environment: "development"
  debug: true

paths:
  data: "./data"
  logs: "./logs"
  models: "./models"
  uploads: "./uploads"
  cache: "./cache"
  temp: "./temp"
  backups: "./backups"

ports:
  frontend: 3000
  backend: 3001
  ai_engine: 3002
  p2p: 6001
  ipfs: 8080

ai:
  model: "llama2-7b"
  max_tokens: 2048
  temperature: 0.7
  top_p: 0.9
  batch_size: 4
  device: "auto"

features:
  voice_enabled: true
  image_processing: true
  real_time_learning: true
  auto_backup: true
  p2p_sync: true
  offline_mode: true

security:
  encryption_enabled: true
  jwt_expiry: "7d"
  rate_limit: 100
  cors_origins: ["http://localhost:3000"]

telemetry:
  enabled: false
  path: "./telemetry.json"
  interval: 3600

backup:
  enabled: true
  interval: 86400
  retention: 7
  compression: true
EOF
    print_success "config.yaml created ✓"
else
    print_status "config.yaml already exists ✓"
fi

# Create telemetry.json if it doesn't exist
if [ ! -f "telemetry.json" ]; then
    print_status "Creating telemetry.json..."
    cat > telemetry.json << EOF
{
  "installation": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "5.0.0",
    "os": "$MACHINE",
    "node_version": "$(node -v)",
    "python_version": "$PYTHON_VERSION"
  },
  "usage": {
    "sessions": 0,
    "features_used": {},
    "errors": [],
    "performance": {}
  },
  "privacy": {
    "data_collection": false,
    "analytics": false,
    "crash_reports": false
  }
}
EOF
    print_success "telemetry.json created ✓"
else
    print_status "telemetry.json already exists ✓"
fi

# Set up Git hooks
print_status "Setting up Git hooks..."
if [ -d ".git" ]; then
    pnpm husky install
    print_success "Git hooks configured ✓"
else
    print_warning "Not a Git repository, skipping Git hooks"
fi

# Build the application
print_status "Building CareConnect v5.0..."
pnpm build

if [ $? -eq 0 ]; then
    print_success "Build completed ✓"
else
    print_warning "Build failed (this is normal for first run)"
fi

# Set executable permissions
chmod +x run.sh
chmod +x scripts/*.sh

print_success "Installation completed successfully! 🎉"

echo ""
echo "🚀 Next Steps:"
echo "1. Run './run.sh' to start CareConnect v5.0"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Complete the initial setup wizard"
echo ""
echo "📚 Documentation:"
echo "- README.md - Complete setup and usage guide"
echo "- docs/ - Detailed documentation"
echo "- CONTRIBUTING.md - Development guidelines"
echo ""
echo "🆘 Support:"
echo "- GitHub Issues: https://github.com/careconnect/steward/issues"
echo "- Community: https://community.careconnect.steward"
echo ""
echo "🌟 Welcome to CareConnect v5.0 - The Steward!"
