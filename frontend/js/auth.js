// auth.js - Handles user authentication and session management
class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.tokenExpiry = localStorage.getItem('tokenExpiry');
        this.eventTarget = new EventTarget();
        
        // Auto-refresh token if about to expire
        this.setupTokenRefresh();
    }

    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            this.setSession(data);
            this.eventTarget.dispatchEvent(new CustomEvent('authChange'));
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    logout() {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        
        this.token = null;
        this.user = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        
        // Notify listeners
        this.eventTarget.dispatchEvent(new CustomEvent('authChange'));
        
        // Redirect to login
        if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = '/login.html';
        }
    }

    async refreshAuthToken() {
        if (!this.refreshToken) {
            this.logout();
            return null;
        }

        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            this.setSession(data);
            return data.token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            throw error;
        }
    }

    setSession(authResult) {
        this.token = authResult.token;
        this.refreshToken = authResult.refreshToken;
        this.user = authResult.user;
        this.tokenExpiry = Date.now() + (authResult.expiresIn * 1000);
        
        // Store in localStorage
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('refreshToken', this.refreshToken);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('tokenExpiry', this.tokenExpiry);
    }

    isAuthenticated() {
        return !!this.token && (!this.tokenExpiry || Date.now() < this.tokenExpiry);
    }

    hasRole(role) {
        return this.isAuthenticated() && this.user?.roles?.includes(role);
    }

    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    setupTokenRefresh() {
        // Refresh token 1 minute before expiry
        const checkToken = () => {
            if (this.tokenExpiry) {
                const timeUntilExpiry = this.tokenExpiry - Date.now();
                if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
                    this.refreshAuthToken().catch(console.error);
                } else if (timeUntilExpiry <= 0) {
                    this.logout();
                }
            }
        };

        // Check every 30 seconds
        this.tokenRefreshInterval = setInterval(checkToken, 30000);
        checkToken(); // Initial check
    }

    onAuthChange(callback) {
        const handler = () => callback(this.isAuthenticated(), this.user);
        this.eventTarget.addEventListener('authChange', handler);
        return () => this.eventTarget.removeEventListener('authChange', handler);
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;

// Protected route wrapper
export function protectedRoute(requiredRole) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args) {
            if (!authService.isAuthenticated()) {
                window.location.href = '/login.html';
                return Promise.reject('Not authenticated');
            }
            
            if (requiredRole && !authService.hasRole(requiredRole)) {
                window.location.href = '/403.html';
                return Promise.reject('Insufficient permissions');
            }
            
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}
