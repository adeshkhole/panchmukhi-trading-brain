const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeRoutes(fastify, options) {
    fastify.post('/api/scrape', async (request, reply) => {
        const { url, selector } = request.body;

        if (!url || !selector) {
            return reply.code(400).send({ success: false, message: "URL and selector are required" });
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const elements = [];

            $(selector).each((index, element) => {
                elements.push($(element).text().trim());
            });

            return {
                success: true,
                url: url,
                selector: selector,
                count: elements.length,
                data: elements
            };

        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: "Error scraping URL",
                error: error.message
            });
        }
    });
}

module.exports = scrapeRoutes;
