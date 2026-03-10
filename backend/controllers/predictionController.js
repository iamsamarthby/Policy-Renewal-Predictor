const csvLoader = require('../config/csvLoader');
const predictionModel = require('../models/predictionModel');
const mlService = require('../services/mlService');

// POST /api/predict/:id  — run ML prediction for one customer
const predictCustomer = async (req, res) => {
    try {
        const customer = csvLoader.getCustomerById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const result = await mlService.predict(customer);

        const risk_level =
            result.churn_probability >= 0.7 ? 'High' :
                result.churn_probability >= 0.4 ? 'Medium' : 'Low';

        const id = await predictionModel.savePrediction({
            customer_id: customer.customer_id,
            churn_prob: result.churn_probability,
            churn_flag: result.churn_flag,
            risk_level,
        });

        // Update in-memory data so Analytics Dashboard reflects this new prediction
        csvLoader.updateCustomer(customer.customer_id, {
            churn_probability_true: result.churn_probability,
            churn_flag: result.churn_flag
        });

        res.json({ id, customer_id: customer.customer_id, churn_probability: result.churn_probability, churn_flag: result.churn_flag, risk_level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/predictions/:id  — get latest prediction for a customer
const getCustomerPrediction = async (req, res) => {
    try {
        const prediction = await predictionModel.getLatestPrediction(req.params.id);
        if (!prediction) return res.status(404).json({ error: 'No prediction found' });
        res.json(prediction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/predictions  — list all predictions
const getAllPredictions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await predictionModel.getAllPredictions(page, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { predictCustomer, getCustomerPrediction, getAllPredictions };
