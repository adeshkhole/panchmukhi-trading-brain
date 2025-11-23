const redisClient = require('../database/redis');

class WebSocketService {
  constructor() {
    this.connections = new Map();
    this.subscribers = {};
  }

  handleConnection(connection, request) {
    const userId = this.extractUserId(request);
    const socketId = this.generateSocketId();
    
    console.log(`New WebSocket connection: ${socketId} for user: ${userId}`);
    
    // Store connection
    this.connections.set(socketId, {
      socket: connection,
      userId: userId,
      subscriptions: new Set(),
      connectedAt: new Date()
    });
    
    // Handle incoming messages
    connection.on('message', (message) => {
      this.handleMessage(socketId, message);
    });
    
    // Handle disconnection
    connection.on('close', () => {
      this.handleDisconnection(socketId);
    });
    
    connection.on('error', (error) => {
      console.error(`WebSocket error for ${socketId}:`, error);
    });
    
    // Send welcome message
    this.sendToSocket(socketId, {
      type: 'CONNECTED',
      data: {
        socketId: socketId,
        serverTime: new Date().toISOString()
      }
    });
    
    // Subscribe to general market updates
    this.subscribeToChannel(socketId, 'market_updates');
  }

  handleMessage(socketId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'SUBSCRIBE':
          this.handleSubscribe(socketId, data.channels);
          break;
          
        case 'UNSUBSCRIBE':
          this.handleUnsubscribe(socketId, data.channels);
          break;
          
        case 'PING':
          this.sendToSocket(socketId, { type: 'PONG', timestamp: new Date().toISOString() });
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
      
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendToSocket(socketId, {
        type: 'ERROR',
        message: 'Invalid message format'
      });
    }
  }

  handleSubscribe(socketId, channels) {
    const connection = this.connections.get(socketId);
    if (!connection) return;
    
    channels.forEach(channel => {
      connection.subscriptions.add(channel);
      this.subscribeToChannel(socketId, channel);
    });
    
    this.sendToSocket(socketId, {
      type: 'SUBSCRIBED',
      channels: channels
    });
  }

  handleUnsubscribe(socketId, channels) {
    const connection = this.connections.get(socketId);
    if (!connection) return;
    
    channels.forEach(channel => {
      connection.subscriptions.delete(channel);
      this.unsubscribeFromChannel(socketId, channel);
    });
    
    this.sendToSocket(socketId, {
      type: 'UNSUBSCRIBED',
      channels: channels
    });
  }

  async subscribeToChannel(socketId, channel) {
    if (!this.subscribers[channel]) {
      this.subscribers[channel] = new Set();
      
      // Subscribe to Redis pub/sub for this channel
      try {
        await redisClient.subscribe(channel, (message) => {
          this.broadcastToChannel(channel, message);
        });
      } catch (error) {
        console.error(`Error subscribing to Redis channel ${channel}:`, error);
      }
    }
    
    this.subscribers[channel].add(socketId);
  }

  unsubscribeFromChannel(socketId, channel) {
    if (this.subscribers[channel]) {
      this.subscribers[channel].delete(socketId);
      
      // If no more subscribers, clean up
      if (this.subscribers[channel].size === 0) {
        delete this.subscribers[channel];
      }
    }
  }

  broadcastToChannel(channel, message) {
    const subscribers = this.subscribers[channel];
    if (!subscribers) return;
    
    subscribers.forEach(socketId => {
      this.sendToSocket(socketId, message);
    });
  }

  sendToSocket(socketId, message) {
    const connection = this.connections.get(socketId);
    if (!connection) return;
    
    try {
      connection.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to ${socketId}:`, error);
      this.handleDisconnection(socketId);
    }
  }

  handleDisconnection(socketId) {
    const connection = this.connections.get(socketId);
    if (!connection) return;
    
    console.log(`WebSocket disconnected: ${socketId}`);
    
    // Remove from all channel subscriptions
    connection.subscriptions.forEach(channel => {
      this.unsubscribeFromChannel(socketId, channel);
    });
    
    // Remove connection
    this.connections.delete(socketId);
  }

  extractUserId(request) {
    // Extract user ID from JWT token or session
    const token = request.headers['authorization']?.replace('Bearer ', '');
    
    if (token) {
      try {
        // Decode JWT token (simplified)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.userId || 'anonymous';
      } catch (error) {
        return 'anonymous';
      }
    }
    
    return 'anonymous';
  }

  generateSocketId() {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Broadcast market data updates
  async broadcastMarketUpdate(symbol, data) {
    const message = {
      type: 'MARKET_UPDATE',
      symbol: symbol,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    await redisClient.publish('market_updates', message);
  }

  // Broadcast new alerts
  async broadcastAlert(alert) {
    const message = {
      type: 'NEW_ALERT',
      data: alert,
      timestamp: new Date().toISOString()
    };
    
    await redisClient.publish('alerts', message);
  }

  // Broadcast news updates
  async broadcastNewsUpdate(news) {
    const message = {
      type: 'NEWS_UPDATE',
      data: news,
      timestamp: new Date().toISOString()
    };
    
    await redisClient.publish('news_updates', message);
  }

  // Send personalized alert to specific user
  async sendPersonalAlert(userId, alert) {
    // Find all connections for this user
    const userConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId)
      .map(conn => Array.from(this.connections.keys())
        .find(key => this.connections.get(key) === conn)
      );
    
    const message = {
      type: 'PERSONAL_ALERT',
      data: alert,
      timestamp: new Date().toISOString()
    };
    
    userConnections.forEach(socketId => {
      this.sendToSocket(socketId, message);
    });
  }

  // Get connection statistics
  getStats() {
    const totalConnections = this.connections.size;
    const activeChannels = Object.keys(this.subscribers).length;
    
    const userConnections = new Map();
    this.connections.forEach((connection, socketId) => {
      if (!userConnections.has(connection.userId)) {
        userConnections.set(connection.userId, 0);
      }
      userConnections.set(connection.userId, userConnections.get(connection.userId) + 1);
    });
    
    return {
      totalConnections,
      uniqueUsers: userConnections.size,
      activeChannels,
      connectionsPerUser: Array.from(userConnections.values()),
      uptime: process.uptime()
    };
  }

  // Health check
  healthCheck() {
    return {
      status: 'healthy',
      activeConnections: this.connections.size,
      activeChannels: Object.keys(this.subscribers).length,
      uptime: process.uptime()
    };
  }
}

module.exports = new WebSocketService();