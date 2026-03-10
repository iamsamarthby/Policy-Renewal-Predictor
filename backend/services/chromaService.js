const axios = require('axios');
require('dotenv').config();

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Query the ML service for similar customers to the given customer_id using local ChromaDB.
 * Returns an array of { id, description } objects.
 */
async function querySimilar(customer_id, n_results = 3) {
    try {
        const response = await axios.get(
            `${ML_URL}/similar/${customer_id}?n=${n_results}`,
            { timeout: 10000 }
        );

        return response.data;
    } catch (err) {
        console.warn('[chromaService] ChromaDB not available:', err.message);
        return [];
    }
}

module.exports = { querySimilar };
