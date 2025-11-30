document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initCharts();
        renderSatelliteMap();
        loadMockData();
    }, 100);
});

let weatherChart, cropTrendChart;

function initCharts() {
    try {
        weatherChart = echarts.init(document.getElementById('weatherChart'));
        cropTrendChart = echarts.init(document.getElementById('cropTrendChart'));

        console.log('ISRO charts initialized');

        window.addEventListener('resize', () => {
            if (weatherChart) weatherChart.resize();
            if (cropTrendChart) cropTrendChart.resize();
        });
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function renderSatelliteMap() {
    const map = document.getElementById('satelliteMap');

    // Add India outline (simplified)
    map.innerHTML = `
        <svg viewBox="0 0 800 600" class="absolute inset-0 w-full h-full opacity-30">
            <path d="M 200 100 L 300 80 L 400 100 L 500 120 L 550 200 L 560 300 L 540 400 L 500 480 L 400 520 L 300 500 L 250 450 L 220 350 L 200 250 Z" 
                  fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,5"/>
        </svg>
    `;

    // Add satellite orbit
    const orbit = document.createElement('div');
    orbit.className = 'satellite-orbit';
    orbit.style.width = '300px';
    orbit.style.height = '300px';
    orbit.style.left = '250px';
    orbit.style.top = '150px';
    map.appendChild(orbit);

    // Add location markers
    const locations = [
        { x: '15%', y: '30%', type: 'green', name: 'Mumbai Port', data: 'High Activity' },
        { x: '70%', y: '40%', type: 'green', name: 'Chennai Port', data: 'Medium Activity' },
        { x: '25%', y: '20%', type: 'green', name: 'Kandla Port', data: 'Normal' },
        { x: '40%', y: '50%', type: 'red', name: 'Mumbai Industrial', data: 'High Output' },
        { x: '55%', y: '35%', type: 'red', name: 'Bangalore Tech', data: 'Active' },
        { x: '45%', y: '60%', type: 'blue', name: 'ISRO Sat-7', data: 'Operational' },
        { x: '80%', y: '25%', type: 'yellow', name: 'Cyclone Watch', data: 'Bay of Bengal' }
    ];

    locations.forEach(loc => {
        const dot = document.createElement('div');
        dot.className = `pulse-dot ${loc.type}`;
        dot.style.left = loc.x;
        dot.style.top = loc.y;
        dot.title = `${loc.name}: ${loc.data}`;
        dot.addEventListener('click', () => {
            alert(`${loc.name}\nStatus: ${loc.data}`);
        });
        map.appendChild(dot);
    });
}

function loadMockData() {
    // Update Top Cards
    document.getElementById('maritimeIndex').textContent = '127.4';
    document.getElementById('maritimeTrend').textContent = '↑ 3.2% from last week';
    document.getElementById('industrialIndex').textContent = '84.6';
    document.getElementById('industrialTrend').textContent = '↑ 1.8% thermal activity';
    document.getElementById('agriIndex').textContent = '0.72';
    document.getElementById('agriTrend').textContent = '↑ Healthy crops detected';
    document.getElementById('weatherStatus').textContent = 'Cyclone Risk';
    document.getElementById('weatherDesc').textContent = 'Bay of Bengal - Low Pressure';

    // Port Data
    const ports = [
        { name: 'Mumbai (JNPT)', docked: 42, waiting: 8, activity: 'High', change: '+5' },
        { name: 'Chennai', docked: 28, waiting: 4, activity: 'Medium', change: '+2' },
        { name: 'Kandla', docked: 35, waiting: 6, activity: 'High', change: '+3' },
        { name: 'Vizag', docked: 22, waiting: 3, activity: 'Medium', change: '0' },
        { name: 'Kochi', docked: 18, waiting: 2, activity: 'Low', change: '-1' }
    ];

    const portTableBody = document.getElementById('portTableBody');
    portTableBody.innerHTML = ports.map(port => `
        <tr class="border-b border-gray-800 hover:bg-white/5 transition">
            <td class="py-2 font-medium">${port.name}</td>
            <td class="py-2 text-white">${port.docked}</td>
            <td class="py-2 text-gray-400">${port.waiting}</td>
            <td class="py-2">
                <span class="px-2 py-0.5 rounded text-xs ${getActivityColor(port.activity)}">
                    ${port.activity} <span class="text-gray-500 ml-1">(${port.change})</span>
                </span>
            </td>
        </tr>
    `).join('');

    document.getElementById('maritimeAnalysis').textContent = 'Export activity up 5% this week. Major container movement detected at Mumbai JNPT. Trade flow suggests increased manufacturing output.';

    // Industrial Zones
    const zones = [
        { name: 'Mumbai Industrial Belt', sector: 'Manufacturing', activity: 85, temp: '48°C' },
        { name: 'Bangalore Tech Parks', sector: 'IT/Electronics', activity: 72, temp: '42°C' },
        { name: 'Gujarat Refineries', sector: 'Petrochemical', activity: 92, temp: '56°C' },
        { name: 'Delhi NCR', sector: 'Mixed Industrial', activity: 68, temp: '38°C' },
        { name: 'Chennai Auto Zone', sector: 'Automotive', activity: 78, temp: '45°C' }
    ];

    const industrialList = document.getElementById('industrialList');
    industrialList.innerHTML = zones.map(zone => `
        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition">
            <div>
                <div class="font-medium text-sm">${zone.name}</div>
                <div class="text-xs text-gray-500">${zone.sector}</div>
            </div>
            <div class="flex items-center gap-3">
                <div class="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-orange-500 to-red-500" style="width: ${zone.activity}%"></div>
                </div>
                <span class="text-xs font-bold text-red-400">${zone.temp}</span>
            </div>
        </div>
    `).join('');

    document.getElementById('industrialAnalysis').textContent = 'Thermal analysis shows 12% increase in manufacturing activity. Gujarat refineries operating at peak capacity. Positive indicator for Q4 GDP.';

    // Agriculture
    const regions = [
        { state: 'Punjab', crop: 'Wheat', ndvi: '0.78', health: 'Excellent', change: '+0.05' },
        { state: 'Maharashtra', crop: 'Cotton', ndvi: '0.65', health: 'Good', change: '+0.02' },
        { state: 'UP', crop: 'Sugarcane', ndvi: '0.72', health: 'Good', change: '+0.03' },
        { state: 'Karnataka', crop: 'Rice', ndvi: '0.68', health: 'Moderate', change: '-0.01' },
        { state: 'MP', crop: 'Soybean', ndvi: '0.58', health: 'Fair', change: '-0.04' },
        { state: 'Rajasthan', crop: 'Mustard', ndvi: '0.61', health: 'Fair', change: '+0.01' }
    ];

    const agriGrid = document.getElementById('agriGrid');
    agriGrid.innerHTML = regions.map(region => `
        <div class="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-green-500/30 transition">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-green-400">${region.state}</h4>
                <span class="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">${region.crop}</span>
            </div>
            <div class="text-2xl font-bold mb-1">${region.ndvi}</div>
            <div class="text-xs text-gray-400 mb-2">NDVI - ${region.health}</div>
            <div class="text-sm border-t border-gray-700 pt-2 mt-2">
                Change: <span class="${region.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}">${region.change}</span>
            </div>
        </div>
    `).join('');

    document.getElementById('agriAnalysis').textContent = 'Overall crop health improving. Punjab wheat showing excellent NDVI scores. Monsoon impact positive in most regions. Expect strong Rabi harvest.';

    // Disaster Alerts
    const alerts = [
        { type: 'Cyclone', severity: 'Medium', location: 'Bay of Bengal', time: '2 hours ago' },
        { type: 'Drought', severity: 'Low', location: 'Central MP', time: '1 day ago' },
        { type: 'Flood Risk', severity: 'High', location: 'Kerala Coast', time: '5 hours ago' }
    ];

    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = alerts.map(alert => `
        <div class="p-3 bg-${alert.severity === 'High' ? 'red' : alert.severity === 'Medium' ? 'yellow' : 'blue'}-500/10 border border-${alert.severity === 'High' ? 'red' : alert.severity === 'Medium' ? 'yellow' : 'blue'}-500/30 rounded-lg">
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-bold text-${alert.severity === 'High' ? 'red' : alert.severity === 'Medium' ? 'yellow' : 'blue'}-400 text-sm">${alert.type}</h4>
                <span class="text-xs px-1.5 py-0.5 bg-${alert.severity === 'High' ? 'red' : alert.severity === 'Medium' ? 'yellow' : 'blue'}-500/20 rounded">${alert.severity}</span>
            </div>
            <p class="text-xs text-gray-400">${alert.location}</p>
            <p class="text-xs text-gray-600 mt-1">${alert.time}</p>
        </div>
    `).join('');

    // Render Charts
    renderWeatherChart();
    renderCropTrendChart();
}

function renderWeatherChart() {
    if (!weatherChart) return;

    const option = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: {
            data: ['Temperature', 'Rainfall', 'Humidity'],
            textStyle: { color: '#999' },
            top: 10
        },
        grid: { top: 50, bottom: 30, left: 50, right: 20 },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Temp (°C)',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            {
                type: 'value',
                name: 'Rain (mm)',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: 'Temperature',
                type: 'line',
                data: [32, 34, 33, 35, 36, 34, 33],
                smooth: true,
                lineStyle: { color: '#f97316', width: 2 },
                itemStyle: { color: '#f97316' }
            },
            {
                name: 'Rainfall',
                type: 'bar',
                yAxisIndex: 1,
                data: [5, 12, 8, 15, 22, 18, 10],
                itemStyle: { color: '#3b82f6' }
            },
            {
                name: 'Humidity',
                type: 'line',
                data: [65, 70, 68, 75, 80, 72, 68],
                smooth: true,
                lineStyle: { color: '#22c55e', width: 2, type: 'dashed' },
                itemStyle: { color: '#22c55e' }
            }
        ]
    };

    weatherChart.setOption(option);
}

function renderCropTrendChart() {
    if (!cropTrendChart) return;

    const dates = [];
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }

    const option = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: {
            data: ['Punjab (Wheat)', 'Maharashtra (Cotton)', 'UP (Sugarcane)'],
            textStyle: { color: '#999' },
            top: 10
        },
        grid: { top: 50, bottom: 30, left: 50, right: 20 },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999', interval: 4, rotate: 45 }
        },
        yAxis: {
            type: 'value',
            name: 'NDVI',
            min: 0.5,
            max: 0.85,
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' },
            splitLine: { lineStyle: { color: '#333' } }
        },
        series: [
            {
                name: 'Punjab (Wheat)',
                type: 'line',
                data: Array.from({ length: 31 }, (_, i) => (0.68 + Math.random() * 0.1).toFixed(2)),
                smooth: true,
                lineStyle: { color: '#22c55e', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
                        { offset: 1, color: 'rgba(34, 197, 94, 0)' }
                    ])
                }
            },
            {
                name: 'Maharashtra (Cotton)',
                type: 'line',
                data: Array.from({ length: 31 }, (_, i) => (0.60 + Math.random() * 0.08).toFixed(2)),
                smooth: true,
                lineStyle: { color: '#f97316', width: 2 }
            },
            {
                name: 'UP (Sugarcane)',
                type: 'line',
                data: Array.from({ length: 31 }, (_, i) => (0.65 + Math.random() * 0.09).toFixed(2)),
                smooth: true,
                lineStyle: { color: '#3b82f6', width: 2 }
            }
        ]
    };

    cropTrendChart.setOption(option);
}

function getActivityColor(activity) {
    switch (activity) {
        case 'High': return 'bg-green-500/20 text-green-400';
        case 'Medium': return 'bg-blue-500/20 text-blue-400';
        case 'Low': return 'bg-gray-500/20 text-gray-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
}
