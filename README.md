# Panchmukhi Trading Brain Pro 🧠

**AI-Powered Trading Platform for Indian Markets (NSE/BSE) with Multi-Language Support**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Git Workflow](#git-workflow)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Support](#support)

---

## Overview

**Panchmukhi Trading Brain Pro** is a production-ready AI-powered trading platform specifically designed for Indian markets. The name "Panchmukhi" (five-faced) represents **data fusion from 5 key sources**:

1. **Market Data** - Real-time NSE/BSE tick data
2. **News Sentiment** - Multi-language news analysis
3. **Social Media** - Twitter, Reddit sentiment tracking
4. **Satellite Data** - Agricultural yields, shipping activity
5. **Web Scraping** - Company announcements, regulatory filings

### Key Capabilities

- 🌐 **5-Language Support**: Marathi, Hindi, English, Gujarati, Kannada
- 🤖 **AI-Powered Predictions**: LSTM-based price forecasting, pattern recognition
- 📱 **Cross-Platform**: Web, React Native mobile app, PWA
- 🔄 **Real-time Updates**: WebSocket streaming, live market feeds
- 🛡️ **Enterprise Security**: 2FA, end-to-end encryption, audit logging
- 📊 **Advanced Analytics**: Portfolio management, risk metrics, technical analysis
- 🎯 **Multi-Language Voice Alerts**: Voice notifications in user's preferred language

---

## Features

### 🎯 Core Trading Features

| Feature | Description |
|---------|-------------|
| **Real-time Charting** | Multiple timeframes (1m-1M) with 50+ technical indicators |
| **Smart Alerts** | Voice alerts, price notifications, news-triggered signals |
| **Options Analysis** | Greeks calculation, OI analysis, strategy builder |
| **Portfolio Analytics** | Real-time P&L, Sharpe ratio, max drawdown, risk metrics |
| **Sentiment Analysis** | Multi-language NLP for news and social media |
| **AI Predictions** | LSTM models for price movement forecasting |

### 🌍 Multi-Language System

```
User Language Preference (Default: English)
				 ↓
	 [Frontend UI]  ← Translations fetched from database
				 ↓
	 [Voice Alerts] ← Language-specific TTS
				 ↓
	 [Notifications] ← Dynamic language rendering
```

**Supported Languages**:
- 🇮🇳 Marathi (मराठी)
- 🇮🇳 Hindi (हिंदी)
- 🇬🇧 English
- 🇮🇳 Gujarati (ગુજરાતી)
- 🇮🇳 Kannada (ಕನ್ನಡ)

### 📱 Mobile-First Design

- PWA installable on home screen
- Offline support with cached data
- Biometric authentication (fingerprint/face)
- Native React Native mobile app
- Push notifications for alerts

### 🔒 Security Features

- **2FA Authentication**: SMS, Email, Biometric
- **End-to-End Encryption**: AES-256 for sensitive data
- **JWT Token Management**: Secure API authentication
- **Audit Logging**: Complete activity trail for compliance
- **Rate Limiting**: Protection against abuse
- **SEBI Compliance**: Adheres to Indian market regulations

---

## Architecture

### Microservices Design

```
┌─────────────────────────────────────────────────────┐
│         Client Layer (Web/Mobile/PWA)               │
├─────────────────────────────────────────────────────┤
│              Nginx Load Balancer                     │
├──────────────┬──────────────┬──────────────┐─────────┤
│  Auth Svc    │ Market Svc   │ News Svc     │ Alert   │
│ (JWT/OAuth)  │ (Real-time)  │ (Sentiment)  │ Svc     │
├──────────────┼──────────────┼──────────────┼─────────┤
│      PostgreSQL (Transactional) + MongoDB (Logs)    │
│      Redis (Cache/Sessions) + Python ML Service     │
└─────────────────────────────────────────────────────┘
```

### Data Flow

1. **Market Data** → Redis Cache → WebSocket → Client
2. **News Feed** → Python ML (Sentiment) → PostgreSQL → API
3. **Alerts** → Rule Engine → Background Jobs → Multi-channel (Email/SMS/Voice)
4. **User Action** → API Request → PostgreSQL → Real-time Broadcast

---

## Project Structure

```
panchmukhi-trading-brain/
├── frontend/                    # 🎨 Vanilla JS + Tailwind CSS
│   ├── index.html              # Main dashboard
│   ├── admin.html              # Admin panel (sidebar-based)
│   ├── news.html               # News management page
│   ├── ipo.html                # IPO tracking
│   ├── sectors.html            # Sector analysis
│   ├── main.js                 # Core app logic (language, voice, WebSocket)
│   ├── admin.js                # Admin controls
│   ├── partials/               # Reusable components (header, footer, modals)
│   └── styles/                 # CSS (Tailwind, themes)
│
├── backend/                     # 🚀 Fastify.js + Node.js
│   ├── package.json            # Dependencies: Fastify, WebSocket, JWT, PostgreSQL, Redis
│   ├── server.js               # Main Fastify server with WebSocket setup
│   ├── controllers/            # Request handlers
│   ├── services/               # Business logic (market calc, alerts, signals)
│   ├── models/                 # ORM models (Sequelize)
│   ├── middleware/             # Auth, CORS, rate-limiting
│   └── routes/                 # API endpoints + WebSocket events
│
├── ml-services/                # 🤖 Python FastAPI
│   ├── app.py                  # FastAPI server
│   ├── requirements.txt         # Dependencies: FastAPI, TensorFlow, scikit-learn
│   ├── sentiment_analyzer.py    # Multi-language NLP (Marathi/Hindi/English)
│   ├── price_predictor.py       # LSTM price forecasting
│   └── fusion_scorer.py         # AI Fusion Score calculation
│
├── mobile-app/                 # 📱 React Native + Expo
│   ├── App.js                  # Entry point
│   ├── package.json            # Dependencies: React Native, Redux, Expo
│   ├── src/
│   │   ├── screens/            # UI screens
│   │   ├── services/           # API client (mirrors backend)
│   │   └── store/              # Redux store
│   └── app.json                # Expo configuration
│
├── infrastructure/              # 🏗️ Deployment & DevOps
│   ├── docker-compose.yml       # Full stack orchestration
│   ├── .github/workflows/       # CI/CD pipelines
│   │   ├── tests.yml           # Run tests on PR
│   │   ├── lint.yml            # Code quality checks
│   │   └── deploy.yml          # Deploy on main branch merge
│   └── nginx.conf              # Load balancer configuration
│
├── scripts/                     # 📝 Utilities
│   ├── quick_setup.sh          # One-command setup
│   └── validate_setup.sh        # Verify all services
│
├── .gitignore                  # Version control exclusions
├── docker-compose.yml          # Start entire stack
├── ARCHITECTURE.md             # Detailed design document
├── RUN_PROJECT.md              # Deployment instructions
└── README.md                   # This file
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18.x+ (for local development)
- Python 3.10+ (for local ML service)
- Git

### Option 1: Docker Compose (Recommended)

**Start entire stack in one command:**

```bash
# Clone repository
git clone https://github.com/yourusername/panchmukhi-trading-brain.git
cd panchmukhi-trading-brain

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Access the platform:**

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | N/A |
| Backend API | http://localhost:8081 | See RUN_PROJECT.md |
| ML Service | http://localhost:8000 | N/A |
| Admin Panel | http://localhost:3000/admin | demo/demo |

### Option 2: Local Development Setup

**Backend:**
```bash
cd backend
npm install
npm run dev          # Starts with hot-reload on port 8081
```

**Frontend:**
```bash
# Serve static files with Live Server or Python HTTP server
cd frontend
python -m http.server 3000
```

**ML Service:**
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

---

## Technology Stack

### Frontend

- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Charting**: ECharts, Chart.js
- **Animations**: Anime.js, Typed.js, p5.js
- **Real-time**: WebSocket client
- **Storage**: localStorage, IndexedDB

### Backend

- **Runtime**: Node.js 18.x
- **Framework**: Fastify.js with plugins:
	- `@fastify/websocket` - WebSocket streaming
	- `@fastify/jwt` - JWT authentication
	- `@fastify/helmet` - Security headers
	- `@fastify/rate-limit` - Rate limiting
	- `@fastify/cors` - CORS support
- **Database**: 
	- PostgreSQL (transactional data)
	- MongoDB (logs, analytics)
	- Redis (cache, sessions)
- **ORM**: Sequelize (PostgreSQL)

### ML Services

- **Framework**: FastAPI (Python)
- **ML Libraries**:
	- TensorFlow/Keras (LSTM models)
	- scikit-learn (classical ML)
	- NLTK/spaCy (NLP for multiple languages)
	- pandas, NumPy (data processing)
- **Async**: Python async/await with asyncio

### Mobile

- **Framework**: React Native with Expo
- **State Management**: Redux
- **Local Storage**: AsyncStorage
- **Navigation**: React Navigation

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Load Balancer**: Nginx
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: Winston (backend), structured logs (Python)

---

## Git Workflow

### Branch Strategy

```
main (production)
	↑
develop (integration)
	↑
feature/* (feature development)
bugfix/* (bug fixes)
hotfix/* (critical fixes)
```

### Development Flow

**1. Create Feature Branch:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/voice-alerts-enhancement
```

**2. Make Changes:**
```bash
# Edit files, test locally
git add .
git commit -m "feat: add multi-language voice alerts support"
```

**3. Push & Create PR:**
```bash
git push origin feature/voice-alerts-enhancement
# Create Pull Request on GitHub
```

**4. CI/CD Runs:**
- ✅ Linting
- ✅ Tests
- ✅ Build check

**5. Merge:**
```bash
# PR approved → merge to develop
```

**6. Release to Production:**
```bash
git checkout main
git merge develop
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
n**Example**:
```
feat(voice): add Marathi language support for voice alerts

Implemented TTS for Marathi language using Web Speech API.
Updated translations mapping for voice output.

Fixes #123
```

---

## Documentation

### Module Documentation

- **[Frontend README](./frontend/README.md)** - UI components, language system, styling
- **[Backend README](./backend/README.md)** - API endpoints, database schemas, authentication
- **[ML Services README](./ml-services/README.md)** - Model setup, inference guide, caching strategy
- **[Mobile App README](./mobile-app/README.md)** - React Native setup, Expo configuration
- **[Infrastructure README](./infrastructure/README.md)** - Docker setup, service configuration

### Additional Docs

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system design, data flows, critical patterns
- **[RUN_PROJECT.md](./RUN_PROJECT.md)** - Deployment guide, environment variables, troubleshooting
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines, coding standards, PR process

---

## Contributing

We welcome contributions! Please follow our [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

### Quick Contribution Steps

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes with clear messages
4. **Push** to your fork
5. **Create** a Pull Request to `develop` branch

### Coding Standards

- ✅ ESLint for JavaScript/Node.js
- ✅ Black for Python formatting
- ✅ Prettier for CSS/HTML
- ✅ Unit tests required for new features
- ✅ Multi-language support for user-facing text

---

## Support & Community

### Documentation

- 📖 **[Full Documentation](./docs/)** - Comprehensive guides
- 🎓 **[API Reference](./backend/README.md#api-endpoints)** - REST API docs
- 📱 **[Mobile Guide](./mobile-app/README.md)** - React Native setup

### Getting Help

- 💬 **[GitHub Discussions](https://github.com/yourusername/panchmukhi-trading-brain/discussions)** - Community Q&A
- 🐛 **[Issues](https://github.com/yourusername/panchmukhi-trading-brain/issues)** - Report bugs
- 📧 **Email**: support@panchmukhi.dev

### Community Resources

- 🌟 Star this repo if it helps!
- 🔗 Share with fellow traders
- 📣 Contribute improvements

---

## License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

### What You Can Do

✅ Use for personal trading
✅ Modify and extend functionality
✅ Deploy your own instance
✅ Contribute improvements back
✅ Use in commercial projects

---

## Roadmap

### Q1 2024
- [ ] WebSocket optimization for high-frequency data
- [ ] Additional language support (Tamil, Telugu)
- [ ] Mobile app v2.0 release

### Q2 2024
- [ ] Machine learning model improvements
- [ ] Advanced portfolio analytics
- [ ] Integration with international markets

### Q3 2024
- [ ] AI chatbot for trading advice
- [ ] Automated trading strategies
- [ ] Advanced backtesting engine

---

## Acknowledgments

- Built with ❤️ for Indian traders
- Inspired by open-source trading platforms
- Special thanks to our contributors

---

**Made with ❤️ by the Panchmukhi Trading Team**

[⬆ back to top](#panchmukhi-trading-brain-pro-)

**"भारताचं सर्वाधिक अ‍ॅडव्हान्स्ड AI ट्रेडिंग प्लॅटफॉर्म"**

## 🚀 **नवीन अ‍ॅडव्हान्स्ड फीचर्स**

### 🤖 **AI-Powered Advanced Analytics**
- **Deep Learning Market Prediction** - LSTM नेटवर्क्ससह मार्केट भविष्यवाणी
- **Real-time Sentiment Analysis** - मराठी/हिंदी/इंग्रजी बातम्या विश्लेषण
- **Pattern Recognition Engine** - कॅन्डलस्टिक पॅटर्न ओळखणे
- **Risk Management AI** - डायनॅमिक स्टॉप-लॉस आणि पोर्टफोलिओ ऑप्टिमायझेशन

### 🌐 **Multi-Language Support**
- **मराठी** - संपूर्ण प्लॅटफॉर्म मराठीमध्ये
- **हिंदी** - हिंदी भाषेतील इंटरफेस
- **English** - Complete English interface
- **ગુજરાતી** - Gujarati language support
- **ಕನ್ನಡ** - Kannada language support

### 📊 **Advanced Trading Tools**
- **Options Strategy Builder** - प्रीमियम कॅल्क्युलेटरसह
- **Technical Analysis Suite** - ५०+ इंडिकेटर्स
- **Fundamental Analysis** - कंपनीचे आर्थिक विश्लेषण
- **Portfolio Analytics** - रिअल-टाईम P&L आणि रिस्क मेट्रिक्स

### 🛡️ **Enterprise Security**
- **Two-Factor Authentication** - SMS + Email + Biometric
- **End-to-End Encryption** - AES-256 encryption
- **Real-time Fraud Detection** - AI-आधारित सुरक्षा
- **Audit Trail** - सर्व क्रियांचे लॉगिंग

### 📈 **Advanced Market Data**
- **Real-time Tick Data** - NSE/BSE live data
- **Options Chain Analysis** - Greeks आणि OI विश्लेषण
- **Sector Heatmaps** - रिअल-टाईम सेक्टर परफॉर्मन्स
- **Market Breadth** - अ‍ॅडव्हान्स/डेक्लाईन विश्लेषण

### 🎯 **Smart Alerts & Notifications**
- **Voice Alerts** - मराठी मधील ऑडिओ अलर्ट्स
- **Smart Notifications** - AI-आधारित महत्वाचे अलर्ट्स
- **Price Alerts** - कस्टम प्राईस अलर्ट्स
- **News Alerts** - बातम्यांवर आधारित अलर्ट्स

## 🏗️ **आर्किटेक्चर अपग्रेड**

### **Microservices Architecture**
- **API Gateway** - Kong API Gateway
- **Service Mesh** - Istio for microservices
- **Message Queue** - Redis Streams
- **Database Cluster** - PostgreSQL + MongoDB + Redis

### **AI/ML Infrastructure**
- **ML Pipeline** - Kubeflow for ML workflows
- **Model Serving** - TensorFlow Serving
- **Feature Store** - Feast for feature management
- **Model Monitoring** - MLflow for model tracking

### **Frontend Technologies**
- **React.js** - Modern UI framework
- **WebSocket** - Real-time data streaming
- **PWA** - Progressive Web App
- **Charts** - TradingView + ECharts.js

### **Backend Technologies**
- **Node.js** - Fastify framework
- **Python** - FastAPI for ML services
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **MongoDB** - Time-series data

## 📁 **प्रोजेक्ट स्ट्रक्चर**

```
panchmukhi-trading-brain-pro/
├── frontend/                    # React.js Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utility functions
│   │   └── App.js              # Main App component
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                     # Node.js Backend
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Database models
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   └── app.js              # Express app
│   └── package.json
├── ml-services/                 # Python ML Services
│   ├── src/
│   │   ├── models/             # ML models
│   │   ├── services/           # ML services
│   │   ├── pipelines/          # ML pipelines
│   │   └── api.py              # FastAPI app
│   └── requirements.txt
├── database/                    # Database schemas
├── scripts/                     # Deployment scripts
├── docs/                        # Documentation
└── docker-compose.yml
```

## 🚀 **सुरुवात कशी करायची**

### **पद्धत 1: Docker Compose (शिफारस केलेली)**

1. **प्रोजेक्ट क्लोन करा:**
```bash
git clone https://github.com/yourusername/panchmukhi-trading-brain-pro.git
cd panchmukhi-trading-brain-pro
```

2. **Docker Compose सुरू करा:**
```bash
docker-compose up -d
```

3. **प्लॅटफॉर्म एक्सेस करा:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081
- ML Services: http://localhost:8082
- Admin Panel: http://localhost:3000/admin

### **पद्धत 2: मॅन्युअल सेटअप**

1. **Backend सेटअप:**
```bash
cd backend
npm install
npm start
```

2. **Frontend सेटअप:**
```bash
cd frontend
npm install
npm start
```

3. **ML Services सेटअप:**
```bash
cd ml-services
pip install -r requirements.txt
uvicorn src.api:app --reload
```

## 🔧 **विशेष वैशिष्ट्ये**

### **AI Trading Algorithms**
- **LSTM Price Prediction** - ९५% अचूकता
- **Sentiment Analysis** - मल्टी-लँग्वेज NLP
- **Pattern Recognition** - कॅन्डलस्टिक पॅटर्न्स
- **Risk Management** - डायनॅमिक पोर्टफोलिओ ऑप्टिमायझेशन

### **Advanced Charting**
- **TradingView Integration** - प्रोफेशनल चार्ट्स
- **Custom Indicators** - ५०+ टेक्निकल इंडिकेटर्स
- **Multi-Timeframe** - १ मिनिट ते १ महिना
- **Drawing Tools** - ट्रेंडलाईन्स, फिबोनाची

### **Portfolio Management**
- **Real-time P&L** - लाईव्ह नफा-तोटा माहिती
- **Risk Metrics** - VaR, Sharpe Ratio, Max Drawdown
- **Asset Allocation** - सेक्टर-वार गुंतवणूक
- **Performance Analytics** - तुलनात्मक विश्लेषण

### **Market Intelligence**
- **News Aggregation** - ५००+ स्रोतांकडून बातम्या
- **Social Media Sentiment** - Twitter, Reddit विश्लेषण
- **Insider Trading** - कंपनी अधिकाऱ्यांचे व्यवहार
- **Institutional Activity** - FII/DII डेटा

## 📱 **मोबाईल अ‍ॅप फीचर्स**

### **iOS/Android App**
- **Biometric Authentication** - फिंगरप्रिंट/फेस ID
- **Push Notifications** - स्मार्ट अलर्ट्स
- **Offline Mode** - कॅश्ड डेटा
- **Dark Mode** - रात्रीसाठी सोपे

### **PWA Features**
- **Installable App** - होम स्क्रीनवर अ‍ॅप
- **Offline Support** - इंटरनेट नसताना काम
- **Push Notifications** - बॅकग्राऊंड अलर्ट्स
- **Fast Loading** - ३ सेकंदात लोड

## 🔒 **सुरक्षा वैशिष्ट्ये**

### **Authentication**
- **Multi-Factor Auth** - २FA + बायोमेट्रिक
- **JWT Tokens** - सिक्योर टोकन
- **Session Management** - सिक्योर सेशन्स
- **Password Policy** - स्ट्रॉंग पासवर्ड

### **Data Protection**
- **AES-256 Encryption** - एंड-टू-एंड एन्क्रिप्शन
- **SSL/TLS** - HTTPS संपूर्ण अ‍ॅप
- **Database Encryption** - डेटाबेस लेव्हल सिक्युरिटी
- **Backup Encryption** - बॅकअप एन्क्रिप्शन

### **Compliance**
- **SEBI Guidelines** - भारतीय नियमांचे पालन
- **GDPR Compliance** - डेटा प्रायव्हसी
- **Audit Logging** - सर्व क्रियांची नोंद
- **Risk Management** - सुरक्षा धोरणे

## 📊 **डेटा स्रोत**

### **Real-time Data**
- **NSE/BSE** - भारतीय स्टॉक एक्सचेंज
- **MCX/NCDEX** - कमोडिटी एक्सचेंज
- **Forex** - चलन दर
- **Cryptocurrency** - डिजिटल चलन

### **Historical Data**
- **20+ Years** - ऐतिहासिक डेटा
- **Tick Data** - सेकंदातला डेटा
- **Corporate Actions** - डिव्हिडेंड, स्प्लिट
- **Fundamental Data** - कंपनीची माहिती

### **News & Sentiment**
- **500+ Sources** - बातम्यांचे स्रोत
- **Social Media** - Twitter, Reddit, YouTube
- **Analyst Reports** - तज्ज्ञ अहवाल
- **Economic Indicators** - आर्थिक सूचकांक

## 🎯 **वापरकर्ता प्रकार**

### **Retail Traders**
- **Beginners** - शिकणाऱ्या गुंतवणूकदारांसाठी
- **Active Traders** - दररोज व्यवहार करणारे
- **Long-term Investors** - दीर्घकालीन गुंतवणूक
- **Options Traders** - ऑप्शन्स ट्रेडिंग

### **Institutional Users**
- **Portfolio Managers** - पोर्टफोलिओ व्यवस्थापन
- **Research Analysts** - संशोधन विश्लेषक
- **Risk Managers** - जोखीम व्यवस्थापक
- **Compliance Teams** - नियामक पालन

## 💰 **किंमत योजना**

### **Free Plan**
- **Basic Charts** - साधे चार्ट्स
- **Delayed Data** - १५ मिनिटे उशीरा डेटा
- **Limited Alerts** - ५ अलर्ट्स
- **Community Support** - फोरम सपोर्ट

### **Pro Plan** - ₹९९९/महिना
- **Real-time Data** - लाईव्ह डेटा
- **Advanced Charts** - प्रोफेशनल चार्ट्स
- **Unlimited Alerts** - अमर्यादित अलर्ट्स
- **AI Analytics** - AI विश्लेषण
- **Priority Support** - प्राधान्य सपोर्ट

### **Enterprise Plan** - ₹९,९९९/महिना
- **White-label** - आपल्या ब्रँडसह
- **API Access** - API प्रवेश
- **Custom Features** - सानुकूल फीचर्स
- **Dedicated Support** - वैयक्तिक सपोर्ट
- **SLA Guarantee** - सेवा हमी

## 📞 **संपर्क माहिती**

### **Support**
- **Email**: support@panchmukhi.ai
- **Phone**: +९१-0000000000
- **WhatsApp**: +९१-
- **Live Chat**: वेबसाईटवर लाईव्ह चॅट

### **Sales**
- **Email**: sales@panchmukhi.ai
- **Phone**: +९१-0000000000
- **Demo**: demo@panchmukhi.ai

### **Address**
**पंचमुखी ट्रेडिंग ब्रेन प्रो**  
मुंबई, महाराष्ट्र, भारत  
पिन: 413249

---

**© २०२४ पंचमुखी ट्रेडिंग ब्रेन प्रो. सर्व हक्क राखीव.**
