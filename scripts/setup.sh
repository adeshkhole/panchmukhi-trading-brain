#!/bin/bash

# Panchmukhi Trading Brain - Setup Script
# This script sets up the entire project environment

set -e

echo "🚀 पंचमुखी ट्रेडिंग ब्रेन सेटअप सुरू करत आहे..."

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker स्थापित केले गेले नाही. कृपया Docker प्रथम स्थापित करा."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose स्थापित केले गेले नाही. कृपया Docker Compose प्रथम स्थापित करा."
        exit 1
    fi
    
    print_success "Docker आणि Docker Compose आढळले"
}

# Check system requirements
check_requirements() {
    print_status "सिस्टीम आवश्यकता तपासत आहे..."
    
    # Check RAM (minimum 4GB recommended)
    TOTAL_RAM=$(free -g | awk 'NR==2{printf "%.1f", $2}')
    if (( $(echo "$TOTAL_RAM < 4" | bc -l) )); then
        print_warning "कमी RAM आढळली. किमान 4GB RAM शिफारस केली आहे."
    fi
    
    # Check disk space (minimum 10GB)
    AVAILABLE_SPACE=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 10 ]; then
        print_warning "कमी डिस्क स्पेस आढळली. किमान 10GB आवश्यक आहे."
    fi
    
    print_success "सिस्टीम आवश्यकता तपासणी पूर्ण"
}

# Create environment file
create_env_file() {
    print_status "Environment फाईल तयार करत आहे..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
PG_HOST=postgres
PG_PORT=5432
PG_USER=panchmukhi_user
PG_PASSWORD=panchmukhi_password
PG_DATABASE=panchmukhi_trading

# MongoDB Configuration
MONGODB_URI=mongodb://panchmukhi_admin:panchmukhi_password@mongodb:27017/panchmukhi_trading?authSource=admin

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=panchmukhi_jwt_secret_key_2024_change_in_production

# API Keys (Replace with actual keys in production)
NSE_API_KEY=your_nse_api_key_here
NEWS_API_KEY=your_news_api_key_here
ISRO_API_KEY=your_isro_api_key_here

# Application Configuration
NODE_ENV=production
PORT=8080
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://ml-service:8001

# External APIs
MARKET_DATA_API_URL=https://www.nseindia.com/api
NEWS_SOURCES_API_URL=https://newsapi.org/v2
SATELLITE_API_URL=https://bhuvan.nrsc.gov.in/api
EOF
        print_success ".env फाईल तयार केली"
    else
        print_warning ".env फाईल आधीच अस्तित्वात आहे"
    fi
}

# Create necessary directories
create_directories() {
    print_status "आवश्यक डायरेक्टरीज तयार करत आहे..."
    
    directories=(
        "backend/logs"
        "backend/uploads"
        "ml-services/models"
        "ml-services/data"
        "database/backups"
        "monitoring/prometheus"
        "monitoring/grafana"
        "nginx/ssl"
        "scripts"
        "docs"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "डायरेक्टरी तयार केली: $dir"
        fi
    done
}

# Set proper permissions
set_permissions() {
    print_status "परमिशन्स सेट करत आहे..."
    
    # Make scripts executable
    chmod +x scripts/*.sh 2>/dev/null || true
    
    # Set proper permissions for sensitive files
    chmod 600 .env 2>/dev/null || true
    
    print_success "परमिशन्स सेट केले"
}

# Pull Docker images
pull_images() {
    print_status "Docker images डाउनलोड करत आहे..."
    
    docker-compose pull
    
    print_success "Docker images डाउनलोड केली"
}

# Build and start services
start_services() {
    print_status "सर्व्हिसेस सुरू करत आहे..."
    
    # Build and start all services
    docker-compose up -d --build
    
    print_success "सर्व्हिसेस सुरू केली"
}

# Check service health
check_health() {
    print_status "सर्व्हिसेसची आरोग्य तपासणी करत आहे..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check if services are running
    services=("postgres" "redis" "mongodb" "backend" "ml-service" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            print_success "$service सेवा सुरू आहे"
        else
            print_error "$service सेवा सुरू नाही"
        fi
    done
}

# Setup database
setup_database() {
    print_status "डेटाबेस सेटअप करत आहे..."
    
    # Run database migrations
    docker-compose exec backend npm run db:migrate 2>/dev/null || true
    
    # Seed initial data
    docker-compose exec backend npm run db:seed 2>/dev/null || true
    
    print_success "डेटाबेस सेटअप पूर्ण"
}

# Display access URLs
display_urls() {
    print_status "अ‍ॅक्सेस URL दाखवत आहे..."
    
    echo ""
    echo "🎉 पंचमुखी ट्रेडिंग ब्रेन सुरू झाले!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8080"
    echo "🤖 ML Services: http://localhost:8001"
    echo "📊 Admin Panel: http://localhost:3000/admin.html"
    echo "🔍 API Documentation: http://localhost:8080/documentation"
    echo ""
    echo "📈 Monitoring:"
    echo "   Prometheus: http://localhost:9090"
    echo "   Grafana: http://localhost:3001"
    echo ""
    echo "🗄️ Database:"
    echo "   PostgreSQL: localhost:5432"
    echo "   MongoDB: localhost:27017"
    echo "   Redis: localhost:6379"
    echo ""
}

# Show usage instructions
show_usage() {
    echo ""
    echo "📋 वापरासाठी सूचना:"
    echo ""
    echo "🔄 सर्व्हिसेस रीस्टार्ट करा:"
    echo "   docker-compose restart"
    echo ""
    echo "📊 लॉग पाहा:"
    echo "   docker-compose logs -f backend"
    echo "   docker-compose logs -f ml-service"
    echo ""
    echo "🗄️ डेटाबेस मॅनेजमेंट:"
    echo "   docker-compose exec postgres psql -U panchmukhi_user -d panchmukhi_trading"
    echo "   docker-compose exec mongodb mongosh -u panchmukhi_admin -p panchmukhi_password"
    echo ""
    echo "🧹 स्वच्छता:"
    echo "   docker-compose down"
    echo "   docker system prune -a"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    पंचमुखी ट्रेडिंग ब्रेन                  ║"
    echo "║                     सेटअप स्क्रिप्ट                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Execute functions in order
    check_docker
    check_requirements
    create_env_file
    create_directories
    set_permissions
    pull_images
    start_services
    check_health
    setup_database
    display_urls
    show_usage
    
    print_success "सेटअप यशस्वीरीत्या पूर्ण झाले! 🎉"
}

# Run main function
main "$@"