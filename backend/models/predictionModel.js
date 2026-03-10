const pool = require('../config/db');

async function savePrediction({ customer_id, churn_prob, churn_flag, risk_level }) {
    const [result] = await pool.execute(
        'INSERT INTO predictions (customer_id, churn_prob, churn_flag, risk_level) VALUES (?, ?, ?, ?)',
        [customer_id, churn_prob, churn_flag, risk_level]
    );
    return result.insertId;
}

async function getLatestPrediction(customer_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM predictions WHERE customer_id = ? ORDER BY predicted_at DESC LIMIT 1',
        [customer_id]
    );
    return rows[0] || null;
}

async function getAllPredictions(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
        'SELECT * FROM predictions ORDER BY predicted_at DESC LIMIT ? OFFSET ?',
        [Number(limit), Number(offset)]
    );
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM predictions');
    return { total, rows };
}

module.exports = { savePrediction, getLatestPrediction, getAllPredictions };
