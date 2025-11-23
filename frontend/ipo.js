// IPO Analysis JavaScript
class IPOAnalysis {
    constructor() {
        this.ipoData = this.initializeIPOData();
        this.performanceChart = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePerformanceChart();
        this.setupScrollAnimations();
        this.startRealTimeUpdates();
        this.animateSubscriptionBars();
    }

    initializeIPOData() {
        return {
            'tech-innovators': {
                name: 'Tech Innovators IPO',
                company: 'Tech Innovators Limited',
                sector: 'IT Service Provider',
                priceRange: '₹425 - ₹450',
                lotSize: 33,
                totalIssue: '₹850 Cr',
                freshIssue: '₹600 Cr',
                offerForSale: '₹250 Cr',
                openingDate: '13 December 2024',
                closingDate: '15 December 2024',
                allotmentDate: '18 December 2024',
                listingDate: '20 December 2024',
                listingExchange: 'NSE, BSE',
                registrar: 'KFin Tech',
                leadManagers: ['Axis Capital', 'ICICI Securities', 'Kotak Mahindra Capital'],
                status: 'open',
                subscription: {
                    total: 7.8,
                    qib: 12.5,
                    nii: 8.2,
                    retail: 5.1,
                    employees: 2.3
                },
                gmp: {
                    current: 85,
                    percentage: 18.9,
                    trend: 'positive'
                },
                financials: {
                    revenue: [450, 520, 680, 850],
                    profit: [45, 62, 95, 125],
                    years: ['FY21', 'FY22', 'FY23', 'FY24']
                },
                strengths: [
                    'Leading IT Service Provider in India',
                    'Strong customer base - 250+ clients',
                    'AI/ML capabilities and new technology',
                    'Consistently growing revenue and profit'
                ],
                risks: [
                    'Intense competition in the IT sector',
                    'Dependency risk on key clients',
                    'Impact of technological changes',
                    'Global economic conditions'
                ],
                peerComparison: [
                    { company: 'Infosys', pe: 28.5, roe: 25.2 },
                    { company: 'TCS', pe: 32.1, roe: 42.8 },
                    { company: 'HCL Tech', pe: 24.8, roe: 22.1 },
                    { company: 'Tech Innovators', pe: 22.5, roe: 28.3 }
                ]
            },
            'healthcare-solutions': {
                name: 'Healthcare Solutions IPO',
                company: 'Healthcare Solutions India Limited',
                sector: 'Pharma Company',
                priceRange: '₹650 - ₹685',
                lotSize: 21,
                totalIssue: '₹1,250 Cr',
                freshIssue: '₹900 Cr',
                offerForSale: '₹350 Cr',
                openingDate: '10 December 2024',
                closingDate: '12 December 2024',
                allotmentDate: '16 December 2024',
                listingDate: '18 December 2024',
                listingExchange: 'NSE, BSE',
                registrar: 'Link Intime',
                leadManagers: ['HDFC Bank', 'SBI Capital', 'Axis Capital'],
                status: 'open',
                subscription: {
                    total: 5.2,
                    qib: 8.1,
                    nii: 4.5,
                    retail: 3.8,
                    employees: 1.9
                },
                gmp: {
                    current: 45,
                    percentage: 6.6,
                    trend: 'positive'
                },
                financials: {
                    revenue: [680, 750, 920, 1150],
                    profit: [78, 95, 125, 165],
                    years: ['FY21', 'FY22', 'FY23', 'FY24']
                },
                strengths: [
                    'Leading Generic Pharmaceutical Manufacturer in India',
                    'USFDA approved manufacturing facility',
                    'Diverse product portfolio',
                    'Strong R&D capabilities'
                ],
                risks: [
                    'FDA inspections and regulatory risks',
                    'Raw material price volatility',
                    'Dependence on China',
                    'Impact of foreign exchange rates'
                ],
                peerComparison: [
                    { company: 'Sun Pharma', pe: 22.8, roe: 18.5 },
                    { company: 'Cipla', pe: 25.4, roe: 16.2 },
                    { company: 'Dr. Reddy\'s', pe: 28.1, roe: 20.3 },
                    { company: 'Healthcare Solutions', pe: 19.5, roe: 24.7 }
                ]
            }
        };
    }

    setupEventListeners() {
        // Filter selection
        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.filterIPOs(e.target.value);
        });

        // IPO card clicks
        document.querySelectorAll('.ipo-card').forEach(card => {
            card.addEventListener('click', () => {
                const ipoId = card.getAttribute('data-ipo');
                if (this.ipoData[ipoId]) {
                    this.showIPODetails(ipoId);
                }
            });
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal background click
        document.getElementById('ipoModal').addEventListener('click', (e) => {
            if (e.target.id === 'ipoModal') {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    initializePerformanceChart() {
        const chartDom = document.getElementById('performanceChart');
        this.performanceChart = echarts.init(chartDom, 'dark');

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['Listing Gain', '5 Day Gain', '30 Day Gain'],
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
                data: ['January', 'February', 'March', 'April', 'May', 'June'],
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
                    name: 'Listing Gain',
                    type: 'line',
                    data: [15, 22, 18, 28, 35, 42],
                    smooth: true,
                    lineStyle: { color: '#22C55E', width: 2 },
                    itemStyle: { color: '#22C55E' }
                },
                {
                    name: '5 Day Gain',
                    type: 'line',
                    data: [12, 18, 15, 25, 30, 38],
                    smooth: true,
                    lineStyle: { color: '#3B82F6', width: 2 },
                    itemStyle: { color: '#3B82F6' }
                },
                {
                    name: '30 Day Gain',
                    type: 'line',
                    data: [8, 15, 12, 20, 25, 32],
                    smooth: true,
                    lineStyle: { color: '#FF6B35', width: 2 },
                    itemStyle: { color: '#FF6B35' }
                }
            ]
        };

        this.performanceChart.setOption(option);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.performanceChart.resize();
        });
    }

    filterIPOs(filter) {
        const cards = document.querySelectorAll('.ipo-card');
        
        cards.forEach(card => {
            const ipoId = card.getAttribute('data-ipo');
            const ipoData = this.ipoData[ipoId];
            
            if (!ipoData) return;
            
            let show = false;
            
            switch(filter) {
                case 'all':
                    show = true;
                    break;
                case 'open':
                    show = ipoData.status === 'open';
                    break;
                case 'closed':
                    show = ipoData.status === 'closed';
                    break;
                case 'upcoming':
                    show = ipoData.status === 'upcoming';
                    break;
            }
            
            if (show) {
                card.style.display = 'block';
                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 500,
                    easing: 'easeOutQuad'
                });
            } else {
                anime({
                    targets: card,
                    opacity: [1, 0],
                    translateY: [0, -20],
                    duration: 300,
                    easing: 'easeInQuad',
                    complete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }

    showIPODetails(ipoId) {
        const ipo = this.ipoData[ipoId];
        if (!ipo) return;

        // Update modal title
        document.getElementById('modalTitle').textContent = ipo.name;

        // Generate modal content
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = this.generateModalContent(ipo);

        // Show modal
        document.getElementById('ipoModal').classList.remove('hidden');

        // Animate modal
        anime({
            targets: '#ipoModal .glass-card',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });

        // Initialize financial chart if needed
        this.initializeFinancialChart(ipo);
    }

    generateModalContent(ipo) {
        return `
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Basic Information -->
                <div class="space-y-6">
                    <div>
                        <h4 class="text-lg font-bold mb-3">Basic Information</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Company Name:</span>
                                <span>${ipo.company}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Sector:</span>
                                <span>${ipo.sector}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Price Range:</span>
                                <span class="font-semibold mono-text">${ipo.priceRange}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Minimum Lot:</span>
                                <span>${ipo.lotSize} Shares</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Total Issue:</span>
                                <span class="font-semibold mono-text">${ipo.totalIssue}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-3">Important Dates</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Opening:</span>
                                <span>${ipo.openingDate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Closing:</span>
                                <span>${ipo.closingDate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Allotment:</span>
                                <span>${ipo.allotmentDate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Listing:</span>
                                <span>${ipo.listingDate}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-3">Subscription Status</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span>एकूण:</span>
                                <span class="font-bold text-lg">${ipo.subscription.total}x</span>
                            </div>
                            <div class="subscription-bar">
                                <div class="subscription-fill bg-gradient-to-r from-green-400 to-green-600" style="width: ${Math.min(ipo.subscription.total * 10, 100)}%"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="flex justify-between">
                                    <span>QIB:</span>
                                    <span class="font-semibold">${ipo.subscription.qib}x</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>NII:</span>
                                    <span class="font-semibold">${ipo.subscription.nii}x</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Retail:</span>
                                    <span class="font-semibold">${ipo.subscription.retail}x</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Employees:</span>
                                    <span class="font-semibold">${ipo.subscription.employees}x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Information -->
                <div class="space-y-6">
                    <div>
                        <h4 class="text-lg font-bold mb-3">Financial Information</h4>
                        <div id="financialChart" class="w-full h-48"></div>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-3">GMP (Grey Market Premium)</h4>
                        <div class="bg-gray-800/50 p-4 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span>Current GMP:</span>
                                <span class="font-bold text-green-400">₹${ipo.gmp.current}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>Price Increase:</span>
                                <span class="font-bold text-green-400">${ipo.gmp.percentage}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold mb-3">Comparative Analysis</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-gray-700">
                                        <th class="text-left py-2">Company</th>
                                        <th class="text-right py-2">P/E</th>
                                        <th class="text-right py-2">ROE (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ipo.peerComparison.map(peer => `
                                        <tr class="border-b border-gray-800">
                                            <td class="py-2">${peer.company}</td>
                                            <td class="text-right py-2 mono-text">${peer.pe}</td>
                                            <td class="text-right py-2 mono-text">${peer.roe}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h4 class="text-lg font-bold mb-3 text-green-400">Strengths</h4>
                    <ul class="space-y-2 text-sm">
                        ${ipo.strengths.map(strength => `
                            <li class="flex items-start space-x-2">
                                <span class="text-green-400 mt-1">✓</span>
                                <span>${strength}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div>
                    <h4 class="text-lg font-bold mb-3 text-red-400">Risks</h4>
                    <ul class="space-y-2 text-sm">
                        ${ipo.risks.map(risk => `
                            <li class="flex items-start space-x-2">
                                <span class="text-red-400 mt-1">⚠</span>
                                <span>${risk}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <div class="flex justify-end space-x-4 mt-8">
                <button class="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                    Watch Later
                </button>
                <button class="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                    Apply Now
                </button>
            </div>
        `;
    }

    initializeFinancialChart(ipo) {
        const chartDom = document.getElementById('financialChart');
        if (!chartDom) return;

        const financialChart = echarts.init(chartDom, 'dark');

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['Revenue (₹ Cr)', 'Profit (₹ Cr)'],
                textStyle: { color: '#fff' },
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '20%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ipo.financials.years,
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
                    name: 'Revenue (₹ Cr)',
                    type: 'bar',
                    data: ipo.financials.revenue,
                    itemStyle: { color: '#3B82F6' }
                },
                {
                    name: 'Profit (₹ Cr)',
                    type: 'line',
                    data: ipo.financials.profit,
                    smooth: true,
                    lineStyle: { color: '#FF6B35', width: 2 },
                    itemStyle: { color: '#FF6B35' }
                }
            ]
        };

        financialChart.setOption(option);

        // Handle resize
        const resizeHandler = () => {
            financialChart.resize();
        };
        window.addEventListener('resize', resizeHandler);

        // Store reference for cleanup
        this.financialCharts = this.financialCharts || [];
        this.financialCharts.push({ chart: financialChart, handler: resizeHandler });
    }

    closeModal() {
        const modal = document.getElementById('ipoModal');
        
        anime({
            targets: '#ipoModal .glass-card',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuad',
            complete: () => {
                modal.classList.add('hidden');
            }
        });

        // Cleanup financial charts
        if (this.financialCharts) {
            this.financialCharts.forEach(({ chart, handler }) => {
                window.removeEventListener('resize', handler);
                chart.dispose();
            });
            this.financialCharts = [];
        }
    }

    animateSubscriptionBars() {
        const bars = document.querySelectorAll('.subscription-fill');
        
        bars.forEach((bar, index) => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                anime({
                    targets: bar,
                    width: width,
                    duration: 1000,
                    easing: 'easeOutQuad'
                });
            }, index * 200);
        });
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
                    
                    // Add staggered animation for IPO cards
                    if (entry.target.classList.contains('ipo-card')) {
                        anime({
                            targets: entry.target,
                            translateY: [50, 0],
                            opacity: [0, 1],
                            duration: 800,
                            easing: 'easeOutQuad'
                        });
                    }
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    startRealTimeUpdates() {
        // Update GMP and subscription data every 60 seconds
        setInterval(() => {
            this.updateGMPData();
            this.updateSubscriptionData();
        }, 60000);

        // Update performance chart every 5 minutes
        setInterval(() => {
            this.updatePerformanceChart();
        }, 300000);
    }

    updateGMPData() {
        const ipoCards = document.querySelectorAll('.ipo-card');
        
        ipoCards.forEach(card => {
            const ipoId = card.getAttribute('data-ipo');
            const ipo = this.ipoData[ipoId];
            
            if (ipo && ipo.gmp) {
                // Simulate GMP change
                const change = (Math.random() - 0.5) * 10;
                ipo.gmp.current = Math.max(0, ipo.gmp.current + change);
                ipo.gmp.percentage = (ipo.gmp.current / 450) * 100; // Assuming avg price of 450
                
                // Update display
                const gmpElement = card.querySelector('.text-green-400, .text-red-400, .text-blue-400');
                if (gmpElement) {
                    const sign = ipo.gmp.current > 0 ? '+' : '';
                    gmpElement.textContent = `₹${ipo.gmp.current.toFixed(0)} (${sign}${ipo.gmp.percentage.toFixed(1)}%)`;
                    
                    // Update color based on trend
                    gmpElement.className = `font-semibold ${ipo.gmp.current > 0 ? 'text-green-400' : 'text-red-400'}`;
                }
            }
        });
    }

    updateSubscriptionData() {
        const ipoCards = document.querySelectorAll('.ipo-card');
        
        ipoCards.forEach(card => {
            const ipoId = card.getAttribute('data-ipo');
            const ipo = this.ipoData[ipoId];
            
            if (ipo && ipo.status === 'open') {
                // Simulate subscription increase
                const increase = Math.random() * 0.5;
                ipo.subscription.total += increase;
                
                // Update display
                const subElement = card.querySelector('.font-semibold');
                if (subElement) {
                    subElement.textContent = `${ipo.subscription.total.toFixed(1)}x`;
                }
                
                // Update progress bar
                const progressBar = card.querySelector('.subscription-fill');
                if (progressBar) {
                    const newWidth = Math.min(ipo.subscription.total * 10, 100);
                    anime({
                        targets: progressBar,
                        width: `${newWidth}%`,
                        duration: 1000,
                        easing: 'easeOutQuad'
                    });
                }
            }
        });
    }

    updatePerformanceChart() {
        if (!this.performanceChart) return;

        // Generate new data
        const newData = {
            listing: Array.from({length: 6}, () => Math.floor(Math.random() * 50) + 10),
            fiveDay: Array.from({length: 6}, () => Math.floor(Math.random() * 40) + 5),
            thirtyDay: Array.from({length: 6}, () => Math.floor(Math.random() * 35))
        };

        this.performanceChart.setOption({
            series: [
                { data: newData.listing },
                { data: newData.fiveDay },
                { data: newData.thirtyDay }
            ]
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ipoAnalysis = new IPOAnalysis();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('IPO page backgrounded');
    } else {
        console.log('IPO page foregrounded');
        if (window.ipoAnalysis) {
            window.ipoAnalysis.updateGMPData();
            window.ipoAnalysis.updateSubscriptionData();
        }
    }
});