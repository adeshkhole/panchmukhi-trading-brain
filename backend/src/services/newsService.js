const axios = require('axios');
const cheerio = require('cheerio');
const { News } = require('../database/connection');
const redisClient = require('../database/redis');
const cron = require('node-cron');

class NewsService {
  constructor() {
    this.isRunning = false;
    this.cronJobs = [];
    this.newsSources = {
      marathi: [
        { name: 'lokmat', url: 'https://www.lokmat.com/business/', selector: '.article-title' },
        { name: 'maharashtratimes', url: 'https://maharashtratimes.com/business/', selector: '.headline' },
        { name: 'esakal', url: 'https://www.esakal.com/business/', selector: '.news-title' }
      ],
      hindi: [
        { name: 'aajtak', url: 'https://www.aajtak.in/business', selector: '.story-title' },
        { name: 'amarujala', url: 'https://www.amarujala.com/business', selector: '.headline' }
      ],
      english: [
        { name: 'moneycontrol', url: 'https://www.moneycontrol.com/news/business/', selector: '.title' },
        { name: 'economictimes', url: 'https://economictimes.indiatimes.com/markets/', selector: '.headline' }
      ]
    };
  }

  async start() {
    if (this.isRunning) return;
    
    console.log('Starting News Service...');
    this.isRunning = true;
    
    // Schedule news collection jobs
    this.scheduleJobs();
    
    // Initial news fetch
    await this.fetchAllNews();
  }

  async stop() {
    console.log('Stopping News Service...');
    this.isRunning = false;
    
    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
  }

  scheduleJobs() {
    // News collection every 15 minutes during market hours
    const newsJob = cron.schedule('*/15 9-16 * * 1-5', async () => {
      await this.fetchAllNews();
    }, { timezone: 'Asia/Kolkata' });
    
    // Sentiment analysis every 30 minutes
    const sentimentJob = cron.schedule('*/30 * * * *', async () => {
      await this.analyzeSentiment();
    });
    
    // News cleanup every day at midnight
    const cleanupJob = cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldNews();
    });
    
    this.cronJobs.push(newsJob, sentimentJob, cleanupJob);
  }

  async fetchAllNews() {
    try {
      console.log('Fetching news from all sources...');
      
      const fetchPromises = [];
      
      // Fetch from Marathi sources
      this.newsSources.marathi.forEach(source => {
        fetchPromises.push(this.fetchNewsFromSource(source, 'marathi'));
      });
      
      // Fetch from Hindi sources
      this.newsSources.hindi.forEach(source => {
        fetchPromises.push(this.fetchNewsFromSource(source, 'hindi'));
      });
      
      // Fetch from English sources
      this.newsSources.english.forEach(source => {
        fetchPromises.push(this.fetchNewsFromSource(source, 'english'));
      });
      
      await Promise.all(fetchPromises);
      console.log('News fetching completed');
      
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }

  async fetchNewsFromSource(source, language) {
    try {
      console.log(`Fetching news from ${source.name} (${language})`);
      
      // Try to get from cache first
      const cacheKey = `news:${language}:${source.name}`;
      const cachedNews = await redisClient.get(cacheKey);
      
      if (cachedNews) {
        return cachedNews;
      }
      
      // Fetch from source (mock implementation)
      const newsData = await this.scrapeNewsFromWebsite(source);
      
      // Process and save news
      for (const article of newsData) {
        await this.processAndSaveNews(article, language, source.name);
      }
      
      // Cache the results
      await redisClient.set(cacheKey, JSON.stringify(newsData), 600); // 10 minutes cache
      
      return newsData;
      
    } catch (error) {
      console.error(`Error fetching news from ${source.name}:`, error);
      return [];
    }
  }

  async scrapeNewsFromWebsite(source) {
    // Mock news scraping
    // In production, this would use Puppeteer or similar for actual scraping
    
    const mockNews = [
      {
        title: this.generateMockTitle(source.name),
        content: this.generateMockContent(source.name),
        url: `https://${source.name}.com/article/${Date.now()}`,
        publishedAt: new Date().toISOString(),
        tags: ['stock-market', 'business']
      }
    ];
    
    return mockNews;
  }

  generateMockTitle(source) {
    const titles = {
      lokmat: [
        'रिलायन्स इंडस्ट्रीजचा नेट प्रॉफिट १२% वाढला',
        'TCS ने नवीन शेअर बायबॅक कार्यक्रम जाहीर केला',
        'HDFC बँकेचा निकाल जाहीर, डिव्हिडेंड जाहीर',
        'मार्केटमध्ये नवी उसळी, सेन्सेक्स वर',
        'आयटी सेक्टरमध्ये मोठी हालचाल'
      ],
      maharashtratimes: [
        'स्टॉक मार्केटमध्ये नवी संधी',
        'बिग कंपन्यांचे निकाल जाहीर',
        'IPO मार्केट गरम',
        'सेक्टर रोटेशन सुरू',
        'FDI गुंतवणूक वाढली'
      ],
      esakal: [
        'शेअर बाजारात नवी चाल',
        'म्युच्युअल फंड्सची विक्री वाढली',
        'रिझर्व्ह बँकेचा निर्णय',
        'अर्थव्यवस्थेला चालना',
        'नवीन IPO येत आहेत'
      ]
    };
    
    const sourceTitles = titles[source] || titles.lokmat;
    return sourceTitles[Math.floor(Math.random() * sourceTitles.length)];
  }

  generateMockContent(source) {
    const contents = {
      lokmat: 'कंपनीने आपले तिमाही निकाल जाहीर केले आहेत. निकालात मोठी वाढ नोंदवली आहे. गुंतवणूकदारांसाठी ही चांगली बातमी आहे.',
      maharashtratimes: 'बाजारात नवी संधी निर्माण झाली आहे. तज्ज्ञांच्या मते ही वेळ गुंतवणुकीसाठी योग्य आहे.',
      esakal: 'अर्थव्यवस्थेमध्ये सकारात्मक चाल दिसून येत आहे. विविध सेक्टर्समध्ये वाढ नोंदवली जात आहे.'
    };
    
    return contents[source] || contents.lokmat;
  }

  async processAndSaveNews(article, language, source) {
    try {
      // Check if news already exists
      const existingNews = await News.findOne({
        title: article.title,
        source: source,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      if (existingNews) {
        return existingNews;
      }
      
      // Analyze sentiment
      const sentiment = await this.analyzeSentimentForText(article.title + ' ' + article.content);
      
      // Determine sector
      const sector = this.determineSector(article.title, article.content);
      
      // Create news document
      const news = new News({
        title: article.title,
        content: article.content,
        language: language,
        sector: sector,
        source: source,
        sourceUrl: article.url,
        sentiment: sentiment,
        tags: article.tags || [],
        status: 'published',
        publishedAt: new Date(article.publishedAt),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await news.save();
      
      console.log(`Saved news: ${article.title} (${language})`);
      return news;
      
    } catch (error) {
      console.error('Error processing news:', error);
      throw error;
    }
  }

  async analyzeSentimentForText(text) {
    // Mock sentiment analysis
    // In production, this would use ML models or external APIs
    
    const positiveWords = ['वाढ', 'जाहीर', 'चांगली', 'संधी', 'सकारात्मक', 'मुनाफा', 'विक्री', 'गुंतवणूक'];
    const negativeWords = ['घट', 'तोटा', 'नकारात्मक', 'जोखीम', 'अडचण', 'समस्या', 'कमी'];
    
    const words = text.toLowerCase().split(/\\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveCount++;
      }
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeCount++;
      }
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) {
      return 0; // Neutral
    }
    
    const sentimentScore = (positiveCount - negativeCount) / totalSentimentWords;
    return Math.max(-1, Math.min(1, sentimentScore));
  }

  determineSector(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('रिलायन्स') || text.includes('ऑईल') || text.includes('गॅस')) {
      return 'Oil & Gas';
    }
    if (text.includes('TCS') || text.includes('इन्फोसिस') || text.includes('IT')) {
      return 'IT';
    }
    if (text.includes('HDFC') || text.includes('बँक') || text.includes('बँकिंग')) {
      return 'Banking';
    }
    if (text.includes('सन फार्मा') || text.includes('फार्मा') || text.includes('मेडिकल')) {
      return 'Pharma';
    }
    if (text.includes('मॅहिंद्रा') || text.includes('टाटा मोटर्स') || text.includes('ऑटो')) {
      return 'Auto';
    }
    if (text.includes('DLF') || text.includes('रिअल्टी') || text.includes('जमीन')) {
      return 'Realty';
    }
    
    return 'General';
  }

  async analyzeSentiment() {
    try {
      console.log('Analyzing sentiment for recent news...');
      
      const recentNews = await News.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        sentiment: { $exists: false }
      });
      
      for (const news of recentNews) {
        const sentiment = await this.analyzeSentimentForText(news.title + ' ' + news.content);
        
        news.sentiment = sentiment;
        news.updatedAt = new Date();
        
        await news.save();
      }
      
      console.log(`Sentiment analysis completed for ${recentNews.length} articles`);
      
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  }

  async cleanupOldNews() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await News.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['draft', 'archived'] }
      });
      
      console.log(`Cleaned up ${result.deletedCount} old news articles`);
      
    } catch (error) {
      console.error('Error cleaning up old news:', error);
    }
  }

  async getNewsByLanguage(language, limit = 20) {
    try {
      const cacheKey = `news:${language}:latest`;
      const cachedNews = await redisClient.get(cacheKey);
      
      if (cachedNews) {
        return JSON.parse(cachedNews);
      }
      
      const news = await News.find({
        language: language,
        status: 'published'
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('-content'); // Exclude full content for list view
      
      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(news), 300);
      
      return news;
      
    } catch (error) {
      console.error('Error fetching news by language:', error);
      throw error;
    }
  }

  async getNewsBySector(sector, limit = 10) {
    try {
      const news = await News.find({
        sector: sector,
        status: 'published',
        publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ publishedAt: -1 })
      .limit(limit);
      
      return news;
      
    } catch (error) {
      console.error('Error fetching news by sector:', error);
      throw error;
    }
  }

  async getSentimentBySector(sector) {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const news = await News.find({
        sector: sector,
        publishedAt: { $gte: last24Hours },
        sentiment: { $exists: true }
      });
      
      if (news.length === 0) {
        return 0;
      }
      
      const totalSentiment = news.reduce((sum, article) => sum + article.sentiment, 0);
      return totalSentiment / news.length;
      
    } catch (error) {
      console.error('Error getting sentiment by sector:', error);
      return 0;
    }
  }

  async healthCheck() {
    try {
      const recentNews = await News.find({}).sort({ createdAt: -1 }).limit(5);
      
      return {
        status: 'healthy',
        totalArticles: await News.countDocuments(),
        recentArticles: recentNews.length,
        lastUpdate: recentNews[0]?.createdAt || new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new NewsService();