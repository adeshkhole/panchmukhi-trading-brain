const { Alert } = require('../database/connection');
const redisClient = require('../database/redis');
const marketDataService = require('./marketDataService');
const newsService = require('./newsService');
const cron = require('node-cron');

class AlertService {
  constructor() {
    this.isRunning = false;
    this.cronJobs = [];
    this.fusionWeights = {
      satellite: 0.2,
      news: 0.2,
      options: 0.2,
      web: 0.2,
      social: 0.2
    };
  }

  async start() {
    if (this.isRunning) return;
    
    console.log('Starting Alert Service...');
    this.isRunning = true;
    
    // Schedule alert generation jobs
    this.scheduleJobs();
    
    // Initial fusion score calculation
    await this.calculateFusionScores();
  }

  async stop() {
    console.log('Stopping Alert Service...');
    this.isRunning = false;
    
    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
  }

  scheduleJobs() {
    // Calculate fusion scores every 5 minutes during market hours
    const fusionJob = cron.schedule('*/5 9-15 * * 1-5', async () => {
      if (marketDataService.isMarketHours()) {
        await this.calculateFusionScores();
      }
    }, { timezone: 'Asia/Kolkata' });
    
    // Generate alerts every 10 minutes
    const alertJob = cron.schedule('*/10 9-15 * * 1-5', async () => {
      if (marketDataService.isMarketHours()) {
        await this.generateAlerts();
      }
    }, { timezone: 'Asia/Kolkata' });
    
    // Clean up old alerts every hour
    const cleanupJob = cron.schedule('0 * * * *', async () => {
      await this.cleanupOldAlerts();
    });
    
    this.cronJobs.push(fusionJob, alertJob, cleanupJob);
  }

  async calculateFusionScores() {
    try {
      console.log('Calculating fusion scores...');
      
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC'];
      
      for (const symbol of symbols) {
        const fusionScore = await this.calculateFusionScore(symbol);
        
        // Cache the fusion score
        await redisClient.cacheFusionScore(symbol, fusionScore, 300); // 5 minutes cache
        
        console.log(`${symbol} fusion score: ${fusionScore}`);
      }
      
    } catch (error) {
      console.error('Error calculating fusion scores:', error);
    }
  }

  async calculateFusionScore(symbol) {
    try {
      const scores = await this.getIndividualScores(symbol);
      
      // Calculate weighted fusion score
      let fusionScore = 0;
      let totalWeight = 0;
      
      for (const [source, score] of Object.entries(scores)) {
        const weight = this.fusionWeights[source] || 0;
        fusionScore += score * weight;
        totalWeight += weight;
      }
      
      // Normalize the score
      if (totalWeight > 0) {
        fusionScore = fusionScore / totalWeight;
      }
      
      // Ensure score is between 0 and 1
      return Math.max(0, Math.min(1, fusionScore));
      
    } catch (error) {
      console.error(`Error calculating fusion score for ${symbol}:`, error);
      return 0.5; // Default neutral score
    }
  }

  async getIndividualScores(symbol) {
    const scores = {};
    
    try {
      // 1. Satellite Data Score (ISRO Bhuvan)
      scores.satellite = await this.getSatelliteScore(symbol);
      
      // 2. News Sentiment Score
      scores.news = await this.getNewsSentimentScore(symbol);
      
      // 3. Options Flow Score
      scores.options = await this.getOptionsFlowScore(symbol);
      
      // 4. Web Scraping Score
      scores.web = await this.getWebScrapingScore(symbol);
      
      // 5. Social Media Sentiment Score
      scores.social = await this.getSocialMediaScore(symbol);
      
    } catch (error) {
      console.error('Error getting individual scores:', error);
    }
    
    return scores;
  }

  async getSatelliteScore(symbol) {
    // Mock satellite data score based on industrial activity
    // In production, this would use actual ISRO Bhuvan API
    
    const satelliteData = {
      'RELIANCE': Math.random() * 0.3 + 0.7, // High activity
      'TCS': Math.random() * 0.2 + 0.6,     // Medium-high activity
      'HDFC': Math.random() * 0.2 + 0.5,    // Medium activity
      'INFY': Math.random() * 0.2 + 0.6,    // Medium-high activity
      'ITC': Math.random() * 0.3 + 0.4      // Medium-low activity
    };
    
    return satelliteData[symbol] || 0.5;
  }

  async getNewsSentimentScore(symbol) {
    try {
      const sector = this.getSectorForSymbol(symbol);
      const sentiment = await newsService.getSentimentBySector(sector);
      
      // Convert sentiment (-1 to 1) to score (0 to 1)
      return (sentiment + 1) / 2;
      
    } catch (error) {
      console.error('Error getting news sentiment score:', error);
      return 0.5;
    }
  }

  async getOptionsFlowScore(symbol) {
    // Mock options flow data
    // In production, this would use NSE Bhavcopy data
    
    const fiiData = await redisClient.getMarketData('FII_OPTIONS');
    
    if (fiiData && fiiData.netValue) {
      // Positive net value = bullish (higher score)
      // Negative net value = bearish (lower score)
      const maxValue = 5000; // Maximum expected value
      const score = (fiiData.netValue + maxValue) / (2 * maxValue);
      return Math.max(0, Math.min(1, score));
    }
    
    return 0.5; // Neutral if no data
  }

  async getWebScrapingScore(symbol) {
    // Mock web scraping score based on product rankings
    // In production, this would scrape Amazon, Flipkart, etc.
    
    const webData = {
      'RELIANCE': { jioPhoneRank: Math.floor(Math.random() * 20) + 1 },
      'TCS': { serviceRanking: Math.floor(Math.random() * 10) + 1 },
      'HDFC': { bankingAppRank: Math.floor(Math.random() * 15) + 1 },
      'INFY': { serviceRanking: Math.floor(Math.random() * 10) + 1 },
      'ITC': { fmcgRank: Math.floor(Math.random() * 25) + 1 }
    };
    
    const data = webData[symbol];
    if (data) {
      // Lower rank = higher score
      const rank = Object.values(data)[0];
      return Math.max(0, (50 - rank) / 50);
    }
    
    return 0.5;
  }

  async getSocialMediaScore(symbol) {
    // Mock social media sentiment
    // In production, this would analyze YouTube, Twitter, etc.
    
    const socialData = {
      'RELIANCE': { bullishPercent: Math.random() * 0.4 + 0.6 },
      'TCS': { bullishPercent: Math.random() * 0.3 + 0.5 },
      'HDFC': { bullishPercent: Math.random() * 0.3 + 0.5 },
      'INFY': { bullishPercent: Math.random() * 0.3 + 0.6 },
      'ITC': { bullishPercent: Math.random() * 0.4 + 0.4 }
    };
    
    return socialData[symbol]?.bullishPercent || 0.5;
  }

  getSectorForSymbol(symbol) {
    const sectors = {
      'RELIANCE': 'Oil & Gas',
      'TCS': 'IT',
      'HDFC': 'Banking',
      'INFY': 'IT',
      'ITC': 'FMCG'
    };
    
    return sectors[symbol] || 'General';
  }

  async generateAlerts() {
    try {
      console.log('Generating trading alerts...');
      
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC'];
      
      for (const symbol of symbols) {
        const fusionScore = await redisClient.getFusionScore(symbol);
        
        if (fusionScore !== null) {
          const alert = await this.generateAlert(symbol, fusionScore);
          
          if (alert) {
            await this.saveAlert(alert);
            await this.broadcastAlert(alert);
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }

  async generateAlert(symbol, fusionScore) {
    try {
      const marketData = await redisClient.getMarketData(symbol);
      
      if (!marketData) {
        return null;
      }
      
      let signal, confidence, reason;
      
      if (fusionScore > 0.7) {
        signal = 'BUY';
        confidence = fusionScore;
        reason = `${this.getSectorForSymbol(symbol)} सेक्टरमध्ये सकारात्मक चाल, सर्व डेटा स्रोत सकारात्मक`;
      } else if (fusionScore < 0.3) {
        signal = 'SELL';
        confidence = 1 - fusionScore;
        reason = `${this.getSectorForSymbol(symbol)} सेक्टरमध्ये नकारात्मक चाल, सर्व डेटा स्रोत नकारात्मक`;
      } else {
        signal = 'HOLD';
        confidence = 0.5;
        reason = `${this.getSectorForSymbol(symbol)} सेक्टरमध्ये मिश्र चाल, काही डेटा स्रोत सकारात्मक, काही नकारात्मक`;
      }
      
      // Generate price levels
      const currentPrice = marketData.price;
      const entryPrice = currentPrice;
      
      let targetPrice, stopLoss;
      
      if (signal === 'BUY') {
        targetPrice = currentPrice * (1 + 0.03); // 3% target
        stopLoss = currentPrice * (1 - 0.02);    // 2% stop loss
      } else if (signal === 'SELL') {
        targetPrice = currentPrice * (1 - 0.03); // 3% target (downside)
        stopLoss = currentPrice * (1 + 0.02);    // 2% stop loss (upside)
      } else {
        targetPrice = currentPrice;
        stopLoss = currentPrice;
      }
      
      // Generate voice message in Marathi
      const voiceMessage = this.generateVoiceMessage(symbol, signal, entryPrice, targetPrice, stopLoss, reason);
      
      return {
        symbol,
        signal,
        entryPrice: Math.round(entryPrice * 100) / 100,
        targetPrice: Math.round(targetPrice * 100) / 100,
        stopLoss: Math.round(stopLoss * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        reason,
        voiceMessage,
        fusionScore: Math.round(fusionScore * 100) / 100,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
    } catch (error) {
      console.error('Error generating alert:', error);
      return null;
    }
  }

  generateVoiceMessage(symbol, signal, entryPrice, targetPrice, stopLoss, reason) {
    const marathiSignal = signal === 'BUY' ? 'खरेदी' : signal === 'SELL' ? 'विक्री' : 'थांबा';
    
    return `${symbol} साठी ${marathiSignal}चा सिग्नल आहे. एन्ट्री ${entryPrice} रुपये, टार्गेट ${targetPrice} रुपये, स्टॉप लॉस ${stopLoss} रुपये. ${reason}`;
  }

  async saveAlert(alertData) {
    try {
      const alert = new Alert(alertData);
      await alert.save();
      
      console.log(`Alert saved: ${alertData.symbol} ${alertData.signal}`);
      return alert;
      
    } catch (error) {
      console.error('Error saving alert:', error);
      throw error;
    }
  }

  async broadcastAlert(alert) {
    try {
      // Add to alert queue for real-time broadcasting
      await redisClient.addToAlertQueue({
        type: 'NEW_ALERT',
        data: alert,
        timestamp: new Date().toISOString()
      });
      
      // Publish to WebSocket connections
      await redisClient.publish('alerts', {
        type: 'NEW_ALERT',
        data: alert
      });
      
      console.log(`Alert broadcasted: ${alert.symbol} ${alert.signal}`);
      
    } catch (error) {
      console.error('Error broadcasting alert:', error);
    }
  }

  async getActiveAlerts(limit = 20) {
    try {
      const alerts = await Alert.find({
        status: 'active',
        expiresAt: { $gte: new Date() }
      })
      .sort({ createdAt: -1 })
      .limit(limit);
      
      return alerts;
      
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw error;
    }
  }

  async getAlertHistory(symbol, limit = 50) {
    try {
      const alerts = await Alert.find({
        symbol: symbol
      })
      .sort({ createdAt: -1 })
      .limit(limit);
      
      return alerts;
      
    } catch (error) {
      console.error('Error getting alert history:', error);
      throw error;
    }
  }

  async updateAlertStatus(alertId, status) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        { status: status, updatedAt: new Date() },
        { new: true }
      );
      
      return alert;
      
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }

  async cleanupOldAlerts() {
    try {
      const result = await Alert.deleteMany({
        expiresAt: { $lt: new Date() },
        status: { $in: ['active', 'cancelled'] }
      });
      
      console.log(`Cleaned up ${result.deletedCount} old alerts`);
      
    } catch (error) {
      console.error('Error cleaning up old alerts:', error);
    }
  }

  async healthCheck() {
    try {
      const activeAlerts = await Alert.countDocuments({ status: 'active' });
      const recentAlerts = await Alert.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      return {
        status: 'healthy',
        activeAlerts: activeAlerts,
        recentAlerts: recentAlerts,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new AlertService();