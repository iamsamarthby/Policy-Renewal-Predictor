require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { loadCSV } = require('./config/csvLoader');

const customerRoutes = require('./routes/customerRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const strategyModel = require('./models/strategyModel');

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', customerRoutes);
app.use('/api', predictionRoutes);
app.use('/api', strategyRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'policy-renewal-backend' }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start server ─────────────────────────────────────────────────────────────
async function start() {
    console.log('[server] Clearing past strategies from database...');
    try {
        await strategyModel.clearAllStrategies();
    } catch (e) {
        console.warn('Failed to clear strategies. They might just not exist yet.', e);
    }
    console.log('[server] Loading CSV data into memory...');
    loadCSV(); // synchronous — blocks until ready
    app.listen(PORT, () => {
        console.log(`[server] Policy Renewal API running on http://localhost:${PORT}`);
    });
}

start();
