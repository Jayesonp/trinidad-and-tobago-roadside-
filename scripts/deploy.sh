#!/bin/bash

# RoadSide+ Trinidad & Tobago - Deployment Script
# This script automates the deployment process for the RoadSide+ application

set -e  # Exit on any error

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
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Expo CLI
    if ! command_exists expo; then
        print_error "Expo CLI is not installed. Please run: npm install -g @expo/cli"
        exit 1
    fi
    
    # Check EAS CLI
    if ! command_exists eas; then
        print_error "EAS CLI is not installed. Please run: npm install -g eas-cli"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please copy .env.example to .env and fill in your values."
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed!"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    if npm run test --silent; then
        print_success "All tests passed!"
    else
        print_error "Tests failed. Please fix failing tests before deploying."
        exit 1
    fi
}

# Function to prebuild
prebuild_app() {
    print_status "Generating native projects..."
    npx expo prebuild --clean
    print_success "Native projects generated!"
}

# Function to build development
build_development() {
    print_status "Building development client..."
    eas build --profile development --platform all --non-interactive
    print_success "Development build completed!"
}

# Function to build preview
build_preview() {
    print_status "Building preview version..."
    eas build --profile preview --platform all --non-interactive
    print_success "Preview build completed!"
}

# Function to build production
build_production() {
    local platform=${1:-all}
    print_status "Building production version for $platform..."
    eas build --profile production --platform "$platform" --non-interactive
    print_success "Production build completed!"
}

# Function to submit to app stores
submit_to_stores() {
    local platform=${1:-all}
    print_status "Submitting to app stores for $platform..."
    
    if [ "$platform" = "ios" ] || [ "$platform" = "all" ]; then
        print_status "Submitting to App Store..."
        eas submit --platform ios --non-interactive
        print_success "Submitted to App Store!"
    fi
    
    if [ "$platform" = "android" ] || [ "$platform" = "all" ]; then
        print_status "Submitting to Google Play..."
        eas submit --platform android --non-interactive
        print_success "Submitted to Google Play!"
    fi
}

# Function to deploy database migrations
deploy_database() {
    print_status "Deploying database migrations..."
    
    if command_exists supabase; then
        supabase db push
        print_success "Database migrations deployed!"
    else
        print_warning "Supabase CLI not found. Skipping database deployment."
    fi
}

# Function to update environment
update_environment() {
    local env=${1:-production}
    print_status "Updating environment to $env..."
    
    # Update app.config.js with environment-specific settings
    if [ "$env" = "production" ]; then
        export NODE_ENV=production
        print_status "Environment set to production"
    elif [ "$env" = "preview" ]; then
        export NODE_ENV=preview
        print_status "Environment set to preview"
    else
        export NODE_ENV=development
        print_status "Environment set to development"
    fi
}

# Function to show deployment summary
show_summary() {
    local build_type=$1
    local platform=$2
    
    print_success "🚀 Deployment Summary"
    echo "=========================="
    echo "Build Type: $build_type"
    echo "Platform: $platform"
    echo "Environment: ${NODE_ENV:-development}"
    echo "Timestamp: $(date)"
    echo "=========================="
    
    if [ "$build_type" = "production" ]; then
        print_warning "Production build completed. Please test thoroughly before releasing to users."
        print_status "Next steps:"
        echo "1. Download and test the build on physical devices"
        echo "2. Submit to app stores using: ./scripts/deploy.sh submit $platform"
        echo "3. Monitor app performance and user feedback"
    fi
}

# Main deployment function
deploy() {
    local build_type=${1:-development}
    local platform=${2:-all}
    
    print_status "🚗 Starting RoadSide+ Trinidad & Tobago deployment..."
    print_status "Build Type: $build_type"
    print_status "Platform: $platform"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Run tests (skip for development builds)
    if [ "$build_type" != "development" ]; then
        run_tests
    fi
    
    # Update environment
    update_environment "$build_type"
    
    # Deploy database if needed
    if [ "$build_type" = "production" ]; then
        deploy_database
    fi
    
    # Prebuild
    prebuild_app
    
    # Build based on type
    case $build_type in
        "development")
            build_development
            ;;
        "preview")
            build_preview
            ;;
        "production")
            build_production "$platform"
            ;;
        *)
            print_error "Invalid build type: $build_type"
            print_status "Valid options: development, preview, production"
            exit 1
            ;;
    esac
    
    # Show summary
    show_summary "$build_type" "$platform"
}

# Function to submit builds
submit() {
    local platform=${1:-all}
    
    print_status "🚀 Submitting RoadSide+ Trinidad & Tobago to app stores..."
    
    # Check prerequisites
    check_prerequisites
    
    # Submit to stores
    submit_to_stores "$platform"
    
    print_success "🎉 Submission completed!"
    print_status "Monitor your app store dashboards for review status."
}

# Function to show help
show_help() {
    echo "RoadSide+ Trinidad & Tobago Deployment Script"
    echo "=============================================="
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  deploy [type] [platform]  Deploy the application"
    echo "  submit [platform]         Submit to app stores"
    echo "  help                      Show this help message"
    echo ""
    echo "Deploy Types:"
    echo "  development              Build development client (default)"
    echo "  preview                  Build preview version"
    echo "  production               Build production version"
    echo ""
    echo "Platforms:"
    echo "  all                      Build for both iOS and Android (default)"
    echo "  ios                      Build for iOS only"
    echo "  android                  Build for Android only"
    echo ""
    echo "Examples:"
    echo "  $0 deploy development    # Build development client"
    echo "  $0 deploy production ios # Build production iOS app"
    echo "  $0 submit android        # Submit Android app to Google Play"
    echo ""
    echo "Environment Setup:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Fill in your API keys and configuration"
    echo "  3. Run: $0 deploy development"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "deploy")
        deploy "$2" "$3"
        ;;
    "submit")
        submit "$2"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
