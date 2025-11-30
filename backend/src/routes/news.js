const axios = require('axios');

async function newsRoutes(fastify, options) {
    // Mock data for news from various Indian sources
    const mockNews = [
        {
            id: 1,
            title: "ISRO to launch new satellite next month",
            source: "NDTV",
            language: "en",
            url: "https://www.ndtv.com",
            timestamp: new Date().toISOString(),
            sentiment: "positive"
        },
        {
            id: 2,
            title: "शेअर बाजारात आज मोठी घसरण",
            source: "ABP Majha",
            language: "mr",
            url: "https://marathi.abplive.com",
            timestamp: new Date().toISOString(),
            sentiment: "negative"
        },
        {
            id: 3,
            title: "बाजार में तेजी के संकेत",
            source: "Aaj Tak",
            language: "hi",
            url: "https://www.aajtak.in",
            timestamp: new Date().toISOString(),
            sentiment: "positive"
        },
        {
            id: 4,
            title: "TCS announces quarterly results",
            source: "MoneyControl",
            language: "en",
            url: "https://www.moneycontrol.com",
            timestamp: new Date().toISOString(),
            sentiment: "neutral"
        },
        {
            id: 5,
            title: "पुण्यात पावसाची शक्यता",
            source: "Lokmat",
            language: "mr",
            url: "https://www.lokmat.com",
            timestamp: new Date().toISOString(),
            sentiment: "neutral"
        }
    ];

    fastify.get('/api/news/aggregator', async (request, reply) => {
        const { language, source } = request.query;

        let filteredNews = mockNews;

        if (language) {
            filteredNews = filteredNews.filter(item => item.language === language);
        }

        if (source) {
            filteredNews = filteredNews.filter(item => item.source.toLowerCase().includes(source.toLowerCase()));
        }

        return {
            success: true,
            count: filteredNews.length,
            data: filteredNews
        };
    });
}

module.exports = newsRoutes;
