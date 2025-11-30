async function optionsRoutes(fastify, options) {
    fastify.get('/api/options/flow', async (request, reply) => {
        // Mock Options Flow Data
        const flowData = [
            { symbol: "NIFTY", type: "CE", strike: 21500, expiry: "28-Dec", premium: 120, change: 15, oi: 1500000, volume: 5000000, sentiment: "Bullish" },
            { symbol: "NIFTY", type: "PE", strike: 21400, expiry: "28-Dec", premium: 85, change: -10, oi: 2000000, volume: 4500000, sentiment: "Bearish" },
            { symbol: "BANKNIFTY", type: "CE", strike: 48000, expiry: "28-Dec", premium: 350, change: 45, oi: 800000, volume: 2500000, sentiment: "Bullish" },
            { symbol: "BANKNIFTY", type: "PE", strike: 47500, expiry: "28-Dec", premium: 210, change: -25, oi: 1200000, volume: 3000000, sentiment: "Neutral" }
        ];

        return {
            success: true,
            data: flowData
        };
    });

    fastify.get('/api/options/chain', async (request, reply) => {
        // Simplified Mock Option Chain
        const chain = {
            symbol: "NIFTY",
            spotPrice: 21450,
            strikes: [
                { strike: 21400, ce_oi: 50000, pe_oi: 150000, ce_price: 180, pe_price: 85 },
                { strike: 21450, ce_oi: 80000, pe_oi: 80000, ce_price: 150, pe_price: 110 },
                { strike: 21500, ce_oi: 160000, pe_oi: 40000, ce_price: 120, pe_price: 145 }
            ]
        };

        return {
            success: true,
            data: chain
        };
    });
}

module.exports = optionsRoutes;
