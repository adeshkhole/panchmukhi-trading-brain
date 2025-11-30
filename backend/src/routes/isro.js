async function isroRoutes(fastify, options) {
    // Mock ISRO Data
    const launches = [
        {
            id: "L001",
            mission: "Gaganyaan-1",
            vehicle: "LVM3",
            date: "2024-12-25",
            status: "Scheduled",
            description: "First uncrewed mission of Gaganyaan program"
        },
        { mission: "Gaganyaan-1", vehicle: "LVM3", date: "Q1 2025", status: "Scheduled" },
        { mission: "NISAR", vehicle: "GSLV", date: "Q1 2025", status: "Scheduled" },
        { mission: "Mangalyaan-2", vehicle: "LVM3", date: "2026", status: "Planned" }
    ];

    const satellites = [
        { name: "Chandrayaan-3", orbit: "Lunar", health: "Good", status: "Active" },
        { name: "Aditya-L1", orbit: "L1 Point", health: "Good", status: "Active" },
        { name: "Cartosat-3", orbit: "LEO", health: "Good", status: "Active" }
    ];

    const maritimeData = {
        index: 127.4,
        trend: "+8.3% from last week",
        ports: [
            { name: "Mumbai JNPT", docked: 42, waiting: 12, activity: "High", change: "+15%" },
            { name: "Chennai", docked: 28, waiting: 7, activity: "Medium", change: "+5%" },
            { name: "Kandla", docked: 35, waiting: 9, activity: "High", change: "+12%" },
            { name: "Visakhapatnam", docked: 31, waiting: 5, activity: "Medium", change: "+3%" },
            { name: "Cochin", docked: 22, waiting: 4, activity: "Low", change: "-2%" }
        ],
        analysis: "Port congestion trending upward. JNPT showing strong import activity. Recommend monitoring logistics stocks (CONCOR, Adani Ports)."
    };

    const industrialData = {
        index: 134.2,
        trend: "+6.1% from last month",
        zones: [
            { name: "Gujarat Industrial Belt", activity: 92, temp: "High", sector: "Manufacturing", status: "Active" },
            { name: "Tamil Nadu Corridor", activity: 85, temp: "High", sector: "Auto/Tech", status: "Active" },
            { name: "Maharashtra (Pune)", activity: 78, temp: "Medium", sector: "IT/Auto", status: "Moderate" },
            { name: "Karnataka (Bangalore)", activity: 88, temp: "High", sector: "Tech", status: "Active" },
            { name: "Haryana NCR", activity: 71, temp: "Medium", sector: "Manufacturing", status: "Moderate" }
        ],
        analysis: "Manufacturing activity strong in western regions. Tech sector showing thermal intensity increase. Watch: Tata Motors, L&T, Infosys."
    };

    const agricultureData = {
        index: 0.68,
        trend: "+0.12 NDVI improvement",
        regions: [
            { state: "Punjab", health: "Excellent", ndvi: 0.82, crop: "Wheat", change: "+8%" },
            { state: "Maharashtra", health: "Good", ndvi: 0.71, crop: "Cotton/Sugarcane", change: "+5%" },
            { state: "Uttar Pradesh", health: "Good", ndvi: 0.69, crop: "Rice", change: "+3%" },
            { state: "Madhya Pradesh", health: "Fair", ndvi: 0.58, crop: "Soybean", change: "-2%" },
            { state: "Karnataka", health: "Good", ndvi: 0.72, crop: "Coffee/Pulses", change: "+6%" }
        ],
        analysis: "Rabi crop conditions favorable. Good monsoon residual effect visible. Positive outlook for: ITC, Godrej Agrovet, Rallis India."
    };

    const predictions = [
        { stock: "Adani Ports", signal: "BUY", reason: "Maritime traffic surge", confidence: "87%", source: "Maritime Data" },
        { stock: "L&T", signal: "BUY", reason: "Industrial activity peak", confidence: "82%", source: "Industrial Thermal" },
        { stock: "ITC", signal: "HOLD", reason: "Stable agri outlook", confidence: "75%", source: "NDVI Analysis" },
        { stock: "Tata Motors", signal: "BUY", reason: "Auto belt high activity", confidence: "79%", source: "Industrial Zones" }
    ];

    fastify.get('/api/isro/launches', async (request, reply) => {
        return {
            success: true,
            data: launches
        };
    });

    fastify.get('/api/isro/satellite-status', async (request, reply) => {
        return {
            success: true,
            data: satellites
        };
    });

    fastify.get('/api/isro/maritime', async (request, reply) => {
        return {
            success: true,
            data: maritimeData
        };
    });

    fastify.get('/api/isro/industrial', async (request, reply) => {
        return {
            success: true,
            data: industrialData
        };
    });

    fastify.get('/api/isro/agriculture', async (request, reply) => {
        return {
            success: true,
            data: agricultureData
        };
    });

    fastify.get('/api/isro/predictions', async (request, reply) => {
        return {
            success: true,
            data: predictions
        };
    });
}

module.exports = isroRoutes;
