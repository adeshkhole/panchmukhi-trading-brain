const axios = require('axios');
const redisClient = require('../database/redis');
const { MarketData } = require('../database/connection');
const cron = require('node-cron');

class MarketDataService {
  constructor() {
    this.isRunning = false;
    this.cronJobs = [];
  }

  async start() {
    if (this.isRunning) return;
    
    console.log('Starting Market Data Service...');
    this.isRunning = true;
    
    // Schedule data collection jobs
    this.scheduleJobs();
    
    // Initial data fetch
    await this.fetchAllMarketData();
  }

  async stop() {
    console.log('Stopping Market Data Service...');
    this.isRunning = false;
    
    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
  }

  scheduleJobs() {
    // Market data every 1 minute during market hours (9:15 AM - 3:30 PM)
    const marketDataJob = cron.schedule('*/1 9-15 * * 1-5', async () => {
      if (this.isMarketHours()) {
        await this.fetchAllMarketData();
      }
    }, { timezone: 'Asia/Kolkata' });
    
    // Options data every 5 minutes
    const optionsJob = cron.schedule('*/5 9-15 * * 1-5', async () => {
      if (this.isMarketHours()) {
        await this.fetchOptionsData();
      }
    }, { timezone: 'Asia/Kolkata' });
    
    // After-hours data update
    const afterHoursJob = cron.schedule('0 16 * * 1-5', async () => {
      await this.fetchEndOfDayData();
    }, { timezone: 'Asia/Kolkata' });
    
    this.cronJobs.push(marketDataJob, optionsJob, afterHoursJob);
  }

  isMarketHours() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    // Market hours: 9:15 AM - 3:30 PM
    return currentTime >= 915 && currentTime <= 1530;
  }

  async fetchAllMarketData() {
    try {
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC', 'SBIN', 'ICICIBANK', 'LT'];
      
      const fetchPromises = symbols.map(symbol => this.fetchStockData(symbol));
      await Promise.all(fetchPromises);
      
      console.log('Market data updated successfully');
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }

  async fetchStockData(symbol) {
    try {
      // Try to get from cache first
      const cachedData = await redisClient.getMarketData(symbol);
      if (cachedData) {
        return cachedData;
      }

      // Fetch from NSE API (mock implementation)
      const marketData = await this.fetchFromNSE(symbol);
      
      // Cache the data
      await redisClient.cacheMarketData(symbol, marketData, 60); // 1 minute cache
      
      // Store in database
      await this.saveMarketData(symbol, marketData);
      
      return marketData;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  }

  async fetchFromNSE(symbol) {
    // Mock NSE API response
    // In production, this would call actual NSE API
    const basePrice = this.getBasePrice(symbol);
    const randomChange = (Math.random() - 0.5) * 0.02; // ±1% change
    
    const currentPrice = basePrice * (1 + randomChange);
    const dayChange = currentPrice - basePrice;
    const dayChangePercent = (dayChange / basePrice) * 100;
    
    return {
      symbol,
      price: currentPrice,
      change: dayChange,
      changePercent: dayChangePercent,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      high: currentPrice * 1.02,
      low: currentPrice * 0.98,
      open: basePrice,
      timestamp: new Date().toISOString(),
      source: 'NSE'
    };
  }

  getBasePrice(symbol) {
    const basePrices = {
      'RELIANCE': 2650,
      'TCS': 3890,
      'HDFC': 1750,
      'INFY': 1450,
      'ITC': 450,
      'SBIN': 650,
      'ICICIBANK': 950,
      'LT': 3200
    };
    
    return basePrices[symbol] || 1000;
  }

  async saveMarketData(symbol, data) {
    try {
      const marketData = new MarketData({
        symbol,
        timestamp: new Date(data.timestamp),
        price: data.price,
        volume: data.volume,
        change: data.change,
        changePercent: data.changePercent,
        high: data.high,
        low: data.low,
        open: data.open,
        close: data.price,
        source: data.source
      });
      
      await marketData.save();
    } catch (error) {
      console.error('Error saving market data:', error);
    }
  }

  async fetchOptionsData() {
    try {
      // Mock options data fetching
      const fiiData = {
        buyValue: Math.floor(Math.random() * 5000) + 2000,
        sellValue: Math.floor(Math.random() * 4000) + 1500,
        netValue: 0,
        timestamp: new Date().toISOString()
      };
      
      fiiData.netValue = fiiData.buyValue - fiiData.sellValue;
      
      // Cache options data
      await redisClient.cacheMarketData('FII_OPTIONS', fiiData, 300); // 5 minutes cache
      
      console.log('Options data updated:', fiiData);
    } catch (error) {
      console.error('Error fetching options data:', error);
    }
  }

  async fetchEndOfDayData() {
    try {
      // Fetch end of day data for all symbols
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC'];
      
      for (const symbol of symbols) {
        const eodData = await this.fetchEODData(symbol);
        await this.saveEODData(symbol, eodData);
      }
      
      console.log('End of day data updated successfully');
    } catch (error) {
      console.error('Error fetching EOD data:', error);
    }
  }

  async fetchEODData(symbol) {
    // Mock EOD data
    const basePrice = this.getBasePrice(symbol);
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const close = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(Math.random() * 5000000) + 1000000;
    
    return {
      symbol,
      date: new Date().toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
      change: close - open,
      changePercent: ((close - open) / open) * 100
    };
  }

  async saveEODData(symbol, data) {
    try {
      // Store EOD data in database
      await redisClient.cacheMarketData(`${symbol}_EOD`, data, 86400); // 24 hours cache
    } catch (error) {
      console.error('Error saving EOD data:', error);
    }
  }

  async getHistoricalData(symbol, period = '1M') {
    try {
      const days = period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : 365;
      
      // Mock historical data generation
      const historicalData = [];
      const basePrice = this.getBasePrice(symbol);
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
        const volume = Math.floor(Math.random() * 5000000) + 1000000;
        
        historicalData.push({
          date: date.toISOString().split('T')[0],
          price: price.toFixed(2),
          volume: volume
        });
      }
      
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getSectorData() {
    try {
      const sectors = {
        'IT': { change: 2.4, volume: 2847 },
        'Banking': { change: 1.8, volume: 4123 },
        'Pharma': { change: -0.5, volume: 1567 },
        'Auto': { change: 1.2, volume: 2156 },
        'Oil & Gas': { change: -1.1, volume: 3234 },
        'Realty': { change: 3.1, volume: 1892 },
        'FMCG': { change: 0.8, volume: 987 },
        'Steel': { change: 1.5, volume: 1456 }
      };
      
      return sectors;
    } catch (error) {
      console.error('Error fetching sector data:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const symbols = ['RELIANCE', 'TCS'];
      const testData = await Promise.all(
        symbols.map(symbol => this.fetchStockData(symbol))
      );
      
      return {
        status: 'healthy',
        lastUpdate: new Date().toISOString(),
        symbolsTested: symbols.length,
        dataPoints: testData.length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new MarketDataService();