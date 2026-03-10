const csvLoader = require('../config/csvLoader');
const predictionModel = require('../models/predictionModel');

// GET /api/customers?page=1&limit=20&policy_type=Auto&region_name=Auckland&risk_level=High
const getCustomers = (req, res) => {
    try {
        const { page = 1, limit = 20, policy_type, region_name, risk_level, churn_flag } = req.query;
        const result = csvLoader.getCustomersPaginated(Number(page), Number(limit), {
            policy_type,
            region_name,
            risk_level,
            churn_flag,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/customers/search?q=Auckland
const searchCustomers = (req, res) => {
    try {
        const { q = '' } = req.query;
        const results = csvLoader.searchCustomers(q).slice(0, 50);
        res.json({ results, total: results.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/customers/:id
const getCustomerById = async (req, res) => {
    try {
        const customer = csvLoader.getCustomerById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        // Also attach their latest prediction from DB (if any)
        const prediction = await predictionModel.getLatestPrediction(req.params.id);
        res.json({ ...customer, latestPrediction: prediction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/customers
const createCustomer = (req, res) => {
    try {
        const body = req.body || {};
        // The frontend will send the most important fields.
        // We ensure all 33 ML features are present by defaulting missing ones to 0 or 'Unknown'
        const newRecord = {
            age: Number(body.age) || 30,
            customer_tenure_months: Number(body.customer_tenure_months) || 12,
            policy_type: body.policy_type || 'Auto',
            region_name: body.region_name || 'Urban',
            premium_change_pct: Number(body.premium_change_pct) || 0,
            current_premium: Number(body.current_premium) || 1000,
            num_claims_12m: Number(body.num_claims_12m) || 0,
            late_payment_count_12m: Number(body.late_payment_count_12m) || 0,

            // secondary fields
            autopay_enabled: body.autopay_enabled ? 1 : 0,
            complaint_flag: body.complaint_flag ? 1 : 0,
            quote_requested_flag: body.quote_requested_flag ? 1 : 0,
            multi_policy_flag: body.multi_policy_flag ? 1 : 0,

            // default rest
            num_policies: Number(body.num_policies) || 1,
            premium_last_year: Number(body.premium_last_year) || Number(body.current_premium) || 1000,
            num_price_increases_last_3y: Number(body.num_price_increases_last_3y) || 0,
            premium_to_coverage_ratio: Number(body.premium_to_coverage_ratio) || 0.1,
            missed_payment_flag: 0,
            payment_method_change_flag: 0,
            num_approved_claims_12m: Number(body.num_approved_claims_12m) || 0,
            num_rejected_claims_12m: Number(body.num_rejected_claims_12m) || 0,
            num_pending_claims_12m: Number(body.num_pending_claims_12m) || 0,
            avg_claim_amount: Number(body.avg_claim_amount) || 0,
            total_claim_amount_12m: Number(body.total_claim_amount_12m) || 0,
            total_payout_amount_12m: Number(body.total_payout_amount_12m) || 0,
            payout_ratio_12m: Number(body.payout_ratio_12m) || 0,
            avg_settlement_time_days: Number(body.avg_settlement_time_days) || 0,
            days_since_last_claim: Number(body.days_since_last_claim) || 365,
            num_contacts_12m: Number(body.num_contacts_12m) || 0,
            complaint_resolution_days: Number(body.complaint_resolution_days) || 0,
            coverage_downgrade_flag: Number(body.coverage_downgrade_flag) || 0,

            payment_frequency: body.payment_frequency || 'Monthly',
            marital_status: body.marital_status || 'Single',
            age_band: body.age_band || '25-34',
            churn_type: 'Unknown',
            renewal_month: new Date().getMonth() + 1,
        };

        const savedCustomer = csvLoader.addCustomer(newRecord);
        res.status(201).json(savedCustomer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/analytics/kpis
const getKPIs = (req, res) => {
    try {
        res.json(csvLoader.getKPIs());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/analytics/distribution
const getDistribution = (req, res) => {
    try {
        res.json(csvLoader.getDistributionByPolicyType());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/analytics/churn-by-type
const getChurnByType = (req, res) => {
    try {
        res.json(csvLoader.getChurnTypeBreakdown());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/analytics/renewal-trend
const getRenewalTrend = (req, res) => {
    try {
        res.json(csvLoader.getRenewalMonthData());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/analytics/heatmap
const getHeatmap = (req, res) => {
    try {
        res.json(csvLoader.getRegionPolicyHeatmap());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCustomers,
    searchCustomers,
    getCustomerById,
    getKPIs,
    getDistribution,
    getChurnByType,
    getRenewalTrend,
    getHeatmap,
    createCustomer,
};
