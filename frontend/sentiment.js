document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization slightly to ensure DOM elements are fully ready
    setTimeout(() => {
        initCharts();
        showMockData();
        fetchSentimentData();
    }, 100);
});

let gaugeChart, trendChart, sectorChart;

function initCharts() {
    try {
        const gaugeEl = document.getElementById('sentimentGauge');
        const trendEl = document.getElementById('trendChart');
        const sectorEl = document.getElementById('sectorChart');

        if (!gaugeEl || !trendEl || !sectorEl) {
            console.error('Chart elements not found!');
            return;
        }

        gaugeChart = echarts.init(gaugeEl);
        trendChart = echarts.init(trendEl);
        sectorChart = echarts.init(sectorEl);

        console.log('Charts initialized successfully');

        window.addEventListener('resize', () => {
            if (gaugeChart) gaugeChart.resize();
            if (trendChart) trendChart.resize();
            if (sectorChart) sectorChart.resize();
        });
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

async function fetchSentimentData() {
    try {
        const response = await fetch('http://localhost:8083/api/sentiment/social');
        const result = await response.json();

        if (result.success) {
            updateDashboard(result.data);
        }
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        // Show mock data for demo
        showMockData();
    }
}

function showMockData() {
    const mockData = {
        overall: { score: 68, status: 'Bullish' },
        platforms: {
            twitter: { score: 72, top_hashtag: '#NiftyBullish' },
            reddit: { score: 65, top_sub: 'r/IndianStreetBets' },
            news: { score: 67, top_topic: 'Q2 Earnings' }
        },
        trending_tickers: [
            { symbol: 'RELIANCE', score: 78, sentiment: 'Bullish' },
            { symbol: 'TCS', score: 65, sentiment: 'Neutral' },
            { symbol: 'INFY', score: 62, sentiment: 'Neutral' },
            { symbol: 'TATASTEEL', score: 41, sentiment: 'Bearish' },
            { symbol: 'HDFC', score: 71, sentiment: 'Bullish' },
            { symbol: 'WIPRO', score: 58, sentiment: 'Neutral' }
        ],
        history: [52, 54, 58, 61, 64, 66, 68],
        sectors: [
            { name: 'IT', score: 72 },
            { name: 'Banking', score: 68 },
            { name: 'Energy', score: 45 },
            { name: 'Auto', score: 61 },
            { name: 'Pharma', score: 55 }
        ],
        keywords: ['earnings', 'rally', 'bullish', 'economy', 'fed', 'rate', 'inflation', 'gdp', 'export', 'tech']
    };
    updateDashboard(mockData);
}

function updateDashboard(data) {
    console.log('Updating dashboard with data:', data);

    // 1. Update Gauge
    if (gaugeChart) {
        const gaugeOption = {
            series: [{
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 100,
                splitNumber: 5,
                itemStyle: {
                    color: data.overall.score > 60 ? '#22c55e' : (data.overall.score < 40 ? '#ef4444' : '#eab308')
                },
                progress: {
                    show: true,
                    width: 18
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                        color: [[1, '#333']]
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    length: 12,
                    lineStyle: {
                        width: 2,
                        color: '#666'
                    }
                },
                axisLabel: {
                    distance: 20,
                    color: '#999',
                    fontSize: 12
                },
                detail: {
                    valueAnimation: true,
                    fontSize: 32,
                    color: '#fff',
                    offsetCenter: [0, '30%']
                },
                data: [{
                    value: data.overall.score
                }]
            }]
        };
        gaugeChart.setOption(gaugeOption);
        console.log('Gauge chart updated');
    } else {
        console.error('Gauge chart not initialized');
    }

    // 2. Update Trend Chart (7-day history)
    if (trendChart) {
        const trendOption = {
            backgroundColor: 'transparent',
            grid: { top: 20, bottom: 30, left: 40, right: 20 },
            xAxis: {
                type: 'category',
                data: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999', fontSize: 10 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                splitLine: { lineStyle: { color: '#333' } },
                axisLabel: { color: '#999' }
            },
            series: [{
                data: data.history || [50, 52, 55, 59, 62, 65, data.overall.score],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#f97316', width: 3 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(249, 115, 22, 0.3)' },
                        { offset: 1, color: 'rgba(249, 115, 22, 0)' }
                    ])
                },
                emphasis: { focus: 'series' }
            }],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#666',
                textStyle: { color: '#fff' }
            }
        };
        trendChart.setOption(trendOption);
        console.log('Trend chart updated');
    } else {
        console.error('Trend chart not initialized');
    }

    // 3. Update Sector Chart
    if (sectorChart) {
        const sectorOption = {
            backgroundColor: 'transparent',
            grid: { top: 20, bottom: 40, left: 50, right: 20 },
            xAxis: {
                type: 'category',
                data: (data.sectors || []).map(s => s.name),
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999', rotate: 0 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                splitLine: { lineStyle: { color: '#333' } },
                axisLabel: { color: '#999' }
            },
            series: [{
                data: (data.sectors || []).map(s => ({
                    value: s.score,
                    itemStyle: {
                        color: s.score > 60 ? '#22c55e' : (s.score < 40 ? '#ef4444' : '#eab308')
                    }
                })),
                type: 'bar',
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'top',
                    color: '#fff',
                    fontSize: 12
                }
            }],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#666',
                textStyle: { color: '#fff' }
            }
        };
        sectorChart.setOption(sectorOption);
        console.log('Sector chart updated');
    } else {
        console.error('Sector chart not initialized');
    }

    // 4. Update Text
    const moodText = document.getElementById('moodText');
    moodText.textContent = data.overall.status;
    moodText.className = `text-2xl font-bold ${getSentimentColor(data.overall.status)}`;

    // 5. Update Platforms
    document.getElementById('twitterScore').textContent = data.platforms.twitter.score;
    document.getElementById('twitterHashtag').textContent = data.platforms.twitter.top_hashtag;

    document.getElementById('redditScore').textContent = data.platforms.reddit.score;
    document.getElementById('redditSub').textContent = data.platforms.reddit.top_sub;

    document.getElementById('newsScore').textContent = data.platforms.news.score;
    document.getElementById('newsTopic').textContent = data.platforms.news.top_topic;

    // 6. Update Keywords Cloud
    const keywordContainer = document.getElementById('keywordCloud');
    const keywords = data.keywords || ['market', 'rally', 'economy', 'stocks', 'tech', 'banking'];
    keywordContainer.innerHTML = keywords.map((keyword, i) => {
        const size = 18 - (i * 1.5);
        const opacity = 1 - (i * 0.1);
        return `
            <div class="inline-block px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 mr-2 mb-2" style="font-size: ${size}px; opacity: ${opacity}">
                <span class="text-orange-300 font-medium">${keyword}</span>
            </div>
        `;
    }).join('');

    // 7. Update Trending Tickers
    const trendingContainer = document.getElementById('trendingGrid');
    trendingContainer.innerHTML = data.trending_tickers.map(ticker => `
        <div class="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-orange-500/30 transition-all">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-lg text-orange-400">${ticker.symbol}</h3>
                <span class="px-3 py-1 rounded-full text-xs font-bold ${getSentimentColorBg(ticker.sentiment)}">
                    ${ticker.sentiment}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">Score:</span>
                <span class="text-xl font-bold ${getSentimentColor(ticker.sentiment)}">${ticker.score}</span>
            </div>
        </div>
    `).join('');
}

function getSentimentColor(sentiment) {
    if (sentiment.includes('Bullish') || sentiment.includes('Positive')) return 'text-green-400';
    if (sentiment.includes('Bearish') || sentiment.includes('Negative')) return 'text-red-400';
    return 'text-yellow-400';
}

function getSentimentColorBg(sentiment) {
    if (sentiment.includes('Bullish') || sentiment.includes('Positive')) return 'bg-green-500/20 text-green-400';
    if (sentiment.includes('Bearish') || sentiment.includes('Negative')) return 'bg-red-500/20 text-red-400';
    return 'bg-yellow-500/20 text-yellow-400';
}