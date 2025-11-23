# Panchmukhi Trading Brain Pro - Copilot Instructions

## Project Overview

**Panchmukhi Trading Brain Pro** is an AI-powered trading platform for Indian markets (NSE/BSE) with multi-language support (Marathi, Hindi, English, Gujarati, Kannada). The name "Panchmukhi" (five-faced) represents data fusion from five sources: Market Data, News Sentiment, Social Media, Satellite Data, and Web Scraping.

### Core Stack
- **Backend**: Fastify.js (Node.js) + Python FastAPI (ML services)
- **Frontend**: Vanilla JavaScript with ECharts/Chart.js + React Native mobile app
- **Databases**: PostgreSQL (main), MongoDB (time-series), Redis (cache)
- **Infrastructure**: Docker Compose, Nginx load balancer

---

## Architecture & Data Flow

### Multi-Service Architecture
```
Client (Web/Mobile) → Load Balancer (Nginx) → API Gateway (Fastify)
    ↓
[Auth Service] [Market Service] [News Service] [Alert Service]
    ↓
[PostgreSQL] [MongoDB] [Redis] [Python ML Service]
```

**Key architectural principles:**
- **Microservices separation**: Each service (Auth, Market, News, Alerts) operates independently with clear boundaries
- **Real-time via WebSocket**: Fastify with `@fastify/websocket` for live market updates and alerts
- **ML fusion scoring**: Python FastAPI service calculates AI Fusion Score combining all data sources
- **Multi-language from DB**: Language strings stored in database, frontend fetches based on user preference (e.g., `language: 'mr'` for Marathi)

### Critical Integration Points
1. **Frontend → Backend**: REST API calls + WebSocket for real-time updates
2. **Backend → ML Service**: HTTP requests for sentiment analysis, predictions, fusion score calculation
3. **Cache strategy**: Redis for market data caching (deque with maxlen=1000), session storage, rate limiting
4. **Database reads**: PostgreSQL for users/trading signals, MongoDB for analytics/logs, Redis for hot data

---

## Key Project Patterns

### 1. Language Support System
- **Implementation**: Language key stored in user preferences (`language: 'mr'|'hi'|'en'|'gu'|'kn'`)
- **Frontend files**: `main.js` has `translations[lang][key]` pattern using data attributes `[data-lang-key]`
- **When modifying**: Always check user `language` preference field and update `translations` object
- **Files to reference**: `main.js` (lines ~40-60), `app.py` (sentiment analysis for different languages)

### 2. Voice Integration
- **Pattern**: `speakText(text)` method speaks language-specific audio using Web Speech API
- **Voice settings stored**: `voiceSettings.language` synced with user language preference
- **Used for**: Market alerts, trading signals, voice commands
- **When building**: Ensure voice output respects user language selection; test with `voiceSettings.enabled = true`

### 3. Real-time WebSocket Connection
- **Backend setup**: `@fastify/websocket` plugin in `server.js`
- **Frontend connection**: `initializeWebSocket()` in `main.js` establishes persistent connection
- **Message types**: Market updates, alerts, news feed, user notifications
- **Reconnection**: Auto-reconnect on connection loss
- **When adding features**: Use WebSocket for streaming data, REST for transactional operations

### 4. Data Caching Strategy
- **Market data**: Stored in-memory deque in `app.py` (maxlen=1000 prevents memory bloat)
- **User sessions**: Redis via `@fastify/jwt`
- **Model cache**: ML model predictions cached to avoid redundant calculations
- **TTL pattern**: Sentiment analysis results cached separately from market predictions
- **Invalidation**: Cache invalidated on new market events or after TTL expiry

### 5. Mobile-First Considerations
- **React Native app**: `mobile-app/` uses Expo framework with Redux store management
- **Shared API layer**: `mobile-app/src/services/api.js` mirrors backend API structure
- **Offline support**: AsyncStorage for cached data, offline notifications queued
- **Performance**: Charts use `react-native-chart-kit`, lighter than web versions

---

## Development Workflows

### Running the Project
```bash
# Development (all services with hot-reload)
docker-compose up -d --build
# Backend: http://localhost:8081
# Frontend: http://localhost:3000  
# ML Service: http://localhost:8000
# Redis: localhost:6379
# PostgreSQL: localhost:5432

# Local backend development (without Docker)
cd backend && npm install && npm run dev

# Local Python ML service
cd . && pip install -r requirements.txt && uvicorn app:app --reload --port 8000
```

### Key npm Scripts
- `npm run dev` - Start with hot reload (Nodemon)
- `npm test` - Run Jest tests
- `npm run lint` - Check code quality with ESLint
- `npm run migrate` - Database migrations
- `npm run seed` - Populate sample data

### Testing Strategy
- **Backend**: Jest tests in `__tests__/` directory, mock Redis/PostgreSQL
- **Frontend**: Client-side tests for translation rendering, WebSocket reconnection
- **ML Service**: Validate sentiment scores against known test inputs
- **Integration**: Test complete flow: market update → WebSocket broadcast → client rendering

---

## Code Organization & Conventions

### Backend Structure (`server.js` & `backend/`)
- **Controllers**: Request handling logic, input validation (Joi schemas)
- **Models**: Database schema definitions (Sequelize for PostgreSQL, Mongoose for MongoDB)
- **Services**: Business logic (market calculations, alert generation, fusion scoring)
- **Middleware**: CORS, JWT auth, rate limiting via `@fastify/helmet` & `@fastify/rate-limit`
- **Convention**: RESTful endpoints `/api/v1/{resource}`, WebSocket events on `/ws`

### Frontend Structure
- **HTML templates**: `index.html`, `admin.html`, `ipo.html`, `sectors.html`
- **JavaScript modules**: `main.js` (primary app), `admin.js`, `ipo.js`, `sectors.js`
- **Styling**: Tailwind CSS with custom theme system (dark/light mode in `themes.css`)
- **Convention**: Data attributes for dynamic content, Web Components for reusability

### Python ML Service (`app.py`)
- **Request models**: Pydantic BaseModel with validators for type safety
- **Caching**: Global dictionaries (`model_cache`, `prediction_cache`, `sentiment_cache`)
- **Response format**: Always return `{"status": "success"|"error", "data": {...}, "timestamp": ...}`
- **Convention**: Async endpoints for I/O operations, background tasks for long-running ML

---

## Common Tasks & Solutions

### Adding a New Trading Signal
1. **Define in backend**: Create endpoint `/api/v1/signals/{type}` that calls market calculation service
2. **ML enrichment**: Send to Python service for prediction confidence scoring
3. **Real-time broadcast**: Emit WebSocket event `signal:generated` to connected clients
4. **Frontend rendering**: Subscribe to WebSocket event, update signals array, refresh chart
5. **Persistence**: Store in PostgreSQL `trading_signals` table with user_id, timestamp, confidence

### Multi-language Content Updates
1. **Add key to translations**: `translations = { 'mr': { 'newKey': 'मराठी मजकूर' }, 'en': { 'newKey': 'English text' } }`
2. **HTML template**: Add `<span data-lang-key="newKey"></span>`
3. **Update handler**: Call `setLanguage()` method to refresh all translated elements
4. **Backend labels**: Fetch language-specific strings from database for API responses

### Debugging Real-Time Issues
- **WebSocket connection**: Check browser console for connection URL, verify Fastify logs for `/ws` route
- **Market data lag**: Monitor Redis cache hit rate, check Python ML service response time
- **Language rendering**: Check localStorage for `tradingBrainLanguage` key, verify data attributes match translation keys
- **Mobile sync**: Verify Redux store dispatch in `mobile-app/src/store/` matches backend response structure

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `server.js` | Fastify API gateway & WebSocket setup |
| `app.py` | Python ML services (sentiment, predictions, fusion score) |
| `main.js` | Primary frontend app class with language/voice/WebSocket logic |
| `docker-compose.yml` | Service orchestration (PostgreSQL, Redis, MongoDB, containers) |
| `backend/package.json` | Node dependencies (Fastify, WebSocket, JWT, DB clients) |
| `ARCHITECTURE.md` | Detailed system design & database schemas |
| `RUN_PROJECT.md` | Deployment & environment setup guide |

---

## Critical Conventions & Gotchas

⚠️ **Language preference is user-specific**: Always check `user.language` before rendering text—don't assume English
⚠️ **WebSocket vs REST**: Use WebSocket only for streaming; use REST for state changes (authentication, settings)
⚠️ **Database consistency**: PostgreSQL for transactional data (users, signals), MongoDB for append-only logs
⚠️ **ML service latency**: Sentiment analysis can take 100-500ms; cache aggressively, use background tasks
⚠️ **Voice setup**: Test with both `voiceSettings.enabled=true` and `enabled=false` to avoid breaking silent mode

---

## Questions to Ask Before Major Changes

1. **Will this affect real-time data flow?** → Update WebSocket event types in all clients
2. **Does this involve user data?** → Ensure multi-language support and authentication checks
3. **Is this a database schema change?** → Create migration script, update both PostgreSQL & MongoDB schemas
4. **Will this impact mobile app?** → Verify API response format matches React Native store expectations
5. **Does this need ML inference?** → Route through Python service, add caching if called frequently
