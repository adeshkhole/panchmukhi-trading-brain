import feedparser
from typing import List, Dict
import logging
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class NewsScraper:
    """Scrape news from RSS feeds for multiple languages."""
    
    def __init__(self):
        self.feeds = {
            'en': [
                'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms',
                'https://www.moneycontrol.com/rss/marketreports.xml'
            ],
            'hi': [
                'https://www.aajtak.in/rss/business.xml',
                'https://zeenews.india.com/hindi/business/rss.xml'
            ],
            'mr': [
                'https://www.lokmat.com/rss/business.xml',
                'https://maharashtratimes.com/business/rssfeeds/msid-2429835.cms'
            ]
        }
        
    def fetch_news(self, language: str = 'en', limit: int = 10) -> List[Dict]:
        """Fetch news from configured RSS feeds.
        
        Args:
            language: Language code ('en', 'hi', 'mr')
            limit: Maximum number of articles to return
            
        Returns:
            List of news articles
        """
        if language not in self.feeds:
            logger.warning(f"Language {language} not supported, defaulting to English")
            language = 'en'
            
        articles = []
        urls = self.feeds[language]
        
        for url in urls:
            try:
                feed = feedparser.parse(url)
                
                for entry in feed.entries:
                    article = {
                        'title': self._clean_text(entry.title),
                        'link': entry.link,
                        'published': entry.get('published', datetime.now().isoformat()),
                        'summary': self._clean_text(entry.get('summary', '')),
                        'source': feed.feed.get('title', 'Unknown'),
                        'language': language
                    }
                    articles.append(article)
                    
                    if len(articles) >= limit:
                        break
                
                if len(articles) >= limit:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching feed {url}: {str(e)}")
                continue
                
        return articles
    
    def _clean_text(self, text: str) -> str:
        """Clean HTML tags and extra whitespace from text."""
        # Remove HTML tags
        clean = re.compile('<.*?>')
        text = re.sub(clean, '', text)
        # Normalize whitespace
        return ' '.join(text.split())
