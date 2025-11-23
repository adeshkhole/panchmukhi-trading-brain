const knex = require('knex');
const mongoose = require('mongoose');

// PostgreSQL connection for structured data
const pgConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'admin123',
    database: process.env.PG_DATABASE || 'panchmukhi_trading'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../database/migrations'
  },
  seeds: {
    directory: '../database/seeds'
  }
};

const pg = knex(pgConfig);

// MongoDB connection for unstructured data
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10
};

async function setupDatabase() {
  try {
    // Connect to PostgreSQL
    await pg.raw('SELECT 1');
    console.log('PostgreSQL connected successfully');
    
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/panchmukhi_trading',
      mongoConfig
    );
    console.log('MongoDB connected successfully');
    
    // Run migrations if needed
    await pg.migrate.latest();
    console.log('Database migrations completed');
    
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// MongoDB Schemas
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  language: { type: String, enum: ['mr', 'hi', 'en'], default: 'mr' },
  sector: String,
  source: String,
  sourceUrl: String,
  sentiment: { type: Number, min: -1, max: 1 },
  tags: [String],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const marketDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  price: Number,
  volume: Number,
  change: Number,
  changePercent: Number,
  high: Number,
  low: Number,
  open: Number,
  close: Number,
  source: String,
  metadata: Object
});

const alertSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  signal: { type: String, enum: ['BUY', 'SELL', 'HOLD'], required: true },
  entryPrice: Number,
  targetPrice: Number,
  stopLoss: Number,
  confidence: { type: Number, min: 0, max: 1 },
  reason: String,
  voiceMessage: String,
  status: { type: String, enum: ['active', 'executed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

const userActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

const News = mongoose.model('News', newsSchema);
const MarketData = mongoose.model('MarketData', marketDataSchema);
const Alert = mongoose.model('Alert', alertSchema);
const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = {
  setupDatabase,
  pg,
  mongoose,
  News,
  MarketData,
  Alert,
  UserActivity
};