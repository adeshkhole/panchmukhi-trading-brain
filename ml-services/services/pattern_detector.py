import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import logging
from enum import Enum
import talib

logger = logging.getLogger(__name__)

class PatternType(Enum):
    """Enum for different candlestick patterns."""
    BULLISH_ENGULFING = "Bullish Engulfing"
    BEARISH_ENGULFING = "Bearish Engulfing"
    MORNING_STAR = "Morning Star"
    EVENING_STAR = "Evening Star"
    HAMMER = "Hammer"
    SHOOTING_STAR = "Shooting Star"
    BULLISH_HARAMI = "Bullish Harami"
    BEARISH_HARAMI = "Bearish Harami"
    DOJI = "Doji"
    THREE_WHITE_SOLDIERS = "Three White Soldiers"
    THREE_BLACK_CROWS = "Three Black Crows"

class PatternDetector:
    """Service for detecting candlestick patterns in financial time series data."""
    
    def __init__(self, min_body_percent: float = 0.1, min_shadow_percent: float = 0.05):
        """Initialize the pattern detector.
        
        Args:
            min_body_percent: Minimum body size as percentage of price range
            min_shadow_percent: Minimum shadow size as percentage of price range
        """
        self.min_body = min_body_percent
        self.min_shadow = min_shadow_percent
    
    def detect_all(self, df: pd.DataFrame) -> Dict[str, List[Dict]]:
        """Detect all candlestick patterns in the given data.
        
        Args:
            df: DataFrame with OHLCV data
            
        Returns:
            Dictionary mapping pattern types to lists of detection results
        """
        results = {}
        
        # Detect single-candle patterns
        results.update(self._detect_single_candle_patterns(df))
        
        # Detect multi-candle patterns
        results.update(self._detect_multi_candle_patterns(df))
        
        # Detect patterns using TA-Lib
        results.update(self._detect_talib_patterns(df))
        
        return results
    
    def _detect_single_candle_patterns(self, df: pd.DataFrame) -> Dict:
        """Detect single-candle patterns like Doji, Hammer, etc."""
        results = {}
        
        for i in range(len(df)):
            candle = df.iloc[i]
            o, h, l, c = candle['open'], candle['high'], candle['low'], candle['close']
            
            # Calculate candle properties
            body_size = abs(c - o)
            upper_shadow = h - max(o, c)
            lower_shadow = min(o, c) - l
            total_range = h - l
            
            # Skip candles with very small range
            if total_range < 0.01 * o:
                continue
                
            body_percent = body_size / total_range if total_range > 0 else 0
            upper_shadow_percent = upper_shadow / total_range if total_range > 0 else 0
            lower_shadow_percent = lower_shadow / total_range if total_range > 0 else 0
            
            # Detect Doji (small body, long shadows)
            if body_percent < 0.1 and (upper_shadow_percent > 0.3 or lower_shadow_percent > 0.3):
                self._add_result(results, str(PatternType.DOJI), i, 0.7)
            
            # Detect Hammer (small body, long lower shadow, little or no upper shadow)
            if (body_percent < 0.3 and lower_shadow_percent > 0.6 and 
                upper_shadow_percent < 0.1 and c > o):
                self._add_result(results, str(PatternType.HAMMER), i, 0.8)
            
            # Detect Shooting Star (small body, long upper shadow, little or no lower shadow)
            if (body_percent < 0.3 and upper_shadow_percent > 0.6 and 
                lower_shadow_percent < 0.1 and o > c):
                self._add_result(results, str(PatternType.SHOOTING_STAR), i, 0.8)
        
        return results
    
    def _detect_multi_candle_patterns(self, df: pd.DataFrame) -> Dict:
        """Detect multi-candle patterns like Engulfing, Harami, etc."""
        results = {}
        
        for i in range(1, len(df)):
            prev_candle = df.iloc[i-1]
            curr_candle = df.iloc[i]
            
            po, ph, pl, pc = prev_candle['open'], prev_candle['high'], prev_candle['low'], prev_candle['close']
            co, ch, cl, cc = curr_candle['open'], curr_candle['high'], curr_candle['low'], curr_candle['close']
            
            # Bullish Engulfing
            if (pc < po and  # Previous candle is bearish
                co < cl and cc > ch and  # Current candle is bullish and engulfs previous
                co <= pc and cc >= po):  # Current candle's body engulfs previous candle's body
                self._add_result(results, str(PatternType.BULLISH_ENGULFING), i, 0.85)
            
            # Bearish Engulfing
            if (pc > po and  # Previous candle is bullish
                co > ch and cc < cl and  # Current candle is bearish and engulfs previous
                co >= pc and cc <= po):  # Current candle's body engulfs previous candle's body
                self._add_result(results, str(PatternType.BEARISH_ENGULFING), i, 0.85)
            
            # Bullish Harami
            if (po > pc and  # Previous candle is bearish
                co < cc and  # Current candle is bullish
                co > pc and cc < po):  # Current candle's body is inside previous candle's body
                self._add_result(results, str(PatternType.BULLISH_HARAMI), i, 0.75)
            
            # Bearish Harami
            if (po < pc and  # Previous candle is bullish
                co > cc and  # Current candle is bearish
                co < pc and cc > po):  # Current candle's body is inside previous candle's body
                self._add_result(results, str(PatternType.BEARISH_HARAMI), i, 0.75)
            
            # Check for Three White Soldiers (need at least 3 candles)
            if i >= 2:
                prev_prev_candle = df.iloc[i-2]
                ppo, ppc = prev_prev_candle['open'], prev_prev_candle['close']
                
                # Three White Soldiers (bullish)
                if (ppc > ppo and pc > po and cc > co and  # Three consecutive bullish candles
                    cc > pc and pc > ppc and  # Each close is higher than previous
                    (cc - co) > (pc - po) and (pc - po) > (ppc - ppo)):  # Increasing momentum
                    self._add_result(results, str(PatternType.THREE_WHITE_SOLDIERS), i, 0.9)
                
                # Three Black Crows (bearish)
                if (ppc < ppo and pc < po and cc < co and  # Three consecutive bearish candles
                    cc < pc and pc < ppc and  # Each close is lower than previous
                    (co - cc) > (po - pc) and (po - pc) > (ppo - ppc)):  # Increasing momentum
                    self._add_result(results, str(PatternType.THREE_BLACK_CROWS), i, 0.9)
        
        return results
    
    def _detect_talib_patterns(self, df: pd.DataFrame) -> Dict:
        """Detect patterns using TA-Lib for more complex patterns."""
        results = {}
        
        # Convert to numpy arrays for TA-Lib
        opens = df['open'].values
        highs = df['high'].values
        lows = df['low'].values
        closes = df['close'].values
        
        # Morning Star (bullish reversal)
        morning_star = talib.CDLMORNINGSTAR(opens, highs, lows, closes)
        for i in range(len(morning_star)):
            if morning_star[i] > 0:  # 100 indicates a morning star pattern
                self._add_result(results, "Morning Star (TA-Lib)", i, 0.9)
        
        # Evening Star (bearish reversal)
        evening_star = talib.CDLEVENINGSTAR(opens, highs, lows, closes)
        for i in range(len(evening_star)):
            if evening_star[i] < 0:  # -100 indicates an evening star pattern
                self._add_result(results, "Evening Star (TA-Lib)", i, 0.9)
        
        # Add more TA-Lib patterns as needed...
        
        return results
    
    def _add_result(self, results: Dict, pattern_type: str, index: int, confidence: float) -> None:
        """Helper method to add a pattern detection result."""
        if pattern_type not in results:
            results[pattern_type] = []
        
        results[pattern_type].append({
            'index': index,
            'confidence': confidence,
            'timestamp': pd.Timestamp.utcnow().isoformat()
        })
    
    def get_pattern_summary(self, df: pd.DataFrame, window: int = 20) -> Dict:
        """Get a summary of recent patterns in the data.
        
        Args:
            df: DataFrame with OHLCV data
            window: Number of most recent candles to analyze
            
        Returns:
            Dictionary with pattern summary
        """
        recent_data = df.tail(window).copy()
        patterns = self.detect_all(recent_data)
        
        # Count patterns by type
        pattern_counts = {}
        for pattern_type, matches in patterns.items():
            pattern_counts[pattern_type] = len(matches)
        
        # Calculate pattern density (patterns per candle)
        pattern_density = sum(pattern_counts.values()) / len(recent_data)
        
        # Determine overall market sentiment based on patterns
        bullish_patterns = sum(1 for p in patterns.keys() if 'bullish' in p.lower() or 'hammer' in p.lower())
        bearish_patterns = sum(1 for p in patterns.keys() if 'bearish' in p.lower() or 'shooting' in p.lower())
        
        if bullish_patterns > bearish_patterns + 2:
            sentiment = 'bullish'
        elif bearish_patterns > bullish_patterns + 2:
            sentiment = 'bearish'
        else:
            sentiment = 'neutral'
        
        return {
            'pattern_counts': pattern_counts,
            'pattern_density': pattern_density,
            'sentiment': sentiment,
            'bullish_patterns': bullish_patterns,
            'bearish_patterns': bearish_patterns,
            'window_size': window,
            'timestamp': pd.Timestamp.utcnow().isoformat()
        }
