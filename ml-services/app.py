from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import time
from datetime import datetime
import logging
import hashlib # Corrected import for hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import new services
from services.price_predictor import PricePredictor
from services.news_scraper import NewsScraper
from services.satellite_service import SatelliteService

app = FastAPI(title="Panchmukhi ML Services", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
price_predictor = PricePredictor()
news_scraper = NewsScraper()
satellite_service = SatelliteService()

# Pydantic models
class SentimentRequest(BaseModel):
    text: str
    language: str = "mr"

class SentimentResponse(BaseModel):
    sentiment: float
    confidence: float
    label: str

class NewsAnalysisRequest(BaseModel):
    title: str
    content: str
    source: str
    language: str = "mr"
    category: Optional[str] = None # Added optional category

class NewsAnalysisResponse(BaseModel):
    sentiment: float
    category: str
    keywords: List[str]
    relevance_score: float
    impact_score: float # New field
    trading_signals: List[str] # New field
    summary: str # New field

class SatelliteDataRequest(BaseModel):
    symbol: str
    location: str
    date_range: List[str]

class SatelliteDataResponse(BaseModel):
    symbol: str
    heat_score: float
    activity_level: str
    confidence: float
    trend_analysis: Dict[str, float] # New field
    recommendations: List[str] # New field

class SocialMediaRequest(BaseModel):
    symbol: str
    platform: str = "all"
    limit: int = 100

class SocialMediaResponse(BaseModel):
    symbol: str
    bullish_percentage: float
    bearish_percentage: float
    neutral_percentage: float
    total_mentions: int

class WebScrapingRequest(BaseModel):
    symbol: str
    websites: List[str] = ["amazon", "flipkart"]
    keywords: List[str]

class WebScrapingResponse(BaseModel):
    symbol: str
    rankings: Dict[str, int]
    mentions: int
    sentiment_score: float

# Mock data storage
market_data_cache = {}
news_cache = []
alerts_cache = []

@app.get("/")
async def root():
    return {
        "message": "पंचमुखी ML सर्व्हिसेस",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "sentiment": "/sentiment/analyze",
            "news": "/news/analyze",
            "satellite": "/satellite/analyze",
            "social": "/social/analyze",
            "web": "/web/scrape"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "sentiment_analysis": True,
            "news_processing": True,
            "satellite_analysis": True,
            "social_media_analysis": True,
            "web_scraping": True
        }
    }

@app.post("/sentiment/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    try:
        text = request.text
        language = request.language
        
        sentiment_score, confidence, label = await perform_sentiment_analysis(text, language)
        
        return SentimentResponse(
            sentiment=sentiment_score,
            confidence=confidence,
            label=label
        )
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def perform_sentiment_analysis(text: str, language: str) -> tuple:
    # Mock sentiment analysis
    if language == "mr":
        # Marathi sentiment analysis
        positive_words = ['चांगले', 'उत्तम', 'सकारात्मक', 'वाढ', 'मुनाफा', 'जिंकले']
        negative_words = ['वाईट', 'नकारात्मक', 'घट', 'तोटा', 'हारले', 'समस्या']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count + neg_count == 0:
            sentiment_score = 0
            confidence = 0.5
            label = "NEUTRAL"
        else:
            sentiment_score = (pos_count - neg_count) / (pos_count + neg_count)
            confidence = abs(sentiment_score)
            label = "POSITIVE" if sentiment_score > 0 else "NEGATIVE"
            
        return sentiment_score, confidence, label
    
    else:
        # English sentiment analysis
        sentiment_score = (len([word for word in text.split() if len(word) > 4]) - 
                          len([word for word in text.split() if len(word) <= 4])) / len(text.split())
        confidence = abs(sentiment_score)
        
        if sentiment_score > 0.1:
            label = "POSITIVE"
        elif sentiment_score < -0.1:
            label = "NEGATIVE"
        else:
            label = "NEUTRAL"
            
        return sentiment_score, confidence, label

@app.post("/news/analyze", response_model=NewsAnalysisResponse)
async def analyze_news(request: NewsAnalysisRequest):
    try:
        # Use real news scraper
        articles = news_scraper.fetch_news(language=request.language, limit=1)
        
        if articles:
            article = articles[0]
            # Simple sentiment simulation on real text
            sentiment_score = 0.5 # Placeholder for real NLP model
            summary = article['summary']
            title = article['title']
        else:
            # Fallback if no news found
            sentiment_score = 0.0
            summary = "No recent news found."
            title = request.title

        response = NewsAnalysisResponse(
            sentiment=sentiment_score,
            category=request.category or "General",
            keywords=await extract_keywords(title + " " + summary), # Removed language arg as extract_keywords doesn't use it
            relevance_score=0.9,
            impact_score=0.8,
            trading_signals=["MONITOR"],
            summary=summary
        )
        
        logger.info(f"News analysis completed for: {title[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Error in news analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def categorize_news(title: str, content: str, source: str) -> str:
    text = (title + " " + content).lower()
    
    sectors = {
        "Oil & Gas": ["reliance", "oil", "gas", "petroleum", "refinery", "jamnagar"],
        "IT": ["tcs", "infosys", "wipro", "hcl", "tech", "software", "digital"],
        "Banking": ["hdfc", "sbi", "icici", "bank", "banking", "loan", "interest"],
        "Pharma": ["sun pharma", "dr reddy", "cipla", "pharma", "medicine", "drug"],
        "Auto": ["maruti", "tata motors", "mahindra", "auto", "car", "vehicle"],
        "Realty": ["dlf", "realty", "property", "real estate", "construction"],
        "FMCG": ["itc", "hul", "nestle", "fmcg", "consumer", "food"],
        "Steel": ["tata steel", "jsw", "steel", "metal", "iron"]
    }
    
    for sector, keywords in sectors.items():
        if any(keyword in text for keyword in keywords):
            return sector
    
    return "General"

async def extract_keywords(text: str) -> list: # Removed language arg
    import re
    
    words = re.findall(r'\b\w+\b', text.lower())
    
    stop_words = set([
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
        "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those"
    ])
    
    word_freq = {}
    for word in words:
        if len(word) > 3 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return [keyword for keyword, freq in top_keywords]

async def calculate_relevance_score(title: str, content: str, source: str) -> float:
    score = 0.5
    
    title_length = len(title)
    if 30 <= title_length <= 80:
        score += 0.2
    elif title_length > 100:
        score -= 0.1
    
    word_count = len(content.split())
    if 200 <= word_count <= 1000:
        score += 0.2
    elif word_count < 100:
        score -= 0.2
    
    source_scores = {
        "lokmat": 0.9,
        "maharashtratimes": 0.85,
        "esakal": 0.8,
        "moneycontrol": 0.95,
        "economictimes": 0.95,
        "aajtak": 0.8,
        "amarujala": 0.75
    }
    
    source_score = source_scores.get(source.lower(), 0.5)
    score += (source_score - 0.5) * 0.2
    
    financial_keywords = ["stock", "share", "market", "trading", "investment", "profit", "loss", "dividend"]
    keyword_count = sum(1 for keyword in financial_keywords if keyword.lower() in (title + " " + content).lower())
    
    score += (keyword_count / len(financial_keywords)) * 0.1
    
    return max(0, min(1, score))

@app.post("/satellite/analyze", response_model=SatelliteDataResponse)
async def analyze_satellite_data(request: SatelliteDataRequest):
    try:
        # Use Satellite Service
        satellite_data = satellite_service.analyze_impact(request.symbol)
        
        if "satellite_data" in satellite_data:
            data = satellite_data["satellite_data"]
            heat_score = data["ndvi"] # Use NDVI as heat score proxy
            activity_level = data["ndvi_interpretation"]
            recommendations = [satellite_data["impact"]]
            trend_analysis = {"ndvi": heat_score, "temperature": data.get("temperature", 0.0)} # Added temperature for example
        else:
            heat_score = 0.5
            activity_level = "Neutral"
            recommendations = ["No Data"]
            trend_analysis = {}

        response = SatelliteDataResponse(
            symbol=request.symbol,
            heat_score=heat_score,
            activity_level=activity_level,
            confidence=0.8,
            trend_analysis=trend_analysis,
            recommendations=recommendations
        )
        return response
        
    except Exception as e:
        logger.error(f"Error in satellite analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_satellite_activity(symbol: str, location: str, date_range: list) -> tuple:
    activity_mapping = {
        "RELIANCE": {"Jamnagar": 0.8, "Mumbai": 0.6},
        "TCS": {"Mumbai": 0.7, "Pune": 0.5},
        "HDFC": {"Mumbai": 0.6, "Bangalore": 0.4},
        "INFY": {"Bangalore": 0.8, "Mysore": 0.6},
        "ITC": {"Kolkata": 0.5, "Bangalore": 0.4}
    }
    
    base_score = activity_mapping.get(symbol, {}).get(location, 0.5)
    heat_score = base_score + (0.5 - 0.5) * 0.2
    heat_score = max(0, min(1, heat_score))
    
    if heat_score > 0.7:
        activity_level = "High"
    elif heat_score > 0.4:
        activity_level = "Medium"
    else:
        activity_level = "Low"
    
    confidence = 0.7 + (0.5 - 0.5) * 0.3
    
    return heat_score, activity_level, confidence

@app.post("/social/analyze", response_model=SocialMediaResponse)
async def analyze_social_media(request: SocialMediaRequest):
    try:
        symbol = request.symbol
        platform = request.platform
        limit = request.limit
        
        result = await analyze_social_sentiment(symbol, platform, limit)
        
        return SocialMediaResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in social media analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_social_sentiment(symbol: str, platform: str, limit: int) -> dict:
    total_mentions = 150
    
    bullish_percentage = 0.65
    bearish_percentage = 0.25
    neutral_percentage = 1 - bullish_percentage - bearish_percentage
    
    if neutral_percentage < 0:
        neutral_percentage = 0
        bullish_percentage = min(bullish_percentage, 0.8)
        bearish_percentage = 1 - bullish_percentage
    
    return {
        "symbol": symbol,
        "bullish_percentage": round(bullish_percentage, 2),
        "bearish_percentage": round(bearish_percentage, 2),
        "neutral_percentage": round(neutral_percentage, 2),
        "total_mentions": total_mentions
    }

@app.post("/web/scrape", response_model=WebScrapingResponse)
async def scrape_web_data(request: WebScrapingRequest):
    try:
        symbol = request.symbol
        websites = request.websites
        keywords = request.keywords
        
        result = await scrape_product_data(symbol, websites, keywords)
        
        return WebScrapingResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in web scraping: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def scrape_product_data(symbol: str, websites: list, keywords: list) -> dict:
    product_rankings = {
        "RELIANCE": {"amazon": 5, "flipkart": 3},
        "TCS": {"amazon": 15, "flipkart": 12},
        "HDFC": {"amazon": 20, "flipkart": 18},
        "INFY": {"amazon": 12, "flipkart": 8},
        "ITC": {"amazon": 8, "flipkart": 6}
    }
    
    rankings = {}
    total_mentions = 0
    
    for website in websites:
        if website in product_rankings.get(symbol, {}):
            rankings[website] = product_rankings[symbol][website]
            total_mentions += 1
    
    if rankings:
        avg_rank = sum(rankings.values()) / len(rankings)
        sentiment_score = max(0, (50 - avg_rank) / 50)
    else:
        sentiment_score = 0.5
    
    return {
        "symbol": symbol,
        "rankings": rankings,
        "mentions": total_mentions,
        "sentiment_score": round(sentiment_score, 2)
    }

@app.get("/models/status")
async def get_model_status():
    return {
        "sentiment_analyzer": True,
        "news_classifier": True,
        "satellite_analyzer": True,
        "social_media_analyzer": True,
        "web_scraper": True,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/fusion/calculate")
async def calculate_fusion_score(sources: dict):
    try:
        scores = sources.get("scores", {})
        
        weights = {
            "satellite": 0.2,
            "news": 0.2,
            "options": 0.2,
            "web": 0.2,
            "social": 0.2
        }
        
        fusion_score = 0
        total_weight = 0
        
        for source, score in scores.items():
            weight = weights.get(source, 0)
            fusion_score += score * weight
            total_weight += weight
        
        if total_weight > 0:
            fusion_score = fusion_score / total_weight
        
        fusion_score = max(0, min(1, fusion_score))
        
        return {
            "fusion_score": fusion_score,
            "signal": "BUY" if fusion_score > 0.7 else "SELL" if fusion_score < 0.3 else "HOLD",
            "confidence": abs(fusion_score - 0.5) * 2,
            "sources_used": len(scores),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error calculating fusion score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market/indicators")
async def get_market_indicators():
    return {
        "nifty_50": 17850 + (time.time() % 100 - 50),
        "sensex": 60200 + (time.time() % 200 - 100),
        "vix": 15.5 + (time.time() % 5 - 2.5),
        "usd_inr": 83.2 + (time.time() % 2 - 1),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)