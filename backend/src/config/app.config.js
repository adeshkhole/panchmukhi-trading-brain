require('dotenv').config();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // API Version
  API_VERSION: 'v1',
  
  // WebSocket
  WS_PATH: '/ws',
  
  // External Services
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://ml-service:8001',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true' || false,
  ENABLE_CACHE: process.env.ENABLE_CACHE !== 'false',
};
