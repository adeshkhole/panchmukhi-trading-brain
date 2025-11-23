class SectorAnalysis {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'mr';
        this.sectors = [];
        this.currentView = 'heatmap';
        this.selectedSector = null;
        this.stockData = {};
        this.performanceData = {};
        
        this.init();
    }

    init() {
        this.loadLanguage();
        this.loadSectors();
        this.initializeCharts();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.loadMockData();
        // Ensure fade-in elements are revealed even if global main.js isn't included
        this.revealFadeIns();
    }

    revealFadeIns() {
        try {
            const items = document.querySelectorAll('.fade-in');
            items.forEach((el, idx) => {
                setTimeout(() => el.classList.add('visible'), 120 * idx);
            });
        } catch (err) {
            // fail silently - revealing UI is best-effort
            console.warn('revealFadeIns error', err);
            
        }
    }

    loadLanguage() {
        const translations = {
            mr: {
                title: 'सेक्टर विश्लेषण',
                subtitle: 'भारतीय बाजार सेक्टर्सचा वास्तविक विश्लेषण',
                heatmapView: 'हिटमॅप',
                comparisonView: 'तुलना',
                performanceView: 'कामगिरी',
                topStocks: 'टॉप स्टॉक्स',
                sectorDetails: 'सेक्टर तपशील',
                stocks: 'स्टॉक्स',
                performance: 'कामगिरी',
                change: 'बदल',
                volume: 'व्हॉल्यूम',
                marketCap: 'मार्केट कॅप',
                peRatio: 'P/E रेशो',
                viewDetails: 'तपशील पहा',
                addToWatchlist: 'वॉचलिस्टमध्ये जोडा',
                realTimeUpdates: 'रिअल-टाइम अद्यतन',
                lastUpdated: 'शेवटचे अद्यतन'
            },
            hi: {
                title: 'सेक्टर विश्लेषण',
                subtitle: 'भारतीय बाजार सेक्टर्स का वास्तविक विश्लेषण',
                heatmapView: 'हिटमैप',
                comparisonView: 'तुलना',
                performanceView: 'प्रदर्शन',
                topStocks: 'टॉप स्टॉक्स',
                sectorDetails: 'सेक्टर विवरण',
                stocks: 'स्टॉक्स',
                performance: 'प्रदर्शन',
                change: 'बदलाव',
                volume: 'वॉल्यूम',
                marketCap: 'मार्केट कैप',
                peRatio: 'P/E अनुपात',
                viewDetails: 'विवरण देखें',
                addToWatchlist: 'वॉचलिस्ट में जोड़ें',
                realTimeUpdates: 'रियल-टाइम अपडेट्स',
                lastUpdated: 'अंतिम अपडेट'
            },
            en: {
                title: 'Sector Analysis',
                subtitle: 'Real-time Indian Market Sector Analysis',
                heatmapView: 'Heatmap',
                comparisonView: 'Comparison',
                performanceView: 'Performance',
                topStocks: 'Top Stocks',
                sectorDetails: 'Sector Details',
                stocks: 'Stocks',
                performance: 'Performance',
                change: 'Change',
                volume: 'Volume',
                marketCap: 'Market Cap',
                peRatio: 'P/E Ratio',
                viewDetails: 'View Details',
                addToWatchlist: 'Add to Watchlist',
                realTimeUpdates: 'Real-time Updates',
                lastUpdated: 'Last Updated'
            },
            gu: {
                title: 'સેક્ટર વિશ્લેષણ',
                subtitle: 'ભારતીય બજાર સેક્ટર્સનું રિયલ-ટાઈમ વિશ્લેષણ',
                heatmapView: 'હિટમેપ',
                comparisonView: 'તુલના',
                performanceView: 'પ્રદર્શન',
                topStocks: 'ટોપ સ્ટોક્સ',
                sectorDetails: 'સેક્ટર વિગતો',
                stocks: 'સ્ટોક્સ',
                performance: 'પ્રદર્શન',
                change: 'બદલાવ',
                volume: 'વોલ્યુમ',
                marketCap: 'માર્કેટ કેપ',
                peRatio: 'P/E ગુણોત્તર',
                viewDetails: 'વિગતો જુઓ',
                addToWatchlist: 'વોચલિસ્ટમાં ઉમેરો',
                realTimeUpdates: 'રિયલ-ટાઈમ અપડેટ્સ',
                lastUpdated: 'છેલ્લું અપડેટ'
            },
            kn: {
                title: 'ಸೆಕ್ಟರ್ ವಿಶ್ಲೇಷಣೆ',
                subtitle: 'ಭಾರತೀಯ ಮಾರುಕಟ್ಟೆ ಸೆಕ್ಟರ್ಗಳ ನೈಜ-ಸಮಯ ವಿಶ್ಲೇಷಣೆ',
                heatmapView: 'ಹೀಟ್‌ಮ್ಯಾಪ್',
                comparisonView: 'ಹೋಲಿಕೆ',
                performanceView: 'ಪ್ರದರ್ಶನ',
                topStocks: 'ಟಾಪ್ ಸ್ಟಾಕ್ಸ್',
                sectorDetails: 'ಸೆಕ್ಟರ್ ವಿವರಗಳು',
                stocks: 'ಸ್ಟಾಕ್ಸ್',
                performance: 'ಪ್ರದರ್ಶನ',
                change: 'ಬದಲಾವಣೆ',
                volume: 'ವಾಲ್ಯೂಮ್',
                marketCap: 'ಮಾರ್ಕೆಟ್ ಕ್ಯಾಪ್',
                peRatio: 'P/E ಅನುಪಾತ',
                viewDetails: 'ವಿವರಗಳು ನೋಡಿ',
                addToWatchlist: 'ವಾಚ್‌ಲಿಸ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
                realTimeUpdates: 'ರಿಯಲ್-ಟೈಮ್ ಅಪ್‌ಡೇಟ್‌ಗಳು',
                lastUpdated: 'ಕೊನೆಯ ಅಪ್‌ಡೇಟ್'
            }
        };

        this.translations = translations[this.currentLanguage] || translations.en;
        this.updateUIText();
    }

    updateUIText() {
        const safeSet = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        safeSet('page-title', this.translations.title);
        safeSet('page-subtitle', this.translations.subtitle);
        safeSet('heatmap-btn', this.translations.heatmapView);
        safeSet('comparison-btn', this.translations.comparisonView);
        safeSet('performance-btn', this.translations.performanceView);
        safeSet('top-stocks-title', this.translations.topStocks);
    }

    loadSectors() {
        // Mock sector data with realistic Indian market sectors
        this.sectors = [
            {
                name: 'बँकिंग',
                nameEn: 'Banking',
                symbol: 'BANK',
                performance: 2.45,
                change: 1.23,
                volume: '1.2B',
                marketCap: '₹45.6T',
                color: '#10B981',
                stocks: [
                    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1523.45, change: 2.1, volume: '45.2M' },
                    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 987.65, change: 1.8, volume: '38.7M' },
                    { symbol: 'SBIN', name: 'State Bank', price: 634.20, change: 2.5, volume: '52.1M' },
                    { symbol: 'KOTAKBANK', name: 'Kotak Bank', price: 1876.30, change: 1.2, volume: '23.4M' },
                    { symbol: 'AXISBANK', name: 'Axis Bank', price: 1023.15, change: 1.9, volume: '41.8M' }
                ]
            },
            {
                name: 'IT',
                nameEn: 'Information Technology',
                symbol: 'IT',
                performance: -1.23,
                change: -0.89,
                volume: '890M',
                marketCap: '₹32.1T',
                color: '#EF4444',
                stocks: [
                    { symbol: 'TCS', name: 'TCS', price: 4234.50, change: -1.2, volume: '12.3M' },
                    { symbol: 'INFY', name: 'Infosys', price: 1876.90, change: -0.8, volume: '18.7M' },
                    { symbol: 'WIPRO', name: 'Wipro', price: 456.78, change: -1.5, volume: '25.4M' },
                    { symbol: 'HCLTECH', name: 'HCL Tech', price: 1567.34, change: -0.9, volume: '15.2M' },
                    { symbol: 'TECHM', name: 'Tech Mahindra', price: 1234.56, change: -1.1, volume: '19.8M' }
                ]
            },
            {
                name: 'ऑटो',
                nameEn: 'Automobile',
                symbol: 'AUTO',
                performance: 3.67,
                change: 2.89,
                volume: '1.1B',
                marketCap: '₹28.9T',
                color: '#10B981',
                stocks: [
                    { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 12345.67, change: 3.2, volume: '8.9M' },
                    { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 789.12, change: 2.7, volume: '34.5M' },
                    { symbol: 'M&M', name: 'Mahindra', price: 3456.78, change: 3.5, volume: '12.8M' },
                    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', price: 8765.43, change: 2.9, volume: '6.7M' },
                    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', price: 3456.78, change: 2.4, volume: '15.3M' }
                ]
            },
            {
                name: 'फार्मा',
                nameEn: 'Pharmaceutical',
                symbol: 'PHARMA',
                performance: 1.89,
                change: 1.45,
                volume: '765M',
                marketCap: '₹19.8T',
                color: '#10B981',
                stocks: [
                    { symbol: 'SUNPHARMA', name: 'Sun Pharma', price: 1789.45, change: 1.8, volume: '22.1M' },
                    { symbol: 'DRREDDY', name: 'Dr. Reddy', price: 5678.90, change: 1.2, volume: '8.9M' },
                    { symbol: 'CIPLA', name: 'Cipla', price: 1234.56, change: 1.6, volume: '18.7M' },
                    { symbol: 'LUPIN', name: 'Lupin', price: 987.65, change: 1.4, volume: '15.4M' },
                    { symbol: 'BIOCON', name: 'Biocon', price: 345.67, change: 1.9, volume: '28.9M' }
                ]
            },
            {
                name: 'धातु',
                nameEn: 'Metals',
                symbol: 'METALS',
                performance: -2.34,
                change: -1.78,
                volume: '654M',
                marketCap: '₹15.6T',
                color: '#EF4444',
                stocks: [
                    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 123.45, change: -2.1, volume: '45.6M' },
                    { symbol: 'JSWSTEEL', name: 'JSW Steel', price: 678.90, change: -1.9, volume: '32.1M' },
                    { symbol: 'HINDALCO', name: 'Hindalco', price: 456.78, change: -2.3, volume: '28.9M' },
                    { symbol: 'VEDL', name: 'Vedanta', price: 234.56, change: -2.5, volume: '38.7M' },
                    { symbol: 'NMDC', name: 'NMDC', price: 145.67, change: -1.8, volume: '25.4M' }
                ]
            },
            {
                name: 'ऊर्जा',
                nameEn: 'Energy',
                symbol: 'ENERGY',
                performance: 0.67,
                change: 0.45,
                volume: '987M',
                marketCap: '₹41.2T',
                color: '#F59E0B',
                stocks: [
                    { symbol: 'RELIANCE', name: 'Reliance', price: 2345.67, change: 0.8, volume: '67.8M' },
                    { symbol: 'ONGC', name: 'ONGC', price: 234.56, change: 0.3, volume: '45.2M' },
                    { symbol: 'IOC', name: 'Indian Oil', price: 123.45, change: 0.5, volume: '38.9M' },
                    { symbol: 'BPCL', name: 'BPCL', price: 345.67, change: 0.6, volume: '29.8M' },
                    { symbol: 'NTPC', name: 'NTPC', price: 234.56, change: 0.4, volume: '34.5M' }
                ]
            },
            {
                name: 'उपभोगता वस्तू',
                nameEn: 'Consumer Goods',
                symbol: 'CONSUMER',
                performance: 2.91,
                change: 2.34,
                volume: '543M',
                marketCap: '₹35.7T',
                color: '#10B981',
                stocks: [
                    { symbol: 'HINDUNILVR', name: 'HUL', price: 2567.89, change: 2.8, volume: '18.7M' },
                    { symbol: 'ITC', name: 'ITC', price: 456.78, change: 2.1, volume: '67.8M' },
                    { symbol: 'NESTLEIND', name: 'Nestle', price: 2345.67, change: 2.5, volume: '8.9M' },
                    { symbol: 'DABUR', name: 'Dabur', price: 567.89, change: 2.3, volume: '23.4M' },
                    { symbol: 'MARICO', name: 'Marico', price: 678.90, change: 2.0, volume: '19.8M' }
                ]
            },
            {
                name: 'टेलिकॉम',
                nameEn: 'Telecom',
                symbol: 'TELECOM',
                performance: -0.34,
                change: -0.12,
                volume: '432M',
                marketCap: '₹12.3T',
                color: '#F59E0B',
                stocks: [
                    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1234.56, change: -0.2, volume: '28.9M' },
                    { symbol: 'RELCOMM', name: 'Reliance Comm', price: 23.45, change: -0.8, volume: '45.6M' },
                    { symbol: 'IDEA', name: 'Vodafone Idea', price: 12.34, change: -0.5, volume: '89.7M' },
                    { symbol: 'TATACOMM', name: 'Tata Comm', price: 1234.56, change: 0.1, volume: '12.3M' },
                    { symbol: 'GTLINFRA', name: 'GTL Infra', price: 45.67, change: -0.3, volume: '34.5M' }
                ]
            }
        ];
    }

    loadMockData() {
        // Load additional mock performance data
        this.performanceData = {
            daily: this.generatePerformanceData('daily'),
            weekly: this.generatePerformanceData('weekly'),
            monthly: this.generatePerformanceData('monthly'),
            yearly: this.generatePerformanceData('yearly')
        };
    }

    generatePerformanceData(period) {
        const sectors = this.sectors.map(sector => ({
            name: sector.nameEn,
            performance: sector.performance + (Math.random() - 0.5) * 2,
            change: sector.change + (Math.random() - 0.5) * 1,
            volume: sector.volume,
            marketCap: sector.marketCap
        }));
        return sectors;
    }

    initializeCharts() {
        this.createSectorHeatmap();
        this.createPerformanceChart();
        this.createComparisonChart();
    }

    createSectorHeatmap() {
        const heatmapContainer = document.getElementById('sector-heatmap');
        if (!heatmapContainer) return;

        // Clear existing content
        heatmapContainer.innerHTML = '';

        // Create heatmap grid
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-4 gap-4 p-6';

        this.sectors.forEach(sector => {
            const sectorCard = this.createSectorCard(sector);
            grid.appendChild(sectorCard);
        });

        heatmapContainer.appendChild(grid);
    }

    createSectorCard(sector) {
        const card = document.createElement('div');
        card.className = `sector-card bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`;
        card.style.borderLeft = `4px solid ${sector.color}`;

        const performanceColor = sector.performance >= 0 ? 'text-green-600' : 'text-red-600';
        const changeColor = sector.change >= 0 ? 'text-green-600' : 'text-red-600';
        const performanceSign = sector.performance >= 0 ? '+' : '';
        const changeSign = sector.change >= 0 ? '+' : '';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">${sector.name}</h3>
                    <p class="text-sm text-gray-500">${sector.symbol}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold ${performanceColor}">
                        ${performanceSign}${sector.performance.toFixed(2)}%
                    </div>
                    <div class="text-sm ${changeColor}">
                        ${changeSign}${sector.change.toFixed(2)}%
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-500">${this.translations.volume}:</span>
                    <span class="font-semibold">${sector.volume}</span>
                </div>
                <div>
                    <span class="text-gray-500">${this.translations.marketCap}:</span>
                    <span class="font-semibold">${sector.marketCap}</span>
                </div>
            </div>
            
            <div class="mt-4 flex space-x-2">
                <button class="view-details-btn bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                    ${this.translations.viewDetails}
                </button>
                <button class="add-watchlist-btn bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors">
                    ${this.translations.addToWatchlist}
                </button>
            </div>
        `;

        // Add click event for sector details
        card.querySelector('.view-details-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showSectorDetails(sector);
        });

        card.querySelector('.add-watchlist-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addToWatchlist(sector);
        });

        card.addEventListener('click', () => {
            this.showSectorDetails(sector);
        });

        return card;
    }

    createPerformanceChart() {
        const chartContainer = document.getElementById('performance-chart');
        if (!chartContainer) return;

        // Initialize ECharts
        const chart = echarts.init(chartContainer);
        
        const option = {
            title: {
                text: this.translations.performance,
                textStyle: { color: '#1F2937', fontSize: 18, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
                textStyle: { color: '#6B7280' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.sectors.map(s => s.nameEn),
                axisLabel: { color: '#6B7280', rotate: 45 }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#6B7280', formatter: '{value}%' }
            },
            series: [
                {
                    name: 'Daily',
                    type: 'bar',
                    data: this.sectors.map(s => s.performance),
                    itemStyle: { color: '#3B82F6' }
                },
                {
                    name: 'Weekly',
                    type: 'line',
                    data: this.sectors.map(s => s.performance * 1.2),
                    itemStyle: { color: '#10B981' }
                }
            ]
        };

        chart.setOption(option);
        
        // Make chart responsive
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }

    createComparisonChart() {
        const chartContainer = document.getElementById('comparison-chart');
        if (!chartContainer) return;

        const chart = echarts.init(chartContainer);
        
        const option = {
            title: {
                text: this.translations.comparisonView,
                textStyle: { color: '#1F2937', fontSize: 18, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}% ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: { color: '#6B7280' }
            },
            series: [
                {
                    name: 'Sector Performance',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    data: this.sectors.map(sector => ({
                        value: Math.abs(sector.performance),
                        name: sector.nameEn,
                        itemStyle: { color: sector.color }
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        chart.setOption(option);
        
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }

    showSectorDetails(sector) {
        this.selectedSector = sector;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">${sector.name} ${this.translations.sectorDetails}</h2>
                        <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-3">${this.translations.performance}</h3>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span>Daily:</span>
                                    <span class="${sector.performance >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        ${sector.performance >= 0 ? '+' : ''}${sector.performance.toFixed(2)}%
                                    </span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Weekly:</span>
                                    <span class="text-green-600">+${(sector.performance * 1.2).toFixed(2)}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Monthly:</span>
                                    <span class="text-green-600">+${(sector.performance * 1.5).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-3">Market Data</h3>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span>${this.translations.volume}:</span>
                                    <span class="font-semibold">${sector.volume}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>${this.translations.marketCap}:</span>
                                    <span class="font-semibold">${sector.marketCap}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Active Stocks:</span>
                                    <span class="font-semibold">${sector.stocks.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4">${this.translations.stocks}</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="border p-2 text-left">Symbol</th>
                                        <th class="border p-2 text-left">Name</th>
                                        <th class="border p-2 text-right">Price</th>
                                        <th class="border p-2 text-right">Change</th>
                                        <th class="border p-2 text-right">Volume</th>
                                        <th class="border p-2 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="sector-stocks-table">
                                    <!-- Stocks will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-4">
                        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                            ${this.translations.addToWatchlist}
                        </button>
                        <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors close-modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Populate stocks table
        const stocksTable = modal.querySelector('#sector-stocks-table');
        sector.stocks.forEach(stock => {
            const row = document.createElement('tr');
            const changeColor = stock.change >= 0 ? 'text-green-600' : 'text-red-600';
            const changeSign = stock.change >= 0 ? '+' : '';
            
            row.innerHTML = `
                <td class="border p-2 font-semibold">${stock.symbol}</td>
                <td class="border p-2">${stock.name}</td>
                <td class="border p-2 text-right">₹${stock.price.toFixed(2)}</td>
                <td class="border p-2 text-right ${changeColor}">
                    ${changeSign}${stock.change.toFixed(2)}%
                </td>
                <td class="border p-2 text-right">${stock.volume}</td>
                <td class="border p-2 text-center">
                    <button class="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">
                        Add
                    </button>
                </td>
            `;
            stocksTable.appendChild(row);
        });

        // Add event listeners
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
    }

    addToWatchlist(sector) {
        // Add to watchlist logic
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        if (!watchlist.find(item => item.symbol === sector.symbol)) {
            watchlist.push({
                symbol: sector.symbol,
                name: sector.name,
                type: 'sector',
                performance: sector.performance,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            this.showNotification(`${sector.name} added to watchlist!`);
        } else {
            this.showNotification(`${sector.name} is already in watchlist!`);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    setupEventListeners() {
        // View switcher
        document.getElementById('heatmap-btn').addEventListener('click', () => {
            this.switchView('heatmap');
        });

        document.getElementById('comparison-btn').addEventListener('click', () => {
            this.switchView('comparison');
        });

        document.getElementById('performance-btn').addEventListener('click', () => {
            this.switchView('performance');
        });

        // Language selector
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                localStorage.setItem('language', this.currentLanguage);
                this.loadLanguage();
                this.refreshView();
            });
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        const activeBtn = document.getElementById(`${view}-btn`);
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-blue-500', 'text-white');

        // Show/hide views
        document.getElementById('sector-heatmap').style.display = view === 'heatmap' ? 'block' : 'none';
        document.getElementById('performance-chart-container').style.display = view === 'performance' ? 'block' : 'none';
        document.getElementById('comparison-chart-container').style.display = view === 'comparison' ? 'block' : 'none';

        // Refresh charts if needed
        if (view === 'performance') {
            setTimeout(() => this.createPerformanceChart(), 100);
        } else if (view === 'comparison') {
            setTimeout(() => this.createComparisonChart(), 100);
        }
    }

    refreshView() {
        if (this.currentView === 'heatmap') {
            this.createSectorHeatmap();
        } else if (this.currentView === 'performance') {
            this.createPerformanceChart();
        } else if (this.currentView === 'comparison') {
            this.createComparisonChart();
        }
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateSectorData();
        }, 30000);

        // Update last updated timestamp
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const lastUpdatedElement = document.getElementById('last-updated');
            if (lastUpdatedElement) {
                lastUpdatedElement.textContent = `${this.translations.lastUpdated}: ${timeString}`;
            }
        }, 1000);
    }

    updateSectorData() {
        // Simulate real-time data changes
        this.sectors.forEach(sector => {
            const change = (Math.random() - 0.5) * 0.5;
            sector.performance += change;
            sector.change += change * 0.8;
            
            // Update stock prices
            sector.stocks.forEach(stock => {
                const stockChange = (Math.random() - 0.5) * 2;
                stock.price += stock.price * (stockChange / 100);
                stock.change += stockChange * 0.5;
            });
        });

        // Refresh the current view
        this.refreshView();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sectorAnalysis = new SectorAnalysis();
});