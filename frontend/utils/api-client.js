/**
 * Panchmukhi Trading Brain Pro - API Client
 * Handles all REST API communication with the backend
 */

const API_BASE_URL = 'http://localhost:8083/api';
console.log('ApiClient: Initializing...');

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        console.log('ApiClient: Constructor called');
    }

    /**
     * Generic API call method
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {string} endpoint - API endpoint (e.g., '/market/prices')
     * @param {Object} data - Request body data (optional)
     * @returns {Promise<Object>} - Response data
     */
    async call(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header here if needed
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API call failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${method} ${endpoint}):`, error);
            throw error;
        }
    }

    // Market Data
    async getMarketSymbols() {
        return this.call('GET', '/market/symbols');
    }

    async getMarketData(symbol) {
        return this.call('GET', `/market/data/${symbol}`);
    }

    async getFusionScore(symbol) {
        return this.call('GET', `/market/fusion/${symbol}`);
    }

    async getMarketHeatmap() {
        return this.call('GET', '/market/heatmap');
    }

    // News
    async getNews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.call('GET', `/news?${queryString}`);
    }

    // Alerts
    async getAlerts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.call('GET', `/alerts?${queryString}`);
    }

    async createAlert(alertData) {
        return this.call('POST', '/alerts', alertData);
    }

    // IPOs
    async getIPOs(status = 'all') {
        return this.call('GET', `/ipo?status=${status}`);
    }

    // Sectors
    async getSectors() {
        return this.call('GET', '/sectors');
    }

    // Users
    async getUser(userId) {
        return this.call('GET', `/users/${userId}`);
    }

    async createUser(userData) {
        return this.call('POST', '/users', userData);
    }
}

// Export a singleton instance
const apiClient = new ApiClient();
// Make it available globally for vanilla JS usage
window.apiClient = apiClient;
