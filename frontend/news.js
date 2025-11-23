// News Management Page Script
class NewsManager {
    constructor() {
        this.newsData = [];
        this.filteredData = [];
        this.init();
    }

    init() {
        this.loadNews();
        this.setupEventListeners();
        this.render();
    }

    // Load news from localStorage
    loadNews() {
        try {
            const stored = localStorage.getItem('panchimukhiNews');
            this.newsData = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading news:', e);
            this.newsData = [];
        }
        this.filteredData = [...this.newsData];
    }

    // Get unique values from news array
    getUniqueValues(key) {
        return [...new Set(this.newsData.map(n => n[key]))].filter(Boolean);
    }

    // Update filter dropdowns dynamically
    updateFilterOptions() {
        const sectors = this.getUniqueValues('sector');
        const statuses = this.getUniqueValues('status');
        const languages = this.getUniqueValues('language');

        // Populate sector filter
        const sectorSelect = document.getElementById('filterSector');
        if (sectorSelect) {
            const selected = sectorSelect.value;
            sectorSelect.innerHTML = '<option value="">All Sectors</option>';
            sectors.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                sectorSelect.appendChild(opt);
            });
            sectorSelect.value = selected;
        }

        // Populate status filter
        const statusSelect = document.getElementById('filterStatus');
        if (statusSelect) {
            const selected = statusSelect.value;
            statusSelect.innerHTML = '<option value="">All Status</option>';
            statuses.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                statusSelect.appendChild(opt);
            });
            statusSelect.value = selected;
        }

        // Populate language filter
        const langSelect = document.getElementById('filterLanguage');
        if (langSelect) {
            const selected = langSelect.value;
            langSelect.innerHTML = '<option value="">All Languages</option>';
            languages.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l;
                opt.textContent = l;
                langSelect.appendChild(opt);
            });
            langSelect.value = selected;
        }
    }

    // Apply all filters
    applyFilters() {
        const search = document.getElementById('searchNews')?.value.toLowerCase() || '';
        const sector = document.getElementById('filterSector')?.value || '';
        const priority = document.getElementById('filterPriority')?.value || '';
        const status = document.getElementById('filterStatus')?.value || '';
        const language = document.getElementById('filterLanguage')?.value || '';

        this.filteredData = this.newsData.filter(news => {
            const matchSearch = !search || 
                news.title.toLowerCase().includes(search) ||
                news.content.toLowerCase().includes(search);
            const matchSector = !sector || news.sector === sector;
            const matchPriority = !priority || news.priority === priority;
            const matchStatus = !status || news.status === status;
            const matchLanguage = !language || news.language === language;

            return matchSearch && matchSector && matchPriority && matchStatus && matchLanguage;
        });

        this.render();
    }

    // Update statistics cards
    updateStats() {
        const totalCard = document.getElementById('statTotal');
        const highCard = document.getElementById('statHigh');
        const mediumCard = document.getElementById('statMedium');
        const lowCard = document.getElementById('statLow');

        const filtered = this.filteredData;
        const high = filtered.filter(n => n.priority === 'High').length;
        const medium = filtered.filter(n => n.priority === 'Medium').length;
        const low = filtered.filter(n => n.priority === 'Low').length;

        if (totalCard) totalCard.textContent = filtered.length;
        if (highCard) highCard.textContent = high;
        if (mediumCard) mediumCard.textContent = medium;
        if (lowCard) lowCard.textContent = low;
    }

    // Render news organized by priority
    render() {
        this.updateStats();
        this.updateFilterOptions();

        const container = document.getElementById('newsByPriority');
        if (!container) return;

        container.innerHTML = '';

        // Organize by priority
        const priorities = ['High', 'Medium', 'Low'];
        const priorityIcons = { 'High': '🔴', 'Medium': '🟡', 'Low': '🟢' };
        const priorityColors = {
            'High': 'from-red-900/20 to-red-900/5 border-red-800/30',
            'Medium': 'from-yellow-900/20 to-yellow-900/5 border-yellow-800/30',
            'Low': 'from-green-900/20 to-green-900/5 border-green-800/30'
        };

        priorities.forEach(priority => {
            const newsInPriority = this.filteredData.filter(n => n.priority === priority);
            
            if (newsInPriority.length === 0) return;

            const section = document.createElement('div');
            section.className = 'mb-12';

            // Section header
            const header = document.createElement('div');
            header.className = 'mb-6 flex items-center gap-3';
            header.innerHTML = `
                <span class="text-2xl">${priorityIcons[priority]}</span>
                <h2 class="text-2xl font-bold text-white">
                    ${priority} Priority
                </h2>
                <span class="ml-auto text-sm text-gray-400">
                    ${newsInPriority.length} ${newsInPriority.length === 1 ? 'item' : 'items'}
                </span>
            `;
            section.appendChild(header);

            // News grid
            const grid = document.createElement('div');
            grid.className = 'news-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

            newsInPriority.forEach(news => {
                const card = this.createNewsCard(news, priority, priorityColors[priority]);
                grid.appendChild(card);
            });

            section.appendChild(grid);
            container.appendChild(section);
        });

        // If no results
        if (this.filteredData.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-400 text-lg">No news found matching your filters</p>
                </div>
            `;
        }
    }

    // Create individual news card
    createNewsCard(news, priority, gradientClass) {
        const card = document.createElement('div');
        card.className = `glass-card bg-gradient-to-br ${gradientClass} p-6 rounded-lg border cursor-pointer hover:border-opacity-100 transition group`;
        
        const pubDate = news.date ? new Date(news.date).toLocaleDateString() : 'N/A';
        const statusBadgeClass = {
            'published': 'bg-green-900/30 text-green-400 border-green-700/30',
            'draft': 'bg-gray-900/30 text-gray-400 border-gray-700/30',
            'scheduled': 'bg-blue-900/30 text-blue-400 border-blue-700/30'
        };
        const statusClass = statusBadgeClass[news.status] || 'bg-gray-900/30 text-gray-400 border-gray-700/30';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-white flex-1 group-hover:text-orange-400 transition line-clamp-2">
                    ${news.title}
                </h3>
                <span class="ml-2 whitespace-nowrap text-xs px-2 py-1 bg-orange-900/30 text-orange-400 border border-orange-700/30 rounded">
                    ${news.sector}
                </span>
            </div>
            <p class="text-gray-300 text-sm mb-4 line-clamp-2">${news.content}</p>
            <div class="flex items-center justify-between">
                <div class="flex gap-2 flex-wrap">
                    <span class="text-xs px-2 py-1 ${statusClass} border rounded">
                        ${news.status}
                    </span>
                    <span class="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 border border-purple-700/30 rounded">
                        ${news.language}
                    </span>
                </div>
                <span class="text-xs text-gray-500">${pubDate}</span>
            </div>
        `;

        card.addEventListener('click', () => this.showDetailModal(news));
        return card;
    }

    // Show detail modal
    showDetailModal(news) {
        let modal = document.getElementById('newsDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'newsDetailModal';
            modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center hidden';
            document.body.appendChild(modal);
        }

        const pubDate = news.date ? new Date(news.date).toLocaleDateString() : 'N/A';
        const priorityBadgeClass = {
            'High': 'bg-red-900/30 text-red-400 border-red-700/30',
            'Medium': 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
            'Low': 'bg-green-900/30 text-green-400 border-green-700/30'
        };
        const statusBadgeClass = {
            'published': 'bg-green-900/30 text-green-400 border-green-700/30',
            'draft': 'bg-gray-900/30 text-gray-400 border-gray-700/30',
            'scheduled': 'bg-blue-900/30 text-blue-400 border-blue-700/30'
        };

        modal.innerHTML = `
            <div class="bg-slate-900/95 backdrop-blur border border-orange-500/20 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                        <h2 class="text-2xl font-bold text-white flex-1">${news.title}</h2>
                        <button onclick="document.getElementById('newsDetailModal').classList.add('hidden')" class="text-gray-400 hover:text-white text-2xl leading-none">
                            ×
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p class="text-gray-500 text-sm">Sector</p>
                            <p class="text-white font-semibold">${news.sector}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Priority</p>
                            <span class="text-xs px-3 py-1 ${priorityBadgeClass[news.priority]} border rounded inline-block mt-1">
                                ${news.priority}
                            </span>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Status</p>
                            <span class="text-xs px-3 py-1 ${statusBadgeClass[news.status]} border rounded inline-block mt-1">
                                ${news.status}
                            </span>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Language</p>
                            <p class="text-white font-semibold">${news.language}</p>
                        </div>
                    </div>

                    <div class="mb-6">
                        <p class="text-gray-500 text-sm mb-2">Published Date</p>
                        <p class="text-white">${pubDate}</p>
                    </div>

                    <div>
                        <p class="text-gray-500 text-sm mb-2">Content</p>
                        <p class="text-gray-300 leading-relaxed">${news.content}</p>
                    </div>

                    <div class="mt-8 flex gap-4">
                        <button onclick="document.getElementById('newsDetailModal').classList.add('hidden')" class="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 transition">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        const searchInput = document.getElementById('searchNews');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        const filterInputs = [
            'filterSector',
            'filterPriority',
            'filterStatus',
            'filterLanguage'
        ];

        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NewsManager();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsManager = new NewsManager();
});
