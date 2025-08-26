#!/bin/bash

# CareConnect Deployment Script
# This script helps you deploy to different platforms

set -e

echo "🚀 CareConnect Deployment Script"
echo "================================"

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Install dependencies
    npm install
    
    # Generate Prisma client
    npx prisma generate
    
    # Build the application
    npm run build
    
    print_success "Application built successfully"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        print_warning "Please login to Railway first:"
        echo "railway login"
        exit 1
    fi
    
    # Deploy
    railway up
    
    print_success "Deployed to Railway successfully"
    print_status "Get your domain with: railway domain"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    
    print_success "Deployed to Vercel successfully"
}

# Deploy to Fly.io
deploy_fly() {
    print_status "Deploying to Fly.io..."
    
    if ! command -v fly &> /dev/null; then
        print_warning "Fly CLI not found. Installing..."
        curl -L https://fly.io/install.sh | sh
    fi
    
    # Check if logged in
    if ! fly auth whoami &> /dev/null; then
        print_warning "Please login to Fly.io first:"
        echo "fly auth login"
        exit 1
    fi
    
    # Deploy
    fly deploy
    
    print_success "Deployed to Fly.io successfully"
}

# Deploy to Render
deploy_render() {
    print_status "Render deployment requires manual setup."
    print_status "Please follow these steps:"
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create a new Web Service"
    echo "4. Set build command: npm install && npm run build"
    echo "5. Set start command: npm start"
    echo "6. Add PostgreSQL database"
    echo "7. Configure environment variables"
    echo "8. Deploy"
}

# Show usage
show_usage() {
    echo "Usage: $0 [PLATFORM]"
    echo ""
    echo "Available platforms:"
    echo "  railway  - Deploy to Railway (recommended)"
    echo "  vercel   - Deploy to Vercel"
    echo "  fly      - Deploy to Fly.io"
    echo "  render   - Show Render deployment instructions"
    echo "  build    - Just build the application"
    echo ""
    echo "Examples:"
    echo "  $0 railway"
    echo "  $0 vercel"
    echo "  $0 fly"
}

# Main script
main() {
    case "${1:-}" in
        "railway")
            check_dependencies
            build_app
            deploy_railway
            ;;
        "vercel")
            check_dependencies
            build_app
            deploy_vercel
            ;;
        "fly")
            check_dependencies
            build_app
            deploy_fly
            ;;
        "render")
            deploy_render
            ;;
        "build")
            check_dependencies
            build_app
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
