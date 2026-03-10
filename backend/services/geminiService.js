const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-lite';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generate a personalised engagement strategy for a customer using Gemini.
 */
async function generateStrategy({ customer, risk_level, churn_prob, ragContext }) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    const premChange = (parseFloat(customer.premium_change_pct) * 100).toFixed(1);

    const prompt = `You are an insurance retention specialist. Be concise and direct.

Customer #${customer.customer_id}: Age ${customer.age}, ${customer.policy_type} policy, ${customer.region_name}
Tenure: ${customer.customer_tenure_months} months | Premium change: ${premChange}% | Price increases (3y): ${customer.num_price_increases_last_3y}
Late payments: ${customer.late_payment_count_12m} | Claims: ${customer.num_claims_12m} (rejected: ${customer.num_rejected_claims_12m})
Complaint: ${customer.complaint_flag ? 'YES' : 'No'} | Quote requested: ${customer.quote_requested_flag ? 'YES' : 'No'} | Autopay: ${customer.autopay_enabled ? 'Yes' : 'No'}
Churn risk: ${risk_level} (${churn_prob}%) | Likely reason: ${customer.churn_type}

**Similar Past Customer Context:**
${ragContext}

Write a retention strategy with these 5 sections (keep it brief). IMPORTANT: Do NOT use any Markdown formatting, bold text, or asterisks (* or **). Use plain text only, separated by newlines:
1. Root Cause: (1-2 sentences)
2. Three Retention Actions: (numbered)
3. Communication Channel & Timing:
4. Offer/Discount Recommendation:
5. Historical Insight: (Summarize how the "Similar Past Customer Context" above informed this strategy)`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        return response.text;
    } catch (e) {
        throw new Error(`Gemini Error: ${e.message}`);
    }
}

module.exports = { generateStrategy };
