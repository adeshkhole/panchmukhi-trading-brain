// Enhanced News Management with Advanced Analytics
class EnhancedNewsManager {
    constructor() {
        this.newsData = [];
        this.filteredData = [];
        this.trendingTopics = [];
        this.init();
    }

    init() {
        setTimeout(() => {
            this.loadNews();
            this.setupEventListeners();
            this.analyzeTrends();
        }, 100);
    }

    // Load news with mock data for demo
    async loadNews() {
        try {
            const response = await fetch('http://localhost:8083/api/news/aggregator');
            const result = await response.json();
            if (result.success) {
                this.newsData = result.data.map(news => this.enrichNewsData(news));
            } else {
                this.loadMockNews();
            }
        } catch (e) {
            console.log('Loading mock news data for demo');
            this.loadMockNews();
        }
        this.filteredData = [...this.newsData];
        this.render();
    }

    loadMockNews() {
        this.newsData = [
            {
                id: 1,
                title: 'Reliance Industries Q4 Results Beat Estimates',
                content: 'Reliance Industries reported strong Q4 earnings with profit up 12%. Retail and digital services show robust growth. Stock surged 5% on the announcement.',
                sector: 'Energy',
                priority: 'High',
                status: 'published',
                language: 'en',
                date: new Date().toISOString(),
                sentiment: 'Positive',
                sentimentScore: 85,
                impactScore: 9.2,
                relatedStocks: ['RELIANCE', 'RCOM'],
                tags: ['earnings', 'retail', 'digital']
            },
            {
                id: 2,
                title: 'IT Sector Faces Headwinds as Dollar Strengthens',
                content: 'Major IT companies facing margin pressure due to rupee appreciation. TCS and Infosys expected to revise guidance downward.',
                sector: 'IT',
                priority: 'High',
                status: 'published',
                language: 'en',
                date: new Date(Date.now() - 3600000).toISOString(),
                sentiment: 'Negative',
                sentimentScore: 35,
                impactScore: 7.8,
                relatedStocks: ['TCS', 'INFY', 'WIPRO'],
                tags: ['forex', 'margins', 'guidance']
            },
            {
                id: 3,
                title: 'RBI Keeps Rates Unchanged, Maintains Accommodative Stance',
                content: 'Reserve Bank of India maintains repo rate at 6.5% citing inflation concerns. GDP growth forecast revised upward to 6.8%.',
                sector: 'Banking',
                priority: 'High',
                status: 'published',
                language: 'en',
                date: new Date(Date.now() - 7200000).toISOString(),
                sentiment: 'Neutral',
                sentimentScore: 55,
                impactScore: 8.5,
                relatedStocks: ['HDFCBANK', 'ICICIBANK', 'SBIN'],
                tags: ['rbi', 'rates', 'policy']
            },
            {
                id: 4,
                title: 'Pharma Exports Surge 18% in Q1',
                content: 'Indian pharmaceutical exports show strong growth led by generic formulations to US and European markets.',
                sector: 'Pharma',
                priority: 'Medium',
                status: 'published',
                language: 'en',
                date: new Date(Date.now() - 10800000).toISOString(),
                sentiment: 'Positive',
                sentimentScore: 75,
                impactScore: 6.5,
                relatedStocks: ['SUNPHARMA', 'DRREDDY', 'CIPLA'],
                tags: ['exports', 'generics', 'usfda']
            },
            {
                id: 5,
                title: 'Auto Sales Decline 8% YoY Amid Chip Shortage',
                content: 'Major automakers report decline in sales due to ongoing semiconductor shortage. Recovery expected in H2.',
                sector: 'Auto',
                priority: 'Medium',
                status: 'published',
                language: 'en',
                date: new Date(Date.now() - 14400000).toISOString(),
                sentiment: 'Negative',
                sentimentScore: 40,
                impactScore: 7.2,
                relatedStocks: ['MARUTI', 'TATAMOTORS', 'M&M'],
                tags: ['sales', 'chips', 'supply-chain']
            },
            {
                id: 6,
                title: 'Real Estate Sector Shows Signs of Revival',
                content: 'Property sales in top 7 cities up 22% in Q1. Affordable housing driving growth with government support.',
                sector: 'Real Estate',
                priority: 'Low',
                status: 'published',
                language: 'en',
                date: new Date(Date.now() - 18000000).toISOString(),
                sentiment: 'Positive',
                sentimentScore: 70,
                impactScore: 5.5,
                relatedStocks: ['DLF', 'GODREJPROP'],
                tags: ['housing', 'sales', 'recovery']
            }
        ].map(news => this.enrichNewsData(news));
    }

    enrichNewsData(news) {
        // Add sentiment if not present
        if (!news.sentiment) {
            news.sentiment = this.analyzeSentiment(news.content);
            news.sentimentScore = this.calculateSentimentScore(news.content);
        }
        // Add impact score if not present
        if (!news.impactScore) {
            news.impactScore = (Math.random() * 4 + 5).toFixed(1);
        }
        // Extract tags if not present
        if (!news.tags) {
            news.tags = this.extractKeywords(news.content);
        }
        // Add related stocks if not present
        if (!news.relatedStocks) {
            news.relatedStocks = [];
        }
        return news;
    }

    analyzeSentiment(text) {
        const positiveWords = ['surge', 'growth', 'strong', 'beat', 'gain', 'profit', 'success', 'up', 'positive', 'robust'];
        const negativeWords = ['decline', 'fall', 'loss', 'weak', 'down', 'pressure', 'concern', 'negative', 'headwind'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return 'Positive';
        if (negativeCount > positiveCount) return 'Negative';
        return 'Neutral';
    }

    calculateSentimentScore(text) {
        const positiveWords = ['surge', 'growth', 'strong', 'beat', 'gain', 'profit', 'success', 'up', 'positive', 'robust'];
        const negativeWords = ['decline', 'fall', 'loss', 'weak', 'down', 'pressure', 'concern', 'negative', 'headwind'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        const score = 50 + (positiveCount * 10) - (negativeCount * 10);
        return Math.max(0, Math.min(100, score));
    }

    extractKeywords(text) {
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = text.toLowerCase().split(/\W+/);
        const filtered = words.filter(w => w.length > 3 && !commonWords.includes(w));
        return [...new Set(filtered)].slice(0, 3);
    }

    analyzeTrends() {
        const allTags = this.newsData.flatMap(n => n.tags || []);
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        this.trendingTopics = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }

    applyFilters() {
        const search = document.getElementById('searchNews')?.value.toLowerCase() || '';
        const sector = document.getElementById('filterSector')?.value || '';
        const priority = document.getElementById('filterPriority')?.value || '';
        const sentiment = document.getElementById('filterSentiment')?.value || '';

        this.filteredData = this.newsData.filter(news => {
            const matchSearch = !search ||
                news.title.toLowerCase().includes(search) ||
                news.content.toLowerCase().includes(search);
            const matchSector = !sector || news.sector === sector;
            const matchPriority = !priority || news.priority === priority;
            const matchSentiment = !sentiment || news.sentiment === sentiment;

            return matchSearch && matchSector && matchPriority && matchSentiment;
        });

        this.render();
    }

    updateStats() {
        const total = this.filteredData.length;
        const positive = this.filteredData.filter(n => n.sentiment === 'Positive').length;
        const negative = this.filteredData.filter(n => n.sentiment === 'Negative').length;
        const neutral = this.filteredData.filter(n => n.sentiment === 'Neutral').length;

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPositive').textContent = positive;
        document.getElementById('statNegative').textContent = negative;
        document.getElementById('statNeutral').textContent = neutral;
    }

    render() {
        this.updateStats();
        this.renderTrendingTopics();
        this.renderNewsList();
    }

    renderTrendingTopics() {
        const container = document.getElementById('trendingTopics');
        if (!container) return;

        container.innerHTML = this.trendingTopics.map((topic, index) => `
            <div class="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-orange-400">#${index + 1}</span>
                    <span class="text-sm">${topic.tag}</span>
                </div>
                <span class="text-xs text-gray-500">${topic.count} news</span>
            </div>
        `).join('');
    }

    renderNewsList() {
        const container = document.getElementById('newsContainer');
        if (!container) return;

        if (this.filteredData.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-400">
                    No news found matching your filters
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredData.map(news => this.createNewsCard(news)).join('');
    }

    createNewsCard(news) {
        const sentimentColor = {
            'Positive': 'text-green-400 bg-green-500/20 border-green-500/30',
            'Negative': 'text-red-400 bg-red-500/20 border-red-500/30',
            'Neutral': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
        };

        const impactColor = news.impactScore >= 8 ? 'text-red-400' : news.impactScore >= 6 ? 'text-yellow-400' : 'text-green-400';

        return `
            <div class="glass-card p-6 hover:border-orange-500/50 transition cursor-pointer" onclick="window.newsManager.showDetail(${news.id})">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-white text-lg flex-1 hover:text-orange-400 transition">
                        ${news.title}
                    </h3>
                </div>
                
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">${news.content}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">${news.sector}</span>
                    <span class="px-2 py-1 ${sentimentColor[news.sentiment]} border rounded text-xs">
                        ${news.sentiment} (${news.sentimentScore})
                    </span>
                    <span class="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        Impact: <span class="${impactColor} font-bold">${news.impactScore}/10</span>
                    </span>
                </div>
                
                ${news.relatedStocks && news.relatedStocks.length > 0 ? `
                    <div class="flex flex-wrap gap-1 mb-3">
                        <span class="text-xs text-gray-500">Related:</span>
                        ${news.relatedStocks.map(stock => `
                            <span class="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">${stock}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>${new Date(news.date).toLocaleString()}</span>
                    <span class="text-${news.priority === 'High' ? 'red' : news.priority === 'Medium' ? 'yellow' : 'green'}-400">
                        ${news.priority} Priority
                    </span>
                </div>
            </div>
        `;
    }

    showDetail(newsId) {
        const news = this.newsData.find(n => n.id === newsId);
        if (!news) return;

        const modal = document.getElementById('newsModal');
        if (!modal) return;

        document.getElementById('modalTitle').textContent = news.title;
        document.getElementById('modalContent').textContent = news.content;
        document.getElementById('modalSector').textContent = news.sector;
        document.getElementById('modalSentiment').textContent = `${news.sentiment} (${news.sentimentScore}/100)`;
        document.getElementById('modalImpact').textContent = `${news.impactScore}/10`;
        document.getElementById('modalDate').textContent = new Date(news.date).toLocaleString();

        const stocksContainer = document.getElementById('modalStocks');
        stocksContainer.innerHTML = (news.relatedStocks || []).map(stock => `
            <span class="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-sm">${stock}</span>
        `).join('') || '<span class="text-gray-500">None</span>';

        modal.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('newsModal').classList.add('hidden');
    }

    setupEventListeners() {
        const filters = ['searchNews', 'filterSector', 'filterPriority', 'filterSentiment'];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener(id === 'searchNews' ? 'input' : 'change', () => this.applyFilters());
            }
        });

        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('newsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'newsModal') this.closeModal();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.newsManager = new EnhancedNewsManager();
});
