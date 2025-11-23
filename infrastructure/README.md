# Infrastructure - Panchmukhi Trading Brain Pro 🏗️

## Overview

The infrastructure module handles **containerization, orchestration, and deployment** of all Panchmukhi Trading Brain services. Provides Docker Compose for development and scalable Kubernetes configurations for production.

## Features

### 🐳 Docker Containerization
- **Service Isolation**: Each service runs in isolated container
- **Consistent Environments**: Same setup across dev/test/prod
- **Easy Onboarding**: Single `docker-compose up` command
- **Volume Management**: Persistent data for databases

### 🔄 Service Orchestration
- **Docker Compose**: Development and small deployments
- **Kubernetes**: Production-grade scalability (optional)
- **Network Isolation**: Services communicate via internal network
- **Health Checks**: Automatic container restart on failure

### 📊 Monitoring & Logging
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **ELK Stack**: Log aggregation (optional)
- **Application Insights**: Azure monitoring (optional)

### 🔒 Security
- **Network Policies**: Control traffic between services
- **Secrets Management**: Environment variables for sensitive data
- **SSL/TLS Termination**: Nginx reverse proxy
- **Regular Updates**: Security patches for base images

### 📈 Load Balancing
- **Nginx Reverse Proxy**: Routes traffic to services
- **Load Distribution**: Distributes requests across instances
- **Health Monitoring**: Removes unhealthy backends

---

## Project Structure

```
infrastructure/
├── docker-compose.yml                # Development & small prod setup
├── docker-compose.prod.yml           # Production overrides (optional)
│
├── services/                         # Service-specific configs
│   ├── frontend/
│   │   └── Dockerfile              # Frontend build
│   ├── backend/
│   │   └── Dockerfile              # Backend image
│   ├── ml-services/
│   │   └── Dockerfile              # Python ML services
│   └── nginx/
│       ├── Dockerfile
│       └── nginx.conf              # Reverse proxy config
│
├── databases/                        # Database configurations
│   ├── postgres/
│   │   ├── Dockerfile              # PostgreSQL image
│   │   ├── init.sql                # Database initialization
│   │   └── backup/                 # Backup scripts
│   ├── mongodb/
│   │   └── init.js                 # MongoDB initialization
│   └── redis/
│       └── redis.conf              # Redis configuration
│
├── monitoring/                       # Observability stack
│   ├── prometheus/
│   │   └── prometheus.yml          # Scrape configs
│   ├── grafana/
│   │   ├── Dockerfile
│   │   └── dashboards/             # Pre-built dashboards
│   └── docker-compose.monitoring.yml
│
├── k8s/                              # Kubernetes manifests (optional)
│   ├── deployments/
│   │   ├── frontend-deployment.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── ml-deployment.yaml
│   │   └── db-deployment.yaml
│   ├── services/
│   │   ├── frontend-service.yaml
│   │   ├── backend-service.yaml
│   │   └── ml-service.yaml
│   ├── configmaps/
│   │   └── app-config.yaml
│   ├── secrets/
│   │   └── app-secrets.yaml
│   └── kustomization.yaml
│
├── scripts/                          # Utility scripts
│   ├── start.sh                     # Start all services
│   ├── stop.sh                      # Stop all services
│   ├── logs.sh                      # View service logs
│   ├── backup-db.sh                 # Database backup
│   ├── restore-db.sh                # Database restore
│   └── health-check.sh              # Service health verification
│
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## Technology Stack

### Container Runtime
- **Docker**: Container platform
- **Docker Compose**: Multi-container orchestration (dev/small prod)
- **Docker Hub**: Container registry

### Orchestration (Optional)
- **Kubernetes 1.24+**: Production orchestration
- **Helm**: Kubernetes package manager
- **Azure AKS**: Azure Kubernetes Service (if using Azure)

### Reverse Proxy & Load Balancing
- **Nginx 1.23+**: Web server and reverse proxy
- **SSL/TLS**: HTTPS termination

### Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Data visualization
- **Node Exporter**: System metrics
- **cAdvisor**: Container metrics

### Logging (Optional)
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Fluentd**: Log shipper
- **Loki**: Log aggregation (lightweight alternative)

### Data Persistence
- **Docker Volumes**: Persistent storage
- **Named Volumes**: Managed volumes
- **Bind Mounts**: Local filesystem mounts

---

## Docker Compose Setup

### Services Defined

The `docker-compose.yml` orchestrates all services:

```yaml
version: '3.8'

services:
  frontend:
    image: panchmukhi/frontend:latest
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:8081/api/v1
  
  backend:
    image: panchmukhi/backend:latest
    ports:
      - "8081:8081"
    depends_on:
      - postgres
      - redis
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
  
  ml-services:
    image: panchmukhi/ml-services:latest
    ports:
      - "8000:8000"
    environment:
      - REDIS_HOST=redis
  
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=panchmukhi_trading
      - POSTGRES_PASSWORD=postgres
  
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  mongodb_data:
```

---

## Installation & Setup

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### Quick Start

**1. Clone repository:**
```bash
git clone https://github.com/yourusername/panchmukhi-trading-brain.git
cd panchmukhi-trading-brain
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

**3. Start all services:**
```bash
docker-compose up -d
```

**4. Verify services are running:**
```bash
docker-compose ps
```

**5. Access services:**

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| Backend API | http://localhost:8081 | API endpoint |
| ML Services | http://localhost:8000 | ML models |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| MongoDB | localhost:27017 | Logs |

### Stopping Services

```bash
# Stop all services (keep data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

---

## Environment Configuration

### .env Template

```bash
# Application
APP_NAME=Panchmukhi Trading Brain
NODE_ENV=development
APP_PORT=3000
API_PORT=8081
ML_PORT=8000

# Frontend
REACT_APP_API_URL=http://localhost:8081/api/v1
REACT_APP_WS_URL=ws://localhost:8081/ws

# PostgreSQL
POSTGRES_DB=panchmukhi_trading
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DB_HOST=postgres
DB_PORT=5432

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password
MONGODB_URI=mongodb://admin:password@mongodb:27017/panchmukhi

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_very_long_secret_key_min_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_characters

# ML Services
ML_SERVICE_URL=http://ml-services:8000
ML_SERVICE_TIMEOUT=30000

# CORS
CORS_ORIGIN=http://localhost:3000

# Nginx
DOMAIN=localhost
ENABLE_SSL=false
```

---

## Service Configurations

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8081
CMD ["npm", "start"]
```

### ML Services Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Nginx Configuration

### Reverse Proxy Setup

```nginx
upstream backend {
  server backend:8081;
}

upstream ml_service {
  server ml-services:8000;
}

server {
  listen 80;
  server_name _;
  client_max_body_size 10M;
  
  # Frontend
  location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
  }
  
  # Backend API
  location /api/v1/ {
    proxy_pass http://backend;
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
    proxy_read_timeout 86400;
  }
  
  # ML Services
  location /ml/ {
    proxy_pass http://ml_service/;
    proxy_set_header Host $host;
  }
  
  # Static files caching
  location ~* \.(js|css|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

## Database Setup

### PostgreSQL Initialization

```sql
-- init.sql
CREATE DATABASE panchmukhi_trading;

\c panchmukhi_trading

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trading_signals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol VARCHAR(20) NOT NULL,
  signal_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_signals_user_id ON trading_signals(user_id);
```

### MongoDB Initialization

```javascript
// init.js
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["root"]
});

db.createCollection("price_history");
db.createCollection("news_sentiment");
db.createCollection("system_logs");
```

---

## Monitoring & Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
  
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8081']
    metrics_path: '/metrics'
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### Grafana Dashboards

**Pre-built Dashboards Available:**
- System metrics (CPU, memory, disk)
- Service health status
- API response times
- Database performance
- Trading signal metrics

**Access**: http://localhost:3001 (default: admin/admin)

---

## Health Checks

### Service Health Verification

```bash
# Check all services
./scripts/health-check.sh

# Individual service checks
docker-compose exec backend curl http://localhost:8081/health
docker-compose exec ml-services curl http://localhost:8000/health
docker-compose exec postgres pg_isready -U postgres
```

### Docker Health Checks

Each service includes health check:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8081/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U postgres panchmukhi_trading > backup.sql

# MongoDB backup
docker-compose exec mongodb mongodump --out /backup

# Full system backup
./scripts/backup-db.sh
```

### Database Restore

```bash
# PostgreSQL restore
docker-compose exec -T postgres psql -U postgres panchmukhi_trading < backup.sql

# MongoDB restore
docker-compose exec mongodb mongorestore /backup
```

---

## Kubernetes Deployment (Optional)

### Prerequisites
- Kubernetes 1.24+
- kubectl configured
- Docker images pushed to registry

### Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f infrastructure/k8s/

# Verify deployment
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs deployment/backend -f

# Expose service
kubectl port-forward svc/frontend 3000:3000
```

### Example Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: panchmukhi/backend:latest
        ports:
        - containerPort: 8081
        env:
        - name: DB_HOST
          value: postgres
        - name: REDIS_HOST
          value: redis
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## Production Considerations

### Security Hardening

```bash
# Rotate secrets
source ./scripts/rotate-secrets.sh

# Update base images
docker-compose pull
docker-compose up -d

# Network policies
# - Restrict external access to only frontend and nginx
# - Internal services communicate via internal network
# - Enable HTTPS/TLS on all endpoints
```

### Performance Tuning

```yaml
# Resource limits in docker-compose
resources:
  limits:
    cpus: '1'
    memory: 1024M
  reservations:
    cpus: '0.5'
    memory: 512M
```

### Scaling

```bash
# Scale services horizontally
docker-compose up -d --scale backend=3

# Load balancer will distribute traffic
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs backend

# Check service health
docker-compose ps

# Restart service
docker-compose restart backend
```

### Database connection failed

```bash
# Verify database is running
docker-compose ps postgres

# Check connection
docker-compose exec backend curl postgresql://postgres:password@postgres:5432

# Check logs
docker-compose logs postgres
```

### WebSocket connection drops

```bash
# Verify Nginx configuration
docker-compose exec nginx cat /etc/nginx/nginx.conf

# Check socket connection
docker-compose exec backend lsof -i :8081
```

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md).

**Infrastructure-specific rules:**
1. ✅ All services must have health checks
2. ✅ Database migrations must be tested
3. ✅ Secrets never committed to git
4. ✅ Monitoring dashboards for all services
5. ✅ Documentation for new services

---

## Support

For infrastructure issues:
- 📊 View monitoring: http://localhost:3001 (Grafana)
- 📋 Check logs: `docker-compose logs -f`
- 🐛 File issues with "infra:" prefix

---

**Built with ❤️ for reliable trading infrastructure**
