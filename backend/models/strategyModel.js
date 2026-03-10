const pool = require('../config/db');

async function saveStrategy({ customer_id, strategy_text, risk_level }) {
    const [result] = await pool.execute(
        'INSERT INTO strategies (customer_id, strategy_text, risk_level) VALUES (?, ?, ?)',
        [customer_id, strategy_text, risk_level]
    );
    return result.insertId;
}

async function getLatestStrategy(customer_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM strategies WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1',
        [customer_id]
    );
    return rows[0] || null;
}

async function clearAllStrategies() {
    await pool.execute('TRUNCATE TABLE strategies');
}

module.exports = { saveStrategy, getLatestStrategy, clearAllStrategies };
