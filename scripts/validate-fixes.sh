#!/bin/bash

# RoadSide+ Trinidad & Tobago - Validation Script
# This script validates that all critical issues have been fixed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

ISSUES_FOUND=0

print_status "🔍 Validating RoadSide+ Trinidad & Tobago fixes..."

# 1. Check React Query dependency
print_status "Checking React Query dependency..."
if grep -q "@tanstack/react-query" package.json; then
    print_success "React Query dependency fixed"
else
    print_error "React Query dependency not fixed"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 2. Check for missing dependencies
print_status "Checking for missing dependencies..."
REQUIRED_DEPS=("@expo/vector-icons" "react-native-maps" "@react-native-community/netinfo" "react-native-svg")
for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        print_success "$dep dependency added"
    else
        print_error "$dep dependency missing"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

# 3. Check for JavaScript files that should be TypeScript
print_status "Checking for JavaScript files..."
JS_FILES_FOUND=0
if find src/ -name "*.js" -type f | grep -q .; then
    print_warning "JavaScript files found in src/ directory:"
    find src/ -name "*.js" -type f
    JS_FILES_FOUND=1
else
    print_success "No JavaScript files found in src/ directory"
fi

# 4. Check ErrorBoundary component
print_status "Checking ErrorBoundary component..."
if [ -f "src/components/ErrorBoundary.tsx" ]; then
    print_success "ErrorBoundary component exists"
else
    print_error "ErrorBoundary component missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 5. Check User interface for push_token
print_status "Checking User interface for push_token..."
if grep -q "push_token" src/types/database.ts; then
    print_success "push_token field added to User interface"
else
    print_error "push_token field missing from User interface"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 6. Check Detox configuration
print_status "Checking Detox configuration..."
if grep -q "detox" package.json; then
    print_success "Detox configuration added to package.json"
else
    print_error "Detox configuration missing from package.json"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 7. Check test configuration
print_status "Checking test configuration..."
if [ -f "tests/e2e/config.json" ]; then
    print_success "E2E test configuration exists"
else
    print_error "E2E test configuration missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 8. Check environment configuration
print_status "Checking environment configuration..."
if [ -f ".env.example" ]; then
    print_success ".env.example exists"
    if [ -f ".env" ]; then
        print_success ".env file exists"
    else
        print_warning ".env file not found (copy from .env.example)"
    fi
else
    print_error ".env.example missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 9. Check app configuration
print_status "Checking app configuration..."
if [ -f "app.config.js" ]; then
    if grep -q "stripePublishableKey" app.config.js; then
        print_success "Stripe configuration found in app.config.js"
    else
        print_warning "Stripe configuration may be missing from app.config.js"
    fi
else
    print_error "app.config.js missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 10. Check EAS configuration
print_status "Checking EAS configuration..."
if [ -f "eas.json" ]; then
    print_success "eas.json exists"
else
    print_error "eas.json missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 11. Check database migrations
print_status "Checking database migrations..."
if [ -d "supabase/migrations" ]; then
    migration_count=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    if [ $migration_count -gt 0 ]; then
        print_success "Database migrations found ($migration_count files)"
    else
        print_warning "No database migration files found"
    fi
else
    print_error "supabase/migrations directory missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 12. Check Trinidad & Tobago specific features
print_status "Checking Trinidad & Tobago specific features..."

# Check TTD currency
if grep -r "TTD" src/ >/dev/null 2>&1; then
    print_success "TTD currency references found"
else
    print_warning "TTD currency references not found"
fi

# Check emergency numbers
if grep -r "999\|990\|811" tests/ >/dev/null 2>&1; then
    print_success "Trinidad & Tobago emergency numbers found in tests"
else
    print_warning "Emergency numbers not found in tests"
fi

# Check VAT rate
if grep -r "0.125\|12.5%" supabase/ >/dev/null 2>&1; then
    print_success "VAT rate (12.5%) found in database"
else
    print_warning "VAT rate not found in database"
fi

# 13. Check deployment scripts
print_status "Checking deployment scripts..."
if [ -f "scripts/deploy.sh" ]; then
    print_success "Deployment script exists"
    if [ -x "scripts/deploy.sh" ]; then
        print_success "Deployment script is executable"
    else
        print_warning "Deployment script is not executable"
    fi
else
    print_error "Deployment script missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 14. Check documentation
print_status "Checking documentation..."
DOCS=("README.md" "DEPLOYMENT.md" "TEST_PLAN.md" "DEBUG_REPORT.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_success "$doc exists"
    else
        print_warning "$doc missing"
    fi
done

# 15. Final summary
echo ""
echo "🏁 Validation Summary"
echo "===================="

if [ $ISSUES_FOUND -eq 0 ]; then
    print_success "All critical issues have been fixed! ✅"
    echo ""
    echo "🚀 Ready for development:"
    echo "1. Run: npm install"
    echo "2. Copy .env.example to .env and fill in your values"
    echo "3. Run: npm run dev"
    echo ""
    echo "🧪 Ready for testing:"
    echo "1. Run: npm run test"
    echo "2. Run: npm run test:e2e"
    echo ""
    echo "🚀 Ready for deployment:"
    echo "1. Run: ./scripts/deploy.sh deploy development"
    echo "2. Run: ./scripts/deploy.sh deploy production"
    echo ""
    print_success "RoadSide+ Trinidad & Tobago is ready! 🇹🇹🚗"
else
    print_error "$ISSUES_FOUND critical issues still need attention"
    echo ""
    echo "Please review the issues above and run the fix script:"
    echo "  ./scripts/fix-issues.sh"
    echo ""
    echo "Then run this validation again:"
    echo "  ./scripts/validate-fixes.sh"
fi

exit $ISSUES_FOUND
