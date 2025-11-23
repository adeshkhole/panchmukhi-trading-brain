# Backend - Panchmukhi Trading Brain Pro 🚀

## Overview

The backend is a **Fastify.js** server built on **Node.js** providing RESTful APIs and real-time WebSocket streaming for the trading platform. It handles authentication, market data caching, trading signal generation, alert management, and ML service integration.

## Features

### 🔐 Authentication & Security
- **JWT Tokens**: Secure API authentication with refresh tokens
- **2FA Support**: SMS/Email verification, biometric preparation
- **Rate Limiting**: Prevent abuse with token bucket algorithm
- **CORS**: Proper cross-origin request handling
- **HTTPS/TLS**: End-to-end encryption support

### 📊 Real-Time Market Data
- **WebSocket Streaming**: Live price updates to all connected clients
- **Redis Caching**: In-memory market data caching with TTL
- **Multi-Symbol Support**: NSE/BSE stocks, options, commodities
- **Broadcast Events**: Efficient message distribution

### 🎯 Trading Signal Generation
- **Signal Algorithms**: Technical analysis-based signal generation
- **ML Integration**: Call to Python FastAPI for advanced predictions
- **Confidence Scoring**: Risk assessment with confidence percentages
- **Persistent Storage**: PostgreSQL storage for audit trail

### 📢 Alert System
- **Multi-Channel**: Email, SMS, WebSocket, voice notifications
- **Rule-Based**: Create custom alert conditions
- **Background Jobs**: Process alerts via queue system
- **Delivery Tracking**: Track alert delivery status

### 🌍 Multi-Language Support
- **Language Preference Storage**: Per-user language in PostgreSQL
- **Translation API**: Serve language-specific content
- **Voice Alert Integration**: Pass language preference to frontend

### 📱 Mobile API Compatibility
- **Standardized Response Format**: Consistent JSON structure for all endpoints
- **Pagination Support**: Handle large datasets efficiently
- **Filtering & Sorting**: RESTful query parameters
- **Version Control**: API versioning (`/api/v1/...`)

---

## Project Structure

```
backend/
├── package.json              # Dependencies & npm scripts
├── server.js                 # Main Fastify server entry point
│
├── controllers/              # Request handlers (150+ lines each)
│   ├── auth.controller.js    # Login, register, 2FA
│   ├── market.controller.js  # Price data, symbols
│   ├── signal.controller.js  # Trading signals CRUD
│   ├── alert.controller.js   # Alert management
│   ├── user.controller.js    # Profile, preferences
│   └── admin.controller.js   # System administration
│
├── services/                 # Business logic (200+ lines each)
│   ├── auth.service.js       # JWT generation, password hashing
│   ├── market.service.js     # Price calculations, indicators
│   ├── signal.service.js     # Signal algorithm logic
│   ├── alert.service.js      # Alert generation & delivery
│   ├── ml.service.js         # Call to Python FastAPI
│   └── cache.service.js      # Redis caching logic
│
├── models/                   # Sequelize ORM models
│   ├── user.model.js         # Users table
│   ├── signal.model.js       # Trading signals table
│   ├── alert.model.js        # Alerts table
│   ├── price.model.js        # Historical prices
│   └── index.js              # Model associations
│
├── middleware/               # Express-like middleware
│   ├── auth.middleware.js    # JWT verification
│   ├── errorHandler.js       # Global error handling
│   ├── requestLogger.js      # Request/response logging
│   └── validation.js         # Input validation (Joi)
│
├── routes/                   # API endpoints
│   ├── auth.routes.js        # /api/v1/auth/*
│   ├── market.routes.js      # /api/v1/market/*
│   ├── signal.routes.js      # /api/v1/signals/*
│   ├── alert.routes.js       # /api/v1/alerts/*
│   ├── user.routes.js        # /api/v1/users/*
│   └── index.js              # Route aggregation
│
├── websocket/                # WebSocket event handlers
│   ├── handlers.js           # Event processing logic
│   ├── broadcast.js          # Message broadcasting
│   └── events.js             # Event type definitions
│
├── config/                   # Configuration
│   ├── database.js           # PostgreSQL/MongoDB connection
│   ├── redis.js              # Redis client setup
│   ├── env.js                # Environment variables
│   └── constants.js          # Application constants
│
├── utils/                    # Helper functions
│   ├── logger.js             # Winston logging setup
│   ├── response.js           # Standard response format
│   ├── validation.js         # Joi schemas
│   └── helpers.js            # General utilities
│
├── jobs/                     # Background jobs
│   ├── alertProcessor.js     # Process & send alerts
│   ├── priceUpdater.js       # Update market prices
│   └── signalGenerator.js    # Generate trading signals
│
├── migrations/               # Database migrations
│   ├── 001_create_users.js
│   ├── 002_create_signals.js
│   └── 003_create_alerts.js
│
└── tests/                    # Jest test files
    ├── auth.test.js
    ├── market.test.js
    ├── signal.test.js
    └── fixtures/
```

---

## Technology Stack

### Core Framework
- **Fastify 4.x**: Lightweight, high-performance web framework
- **Node.js 18.x**: JavaScript runtime

### Plugins
```json
{
  "@fastify/websocket": "WebSocket support",
  "@fastify/jwt": "JWT authentication",
  "@fastify/helmet": "Security headers (CORS, CSP)",
  "@fastify/rate-limit": "Rate limiting protection",
  "@fastify/cors": "CORS handling",
  "@fastify/multer": "File uploads"
}
```

### Database
- **PostgreSQL 14+**: Primary relational database
  - Users, trading signals, alerts, preferences
  - Transactional integrity with ACID guarantees
- **MongoDB**: Time-series data and logs (optional)
  - Price history, news sentiment, analytics
- **Redis 7.x**: Caching and sessions
  - Market data cache, JWT blacklist, rate limit counters

### ORM & Query Builders
- **Sequelize**: PostgreSQL ORM with migrations
- **Joi**: Input validation schemas

### Authentication
- **jsonwebtoken**: JWT generation/verification
- **bcryptjs**: Password hashing

### API Documentation
- **Swagger/OpenAPI**: Auto-generated API docs (optional)

### Logging & Monitoring
- **Winston**: Structured logging
- **Morgan**: HTTP request logging

---

## Installation & Setup

### Prerequisites
- Node.js 18.x
- PostgreSQL 14+
- Redis 7.x
- Python 3.10+ (for ML service communication)

### Local Development

**1. Install dependencies:**
```bash
cd backend
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

**3. Database setup:**
```bash
npm run migrate        # Run Sequelize migrations
npm run seed          # Load sample data
```

**4. Start development server:**
```bash
npm run dev           # Starts with Nodemon (hot-reload)
```

**Server runs on**: http://localhost:8081

### Docker Deployment

Handled by `docker-compose.yml` - all services start together:

```bash
docker-compose up -d backend
```

---

## Environment Variables

Create `.env` file:

```bash
# Server
NODE_ENV=development
PORT=8081
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=panchmukhi_trading
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=30000

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=15

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/panchmukhi/backend.log

# Email (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# SMS (for alerts)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

---

## API Endpoints

### Authentication

```
POST   /api/v1/auth/register        # Create account
POST   /api/v1/auth/login           # Login with credentials
POST   /api/v1/auth/refresh         # Refresh JWT token
POST   /api/v1/auth/logout          # Logout (blacklist token)
POST   /api/v1/auth/2fa/setup       # Enable 2FA
POST   /api/v1/auth/2fa/verify      # Verify 2FA code
```

### Market Data

```
GET    /api/v1/market/prices/:symbol              # Latest price
GET    /api/v1/market/chart/:symbol?tf=1h&days=1 # Chart data
GET    /api/v1/market/symbols?exchange=NSE        # List symbols
GET    /api/v1/market/search?q=reliance          # Search symbols
```

### Trading Signals

```
GET    /api/v1/signals                      # List all signals (paginated)
GET    /api/v1/signals/:id                  # Get signal details
POST   /api/v1/signals                      # Create new signal
PUT    /api/v1/signals/:id                  # Update signal
DELETE /api/v1/signals/:id                  # Delete signal
GET    /api/v1/signals/stats/daily          # Signal performance stats
```

### Alerts

```
GET    /api/v1/alerts                       # List user's alerts
GET    /api/v1/alerts/:id                   # Get alert details
POST   /api/v1/alerts                       # Create alert
PUT    /api/v1/alerts/:id                   # Update alert
DELETE /api/v1/alerts/:id                   # Delete alert
POST   /api/v1/alerts/:id/test              # Send test notification
```

### User Profile & Preferences

```
GET    /api/v1/users/me                     # Get current user
PUT    /api/v1/users/me                     # Update profile
GET    /api/v1/users/preferences            # Get language, theme, settings
PUT    /api/v1/users/preferences            # Update preferences
```

### Admin

```
GET    /api/v1/admin/users                  # List all users
GET    /api/v1/admin/stats                  # System statistics
POST   /api/v1/admin/config/update          # Update system config
GET    /api/v1/admin/logs                   # View system logs
```

### WebSocket Events

```
CONNECT    /ws                      # Establish connection (auth via query)
SUBSCRIBE  market:SYMBOL            # Subscribe to symbol updates
SUBSCRIBE  alerts:user              # Subscribe to user alerts
SUBSCRIBE  signals:generated        # Subscribe to signal events
UNSUBSCRIBE market:SYMBOL           # Unsubscribe from updates
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',  -- 'mr', 'hi', 'en', 'gu', 'kn'
  theme VARCHAR(10) DEFAULT 'light',  -- 'light' or 'dark'
  is_2fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Trading Signals Table
```sql
CREATE TABLE trading_signals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol VARCHAR(20) NOT NULL,
  signal_type VARCHAR(20) NOT NULL,  -- 'BUY', 'SELL', 'HOLD'
  entry_price DECIMAL(10, 2),
  target_price DECIMAL(10, 2),
  stop_loss DECIMAL(10, 2),
  confidence DECIMAL(5, 2),           -- 0-100
  ml_score DECIMAL(5, 2),             -- From Python service
  reason TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'EXPIRED'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Alerts Table
```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol VARCHAR(20),
  condition VARCHAR(100),             -- e.g., "price > 500"
  threshold DECIMAL(10, 2),
  notification_type VARCHAR(50),      -- 'email', 'sms', 'voice', 'push'
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Key Services

### Market Service

```javascript
// Fetch latest prices with caching
async getPrices(symbols) {
  // Check Redis cache first
  const cached = await redis.mget(symbols);
  
  // Fetch missing symbols from API
  const missing = symbols.filter((_, i) => !cached[i]);
  if (missing.length > 0) {
    const fresh = await fetchFromNSE(missing);
    await redis.mset(fresh, 3600); // Cache 1 hour
  }
  
  return { ...cached, ...fresh };
}

// Calculate technical indicators
async calculateIndicators(symbol, timeframe) {
  const candles = await getCandleData(symbol, timeframe);
  return {
    sma20: SMA(candles, 20),
    rsi14: RSI(candles, 14),
    macd: MACD(candles),
    // ... 50+ indicators
  };
}
```

### Signal Generation Service

```javascript
async generateSignal(symbol) {
  const market = await marketService.getMarketData(symbol);
  const indicators = await marketService.calculateIndicators(symbol, '1h');
  
  // Call ML service for advanced prediction
  const mlPrediction = await mlService.predict({
    symbol,
    marketData: market,
    indicators: indicators
  });
  
  // Generate signal
  const signal = {
    symbol,
    signal_type: mlPrediction.direction, // 'BUY', 'SELL'
    confidence: mlPrediction.confidence,
    ml_score: mlPrediction.score,
    reason: `${indicators.reason} + ML: ${mlPrediction.reason}`
  };
  
  return await signalModel.create(signal);
}
```

### Alert Service

```javascript
async processAlerts() {
  const alerts = await alertModel.findAll({ status: 'ACTIVE' });
  
  for (const alert of alerts) {
    const currentPrice = await marketService.getPrice(alert.symbol);
    
    if (this.evaluateCondition(alert.condition, currentPrice)) {
      // Send notification
      await this.sendNotification({
        user_id: alert.user_id,
        type: alert.notification_type,
        message: `${alert.symbol} crossed ${alert.threshold}`
      });
    }
  }
}
```

---

## WebSocket Integration

### Connection Flow

```javascript
// Client connects with auth
ws = new WebSocket('ws://localhost:8081/ws?token=jwt_token');

// Subscribe to events
ws.send(JSON.stringify({
  action: 'subscribe',
  channel: 'market:RELIANCE'
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'market:update', symbol: 'RELIANCE', price: 2500.50 }
};
```

### Server Broadcasting

```javascript
// Broadcast to all connected clients
async broadcastMarketUpdate(symbol, priceData) {
  const message = JSON.stringify({
    type: 'market:update',
    symbol,
    ...priceData
  });
  
  // Send to all subscribers of this symbol
  for (const connection of getSubscribers(`market:${symbol}`)) {
    connection.send(message);
  }
}
```

---

## Authentication Flow

```
User Login Request
       ↓
Verify email + password
       ↓
Generate JWT tokens (access + refresh)
       ↓
Store refresh token in Redis blacklist
       ↓
Return both tokens to client
       ↓
Client stores in localStorage
       ↓
Subsequent requests include JWT in Authorization header
       ↓
Middleware verifies JWT signature
```

### JWT Structure
```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    sub: user_id,
    email: "trader@example.com",
    language: "mr",
    exp: 1704067200  // 24 hours
  }
}
```

---

## ML Service Integration

### Prediction Request

```javascript
// Call Python ML service
async predict(params) {
  const response = await fetch('http://ml-service:8000/predict', {
    method: 'POST',
    body: JSON.stringify({
      symbol: 'RELIANCE',
      market_data: {...},
      indicators: {...},
      language: 'mr'  // For Marathi insights
    })
  });
  
  return await response.json();
  // Returns: { direction: 'BUY', confidence: 0.87, score: 8.5 }
}
```

---

## Coding Standards

### Request/Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": { /* actual data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_SYMBOL",
    "message": "Symbol not found"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Input Validation (Joi)

```javascript
const signalSchema = Joi.object({
  symbol: Joi.string().uppercase().required(),
  signal_type: Joi.string().valid('BUY', 'SELL', 'HOLD').required(),
  entry_price: Joi.number().positive().required(),
  confidence: Joi.number().min(0).max(100).required()
});

// Validate in controller
await signalSchema.validateAsync(request.body);
```

---

## Testing

### Run Tests

```bash
npm test                    # Run all tests
npm test -- --coverage     # Generate coverage report
npm test -- --watch        # Watch mode
```

### Example Test

```javascript
describe('Market Service', () => {
  it('should fetch and cache prices', async () => {
    const prices = await marketService.getPrices(['RELIANCE']);
    
    expect(prices['RELIANCE']).toBeDefined();
    expect(prices['RELIANCE']).toHaveProperty('price');
    expect(prices['RELIANCE']).toHaveProperty('timestamp');
  });
});
```

---

## Performance Optimization

### Caching Strategy

| Data | TTL | Storage |
|------|-----|---------|
| Market prices | 30 sec | Redis |
| Chart data | 1 hour | Redis |
| User preferences | 24 hours | Redis |
| Trading signals | No cache | PostgreSQL |

### Database Indexing

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_signals_user_id ON trading_signals(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_prices_symbol_timestamp ON price_history(symbol, timestamp);
```

---

## Deployment

### Production Checklist

```
[ ] All environment variables configured
[ ] Database migrations run
[ ] Redis connection verified
[ ] ML service endpoint reachable
[ ] JWT secrets rotated
[ ] Rate limiting configured
[ ] Error logging enabled
[ ] CORS origins whitelisted
[ ] SSL/TLS certificates installed
```

### Kubernetes Deployment (Optional)

See `infrastructure/k8s/` for example manifests.

---

## Troubleshooting

### WebSocket connection drops

**Solution**: Implement client-side reconnect:
```javascript
if (ws.readyState === WebSocket.CLOSED) {
  setTimeout(() => initializeWebSocket(), 3000);
}
```

### JWT token expired

**Solution**: Use refresh token endpoint
```javascript
if (error.code === 'TOKEN_EXPIRED') {
  const newToken = await refreshToken(refreshToken);
  retryRequest(originalRequest, newToken);
}
```

### ML service timeout

**Solution**: Add timeout and fallback
```javascript
Promise.race([
  mlService.predict(...),
  timeout(30000)
]).catch(() => generateBasicSignal(...));
```

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md).

**Backend-specific rules:**
1. ✅ All new endpoints require Joi validation schema
2. ✅ Database changes require migration file
3. ✅ WebSocket messages must have type field
4. ✅ Error codes must be documented
5. ✅ 85%+ test coverage required

---

## Support

For backend issues:
- 📖 Check [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
- 🐛 File issues with "backend:" prefix
- 📊 API documentation: http://localhost:8081/docs (Swagger)

---

**Built with ❤️ for high-performance trading**
