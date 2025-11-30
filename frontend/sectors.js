// Enhanced Sector Analysis with Advanced Features
class EnhancedSectorManager {
    constructor() {
        this.sectors = [];
        this.charts = {};
        this.init();
    }

    init() {
        setTimeout(() => {
            this.loadSectorData();
            this.renderAllSections();
            this.initializeCharts();
            this.setupStockComparison();
        }, 100);
    }

    loadSectorData() {
        this.sectors = [
            {
                id: 'it',
                name: 'IT Sector',
                icon: '💻',
                performance: 2.3,
                volume: '12.5M',
                index: 25450,
                pe: 28.5,
                marketCap: '₹32.1T',
                stocks: [
                    { symbol: 'TCS', price: 4234.50, change: 2.5, volume: '12.3M' },
                    { symbol: 'INFY', price: 1876.90, change: 1.8, volume: '18.7M' },
                    { symbol: 'WIPRO', price: 456.78, change: -0.5, volume: '25.4M' },
                    { symbol: 'HCLTECH', price: 1567.34, change: 2.1, volume: '15.2M' },
                    { symbol: 'TECHM', price: 1234.56, change: 1.3, volume: '19.8M' }
                ]
            },
            {
                id: 'banking',
                name: 'Banking',
                icon: '🏦',
                performance: 1.8,
                volume: '25.3M',
                index: 42850,
                pe: 18.2,
                marketCap: '₹45.6T',
                stocks: [
                    { symbol: 'HDFCBANK', price: 1523.45, change: 2.1, volume: '45.2M' },
                    { symbol: 'ICICIBANK', price: 987.65, change: 1.8, volume: '38.7M' },
                    { symbol: 'SBIN', price: 634.20, change: 2.5, volume: '52.1M' },
                    { symbol: 'KOTAKBANK', price: 1876.30, change: 1.2, volume: '23.4M' },
                    { symbol: 'AXISBANK', price: 1023.15, change: 1.9, volume: '41.8M' }
                ]
            },
            {
                id: 'pharma',
                name: 'Pharma',
                icon: '💊',
                performance: -0.9,
                volume: '8.7M',
                index: 12345,
                pe: 22.8,
                marketCap: '₹19.8T',
                stocks: [
                    { symbol: 'SUNPHARMA', price: 1789.45, change: -1.2, volume: '22.1M' },
                    { symbol: 'DRREDDY', price: 5678.90, change: -0.5, volume: '8.9M' },
                    { symbol: 'CIPLA', price: 1234.56, change: -1.1, volume: '18.7M' },
                    { symbol: 'LUPIN', price: 987.65, change: -0.8, volume: '15.4M' },
                    { symbol: 'BIOCON', price: 345.67, change: -0.6, volume: '28.9M' }
                ]
            },
            {
                id: 'auto',
                name: 'Auto',
                icon: '🚗',
                performance: 3.1,
                volume: '15.2M',
                index: 8956,
                pe: 25.3,
                marketCap: '₹28.9T',
                stocks: [
                    { symbol: 'MARUTI', price: 12345.67, change: 3.2, volume: '8.9M' },
                    { symbol: 'TATAMOTORS', price: 789.12, change: 3.5, volume: '34.5M' },
                    { symbol: 'M&M', price: 3456.78, change: 2.8, volume: '12.8M' },
                    { symbol: 'BAJAJ-AUTO', price: 8765.43, change: 3.0, volume: '6.7M' },
                    { symbol: 'HEROMOTOCO', price: 3456.78, change: 2.9, volume: '15.3M' }
                ]
            },
            {
                id: 'metal',
                name: 'Metal',
                icon: '⚙️',
                performance: 1.2,
                volume: '9.8M',
                index: 5678,
                pe: 15.7,
                marketCap: '₹15.6T',
                stocks: [
                    { symbol: 'TATASTEEL', price: 123.45, change: 1.5, volume: '45.6M' },
                    { symbol: 'JSWSTEEL', price: 678.90, change: 1.1, volume: '32.1M' },
                    { symbol: 'HINDALCO', price: 456.78, change: 0.9, volume: '28.9M' },
                    { symbol: 'VEDL', price: 234.56, change: 1.3, volume: '38.7M' },
                    { symbol: 'NMDC', price: 145.67, change: 1.0, volume: '25.4M' }
                ]
            },
            {
                id: 'fmcg',
                name: 'FMCG',
                icon: '🛒',
                performance: 0.7,
                volume: '6.4M',
                index: 14234,
                pe: 48.2,
                marketCap: '₹35.7T',
                stocks: [
                    { symbol: 'HUL', price: 2567.89, change: 0.8, volume: '18.7M' },
                    { symbol: 'ITC', price: 456.78, change: 0.6, volume: '67.8M' },
                    { symbol: 'NESTLEIND', price: 2345.67, change: 0.5, volume: '8.9M' },
                    { symbol: 'DABUR', price: 567.89, change: 0.9, volume: '23.4M' },
                    { symbol: 'MARICO', price: 678.90, change: 0.7, volume: '19.8M' }
                ]
            },
            {
                id: 'realty',
                name: 'Realty',
                icon: '🏠',
                performance: -1.5,
                volume: '4.1M',
                index: 3456,
                pe: 32.1,
                marketCap: '₹12.3T',
                stocks: [
                    { symbol: 'DLF', price: 456.78, change: -1.2, volume: '23.4M' },
                    { symbol: 'GODREJPROP', price: 2345.67, change: -1.8, volume: '12.3M' },
                    { symbol: 'OBEROIRLTY', price: 1234.56, change: -1.3, volume: '8.9M' },
                    { symbol: 'PRESTIGE', price: 789.12, change: -1.6, volume: '15.6M' },
                    { symbol: 'PHOENIX', price: 1567.89, change: -1.1, volume: '9.8M' }
                ]
            },
            {
                id: 'energy',
                name: 'Energy',
                icon: '⚡',
                performance: 0.6,
                volume: '34.5M',
                index: 9876,
                pe: 19.5,
                marketCap: '₹41.2T',
                stocks: [
                    { symbol: 'RELIANCE', price: 2345.67, change: 0.8, volume: '67.8M' },
                    { symbol: 'ONGC', price: 234.56, change: 0.3, volume: '45.2M' },
                    { symbol: 'IOC', price: 123.45, change: 0.5, volume: '38.9M' },
                    { symbol: 'BPCL', price: 345.67, change: 0.6, volume: '29.8M' },
                    { symbol: 'NTPC', price: 234.56, change: 0.4, volume: '34.5M' }
                ]
            }
        ];
    }

    renderAllSections() {
        this.renderHeatmap();
        this.renderTopMovers();
        this.renderSectorCards();
    }

    renderHeatmap() {
        const container = document.getElementById('sectorHeatmap');
        if (!container) return;

        const heatmapChart = echarts.init(container);

        const data = this.sectors.map((sector, idx) => {
            return {
                name: sector.name,
                value: [idx % 4, Math.floor(idx / 4), sector.performance.toFixed(2)],
                itemStyle: {
                    color: sector.performance > 2 ? '#22c55e' :
                        sector.performance > 0 ? '#10b981' :
                            sector.performance > -1 ? '#fbbf24' :
                                '#ef4444'
                }
            };
        });

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                position: 'top',
                formatter: (params) => {
                    return `${params.data.name}<br/>Performance: ${params.data.value[2]}%`;
                }
            },
            grid: {
                height: '85%',
                top: '5%',
                left: '3%',
                right: '3%'
            },
            xAxis: {
                type: 'category',
                data: ['A', 'B', 'C', 'D'],
                splitArea: { show: true },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false }
            },
            yAxis: {
                type: 'category',
                data: ['1', '2'],
                splitArea: { show: true },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false }
            },
            visualMap: {
                min: -2,
                max: 4,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                inRange: {
                    color: ['#ef4444', '#fbbf24', '#22c55e']
                },
                textStyle: { color: '#fff' }
            },
            series: [{
                name: 'Sector Performance',
                type: 'heatmap',
                data: data,
                label: {
                    show: true,
                    formatter: (params) => {
                        return `${params.data.name}\n${params.data.value[2]}%`;
                    },
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        heatmapChart.setOption(option);
        this.charts.heatmap = heatmapChart;

        window.addEventListener('resize', () => {
            if (this.charts.heatmap) this.charts.heatmap.resize();
        });
    }

    renderTopMovers() {
        const gainersContainer = document.querySelector('.top-gainers');
        const losersContainer = document.querySelector('.top-losers');

        if (!gainersContainer || !losersContainer) return;

        // Collect all stocks
        const allStocks = [];
        this.sectors.forEach(sector => {
            sector.stocks.forEach(stock => {
                allStocks.push({ ...stock, sector: sector.name });
            });
        });

        // Sort by change
        const gainers = allStocks.sort((a, b) => b.change - a.change).slice(0, 5);
        const losers = allStocks.sort((a, b) => a.change - b.change).slice(0, 5);

        gainersContainer.innerHTML = gainers.map(stock => `
            <div class="flex justify-between items-center p-3 bg-white/5 rounded hover:bg-white/10 transition">
                <div>
                    <div class="font-bold text-sm">${stock.symbol}</div>
                    <div class="text-xs text-gray-500">${stock.sector}</div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-green-400">+${stock.change.toFixed(2)}%</div>
                    <div class="text-xs text-gray-400">₹${stock.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');

        losersContainer.innerHTML = losers.map(stock => `
            <div class="flex justify-between items-center p-3 bg-white/5 rounded hover:bg-white/10 transition">
                <div>
                    <div class="font-bold text-sm">${stock.symbol}</div>
                    <div class="text-xs text-gray-500">${stock.sector}</div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-red-400">${stock.change.toFixed(2)}%</div>
                    <div class="text-xs text-gray-400">₹${stock.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    renderSectorCards() {
        const container = document.querySelector('.sector-grid');
        if (!container) return;

        container.innerHTML = this.sectors.map(sector => this.createSectorCard(sector)).join('');
    }

    createSectorCard(sector) {
        const bgColor = sector.performance >= 0 ? 'border-green-500' : 'border-red-500';
        const textColor = sector.performance >= 0 ? 'text-green-400' : 'text-red-400';

        return `
            <div class="sector-card glass-card p-6 border-l-4 ${bgColor}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">${sector.icon}</div>
                        <div>
                            <h3 class="text-xl font-bold">${sector.name}</h3>
                            <p class="text-sm text-gray-400">Index: ${sector.index}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${textColor}">${sector.performance > 0 ? '+' : ''}${sector.performance}%</div>
                        <div class="text-xs text-gray-400">Today</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                        <span class="text-gray-400">Volume:</span>
                        <span class="font-semibold ml-1">${sector.volume}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">P/E:</span>
                        <span class="font-semibold ml-1">${sector.pe}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Market Cap:</span>
                        <span class="font-semibold ml-1">${sector.marketCap}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Stocks:</span>
                        <span class="font-semibold ml-1">${sector.stocks.length}</span>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full ${sector.performance >= 0 ? 'bg-green-500' : 'bg-red-500'}" 
                             style="width: ${Math.min(Math.abs(sector.performance) * 20, 100)}%"></div>
                    </div>
                </div>

                <div class="flex justify-between text-xs text-gray-400">
                    <span>Top: ${sector.stocks[0].symbol}</span>
                    <span class="${sector.stocks[0].change >= 0 ? 'text-green-400' : 'text-red-400'}">
                        ${sector.stocks[0].change > 0 ? '+' : ''}${sector.stocks[0].change.toFixed(2)}%
                    </span>
                </div>
            </div>
        `;
    }

    initializeCharts() {
        this.initializeRotationChart();
        this.initializeMarketCapChart();
    }

    initializeRotationChart() {
        const container = document.getElementById('rotationChart');
        if (!container) return;

        const chart = echarts.init(container);

        const option = {
            backgroundColor: 'transparent',
            title: {
                text: 'Sector Rotation',
                textStyle: { color: '#fff', fontSize: 18 }
            },
            tooltip: { trigger: 'item' },
            radar: {
                indicator: this.sectors.map(s => ({ name: s.name, max: 5 })),
                axisName: { color: '#999' },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                    }
                }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: this.sectors.map(s => Math.abs(s.performance)),
                    name: 'Performance',
                    areaStyle: {
                        color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                            { offset: 0, color: 'rgba(34, 197, 94, 0.5)' },
                            { offset: 1, color: 'rgba(34, 197, 94, 0)' }
                        ])
                    },
                    lineStyle: { color: '#22c55e', width: 2 }
                }]
            }]
        };

        chart.setOption(option);
        this.charts.rotation = chart;

        window.addEventListener('resize', () => {
            if (this.charts.rotation) this.charts.rotation.resize();
        });
    }

    initializeMarketCapChart() {
        const container = document.getElementById('marketCapChart');
        if (!container) return;

        const chart = echarts.init(container);

        const option = {
            backgroundColor: 'transparent',
            title: {
                text: 'Market Cap Distribution',
                textStyle: { color: '#fff', fontSize: 18 }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 10,
                textStyle: { color: '#999' }
            },
            series: [{
                name: 'Market Cap',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#1A1A1A',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                    color: '#fff'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                data: this.sectors.map((sector, idx) => ({
                    value: parseFloat(sector.marketCap.replace(/[₹T]/g, '')),
                    name: sector.name,
                    itemStyle: {
                        color: ['#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#fbbf24', '#10b981'][idx]
                    }
                }))
            }]
        };

        chart.setOption(option);
        this.charts.marketCap = chart;

        window.addEventListener('resize', () => {
            if (this.charts.marketCap) this.charts.marketCap.resize();
        });
    }

    setupStockComparison() {
        const select1 = document.getElementById('stock1Select');
        const select2 = document.getElementById('stock2Select');
        const compareBtn = document.getElementById('compareButton');

        if (!select1 || !select2 || !compareBtn) return;

        // Collect all stocks
        const allStocks = [];
        this.sectors.forEach(sector => {
            sector.stocks.forEach(stock => {
                allStocks.push({
                    ...stock,
                    sector: sector.name,
                    sectorId: sector.id
                });
            });
        });

        // Populate dropdowns
        allStocks.forEach(stock => {
            const option1 = document.createElement('option');
            option1.value = stock.symbol;
            option1.textContent = `${stock.symbol} (${stock.sector})`;
            select1.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = stock.symbol;
            option2.textContent = `${stock.symbol} (${stock.sector})`;
            select2.appendChild(option2);
        });

        // Compare button click
        compareBtn.addEventListener('click', () => {
            const stock1Symbol = select1.value;
            const stock2Symbol = select2.value;

            if (!stock1Symbol || !stock2Symbol) {
                alert('Please select both stocks to compare');
                return;
            }

            if (stock1Symbol === stock2Symbol) {
                alert('Please select different stocks');
                return;
            }

            const stock1 = allStocks.find(s => s.symbol === stock1Symbol);
            const stock2 = allStocks.find(s => s.symbol === stock2Symbol);

            this.showComparison(stock1, stock2);
        });
    }

    showComparison(stock1, stock2) {
        const resultDiv = document.getElementById('comparisonResult');
        if (!resultDiv) return;

        // Update stock names
        document.getElementById('stock1Name').textContent = stock1.symbol;
        document.getElementById('stock2Name').textContent = stock2.symbol;
        document.getElementById('tableStock1Name').textContent = stock1.symbol;
        document.getElementById('tableStock2Name').textContent = stock2.symbol;

        // Update stock 1 data
        document.getElementById('stock1Price').textContent = `₹${stock1.price.toFixed(2)}`;
        document.getElementById('stock1Change').textContent = `${stock1.change > 0 ? '+' : ''}${stock1.change.toFixed(2)}%`;
        document.getElementById('stock1Change').className = `font-semibold ${stock1.change >= 0 ? 'text-green-400' : 'text-red-400'}`;

        // Mock additional data
        const stock1PE = (Math.random() * 30 + 10).toFixed(2);
        const stock1MCap = (Math.random() * 500 + 100).toFixed(0);
        const stock1High = (stock1.price * (1 + Math.random() * 0.3)).toFixed(2);
        const stock1Low = (stock1.price * (1 - Math.random() * 0.3)).toFixed(2);

        document.getElementById('stock1PE').textContent = stock1PE;
        document.getElementById('stock1MCap').textContent = `₹${stock1MCap}B`;
        document.getElementById('stock1High').textContent = `₹${stock1High}`;
        document.getElementById('stock1Low').textContent = `₹${stock1Low}`;

        // Update stock 2 data
        document.getElementById('stock2Price').textContent = `₹${stock2.price.toFixed(2)}`;
        document.getElementById('stock2Change').textContent = `${stock2.change > 0 ? '+' : ''}${stock2.change.toFixed(2)}%`;
        document.getElementById('stock2Change').className = `font-semibold ${stock2.change >= 0 ? 'text-green-400' : 'text-red-400'}`;

        const stock2PE = (Math.random() * 30 + 10).toFixed(2);
        const stock2MCap = (Math.random() * 500 + 100).toFixed(0);
        const stock2High = (stock2.price * (1 + Math.random() * 0.3)).toFixed(2);
        const stock2Low = (stock2.price * (1 - Math.random() * 0.3)).toFixed(2);

        document.getElementById('stock2PE').textContent = stock2PE;
        document.getElementById('stock2MCap').textContent = `₹${stock2MCap}B`;
        document.getElementById('stock2High').textContent = `₹${stock2High}`;
        document.getElementById('stock2Low').textContent = `₹${stock2Low}`;

        // Show comparison chart
        this.renderComparisonChart(stock1, stock2);

        // Show fundamental table
        this.renderFundamentalTable(stock1, stock2, stock1PE, stock2PE, stock1MCap, stock2MCap);

        // Show result section
        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderComparisonChart(stock1, stock2) {
        const container = document.getElementById('comparisonChart');
        if (!container) return;

        const chart = echarts.init(container);

        // Generate mock historical data
        const dates = [];
        const stock1Data = [];
        const stock2Data = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));

            stock1Data.push((stock1.price * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2));
            stock2Data.push((stock2.price * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2));
        }

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#f97316',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: [stock1.symbol, stock2.symbol],
                textStyle: { color: '#999' }
            },
            grid: { top: 50, bottom: 30, left: 60, right: 20 },
            xAxis: {
                type: 'category',
                data: dates,
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999', rotate: 45 }
            },
            yAxis: {
                type: 'value',
                name: 'Price (₹)',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [
                {
                    name: stock1.symbol,
                    type: 'line',
                    data: stock1Data,
                    smooth: true,
                    lineStyle: { color: '#3b82f6', width: 2 },
                    itemStyle: { color: '#3b82f6' }
                },
                {
                    name: stock2.symbol,
                    type: 'line',
                    data: stock2Data,
                    smooth: true,
                    lineStyle: { color: '#f97316', width: 2 },
                    itemStyle: { color: '#f97316' }
                }
            ]
        };

        chart.setOption(option);

        if (this.charts.comparison) {
            this.charts.comparison.dispose();
        }
        this.charts.comparison = chart;

        window.addEventListener('resize', () => {
            if (this.charts.comparison) this.charts.comparison.resize();
        });
    }

    renderFundamentalTable(stock1, stock2, pe1, pe2, mcap1, mcap2) {
        const tbody = document.getElementById('fundamentalTableBody');
        if (!tbody) return;

        const metrics = [
            { name: 'P/E Ratio', stock1: pe1, stock2: pe2 },
            { name: 'Market Cap', stock1: `₹${mcap1}B`, stock2: `₹${mcap2}B` },
            { name: 'Volume', stock1: stock1.volume, stock2: stock2.volume },
            { name: 'Day Change', stock1: `${stock1.change}%`, stock2: `${stock2.change}%` },
            { name: 'Sector', stock1: stock1.sector, stock2: stock2.sector }
        ];

        tbody.innerHTML = metrics.map(metric => `
            <tr class="border-b border-gray-800">
                <td class="py-3 px-4 text-gray-300">${metric.name}</td>
                <td class="py-3 px-4 font-semibold">${metric.stock1}</td>
                <td class="py-3 px-4 font-semibold">${metric.stock2}</td>
            </tr>
        `).join('');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.sectorManager = new EnhancedSectorManager();
});