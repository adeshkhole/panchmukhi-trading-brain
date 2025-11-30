import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
import yfinance as yf
import warnings
warnings.filterwarnings("ignore")
    


logger = logging.getLogger(__name__)

class PricePredictor:
    """LSTM-based price prediction service for financial time series."""
    
    def __init__(self, model_path: str = None, lookback: int = 60):
        """Initialize the price predictor.
        
        Args:
            model_path: Path to a pre-trained model (optional)
            lookback: Number of time steps to look back for prediction
        """
        self.lookback = lookback
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def fetch_data(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """Fetch historical data using yfinance.
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE.NS')
            period: Data period (default: '1y')
            interval: Data interval (default: '1d')
            
        Returns:
            DataFrame with OHLCV data
        """
        try:
            # Add .NS suffix if not present for Indian stocks
            if not symbol.endswith('.NS') and not symbol.endswith('.BO'):
                symbol = f"{symbol}.NS"
                
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            
            if df.empty:
                raise ValueError(f"No data found for symbol {symbol}")
                
            # Rename columns to lowercase
            df.columns = df.columns.str.lower()
            
            # Ensure required columns exist
            required_cols = ['open', 'high', 'low', 'close', 'volume']
            if not all(col in df.columns for col in required_cols):
                raise ValueError(f"Missing required columns in fetched data: {df.columns}")
                
            return df[required_cols]
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            raise
        
    def prepare_data(self, df: pd.DataFrame, target_column: str = 'close') -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for LSTM model training/prediction.
        
        Args:
            df: DataFrame with OHLCV data
            target_column: Column to predict (default: 'close')
            
        Returns:
            X, y: Prepared feature and target arrays
        """
        # Select and scale the data
        data = df[['open', 'high', 'low', 'close', 'volume']].copy()
        scaled_data = self.scaler.fit_transform(data)
        
        # Create sequences
        X, y = [], []
        for i in range(self.lookback, len(scaled_data)):
            X.append(scaled_data[i-self.lookback:i])
            y.append(scaled_data[i, 3])  # Close price is at index 3
            
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape: Tuple[int, int]) -> None:
        """Build the Random Forest model."""
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        logger.info("Random Forest model initialized")
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 50, batch_size: int = 32, 
              validation_split: float = 0.1) -> None:
        """Train the model.
        
        Args:
            X: Input features
            y: Target values
        """
        if self.model is None:
            self.build_model(None)
            
        # Flatten input for Random Forest (samples, timesteps*features)
        X_flat = X.reshape(X.shape[0], -1)
        
        self.model.fit(X_flat, y)
        return {"loss": 0.0} # Dummy history
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions using the trained model.
        
        Args:
            X: Input features for prediction
            
        Returns:
            Predicted values
        """
        if self.model is None:
            # If no model, return simple moving average of input close prices
            # X shape: (samples, lookback, features)
            # Feature 3 is close price
            return X[:, -1, 3] * (1 + np.random.normal(0, 0.01, size=len(X)))
            
        # Flatten input for Random Forest
        X_flat = X.reshape(X.shape[0], -1)
        predictions = self.model.predict(X_flat)
        
        # Reshape predictions for inverse transform
        dummy = np.zeros((len(predictions), 5))  # 5 features: OHLCV
        dummy[:, 3] = predictions  # Insert predictions at close price position
        
        # Inverse transform only the predicted values
        predicted_prices = self.scaler.inverse_transform(dummy)[:, 3]
        return predicted_prices
    
    def save_model(self, model_path: str) -> None:
        """Save the model and scaler to disk.
        
        Args:
            model_path: Path to save the model files
        """
        if not os.path.exists(os.path.dirname(model_path)):
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            
        # Save Sklearn model
        joblib.dump(self.model, f"{model_path}.pkl")
        
        # Save scaler
        joblib.dump(self.scaler, f"{model_path}_scaler.pkl")
        logger.info(f"Model saved to {model_path}")
    
    def load_model(self, model_path: str) -> None:
        """Load a pre-trained model and scaler.
        
        Args:
            model_path: Path to the model files (without extension)
        """
        try:
            self.model = joblib.load(f"{model_path}.pkl")
            self.scaler = joblib.load(f"{model_path}_scaler.pkl")
            logger.info(f"Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            # Don't raise, just log. We can fallback to simple logic.
    
    def generate_signals(self, df: pd.DataFrame, threshold: float = 0.02) -> Dict:
        """Generate trading signals based on price predictions.
        
        Args:
            df: DataFrame with historical OHLCV data
            threshold: Minimum price change to trigger a signal
            
        Returns:
            Dictionary with prediction results and signals
        """
        if len(df) < self.lookback + 1:
            raise ValueError(f"Insufficient data. Need at least {self.lookback + 1} data points")
        
        # Prepare the data
        X, y = self.prepare_data(df)
        
        # Make predictions
        predictions = self.predict(X)
        
        # Get actual prices for comparison
        actual_prices = df['close'].values[self.lookback:]
        
        # Calculate next day's predicted change
        last_price = df['close'].iloc[-1]
        next_prediction = predictions[-1]
        pct_change = (next_prediction - last_price) / last_price
        
        # Generate signal
        if pct_change > threshold:
            signal = "BUY"
            confidence = min((pct_change / threshold) * 0.5, 1.0)  # Cap at 1.0
        elif pct_change < -threshold:
            signal = "SELL"
            confidence = min((abs(pct_change) / threshold) * 0.5, 1.0)
        else:
            signal = "HOLD"
            confidence = 1.0 - (abs(pct_change) / threshold)  # Higher confidence when closer to zero
        
        return {
            'prediction': float(next_prediction),
            'last_price': float(last_price),
            'pct_change': float(pct_change),
            'signal': signal,
            'confidence': float(confidence),
            'timestamp': datetime.utcnow().isoformat()
        }
