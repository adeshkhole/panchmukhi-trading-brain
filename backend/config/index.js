// Minimal config placeholder for Docker build
// Populate with environment-specific settings if required
module.exports = {
  // Example placeholders (override via environment variables)
  app: {
    port: process.env.PORT || 8081,
    env: process.env.NODE_ENV || 'development'
  },
  db: {
    postgres: process.env.DATABASE_URL || null,
    mongodb: process.env.MONGODB_URI || null
  }
};
