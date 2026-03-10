const axios = require('axios');
require('dotenv').config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
// Use a lighter model if llama3 is too slow: change to 'mistral' or 'phi3' or 'llama3.2'
const MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Generate a personalised engagement strategy for a customer.
 */
async function generateStrategy({ customer, risk_level, churn_prob, ragContext }) {
    const premChange = (parseFloat(customer.premium_change_pct) * 100).toFixed(1);

    const prompt = `You are an insurance retention specialist. Be concise and direct.

Customer #${customer.customer_id}: Age ${customer.age}, ${customer.policy_type} policy, ${customer.region_name}
Tenure: ${customer.customer_tenure_months} months | Premium change: ${premChange}% | Price increases (3y): ${customer.num_price_increases_last_3y}
Late payments: ${customer.late_payment_count_12m} | Claims: ${customer.num_claims_12m} (rejected: ${customer.num_rejected_claims_12m})
Complaint: ${customer.complaint_flag ? 'YES' : 'No'} | Quote requested: ${customer.quote_requested_flag ? 'YES' : 'No'} | Autopay: ${customer.autopay_enabled ? 'Yes' : 'No'}
Churn risk: ${risk_level} (${churn_prob}%) | Likely reason: ${customer.churn_type}

**Similar Past Customer Context:**
${ragContext}

Write a retention strategy with these 5 sections (keep it brief):
1. Root Cause (1-2 sentences)
2. Three Retention Actions (numbered)
3. Communication Channel & Timing
4. Offer/Discount Recommendation
5. Historical Insight (Summarize how the "Similar Past Customer Context" above informed this strategy)`;

    try {
        const response = await axios.post(
            `${OLLAMA_URL}/api/generate`,
            { model: MODEL, prompt, stream: false },
            { timeout: 180000 } // 3 minutes — llms can be slow on first run
        );
        return response.data.response;
    } catch (e) {
        if (e.response && e.response.data && e.response.data.error) {
            throw new Error(`Ollama Error: ${e.response.data.error} `);
        }
        throw new Error(`Ollama connection failed: ${e.message} `);
    }
}

module.exports = { generateStrategy };
