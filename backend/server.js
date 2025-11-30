// Panchmukhi Trading Brain Pro - Enhanced Backend Server
const Fastify = require('fastify');
const path = require('path');
const fs = require('fs').promises;

// Create Fastify instance with enhanced configuration
const server = Fastify({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
                ignore: 'pid,hostname'
            }
        }
    },
    trustProxy: true,
    maxParamLength: 500,
    bodyLimit: 1048576 * 10 // 10MB
});

// Server configuration
const PORT = process.env.PORT || 8083;
const HOST = process.env.HOST || '0.0.0.0';

// Handle graceful shutdown to release port
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// In-memory data storage (in production, use proper database)
const appData = {
    users: new Map(),
    sessions: new Map(),
    marketData: new Map(),
    news: [],
    alerts: [],
    ipos: new Map(),
    sectors: new Map(),
    analytics: {
        userActivity: [],
        marketMetrics: {},
        systemHealth: {}
    }
};

// Initialize with sample data
function initializeData() {
    // Sample users
    appData.users.set('user123', {
        id: 'user123',
        name: 'राजेश पाटील',
        email: 'rajesh@email.com',
        phone: '9876543210',
        plan: 'pro',
        status: 'active',
        preferences: {
            language: 'mr',
            voiceAlerts: true,
            theme: 'dark'
        },
        watchlist: ['RELIANCE', 'TCS', 'HDFC'],
        createdAt: new Date('2024-11-22')
    });

    // Sample IPO data
    appData.ipos.set('tech-innovators', {
        id: 'tech-innovators',
        name: 'टेक इनोव्हेटर्स IPO',
        company: 'टेक इनोव्हेटर्स लिमिटेड',
        sector: 'IT सेवा प्रदाता',
        priceRange: '₹425 - ₹450',
        lotSize: 33,
        totalIssue: '₹850 Cr',
        openingDate: '१३ डिसेंबर २०२४',
        closingDate: '१५ डिसेंबर २०२४',
        status: 'open',
        subscription: {
            total: 7.8,
            qib: 12.5,
            nii: 8.2,
            retail: 5.1
        },
        gmp: { current: 85, percentage: 18.9 }
    });

    // Sample market data
    appData.marketData.set('NIFTY', {
        symbol: 'NIFTY',
        price: 18950,
        change: 125.50,
        changePercent: 0.67,
        volume: 125000000,
        timestamp: new Date()
    });

    // Sample news
    appData.news = [
        {
            id: 'news123',
            title: 'रिलायन्स इंडस्ट्रीजचा नेट प्रॉफिट १२% वाढला',
            content: 'Q3 निकालांमध्ये मोठी वाढ नोंदवली आहे',
            sector: 'ऊर्जा',
            language: 'mr',
            sentiment: 0.8,
            status: 'published',
            timestamp: new Date()
        },
        {
            id: 'news124',
            title: 'TCS ने नवीन शेअर बायबॅक जाहीर केला',
            content: 'कंपनीने ₹१८,००० कोटीचा बायबॅक कार्यक्रम जाहीर केला',
            sector: 'IT',
            language: 'mr',
            sentiment: 0.6,
            status: 'published',
            timestamp: new Date()
        }
    ];

    // Sample alerts
    appData.alerts = [
        {
            id: 'alert123',
            symbol: 'RELIANCE',
            signal: 'BUY',
            entryPrice: 2650,
            targetPrice: 2750,
            stopLoss: 2600,
            confidence: 85,
            status: 'active',
            timestamp: new Date()
        },
        {
            id: 'alert124',
            symbol: 'TCS',
            signal: 'SELL',
            entryPrice: 3850,
            targetPrice: 3750,
            stopLoss: 3900,
            confidence: 78,
            status: 'active',
            timestamp: new Date()
        }
    ];

    // Sample sectors data
    appData.sectors.set('IT', {
        name: 'IT सेक्टर',
        performance: 2.3,
        topStocks: ['TCS', 'INFY', 'HCL'],
        marketCap: '₹25,450 Cr',
        peRatio: 28.5
    });

    appData.sectors.set('BANKING', {
        name: 'बँकिंग',
        performance: 1.8,
        topStocks: ['HDFC', 'ICICI', 'SBI'],
        marketCap: '₹42,850 Cr',
        peRatio: 18.2
    });
}

// Security middleware
server.addHook('onRequest', async (request, reply) => {
    // CORS headers
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        reply.code(200).send();
        return;
    }

    // Request logging
    server.log.info(`${request.method} ${request.url} from ${request.ip}`);
});

// Response logging
server.addHook('onResponse', async (request, reply) => {
    server.log.info(`${request.method} ${request.url} - ${reply.statusCode} (${reply.elapsedTime}ms)`);
});

// Error handling
server.setErrorHandler((error, request, reply) => {
    server.log.error(error);

    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    reply.code(statusCode).send({
        success: false,
        error: {
            message: message,
            code: statusCode,
            timestamp: new Date().toISOString()
        }
    });
});

// Health check endpoint
server.get('/health', async (request, reply) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            service: 'Panchmukhi Trading Brain Pro Backend',
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                external: Math.round(memoryUsage.external / 1024 / 1024)
            },
            nodejs: process.version,
            platform: process.platform,
            arch: process.arch
        }
    };
});

// Root endpoint
server.get('/', async (request, reply) => {
    return {
        success: true,
        message: 'पंचमुखी ट्रेडिंग ब्रेन प्रो API',
        version: '2.0.0',
        status: 'running',
        features: [
            'Real-time Market Data',
            'AI-Powered Analytics',
            'Multi-Language Support',
            'Advanced Charting',
            'Voice Alerts',
            'IPO Tracking',
            'Sector Analysis',
            'Portfolio Management'
        ],
        endpoints: {
            health: '/health',
            market: '/api/market',
            news: '/api/news',
            alerts: '/api/alerts',
            ipo: '/api/ipo',
            sectors: '/api/sectors',
            users: '/api/users',
            analytics: '/api/analytics'
        },
        documentation: '/docs',
        support: 'support@panchmukhi.ai'
    };
});

// Market Data Endpoints
server.get('/api/market/symbols', async (request, reply) => {
    const symbols = Array.from(appData.marketData.keys());
    return {
        success: true,
        data: symbols,
        count: symbols.length
    };
});

server.get('/api/market/data/:symbol', async (request, reply) => {
    const { symbol } = request.params;
    const marketData = appData.marketData.get(symbol.toUpperCase());

    if (!marketData) {
        // Generate mock data for unknown symbols
        const mockData = {
            symbol: symbol.toUpperCase(),
            price: 2500 + Math.random() * 1000,
            change: (Math.random() - 0.5) * 100,
            changePercent: (Math.random() - 0.5) * 5,
            volume: Math.floor(Math.random() * 100000000) + 10000000,
            high52: 2800 + Math.random() * 1000,
            low52: 2000 + Math.random() * 500,
            timestamp: new Date()
        };

        // Calculate change percentage
        mockData.changePercent = (mockData.change / (mockData.price - mockData.change)) * 100;

        return {
            success: true,
            data: mockData,
            source: 'mock'
        };
    }

    return {
        success: true,
        data: marketData,
        source: 'cache'
    };
});

server.get('/api/market/fusion/:symbol', async (request, reply) => {
    const { symbol } = request.params;

    // Calculate fusion score based on multiple factors
    const factors = {
        satellite: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
        news: Math.random() * 0.3 + 0.1,      // 0.1 to 0.4
        options: Math.random() * 0.2 + 0.1,   // 0.1 to 0.3
        web: Math.random() * 0.2 + 0.1,       // 0.1 to 0.3
        social: Math.random() * 0.2 + 0.1     // 0.1 to 0.3
    };

    const fusionScore = Object.values(factors).reduce((sum, val) => sum + val, 0);
    const normalizedScore = Math.min(fusionScore, 1.0);

    let signal = 'HOLD';
    if (normalizedScore > 0.7) signal = 'BUY';
    else if (normalizedScore < 0.3) signal = 'SELL';

    const confidence = Math.abs(normalizedScore - 0.5) * 2;

    return {
        success: true,
        data: {
            symbol: symbol.toUpperCase(),
            fusionScore: parseFloat(normalizedScore.toFixed(3)),
            signal,
            confidence: parseFloat(confidence.toFixed(3)),
            factors,
            timestamp: new Date().toISOString()
        }
    };
});

server.get('/api/market/heatmap', async (request, reply) => {
    const sectors = Array.from(appData.sectors.entries()).map(([key, sector]) => ({
        name: key,
        displayName: sector.name,
        performance: sector.performance,
        marketCap: sector.marketCap,
        peRatio: sector.peRatio,
        color: getPerformanceColor(sector.performance)
    }));

    return {
        success: true,
        data: sectors,
        generatedAt: new Date().toISOString()
    };
});

// News Endpoints
server.get('/api/news', async (request, reply) => {
    const { limit = 20, offset = 0, language = 'all', sector = 'all' } = request.query;

    let filteredNews = appData.news;

    if (language !== 'all') {
        filteredNews = filteredNews.filter(news => news.language === language);
    }

    if (sector !== 'all') {
        filteredNews = filteredNews.filter(news => news.sector === sector);
    }

    const paginatedNews = filteredNews.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    return {
        success: true,
        data: paginatedNews,
        pagination: {
            total: filteredNews.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: filteredNews.length > parseInt(offset) + parseInt(limit)
        }
    };
});

server.post('/api/news', async (request, reply) => {
    const { title, content, sector, language, sentiment } = request.body;

    if (!title || !content) {
        reply.code(400);
        return {
            success: false,
            error: { message: 'Title and content are required' }
        };
    }

    const newNews = {
        id: `news${Date.now()}`,
        title,
        content,
        sector: sector || 'general',
        language: language || 'mr',
        sentiment: sentiment || 0.5,
        status: 'published',
        timestamp: new Date()
    };

    appData.news.unshift(newNews);

    return {
        success: true,
        data: newNews,
        message: 'News article created successfully'
    };
});

server.put('/api/news/:id', async (request, reply) => {
    const { id } = request.params;
    const updates = request.body;

    const newsIndex = appData.news.findIndex(news => news.id === id);
    if (newsIndex === -1) {
        reply.code(404);
        return {
            success: false,
            error: { message: 'News article not found' }
        };
    }

    appData.news[newsIndex] = { ...appData.news[newsIndex], ...updates };

    return {
        success: true,
        data: appData.news[newsIndex],
        message: 'News article updated successfully'
    };
});

server.delete('/api/news/:id', async (request, reply) => {
    const { id } = request.params;

    const newsIndex = appData.news.findIndex(news => news.id === id);
    if (newsIndex === -1) {
        reply.code(404);
        return {
            success: false,
            error: { message: 'News article not found' }
        };
    }

    const deletedNews = appData.news.splice(newsIndex, 1)[0];

    return {
        success: true,
        data: deletedNews,
        message: 'News article deleted successfully'
    };
});

// Alerts Endpoints
server.get('/api/alerts', async (request, reply) => {
    const { status = 'all', symbol } = request.query;

    let filteredAlerts = appData.alerts;

    if (status !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (symbol) {
        filteredAlerts = filteredAlerts.filter(alert => alert.symbol === symbol.toUpperCase());
    }

    return {
        success: true,
        data: filteredAlerts,
        count: filteredAlerts.length
    };
});

server.post('/api/alerts', async (request, reply) => {
    const { symbol, signal, entryPrice, targetPrice, stopLoss, confidence } = request.body;

    if (!symbol || !signal || !entryPrice) {
        reply.code(400);
        return {
            success: false,
            error: { message: 'Symbol, signal, and entry price are required' }
        };
    }

    const newAlert = {
        id: `alert${Date.now()}`,
        symbol: symbol.toUpperCase(),
        signal: signal.toUpperCase(),
        entryPrice: parseFloat(entryPrice),
        targetPrice: parseFloat(targetPrice) || 0,
        stopLoss: parseFloat(stopLoss) || 0,
        confidence: parseInt(confidence) || 50,
        status: 'active',
        timestamp: new Date()
    };

    appData.alerts.unshift(newAlert);

    return {
        success: true,
        data: newAlert,
        message: 'Alert created successfully'
    };
});

// IPO Endpoints
server.get('/api/ipo', async (request, reply) => {
    const { status = 'all' } = request.query;

    let filteredIPOs = Array.from(appData.ipos.values());

    if (status !== 'all') {
        filteredIPOs = filteredIPOs.filter(ipo => ipo.status === status);
    }

    return {
        success: true,
        data: filteredIPOs,
        count: filteredIPOs.length
    };
});

server.get('/api/ipo/:id', async (request, reply) => {
    const { id } = request.params;
    const ipo = appData.ipos.get(id);

    if (!ipo) {
        reply.code(404);
        return {
            success: false,
            error: { message: 'IPO not found' }
        };
    }

    return {
        success: true,
        data: ipo
    };
});

// Sectors Endpoints
server.get('/api/sectors', async (request, reply) => {
    const sectors = Array.from(appData.sectors.entries()).map(([key, sector]) => ({
        id: key,
        ...sector,
        performanceColor: getPerformanceColor(sector.performance)
    }));

    return {
        success: true,
        data: sectors,
        count: sectors.length
    };
});

server.get('/api/sectors/:id', async (request, reply) => {
    const { id } = request.params;
    const sector = appData.sectors.get(id.toUpperCase());

    if (!sector) {
        reply.code(404);
        return {
            success: false,
            error: { message: 'Sector not found' }
        };
    }

    return {
        success: true,
        data: {
            id: id.toUpperCase(),
            ...sector,
            performanceColor: getPerformanceColor(sector.performance)
        }
    };
});

// Analytics Endpoints
server.get('/api/analytics/dashboard', async (request, reply) => {
    const { timeframe = '24h' } = request.query;

    const analytics = {
        users: {
            total: appData.users.size,
            active: Math.floor(appData.users.size * 0.8),
            new: Math.floor(Math.random() * 50) + 10,
            returning: Math.floor(appData.users.size * 0.6)
        },
        market: {
            totalVolume: Array.from(appData.marketData.values()).reduce((sum, data) => sum + data.volume, 0),
            activeAlerts: appData.alerts.filter(alert => alert.status === 'active').length,
            newsCount: appData.news.length,
            ipoCount: appData.ipos.size
        },
        system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            requestsCount: Math.floor(Math.random() * 10000) + 5000
        },
        generatedAt: new Date().toISOString()
    };

    return {
        success: true,
        data: analytics
    };
});

server.get('/api/analytics/users', async (request, reply) => {
    const { period = '7d' } = request.query;

    // Generate user activity data
    const userActivity = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 1000) + 1000,
        newUsers: Math.floor(Math.random() * 50) + 20,
        sessions: Math.floor(Math.random() * 1500) + 1200
    }));

    return {
        success: true,
        data: userActivity
    };
});

// User Management Endpoints
server.get('/api/users', async (request, reply) => {
    const { status = 'all', plan = 'all' } = request.query;

    let users = Array.from(appData.users.values());

    if (status !== 'all') {
        users = users.filter(user => user.status === status);
    }

    if (plan !== 'all') {
        users = users.filter(user => user.plan === plan);
    }

    return {
        success: true,
        data: users,
        count: users.length
    };
});

server.get('/api/users/:id', async (request, reply) => {
    const { id } = request.params;
    const user = appData.users.get(id);

    if (!user) {
        reply.code(404);
        return {
            success: false,
            error: { message: 'User not found' }
        };
    }

    return {
        success: true,
        data: user
    };
});

server.post('/api/users', async (request, reply) => {
    const { name, email, phone, plan = 'basic' } = request.body;

    if (!name || !email) {
        reply.code(400);
        return {
            success: false,
            error: { message: 'Name and email are required' }
        };
    }

    const userId = `user${Date.now()}`;
    const newUser = {
        id: userId,
        name,
        email,
        phone: phone || '',
        plan,
        status: 'active',
        preferences: {
            language: 'mr',
            voiceAlerts: true,
            theme: 'dark'
        },
        watchlist: [],
        createdAt: new Date()
    };

    appData.users.set(userId, newUser);

    return {
        success: true,
        data: newUser,
        message: 'User created successfully'
    };
});

// WebSocket simulation endpoint for real-time data
server.get('/api/ws/stream', async (request, reply) => {
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('Access-Control-Allow-Origin', '*');

    const stream = reply.raw;

    // Send initial data
    stream.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Send periodic updates
    const interval = setInterval(() => {
        const update = {
            type: 'market_update',
            timestamp: new Date().toISOString(),
            data: {
                symbol: 'NIFTY',
                price: 18950 + (Math.random() - 0.5) * 100,
                change: (Math.random() - 0.5) * 50,
                volume: Math.floor(Math.random() * 1000000) + 100000
            }
        };

        stream.write(`data: ${JSON.stringify(update)}\n\n`);
    }, 5000);

    // Clean up on disconnect
    stream.on('close', () => {
        clearInterval(interval);
    });

    return reply;
});

// Utility functions
function getPerformanceColor(performance) {
    if (performance > 2) return '#22C55E'; // Strong green
    if (performance > 1) return '#84CC16'; // Light green
    if (performance > 0) return '#EAB308'; // Yellow
    if (performance > -1) return '#F97316'; // Orange
    return '#EF4444'; // Red
}

function generateMarketData() {
    const symbols = ['NIFTY', 'BANK_NIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICI'];

    symbols.forEach(symbol => {
        const basePrice = symbol === 'NIFTY' ? 18950 :
            symbol === 'BANK_NIFTY' ? 42850 :
                symbol === 'SENSEX' ? 63500 : 2000;

        const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.02);
        const change = (Math.random() - 0.5) * (basePrice * 0.01);

        appData.marketData.set(symbol, {
            symbol,
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(((change / (price - change)) * 100).toFixed(2)),
            volume: Math.floor(Math.random() * 100000000) + 10000000,
            high52: price * 1.1,
            low52: price * 0.9,
            timestamp: new Date()
        });
    });
}

// Start server
async function startServer() {
    try {
        // Initialize data
        initializeData();

        // Generate initial market data
        generateMarketData();

        // Start periodic updates
        setInterval(() => {
            generateMarketData();

            // Update IPO subscription data
            appData.ipos.forEach(ipo => {
                if (ipo.status === 'open') {
                    ipo.subscription.total += Math.random() * 0.1;
                    ipo.gmp.current += (Math.random() - 0.5) * 5;
                }
            });
        }, 30000); // Update every 30 seconds

        // Start the server
        await server.listen({ port: PORT, host: HOST });

        console.log(`🚀 Panchmukhi Trading Brain Pro Backend started`);
        console.log(`📡 Server running on http://${HOST}:${PORT}`);
        console.log(`🔍 Health check: http://${HOST}:${PORT}/health`);
        console.log(`📊 API Documentation: http://${HOST}:${PORT}/docs`);
        console.log(`🧠 Ready to serve AI-powered trading insights!`);

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    try {
        await server.close();
        console.log('✅ Server closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    try {
        await server.close();
        console.log('✅ Server closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = server;