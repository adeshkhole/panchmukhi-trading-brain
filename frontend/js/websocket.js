// websocket.js - Handles WebSocket connections for real-time data
class WebSocketService {
    constructor() {
        this.socket = null;
        this.subscriptions = new Map(); // Map<channel, Set<callback>>
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.connectionPromise = null;
        this.isConnected = false;
        this.pendingMessages = [];
    }

    async connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
                const wsUrl = `${wsProtocol}${window.location.host}/ws`;
                
                this.socket = new WebSocket(wsUrl);

                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    
                    // Process any pending messages
                    this.pendingMessages.forEach(({ channel, data }) => {
                        this.sendMessage(channel, data);
                    });
                    this.pendingMessages = [];
                    
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleIncomingMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.socket.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.connectionPromise = null;
                    this.handleReconnect();
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.socket.close();
                };
            } catch (error) {
                console.error('WebSocket connection error:', error);
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            await this.connect();
            // Resubscribe to all channels
            for (const [channel] of this.subscriptions) {
                this.sendMessage('subscribe', { channel });
            }
        } catch (error) {
            console.error('Reconnection failed:', error);
            this.handleReconnect();
        }
    }

    handleIncomingMessage(message) {
        const { channel, data, event } = message;
        
        if (channel && this.subscriptions.has(channel)) {
            const callbacks = this.subscriptions.get(channel);
            callbacks.forEach(callback => callback(data, event));
        }
    }

    async sendMessage(type, data) {
        if (!this.isConnected) {
            this.pendingMessages.push({ channel: type, data });
            if (!this.connectionPromise) {
                await this.connect();
            }
            return;
        }

        try {
            this.socket.send(JSON.stringify({ type, data }));
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            this.pendingMessages.push({ channel: type, data });
            this.socket.close();
        }
    }

    async subscribe(channel, callback) {
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, new Set());
            await this.sendMessage('subscribe', { channel });
        }
        
        const callbacks = this.subscriptions.get(channel);
        callbacks.add(callback);
        
        // Return unsubscribe function
        return () => this.unsubscribe(channel, callback);
    }

    async unsubscribe(channel, callback) {
        if (!this.subscriptions.has(channel)) return;
        
        const callbacks = this.subscriptions.get(channel);
        callbacks.delete(callback);
        
        if (callbacks.size === 0) {
            this.subscriptions.delete(channel);
            await this.sendMessage('unsubscribe', { channel });
        }
    }

    // Market data specific methods
    async subscribeToMarketData(symbol, callback) {
        return this.subscribe(`market:${symbol}`, callback);
    }

    async subscribeToOrderBook(symbol, callback) {
        return this.subscribe(`orderbook:${symbol}`, callback);
    }

    async subscribeToTrades(symbol, callback) {
        return this.subscribe(`trades:${symbol}`, callback);
    }

    // Admin specific methods
    async subscribeToSystemMetrics(callback) {
        return this.subscribe('system:metrics', callback);
    }

    async subscribeToUserActivity(callback) {
        return this.subscribe('admin:user-activity', callback);
    }

    // Close connection
    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connectionPromise = null;
        this.isConnected = false;
        clearTimeout(this.reconnectTimeout);
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
