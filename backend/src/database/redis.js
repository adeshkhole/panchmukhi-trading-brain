const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
      
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async ping() {
    return await this.client.ping();
  }

  // Cache market data
  async cacheMarketData(symbol, data, ttl = 300) {
    const key = `market:${symbol}`;
    await this.client.setEx(key, ttl, JSON.stringify(data));
  }

  async getMarketData(symbol) {
    const key = `market:${symbol}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Cache news data
  async cacheNews(language, sector, data, ttl = 600) {
    const key = `news:${language}:${sector}`;
    await this.client.setEx(key, ttl, JSON.stringify(data));
  }

  async getNews(language, sector) {
    const key = `news:${language}:${sector}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Cache fusion scores
  async cacheFusionScore(symbol, score, ttl = 60) {
    const key = `fusion:${symbol}`;
    await this.client.setEx(key, ttl, score.toString());
  }

  async getFusionScore(symbol) {
    const key = `fusion:${symbol}`;
    const score = await this.client.get(key);
    return score ? parseFloat(score) : null;
  }

  // Store user sessions
  async setSession(sessionId, userData, ttl = 3600) {
    const key = `session:${sessionId}`;
    await this.client.setEx(key, ttl, JSON.stringify(userData));
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }

  // Rate limiting
  async checkRateLimit(identifier, limit, window) {
    const key = `rate_limit:${identifier}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }
    
    return {
      allowed: current <= limit,
      current: current,
      limit: limit
    };
  }

  // Pub/Sub for real-time updates
  async publish(channel, message) {
    await this.client.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel, callback) {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      callback(JSON.parse(message));
    });
    
    return subscriber;
  }

  // Cache API responses
  async cacheApiResponse(endpoint, params, data, ttl = 300) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    await this.client.setEx(key, ttl, JSON.stringify(data));
  }

  async getApiResponse(endpoint, params) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Store user preferences
  async setUserPreference(userId, key, value) {
    const redisKey = `user:${userId}:prefs:${key}`;
    await this.client.set(redisKey, JSON.stringify(value));
  }

  async getUserPreference(userId, key) {
    const redisKey = `user:${userId}:prefs:${key}`;
    const data = await this.client.get(redisKey);
    return data ? JSON.parse(data) : null;
  }

  // Alert queue
  async addToAlertQueue(alertData) {
    await this.client.lPush('alert_queue', JSON.stringify(alertData));
  }

  async getAlertQueue() {
    const alerts = await this.client.lRange('alert_queue', 0, -1);
    return alerts.map(alert => JSON.parse(alert));
  }

  async removeFromAlertQueue(alertData) {
    await this.client.lRem('alert_queue', 0, JSON.stringify(alertData));
  }
}

module.exports = new RedisClient();