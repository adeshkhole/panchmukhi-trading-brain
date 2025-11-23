#!/bin/bash

# पंचमुखी ट्रेडिंग ब्रेन प्रो - डिप्लॉयमेंट स्क्रिप्ट
# Deployment script for advanced trading platform

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="panchmukhi-trading-brain-pro"
BACKEND_PORT="8081"
ML_PORT="8082"
FRONTEND_PORT="3000"
NGINX_PORT="80"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js (for development)
    if ! command -v node &> /dev/null; then
        log_warning "Node.js is not installed. Some development features may not work."
    fi
    
    # Check Python (for ML services)
    if ! command -v python3 &> /dev/null; then
        log_warning "Python3 is not installed. ML services may not work in development mode."
    fi
    
    # Check available memory
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ $AVAILABLE_MEM -lt 4096 ]; then
        log_warning "Less than 4GB RAM available. Performance may be affected."
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
    if (( $(echo "$AVAILABLE_SPACE < 10" | bc -l) )); then
        log_warning "Less than 10GB disk space available. Consider freeing up space."
    fi
    
    log_success "System requirements check completed"
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log_info "Creating .env file from .env.example..."
        cp .env.example .env
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -hex 32)
        API_KEY_SECRET=$(openssl rand -hex 16)
        
        # Update .env file with generated secrets
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/API_KEY_SECRET=.*/API_KEY_SECRET=$API_KEY_SECRET/" .env
        
        log_success "Environment variables configured"
    else
        log_info "Environment file already exists"
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    directories=(
        "backend/logs"
        "backend/uploads"
        "ml-services/logs"
        "ml-services/models"
        "ml-services/data"
        "nginx/logs"
        "nginx/ssl"
        "monitoring/grafana"
        "monitoring/prometheus"
        "database/backups"
        "frontend/build"
        "docs/generated"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        fi
    done
    
    # Set proper permissions
    chmod 755 backend/uploads
    chmod 755 nginx/logs
    
    log_success "Directories created successfully"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install Node.js dependencies
    if [ -f "package.json" ]; then
        log_info "Installing Node.js dependencies..."
        npm install
    fi
    
    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        log_info "Installing Python dependencies..."
        pip install -r requirements.txt
    fi
    
    log_success "Dependencies installed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build all services
    docker-compose build --parallel
    
    log_success "Docker images built successfully"
}

# Start services
start_services() {
    log_info "Starting services..."
    
    # Pull latest images
    docker-compose pull
    
    # Start all services
    docker-compose up -d
    
    log_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    while ! docker-compose exec postgres pg_isready -U panchmukhi_user > /dev/null 2>&1; do
        sleep 2
    done
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    while ! docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
        sleep 2
    done
    
    # Wait for MongoDB
    log_info "Waiting for MongoDB..."
    while ! docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 2
    done
    
    # Wait for backend
    log_info "Waiting for backend..."
    while ! curl -f http://localhost:8081/health > /dev/null 2>&1; do
        sleep 5
    done
    
    # Wait for ML services
    log_info "Waiting for ML services..."
    while ! curl -f http://localhost:8082/health > /dev/null 2>&1; do
        sleep 5
    done
    
    log_success "All services are healthy"
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Run database migrations
    docker-compose exec backend npm run migrate
    
    # Seed initial data
    docker-compose exec backend npm run seed
    
    log_success "Database setup completed"
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Copy Nginx configuration
    cp nginx/nginx.conf.template nginx/nginx.conf
    
    # Replace placeholders
    sed -i "s/{{BACKEND_PORT}}/$BACKEND_PORT/g" nginx/nginx.conf
    sed -i "s/{{ML_PORT}}/$ML_PORT/g" nginx/nginx.conf
    sed -i "s/{{FRONTEND_PORT}}/$FRONTEND_PORT/g" nginx/nginx.conf
    
    # Reload Nginx
    docker-compose exec nginx nginx -s reload
    
    log_success "Nginx configured successfully"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Configure Prometheus
    docker-compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
    
    # Configure Grafana
    docker-compose exec grafana grafana-cli admin reset-admin-password panchmukhi_admin123
    
    log_success "Monitoring setup completed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run backend tests
    docker-compose exec backend npm test
    
    # Run ML tests
    docker-compose exec ml-services python -m pytest tests/
    
    log_success "Tests completed"
}

# Generate documentation
generate_docs() {
    log_info "Generating documentation..."
    
    # Generate API documentation
    docker-compose exec backend npm run docs:generate
    
    # Generate system documentation
    ./scripts/generate_docs.sh
    
    log_success "Documentation generated"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [ ! -f "nginx/ssl/private.key" ] || [ ! -f "nginx/ssl/certificate.crt" ]; then
        log_info "Generating self-signed SSL certificates..."
        
        # Generate private key
        openssl genrsa -out nginx/ssl/private.key 2048
        
        # Generate certificate
        openssl req -new -x509 -key nginx/ssl/private.key -out nginx/ssl/certificate.crt -days 365 \
            -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Panchmukhi Trading Brain/CN=localhost"
        
        log_success "SSL certificates generated"
    else
        log_info "SSL certificates already exist"
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check all services
    services=("postgres" "redis" "mongodb" "backend" "ml-services" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "healthy"; then
            log_success "$service is healthy"
        else
            log_warning "$service health check failed"
        fi
    done
    
    # Check API endpoints
    endpoints=(
        "http://localhost:8081/health"
        "http://localhost:8082/health"
        "http://localhost/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "$endpoint" > /dev/null 2>&1; then
            log_success "API endpoint $endpoint is accessible"
        else
            log_error "API endpoint $endpoint is not accessible"
        fi
    done
}

# Display status
show_status() {
    log_info "Deployment Status:"
    echo "======================================"
    echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
    echo "🔧 Backend API: http://localhost:$BACKEND_PORT"
    echo "🤖 ML Services: http://localhost:$ML_PORT"
    echo "🌐 Nginx Proxy: http://localhost:$NGINX_PORT"
    echo "📊 Grafana: http://localhost:3000"
    echo "🔍 Prometheus: http://localhost:9090"
    echo "📈 Kibana: http://localhost:5601"
    echo "======================================"
    echo "📧 Support: support@panchmukhi.ai"
    echo "🌐 Website: https://panchmukhi.ai"
    echo "======================================"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Remove temporary files
    rm -f /tmp/*.tmp
    
    # Clean up Docker
    docker system prune -f --volumes
    
    log_success "Cleanup completed"
}

# Main deployment function
deploy() {
    log_info "Starting Panchmukhi Trading Brain Pro deployment..."
    
    # Pre-deployment checks
    check_root
    check_requirements
    
    # Setup
    setup_environment
    create_directories
    install_dependencies
    setup_ssl
    
    # Build and deploy
    build_images
    start_services
    wait_for_services
    setup_database
    configure_nginx
    setup_monitoring
    
    # Post-deployment
    run_tests
    generate_docs
    health_check
    show_status
    cleanup
    
    log_success "🎉 Panchmukhi Trading Brain Pro deployed successfully!"
    log_info "The platform is now ready for use."
}

# Update function
update() {
    log_info "Updating Panchmukhi Trading Brain Pro..."
    
    # Pull latest changes
    git pull origin main
    
    # Update dependencies
    install_dependencies
    
    # Rebuild and restart
    build_images
    docker-compose up -d
    
    # Run health check
    health_check
    
    log_success "Update completed successfully"
}

# Rollback function
rollback() {
    log_info "Rolling back to previous version..."
    
    # Stop current services
    docker-compose down
    
    # Restore from backup
    if [ -f "database/backups/backup.sql" ]; then
        docker-compose exec postgres psql -U panchmukhi_user -d panchmukhi_trading < database/backups/backup.sql
    fi
    
    # Start services
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Backup function
backup() {
    log_info "Creating backup..."
    
    # Create backup directory
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    docker-compose exec postgres pg_dump -U panchmukhi_user panchmukhi_trading > "$BACKUP_DIR/database.sql"
    
    # Backup Redis data
    docker-compose exec redis redis-cli --rdb "$BACKUP_DIR/redis.rdb"
    
    # Backup configuration
    cp -r config/ "$BACKUP_DIR/"
    
    # Create archive
    tar -czf "$BACKUP_DIR.tar.gz" -C backups "$(basename "$BACKUP_DIR")"
    
    log_success "Backup created: $BACKUP_DIR.tar.gz"
}

# Parse command line arguments
case "$1" in
    deploy)
        deploy
        ;;
    update)
        update
        ;;
    rollback)
        rollback
        ;;
    backup)
        backup
        ;;
    status)
        health_check
        show_status
        ;;
    logs)
        docker-compose logs -f
        ;;
    stop)
        docker-compose down
        ;;
    restart)
        docker-compose restart
        ;;
    clean)
        docker-compose down -v
        docker system prune -af
        ;;
    *)
        echo "Usage: $0 {deploy|update|rollback|backup|status|logs|stop|restart|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy    - Deploy the complete platform"
        echo "  update    - Update the platform to latest version"
        echo "  rollback  - Rollback to previous version"
        echo "  backup    - Create backup of platform data"
        echo "  status    - Show platform status"
        echo "  logs      - Show platform logs"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  clean     - Clean up all containers and volumes"
        exit 1
        ;;
esac