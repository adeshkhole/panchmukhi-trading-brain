// Enhanced IPO Analysis with Advanced Features
class EnhancedIPOManager {
    constructor() {
        this.ipos = [];
        this.performanceChart = null;
        this.init();
    }

    init() {
        setTimeout(() => {
            this.loadIPOData();
            this.setupFilters();
            this.initializeCharts();
        }, 100);
    }

    loadIPOData() {
        // Mock IPO data with enhanced features
        this.ipos = [
            {
                id: 1,
                name: 'Tech Innovators IPO',
                sector: 'IT',
                priceRange: '₹425-450',
                lotSize: 33,
                issueSize: '₹850 Cr',
                openDate: '13 Dec',
                closeDate: '15 Dec',
                listingDate: '20 Dec',
                status: 'open',
                gmp: 85,
                gmpTrend: 'up',
                subscription: {
                    total: 7.8,
                    qib: 12.5,
                    nii: 8.2,
                    retail: 5.1
                },
                riskScore: 6.5,
                predictedGain: 18.5,
                recommendation: 'Subscribe'
            },
            {
                id: 2,
                name: 'Healthcare Solutions',
                sector: 'Pharma',
                priceRange: '₹650-685',
                lotSize: 21,
                issueSize: '₹1,250 Cr',
                openDate: '10 Dec',
                closeDate: '12 Dec',
                listingDate: '18 Dec',
                status: 'open',
                gmp: 45,
                gmpTrend: 'stable',
                subscription: {
                    total: 5.2,
                    qib: 8.1,
                    nii: 4.5,
                    retail: 3.8
                },
                riskScore: 5.8,
                predictedGain: 8.5,
                recommendation: 'Subscribe'
            },
            {
                id: 3,
                name: 'Green Energy IPO',
                sector: 'Energy',
                priceRange: '₹325-340',
                lotSize: 44,
                issueSize: '₹650 Cr',
                openDate: '20 Dec',
                closeDate: '22 Dec',
                listingDate: '26 Dec',
                status: 'upcoming',
                gmp: 25,
                gmpTrend: 'up',
                subscription: {
                    total: 0,
                    qib: 0,
                    nii: 0,
                    retail: 0
                },
                riskScore: 7.2,
                predictedGain: 12.0,
                recommendation: 'Apply'
            },
            {
                id: 4,
                name: 'Consumer Goods',
                sector: 'FMCG',
                priceRange: '₹550-580',
                lotSize: 25,
                issueSize: '₹950 Cr',
                openDate: '5 Dec',
                closeDate: '7 Dec',
                listingDate: '12 Dec',
                status: 'closed',
                gmp: 125,
                gmpTrend: 'up',
                subscription: {
                    total: 12.8,
                    qib: 25.2,
                    nii: 18.5,
                    retail: 8.3
                },
                riskScore: 4.2,
                predictedGain: 22.5,
                listingGain: 21.6,
                recommendation: 'Listed'
            }
        ];

        this.renderIPOs();
    }

    setupFilters() {
        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterIPOs(e.target.value);
            });
        }
    }

    filterIPOs(filter) {
        let filtered = this.ipos;

        if (filter !== 'all') {
            filtered = this.ipos.filter(ipo => ipo.status === filter);
        }

        this.renderIPOs(filtered);
    }

    renderIPOs(ipoList = this.ipos) {
        const container = document.querySelector('.ipo-grid');
        if (!container) return;

        container.innerHTML = ipoList.map(ipo => this.createIPOCard(ipo)).join('');
    }

    createIPOCard(ipo) {
        const statusColors = {
            open: 'bg-green-500',
            upcoming: 'bg-blue-500',
            closed: 'bg-red-500'
        };

        const gmpColor = ipo.gmp > 50 ? 'text-green-400' : ipo.gmp > 20 ? 'text-yellow-400' : 'text-blue-400';
        const riskColor = ipo.riskScore < 5 ? 'text-green-400' : ipo.riskScore < 7 ? 'text-yellow-400' : 'text-red-400';

        return `
            <div class="ipo-card glass-card p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold mb-1">${ipo.name}</h3>
                        <p class="text-sm text-gray-400">${ipo.sector}</p>
                    </div>
                    <span class="${statusColors[ipo.status]} px-3 py-1 rounded-full text-xs text-white capitalize">
                        ${ipo.status}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                        <span class="text-gray-400">Price:</span>
                        <span class="font-semibold ml-1">${ipo.priceRange}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Lot:</span>
                        <span class="font-semibold ml-1">${ipo.lotSize} shares</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Size:</span>
                        <span class="font-semibold ml-1">${ipo.issueSize}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Listing:</span>
                        <span class="font-semibold ml-1">${ipo.listingDate}</span>
                    </div>
                </div>

                ${ipo.status !== 'upcoming' ? `
                    <div class="mb-4">
                        <div class="flex justify-between text-sm mb-2">
                            <span>Subscription</span>
                            <span class="font-bold">${ipo.subscription.total}x</span>
                        </div>
                        <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-green-500 to-green-600" 
                                 style="width: ${Math.min(ipo.subscription.total * 10, 100)}%">
                            </div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                            <span>QIB: ${ipo.subscription.qib}x</span>
                            <span>NII: ${ipo.subscription.nii}x</span>
                            <span>Retail: ${ipo.subscription.retail}x</span>
                        </div>
                    </div>
                ` : ''}

                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">GMP:</span>
                        <span class="${gmpColor} font-bold">
                            ₹${ipo.gmp} ${ipo.gmpTrend === 'up' ? '↑' : ipo.gmpTrend === 'down' ? '↓' : '→'}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Risk:</span>
                        <span class="${riskColor} font-bold">${ipo.riskScore}/10</span>
                    </div>
                </div>

                ${ipo.status === 'closed' && ipo.listingGain ? `
                    <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                        <div class="text-center">
                            <div class="text-xs text-gray-400 mb-1">Listing Gain</div>
                            <div class="text-2xl font-bold text-green-400">+${ipo.listingGain}%</div>
                        </div>
                    </div>
                ` : `
                    <div class="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                        <div class="text-center">
                            <div class="text-xs text-gray-400 mb-1">Predicted Gain</div>
                            <div class="text-2xl font-bold text-blue-400">+${ipo.predictedGain}%</div>
                        </div>
                    </div>
                `}

                <div class="flex gap-2">
                    <button class="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition">
                        ${ipo.recommendation}
                    </button>
                    <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                        Track
                    </button>
                </div>
            </div>
        `;
    }

    initializeCharts() {
        const chartDom = document.getElementById('performanceChart');
        if (!chartDom) return;

        this.performanceChart = echarts.init(chartDom);

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#f97316',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['Listing Day', '7-Day', '30-Day'],
                textStyle: { color: '#999' },
                bottom: 0
            },
            grid: { top: 30, bottom: 50, left: 50, right: 20 },
            xAxis: {
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' }
            },
            yAxis: {
                type: 'value',
                name: 'Gain (%)',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [
                {
                    name: 'Listing Day',
                    type: 'line',
                    data: [15, 22, 18, 28, 35, 42],
                    smooth: true,
                    lineStyle: { color: '#22c55e', width: 3 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
                            { offset: 1, color: 'rgba(34, 197, 94, 0)' }
                        ])
                    }
                },
                {
                    name: '7-Day',
                    type: 'line',
                    data: [12, 18, 15, 25, 30, 38],
                    smooth: true,
                    lineStyle: { color: '#3b82f6', width: 2 }
                },
                {
                    name: '30-Day',
                    type: 'line',
                    data: [8, 15, 12, 20, 25, 32],
                    smooth: true,
                    lineStyle: { color: '#f97316', width: 2 }
                }
            ]
        };

        this.performanceChart.setOption(option);

        window.addEventListener('resize', () => {
            if (this.performanceChart) this.performanceChart.resize();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.ipoManager = new EnhancedIPOManager();
});