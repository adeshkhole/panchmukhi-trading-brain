// Panchmukhi Trading Brain Pro - MongoDB Initialization Script
// Creates collections and indexes for the trading analytics database

// Use the trading_analytics database
db = db.getSiblingDB('trading_analytics');

// Create collections for time-series data
db.createCollection('market_data', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['symbol', 'timestamp', 'price'],
      properties: {
        _id: { bsonType: 'objectId' },
        symbol: { bsonType: 'string', description: 'Stock symbol (e.g., TCS, RELIANCE)' },
        timestamp: { bsonType: 'date', description: 'Data timestamp' },
        price: { bsonType: 'double', description: 'Stock price' },
        volume: { bsonType: 'int', description: 'Trading volume' },
        change: { bsonType: 'double', description: 'Price change percentage' }
      }
    }
  }
});

db.createCollection('trading_signals', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'symbol', 'signalType', 'timestamp'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        symbol: { bsonType: 'string' },
        signalType: { bsonType: 'string', enum: ['buy', 'sell', 'hold'] },
        confidence: { bsonType: 'double', minimum: 0, maximum: 1 },
        timestamp: { bsonType: 'date' },
        executionPrice: { bsonType: 'double' }
      }
    }
  }
});

db.createCollection('news_sentiment', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['symbol', 'timestamp', 'sentiment'],
      properties: {
        _id: { bsonType: 'objectId' },
        symbol: { bsonType: 'string' },
        headline: { bsonType: 'string' },
        sentiment: { bsonType: 'string', enum: ['positive', 'negative', 'neutral'] },
        sentimentScore: { bsonType: 'double', minimum: -1, maximum: 1 },
        source: { bsonType: 'string' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('alerts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'alertType', 'timestamp'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        alertType: { bsonType: 'string' },
        message: { bsonType: 'string' },
        isRead: { bsonType: 'bool' },
        timestamp: { bsonType: 'date' },
        relatedSymbols: { bsonType: 'array', items: { bsonType: 'string' } }
      }
    }
  }
});

// Create indexes for performance
db.market_data.createIndex({ symbol: 1, timestamp: -1 });
db.market_data.createIndex({ timestamp: -1 });

db.trading_signals.createIndex({ userId: 1, timestamp: -1 });
db.trading_signals.createIndex({ symbol: 1, timestamp: -1 });

db.news_sentiment.createIndex({ symbol: 1, timestamp: -1 });
db.news_sentiment.createIndex({ sentimentScore: 1 });

db.alerts.createIndex({ userId: 1, timestamp: -1 });
db.alerts.createIndex({ userId: 1, isRead: 1 });

// Create TTL index for automatic cleanup of old alerts (30 days)
db.alerts.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

print('MongoDB initialization completed successfully for Panchmukhi Trading Brain Pro');
