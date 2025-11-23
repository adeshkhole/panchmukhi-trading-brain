// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.charts = {};
        this.users = [];
        this.news = [];
        this.alerts = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.setupScrollAnimations();
        this.startRealTimeUpdates();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                if (section === 'logout') {
                    this.handleLogout();
                } else {
                    this.switchSection(section);
                }
            });
        });

        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('open');
            });
        }

        // Add user modal
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.showAddUserModal();
        });

        document.getElementById('closeUserModal').addEventListener('click', () => {
            this.hideAddUserModal();
        });

        document.getElementById('addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewUser();
        });

        // Add news modal
        const addNewsBtn = document.getElementById('addNewsBtn');
        if (addNewsBtn) {
            addNewsBtn.addEventListener('click', () => {
                this.showAddNewsModal();
            });
        }

        const closeNewsModal = document.getElementById('closeNewsModal');
        if (closeNewsModal) {
            closeNewsModal.addEventListener('click', () => {
                this.hideAddNewsModal();
            });
        }

        const addNewsForm = document.getElementById('addNewsForm');
        if (addNewsForm) {
            addNewsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewNews();
            });
        }

        // Search and filter functionality
        document.getElementById('userSearch').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        document.getElementById('userFilter').addEventListener('change', (e) => {
            this.filterUsersByStatus(e.target.value);
        });

        // News search and filter
        const newsSearch = document.getElementById('newsSearch');
        if (newsSearch) {
            newsSearch.addEventListener('input', (e) => {
                this.filterNews(e.target.value);
            });
        }

        const newsFilter = document.getElementById('newsFilter');
        if (newsFilter) {
            newsFilter.addEventListener('change', (e) => {
                this.filterNewsByStatus(e.target.value);
            });
        }

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                const action = e.target.textContent.trim();
                const row = e.target.closest('tr');
                
                if (action === 'Edit') {
                    this.editRow(row);
                } else if (action === 'Delete') {
                    this.deleteRow(row);
                }
            }
        });
    }

    switchSection(sectionName) {
        // Update active sidebar item
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update header title
        const titles = {
            'dashboard': 'dashboard',
            'users': 'User Management',
            'news': 'News Management',
            'alerts': 'Alerts Management',
            'analytics': 'Analytics',
            'settings': 'Settings',
            'system': 'System Information'
        };
        
        document.querySelector('.main-content header h1').textContent = titles[sectionName] || 'Admin Dashboard';
        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);

        // Close mobile sidebar
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
        }
    }

    initializeCharts() {
        this.initializeUserGrowthChart();
        this.initializeStateDistributionChart();
        this.initializeUserActivityChart();
        this.initializePlatformUsageChart();
    }

    initializeUserGrowthChart() {
        const chartDom = document.getElementById('userGrowthChart');
        if (!chartDom) return;

        this.charts.userGrowth = echarts.init(chartDom, 'dark');

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'],
                axisLine: { lineStyle: { color: '#444' } },
                axisLabel: { color: '#888' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#444' } },
                axisLabel: { color: '#888' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                name: 'New Users',
                type: 'line',
                data: [120, 150, 180, 220, 280, 320, 380, 420, 480, 520, 580],
                smooth: true,
                lineStyle: { color: '#FF6B35', width: 3 },
                itemStyle: { color: '#FF6B35' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(255, 107, 53, 0.3)' },
                            { offset: 1, color: 'rgba(255, 107, 53, 0.1)' }
                        ]
                    }
                }
            }]
        };

        this.charts.userGrowth.setOption(option);
    }

    initializeStateDistributionChart() {
        const chartDom = document.getElementById('stateDistributionChart');
        if (!chartDom) return;

        this.charts.stateDistribution = echarts.init(chartDom, 'dark');

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: [
                    { value: 580, name: 'Maharashtra' },
                    { value: 420, name: 'Delhi' },
                    { value: 380, name: 'Gujarat' },
                    { value: 320, name: 'Karnataka' },
                    { value: 280, name: 'Tamil Nadu' },
                    { value: 180, name: 'Others' }
                ],
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#1A1A1A',
                    borderWidth: 2
                },
                label: {
                    color: '#fff',
                    fontSize: 12
                },
                labelLine: {
                    lineStyle: { color: '#fff' }
                }
            }]
        };

        this.charts.stateDistribution.setOption(option);
    }

    initializeUserActivityChart() {
        const chartDom = document.getElementById('userActivityChart');
        if (!chartDom) return;

        this.charts.userActivity = echarts.init(chartDom, 'dark');

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['Active Users', 'New Users'],
                textStyle: { color: '#fff' },
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: '#444' } },
                axisLabel: { color: '#888' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#444' } },
                axisLabel: { color: '#888' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [
                {
                    name: 'Active Users',
                    type: 'bar',
                    data: [1200, 1350, 1100, 1400, 1600, 1800, 1500],
                    itemStyle: { color: '#3B82F6' }
                },
                {
                    name: 'New Users',
                    type: 'line',
                    data: [45, 52, 38, 65, 72, 85, 68],
                    smooth: true,
                    lineStyle: { color: '#FF6B35', width: 2 },
                    itemStyle: { color: '#FF6B35' }
                }
            ]
        };

        this.charts.userActivity.setOption(option);
    }

    initializePlatformUsageChart() {
        const chartDom = document.getElementById('platformUsageChart');
        if (!chartDom) return;

        this.charts.platformUsage = echarts.init(chartDom, 'dark');

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            },
            series: [{
                type: 'pie',
                radius: '70%',
                center: ['50%', '50%'],
                data: [
                    { value: 45, name: 'Web Browser' },
                    { value: 35, name: 'Mobile App' },
                    { value: 15, name: 'Tablet' },
                    { value: 5, name: 'Desktop App' }
                ],
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#1A1A1A',
                    borderWidth: 2
                },
                label: {
                    color: '#fff',
                    fontSize: 12
                },
                labelLine: {
                    lineStyle: { color: '#fff' }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        this.charts.platformUsage.setOption(option);
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.updateStats();
        this.loadRecentActivity();
    }

    updateStats() {
        // Animate stats counters
        const stats = [
            { element: '.stats-grid .glass-card:nth-child(1) .text-3xl', target: 2456, suffix: '' },
            { element: '.stats-grid .glass-card:nth-child(2) .text-3xl', target: 12.5, suffix: 'L' },
            { element: '.stats-grid .glass-card:nth-child(3) .text-3xl', target: 1892, suffix: '' },
            { element: '.stats-grid .glass-card:nth-child(4) .text-3xl', target: 99.8, suffix: '%' }
        ];

        stats.forEach((stat, index) => {
            const element = document.querySelector(stat.element);
            if (element) {
                anime({
                    targets: { value: 0 },
                    value: stat.target,
                    duration: 2000,
                    delay: index * 200,
                    easing: 'easeOutQuad',
                    update: function(anim) {
                        const value = anim.animatables[0].target.value;
                        element.textContent = stat.suffix === '%' ? 
                            value.toFixed(1) + stat.suffix : 
                            Math.floor(value) + stat.suffix;
                    }
                });
            }
        });
    }

    loadRecentActivity() {
        const activities = [
            { time: '14:32:15', user: 'Rajesh Patil', action: 'Created a new account', status: 'success' },
            { time: '14:28:42', user: 'Priya Sharma', action: 'Set an alert', status: 'success' },
            { time: '14:25:10', user: 'Ajay Deshmukh', action: 'Logged in', status: 'success' },
            { time: '14:20:35', user: 'Sneha Joshi', action: 'Added news', status: 'success' }
        ];

        const tableBody = document.getElementById('recentActivityTable');
        if (tableBody) {
            tableBody.innerHTML = activities.map(activity => `
                <tr>
                    <td class="mono-text">${activity.time}</td>
                    <td>${activity.user}</td>
                    <td>${activity.action}</td>
                    <td><span class="status-badge status-${activity.status}">Success</span></td>
                </tr>
            `).join('');
        }
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'users':
                this.loadUsersData();
                break;
            case 'news':
                this.loadNewsData();
                break;
            case 'alerts':
                this.loadAlertsData();
                break;
            case 'analytics':
                this.updateAnalyticsCharts();
                break;
        }
    }

    loadUsersData() {
        const users = [
            { id: '#1234', name: 'Rajesh Patil', email: 'rajesh@email.com', phone: '9876543210', plan: 'Pro', status: 'active', date: '22 November 2024' },
            { id: '#1235', name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', plan: 'Basic', status: 'active', date: '21 November 2024' },
            { id: '#1236', name: 'Ajay Deshmukh', email: 'ajay@email.com', phone: '9876543212', plan: 'Premium', status: 'active', date: '20 November 2024' },
            { id: '#1237', name: 'Sneha Joshi', email: 'sneha@email.com', phone: '9876543213', plan: 'Pro', status: 'inactive', date: '19 November 2024' },
            { id: '#1238', name: 'Vikram Singh', email: 'vikram@email.com', phone: '9876543214', plan: 'Basic', status: 'active', date: '18 November 2024' }
        ];

        this.users = users;
        this.renderUsersTable(users);
    }

    renderUsersTable(users) {
        const tableBody = document.getElementById('usersTable');
        if (!tableBody) return;

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td class="mono-text">${user.id}</td>
                <td>
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                            ${user.name.charAt(0)}
                        </div>
                        <span>${user.name}</span>
                    </div>
                </td>
                <td class="mono-text">${user.email}</td>
                <td class="mono-text">${user.phone}</td>
                <td>${user.plan}</td>
                <td><span class="status-badge status-${user.status}">${user.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                <td>${user.date}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="action-btn bg-blue-500 hover:bg-blue-600">Edit</button>
                        <button class="action-btn bg-red-500 hover:bg-red-600">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadNewsData() {
        const news = [
            { id: '#N123', title: 'Reliance Industries Net Profit Up 12%', sector: 'Energy', language: 'English', status: 'published', date: '22 November 2024' },
            { id: '#N124', title: 'TCS Announces New Share Buyback', sector: 'IT', language: 'English', status: 'published', date: '21 November 2024' },
            { id: '#N125', title: 'HDFC Bank Q3 Results as Expected', sector: 'Banking', language: 'English', status: 'draft', date: '20 November 2024' },
            { id: '#N126', title: 'Infosys Launches AI Services', sector: 'IT', language: 'English', status: 'scheduled', date: '19 November 2024' },
            { id: '#N127', title: 'Market Hits New Highs', sector: 'Market', language: 'English', status: 'published', date: '18 November 2024' }
        ];

        this.news = news;
        this.renderNewsTable(news);
    }

    renderNewsTable(news) {
        const tableBody = document.getElementById('newsTable');
        if (!tableBody) return;

        tableBody.innerHTML = news.map(item => `
            <tr>
                <td class="mono-text">${item.id}</td>
                <td>${item.title}</td>
                <td>${item.sector}</td>
                <td>${item.language}</td>
                <td><span class="status-badge status-${item.status}">${this.getStatusText(item.status)}</span></td>
                <td>${item.date}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="action-btn bg-blue-500 hover:bg-blue-600">Edit</button>
                        <button class="action-btn bg-red-500 hover:bg-red-600">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'published': 'Published',
            'draft': 'Draft',
            'scheduled': 'Scheduled'
        };
        return statusMap[status] || status;
    }

    loadAlertsData() {
        const alerts = [
            { id: '#A123', signal: 'BUY', symbol: 'RELIANCE', entry: '₹2,650', target: '₹2,750', stopLoss: '₹2,600', confidence: 85, status: 'active' },
            { id: '#A124', signal: 'SELL', symbol: 'TCS', entry: '₹3,850', target: '₹3,750', stopLoss: '₹3,900', confidence: 78, status: 'active' },
            { id: '#A125', signal: 'BUY', symbol: 'HDFC', entry: '₹1,650', target: '₹1,700', stopLoss: '₹1,620', confidence: 65, status: 'expired' },
            { id: '#A126', signal: 'HOLD', symbol: 'INFY', entry: '₹1,450', target: '₹1,500', stopLoss: '₹1,420', confidence: 82, status: 'active' },
            { id: '#A127', signal: 'BUY', symbol: 'ICICI', entry: '₹950', target: '₹1000', stopLoss: '₹920', confidence: 88, status: 'active' }
        ];

        this.alerts = alerts;
        this.renderAlertsTable(alerts);
    }

    renderAlertsTable(alerts) {
        const tableBody = document.getElementById('alertsTable');
        if (!tableBody) return;

        tableBody.innerHTML = alerts.map(alert => `
            <tr>
                <td class="mono-text">${alert.id}</td>
                <td><span class="${alert.signal === 'BUY' ? 'text-green-400' : alert.signal === 'SELL' ? 'text-red-400' : 'text-yellow-400'} font-bold">${alert.signal}</span></td>
                <td class="font-semibold">${alert.symbol}</td>
                <td class="mono-text">${alert.entry}</td>
                <td class="mono-text">${alert.target}</td>
                <td class="mono-text">${alert.stopLoss}</td>
                <td>
                    <div class="flex items-center space-x-2">
                        <div class="w-16 bg-gray-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${alert.confidence}%"></div>
                        </div>
                        <span class="text-sm">${alert.confidence}%</span>
                    </div>
                </td>
                <td><span class="status-badge status-${alert.status}">${alert.status === 'active' ? 'Active' : 'Expired'}</span></td>
                <td>
                    <div class="flex space-x-2">
                        <button class="action-btn bg-blue-500 hover:bg-blue-600">Edit</button>
                        <button class="action-btn bg-red-500 hover:bg-red-600">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateAnalyticsCharts() {
        // Update analytics charts with new data
        if (this.charts.userActivity) {
            const newData = {
                active: Array.from({length: 7}, () => Math.floor(Math.random() * 1000) + 1000),
                newUsers: Array.from({length: 7}, () => Math.floor(Math.random() * 100) + 20)
            };
            
            this.charts.userActivity.setOption({
                series: [
                    { data: newData.active },
                    { data: newData.newUsers }
                ]
            });
        }
    }

    showAddUserModal() {
        document.getElementById('addUserModal').classList.remove('hidden');
        anime({
            targets: '#addUserModal .glass-card',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    hideAddUserModal() {
        anime({
            targets: '#addUserModal .glass-card',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuad',
            complete: () => {
                document.getElementById('addUserModal').classList.add('hidden');
            }
        });
    }

    addNewUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        
        const newUser = {
            id: `#${Math.floor(Math.random() * 9000) + 1000}`,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            plan: formData.get('plan'),
            status: 'active',
            date: new Date().toLocaleDateString('hi-IN')
        };

        this.users.unshift(newUser);
        this.renderUsersTable(this.users);
        this.hideAddUserModal();
        
        // Reset form
        form.reset();
        
        this.showNotification('User added successfully', 'success');
    }

    filterUsers(searchTerm) {
        const filteredUsers = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
        );
        this.renderUsersTable(filteredUsers);
    }

    filterUsersByStatus(status) {
        if (status === 'all') {
            this.renderUsersTable(this.users);
        } else {
            const filteredUsers = this.users.filter(user => user.status === status);
            this.renderUsersTable(filteredUsers);
        }
    }

    editRow(row) {
        // Implement edit functionality
        this.showNotification('Edit functionality coming soon', 'info');
    }

    deleteRow(row) {
        // Add confirmation dialog
        if (confirm('Are you sure you want to delete this record?')) {
            anime({
                targets: row,
                opacity: [1, 0],
                height: [row.offsetHeight, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    row.remove();
                    this.showNotification('Record deleted successfully', 'success');
                }
            });
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            this.showNotification('Logged out successfully', 'success');
            // In a real app, this would redirect to login page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    startRealTimeUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.updateStats();
                this.loadRecentActivity();
            }
        }, 30000);

        // Update system info every 60 seconds
        setInterval(() => {
            this.updateSystemStats();
        }, 60000);
    }

    updateSystemStats() {
        // Simulate system stats update
        const stats = {
            cpu: Math.floor(Math.random() * 50) + 20,
            memory: Math.floor(Math.random() * 40) + 50,
            disk: Math.floor(Math.random() * 30) + 40,
            network: Math.floor(Math.random() * 40) + 10
        };

        // Update progress bars if visible
        Object.keys(stats).forEach(key => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                anime({
                    targets: element,
                    width: `${stats[key]}%`,
                    duration: 1000,
                    easing: 'easeOutQuad'
                });
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-6 glass-card px-6 py-4 rounded-lg z-50 transform translate-x-full transition-transform duration-300`;
        
        const colorClass = type === 'error' ? 'text-red-400' : 
                          type === 'success' ? 'text-green-400' : 'text-blue-400';
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')}"></div>
                <span class="${colorClass}">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // News Management Methods
    showAddNewsModal() {
        const modal = document.getElementById('newsModal');
        if (modal) modal.classList.remove('hidden');
    }

    hideAddNewsModal() {
        const modal = document.getElementById('newsModal');
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('addNewsForm');
        if (form) form.reset();
    }

    addNewNews() {
        const form = document.getElementById('addNewsForm');
        if (!form) return;

        const formData = new FormData(form);
        const newsItem = {
            id: 'N' + (Math.floor(Math.random() * 10000)),
            title: formData.get('title'),
            sector: formData.get('sector'),
            priority: formData.get('priority'),
            language: formData.get('language'),
            content: formData.get('content'),
            publicationDate: formData.get('publicationDate'),
            status: formData.get('status'),
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        this.news.push(newsItem);
        this.saveNewsToLocalStorage();

        // Update table
        this.updateNewsTable();

        // Show success message
        this.showNotification('News added successfully!', 'success');

        // Close modal and reset form
        this.hideAddNewsModal();
    }

    saveNewsToLocalStorage() {
        try {
            localStorage.setItem('panchimukhiNews', JSON.stringify(this.news));
        } catch (e) {
            console.warn('Failed to save news to localStorage', e);
        }
    }

    loadNewsFromLocalStorage() {
        try {
            const saved = localStorage.getItem('panchimukhiNews');
            if (saved) {
                this.news = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load news from localStorage', e);
            this.news = [];
        }
    }

    updateNewsTable() {
        const newsTable = document.getElementById('newsTable');
        if (!newsTable) return;

        newsTable.innerHTML = '';

        this.news.forEach(news => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-800 hover:bg-gray-800/50';

            const statusBadgeClass = news.status === 'published' ? 'status-active' : 
                                     news.status === 'draft' ? 'status-pending' : 'status-warning';

            row.innerHTML = `
                <td class="mono-text">#${news.id}</td>
                <td>${news.title}</td>
                <td>${news.sector}</td>
                <td>${news.language.toUpperCase()}</td>
                <td><span class="status-badge ${statusBadgeClass}">${news.status.charAt(0).toUpperCase() + news.status.slice(1)}</span></td>
                <td>${new Date(news.publicationDate).toLocaleDateString('en-IN')}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="action-btn bg-blue-500 hover:bg-blue-600" data-action="edit" data-id="${news.id}">Edit</button>
                        <button class="action-btn bg-red-500 hover:bg-red-600" data-action="delete" data-id="${news.id}">Delete</button>
                    </div>
                </td>
            `;

            newsTable.appendChild(row);
        });

        // Add event listeners for edit/delete buttons
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editNews(id);
            });
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteNews(id);
            });
        });
    }

    filterNews(query) {
        const newsTable = document.getElementById('newsTable');
        if (!newsTable) return;

        const rows = newsTable.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    filterNewsByStatus(status) {
        const newsTable = document.getElementById('newsTable');
        if (!newsTable) return;

        const rows = newsTable.querySelectorAll('tr');
        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else {
                const statusText = row.querySelector('.status-badge').textContent.toLowerCase();
                row.style.display = statusText.includes(status) ? '' : 'none';
            }
        });
    }

    editNews(newsId) {
        const news = this.news.find(n => n.id === newsId);
        if (!news) return;

        // Show modal with populated data
        const modal = document.getElementById('newsModal');
        const form = document.getElementById('addNewsForm');
        if (!modal || !form) return;

        form.title.value = news.title;
        form.sector.value = news.sector;
        form.priority.value = news.priority;
        form.language.value = news.language;
        form.content.value = news.content;
        form.publicationDate.value = news.publicationDate;
        form.status.value = news.status;

        // Change form to update mode
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update News';
            submitBtn.onclick = () => {
                e.preventDefault();
                this.updateNews(newsId);
            };
        }

        modal.classList.remove('hidden');
    }

    updateNews(newsId) {
        const form = document.getElementById('addNewsForm');
        if (!form) return;

        const formData = new FormData(form);
        const newsIndex = this.news.findIndex(n => n.id === newsId);
        if (newsIndex === -1) return;

        this.news[newsIndex] = {
            ...this.news[newsIndex],
            title: formData.get('title'),
            sector: formData.get('sector'),
            priority: formData.get('priority'),
            language: formData.get('language'),
            content: formData.get('content'),
            publicationDate: formData.get('publicationDate'),
            status: formData.get('status')
        };

        this.saveNewsToLocalStorage();
        this.updateNewsTable();
        this.showNotification('News updated successfully!', 'success');
        this.hideAddNewsModal();
    }

    deleteNews(newsId) {
        if (confirm('Are you sure you want to delete this news?')) {
            this.news = this.news.filter(n => n.id !== newsId);
            this.saveNewsToLocalStorage();
            this.updateNewsTable();
            this.showNotification('News deleted successfully!', 'success');
        }
    }

    loadSectionData(section) {
        if (section === 'news') {
            this.loadNewsFromLocalStorage();
            this.updateNewsTable();
        }
    }

    // Handle window resize for charts
    handleResize() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.adminPanel) {
            window.adminPanel.handleResize();
        }
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Admin panel backgrounded');
    } else {
        console.log('Admin panel foregrounded');
        if (window.adminPanel) {
            window.adminPanel.loadDashboardData();
        }
    }
});