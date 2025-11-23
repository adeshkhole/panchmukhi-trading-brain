# Panchmukhi Trading Brain Pro - Complete Setup & Deployment Guide

## 🚀 Quick Start Guide

### Prerequisites
- **Docker & Docker Compose** (Latest version)
- **Node.js 18+** (for local development)
- **Python 3.9+** (for ML services)
- **Git** (for version control)
- **8GB RAM** minimum (16GB recommended)
- **10GB Storage** minimum

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+), macOS (11+), Windows 10/11
- **Network**: Stable internet connection for real-time data
- **Ports**: 80, 443, 3000, 8000, 8080 must be available

---

## 📦 Installation Methods

### Method 1: Docker Compose (Recommended for Production)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/panchmukhi-trading-brain.git
cd panchmukhi-trading-brain
```

#### Step 2: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Required Environment Variables
```bash
# Backend Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
ENCRYPTION_KEY=your-encryption-key-change-this

# Database Configuration
POSTGRES_USER=trading_user
POSTGRES_PASSWORD=secure_password_change_this
POSTGRES_DB=panchmukhi_trading
DATABASE_URL=postgresql://trading_user:secure_password_change_this@postgres:5432/panchmukhi_trading

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=redis_secure_password_change_this

# ML Services Configuration
PYTHON_ENV=production
MODEL_PATH=/app/models

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

#### Step 3: Start Services
```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 4: Verify Installation
```bash
# Check if all services are running
curl http://localhost/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-11-23T10:30:00Z","services":{"database":"ok","redis":"ok","ml_service":"ok"}}
```

---

### Method 2: Manual Installation (For Development)

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install additional packages
npm install fastify fastify-cors fastify-jwt fastify-helmet fastify-rate-limit
npm install socket.io ioredis sequelize pg pg-hstore
npm install winston morgan joi bcryptjs jsonwebtoken

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install additional packages
npm install tailwindcss postcss autoprefixer
npm install echarts chart.js trading-view
npm install animate.css typed.js p5.js

# Build for production
npm run build

# Start development server
npm run dev
```

#### ML Services Setup
```bash
# Navigate to ml-services directory
cd ml-services

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install additional packages
pip install fastapi uvicorn[standard]
pip install tensorflow scikit-learn nltk
pip install pandas numpy matplotlib
pip install textblob vaderSentiment

# Start ML service
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🐳 Docker Commands Reference

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-services

# Scale services
docker-compose up -d --scale backend=3

# Update services
docker-compose pull
docker-compose up -d
```

### Database Management
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U trading_user -d panchmukhi_trading

# Access Redis
docker-compose exec redis redis-cli

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p pass

# Backup database
docker-compose exec postgres pg_dump -U trading_user panchmukhi_trading > backup.sql

# Restore database
docker-compose exec -T postgres psql -U trading_user -d panchmukhi_trading < backup.sql
```

---

## 🔧 Configuration Files

### Nginx Configuration
```nginx
# nginx/nginx.conf
upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # ML Service
    location /ml-api {
        proxy_pass http://ml-services:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Backend Configuration
```javascript
// backend/src/config/index.js
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    url: process.env.REDIS_URL,
    options: {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d'
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
  }
};
```

---

## 🌐 Accessing the Application

### Local Development URLs
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/documentation
- **ML Services**: http://localhost:8000
- **ML API Docs**: http://localhost:8000/docs

### Default Login Credentials
```bash
# Admin Account
Email: admin@panchmukhi.com
Password: Admin@123

# Test User Account
Email: user@example.com
Password: User@123

# Premium User Account
Email: premium@example.com
Password: Premium@123
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### 2. Database Connection Issues
```bash
# Check database container
docker-compose logs postgres

# Reset database
docker-compose down
docker volume prune
docker-compose up -d
```

#### 3. Frontend Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 4. ML Service Issues
```bash
# Check Python dependencies
pip list

# Reinstall ML packages
pip install --upgrade -r requirements.txt

# Check model files
ls -la ml-services/models/
```

### Log Analysis
```bash
# Check specific service logs
docker-compose logs backend | grep ERROR
docker-compose logs frontend | grep ERROR
docker-compose logs ml-services | grep ERROR

# Real-time log monitoring
docker-compose logs -f --tail=100

# Save logs to file
docker-compose logs --no-color > logs.txt
```

---

## 📊 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_market_data_symbol_timestamp ON market_data(symbol, timestamp);
CREATE INDEX idx_trading_signals_user_status ON trading_signals(user_id, status);
CREATE INDEX idx_news_published_at ON news(published_at);
```

### Redis Caching Strategy
```javascript
// Cache market data for 1 minute
await redis.setex(`market:${symbol}`, 60, JSON.stringify(data));

// Cache user sessions for 7 days
await redis.setex(`session:${userId}`, 604800, JSON.stringify(session));

// Cache trading signals for 5 minutes
await redis.setex(`signals:${userId}`, 300, JSON.stringify(signals));
```

### Frontend Optimization
```javascript
// Lazy loading for charts
const LazyChart = React.lazy(() => import('./components/Chart'));

// Image optimization
const optimizedImage = await compressImage(image, { quality: 0.8 });

// Service worker caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 🔒 Security Checklist

### Production Security
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS protection
- [ ] Implement input validation
- [ ] Use environment variables
- [ ] Regular security updates
- [ ] Database encryption
- [ ] Backup strategy
- [ ] Monitor access logs

### SSL Certificate Setup
```bash
# Using Let's Encrypt
certbot --nginx -d panchmukhi-trading.com -d www.panchmukhi-trading.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📈 Scaling and Production Deployment

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Load Balancer Configuration
```nginx
# Multiple backend instances
upstream backend {
    least_conn;
    server backend1:3000 weight=3;
    server backend2:3000 weight=2;
    server backend3:3000 weight=1;
}
```

### Database Scaling
```sql
-- Read replicas
CREATE SUBSCRIPTION trading_sub
CONNECTION 'host=replica-db port=5432 dbname=trading'
PUBLICATION trading_pub;

-- Partitioning for large tables
CREATE TABLE market_data_2024_q1 PARTITION OF market_data
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

---

## 🧪 Testing

### Unit Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# ML service tests
cd ml-services
python -m pytest tests/
```

### Integration Testing
```bash
# Test API endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Test WebSocket connection
wscat -c ws://localhost:3000/ws
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/market/real-time

# Using Artillery
artillery run load-test.yml
```

---

## 📚 Additional Resources

### Documentation Links
- [API Documentation](http://localhost:3000/documentation)
- [ML API Documentation](http://localhost:8000/docs)
- [Architecture Guide](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Support Channels
- 📧 Email: support@panchmukhi-trading.com
- 💬 Discord: [Join Community](https://discord.gg/panchmukhi-trading)
- 📱 WhatsApp: +91-9876543210
- 🐛 Bug Reports: [GitHub Issues](https://github.com/yourusername/panchmukhi-trading-brain/issues)

### Training Resources
- 📺 Video Tutorials: [YouTube Channel](https://youtube.com/panchmukhi-trading)
- 📖 User Manual: [PDF Guide](./docs/user-manual.pdf)
- 🎓 Online Course: [Trading Mastery](https://academy.panchmukhi-trading.com)

---

## 🎉 Congratulations!

You have successfully set up Panchmukhi Trading Brain Pro! 

### Next Steps
1. **Customize Configuration**: Modify environment variables as needed
2. **Add Your Data Sources**: Integrate with your preferred data providers
3. **Customize UI**: Brand the application for your organization
4. **Train ML Models**: Improve prediction accuracy with your data
5. **Scale Infrastructure**: Deploy to cloud providers (AWS, GCP, Azure)

### Production Checklist
- [ ] SSL Certificate installed
- [ ] Domain name configured
- [ ] Email service set up
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] User training completed

---

**🚀 Ready to Trade Smart with AI Power!**

For additional support, visit our [Help Center](https://help.panchmukhi-trading.com) or contact our support team.

---

*Last Updated: November 23, 2024*  
*Version: 1.0.0*  
*Author: Panchmukhi Trading Brain Pro Team*