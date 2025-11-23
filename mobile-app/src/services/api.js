import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api';
const WS_BASE_URL = 'ws://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}n
// Request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token or redirect to login
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        
        // Dispatch logout action or redirect to login
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// Market Data API
export const marketAPI = {
  getRealTimeData: async (symbols) => {
    const response = await api.get('/market/real-time', {
      params: { symbols: symbols.join(',') },
    });
    return response.data;
  },

  getHistoricalData: async (symbol, interval, period) => {
    const response = await api.get('/market/historical', {
      params: { symbol, interval, period },
    });
    return response.data;
  },

  getMarketIndices: async () => {
    const response = await api.get('/market/indices');
    return response.data;
  },

  getTopGainersLosers: async () => {
    const response = await api.get('/market/top-gainers-losers');
    return response.data;
  },
};

// Trading Signals API
export const signalsAPI = {
  getCurrentSignals: async () => {
    const response = await api.get('/signals/current');
    return response.data;
  },

  getSignalHistory: async () => {
    const response = await api.get('/signals/history');
    return response.data;
  },

  getSignalDetails: async (signalId) => {
    const response = await api.get(`/signals/${signalId}`);
    return response.data;
  },

  executeSignal: async (signalId, action) => {
    const response = await api.post(`/signals/${signalId}/execute`, { action });
    return response.data;
  },
};

// Sector Analysis API
export const sectorAPI = {
  getSectors: async () => {
    const response = await api.get('/sectors');
    return response.data;
  },

  getSectorPerformance: async () => {
    const response = await api.get('/sectors/performance');
    return response.data;
  },

  getSectorDetails: async (sectorId) => {
    const response = await api.get(`/sectors/${sectorId}`);
    return response.data;
  },

  getSectorStocks: async (sectorId) => {
    const response = await api.get(`/sectors/${sectorId}/stocks`);
    return response.data;
  },
};

// IPO API
export const ipoAPI = {
  getIPOs: async (status) => {
    const response = await api.get('/ipo', {
      params: { status },
    });
    return response.data;
  },

  getIPODetails: async (ipoId) => {
    const response = await api.get(`/ipo/${ipoId}`);
    return response.data;
  },

  getSubscriptionData: async (ipoId) => {
    const response = await api.get(`/ipo/${ipoId}/subscription`);
    return response.data;
  },

  applyIPO: async (ipoId, applicationData) => {
    const response = await api.post(`/ipo/${ipoId}/apply`, applicationData);
    return response.data;
  },
};

// Watchlist API
export const watchlistAPI = {
  getWatchlist: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },

  addToWatchlist: async (symbol) => {
    const response = await api.post('/watchlist', { symbol });
    return response.data;
  },

  removeFromWatchlist: async (symbol) => {
    const response = await api.delete(`/watchlist/${symbol}`);
    return response.data;
  },

  createWatchlistGroup: async (groupName) => {
    const response = await api.post('/watchlist/groups', { name: groupName });
    return response.data;
  },
};

// News API
export const newsAPI = {
  getNews: async (category, limit = 20) => {
    const response = await api.get('/news', {
      params: { category, limit },
    });
    return response.data;
  },

  getNewsBySymbol: async (symbol) => {
    const response = await api.get(`/news/symbol/${symbol}`);
    return response.data;
  },

  getSentimentAnalysis: async (symbol) => {
    const response = await api.get(`/news/sentiment/${symbol}`);
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAlerts: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },

  createAlert: async (alertData) => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },

  updateAlert: async (alertId, alertData) => {
    const response = await api.put(`/alerts/${alertId}`, alertData);
    return response.data;
  },

  deleteAlert: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  },
};

// WebSocket Connection
export const createWebSocketConnection = () => {
  const ws = new WebSocket(`${WS_BASE_URL}/ws`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};

// ML Service API
export const mlAPI = {
  getPrediction: async (symbol, days = 7) => {
    const response = await api.get('/ml/predict', {
      baseURL: 'http://localhost:8000',
      params: { symbol, days },
    });
    return response.data;
  },

  getSentimentScore: async (text) => {
    const response = await api.post('/ml/sentiment', { text }, {
      baseURL: 'http://localhost:8000',
    });
    return response.data;
  },

  getFusionScore: async (symbol) => {
    const response = await api.get('/ml/fusion-score', {
      baseURL: 'http://localhost:8000',
      params: { symbol },
    });
    return response.data;
  },
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    console.error('API Error:', error.response.data);
    return {
      success: false,
      message: error.response.data.message || 'Server error',
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.request);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  } else {
    // Something else happened
    console.error('Error:', error.message);
    return {
      success: false,
      message: error.message || 'Unknown error occurred',
    };
  }
};

export default api;