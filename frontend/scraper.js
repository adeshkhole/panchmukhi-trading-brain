// Load tracked items on start
document.addEventListener('DOMContentLoaded', loadTracker);

document.getElementById('scrapeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('urlInput').value;
    const selector = document.getElementById('selectorInput').value;
    const container = document.getElementById('resultsContainer');
    const countLabel = document.getElementById('resultCount');
    const statsPanel = document.getElementById('analysisStats');

    // Reset UI
    statsPanel.classList.add('hidden');
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-orange-400 space-y-4">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            <p>Extracting & Analyzing data...</p>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:8083/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, selector })
        });

        const result = await response.json();

        if (result.success) {
            countLabel.textContent = result.count;

            // Perform Analysis
            analyzeResults(result.data);

            if (result.data.length > 0) {
                container.innerHTML = `
                    <div class="space-y-2">
                        ${result.data.map((item, index) => `
                            <div class="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors flex gap-3 group">
                                <span class="text-gray-500 font-mono text-sm min-w-[24px]">${index + 1}.</span>
                                <span class="text-gray-200 text-sm break-all group-hover:text-white transition-colors">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>No data found for selector "${selector}"</p>
                    </div>
                `;
            }
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error('Scraping error:', error);
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-red-400 space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>Error: ${error.message}</p>
                <span class="text-xs text-gray-500">Check if backend is running on port 8083</span>
            </div>
        `;
    }
});

function analyzeResults(data) {
    const statsPanel = document.getElementById('analysisStats');
    statsPanel.classList.remove('hidden');

    // 1. Numeric Analysis
    const numbers = data
        .map(text => parseFloat(text.replace(/[^0-9.-]+/g, "")))
        .filter(num => !isNaN(num));

    if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = (sum / numbers.length).toFixed(2);
        const max = Math.max(...numbers).toFixed(2);

        document.getElementById('statNumeric').textContent = numbers.length;
        document.getElementById('statAvg').textContent = avg;
        document.getElementById('statMax').textContent = max;
    } else {
        document.getElementById('statNumeric').textContent = '0';
        document.getElementById('statAvg').textContent = '-';
        document.getElementById('statMax').textContent = '-';
    }

    // 2. Sentiment & Keyword Analysis
    const fullText = data.join(' ').toLowerCase();

    // Sentiment
    const positiveWords = ['gain', 'rise', 'up', 'profit', 'bull', 'growth', 'high', 'surge', 'jump', 'rally'];
    const negativeWords = ['loss', 'fall', 'down', 'crash', 'bear', 'drop', 'low', 'decline', 'slump', 'weak'];

    let score = 0;
    positiveWords.forEach(w => { if (fullText.includes(w)) score++; });
    negativeWords.forEach(w => { if (fullText.includes(w)) score--; });

    const sentimentEl = document.getElementById('sentimentIndicator');
    if (score > 0) {
        sentimentEl.innerHTML = '<div class="w-3 h-3 rounded-full bg-green-500"></div><span class="text-green-400 font-medium">Bullish / Positive</span>';
    } else if (score < 0) {
        sentimentEl.innerHTML = '<div class="w-3 h-3 rounded-full bg-red-500"></div><span class="text-red-400 font-medium">Bearish / Negative</span>';
    } else {
        sentimentEl.innerHTML = '<div class="w-3 h-3 rounded-full bg-gray-500"></div><span class="text-gray-400 font-medium">Neutral</span>';
    }

    // Key Insights (Simple Keyword Extraction)
    const keywords = ['gold', 'nifty', 'sensex', 'dollar', 'inflation', 'rbi', 'fed', 'rate', 'gdp', 'export', 'import', 'crop', 'monsoon', 'ai', 'tech'];
    const foundKeywords = keywords.filter(k => fullText.includes(k));

    const insightsEl = document.getElementById('keyInsights');
    if (foundKeywords.length > 0) {
        insightsEl.innerHTML = foundKeywords.map(k =>
            `<span class="px-2 py-1 rounded bg-white/10 text-xs text-orange-300 capitalize">${k}</span>`
        ).join('');
    } else {
        insightsEl.innerHTML = '<span class="text-xs text-gray-500 italic">No specific keywords found</span>';
    }
    // 3. Visualization (Simple Line Chart using ECharts if available, else simple bars)
    if (numbers.length > 1 && window.echarts) {
        document.getElementById('chartContainer').classList.remove('hidden');
        const chart = echarts.init(document.getElementById('chartContainer'));
        chart.setOption({
            backgroundColor: 'transparent',
            grid: { top: 10, bottom: 20, left: 30, right: 10 },
            xAxis: { type: 'category', data: numbers.map((_, i) => i + 1), show: false },
            yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: '#666' } },
            series: [{
                data: numbers,
                type: 'line',
                smooth: true,
                lineStyle: { color: '#f97316', width: 2 },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(249, 115, 22, 0.3)' }, { offset: 1, color: 'rgba(249, 115, 22, 0)' }]) }
            }]
        });
        window.addEventListener('resize', () => chart.resize());
    }
}

function addToTracker() {
    const url = document.getElementById('urlInput').value;
    const selector = document.getElementById('selectorInput').value;
    const sector = document.getElementById('sectorInput').value;

    if (!url || !selector) {
        alert('Please enter URL and Selector first');
        return;
    }

    const trackerItem = {
        id: Date.now(),
        name: sector, // Using Sector as the name/category
        url,
        selector,
        date: new Date().toLocaleDateString()
    };

    let tracked = JSON.parse(localStorage.getItem('scraperTracker') || '[]');
    tracked.push(trackerItem);
    localStorage.setItem('scraperTracker', JSON.stringify(tracked));

    loadTracker();
}

function loadTracker() {
    const tracked = JSON.parse(localStorage.getItem('scraperTracker') || '[]');
    const container = document.getElementById('savedConfigs');
    document.getElementById('trackerCount').textContent = `${tracked.length} Active`;

    if (tracked.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-4 text-sm">No tracked projects yet.</div>';
        return;
    }

    container.innerHTML = tracked.map(item => `
        <div class="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-orange-500/30 cursor-pointer transition-colors group relative" onclick="loadConfig('${item.url}', '${item.selector}', '${item.name}')">
            <div class="flex justify-between items-start">
                <div class="overflow-hidden w-full">
                    <div class="flex justify-between items-center mb-1">
                        <div class="font-bold text-sm text-orange-400 truncate">${item.name}</div>
                        <div class="text-[10px] text-gray-600">${item.date}</div>
                    </div>
                    <div class="text-xs text-gray-400 truncate mb-0.5">${new URL(item.url).hostname}</div>
                    <div class="text-[10px] text-gray-600 font-mono truncate bg-black/20 p-1 rounded">${item.selector}</div>
                </div>
                <button onclick="event.stopPropagation(); deleteTracker(${item.id})" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 bg-black/50 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function loadConfig(url, selector, sector) {
    document.getElementById('urlInput').value = url;
    document.getElementById('selectorInput').value = selector;
    if (sector) document.getElementById('sectorInput').value = sector;
}

const PRESETS = {
    // Market Data
    'gold': { url: 'https://www.moneycontrol.com/commodity/gold-price.html', selector: '.FL', sector: 'Gold' },
    'bitcoin': { url: 'https://coinmarketcap.com/currencies/bitcoin/', selector: '.priceValue', sector: 'Crypto' },
    'nifty': { url: 'https://www.moneycontrol.com/indian-indices/nifty-50-9.html', selector: '.indimention', sector: 'Stocks' },
    'forex': { url: 'https://www.investing.com/currencies/usd-inr', selector: '[data-test="instrument-price-last"]', sector: 'Forex' },
    'trade': { url: 'https://www.zaubacorp.com/', selector: 'table', sector: 'General' },
    'commodities': { url: 'https://www.mcxindia.com/market-data/market-watch', selector: '#tblMarketWatch', sector: 'Gold' },

    // News Intelligence
    'gold_news': { url: 'https://www.moneycontrol.com/news/tags/gold.html', selector: 'h2 a', sector: 'Gold' },
    'agri_news': { url: 'https://economictimes.indiatimes.com/news/economy/agriculture', selector: 'h3 a', sector: 'Agriculture' },
    'ai_news': { url: 'https://techcrunch.com/category/artificial-intelligence/', selector: 'h2 a', sector: 'AI' },
    'market_news': { url: 'https://economictimes.indiatimes.com/markets', selector: 'h3 a', sector: 'Stocks' }
};

function loadPreset(type) {
    const preset = PRESETS[type];
    if (preset) {
        document.getElementById('urlInput').value = preset.url;
        document.getElementById('selectorInput').value = preset.selector;
        document.getElementById('sectorInput').value = preset.sector;
    }
}

function switchTab(tab) {
    // Hide all contents
    document.getElementById('content-market').classList.add('hidden');
    document.getElementById('content-news').classList.add('hidden');

    // Reset tab styles
    document.getElementById('tab-market').className = "px-4 py-2 text-sm text-gray-400 hover:text-gray-200";
    document.getElementById('tab-news').className = "px-4 py-2 text-sm text-gray-400 hover:text-gray-200";

    // Show selected content & active tab style
    document.getElementById(`content-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = "px-4 py-2 text-sm text-orange-400 border-b-2 border-orange-400 font-medium";
}

function deleteTracker(id) {
    let tracked = JSON.parse(localStorage.getItem('scraperTracker') || '[]');
    tracked = tracked.filter(item => item.id !== id);
    localStorage.setItem('scraperTracker', JSON.stringify(tracked));
    loadTracker();
}

function exportToCSV() {
    const data = Array.from(document.querySelectorAll('#resultsContainer .group span.text-gray-200')).map(span => span.textContent);
    if (data.length === 0) { alert('No data to export'); return; }

    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => `"${e.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scraped_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToJSON() {
    const data = Array.from(document.querySelectorAll('#resultsContainer .group span.text-gray-200')).map(span => span.textContent);
    if (data.length === 0) { alert('No data to export'); return; }

    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", `scraped_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
