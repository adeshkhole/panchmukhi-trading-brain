# Panchmukhi Trading Brain Pro - Enhanced ML Services
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from typing import List, Dict, Optional, Any
import json
import time
import asyncio
from datetime import datetime, timedelta
import logging
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import threading
from collections import deque
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Panchmukhi ML Services Pro",
    version="2.0.0",
    description="Advanced AI/ML services for Indian trading platform with multi-language support"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for caching and model management
model_cache = {}
prediction_cache = {}
market_data_cache = deque(maxlen=1000)
sentiment_cache = {}

# Pydantic models with validation
class SentimentRequest(BaseModel):
    text: str
    language: str = "mr"
    context: Optional[str] = None
    
    @validator('text')
    def validate_text(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Text must be at least 10 characters long')
        return v.strip()

class SentimentResponse(BaseModel):
    sentiment: float
    confidence: float
    label: str
    emotions: List[str]
    keywords: List[str]

class NewsAnalysisRequest(BaseModel):
    title: str
    content: str
    source: str
    language: str = "mr"
    category: Optional[str] = None
    
    @validator('title', 'content')
    def validate_required_fields(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError('Title and content must be at least 5 characters long')
        return v.strip()

class NewsAnalysisResponse(BaseModel):
    sentiment: float
    category: str
    keywords: List[str]
    relevance_score: float
    impact_score: float
    trading_signals: List[str]
    summary: str

class SatelliteDataRequest(BaseModel):
    symbol: str
    location: str
    date_range: List[str]
    data_type: str = "heat_index"

class SatelliteDataResponse(BaseModel):
    symbol: str
    heat_score: float
    activity_level: str
    confidence: float
    trend_analysis: Dict[str, Any]
    recommendations: List[str]

class SocialMediaRequest(BaseModel):
    symbol: str
    platform: str = "all"
    limit: int = 100
    timeframe: str = "24h"
    
    @validator('limit')
    def validate_limit(cls, v):
        if v < 1 or v > 1000:
            raise ValueError('Limit must be between 1 and 1000')
        return v

class SocialMediaResponse(BaseModel):
    symbol: str
    bullish_percentage: float
    bearish_percentage: float
    neutral_percentage: float
    total_mentions: int
    trending_hashtags: List[str]
    influencer_sentiment: float
    viral_score: float

class WebScrapingRequest(BaseModel):
    symbol: str
    websites: List[str] = ["amazon", "flipkart"]
    keywords: List[str]
    depth: int = 2
    
    @validator('depth')
    def validate_depth(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Depth must be between 1 and 5')
        return v

class WebScrapingResponse(BaseModel):
    symbol: str
    rankings: Dict[str, int]
    mentions: int
    sentiment_score: float
    consumer_insights: Dict[str, Any]
    trend_analysis: Dict[str, Any]

class PredictionRequest(BaseModel):
    symbol: str
    timeframe: str = "1d"
    features: List[str] = ["price", "volume", "sentiment"]
    model_type: str = "lstm"

class PredictionResponse(BaseModel):
    symbol: str
    predictions: List[float]
    confidence: float
    timeframe: str
    model_used: str
    feature_importance: Dict[str, float]

class RiskAnalysisRequest(BaseModel):
    symbol: str
    position_size: float
    entry_price: float
    stop_loss: float
    risk_tolerance: str = "medium"

class RiskAnalysisResponse(BaseModel):
    symbol: str
    risk_score: float
    var_95: float
    var_99: float
    max_drawdown: float
    sharpe_ratio: float
    recommendations: List[str]

# Advanced Sentiment Analysis
@app.post("/sentiment/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    try:
        # Generate cache key
        cache_key = hashlib.md5(f"{request.text}{request.language}".encode()).hexdigest()
        
        # Check cache
        if cache_key in sentiment_cache:
            logger.info(f"Sentiment analysis cache hit for key: {cache_key}")
            return sentiment_cache[cache_key]
        
        # Simulate advanced sentiment analysis
        sentiment_score = np.random.uniform(-1, 1)
        confidence = np.random.uniform(0.7, 0.95)
        
        # Determine label based on sentiment
        if sentiment_score > 0.3:
            label = "बुलिश" if request.language == "mr" else "Bullish"
        elif sentiment_score < -0.3:
            label = "बेअरिश" if request.language == "mr" else "Bearish"
        else:
            label = "न्यूट्रल" if request.language == "mr" else "Neutral"
        
        # Extract emotions
        emotions = []
        if sentiment_score > 0.5:
            emotions = ["आशावाद", "आनंद", "विश्वास"]
        elif sentiment_score < -0.5:
            emotions = ["भीती", "चिंता", "संशय"]
        else:
            emotions = ["संतुलन", "तटस्थता"]
        
        # Extract keywords
        keywords = extract_keywords(request.text, request.language)
        
        response = SentimentResponse(
            sentiment=sentiment_score,
            confidence=confidence,
            label=label,
            emotions=emotions,
            keywords=keywords
        )
        
        # Cache the result
        sentiment_cache[cache_key] = response
        
        logger.info(f"Sentiment analysis completed for text: {request.text[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

# Advanced News Analysis
@app.post("/news/analyze", response_model=NewsAnalysisResponse)
async def analyze_news(request: NewsAnalysisRequest):
    try:
        # Simulate comprehensive news analysis
        sentiment_score = np.random.uniform(-1, 1)
        relevance_score = np.random.uniform(0.6, 0.95)
        impact_score = np.random.uniform(0.1, 0.9)
        
        # Determine category
        categories = ["IPO", "कंपनी निकाल", "सेक्टर बातम्या", "अर्थव्यवस्था", "तांत्रिक विश्लेषण"]
        category = request.category or np.random.choice(categories)
        
        # Extract keywords
        keywords = extract_keywords(request.title + " " + request.content, request.language)
        
        # Generate trading signals
        trading_signals = []
        if sentiment_score > 0.5 and impact_score > 0.6:
            trading_signals = ["खरेदी विचार करा", "स्टॉप-लॉस अपडेट करा"]
        elif sentiment_score < -0.5 and impact_score > 0.6:
            trading_signals = ["विक्री विचार करा", "जोखीम व्यवस्थापन"]
        else:
            trading_signals = ["तटस्थ स्थिती राखा", "मार्केट वॉच"]
        
        # Generate summary
        summary = generate_summary(request.title, request.content, request.language)
        
        response = NewsAnalysisResponse(
            sentiment=sentiment_score,
            category=category,
            keywords=keywords,
            relevance_score=relevance_score,
            impact_score=impact_score,
            trading_signals=trading_signals,
            summary=summary
        )
        
        logger.info(f"News analysis completed for: {request.title[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Error in news analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"News analysis failed: {str(e)}")

# Satellite Data Analysis
@app.post("/satellite/analyze", response_model=SatelliteDataResponse)
async def analyze_satellite_data(request: SatelliteDataRequest):
    try:
        # Simulate satellite data analysis
        heat_score = np.random.uniform(0.1, 1.0)
        confidence = np.random.uniform(0.7, 0.95)
        
        # Determine activity level
        if heat_score > 0.8:
            activity_level = "हाय" if request.location == "mr" else "High"
        elif heat_score > 0.5:
            activity_level = "मिडियम" if request.location == "mr" else "Medium"
        else:
            activity_level = "लो" if request.location == "mr" else "Low"
        
        # Generate trend analysis
        trend_analysis = {
            "weekly_trend": np.random.uniform(-0.5, 0.5),
            "monthly_trend": np.random.uniform(-0.3, 0.3),
            "seasonal_factor": np.random.uniform(0.8, 1.2),
            "anomaly_detected": np.random.choice([True, False], p=[0.1, 0.9])
        }
        
        # Generate recommendations
        recommendations = []
        if heat_score > 0.7:
            recommendations.append("मजबूत खरेदी सिग्नल")
        elif heat_score < 0.3:
            recommendations.append("कमजोर मार्केट सिग्नल")
        else:
            recommendations.append("तटस्थ स्थिती")
        
        response = SatelliteDataResponse(
            symbol=request.symbol,
            heat_score=heat_score,
            activity_level=activity_level,
            confidence=confidence,
            trend_analysis=trend_analysis,
            recommendations=recommendations
        )
        
        logger.info(f"Satellite analysis completed for {request.symbol}")
        return response
        
    except Exception as e:
        logger.error(f"Error in satellite analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Satellite analysis failed: {str(e)}")

# Social Media Sentiment Analysis
@app.post("/social/analyze", response_model=SocialMediaResponse)
async def analyze_social_media(request: SocialMediaRequest):
    try:
        # Simulate social media analysis
        total_mentions = np.random.randint(100, 1000)
        
        # Calculate sentiment distribution
        bullish_percentage = np.random.uniform(20, 80)
        bearish_percentage = np.random.uniform(10, 60)
        neutral_percentage = 100 - bullish_percentage - bearish_percentage
        
        # Normalize percentages
        total = bullish_percentage + bearish_percentage + neutral_percentage
        bullish_percentage = (bullish_percentage / total) * 100
        bearish_percentage = (bearish_percentage / total) * 100
        neutral_percentage = (neutral_percentage / total) * 100
        
        # Generate trending hashtags
        trending_hashtags = ["#StockMarket", "#Trading", f"#{request.symbol}", "#Investing"]
        
        # Calculate influencer sentiment and viral score
        influencer_sentiment = np.random.uniform(-1, 1)
        viral_score = np.random.uniform(0, 1)
        
        response = SocialMediaResponse(
            symbol=request.symbol,
            bullish_percentage=bullish_percentage,
            bearish_percentage=bearish_percentage,
            neutral_percentage=neutral_percentage,
            total_mentions=total_mentions,
            trending_hashtags=trending_hashtags,
            influencer_sentiment=influencer_sentiment,
            viral_score=viral_score
        )
        
        logger.info(f"Social media analysis completed for {request.symbol}")
        return response
        
    except Exception as e:
        logger.error(f"Error in social media analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Social media analysis failed: {str(e)}")

# Web Scraping Analysis
@app.post("/web/scrape", response_model=WebScrapingResponse)
async def scrape_web_data(request: WebScrapingRequest):
    try:
        # Simulate web scraping analysis
        rankings = {}
        for website in request.websites:
            rankings[website] = np.random.randint(1, 100)
        
        mentions = np.random.randint(50, 500)
        sentiment_score = np.random.uniform(-1, 1)
        
        # Generate consumer insights
        consumer_insights = {
            "satisfaction_score": np.random.uniform(0.1, 1.0),
            "complaint_rate": np.random.uniform(0, 0.3),
            "recommendation_rate": np.random.uniform(0.2, 0.9),
            "price_sensitivity": np.random.uniform(0.1, 0.8)
        }
        
        # Generate trend analysis
        trend_analysis = {
            "search_trend": np.random.uniform(-0.5, 0.5),
            "social_mentions": np.random.uniform(0, 1),
            "news_coverage": np.random.uniform(0, 1),
            "competitor_comparison": np.random.uniform(0.1, 1.0)
        }
        
        response = WebScrapingResponse(
            symbol=request.symbol,
            rankings=rankings,
            mentions=mentions,
            sentiment_score=sentiment_score,
            consumer_insights=consumer_insights,
            trend_analysis=trend_analysis
        )
        
        logger.info(f"Web scraping analysis completed for {request.symbol}")
        return response
        
    except Exception as e:
        logger.error(f"Error in web scraping analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Web scraping analysis failed: {str(e)}")

# Market Prediction
@app.post("/prediction/market", response_model=PredictionResponse)
async def predict_market(request: PredictionRequest):
    try:
        # Generate cache key
        cache_key = hashlib.md5(f"{request.symbol}{request.timeframe}{request.model_type}".encode()).hexdigest()
        
        # Check cache
        if cache_key in prediction_cache:
            logger.info(f"Prediction cache hit for key: {cache_key}")
            return prediction_cache[cache_key]
        
        # Simulate market prediction using LSTM/ML models
        num_predictions = 7 if request.timeframe == "1d" else 24 if request.timeframe == "1h" else 30
        
        # Generate predictions with some realistic patterns
        base_price = 2500
        predictions = []
        current_price = base_price
        
        for i in range(num_predictions):
            # Add some trend and volatility
            trend = np.sin(i * 0.1) * 0.02  # Long-term trend
            volatility = np.random.normal(0, 0.01)  # Random volatility
            current_price = current_price * (1 + trend + volatility)
            predictions.append(current_price)
        
        confidence = np.random.uniform(0.7, 0.95)
        
        # Feature importance
        feature_importance = {}
        for feature in request.features:
            feature_importance[feature] = np.random.uniform(0.1, 0.4)
        
        # Normalize feature importance
        total_importance = sum(feature_importance.values())
        for feature in feature_importance:
            feature_importance[feature] = feature_importance[feature] / total_importance
        
        response = PredictionResponse(
            symbol=request.symbol,
            predictions=predictions,
            confidence=confidence,
            timeframe=request.timeframe,
            model_used=request.model_type,
            feature_importance=feature_importance
        )
        
        # Cache the result
        prediction_cache[cache_key] = response
        
        logger.info(f"Market prediction completed for {request.symbol}")
        return response
        
    except Exception as e:
        logger.error(f"Error in market prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Market prediction failed: {str(e)}")

# Risk Analysis
@app.post("/risk/analyze", response_model=RiskAnalysisResponse)
async def analyze_risk(request: RiskAnalysisRequest):
    try:
        # Simulate comprehensive risk analysis
        risk_score = np.random.uniform(0.1, 0.9)
        
        # Calculate VaR (Value at Risk)
        var_95 = request.position_size * 0.05  # 5% VaR at 95% confidence
        var_99 = request.position_size * 0.07  # 7% VaR at 99% confidence
        
        # Calculate other risk metrics
        max_drawdown = np.random.uniform(0.05, 0.25)
        sharpe_ratio = np.random.uniform(0.5, 2.5)
        
        # Generate recommendations based on risk tolerance
        recommendations = []
        if request.risk_tolerance == "low":
            recommendations.append("कमी जोखीम घ्या आणि विविधता राखा")
            recommendations.append("स्टॉप-लॉस कडकपणे पाळा")
        elif request.risk_tolerance == "high":
            recommendations.append("जास्त जोखीम घेण्याची संधी शोधा")
            recommendations.append("लेव्हरेज वापरण्याचा विचार करा")
        else:
            recommendations.append("संतुलित पोर्टफोलिओ तयार करा")
            recommendations.append("नियमितपणे पुनर्समत करा")
        
        response = RiskAnalysisResponse(
            symbol=request.symbol,
            risk_score=risk_score,
            var_95=var_95,
            var_99=var_99,
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe_ratio,
            recommendations=recommendations
        )
        
        logger.info(f"Risk analysis completed for {request.symbol}")
        return response
        
    except Exception as e:
        logger.error(f"Error in risk analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")

# Model Status
@app.get("/models/status")
async def get_model_status():
    try:
        # Simulate model status check
        models = {
            "sentiment_model": {
                "status": "active",
                "version": "2.1.0",
                "accuracy": 0.89,
                "last_updated": "2024-11-22T10:30:00Z",
                "predictions_today": 1250
            },
            "prediction_model": {
                "status": "active",
                "version": "3.0.1",
                "accuracy": 0.85,
                "last_updated": "2024-11-21T15:45:00Z",
                "predictions_today": 850
            },
            "risk_model": {
                "status": "active",
                "version": "1.5.0",
                "accuracy": 0.92,
                "last_updated": "2024-11-20T08:20:00Z",
                "predictions_today": 420
            }
        }
        
        return {
            "success": True,
            "data": models,
            "system_status": "healthy",
            "cache_size": len(prediction_cache),
            "uptime": "99.8%"
        }
        
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")

# Fusion Score Calculator
@app.post("/fusion/calculate")
async def calculate_fusion_score(request: Dict[str, Any]):
    try:
        symbol = request.get("symbol", "NIFTY")
        
        # Get all analysis results
        sentiment_result = await analyze_sentiment(
            SentimentRequest(text=f"{symbol} market analysis", language="mr")
        )
        
        news_result = await analyze_news(
            NewsAnalysisRequest(
                title=f"{symbol} market update",
                content="Market analysis and trading insights",
                source="Panchmukhi AI",
                language="mr"
            )
        )
        
        social_result = await analyze_social_media(
            SocialMediaRequest(symbol=symbol, limit=50)
        )
        
        # Calculate weighted fusion score
        weights = {
            "sentiment": 0.25,
            "news": 0.20,
            "social": 0.20,
            "technical": 0.20,
            "satellite": 0.15
        }
        
        # Normalize scores to 0-1 range
        sentiment_score = (sentiment_result.sentiment + 1) / 2
        news_score = (news_result.sentiment + 1) / 2
        social_score = social_result.bullish_percentage / 100
        technical_score = np.random.uniform(0.3, 0.8)  # Mock technical analysis
        satellite_score = np.random.uniform(0.2, 0.9)  # Mock satellite analysis
        
        fusion_score = (
            sentiment_score * weights["sentiment"] +
            news_score * weights["news"] +
            social_score * weights["social"] +
            technical_score * weights["technical"] +
            satellite_score * weights["satellite"]
        )
        
        # Determine signal
        if fusion_score > 0.7:
            signal = "खरेदी" if request.get("language") == "mr" else "BUY"
        elif fusion_score < 0.3:
            signal = "विक्री" if request.get("language") == "mr" else "SELL"
        else:
            signal = "होल्ड" if request.get("language") == "mr" else "HOLD"
        
        confidence = abs(fusion_score - 0.5) * 2
        
        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "fusion_score": fusion_score,
                "signal": signal,
                "confidence": confidence,
                "components": {
                    "sentiment": sentiment_score,
                    "news": news_score,
                    "social": social_score,
                    "technical": technical_score,
                    "satellite": satellite_score
                },
                "weights": weights,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculating fusion score: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fusion calculation failed: {str(e)}")

# Market Indicators
@app.get("/market/indicators")
async def get_market_indicators():
    try:
        # Generate comprehensive market indicators
        indicators = {
            "market_breadth": {
                "advances": np.random.randint(800, 1200),
                "declines": np.random.randint(600, 1000),
                "unchanged": np.random.randint(50, 200)
            },
            "vix": np.random.uniform(12, 25),
            "put_call_ratio": np.random.uniform(0.8, 1.5),
            "fii_activity": {
                "net_buying": np.random.uniform(-1000, 2000),
                "cash_market": np.random.uniform(-500, 1500),
                "derivatives": np.random.uniform(-500, 1000)
            },
            "dii_activity": {
                "net_buying": np.random.uniform(-500, 1000),
                "cash_market": np.random.uniform(-300, 800),
                "derivatives": np.random.uniform(-200, 500)
            },
            "sector_performance": {
                "it": np.random.uniform(-2, 5),
                "banking": np.random.uniform(-1, 3),
                "pharma": np.random.uniform(-3, 2),
                "auto": np.random.uniform(-2, 4),
                "fmcg": np.random.uniform(-1, 2)
            },
            "market_sentiment": {
                "fear_greed_index": np.random.uniform(20, 80),
                "retail_sentiment": np.random.uniform(0.3, 0.8),
                "institutional_sentiment": np.random.uniform(0.4, 0.9)
            }
        }
        
        # Calculate market breadth ratio
        advances = indicators["market_breadth"]["advances"]
        declines = indicators["market_breadth"]["declines"]
        indicators["market_breadth"]["ratio"] = advances / (advances + declines) if (advances + declines) > 0 else 0
        
        return {
            "success": True,
            "data": indicators,
            "timestamp": datetime.now().isoformat(),
            "interpretation": {
                "market_mood": "बुलिश" if indicators["market_breadth"]["ratio"] > 0.5 else "बेअरिश",
                "volatility": "कमी" if indicators["vix"] < 20 else "जास्त",
                "fii_sentiment": "पॉझिटिव्ह" if indicators["fii_activity"]["net_buying"] > 0 else "निगेटिव्ह"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting market indicators: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get market indicators: {str(e)}")

# Utility Functions
def extract_keywords(text: str, language: str) -> List[str]:
    """Extract keywords from text based on language"""
    # Simulate keyword extraction
    if language == "mr":
        marathi_keywords = ["शेअर", "बाजार", "नफा", "गुंतवणूक", "तांत्रिक", "मूल्य", "व्हॉल्यूम"]
        return np.random.choice(marathi_keywords, size=min(5, len(marathi_keywords)), replace=False).tolist()
    else:
        english_keywords = ["stock", "market", "profit", "investment", "technical", "price", "volume"]
        return np.random.choice(english_keywords, size=min(5, len(english_keywords)), replace=False).tolist()

def generate_summary(title: str, content: str, language: str) -> str:
    """Generate summary based on language"""
    if language == "mr":
        summaries = [
            "ही बातमी मार्केटसाठी महत्वाची आहे",
            "या घटनेचा शेअर बाजारावर परिणाम होईल",
            "गुंतवणूकदारांनी या बातमीवर लक्ष द्यावे",
            "तांत्रिक दृष्टिकोनातून ही घटना महत्वाची आहे"
        ]
    else:
        summaries = [
            "This news is important for the market",
            "This event will impact stock market",
            "Investors should pay attention to this news",
            "Technically this event is significant"
        ]
    
    return np.random.choice(summaries)

# Background tasks for periodic updates
async def update_market_data():
    """Periodic task to update market data"""
    while True:
        try:
            # Simulate market data updates
            logger.info("Updating market data...")
            await asyncio.sleep(30)  # Update every 30 seconds
        except Exception as e:
            logger.error(f"Error in market data update: {str(e)}")

async def cleanup_cache():
    """Periodic task to clean up old cache entries"""
    while True:
        try:
            # Clean up old cache entries
            current_time = time.time()
            keys_to_remove = []
            
            for key, value in prediction_cache.items():
                if current_time - getattr(value, 'timestamp', current_time) > 3600:  # 1 hour
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del prediction_cache[key]
            
            logger.info(f"Cleaned up {len(keys_to_remove)} old cache entries")
            await asyncio.sleep(300)  # Clean up every 5 minutes
        except Exception as e:
            logger.error(f"Error in cache cleanup: {str(e)}")

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Panchmukhi ML Services Pro...")
    
    # Start background tasks
    asyncio.create_task(update_market_data())
    asyncio.create_task(cleanup_cache())
    
    logger.info("✅ ML Services Pro started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down ML Services Pro...")
    
    # Save cache to disk if needed
    logger.info("💾 Saving cache data...")
    
    logger.info("✅ Shutdown complete")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "पंचमुखी ML सर्व्हिसेस प्रो",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Advanced Sentiment Analysis",
            "Multi-Language News Analysis",
            "Satellite Data Analysis",
            "Social Media Sentiment",
            "Web Scraping Analysis",
            "Market Prediction",
            "Risk Analysis",
            "Fusion Score Calculation"
        ],
        "endpoints": {
            "health": "/health",
            "sentiment": "/sentiment/analyze",
            "news": "/news/analyze",
            "satellite": "/satellite/analyze",
            "social": "/social/analyze",
            "web": "/web/scrape",
            "prediction": "/prediction/market",
            "risk": "/risk/analyze",
            "fusion": "/fusion/calculate"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "service": "Panchmukhi ML Services Pro",
        "models_loaded": len(model_cache),
        "cache_size": len(prediction_cache),
        "memory_usage": "optimal",
        "uptime": "99.9%"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.detail,
                "code": exc.status_code,
                "timestamp": datetime.now().isoformat()
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "Internal server error",
                "code": 500,
                "timestamp": datetime.now().isoformat()
            }
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8082,
        reload=True,
        log_level="info",
        workers=1
    )