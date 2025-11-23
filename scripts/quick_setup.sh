#!/bin/bash

# Panchmukhi Trading Brain Pro - Quick Setup Script
# This script automates the complete setup and deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_LANGUAGE="mr"
DEFAULT_ENVIRONMENT="development"
DEFAULT_PORT_BACKEND="3000"
DEFAULT_PORT_FRONTEND="8080"
DEFAULT_PORT_ML="8000"

# Global variables
PROJECT_DIR=""
ENVIRONMENT=""
LANGUAGE=""
SETUP_TYPE=""

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

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
        OS="Windows"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    print_success "Operating System: $OS"
    
    # Check required tools
    local missing_tools=()
    
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_tools+=("docker-compose")
    fi
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists curl; then
        missing_tools+=("curl")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and run the script again."
        
        if [ "$OS" == "Linux" ]; then
            print_status "For Ubuntu/Debian: sudo apt-get update && sudo apt-get install docker.io docker-compose git curl"
        elif [ "$OS" == "macOS" ]; then
            print_status "For macOS: brew install docker docker-compose git curl"
        fi
        
        exit 1
    fi
    
    print_success "All required tools are installed"
}

# Function to display banner
display_banner() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                              ║"
    echo "║                    🕉️  पंचमुखी ट्रेडिंग ब्रेन प्रो  🕉️                    ║"
    echo "║                                                                              ║"
    echo "║              भारताचं सर्वाधिक अ‍ॅडव्हान्स्ड AI ट्रेडिंग प्लॅटफॉर्म              ║"
    echo "║                                                                              ║"
    echo "║                    Advanced AI-Powered Trading Platform                      ║"
    echo "║                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# Function to get user input
get_user_input() {
    print_status "Welcome to Panchmukhi Trading Brain Pro Setup!"
    echo ""
    
    # Setup type selection
    echo "Select setup type:"
    echo "1. Development (Local development with hot reload)"
    echo "2. Production (Optimized for production deployment)"
    echo "3. Demo (Pre-configured demo with sample data)"
    echo ""
    read -p "Enter your choice (1-3): " setup_choice
    
    case $setup_choice in
        1)
            SETUP_TYPE="development"
            ENVIRONMENT="development"
            ;;
        2)
            SETUP_TYPE="production"
            ENVIRONMENT="production"
            ;;
        3)
            SETUP_TYPE="demo"
            ENVIRONMENT="development"
            ;;
        *)
            print_error "Invalid choice. Defaulting to development setup."
            SETUP_TYPE="development"
            ENVIRONMENT="development"
            ;;
    esac
    
    # Language selection
    echo ""
    echo "Select your preferred language:"
    echo "1. मराठी (Marathi)"
    echo "2. हिंदी (Hindi)"
    echo "3. English"
    echo "4. ગુજરાતી (Gujarati)"
    echo "5. ಕನ್ನಡ (Kannada)"
    echo ""
    read -p "Enter your choice (1-5): " language_choice
    
    case $language_choice in
        1)
            LANGUAGE="mr"
            ;;
        2)
            LANGUAGE="hi"
            ;;
        3)
            LANGUAGE="en"
            ;;
        4)
            LANGUAGE="gu"
            ;;
        5)
            LANGUAGE="kn"
            ;;
        *)
            print_error "Invalid choice. Defaulting to English."
            LANGUAGE="en"
            ;;
    esac
    
    # Project directory
    echo ""
    read -p "Enter project directory path (default: ./panchmukhi-trading): " project_dir
    PROJECT_DIR=${project_dir:-./panchmukhi-trading}
    
    print_success "Configuration completed!"
    echo "Setup Type: $SETUP_TYPE"
    echo "Environment: $ENVIRONMENT"
    echo "Language: $LANGUAGE"
    echo "Project Directory: $PROJECT_DIR"
    echo ""
}

# Function to create environment file
create_environment_file() {
    print_status "Creating environment configuration..."
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    REDIS_PASSWORD=$(openssl rand -hex 16)
    
    cat > "$PROJECT_DIR/.env" << EOF
# Panchmukhi Trading Brain Pro - Environment Configuration
# Generated on: $(date)

# Application Configuration
NODE_ENV=$ENVIRONMENT
PORT=$DEFAULT_PORT_BACKEND
APP_LANGUAGE=$LANGUAGE
APP_NAME="Panchmukhi Trading Brain Pro"

# Security Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Database Configuration
POSTGRES_USER=trading_user
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=panchmukhi_trading
DATABASE_URL=postgresql://trading_user:$POSTGRES_PASSWORD@postgres:5432/panchmukhi_trading

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD

# ML Services Configuration
PYTHON_ENV=$ENVIRONMENT
MODEL_PATH=/app/models
ML_SERVICE_PORT=$DEFAULT_PORT_ML

# Frontend Configuration
REACT_APP_API_URL=http://localhost:$DEFAULT_PORT_BACKEND
REACT_APP_WS_URL=ws://localhost:$DEFAULT_PORT_BACKEND
REACT_APP_LANGUAGE=$LANGUAGE

# Market Data Configuration
MARKET_DATA_SOURCE=mock
ENABLE_REAL_TIME_UPDATES=true
UPDATE_INTERVAL=30000

# Notification Configuration
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=false

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# Performance Configuration
ENABLE_CACHING=true
CACHE_TTL=300
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Security Headers
ENABLE_SECURITY_HEADERS=true
CORS_ORIGIN=http://localhost:$DEFAULT_PORT_FRONTEND

# Demo Configuration
${SETUP_TYPE}_MOCK_DATA=true
${SETUP_TYPE}_AUTO_LOGIN=true
${SETUP_TYPE}_SAMPLE_USERS=true
EOF

    print_success "Environment file created at $PROJECT_DIR/.env"
}

# Function to setup project structure
setup_project_structure() {
    print_status "Setting up project structure..."
    
    # Create main directory
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    # Create directory structure
    mkdir -p {backend,frontend,ml-services,mobile-app,nginx,scripts,docs,logs,ssl}
    mkdir -p backend/{src,tests,config}
    mkdir -p backend/src/{routes,services,models,middleware,utils}
    mkdir -p frontend/{src,public,assets}
    mkdir -p ml-services/{src,models,tests}
    mkdir -p mobile-app/{src,assets}
    mkdir -p mobile-app/src/{screens,components,services,store,utils}
    mkdir -p mobile-app/src/store/{slices,actions}
    mkdir -p scripts/{backup,deployment,monitoring}
    
    print_success "Project structure created"
}

# Function to create docker-compose files
create_docker_compose() {
    print_status "Creating Docker Compose configuration..."
    
    cat > "docker-compose.yml" << 'EOF'
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: panchmukhi-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - panchmukhi-network
    restart: unless-stopped

  # Backend API Server
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: panchmukhi-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRE=${JWT_EXPIRE}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - ./logs/backend:/app/logs
    networks:
      - panchmukhi-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: panchmukhi-frontend
    ports:
      - "8080:80"
    environment:
      - REACT_APP_API_URL=${REACT_APP_API_URL}
      - REACT_APP_WS_URL=${REACT_APP_WS_URL}
      - REACT_APP_LANGUAGE=${REACT_APP_LANGUAGE}
    volumes:
      - ./frontend:/app
      - ./logs/frontend:/var/log/nginx
    networks:
      - panchmukhi-network
    restart: unless-stopped

  # ML Services
  ml-services:
    build:
      context: ./ml-services
      dockerfile: Dockerfile
    container_name: panchmukhi-ml-services
    ports:
      - "8000:8000"
    environment:
      - PYTHON_ENV=${PYTHON_ENV}
      - MODEL_PATH=${MODEL_PATH}
    volumes:
      - ./ml-services:/app
      - ./logs/ml-services:/app/logs
    networks:
      - panchmukhi-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    container_name: panchmukhi-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - panchmukhi-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:6-alpine
    container_name: panchmukhi-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - panchmukhi-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB for Logs
  mongodb:
    image: mongo:5
    container_name: panchmukhi-mongodb
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=mongodb_password
    volumes:
      - mongodb_data:/data/db
    networks:
      - panchmukhi-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  mongodb_data:

networks:
  panchmukhi-network:
    driver: bridge
EOF

    # Create development override
    if [ "$SETUP_TYPE" == "development" ]; then
        cat > "docker-compose.override.yml" << 'EOF'
version: '3.8'

services:
  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true

  ml-services:
    volumes:
      - ./ml-services:/app
    environment:
      - PYTHON_ENV=development
    command: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
EOF
    fi
    
    print_success "Docker Compose files created"
}

# Function to create backend files
create_backend_files() {
    print_status "Creating backend files..."
    
    # Backend package.json
    cat > "backend/package.json" << 'EOF'
{
  "name": "panchmukhi-backend",
  "version": "1.0.0",
  "description": "Panchmukhi Trading Brain Pro - Backend API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "fastify": "^4.24.3",
    "fastify-cors": "^6.0.3",
    "fastify-helmet": "^7.1.0",
    "fastify-jwt": "^4.2.0",
    "fastify-rate-limit": "^5.8.0",
    "fastify-socket.io": "^3.0.0",
    "socket.io": "^4.7.4",
    "ioredis": "^5.3.2",
    "sequelize": "^6.35.1",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "axios": "^1.6.2",
    "nodemailer": "^6.9.7",
    "crypto": "^1.0.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.54.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.29.0"
  }
}
EOF

    # Backend Dockerfile
    cat > "backend/Dockerfile" << 'EOF'
FROM node:18-alpine

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
EOF

    print_success "Backend files created"
}

# Function to create frontend files
create_frontend_files() {
    print_status "Creating frontend files..."
    
    # Frontend package.json
    cat > "frontend/package.json" << 'EOF'
{
  "name": "panchmukhi-frontend",
  "version": "1.0.0",
  "description": "Panchmukhi Trading Brain Pro - Frontend Application",
  "main": "index.html",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "socket.io-client": "^4.7.4",
    "echarts": "^5.4.3",
    "chart.js": "^4.4.0",
    "animate.css": "^4.1.1",
    "typed.js": "^2.0.12",
    "p5": "^1.7.0",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.54.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.29.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10"
  }
}
EOF

    # Frontend Dockerfile
    cat > "frontend/Dockerfile" << 'EOF'
FROM node:18-alpine as build

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create logs directory
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    # Frontend nginx configuration
    cat > "frontend/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    print_success "Frontend files created"
}

# Function to create ML service files
create_ml_files() {
    print_status "Creating ML service files..."
    
    # ML services requirements.txt
    cat > "ml-services/requirements.txt" << 'EOF'
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0

# Machine Learning
tensorflow==2.15.0
torch==2.1.1
scikit-learn==1.3.2
numpy==1.24.3
pandas==2.1.3

# Natural Language Processing
nltk==3.8.1
textblob==0.17.1
vaderSentiment==3.3.2
transformers==4.35.2

# Data Visualization
matplotlib==3.8.2
seaborn==0.13.0
plotly==5.18.0

# API and HTTP
requests==2.31.0
httpx==0.25.2

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1

# Utilities
python-dotenv==1.0.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.11.0
flake8==6.1.0
mypy==1.7.1
EOF

    # ML services Dockerfile
    cat > "ml-services/Dockerfile" << 'EOF'
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -m nltk.downloader punkt vader_lexicon

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

    print_success "ML service files created"
}

# Function to create nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    cat > "nginx/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream frontend {
        server frontend:80;
    }

    upstream ml-services {
        server ml-services:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=frontend:10m rate=5r/s;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Frontend
        location / {
            limit_req zone=frontend burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API endpoints
        location /api {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # ML Service API
        location /ml-api {
            proxy_pass http://ml-services;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    print_success "Nginx configuration created"
}

# Function to create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Main start script
    cat > "start.sh" << 'EOF'
#!/bin/bash

# Panchmukhi Trading Brain Pro - Start Script

echo "🚀 Starting Panchmukhi Trading Brain Pro..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Start services
echo "📦 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
for i in {1..30}; do
    if curl -f http://localhost/api/health >/dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "⏳ Waiting for backend... ($i/30)"
    sleep 5
done

# Display access information
echo ""
echo "🎉 Panchmukhi Trading Brain Pro is now running!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 API Documentation: http://localhost:3000/documentation"
echo "🤖 ML Services: http://localhost:8000"
echo "📚 ML API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Admin: admin@panchmukhi.com / Admin@123"
echo "   User: user@example.com / User@123"
echo "   Premium: premium@example.com / Premium@123"
echo ""
echo "📊 To view logs, run: docker-compose logs -f"
echo "🛑 To stop services, run: docker-compose down"
echo ""
EOF

    chmod +x start.sh
    
    # Stop script
    cat > "stop.sh" << 'EOF'
#!/bin/bash

echo "🛑 Stopping Panchmukhi Trading Brain Pro..."

docker-compose down

echo "✅ Services stopped successfully!"
EOF

    chmod +x stop.sh
    
    # Restart script
    cat > "restart.sh" << 'EOF'
#!/bin/bash

echo "🔄 Restarting Panchmukhi Trading Brain Pro..."

./stop.sh
sleep 5
./start.sh
EOF

    chmod +x restart.sh
    
    print_success "Startup scripts created"
}

# Function to create database initialization script
create_db_init_script() {
    print_status "Creating database initialization script..."
    
    cat > "scripts/init-db.sql" << 'EOF'
-- Panchmukhi Trading Brain Pro - Database Initialization
-- This script sets up the initial database schema and sample data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    subscription_type VARCHAR(20) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user'
);

-- Create trading_signals table
CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) NOT NULL,
    entry_price DECIMAL(10,4),
    target_price DECIMAL(10,4),
    stop_loss DECIMAL(10,4),
    confidence_score DECIMAL(5,2),
    ai_fusion_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create market_data table
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    volume BIGINT,
    change_percent DECIMAL(5,2),
    high DECIMAL(10,4),
    low DECIMAL(10,4),
    open DECIMAL(10,4),
    close DECIMAL(10,4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    group_name VARCHAR(100) DEFAULT 'Default',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol)
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    target_value DECIMAL(10,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_trading_signals_user ON trading_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp ON market_data(symbol, timestamp);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, subscription_type) VALUES
('admin@panchmukhi.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 'premium'),
('user@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'User', 'user', 'basic'),
('premium@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Premium', 'User', 'user', 'premium')
ON CONFLICT (email) DO NOTHING;

-- Insert sample market data
INSERT INTO market_data (symbol, price, volume, change_percent, high, low, open, close) VALUES
('RELIANCE', 2456.78, 1234567, 1.88, 2478.90, 2434.56, 2445.67, 2456.78),
('TCS', 3456.78, 987654, -0.45, 3489.12, 3423.45, 3467.89, 3456.78),
('HDFC', 1789.45, 765432, 2.1, 1795.67, 1756.78, 1767.89, 1789.45),
('INFY', 1876.90, 876543, -0.8, 1890.12, 1867.34, 1889.45, 1876.90),
('SBIN', 634.20, 1567890, 2.5, 639.45, 621.78, 625.67, 634.20)
ON CONFLICT DO NOTHING;

-- Insert sample trading signals
INSERT INTO trading_signals (user_id, symbol, signal_type, entry_price, target_price, stop_loss, confidence_score, ai_fusion_score) VALUES
((SELECT id FROM users WHERE email = 'user@example.com'), 'RELIANCE', 'BUY', 2456.78, 2500.00, 2400.00, 85.5, 7.8),
((SELECT id FROM users WHERE email = 'user@example.com'), 'TCS', 'SELL', 3456.78, 3400.00, 3500.00, 78.2, 6.5),
((SELECT id FROM users WHERE email = 'premium@example.com'), 'HDFC', 'BUY', 1789.45, 1820.00, 1760.00, 92.1, 8.2)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO trading_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO trading_user;

print_success "Database initialization script created"
}

# Function to create mobile app configuration
create_mobile_config() {
    print_status "Creating mobile app configuration..."
    
    # Mobile app environment file
    cat > "mobile-app/.env" << EOF
# Mobile App Configuration
API_URL=http://localhost:3000/api
WS_URL=ws://localhost:3000
APP_LANGUAGE=$LANGUAGE
APP_VERSION=1.0.0
APP_NAME=Panchmukhi Trading
EOF

    print_success "Mobile app configuration created"
}

# Function to create documentation
create_documentation() {
    print_status "Creating project documentation..."
    
    # Quick reference guide
    cat > "docs/QUICK_REFERENCE.md" << 'EOF'
# Panchmukhi Trading Brain Pro - Quick Reference

## 🚀 Quick Start

### Start the application
```bash
./start.sh
```

### Stop the application
```bash
./stop.sh
```

### Restart the application
```bash
./restart.sh
```

## 📱 Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/documentation
- **ML Services**: http://localhost:8000
- **ML API Docs**: http://localhost:8000/docs

## 🔐 Default Credentials

### Admin Account
- Email: admin@panchmukhi.com
- Password: Admin@123

### User Account
- Email: user@example.com
- Password: User@123

### Premium Account
- Email: premium@example.com
- Password: Premium@123

## 🐳 Docker Commands

### View logs
```bash
docker-compose logs -f
```

### Check service status
```bash
docker-compose ps
```

### Access container shell
```bash
docker-compose exec backend sh
```

### View real-time logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-services
```

## 🔧 Troubleshooting

### Reset everything
```bash
docker-compose down
docker volume prune
./start.sh
```

### Rebuild specific service
```bash
docker-compose build backend
docker-compose up -d backend
```

### Check database connection
```bash
docker-compose exec postgres psql -U trading_user -d panchmukhi_trading -c "SELECT 1;"
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost/api/health
```

### Metrics (if enabled)
```bash
curl http://localhost/metrics
```

## 🛠️ Development

### Hot reload for development
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Run tests
```bash
docker-compose exec backend npm test
docker-compose exec ml-services pytest
```

### Database backup
```bash
docker-compose exec postgres pg_dump -U trading_user panchmukhi_trading > backup.sql
```

### Database restore
```bash
docker-compose exec -T postgres psql -U trading_user -d panchmukhi_trading < backup.sql
```
EOF

    print_success "Documentation created"
}

# Function to display final instructions
show_final_instructions() {
    print_success "🎉 Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Review the configuration in .env file"
    echo "2. Start the application: ./start.sh"
    echo "3. Access the application at http://localhost:8080"
    echo "4. Login with default credentials"
    echo "5. Explore the features and customize as needed"
    echo ""
    print_status "For detailed instructions, check:"
    echo "- docs/QUICK_REFERENCE.md"
    echo "- RUN_PROJECT.md"
    echo "- ARCHITECTURE.md"
    echo ""
    print_success "Happy Trading! 🚀"
}

# Main execution flow
main() {
    display_banner
    check_requirements
    get_user_input
    setup_project_structure
    create_environment_file
    create_docker_compose
    create_backend_files
    create_frontend_files
    create_ml_files
    create_nginx_config
    create_startup_scripts
    create_db_init_script
    create_mobile_config
    create_documentation
    show_final_instructions
}

# Run main function
main "$@"