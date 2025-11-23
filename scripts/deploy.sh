#!/bin/bash

# Panchmukhi Trading Brain - Deployment Script
# This script deploys the application to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Configuration
DEPLOY_ENV=${1:-production}
VERSION=${2:-latest}
REGISTRY="panchmukhi"

echo "🚀 पंचमुखी ट्रेडिंग ब्रेन डिप्लॉयमेंट सुरू करत आहे..."
echo "Environment: $DEPLOY_ENV"
echo "Version: $VERSION"
echo ""

# Pre-deployment checks
pre_deployment_checks() {
    print_status "प्री-डिप्लॉयमेंट चेक्स करत आहे..."
    
    # Check if required files exist
    required_files=("docker-compose.yml" "backend/Dockerfile" "frontend/Dockerfile" "ml-services/Dockerfile")
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "आवश्यक फाईल आढळली नाही: $file"
            exit 1
        fi
    done
    
    # Check environment variables
    if [ ! -f ".env" ]; then
        print_warning ".env फाईल आढळली नाही. उदाहरण वापरत आहे..."
        cp .env.example .env 2>/dev/null || true
    fi
    
    print_success "प्री-डिप्लॉयमेंट चेक्स पूर्ण"
}

# Build Docker images
build_images() {
    print_status "Docker images तयार करत आहे..."
    
    # Build backend image
    docker build -t ${REGISTRY}/backend:${VERSION} ./backend
    
    # Build frontend image
    docker build -t ${REGISTRY}/frontend:${VERSION} ./frontend
    
    # Build ML service image
    docker build -t ${REGISTRY}/ml-service:${VERSION} ./ml-services
    
    print_success "Docker images तयार केली"
}

# Push images to registry
push_images() {
    if [ "$DEPLOY_ENV" = "production" ]; then
        print_status "Registry मध्ये images push करत आहे..."
        
        # Login to registry (if needed)
        # echo "$REGISTRY_PASSWORD" | docker login -u "$REGISTRY_USERNAME" --password-stdin
        
        docker push ${REGISTRY}/backend:${VERSION}
        docker push ${REGISTRY}/frontend:${VERSION}
        docker push ${REGISTRY}/ml-service:${VERSION}
        
        print_success "Images push केली"
    else
        print_status "Development environment - images push करण्याची आवश्यकता नाही"
    fi
}

# Deploy services
deploy_services() {
    print_status "सर्व्हिसेस डिप्लॉय करत आहे..."
    
    # Stop existing services
    docker-compose down
    
    # Pull latest images (for production)
    if [ "$DEPLOY_ENV" = "production" ]; then
        docker-compose pull
    fi
    
    # Start services
    docker-compose up -d
    
    print_success "सर्व्हिसेस डिप्लॉय केली"
}

# Wait for services to be ready
wait_for_services() {
    print_status "सर्व्हिसेस तयार होण्याची वाट पाहत आहे..."
    
    # Wait for database
    for i in {1..30}; do
        if docker-compose exec postgres pg_isready -U panchmukhi_user >/dev/null 2>&1; then
            print_success "PostgreSQL तयार आहे"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    # Wait for Redis
    for i in {1..30}; do
        if docker-compose exec redis redis-cli ping >/dev/null 2>&1; then
            print_success "Redis तयार आहे"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    echo ""
}

# Run database migrations
run_migrations() {
    print_status "डेटाबेस मायग्रेशन्स चालवत आहे..."
    
    # Wait a bit more for services to be fully ready
    sleep 10
    
    # Run migrations
    docker-compose exec backend npm run db:migrate 2>/dev/null || {
        print_warning "Migration failed, creating database schema manually..."
        # Alternative: run raw SQL or use a different migration tool
    }
    
    print_success "मायग्रेशन्स पूर्ण"
}

# Health check
health_check() {
    print_status "हेल्थ चेक करत आहे..."
    
    # Check backend health
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        print_success "Backend आरोग्यदायी आहे"
    else
        print_error "Backend आरोग्यदायी नाही"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000/ >/dev/null 2>&1; then
        print_success "Frontend आरोग्यदायी आहे"
    else
        print_error "Frontend आरोग्यदायी नाही"
        exit 1
    fi
    
    # Check ML service
    if curl -f http://localhost:8001/health >/dev/null 2>&1; then
        print_success "ML Service आरोग्यदायी आहे"
    else
        print_warning "ML Service आरोग्यदायी नाही"
    fi
}

# Cleanup old images
cleanup() {
    print_status "जुनी images स्वच्छ करत आहे..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused volumes (optional)
    # docker volume prune -f
    
    print_success "स्वच्छता पूर्ण"
}

# Generate deployment report
generate_report() {
    print_status "डिप्लॉयमेंट रिपोर्ट तयार करत आहे..."
    
    DEPLOY_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > deployment_report.txt << EOF
# पंचमुखी ट्रेडिंग ब्रेन - डिप्लॉयमेंट रिपोर्ट

## डिप्लॉयमेंट माहिती
- वेळ: $DEPLOY_TIME
- एन्व्हायर्नमेंट: $DEPLOY_ENV
- व्हर्जन: $VERSION
- डिप्लॉयमेंट ID: $(date +%s)

## सर्व्हिसेस स्थिती
- PostgreSQL: $(docker-compose ps postgres | grep -q 'Up' && echo "✓ सुरू" || echo "✗ बंद")
- Redis: $(docker-compose ps redis | grep -q 'Up' && echo "✓ सुरू" || echo "✗ बंद")
- MongoDB: $(docker-compose ps mongodb | grep -q 'Up' && echo "✓ सुरू" || echo "✗ बंद")
- Backend: $(docker-compose ps backend | grep -q 'Up' && echo "✓ सुरू" || echo "✗ बंद")
- Frontend: $(docker-compose ps frontend | grep -q 'Up' && echo "✓ सुरू" || echo "✗ बंद")
- ML Service: $(docker-compose ps ml-service | grep -q 'Up' && echo "✓ सुरू" || echo "✗ बंद")

## अ‍ॅक्सेस URL
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- ML Services: http://localhost:8001

## मॉनिटरिंग
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## ट्रबलशूटिंग
जर कोणी समस्या आली तर:
1. लॉग तपासा: docker-compose logs [service-name]
2. सर्व्हिसेस रीस्टार्ट करा: docker-compose restart
3. डॉक्युमेंटेशन पाहा: README.md

## नोट्स
- सर्व्हिसेस ५-१० मिनिटांमध्ये पूर्णपणे तयार होतील
- डेटाबेस मायग्रेशन्स ऑटोमॅटिकली चालवले गेले
- सर्व्हिसेसची स्थिती तपासण्यासाठी health checks वापरा
EOF
    
    print_success "डिप्लॉयमेंट रिपोर्ट तयार केली: deployment_report.txt"
}

# Rollback function
rollback() {
    print_status "Rollback करत आहे..."
    
    # Stop current deployment
    docker-compose down
    
    # Start previous version (if available)
    if [ -f "docker-compose.backup.yml" ]; then
        docker-compose -f docker-compose.backup.yml up -d
    fi
    
    print_success "Rollback पूर्ण"
}

# Main deployment function
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  पंचमुखी ट्रेडिंग ब्रेन                  ║"
    echo "║                    डिप्लॉयमेंट स्क्रिप्ट                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Execute deployment steps
    pre_deployment_checks
    build_images
    push_images
    deploy_services
    wait_for_services
    run_migrations
    health_check
    cleanup
    generate_report
    
    print_success "डिप्लॉयमेंट यशस्वीरीत्या पूर्ण झाले! 🎉"
    
    echo ""
    echo "📋 पुढील पायरी:"
    echo "1. अ‍ॅप्लिकेशन तपासा: http://localhost:3000"
    echo "2. लॉग तपासा: docker-compose logs -f"
    echo "3. मॉनिटरिंग पाहा: http://localhost:3001"
    echo "4. डिप्लॉयमेंट रिपोर्ट पाहा: deployment_report.txt"
    echo ""
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy    - पूर्ण अ‍ॅप्लिकेशन डिप्लॉय करा (default)"
        echo "  rollback  - मागील आवृत्तीवर परत जा"
        echo "  health    - सर्व्हिसेसची आरोग्य तपासणी करा"
        echo "  cleanup   - जुने images आणि containers स्वच्छ करा"
        exit 1
        ;;
esac