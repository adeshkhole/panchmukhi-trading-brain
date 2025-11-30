document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initCharts();
        calculateGreeks(); // Calculate with default values
        loadMockData();
    }, 100);
});

let oiChart, pcrChart, thetaChart, heatmapChart;

function initCharts() {
    try {
        oiChart = echarts.init(document.getElementById('oiChart'));
        pcrChart = echarts.init(document.getElementById('pcrChart'));
        thetaChart = echarts.init(document.getElementById('thetaChart'));
        heatmapChart = echarts.init(document.getElementById('greeksHeatmap'));

        console.log('Options charts initialized');

        window.addEventListener('resize', () => {
            if (oiChart) oiChart.resize();
            if (pcrChart) pcrChart.resize();
            if (thetaChart) thetaChart.resize();
            if (heatmapChart) heatmapChart.resize();
        });
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Black-Scholes Model Implementation
function normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
}

function normalPDF(x) {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

function calculateGreeks() {
    const S = parseFloat(document.getElementById('spotPrice').value);
    const K = parseFloat(document.getElementById('strikePrice').value);
    const T = parseFloat(document.getElementById('daysToExpiry').value) / 365;
    const sigma = parseFloat(document.getElementById('volatility').value) / 100;
    const r = parseFloat(document.getElementById('riskFreeRate').value) / 100;
    const type = document.getElementById('optionType').value;

    // Calculate d1 and d2
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Calculate Greeks
    let delta, gamma, theta, vega, rho;

    if (type === 'call') {
        delta = normalCDF(d1);
        theta = (-S * normalPDF(d1) * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365;
        rho = K * T * Math.exp(-r * T) * normalCDF(d2) / 100;
    } else {
        delta = normalCDF(d1) - 1;
        theta = (-S * normalPDF(d1) * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
        rho = -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
    }

    gamma = normalPDF(d1) / (S * sigma * Math.sqrt(T));
    vega = S * normalPDF(d1) * Math.sqrt(T) / 100;

    // Update display
    document.getElementById('deltaValue').textContent = delta.toFixed(3);
    document.getElementById('gammaValue').textContent = gamma.toFixed(4);
    document.getElementById('thetaValue').textContent = theta.toFixed(2);
    document.getElementById('vegaValue').textContent = vega.toFixed(2);
    document.getElementById('rhoValue').textContent = rho.toFixed(2);

    // Color code based on values
    document.getElementById('deltaValue').className = `text-3xl font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`;
    document.getElementById('thetaValue').className = `text-3xl font-bold text-red-400`;

    // Update Theta decay chart
    renderThetaChart();
    renderGreeksHeatmap();
    updateStrategies(delta, theta, vega);
}

function renderThetaChart() {
    const days = [];
    const thetaValues = [];
    const S = parseFloat(document.getElementById('spotPrice').value);
    const K = parseFloat(document.getElementById('strikePrice').value);
    const sigma = parseFloat(document.getElementById('volatility').value) / 100;
    const r = parseFloat(document.getElementById('riskFreeRate').value) / 100;

    // Calculate theta for next 30 days
    for (let day = 30; day >= 0; day--) {
        days.push(30 - day);
        const T = day / 365;
        if (T > 0) {
            const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
            const theta = (-S * normalPDF(d1) * sigma / (2 * Math.sqrt(T))) / 365;
            thetaValues.push(Math.abs(theta));
        } else {
            thetaValues.push(0);
        }
    }

    const option = {
        backgroundColor: 'transparent',
        grid: { top: 30, bottom: 50, left: 50, right: 20 },
        xAxis: {
            type: 'category',
            data: days,
            name: 'Days to Expiry',
            nameLocation: 'middle',
            nameGap: 30,
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' }
        },
        yAxis: {
            type: 'value',
            name: 'Theta (Daily Decay)',
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' },
            splitLine: { lineStyle: { color: '#333' } }
        },
        series: [{
            data: thetaValues,
            type: 'line',
            smooth: true,
            lineStyle: { color: '#ef4444', width: 3 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(239, 68, 68, 0.4)' },
                    { offset: 1, color: 'rgba(239, 68, 68, 0)' }
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

    if (thetaChart) {
        thetaChart.setOption(option);
    }
}

function renderGreeksHeatmap() {
    const strikes = [];
    const volatilities = [];
    const data = [];

    const currentStrike = parseFloat(document.getElementById('strikePrice').value);

    // Generate strike range
    for (let i = -10; i <= 10; i++) {
        strikes.push((currentStrike + i * 100).toString());
    }

    // Generate volatility range
    for (let v = 10; v <= 30; v += 2) {
        volatilities.push(v + '%');
    }

    // Calculate delta for heatmap
    const S = parseFloat(document.getElementById('spotPrice').value);
    const T = parseFloat(document.getElementById('daysToExpiry').value) / 365;
    const r = parseFloat(document.getElementById('riskFreeRate').value) / 100;

    volatilities.forEach((vol, i) => {
        strikes.forEach((strike, j) => {
            const sigma = parseInt(vol) / 100;
            const K = parseFloat(strike);
            const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
            const delta = normalCDF(d1);
            data.push([j, i, delta.toFixed(3)]);
        });
    });

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            position: 'top',
            formatter: (params) => {
                return `Strike: ${strikes[params.value[0]]}<br/>Vol: ${volatilities[params.value[1]]}<br/>Delta: ${params.value[2]}`;
            }
        },
        grid: {
            height: '70%',
            top: '10%',
            left: 80,
            right: 20
        },
        xAxis: {
            type: 'category',
            data: strikes,
            splitArea: { show: true },
            axisLabel: { color: '#999', interval: 2, rotate: 45 }
        },
        yAxis: {
            type: 'category',
            data: volatilities,
            splitArea: { show: true },
            axisLabel: { color: '#999' }
        },
        visualMap: {
            min: 0,
            max: 1,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '5%',
            textStyle: { color: '#fff' },
            inRange: {
                color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
        },
        series: [{
            name: 'Delta',
            type: 'heatmap',
            data: data,
            label: {
                show: false
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    if (heatmapChart) {
        heatmapChart.setOption(option);
    }
}

function updateStrategies(delta, theta, vega) {
    const strategies = [];

    if (Math.abs(delta) > 0.6) {
        strategies.push({
            name: 'Delta Hedging',
            description: 'High delta suggests directional risk. Consider hedging.',
            color: 'blue'
        });
    }

    if (Math.abs(theta) > 10) {
        strategies.push({
            name: 'Theta Decay',
            description: 'Significant time decay. Monitor position closely.',
            color: 'red'
        });
    }

    if (vega > 50) {
        strategies.push({
            name: 'Volatility Play',
            description: 'High vega exposure. Consider vol strategies.',
            color: 'purple'
        });
    }

    const container = document.getElementById('strategyCards');
    container.innerHTML = strategies.map(s => `
        <div class="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-${s.color}-500/50 transition-all">
            <h3 class="font-bold text-${s.color}-400 mb-2">${s.name}</h3>
            <p class="text-sm text-gray-400">${s.description}</p>
        </div>
    `).join('') || '<div class="col-span-3 text-center text-gray-500 py-8">No specific strategies recommended with current parameters</div>';
}

function loadMockData() {
    // Mock OI Chart
    const strikes = ['19000', '19100', '19200', '19300', '19400', '19500', '19600', '19700', '19800', '19900', '20000'];
    const ceOI = [15000, 18000, 25000, 35000, 48000, 62000, 45000, 32000, 22000, 15000, 10000];
    const peOI = [8000, 12000, 18000, 28000, 42000, 58000, 68000, 52000, 38000, 25000, 18000];

    if (oiChart) {
        oiChart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: {
                data: ['Call OI', 'Put OI'],
                textStyle: { color: '#ccc' },
                top: 10
            },
            grid: { top: 50, bottom: 30, left: 60, right: 20 },
            xAxis: {
                type: 'category',
                data: strikes,
                axisLabel: { color: '#999', rotate: 45 },
                axisLine: { lineStyle: { color: '#666' } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#999' },
                splitLine: { lineStyle: { color: '#333' } },
                axisLine: { lineStyle: { color: '#666' } }
            },
            series: [
                {
                    name: 'Call OI',
                    type: 'bar',
                    data: ceOI,
                    itemStyle: { color: '#22c55e' }
                },
                {
                    name: 'Put OI',
                    type: 'bar',
                    data: peOI,
                    itemStyle: { color: '#ef4444' }
                }
            ]
        });
    }

    // Mock PCR Trend
    if (pcrChart) {
        pcrChart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { top: 30, bottom: 50, left: 50, right: 20 },
            xAxis: {
                type: 'category',
                data: ['09:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30'],
                axisLabel: { color: '#999' },
                axisLine: { lineStyle: { color: '#666' } }
            },
            yAxis: {
                type: 'value',
                name: 'PCR',
                axisLabel: { color: '#999' },
                splitLine: { lineStyle: { color: '#333' } },
                axisLine: { lineStyle: { color: '#666' } }
            },
            series: [{
                data: [0.8, 0.85, 0.9, 1.0, 1.05, 1.15, 1.25, 1.30],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#f97316', width: 3 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(249, 115, 22, 0.4)' },
                        { offset: 1, color: 'rgba(249, 115, 22, 0)' }
                    ])
                },
                markLine: {
                    data: [{ yAxis: 1.0, label: { formatter: 'Neutral (1.0)' } }],
                    lineStyle: { color: '#999', type: 'dashed' }
                }
            }]
        });
    }
}
