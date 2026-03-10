const csvLoader = require('../config/csvLoader');
const strategyModel = require('../models/strategyModel');
const predictionModel = require('../models/predictionModel');
const ollamaService = require('../services/ollamaService');
const chromaService = require('../services/chromaService');


// POST /api/strategy/:id  — generate LLM strategy for a customer
const generateStrategy = async (req, res) => {
    try {
        const customer = csvLoader.getCustomerById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const prediction = await predictionModel.getLatestPrediction(req.params.id);
        const risk_level = prediction
            ? prediction.risk_level
            : parseFloat(customer.churn_probability_true) >= 0.7 ? 'High'
                : parseFloat(customer.churn_probability_true) >= 0.4 ? 'Medium' : 'Low';

        const churn_prob = prediction
            ? (prediction.churn_prob * 100).toFixed(1)
            : (parseFloat(customer.churn_probability_true) * 100).toFixed(1);

        // Get similar churned customers for RAG context
        let ragContext = 'No similar customers found.';
        try {
            const similar = await chromaService.querySimilar(req.params.id, 3);
            if (similar && similar.length > 0) {
                ragContext = similar
                    .map((s, i) => `${i + 1}. ${s.description}`)
                    .join('\n');
            }
        } catch (_) {
            // ChromaDB optional — don't fail if not running
        }

        const strategy_text = await ollamaService.generateStrategy({
            customer,
            risk_level,
            churn_prob,
            ragContext,
        });

        const id = await strategyModel.saveStrategy({
            customer_id: customer.customer_id,
            strategy_text,
            risk_level,
        });

        res.json({ id, customer_id: customer.customer_id, risk_level, strategy_text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/strategy/:id  — get saved strategy
const getStrategy = async (req, res) => {
    try {
        const strategy = await strategyModel.getLatestStrategy(req.params.id);
        if (!strategy) return res.status(404).json({ error: 'No strategy found' });
        res.json(strategy);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { generateStrategy, getStrategy };
