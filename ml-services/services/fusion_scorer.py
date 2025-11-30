import logging
from typing import Dict, List, Optional, Union
import numpy as np
import pandas as pd
from datetime import datetime

logger = logging.getLogger(__name__)

class FusionScorer:
    """
    Service for combining multiple data sources into a single fusion score.
    Implements a weighted scoring system that incorporates market data, news sentiment,
    social media sentiment, satellite data, and web scraping results.
    """
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """
        Initialize the fusion scorer with optional custom weights.
        
        Args:
            weights: Dictionary of source weights (default: equal weights)
        """
        # Default weights if none provided
        self.weights = weights or {
            'market': 0.35,      # Technical indicators, price action
            'news': 0.25,        # News sentiment and analysis
            'social': 0.15,      # Social media sentiment
            'satellite': 0.15,   # Satellite data (shipping, agriculture, etc.)
            'web': 0.10         # Web scraping results
        }
        
        # Normalize weights to sum to 1
        total_weight = sum(self.weights.values())
        self.weights = {k: v/total_weight for k, v in self.weights.items()}
        
        logger.info(f"Initialized FusionScorer with weights: {self.weights}")
    
    def calculate_fusion_score(self, sources: Dict[str, Dict]) -> Dict:
        """
        Calculate a fusion score from multiple data sources.
        
        Args:
            sources: Dictionary containing data from different sources
                    Expected keys: 'market', 'news', 'social', 'satellite', 'web'
                    
        Returns:
            Dictionary containing the fusion score and component scores
        """
        component_scores = {}
        
        # Calculate component scores
        component_scores['market'] = self._calculate_market_score(sources.get('market', {}))
        component_scores['news'] = self._calculate_news_score(sources.get('news', {}))
        component_scores['social'] = self._calculate_social_score(sources.get('social', {}))
        component_scores['satellite'] = self._calculate_satellite_score(sources.get('satellite', {}))
        component_scores['web'] = self._calculate_web_score(sources.get('web', {}))
        
        # Calculate weighted fusion score (0-100)
        fusion_score = 0
        for source, weight in self.weights.items():
            fusion_score += component_scores[source] * weight
        
        # Ensure score is within bounds
        fusion_score = max(0, min(100, fusion_score))
        
        # Determine signal based on score
        signal = self._get_signal(fusion_score)
        
        return {
            'fusion_score': round(fusion_score, 2),
            'signal': signal,
            'component_scores': component_scores,
            'weights': self.weights,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _calculate_market_score(self, market_data: Dict) -> float:
        """Calculate score from market data (technical indicators, price action)."""
        if not market_data:
            return 50.0  # Neutral score if no data
            
        try:
            # Extract relevant indicators (example: RSI, MACD, etc.)
            rsi = market_data.get('rsi', 50)  # 0-100 scale
            macd = market_data.get('macd', 0)  # Positive/negative values
            adx = market_data.get('adx', 25)   # 0-100 scale
            
            # Normalize to 0-100 scale
            rsi_score = rsi  # Already 0-100
            macd_score = 50 + (macd * 10)  # Convert to 0-100 scale (adjust multiplier as needed)
            adx_score = adx  # Already 0-100
            
            # Weighted average of indicators
            score = (rsi_score * 0.4) + (macd_score * 0.4) + (adx_score * 0.2)
            
            return max(0, min(100, score))
            
        except Exception as e:
            logger.error(f"Error calculating market score: {str(e)}")
            return 50.0  # Fallback to neutral
    
    def _calculate_news_score(self, news_data: Dict) -> float:
        """Calculate score from news sentiment and analysis."""
        if not news_data:
            return 50.0
            
        try:
            sentiment = news_data.get('sentiment', 0)  # -1 to 1
            confidence = news_data.get('confidence', 0.5)  # 0-1
            
            # Convert sentiment to 0-100 scale
            score = 50 + (sentiment * 50 * confidence)
            
            return max(0, min(100, score))
            
        except Exception as e:
            logger.error(f"Error calculating news score: {str(e)}")
            return 50.0
    
    def _calculate_social_score(self, social_data: Dict) -> float:
        """Calculate score from social media sentiment."""
        if not social_data:
            return 50.0
            
        try:
            # Social media metrics
            bullish = social_data.get('bullish_percentage', 0)  # 0-100
            bearish = social_data.get('bearish_percentage', 0)  # 0-100
            
            # Calculate score (0-100)
            if bullish + bearish > 0:
                score = (bullish / (bullish + bearish)) * 100
            else:
                score = 50.0
                
            return score
            
        except Exception as e:
            logger.error(f"Error calculating social score: {str(e)}")
            return 50.0
    
    def _calculate_satellite_score(self, satellite_data: Dict) -> float:
        """Calculate score from satellite data (shipping, agriculture, etc.)."""
        if not satellite_data:
            return 50.0
            
        try:
            # Example: Higher shipping activity might be positive for some assets
            activity = satellite_data.get('activity_level', 'normal')
            confidence = satellite_data.get('confidence', 0.5)
            
            # Map activity levels to scores
            activity_scores = {
                'high': 80,
                'normal': 50,
                'low': 20
            }
            
            score = activity_scores.get(activity.lower(), 50) * confidence
            return max(0, min(100, score))
            
        except Exception as e:
            logger.error(f"Error calculating satellite score: {str(e)}")
            return 50.0
    
    def _calculate_web_score(self, web_data: Dict) -> float:
        """Calculate score from web scraping results."""
        if not web_data:
            return 50.0
            
        try:
            # Example: Higher rankings and positive sentiment improve score
            sentiment = web_data.get('sentiment_score', 0)  # -1 to 1
            ranking = web_data.get('average_ranking', 10)  # Lower is better
            
            # Convert to 0-100 scale
            sentiment_score = 50 + (sentiment * 50)
            ranking_score = max(0, 100 - (ranking * 5))  # Deduct 5 points per rank position
            
            # Weighted average
            score = (sentiment_score * 0.6) + (ranking_score * 0.4)
            
            return max(0, min(100, score))
            
        except Exception as e:
            logger.error(f"Error calculating web score: {str(e)}")
            return 50.0
    
    def _get_signal(self, score: float) -> str:
        """Convert fusion score to a trading signal."""
        if score >= 80:
            return "STRONG_BUY"
        elif score >= 60:
            return "BUY"
        elif score >= 40:
            return "NEUTRAL"
        elif score >= 20:
            return "SELL"
        else:
            return "STRONG_SELL"
    
    def update_weights(self, new_weights: Dict[str, float]) -> None:
        """Update the weights used for fusion scoring.
        
        Args:
            new_weights: Dictionary of source weights (partial updates allowed)
        """
        # Update only the provided weights
        for source, weight in new_weights.items():
            if source in self.weights:
                self.weights[source] = max(0, min(1, weight))
        
        # Normalize weights to sum to 1
        total_weight = sum(self.weights.values())
        if total_weight > 0:
            self.weights = {k: v/total_weight for k, v in self.weights.items()}
        
        logger.info(f"Updated weights: {self.weights}")
    
    def get_weights(self) -> Dict[str, float]:
        """Get the current weights used for fusion scoring."""
        return self.weights.copy()
    
    def get_historical_scores(self, historical_data: pd.DataFrame) -> pd.DataFrame:
        """Calculate fusion scores for historical data.
        
        Args:
            historical_data: DataFrame with columns for each data source
            
        Returns:
            DataFrame with fusion scores and component scores over time
        """
        scores = []
        
        for _, row in historical_data.iterrows():
            # Extract source data from the row
            sources = {
                'market': {
                    'rsi': row.get('rsi', 50),
                    'macd': row.get('macd', 0),
                    'adx': row.get('adx', 25)
                },
                'news': {
                    'sentiment': row.get('news_sentiment', 0),
                    'confidence': row.get('news_confidence', 0.5)
                },
                'social': {
                    'bullish_percentage': row.get('bullish_percent', 50),
                    'bearish_percentage': row.get('bearish_percent', 50)
                },
                'satellite': {
                    'activity_level': row.get('activity_level', 'normal'),
                    'confidence': row.get('satellite_confidence', 0.5)
                },
                'web': {
                    'sentiment_score': row.get('web_sentiment', 0),
                    'average_ranking': row.get('web_ranking', 10)
                }
            }
            
            # Calculate fusion score
            result = self.calculate_fusion_score(sources)
            
            # Add timestamp if available
            result['timestamp'] = row.get('timestamp', pd.Timestamp.utcnow().isoformat())
            
            scores.append(result)
        
        return pd.DataFrame(scores)
