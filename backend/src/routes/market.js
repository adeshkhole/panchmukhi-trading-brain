const marketDataService = require('../services/marketDataService');

async function marketRoutes(fastify, options) {
  
  // Get current market data for a symbol
  fastify.get('/data/:symbol', async (request, reply) => {
    try {
      const { symbol } = request.params;
      const data = await marketDataService.fetchStockData(symbol);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get historical data for a symbol
  fastify.get('/historical/:symbol', async (request, reply) => {
    try {
      const { symbol } = request.params;
      const { period = '1M' } = request.query;
      
      const data = await marketDataService.getHistoricalData(symbol, period);
      
      return {
        success: true,
        data: data,
        period: period,
        count: data.length
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get sector performance data
  fastify.get('/sectors', async (request, reply) => {
    try {
      const data = await marketDataService.getSectorData();
      
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get fusion score for a symbol
  fastify.get('/fusion/:symbol', async (request, reply) => {
    try {
      const { symbol } = request.params;
      const redisClient = require('../database/redis');
      
      const fusionScore = await redisClient.getFusionScore(symbol);
      
      if (fusionScore !== null) {
        return {
          success: true,
          symbol: symbol,
          fusionScore: fusionScore,
          signal: fusionScore > 0.7 ? 'BUY' : fusionScore < 0.3 ? 'SELL' : 'HOLD',
          confidence: Math.abs(fusionScore - 0.5) * 2,
          timestamp: new Date().toISOString()
        };
      } else {
        reply.status(404);
        return {
          success: false,
          error: 'Fusion score not available for this symbol'
        };
      }
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get all fusion scores
  fastify.get('/fusion', async (request, reply) => {
    try {
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC'];
      const redisClient = require('../database/redis');
      
      const fusionScores = {};
      
      for (const symbol of symbols) {
        const score = await redisClient.getFusionScore(symbol);
        if (score !== null) {
          fusionScores[symbol] = {
            score: score,
            signal: score > 0.7 ? 'BUY' : score < 0.3 ? 'SELL' : 'HOLD',
            confidence: Math.abs(score - 0.5) * 2
          };
        }
      }
      
      return {
        success: true,
        data: fusionScores,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get individual data source scores
  fastify.get('/sources/:symbol', async (request, reply) => {
    try {
      const { symbol } = request.params;
      const alertService = require('../services/alertService');
      
      const scores = await alertService.getIndividualScores(symbol);
      
      return {
        success: true,
        symbol: symbol,
        scores: scores,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get market heat map data
  fastify.get('/heatmap', async (request, reply) => {
    try {
      const sectors = ['IT', 'Banking', 'Pharma', 'Auto', 'Oil & Gas', 'Realty', 'FMCG', 'Steel'];
      const timeSlots = ['9:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30'];
      
      const heatmapData = [];
      
      for (let i = 0; i < sectors.length; i++) {
        for (let j = 0; j < timeSlots.length; j++) {
          const performance = Math.random() * 6 - 3; // -3% to +3%
          heatmapData.push([j, i, performance.toFixed(2)]);
        }
      }
      
      return {
        success: true,
        sectors: sectors,
        timeSlots: timeSlots,
        data: heatmapData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get options flow data
  fastify.get('/options', async (request, reply) => {
    try {
      const redisClient = require('../database/redis');
      const fiiData = await redisClient.getMarketData('FII_OPTIONS');
      
      if (fiiData) {
        return {
          success: true,
          data: fiiData,
          timestamp: new Date().toISOString()
        };
      } else {
        // Mock data if not available
        return {
          success: true,
          data: {
            buyValue: Math.floor(Math.random() * 5000) + 2000,
            sellValue: Math.floor(Math.random() * 4000) + 1500,
            netValue: 0,
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get market summary
  fastify.get('/summary', async (request, reply) => {
    try {
      const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC'];
      const redisClient = require('../database/redis');
      
      const summary = {};
      
      for (const symbol of symbols) {
        const data = await redisClient.getMarketData(symbol);
        if (data) {
          summary[symbol] = {
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume
          };
        }
      }
      
      return {
        success: true,
        summary: summary,
        marketStatus: marketDataService.isMarketHours() ? 'OPEN' : 'CLOSED',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error.message
      };
    }
  });

}

module.exports = marketRoutes;