const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const config = require('../config/app.config');

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let logMessage = `${timestamp} [${level}]: ${message}`;
  
  // Add stack trace if present
  if (stack) {
    logMessage += `\n${stack}`;
  }
  
  // Add additional metadata if present
  const metaData = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  
  return logMessage + metaData;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'panchmukhi-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
  ],
});

// Add file transport in production
if (config.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

// Create a stream for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
