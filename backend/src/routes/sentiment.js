async function sentimentRoutes(fastify, options) {
    fastify.get('/api/sentiment/social', async (request, reply) => {
        // Mock Social Sentiment Data
        const sentimentData = {
            overall: {
                score: 65, // 0-100
                status: "Bullish",
                trend: "Upward"
            },
            platforms: {
                twitter: { score: 70, mentions: 15000, top_hashtag: "#Nifty50" },
                reddit: { score: 60, mentions: 5000, top_sub: "r/IndianStreetBets" },
                news: { score: 65, mentions: 8000, top_topic: "Earnings" }
            },
            trending_tickers: [
                { symbol: "TATAELXSI", sentiment: "Very Bullish", score: 85 },
                { symbol: "HDFCBANK", sentiment: "Neutral", score: 50 },
                { symbol: "PAYTM", sentiment: "Bearish", score: 30 }
            ]
        };

        return {
            success: true,
            data: sentimentData
        };
    });
}

module.exports = sentimentRoutes;
