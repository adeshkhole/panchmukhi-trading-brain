#!/bin/bash

# पंचमुखी ट्रेडिंग ब्रेन प्रो - सेटअप वैधता तपासणी स्क्रिप्ट
# Validation script for comprehensive trading platform setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_CHECKS++))
}

log_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
    ((TOTAL_CHECKS++))
}

# Check file structure
check_file_structure() {
    log_info "Checking file structure..."
    
    required_files=(
        "README.md"
        "docker-compose.yml"
        "index.html"
        "main.js"
        "admin.html"
        "admin.js"
        "sectors.html"
        "sectors.js"
        "ipo.html"
        "ipo.js"
        "server.js"
        "app.py"
        "deploy.sh"
        "validate_setup.sh"
        "PROJECT_STRUCTURE.md"
    )
    
    for file in "${required_files[@]}"; do
        log_check "Checking for $file"
        if [ -f "$file" ]; then
            log_success "$file exists"
        else
            log_error "$file is missing"
        fi
    done
}

# Check directory structure
check_directory_structure() {
    log_info "Checking directory structure..."
    
    required_directories=(
        "backend"
        "ml-services"
        "nginx"
        "scripts"
        "monitoring"
        "database"
        "docs"
    )
    
    for dir in "${required_directories[@]}"; do
        log_check "Checking for $dir directory"
        if [ -d "$dir" ]; then
            log_success "$dir directory exists"
        else
            log_error "$dir directory is missing"
        fi
    done
}

# Check Docker installation
check_docker() {
    log_info "Checking Docker installation..."
    
    log_check "Docker version"
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_success "Docker installed: $DOCKER_VERSION"
    else
        log_error "Docker is not installed"
    fi
    
    log_check "Docker Compose version"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log_success "Docker Compose installed: $COMPOSE_VERSION"
    else
        log_error "Docker Compose is not installed"
    fi
    
    log_check "Docker daemon"
    if docker info > /dev/null 2>&1; then
        log_success "Docker daemon is running"
    else
        log_error "Docker daemon is not running"
    fi
}

# Check Node.js installation
check_nodejs() {
    log_info "Checking Node.js installation..."
    
    log_check "Node.js version"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js installed: $NODE_VERSION"
        
        # Check if version is >= 14
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -ge 14 ]; then
            log_success "Node.js version is compatible"
        else
            log_warning "Node.js version may not be compatible (requires >= 14)"
        fi
    else
        log_error "Node.js is not installed"
    fi
    
    log_check "npm version"
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm installed: $NPM_VERSION"
    else
        log_error "npm is not installed"
    fi
}

# Check Python installation
check_python() {
    log_info "Checking Python installation..."
    
    log_check "Python version"
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        log_success "Python installed: $PYTHON_VERSION"
        
        # Check if version is >= 3.8
        PYTHON_MAJOR=$(python3 -c "import sys; print(sys.version_info.major)")
        PYTHON_MINOR=$(python3 -c "import sys; print(sys.version_info.minor)")
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
            log_success "Python version is compatible"
        else
            log_warning "Python version may not be compatible (requires >= 3.8)"
        fi
    else
        log_error "Python3 is not installed"
    fi
    
    log_check "pip version"
    if command -v pip3 &> /dev/null; then
        PIP_VERSION=$(pip3 --version)
        log_success "pip installed: $PIP_VERSION"
    else
        log_error "pip3 is not installed"
    fi
}

# Check system resources
check_system_resources() {
    log_info "Checking system resources..."
    
    # Check memory
    log_check "Available memory"
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    
    if [ $TOTAL_MEM -ge 4096 ]; then
        log_success "Total memory: ${TOTAL_MEM}MB (Recommended: 4GB+)"
    else
        log_warning "Total memory: ${TOTAL_MEM}MB (Recommended: 4GB+)"
    fi
    
    if [ $AVAILABLE_MEM -ge 2048 ]; then
        log_success "Available memory: ${AVAILABLE_MEM}MB"
    else
        log_warning "Available memory: ${AVAILABLE_MEM}MB (May affect performance)"
    fi
    
    # Check disk space
    log_check "Available disk space"
    AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
    if (( $(echo "$AVAILABLE_SPACE >= 10" | bc -l) )); then
        log_success "Available disk space: ${AVAILABLE_SPACE}GB"
    else
        log_warning "Available disk space: ${AVAILABLE_SPACE}GB (Recommended: 10GB+)"
    fi
    
    # Check CPU cores
    log_check "CPU cores"
    CPU_CORES=$(nproc)
    if [ $CPU_CORES -ge 2 ]; then
        log_success "CPU cores: $CPU_CORES"
    else
        log_warning "CPU cores: $CPU_CORES (Recommended: 2+)"
    fi
}

# Check network connectivity
check_network() {
    log_info "Checking network connectivity..."
    
    log_check "Internet connectivity"
    if ping -c 1 google.com > /dev/null 2>&1; then
        log_success "Internet connectivity is available"
    else
        log_error "No internet connectivity"
    fi
    
    log_check "Port availability"
    for port in 80 443 3000 8081 8082; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t > /dev/null 2>&1; then
            log_success "Port $port is available"
        else
            log_warning "Port $port is already in use"
        fi
    done
}

# Check file permissions
check_permissions() {
    log_info "Checking file permissions..."
    
    # Check if scripts are executable
    executable_files=("deploy.sh" "validate_setup.sh" "setup.sh")
    
    for file in "${executable_files[@]}"; do
        log_check "Execution permission for $file"
        if [ -x "$file" ]; then
            log_success "$file is executable"
        else
            log_warning "$file is not executable (run: chmod +x $file)"
        fi
    done
    
    # Check directory permissions
    log_check "Write permissions for logs directory"
    if [ -w "backend/logs" ] 2>/dev/null || [ ! -d "backend/logs" ]; then
        log_success "Write permissions for logs directory"
    else
        log_error "No write permissions for logs directory"
    fi
}

# Check configuration files
check_configurations() {
    log_info "Checking configuration files..."
    
    # Check .env file
    log_check ".env file"
    if [ -f ".env" ]; then
        log_success ".env file exists"
        
        # Check for required variables
        required_vars=("JWT_SECRET" "DB_PASSWORD" "REDIS_PASSWORD")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env; then
                log_success "$var is configured"
            else
                log_error "$var is missing in .env file"
            fi
        done
    else
        log_error ".env file is missing"
    fi
    
    # Check Docker configurations
    log_check "docker-compose.yml"
    if [ -f "docker-compose.yml" ]; then
        log_success "docker-compose.yml exists"
        
        # Validate YAML syntax
        if command -v yq &> /dev/null; then
            if yq eval . docker-compose.yml > /dev/null 2>&1; then
                log_success "docker-compose.yml has valid YAML syntax"
            else
                log_error "docker-compose.yml has invalid YAML syntax"
            fi
        fi
    else
        log_error "docker-compose.yml is missing"
    fi
    
    # Check Nginx configuration
    log_check "nginx/nginx.conf"
    if [ -f "nginx/nginx.conf" ]; then
        log_success "nginx/nginx.conf exists"
    else
        log_warning "nginx/nginx.conf is missing (using default configuration)"
    fi
}

# Check security settings
check_security() {
    log_info "Checking security settings..."
    
    # Check for sensitive files
    log_check "Sensitive file permissions"
    if [ -f ".env" ] && [ "$(stat -c %a .env)" -le 600 ]; then
        log_success ".env file has restricted permissions"
    else
        log_warning ".env file permissions should be 600 or less"
    fi
    
    # Check for SSL certificates
    log_check "SSL certificates"
    if [ -f "nginx/ssl/private.key" ] && [ -f "nginx/ssl/certificate.crt" ]; then
        log_success "SSL certificates exist"
    else
        log_warning "SSL certificates are missing (will use HTTP only)"
    fi
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js dependencies
    if [ -f "package.json" ]; then
        log_check "Node.js dependencies"
        if [ -d "node_modules" ]; then
            log_success "Node.js dependencies are installed"
        else
            log_warning "Node.js dependencies are not installed (run: npm install)"
        fi
    fi
    
    # Check Python dependencies
    if [ -f "requirements.txt" ]; then
        log_check "Python dependencies"
        if python3 -c "import pkg_resources; pkg_resources.require(open('requirements.txt').read())" 2>/dev/null; then
            log_success "Python dependencies are installed"
        else
            log_warning "Python dependencies are not installed (run: pip install -r requirements.txt)"
        fi
    fi
}

# Generate report
generate_report() {
    log_info "Generating validation report..."
    
    echo ""
    echo "======================================"
    echo "    पंचमुखी ट्रेडिंग ब्रेन प्रो"
    echo "    सेटअप वैधता तपासणी अहवाल"
    echo "======================================"
    echo ""
    echo "एकूण तपासण्या: $TOTAL_CHECKS"
    echo "यशस्वी: $PASSED_CHECKS"
    echo "अयशस्वी: $FAILED_CHECKS"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "${GREEN}✅ सर्व तपासण्या यशस्वी!${NC}"
        echo "तुमचा प्रोजेक्ट सेटअप पूर्ण आहे."
        echo ""
        echo "पुढील पायरी:"
        echo "1. ./deploy.sh deploy कमांड चालवा"
        echo "2. http://localhost वर प्लॅटफॉर्म एक्सेस करा"
    else
        echo -e "${RED}❌ काही तपासण्या अयशस्वी!${NC}"
        echo "कृपया वरील त्रुटी दुरुस्त करा आणि पुन्हा चाचणी करा."
        echo ""
        echo "सहाय्यार्थ:"
        echo "- README.md फाईल तपासा"
        echo "- TROUBLESHOOTING.md मार्गदर्शक पहा"
        echo "- support@panchmukhi.ai वर संपर्क करा"
    fi
    
    echo "======================================"
}

# Main validation function
main() {
    log_info "Starting Panchmukhi Trading Brain Pro setup validation..."
    
    # Run all checks
    check_file_structure
    check_directory_structure
    check_docker
    check_nodejs
    check_python
    check_system_resources
    check_network
    check_permissions
    check_configurations
    check_security
    check_dependencies
    
    # Generate final report
    generate_report
    
    # Exit with appropriate code
    if [ $FAILED_CHECKS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Parse command line arguments
case "$1" in
    quick)
        log_info "Running quick validation..."
        check_file_structure
        check_docker
        check_configurations
        generate_report
        ;;
    full)
        main
        ;;
    *)
        main
        ;;
esac