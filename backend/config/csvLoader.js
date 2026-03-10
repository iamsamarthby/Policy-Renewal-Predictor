const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

let customersMap = new Map();   // customer_id -> row object
let customersArray = [];          // for iteration / analytics

/**
 * Load the CSV into memory. Called once at server startup.
 */
function loadCSV() {
    const csvPath = path.resolve(__dirname, '..', process.env.CSV_PATH || '../insurance_policyholder_churn_synthetic.csv');
    console.log(`[csvLoader] Loading CSV from: ${csvPath}`);

    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        cast: true, // auto-convert numbers
    });

    customersMap = new Map();
    customersArray = records;

    for (const row of records) {
        customersMap.set(String(row.customer_id), row);
    }

    console.log(`[csvLoader] Loaded ${customersArray.length} customers into memory.`);
}

/** Return all customers (array) */
function getAllCustomers() {
    return customersArray;
}

/** Get one customer by ID */
function getCustomerById(id) {
    return customersMap.get(String(id)) || null;
}

/** Add a new manual customer entry */
function addCustomer(customerData) {
    // Generate a new integer ID (Database requires INT)
    // E.g. start at 90000000 + random safely under 2 billion
    const newId = 90000000 + Math.floor(Math.random() * 10000000);
    const newCustomer = {
        ...customerData,
        customer_id: newId,
        // Default critical fields so analytics don't crash
        churn_probability_true: 0.0,
        churn_flag: 0
    };

    customersMap.set(String(newId), newCustomer);
    customersArray.push(newCustomer);

    return newCustomer;
}

/** Update an existing customer (e.g. after a prediction) */
function updateCustomer(id, updates) {
    const customer = customersMap.get(String(id));
    if (customer) {
        Object.assign(customer, updates);
        return true;
    }
    return false;
}

/**
 * Search customers by ID or region (simple contains match)
 */
function searchCustomers(query) {
    const q = String(query).toLowerCase();
    return customersArray.filter((c) => {
        return (
            String(c.customer_id).includes(q) ||
            (c.region_name && c.region_name.toLowerCase().includes(q)) ||
            (c.policy_type && c.policy_type.toLowerCase().includes(q))
        );
    });
}

/**
 * Paginate + filter customers
 * filters: { risk_level, policy_type, region_name, churn_flag }
 */
function getCustomersPaginated(page = 1, limit = 20, filters = {}) {
    let data = customersArray;

    if (filters.policy_type) {
        data = data.filter((c) => c.policy_type === filters.policy_type);
    }
    if (filters.region_name) {
        data = data.filter((c) => c.region_name === filters.region_name);
    }
    if (filters.churn_flag !== undefined && filters.churn_flag !== '') {
        data = data.filter((c) => String(c.churn_flag) === String(filters.churn_flag));
    }
    // risk_level filter based on churn_probability_true
    if (filters.risk_level) {
        data = data.filter((c) => {
            const p = parseFloat(c.churn_probability_true);
            if (filters.risk_level === 'High') return p >= 0.7;
            if (filters.risk_level === 'Medium') return p >= 0.4 && p < 0.7;
            if (filters.risk_level === 'Low') return p < 0.4;
            return true;
        });
    }

    const total = data.length;
    const start = (page - 1) * limit;
    const rows = data.slice(start, start + Number(limit));

    return { total, page: Number(page), limit: Number(limit), rows };
}

/** Analytics helpers */
function getDistributionByPolicyType() {
    const dist = {};
    for (const c of customersArray) {
        const key = c.policy_type || 'Unknown';
        if (!dist[key]) dist[key] = { policy_type: key, High: 0, Medium: 0, Low: 0, total: 0 };
        const p = parseFloat(c.churn_probability_true);
        dist[key].total++;
        if (p >= 0.7) dist[key].High++;
        else if (p >= 0.4) dist[key].Medium++;
        else dist[key].Low++;
    }
    return Object.values(dist);
}

function getChurnTypeBreakdown() {
    const breakdown = {};
    for (const c of customersArray) {
        const key = c.churn_type || 'Unknown';
        breakdown[key] = (breakdown[key] || 0) + 1;
    }
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
}

function getKPIs() {
    const total = customersArray.length;
    let highRisk = 0, sumProb = 0, churners = 0;
    for (const c of customersArray) {
        const p = parseFloat(c.churn_probability_true);
        sumProb += p;
        if (p >= 0.7) highRisk++;
        if (c.churn_flag === 1 || String(c.churn_flag) === '1') churners++;
    }
    return {
        total,
        highRisk,
        highRiskPct: ((highRisk / total) * 100).toFixed(1),
        avgChurnProbability: (sumProb / total).toFixed(3),
        churners,
    };
}

function getRenewalMonthData() {
    const byMonth = {};
    for (const c of customersArray) {
        const m = c.renewal_month || 0;
        if (!byMonth[m]) byMonth[m] = { month: m, count: 0, totalProb: 0 };
        byMonth[m].count++;
        byMonth[m].totalProb += parseFloat(c.churn_probability_true);
    }
    return Object.values(byMonth)
        .sort((a, b) => a.month - b.month)
        .map((m) => ({ month: m.month, avgChurnProb: (m.totalProb / m.count).toFixed(3) }));
}

function getRegionPolicyHeatmap() {
    const map = {};
    for (const c of customersArray) {
        const key = `${c.region_name}__${c.policy_type}`;
        if (!map[key]) map[key] = { region: c.region_name, policy: c.policy_type, count: 0, churnCount: 0 };
        map[key].count++;
        if (parseFloat(c.churn_probability_true) >= 0.5) map[key].churnCount++;
    }
    return Object.values(map).map((d) => ({
        ...d,
        churnRate: d.count > 0 ? (d.churnCount / d.count).toFixed(3) : 0,
    }));
}

module.exports = {
    loadCSV,
    getAllCustomers,
    getCustomerById,
    searchCustomers,
    getCustomersPaginated,
    getDistributionByPolicyType,
    getChurnTypeBreakdown,
    getKPIs,
    getRenewalMonthData,
    getRegionPolicyHeatmap,
    addCustomer,
    updateCustomer
};
