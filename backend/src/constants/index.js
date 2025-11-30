// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  OPERATION_COMPLETED: 'Operation completed successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_CREATED: 'Data created successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  ANALYST: 'analyst',
  GUEST: 'guest',
};

// Market Constants
export const MARKET_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  CACHE_TTL: 60 * 5, // 5 minutes
};

// WebSocket Events
export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  MARKET_UPDATE: 'market:update',
  PRICE_ALERT: 'price:alert',
  TRADING_SIGNAL: 'trading:signal',
  NOTIFICATION: 'notification',
  ERROR: 'error',
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[0-9]{10,15}$/,
  SYMBOL: /^[A-Z0-9.-]+$/,
};

// Default Pagination
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  sortBy: 'created_at',
  sortOrder: 'DESC',
};
