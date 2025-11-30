const fastify = require('fastify');
const path = require('path');

// Server configuration
const PORT = process.env.PORT || 8083;
const HOST = process.env.HOST || '0.0.0.0';

// Basic server for testing
const server = fastify({
  logger: {
    level: 'info'
  }
});

// Register CORS
server.register(require('@fastify/cors'), {
  origin: '*', // Allow all origins (or use 'http://localhost:3000')
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Register Routes
server.register(require('./routes/news'));
server.register(require('./routes/isro'));
server.register(require('./routes/options'));
server.register(require('./routes/scrape'));
server.register(require('./routes/sentiment'));

// Basic health check
server.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Panchmukhi Trading Brain Backend'
  };
});

// Root endpoint
server.get('/', async (request, reply) => {
  return {
    message: 'पंचमुखी ट्रेडिंग ब्रेन API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      market: '/api/market',
      news: '/api/news',
      alerts: '/api/alerts'
    }
  };
});

// Market data endpoints
server.get('/api/market/data/:symbol', async (request, reply) => {
  const { symbol } = request.params;

  // Mock market data
  const marketData = {
    symbol: symbol,
    price: 2650 + Math.random() * 100 - 50,
    change: Math.random() * 10 - 5,
    volume: Math.floor(Math.random() * 1000000) + 100000,
    timestamp: new Date().toISOString()
  };

  return {
    success: true,
    data: marketData
  };
});

// Fusion score endpoint
server.get('/api/market/fusion/:symbol', async (request, reply) => {
  const { symbol } = request.params;
  const fusionScore = Math.random() * 0.5 + 0.5; // 0.5 to 1.0

  return {
    success: true,
    symbol: symbol,
    fusionScore: fusionScore,
    signal: fusionScore > 0.7 ? 'BUY' : fusionScore < 0.3 ? 'SELL' : 'HOLD',
    confidence: Math.abs(fusionScore - 0.5) * 2,
    timestamp: new Date().toISOString()
  };
});

// News endpoint
server.get('/api/news', async (request, reply) => {
  const mockNews = [
    {
      id: 1,
      title: "रिलायन्स इंडस्ट्रीजचा नेट प्रॉफिट १२% वाढला",
      content: "Q3 निकालांमध्ये मोठी वाढ नोंदवली आहे. जिओ आणि रिटेल व्यवसायात चांगली कामगिरी.",
      language: "mr",
      sector: "Energy",
      priority: "High",
      status: "published",
      sentiment: 0.8,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      title: "TCS ने नवीन शेअर बायबॅक जाहीर केला",
      content: "कंपनीने ₹१८,००० कोटीचा बायबॅक कार्यक्रम जाहीर केला. प्रति शेअर किंमत ₹४,५००.",
      language: "mr",
      sector: "IT",
      priority: "High",
      status: "published",
      sentiment: 0.6,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      title: "HDFC Bank quarterly results exceed expectations",
      content: "Net profit rises by 15% YoY. Asset quality remains stable with GNPA at 1.2%.",
      language: "en",
      sector: "Banking",
      priority: "Medium",
      status: "published",
      sentiment: 0.7,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      title: "टाटा मोटर्सच्या विक्रीत वाढ",
      content: "इलेक्ट्रिक वाहनांच्या मागणीत मोठी वाढ. नेक्सॉन ईव्हीची विक्रमी विक्री.",
      language: "mr",
      sector: "Auto",
      priority: "Medium",
      status: "published",
      sentiment: 0.85,
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 5,
      title: "Adani Green Energy secures new solar project",
      content: "Wins bid for 500MW solar park in Rajasthan.",
      language: "en",
      sector: "Energy",
      priority: "Low",
      status: "published",
      sentiment: 0.65,
      timestamp: new Date(Date.now() - 14400000).toISOString()
    }
  ];

  // Filter by query params if needed
  const { sector, priority, language } = request.query || {};
  let filteredNews = mockNews;

  if (sector) filteredNews = filteredNews.filter(n => n.sector === sector);
  if (priority) filteredNews = filteredNews.filter(n => n.priority === priority);
  if (language) filteredNews = filteredNews.filter(n => n.language === language);

  return {
    success: true,
    data: filteredNews
  };
});

// Alias for latest news
server.get('/api/news/latest', async (request, reply) => {
  // Redirect or reuse logic
  return server.inject({ method: 'GET', url: '/api/news' }).then(res => res.json());
});

// Alerts endpoint
server.get('/api/alerts', async (request, reply) => {
  const mockAlerts = [
    {
      id: 1,
      symbol: "RELIANCE",
      signal: "BUY",
      entryPrice: 2650,
      targetPrice: 2725,
      stopLoss: 2620,
      confidence: 0.85,
      voiceMessage: "राजेशभाऊ, रिलायन्स वर खरेदीचा सिग्नल आहे",
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      symbol: "TCS",
      signal: "SELL",
      entryPrice: 3850,
      targetPrice: 3750,
      stopLoss: 3900,
      confidence: 0.78,
      voiceMessage: "TCS मध्ये विक्रीचा दबाव आहे",
      timestamp: new Date().toISOString()
    }
  ];

  return {
    success: true,
    data: mockAlerts
  };
});

// IPO Endpoint
server.get('/api/ipo', async (request, reply) => {
  const { status } = request.query;

  const mockIPOs = [
    {
      id: "tech-innovators",
      name: "Tech Innovators IPO",
      symbol: "TECHINNO",
      type: "Mainboard",
      status: "open",
      priceRange: "₹425 - ₹450",
      lotSize: 33,
      issueSize: "₹850 Cr",
      openDate: "2024-12-12",
      closeDate: "2024-12-15",
      subscription: "7.8x",
      gmp: "+₹85 (+18.9%)",
      sector: "IT"
    },
    {
      id: "healthcare-solutions",
      name: "Healthcare Solutions IPO",
      symbol: "HEALTHSOL",
      type: "Mainboard",
      status: "open",
      priceRange: "₹650 - ₹685",
      lotSize: 21,
      issueSize: "₹1,250 Cr",
      openDate: "2024-12-10",
      closeDate: "2024-12-13",
      subscription: "5.2x",
      gmp: "+₹45 (+6.6%)",
      sector: "Pharma"
    },
    {
      id: "green-energy",
      name: "Green Energy IPO",
      symbol: "GREENPWR",
      type: "Mainboard",
      status: "upcoming",
      priceRange: "₹325 - ₹340",
      lotSize: 44,
      issueSize: "₹650 Cr",
      openDate: "2024-12-20",
      closeDate: "2024-12-23",
      subscription: "N/A",
      gmp: "+₹25 (+7.4%)",
      sector: "Energy"
    },
    {
      id: "consumer-goods",
      name: "Consumer Goods IPO",
      symbol: "CONSUMER",
      type: "Mainboard",
      status: "closed",
      priceRange: "₹550 - ₹580",
      lotSize: 25,
      issueSize: "₹950 Cr",
      openDate: "2024-12-05",
      closeDate: "2024-12-08",
      subscription: "12.8x",
      gmp: "+₹125 (+21.6%)",
      sector: "FMCG"
    }
  ];

  let filtered = mockIPOs;
  if (status && status !== 'all') {
    filtered = mockIPOs.filter(ipo => ipo.status === status);
  }

  return {
    success: true,
    data: filtered
  };
});

// Sectors Endpoint
server.get('/api/sectors', async (request, reply) => {
  const mockSectors = [
    { name: "NIFTY 50", value: 18950.50, change: 0.85, status: "positive" },
    { name: "BANK NIFTY", value: 42850.75, change: 0.77, status: "positive" },
    { name: "NIFTY IT", value: 32450.20, change: 1.25, status: "positive" },
    { name: "NIFTY PHARMA", value: 15230.10, change: -0.45, status: "negative" },
    { name: "NIFTY AUTO", value: 16780.40, change: 0.95, status: "positive" },
    { name: "NIFTY METAL", value: 6540.30, change: -1.10, status: "negative" }
  ];

  return {
    success: true,
    data: mockSectors
  };
});

// WebSocket support
const websocketClients = new Set();

server.get('/ws', { websocket: true }, (connection, request) => {
  websocketClients.add(connection);

  connection.on('message', (message) => {
    // Handle WebSocket messages
    console.log('WebSocket message received:', message.toString());
  });

  connection.on('close', () => {
    websocketClients.delete(connection);
  });

  // Send welcome message
  connection.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'WebSocket connected successfully',
    timestamp: new Date().toISOString()
  }));
});

// Broadcast function for WebSocket
function broadcastToClients(data) {
  websocketClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Start server
const startServer = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🏠 API endpoints: http://localhost:${PORT}/`);

    // Simulate real-time updates
    setInterval(() => {
      const update = {
        type: 'MARKET_UPDATE',
        data: {
          symbol: 'RELIANCE',
          price: 2650 + Math.random() * 100 - 50,
          timestamp: new Date().toISOString()
        }
      };
      broadcastToClients(update);
    }, 5000);

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = server;