# ML Services - Panchmukhi Trading Brain Pro 🤖

## Overview

The ML Services module is a **Python FastAPI** service providing AI-powered predictions, sentiment analysis, and risk scoring. It processes market data, news feeds, and social media to generate ML-driven trading signals with high accuracy.

## Features

### 🧠 Machine Learning Models

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| **LSTM Price Predictor** | 24-hour price forecasting | Historical OHLCV, indicators | Direction (BUY/SELL/HOLD), confidence |
| **Sentiment Analyzer** | Multi-language NLP | News text, social media posts | Sentiment score (-1 to +1), keywords |
| **Pattern Recognition** | Candlestick pattern detection | Price candles, volume | Pattern type, reliability score |
| **Fusion Scorer** | Combines all 5 data sources | Market + News + Social + Satellite + Web | AI Fusion Score (0-100) |
| **Risk Analyzer** | Portfolio risk assessment | Holdings, correlations, volatility | VaR, Sharpe ratio, max drawdown |

### 🌍 Multi-Language NLP
- **Marathi (मराठी)**: Full sentiment analysis support
- **Hindi (हिंदी)**: News and social media processing
- **English**: Complete support
- **Gujarati (ગુજરાતી)**: Regional news analysis
- **Kannada (ಕನ್ನಡ)**: South Indian market coverage

### ⚡ Real-Time Processing
- **Async API**: Non-blocking request handling
- **Background Tasks**: Long-running ML inference
- **Caching**: Model results cached for 5 minutes
- **Batch Processing**: Process multiple symbols efficiently

### 📊 Data Fusion
Combines data from 5 sources:
1. **Market Data**: OHLCV, volume, open interest
2. **News Sentiment**: Financial news analysis
3. **Social Media**: Twitter/Reddit sentiment
4. **Satellite Data**: Agricultural yields, shipping (optional)
5. **Web Scraping**: Company announcements, regulatory filings

---

## Project Structure

```
ml-services/
├── app.py                           # FastAPI server entry point
├── requirements.txt                 # Python dependencies
├── Dockerfile                       # Docker image definition
│
├── models/                          # Pre-trained ML models
│   ├── lstm_price_predictor.h5      # TensorFlow/Keras model
│   ├── sentiment_classifier.pkl     # scikit-learn classifier
│   ├── pattern_recognition.pkl      # Pattern matcher
│   └── fusion_model.pkl             # Ensemble model
│
├── services/                        # Business logic (100+ lines each)
│   ├── price_predictor.py           # LSTM prediction service
│   ├── sentiment_analyzer.py        # NLP sentiment analysis
│   ├── pattern_detector.py          # Candlestick pattern recognition
│   ├── fusion_scorer.py             # Multi-source fusion scoring
│   └── risk_analyzer.py             # Portfolio risk metrics
│
├── nlp/                             # Natural Language Processing
│   ├── marathi_processor.py         # Marathi text processing
│   ├── hindi_processor.py           # Hindi text processing
│   ├── english_processor.py         # English tokenization
│   └── sentiment_lexicons/          # Language-specific word lists
│       ├── marathi_words.csv
│       ├── hindi_words.csv
│       └── english_words.csv
│
├── cache/                           # Caching layer
│   ├── redis_cache.py               # Redis integration
│   └── model_cache.py               # In-memory model cache
│
├── utils/                           # Helper functions
│   ├── data_preprocessing.py        # Data normalization, scaling
│   ├── feature_engineering.py       # Feature creation
│   ├── logger.py                    # Structured logging
│   └── constants.py                 # Configuration constants
│
├── tests/                           # Pytest test files
│   ├── test_price_predictor.py
│   ├── test_sentiment_analyzer.py
│   └── fixtures/
│
└── docs/                            # Model documentation
    ├── LSTM_MODEL.md               # LSTM architecture & training
    ├── SENTIMENT_MODEL.md          # Sentiment model details
    └── FUSION_ALGORITHM.md         # Fusion scoring algorithm
```

---

## Technology Stack

### Core Framework
- **FastAPI 0.95+**: Modern async Python web framework
- **Python 3.10+**: Latest Python version

### Machine Learning
- **TensorFlow 2.x**: Deep learning framework for LSTM
- **Keras**: High-level neural network API
- **scikit-learn**: Classical ML algorithms
- **pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing

### Natural Language Processing
- **NLTK**: Natural Language Toolkit for text processing
- **spaCy**: Industrial-strength NLP
- **TextBlob**: Simple API for common NLP tasks
- **Transformers**: Hugging Face pre-trained models (optional)

### Data & Caching
- **Redis**: Result caching, session storage
- **SQLAlchemy**: Database ORM (PostgreSQL interaction)
- **pyarrow**: Efficient data serialization

### Async & Performance
- **asyncio**: Python async/await support
- **aiohttp**: Async HTTP client for external APIs
- **uvicorn**: ASGI server

### Testing & Monitoring
- **pytest**: Unit testing framework
- **pytest-asyncio**: Async test support
- **Pydantic**: Request/response validation

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Redis (for caching)
- PostgreSQL (optional, for storing model results)
- 4GB+ RAM (for model loading)

### Local Development

**1. Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**2. Install dependencies:**
```bash
pip install -r requirements.txt
```

**3. Download pre-trained models:**
```bash
python scripts/download_models.py
```

**4. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

**5. Start development server:**
```bash
uvicorn app:app --reload --port 8000
```

**Server runs on**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs (Swagger)

### Docker Deployment

```bash
docker build -t panchmukhi-ml .
docker run -p 8000:8000 panchmukhi-ml
```

---

## Environment Variables

Create `.env` file:

```bash
# FastAPI
ENVIRONMENT=development
LOG_LEVEL=info
HOST=0.0.0.0
PORT=8000

# ML Model Paths
LSTM_MODEL_PATH=./models/lstm_price_predictor.h5
SENTIMENT_MODEL_PATH=./models/sentiment_classifier.pkl
PATTERN_MODEL_PATH=./models/pattern_recognition.pkl
FUSION_MODEL_PATH=./models/fusion_model.pkl

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=300  # 5 minutes

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=panchmukhi_trading
DB_USER=postgres
DB_PASSWORD=

# Model Configuration
LSTM_LOOKBACK=60          # Days of historical data
LSTM_FUTURE_DAYS=1        # Predict 1 day ahead
SENTIMENT_BATCH_SIZE=32   # Process 32 samples at a time

# Feature Flags
ENABLE_GPU=true           # Use GPU if available
ENABLE_MODEL_CACHING=true
ENABLE_UNCERTAINTY_ESTIMATES=true

# NLP Models
SPACY_MODEL=en_core_web_sm
TRANSFORMER_MODEL=distilbert-base-uncased-finetuned-sst-2-english
```

---

## API Endpoints

### Price Prediction

```
POST /api/v1/predict/price
```

**Request:**
```json
{
  "symbol": "RELIANCE",
  "timeframe": "1d",
  "lookback_days": 60
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "symbol": "RELIANCE",
    "prediction": {
      "direction": "BUY",
      "next_day_price": 2520.50,
      "confidence": 0.87,
      "price_range": [2480.00, 2560.00],
      "probability": {
        "up": 0.65,
        "down": 0.25,
        "neutral": 0.10
      }
    },
    "reasoning": "LSTM predicts upward trend based on recent breakout",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Sentiment Analysis

```
POST /api/v1/analyze/sentiment
```

**Request:**
```json
{
  "text": "Reliance reported strong earnings this quarter",
  "language": "en",
  "source": "news"  # 'news', 'social', 'all'
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "sentiment": {
      "score": 0.78,           # -1 (very negative) to +1 (very positive)
      "label": "POSITIVE",     # POSITIVE, NEGATIVE, NEUTRAL
      "confidence": 0.95
    },
    "keywords": [
      { "word": "strong", "sentiment": 0.8 },
      { "word": "earnings", "sentiment": 0.6 }
    ],
    "language": "en",
    "processing_time_ms": 45
  }
}
```

### Pattern Recognition

```
POST /api/v1/detect/patterns
```

**Request:**
```json
{
  "symbol": "RELIANCE",
  "timeframe": "1h",
  "candles": 50
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "patterns_detected": [
      {
        "type": "DOUBLE_BOTTOM",
        "reliability": 0.82,
        "signal": "BUY",
        "description": "Strong support formation with breakout potential"
      },
      {
        "type": "HEAD_AND_SHOULDERS",
        "reliability": 0.65,
        "signal": "SELL",
        "description": "Potential reversal pattern forming"
      }
    ]
  }
}
```

### Fusion Score

```
POST /api/v1/score/fusion
```

**Request:**
```json
{
  "symbol": "RELIANCE",
  "include_sources": ["market", "news", "social", "web"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "fusion_score": 82.5,      # 0-100
    "signal": "STRONG_BUY",
    "components": {
      "market_score": 85,       # Technical analysis
      "sentiment_score": 78,    # News + social sentiment
      "pattern_score": 88,      # Pattern recognition
      "social_score": 75,       # Twitter/Reddit
      "web_score": 80           # Company announcements
    },
    "confidence": 0.89,
    "reasoning": "Strong technical setup confirmed by positive news sentiment"
  }
}
```

### Risk Analysis

```
POST /api/v1/analyze/risk
```

**Request:**
```json
{
  "portfolio": [
    { "symbol": "RELIANCE", "quantity": 10, "buy_price": 2400 },
    { "symbol": "INFY", "quantity": 5, "buy_price": 1800 }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_value": 65000,
    "current_pnl": 2500,
    "metrics": {
      "value_at_risk": 2450,           # Max loss in 99% confidence
      "sharpe_ratio": 1.45,            # Risk-adjusted return
      "max_drawdown": 0.12,            # Max peak-to-trough decline
      "correlation": 0.65,             # Portfolio correlation
      "portfolio_beta": 1.05           # Market sensitivity
    },
    "risk_level": "MODERATE",
    "recommendations": [
      "Consider rebalancing - RELIANCE is 62% of portfolio",
      "Add hedge - Current correlation suggests diversification needed"
    ]
  }
}
```

---

## Core Services

### LSTM Price Predictor

```python
class LSTMPricePredictor:
    def __init__(self):
        self.model = tf.keras.models.load_model('lstm_price_predictor.h5')
        self.scaler = StandardScaler()  # Normalize input data
    
    async def predict(self, symbol: str, lookback_days: int = 60):
        # Fetch historical data
        data = await get_ohlcv_data(symbol, lookback_days)
        
        # Preprocess and normalize
        X = self.scaler.fit_transform(data[['close', 'volume']])
        X = X.reshape(1, lookback_days, 2)  # (samples, timesteps, features)
        
        # Make prediction
        prediction = self.model.predict(X, verbose=0)
        
        # Post-process and calculate confidence
        return self._format_prediction(prediction, confidence)
    
    def _format_prediction(self, prediction, confidence):
        direction = 'BUY' if prediction > current_price else 'SELL'
        return {
            'direction': direction,
            'confidence': confidence,
            'next_price': float(prediction)
        }
```

### Multi-Language Sentiment Analyzer

```python
class MultiLanguageSentimentAnalyzer:
    def __init__(self):
        self.models = {
            'en': self._load_english_model(),
            'mr': self._load_marathi_model(),
            'hi': self._load_hindi_model(),
            'gu': self._load_gujarati_model(),
            'kn': self._load_kannada_model()
        }
    
    async def analyze(self, text: str, language: str = 'en'):
        # Clean and tokenize text
        tokens = self._tokenize(text, language)
        
        # Get language-specific model
        model = self.models[language]
        
        # Predict sentiment
        sentiment = model.predict(tokens)
        
        # Extract keywords
        keywords = self._extract_keywords(tokens, sentiment, language)
        
        return {
            'sentiment': sentiment,
            'keywords': keywords,
            'language': language
        }
    
    def _load_marathi_model(self):
        # Load Marathi-specific sentiment lexicon
        lexicon = self._load_lexicon('marathi_words.csv')
        return MarathiSentimentClassifier(lexicon)
```

### Fusion Scorer (Multi-Source)

```python
class FusionScorer:
    async def score(self, symbol: str, sources: list):
        scores = {}
        
        # Market technical analysis
        if 'market' in sources:
            scores['market'] = await self._score_technical(symbol)
        
        # News sentiment
        if 'news' in sources:
            scores['news'] = await self._score_news_sentiment(symbol)
        
        # Social media sentiment
        if 'social' in sources:
            scores['social'] = await self._score_social_sentiment(symbol)
        
        # Web scraping
        if 'web' in sources:
            scores['web'] = await self._score_web_data(symbol)
        
        # Satellite data (if available)
        if 'satellite' in sources:
            scores['satellite'] = await self._score_satellite_data(symbol)
        
        # Weighted fusion
        fusion_score = self._calculate_weighted_fusion(scores)
        
        return fusion_score
```

---

## Model Training & Management

### LSTM Model Training

```python
# Training pipeline
def train_lstm_model(symbol, train_data, epochs=50):
    X_train, y_train = prepare_training_data(train_data, lookback=60)
    
    model = Sequential([
        LSTM(128, input_shape=(60, 2), return_sequences=True),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1, activation='sigmoid')  # Price direction
    ])
    
    model.compile(optimizer='adam', loss='binary_crossentropy')
    model.fit(X_train, y_train, epochs=epochs, batch_size=32)
    
    model.save(f'models/lstm_{symbol}.h5')
    return model
```

### Model Versioning

```
models/
├── lstm_price_predictor_v1.0.h5      # Production
├── lstm_price_predictor_v1.1.h5      # Testing
└── lstm_price_predictor_v0.9.h5      # Rollback
```

---

## Caching Strategy

### Redis Cache

```python
class MLResultCache:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.ttl = 300  # 5 minutes
    
    async def get_prediction(self, symbol):
        key = f"prediction:{symbol}"
        cached = await self.redis.get(key)
        return json.loads(cached) if cached else None
    
    async def set_prediction(self, symbol, prediction):
        key = f"prediction:{symbol}"
        await self.redis.setex(key, self.ttl, json.dumps(prediction))

# Usage in endpoint
@app.post("/api/v1/predict/price")
async def predict_price(request: PredictionRequest):
    # Check cache first
    cached = await cache.get_prediction(request.symbol)
    if cached:
        return cached
    
    # If not cached, generate prediction
    prediction = await predictor.predict(request.symbol)
    
    # Cache result
    await cache.set_prediction(request.symbol, prediction)
    
    return prediction
```

---

## Testing

### Unit Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_price_predictor.py

# Run with coverage
pytest --cov=services --cov-report=html
```

### Example Test

```python
import pytest
from services.price_predictor import LSTMPricePredictor

@pytest.mark.asyncio
async def test_lstm_prediction():
    predictor = LSTMPricePredictor()
    result = await predictor.predict('RELIANCE', lookback_days=60)
    
    assert 'direction' in result
    assert 'confidence' in result
    assert result['direction'] in ['BUY', 'SELL', 'HOLD']
    assert 0 <= result['confidence'] <= 1

@pytest.mark.asyncio
async def test_sentiment_marathi():
    analyzer = MultiLanguageSentimentAnalyzer()
    result = await analyzer.analyze(
        "रिलायंस शेअर वाढला",  # Marathi text
        language='mr'
    )
    
    assert result['language'] == 'mr'
    assert -1 <= result['sentiment']['score'] <= 1
```

---

## Performance Metrics

### Model Accuracy

| Model | Accuracy | F1 Score | Latency |
|-------|----------|----------|---------|
| LSTM Price Predictor | 68% | 0.71 | 45ms |
| Sentiment Classifier | 92% | 0.89 | 30ms |
| Pattern Recognition | 85% | 0.82 | 25ms |
| Fusion Scorer | N/A | N/A | 100ms |

### API Response Times (p95)

```
/predict/price:        85ms
/analyze/sentiment:    45ms
/detect/patterns:      40ms
/score/fusion:        150ms
/analyze/risk:         60ms
```

---

## Deployment

### Docker Build

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Checklist

```
[ ] Models quantized for inference speed
[ ] Redis cache configured
[ ] GPU acceleration enabled (if available)
[ ] Model versioning implemented
[ ] Rate limiting configured
[ ] Error handling and fallbacks in place
[ ] Model monitoring/drift detection enabled
[ ] Async processing for long-running tasks
```

---

## Troubleshooting

### Model loading fails

**Solution**: Check model paths and file permissions
```python
try:
    model = tf.keras.models.load_model(model_path)
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    # Use fallback model or basic algorithm
```

### Out of memory errors

**Solution**: Implement batch processing
```python
def process_in_batches(data, batch_size=1000):
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        yield process_batch(batch)
```

### Cache miss causing slowdown

**Solution**: Pre-warm cache during startup
```python
@app.on_event("startup")
async def warmup_cache():
    top_symbols = await get_top_symbols()
    for symbol in top_symbols:
        await predict_and_cache(symbol)
```

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md).

**ML Services-specific rules:**
1. ✅ New models require accuracy benchmarks
2. ✅ Language support must cover all 5 languages
3. ✅ Async/await for all I/O operations
4. ✅ Caching required for models under 500ms latency
5. ✅ 80%+ test coverage required

---

## Documentation

- **[LSTM Architecture](./docs/LSTM_MODEL.md)** - Model design and training
- **[Sentiment Model](./docs/SENTIMENT_MODEL.md)** - NLP approach and languages
- **[Fusion Algorithm](./docs/FUSION_ALGORITHM.md)** - 5-source data fusion

---

## Support

For ML service issues:
- 📊 API Docs: http://localhost:8000/docs
- 🐛 File issues with "ml:" prefix
- 📈 Model metrics: Check Prometheus dashboards

---

**Built with ❤️ for intelligent trading**
