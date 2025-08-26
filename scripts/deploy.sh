#!/bin/bash

# Hope: The Steward - Deployment Script
# This script handles the deployment of the Hope application

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command_exists pnpm; then
        print_error "pnpm is not installed. Please install pnpm 8+"
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Function to generate Prisma client
generate_prisma_client() {
    print_status "Generating Prisma client..."
    
    pnpm db:generate
    
    print_success "Prisma client generated successfully"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        pnpm db:migrate
    else
        pnpm db:push
    fi
    
    print_success "Database migrations completed successfully"
}

# Function to build the application
build_application() {
    print_status "Building the application..."
    
    pnpm build
    
    print_success "Application built successfully"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    pnpm test
    
    print_success "All tests passed"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    vercel --prod
    
    print_success "Deployed to Vercel successfully"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Building Docker image..."
    
    docker build -t hope-steward .
    
    print_status "Running Docker container..."
    
    docker run -d \
        --name hope-steward \
        -p 3000:3000 \
        --env-file .env.production \
        hope-steward
    
    print_success "Docker deployment completed successfully"
}

# Function to deploy manually
deploy_manual() {
    print_status "Starting production server..."
    
    pnpm start
}

# Function to show help
show_help() {
    echo "Hope: The Steward - Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Set deployment environment (development, staging, production)"
    echo "  -p, --platform PLATFORM  Set deployment platform (vercel, docker, manual)"
    echo "  -t, --test               Run tests before deployment"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e production -p vercel    # Deploy to Vercel in production"
    echo "  $0 -e staging -p docker       # Deploy with Docker in staging"
    echo "  $0 -e development -p manual   # Start development server"
    echo ""
}

# Main deployment function
main() {
    # Default values
    ENVIRONMENT="development"
    PLATFORM="manual"
    RUN_TESTS=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -p|--platform)
                PLATFORM="$2"
                shift 2
                ;;
            -t|--test)
                RUN_TESTS=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_status "Starting deployment for environment: $ENVIRONMENT"
    print_status "Deployment platform: $PLATFORM"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Generate Prisma client
    generate_prisma_client
    
    # Run database migrations
    run_migrations
    
    # Run tests if requested
    if [ "$RUN_TESTS" = true ]; then
        run_tests
    fi
    
    # Build application
    build_application
    
    # Deploy based on platform
    case $PLATFORM in
        "vercel")
            deploy_vercel
            ;;
        "docker")
            deploy_docker
            ;;
        "manual")
            deploy_manual
            ;;
        *)
            print_error "Unknown platform: $PLATFORM"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@"
