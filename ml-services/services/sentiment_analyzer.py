import os
import logging
from typing import Dict, List, Tuple, Optional
import pandas as pd
import joblib
from textblob import TextBlob
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import re

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Multi-language sentiment analysis service for financial text."""
    
    def __init__(self, lexicons_dir: str = None):
        """Initialize the sentiment analyzer.
        
        Args:
            lexicons_dir: Directory containing sentiment lexicons for different languages
        """
        self.lexicons_dir = lexicons_dir or os.path.join(os.path.dirname(__file__), '..', 'nlp', 'sentiment_lexicons')
        self.lexicons = {}
        self.stopwords = {}
        
        # Initialize with default lexicons if available
        self._load_lexicons()
    
    def _load_lexicons(self) -> None:
        """Load sentiment lexicons for different languages."""
        try:
            # Load lexicons from the lexicons directory
            if os.path.exists(self.lexicons_dir):
                for filename in os.listdir(self.lexicons_dir):
                    if filename.endswith('_words.csv'):
                        lang = filename.split('_')[0]
                        df = pd.read_csv(os.path.join(self.lexicons_dir, filename))
                        self.lexicons[lang] = df.set_index('word')['sentiment'].to_dict()
                        
                        # Load stopwords for the language if available
                        try:
                            self.stopwords[lang] = set(stopwords.words(lang))
                        except:
                            # Default to English stopwords if language not found
                            self.stopwords[lang] = set(stopwords.words('english'))
                            
                logger.info(f"Loaded lexicons for languages: {list(self.lexicons.keys())}")
        except Exception as e:
            logger.error(f"Error loading lexicons: {str(e)}")
    
    def preprocess_text(self, text: str, language: str = 'en') -> List[str]:
        """Preprocess text for sentiment analysis.
        
        Args:
            text: Input text
            language: Language code (e.g., 'en', 'mr', 'hi')
            
        Returns:
            List of preprocessed tokens
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs, mentions, and special characters
        text = re.sub(r'http\S+|www.\S+|@\w+|#\w+', '', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords
        stop_words = self.stopwords.get(language, set())
        tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
        
        return tokens
    
    def get_sentiment_score(self, text: str, language: str = 'en') -> Dict[str, float]:
        """Get sentiment score for the given text.
        
        Args:
            text: Input text
            language: Language code (e.g., 'en', 'mr', 'hi')
            
        Returns:
            Dictionary with sentiment scores
        """
        if not text or not text.strip():
            return {'sentiment': 0.0, 'confidence': 0.0}
        
        # Use custom lexicon if available for the language
        if language in self.lexicons:
            tokens = self.preprocess_text(text, language)
            lexicon = self.lexicons[language]
            
            # Calculate sentiment using lexicon
            scores = []
            for token in tokens:
                if token in lexicon:
                    scores.append(lexicon[token])
            
            if scores:
                sentiment = sum(scores) / len(scores)  # Average sentiment score
                confidence = min(len(scores) / 10, 1.0)  # Confidence based on number of matched words
                return {
                    'sentiment': float(sentiment),
                    'confidence': float(confidence)
                }
        
        # Fallback to TextBlob for languages without custom lexicons
        try:
            blob = TextBlob(text)
            sentiment = blob.sentiment.polarity
            confidence = abs(sentiment)  # Use absolute value as confidence
            
            return {
                'sentiment': float(sentiment),
                'confidence': float(confidence)
            }
        except Exception as e:
            logger.error(f"Error in TextBlob sentiment analysis: {str(e)}")
            return {'sentiment': 0.0, 'confidence': 0.0}
    
    def analyze_news_sentiment(self, title: str, content: str, source: str, language: str = 'en') -> Dict:
        """Analyze sentiment of a news article.
        
        Args:
            title: News article title
            content: News article content
            source: News source
            language: Language code
            
        Returns:
            Dictionary with sentiment analysis results
        """
        # Analyze title and content separately
        title_sentiment = self.get_sentiment_score(title, language)
        content_sentiment = self.get_sentiment_score(content, language)
        
        # Weighted average (title has more weight)
        sentiment = (title_sentiment['sentiment'] * 0.6) + (content_sentiment['sentiment'] * 0.4)
        confidence = (title_sentiment['confidence'] + content_sentiment['confidence']) / 2
        
        # Determine sentiment label
        if sentiment > 0.2:
            label = 'positive'
        elif sentiment < -0.2:
            label = 'negative'
        else:
            label = 'neutral'
        
        return {
            'sentiment': float(sentiment),
            'confidence': float(confidence),
            'label': label,
            'title_sentiment': title_sentiment['sentiment'],
            'content_sentiment': content_sentiment['sentiment'],
            'source': source,
            'language': language,
            'timestamp': pd.Timestamp.utcnow().isoformat()
        }
    
    def analyze_batch(self, texts: List[str], language: str = 'en') -> List[Dict]:
        """Analyze sentiment for a batch of texts.
        
        Args:
            texts: List of text strings
            language: Language code
            
        Returns:
            List of sentiment analysis results
        """
        return [self.get_sentiment_score(text, language) for text in texts]
    
    def get_keywords(self, text: str, language: str = 'en', top_n: int = 10) -> List[Tuple[str, float]]:
        """Extract keywords from text with their relevance scores.
        
        Args:
            text: Input text
            language: Language code
            top_n: Number of top keywords to return
            
        Returns:
            List of (keyword, score) tuples
        """
        tokens = self.preprocess_text(text, language)
        word_freq = {}
        
        # Calculate word frequencies
        for token in tokens:
            if token in word_freq:
                word_freq[token] += 1
            else:
                word_freq[token] = 1
        
        # Sort by frequency and return top N
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return sorted_words[:top_n]
