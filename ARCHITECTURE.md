# Panchmukhi Trading Brain Pro - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Security Implementation](#security-implementation)
7. [Deployment Architecture](#deployment-architecture)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Mobile Application](#mobile-application)
10. [Future Enhancements](#future-enhancements)

## Project Overview

Panchmukhi Trading Brain Pro is an advanced AI-powered trading platform specifically designed for Indian markets. The platform integrates five different data sources (Panchmukhi - five-faced) to provide comprehensive market analysis and trading recommendations.

### Key Features
- **Multi-language Support**: Marathi, Hindi, English, Gujarati, Kannada
- **Five Data Sources**: Market Data, News Sentiment, Social Media, Satellite Data, Web Scraping
- **AI Fusion Score**: Intelligent scoring system combining all data sources
- **Real-time Updates**: Live market data and notifications
- **Advanced Analytics**: Technical indicators and predictive analysis
- **Mobile Responsive**: Optimized for all devices
- **Enterprise Security**: JWT authentication, role-based access

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                        │
│                         (Nginx)                            │
└─────────────────┬─────────────────────────────────────────┘
                  │
┌─────────────────▼─────────────────────────────────────────┐
│                  API Gateway                               │
│                (Fastify.js)                               │
└─────┬─────┬─────┬─────┬───────────────────────────────────┘
      │     │     │     │
      ▼     ▼     ▼     ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │ │ Market  │ │  News   │ │ Alerts  │
│ Service │ │ Service │ │ Service │ │ Service │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
      │           │           │           │
      ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                          │
│  PostgreSQL (Main) │ MongoDB (Logs) │ Redis (Cache)        │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

#### 1. Authentication Service
- JWT token generation and validation
- User registration and login
- Role-based access control
- Subscription management

#### 2. Market Data Service
- Real-time market data fetching
- Technical indicator calculations
- Historical data storage
- Data caching mechanisms

#### 3. News Service
- News aggregation from multiple sources
- Sentiment analysis using NLP
- Market impact assessment
- Real-time news updates

#### 4. Alert Service
- AI fusion score calculation
- Trading signal generation
- User alert management
- Notification delivery

## Technology Stack

### Backend Technologies
- **Framework**: Fastify.js (High-performance Node.js framework)
- **Language**: JavaScript (ES6+)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi schema validation
- **Database ORM**: Sequelize (PostgreSQL), Mongoose (MongoDB)
- **Caching**: Redis with ioredis client
- **WebSockets**: Socket.IO for real-time updates

### Frontend Technologies
- **Framework**: Vanilla JavaScript with modern ES6+
- **Styling**: Tailwind CSS
- **Charts**: ECharts.js, Chart.js, TradingView
- **Animations**: Animate.css, Typed.js
- **Particles**: p5.js for visual effects
- **PWA**: Service Worker for offline support

### Machine Learning Stack
- **Framework**: FastAPI (Python)
- **Language**: Python 3.9+
- **ML Libraries**: TensorFlow, scikit-learn, NLTK
- **Sentiment Analysis**: VADER, TextBlob
- **Data Processing**: Pandas, NumPy
- **API Documentation**: Swagger/OpenAPI

### Database Technologies
- **Primary Database**: PostgreSQL 14+
- **Document Store**: MongoDB 5+
- **Cache Layer**: Redis 6+
- **Search Engine**: Elasticsearch (optional)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Load Balancing**: Nginx upstream
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston, Morgan

## Database Design

### PostgreSQL Schema

#### Users Table
```sql
CREATE TABLE users (
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
```

#### Trading Signals Table
```sql
CREATE TABLE trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) NOT NULL, -- BUY, SELL, HOLD
    entry_price DECIMAL(10,4),
    target_price DECIMAL(10,4),
    stop_loss DECIMAL(10,4),
    confidence_score DECIMAL(5,2),
    ai_fusion_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

#### Market Data Table
```sql
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    volume BIGINT,
    change_percent DECIMAL(5,2),
    high DECIMAL(10,4),
    low DECIMAL(10,4),
    open DECIMAL(10,4),
    close DECIMAL(10,4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_symbol_timestamp (symbol, timestamp)
);
```

### MongoDB Collections

#### News Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  source: String,
  category: String,
  sentiment_score: Number,
  market_impact: String,
  symbols: [String],
  published_at: Date,
  created_at: Date
}
```

#### User Activities Collection
```javascript
{
  _id: ObjectId,
  user_id: UUID,
  action: String,
  details: Object,
  ip_address: String,
  user_agent: String,
  timestamp: Date
}
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+919876543210",
  "language": "en"
}
```

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "subscription_type": "premium"
  }
}
```

### Market Data Endpoints

#### GET /api/market/real-time
Query Parameters:
- `symbols`: Comma-separated list of symbols
- `exchange`: NSE, BSE (default: NSE)

Response:
```json
{
  "data": [
    {
      "symbol": "RELIANCE",
      "price": 2456.78,
      "change": 45.23,
      "change_percent": 1.88,
      "volume": 1234567,
      "timestamp": "2024-11-23T10:30:00Z"
    }
  ]
}
```

#### GET /api/market/historical
Query Parameters:
- `symbol`: Stock symbol
- `interval`: 1m, 5m, 15m, 1h, 1d, 1w
- `period`: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max

### Trading Signals Endpoints

#### GET /api/signals/current
Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "signals": [
    {
      "id": "uuid",
      "symbol": "TCS",
      "signal_type": "BUY",
      "entry_price": 3456.78,
      "target_price": 3600.00,
      "stop_loss": 3350.00,
      "confidence_score": 85.5,
      "ai_fusion_score": 7.8,
      "created_at": "2024-11-23T09:00:00Z"
    }
  ]
}
```

### News Endpoints

#### GET /api/news/sentiment
Query Parameters:
- `symbol`: Stock symbol (optional)
- `category`: market, company, economy (optional)
- `limit`: Number of news items (default: 20)

## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with expiration
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Role-Based Access**: User, Admin, Super Admin roles
- **Subscription Control**: Feature access based on subscription tier

### Security Headers
```javascript
// Implemented security headers
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

### Input Validation
- **Joi Schemas**: Request validation for all endpoints
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **Rate Limiting**: API request throttling

### Data Encryption
- **Password Hashing**: bcrypt with salt rounds
- **Sensitive Data**: Encryption at rest for PII
- **API Communication**: HTTPS/TLS 1.3
- **Database Connections**: SSL/TLS encryption

## Deployment Architecture

### Docker Configuration

#### docker-compose.yml
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/trading_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "8080:80"

  ml-services:
    build: ./ml-services
    ports:
      - "8000:8000"
    environment:
      - PYTHON_ENV=production

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=trading_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:5
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=pass
    volumes:
      - mongodb_data:/data/db

volumes:
  postgres_data:
  redis_data:
  mongodb_data:
```

### Production Deployment

#### Environment Variables
```bash
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/trading_db
REDIS_URL=redis://host:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
ENCRYPTION_KEY=your-encryption-key

# Frontend
REACT_APP_API_URL=https://api.panchmukhi-trading.com
REACT_APP_WS_URL=wss://ws.panchmukhi-trading.com

# ML Services
PYTHON_ENV=production
MODEL_PATH=/app/models
```

#### SSL/TLS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name panchmukhi-trading.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Logging

### Logging Strategy
- **Application Logs**: Winston logger with different levels
- **Access Logs**: Morgan for HTTP request logging
- **Error Logs**: Centralized error tracking
- **Audit Logs**: User activity tracking

### Monitoring Setup
```javascript
// Prometheus metrics
const client = require('prom-client');

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users'
});

const tradingSignalsGenerated = new client.Counter({
  name: 'trading_signals_generated_total',
  help: 'Total number of trading signals generated'
});
```

### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      ml_service: await checkMLService()
    }
  };
  
  res.status(200).json(health);
});
```

## Mobile Application

### React Native Implementation
```javascript
// Main App Component
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './src/store';

import DashboardScreen from './src/screens/DashboardScreen';
import SectorScreen from './src/screens/SectorScreen';
import IPOScreen from './src/screens/IPOScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Sectors" component={SectorScreen} />
          <Tab.Screen name="IPO" component={IPOScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
```

### Key Mobile Features
- **Push Notifications**: Real-time trading alerts
- **Offline Support**: Cached data for offline viewing
- **Biometric Authentication**: Fingerprint/Face ID
- **Deep Linking**: Direct navigation to specific screens
- **Native Modules**: Platform-specific features

### Mobile API Integration
```javascript
// API service
class APIService {
  constructor() {
    this.baseURL = 'https://api.panchmukhi-trading.com';
    this.wsURL = 'wss://ws.panchmukhi-trading.com';
  }

  async getTradingSignals() {
    const response = await fetch(`${this.baseURL}/api/signals/current`, {
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`
      }
    });
    return response.json();
  }

  connectToWebSocket() {
    this.ws = new WebSocket(this.wsURL);
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };
  }
}
```

## Future Enhancements

### Phase 2 Features
1. **Options Trading Analysis**
   - Options chain analysis
   - Greeks calculations
   - Volatility analysis
   - Options strategies builder

2. **Portfolio Management**
   - Portfolio tracking
   - Performance analytics
   - Risk assessment
   - Rebalancing suggestions

3. **Social Trading**
   - Copy trading features
   - Community insights
   - Expert recommendations
   - Performance leaderboards

4. **Advanced Analytics**
   - Backtesting engine
   - Monte Carlo simulations
   - Risk metrics (VaR, Sharpe ratio)
   - Correlation analysis

### Phase 3 Features
1. **Algorithmic Trading**
   - Strategy builder
   - Automated trading bots
   - Risk management rules
   - Performance tracking

2. **Advanced ML Models**
   - Deep learning predictions
   - Reinforcement learning
   - Ensemble methods
   - Real-time model updates

3. **Global Markets**
   - International stock exchanges
   - Forex trading
   - Cryptocurrency support
   - Commodities trading

### Technical Improvements
1. **Microservices Migration**
   - Kubernetes orchestration
   - Service mesh (Istio)
   - API versioning
   - Blue-green deployments

2. **Performance Optimization**
   - CDN integration
   - Database sharding
   - Caching strategies
   - Load testing

3. **Enhanced Security**
   - Multi-factor authentication
   - Advanced fraud detection
   - Compliance frameworks
   - Security audits

## Conclusion

Panchmukhi Trading Brain Pro represents a comprehensive, production-ready trading platform that combines advanced AI/ML capabilities with robust infrastructure and security. The architecture is designed to scale and evolve with changing market needs while maintaining high performance and reliability.

The platform's unique five-source data integration approach provides users with unparalleled market insights, making it a valuable tool for both novice and experienced traders in the Indian market.

---

**Document Version**: 1.0  
**Last Updated**: November 23, 2024  
**Author**: Panchmukhi Trading Brain Pro Development Team