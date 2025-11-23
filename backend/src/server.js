const fastify = require('fastify');
const path = require('path');

// Simple server setup without external dependencies first
const PORT = process.env.PORT || 8080;

// Basic server for testing
const server = fastify({
  logger: {
    level: 'info'
  }
});

// Register CORS manually first
server.register(async function (fastify) {
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (request.method === 'OPTIONS') {
      reply.code(200).send();
    }
  });
});

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
server.get('/api/news/latest', async (request, reply) => {
  const mockNews = [
    {
      id: 1,
      title: "रिलायन्स इंडस्ट्रीजचा नेट प्रॉफिट १२% वाढला",
      content: "Q3 निकालांमध्ये मोठी वाढ नोंदवली आहे",
      language: "mr",
      sentiment: 0.8,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      title: "TCS ने नवीन शेअर बायबॅक जाहीर केला",
      content: "कंपनीने ₹१८,००० कोटीचा बायबॅक कार्यक्रम जाहीर केला",
      language: "mr",
      sentiment: 0.6,
      timestamp: new Date().toISOString()
    }
  ];
  
  return {
    success: true,
    data: mockNews
  };
});

// Alerts endpoint
server.get('/api/alerts/active', async (request, reply) => {
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
    }
  ];
  
  return {
    success: true,
    data: mockAlerts
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