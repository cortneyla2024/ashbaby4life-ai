#!/bin/bash

# CareConnect v5.0 - Run Script
# This script starts all services and launches the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_banner() {
    echo -e "${PURPLE}"
    echo "============================================================================="
    echo "  CareConnect v5.0 - The Steward"
    echo "  Starting up..."
    echo "============================================================================="
    echo -e "${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for service at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "Service ready at $url"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - Service not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Service failed to start at $url"
    return 1
}

# Function to start a background process
start_background_process() {
    local name=$1
    local command=$2
    local log_file="./logs/${name}.log"
    
    print_status "Starting $name..."
    
    # Create logs directory if it doesn't exist
    mkdir -p ./logs
    
    # Start the process in the background
    nohup $command > "$log_file" 2>&1 &
    local pid=$!
    
    # Store the PID
    echo $pid > "./temp/${name}.pid"
    
    print_success "$name started with PID $pid"
    return $pid
}

# Function to stop a background process
stop_background_process() {
    local name=$1
    local pid_file="./temp/${name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping $name (PID: $pid)..."
            kill "$pid"
            rm -f "$pid_file"
            print_success "$name stopped"
        else
            print_warning "$name process not running"
            rm -f "$pid_file"
        fi
    else
        print_warning "PID file not found for $name"
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down CareConnect v5.0..."
    
    # Stop background processes
    stop_background_process "ai-service"
    stop_background_process "p2p-node"
    stop_background_process "ipfs-daemon"
    
    # Stop the main application
    if [ -n "$MAIN_PID" ]; then
        print_status "Stopping main application..."
        kill "$MAIN_PID" 2>/dev/null || true
    fi
    
    print_success "CareConnect v5.0 stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_banner
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please run './install.sh' first."
        exit 1
    fi
    
    # Load environment variables
    print_status "Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
    
    # Create necessary directories
    mkdir -p ./logs
    mkdir -p ./temp
    mkdir -p ./data
    mkdir -p ./cache
    mkdir -p ./uploads
    mkdir -p ./backups
    
    # Check if ports are available
    print_status "Checking port availability..."
    
    if check_port 3000; then
        print_error "Port 3000 is already in use. Please stop the service using that port."
        exit 1
    fi
    
    if check_port 3001; then
        print_error "Port 3001 is already in use. Please stop the service using that port."
        exit 1
    fi
    
    if check_port 6001; then
        print_warning "Port 6001 is in use. P2P sync may not work properly."
    fi
    
    if check_port 8080; then
        print_warning "Port 8080 is in use. IPFS gateway may not work properly."
    fi
    
    print_success "Ports are available ✓"
    
    # Start AI service (if Python is available)
    if command -v python3 &> /dev/null; then
        if [ -f "ai-core/inference.py" ]; then
            start_background_process "ai-service" "python3 ai-core/inference.py --model ./models/llama2-7b"
            AI_SERVICE_PID=$!
        else
            print_warning "AI service not found. Some features may be limited."
        fi
    else
        print_warning "Python not found. AI features will be disabled."
    fi
    
    # Start P2P node (if libp2p is available)
    if command -v node &> /dev/null && [ -f "p2p/p2p-node.js" ]; then
        start_background_process "p2p-node" "node p2p/p2p-node.js"
        P2P_PID=$!
    else
        print_warning "P2P node not found. Peer-to-peer sync will be disabled."
    fi
    
    # Start IPFS daemon (if available)
    if command -v ipfs &> /dev/null; then
        start_background_process "ipfs-daemon" "ipfs daemon --enable-gc"
        IPFS_PID=$!
    else
        print_warning "IPFS not found. Distributed storage will be disabled."
    fi
    
    # Wait a moment for background services to start
    sleep 3
    
    # Start the main application
    print_status "Starting CareConnect v5.0..."
    
    # Start the development server
    if [ "$NODE_ENV" = "development" ]; then
        print_status "Starting in development mode..."
        pnpm dev &
        MAIN_PID=$!
    else
        print_status "Starting in production mode..."
        pnpm start &
        MAIN_PID=$!
    fi
    
    # Store the main PID
    echo $MAIN_PID > "./temp/main.pid"
    
    # Wait for the main application to be ready
    if wait_for_service "http://localhost:3000"; then
        print_success "CareConnect v5.0 is ready!"
        
        echo ""
        echo -e "${CYAN}============================================================================="
        echo "  CareConnect v5.0 - The Steward is now running!"
        echo "=============================================================================${NC}"
        echo ""
        echo -e "${GREEN}🌐 Web Interface:${NC} http://localhost:3000"
        echo -e "${GREEN}📊 Health Check:${NC} http://localhost:3000/api/health"
        echo -e "${GREEN}📚 API Docs:${NC} http://localhost:3000/api/docs"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop the application${NC}"
        echo ""
        
        # Keep the script running
        while kill -0 "$MAIN_PID" 2>/dev/null; do
            sleep 1
        done
        
        print_error "Main application stopped unexpectedly"
        cleanup
    else
        print_error "Failed to start CareConnect v5.0"
        cleanup
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the CareConnect v5.0 root directory."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_error "Dependencies not installed. Please run './install.sh' first."
    exit 1
fi

# Run the main function
main "$@"
