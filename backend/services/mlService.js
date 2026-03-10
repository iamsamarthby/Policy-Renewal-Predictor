const axios = require('axios');
require('dotenv').config();

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Call the Python Flask ML service to predict churn for a customer.
 * Falls back to using the CSV's churn_probability_true if ML service is offline.
 */
async function predict(customer) {
    try {
        const response = await axios.post(`${ML_URL}/predict`, { customer }, { timeout: 15000 });
        return response.data;
    } catch (err) {
        console.warn('[mlService] ML service unavailable, using CSV probability as fallback.');
        // Graceful fallback: use the dataset's own probability
        const prob = parseFloat(customer.churn_probability_true) || 0;
        return {
            churn_probability: prob,
            churn_flag: prob >= 0.5 ? 1 : 0,
        };
    }
}

module.exports = { predict };
