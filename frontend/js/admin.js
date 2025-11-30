// admin.js - Admin dashboard functionality
import authService from './auth.js';
import webSocketService from './websocket.js';

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.initialize();
    }

    async initialize() {
        // Check authentication
        if (!authService.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        // Check admin role
        if (!authService.hasRole('admin')) {
            window.location.href = '/403.html';
            return;
        }

        // Load user data
        this.currentUser = JSON.parse(localStorage.getItem('user'));
        this.updateUI();
        
        // Initialize WebSocket
        await this.initializeWebSocket();
        
        // Load initial data
        this.loadDashboardData();
        this.setupEventListeners();
    }

    updateUI() {
        // Update user info in the UI
        if (this.currentUser) {
            const username = this.currentUser.username || 'Admin';
            document.getElementById('username').textContent = username;
            document.getElementById('user-initials').textContent = 
                username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
    }

    async initializeWebSocket() {
        try {
            await webSocketService.connect();
            
            // Subscribe to system metrics
            await webSocketService.subscribeToSystemMetrics((data) => {
                this.updateSystemMetrics(data);
            });
            
            // Subscribe to user activity
            await webSocketService.subscribeToUserActivity((data) => {
                this.updateUserActivity(data);
            });
            
            console.log('WebSocket subscriptions initialized');
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }

    async loadDashboardData() {
        try {
            // Load system stats
            const statsResponse = await fetch('/api/admin/stats', {
                headers: authService.getAuthHeader()
            });
            
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                this.updateDashboardStats(stats);
            }
            
            // Load recent activities
            const activitiesResponse = await fetch('/api/admin/activities', {
                headers: authService.getAuthHeader()
            });
            
            if (activitiesResponse.ok) {
                const activities = await activitiesResponse.json();
                this.updateRecentActivities(activities);
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    updateDashboardStats(stats) {
        // Update the dashboard with statistics
        // This is a simplified example - in a real app, you would update the DOM
        console.log('Updating dashboard stats:', stats);
    }

    updateSystemMetrics(metrics) {
        // Update system metrics in real-time
        console.log('System metrics update:', metrics);
    }

    updateUserActivity(activity) {
        // Update user activity feed
        console.log('User activity:', activity);
        this.addNotification({
            id: Date.now(),
            type: 'user_activity',
            message: `User ${activity.username} ${activity.action}`,
            timestamp: new Date().toISOString()
        });
    }

    updateRecentActivities(activities) {
        // Update recent activities list
        console.log('Recent activities:', activities);
    }

    addNotification(notification) {
        const container = document.getElementById('notification-dropdown');
        if (!container) return;
        
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-gray-50';
        item.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas fa-bell text-blue-500"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">${notification.message}</p>
                    <p class="text-xs text-gray-500">${new Date(notification.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
        `;
        
        const list = container.querySelector('.divide-y');
        if (list.firstChild) {
            list.insertBefore(item, list.firstChild);
        } else {
            list.appendChild(item);
        }
        
        // Update notification badge
        const badge = document.querySelector('#notification-btn .bg-red-500');
        if (badge) {
            const count = parseInt(badge.textContent) || 0;
            badge.textContent = count + 1;
            badge.classList.remove('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Show a toast notification
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md text-white ${
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } shadow-lg`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setupEventListeners() {
        // Handle tab switching
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.loadTab(tabName);
            });
        });
        
        // Handle logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authService.logout();
            });
        }
    }

    async loadTab(tabName) {
        console.log(`Loading tab: ${tabName}`);
        // In a real app, you would load the appropriate content for the tab
        // This is a simplified example
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-4">${tabName.charAt(0).toUpperCase() + tabName.slice(1)}</h2>
                <p>Content for ${tabName} will be loaded here.</p>
            </div>
        `;
        
        // Load tab-specific data
        try {
            const response = await fetch(`/api/admin/${tabName}`, {
                headers: authService.getAuthHeader()
            });
            
            if (response.ok) {
                const data = await response.json();
                this[`render${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`](data);
            }
        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
            this.showNotification(`Failed to load ${tabName}`, 'error');
        }
    }
}

// Initialize the admin dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
