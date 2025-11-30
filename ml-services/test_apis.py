import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

print("--- Panchmukhi API Test Script ---")

def test_yfinance():
    print("\n1. Testing Yahoo Finance (Market Data)...")
    try:
        import yfinance as yf
        print(f"   yfinance version: {yf.__version__}")
        
        symbol = "RELIANCE.NS"
        print(f"   Fetching data for {symbol}...")
        
        # Try downloading directly which is often more stable
        data = yf.download(symbol, period="1d", progress=False)
        
        if not data.empty:
            print(f"   SUCCESS: Fetched data for {symbol}")
            print(f"   Current Price: {data['Close'].iloc[-1]:.2f}")
        else:
            print("   WARNING: Data fetch returned empty. Market might be closed or symbol issue.")
            
    except ImportError:
        print("   ERROR: 'yfinance' not installed. Run 'pip install yfinance'")
    except Exception as e:
        print(f"   ERROR: {str(e)}")

def test_news():
    print("\n2. Testing News RSS Feeds...")
    try:
        import feedparser
        url = "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms"
        print(f"   Fetching news from {url}...")
        feed = feedparser.parse(url)
        
        if feed.entries:
            print(f"   SUCCESS: Fetched {len(feed.entries)} articles")
            print(f"   Latest Headline: {feed.entries[0].title}")
        else:
            print("   WARNING: No entries found in feed.")
            
    except ImportError:
        print("   ERROR: 'feedparser' not installed. Run 'pip install feedparser'")
    except Exception as e:
        print(f"   ERROR: {str(e)}")

def test_satellite():
    print("\n3. Testing Satellite Service (Simulation)...")
    try:
        from services.satellite_service import SatelliteService
        service = SatelliteService()
        data = service.get_agri_data("Maharashtra")
        print(f"   SUCCESS: Generated Satellite Data")
        print(f"   NDVI (Vegetation): {data['ndvi']:.2f}")
        print(f"   Rainfall: {data['rainfall_mm']:.2f} mm")
    except ImportError:
        print("   ERROR: Could not import SatelliteService. Check project structure.")
    except Exception as e:
        print(f"   ERROR: {str(e)}")

if __name__ == "__main__":
    test_yfinance()
    test_news()
    test_satellite()
    print("\n--- Test Complete ---")
