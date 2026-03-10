const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a personalised engagement strategy using Google Gemini.
 */
async function generateStrategy({ customer, risk_level, churn_prob, ragContext }) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const premChange = (parseFloat(customer.premium_change_pct) * 100).toFixed(1);

    const prompt = `You are an insurance retention specialist. Be concise and direct.

Customer #${customer.customer_id}: Age ${customer.age}, ${customer.policy_type} policy, ${customer.region_name}
Tenure: ${customer.customer_tenure_months} months | Premium change: ${premChange}% | Price increases (3y): ${customer.num_price_increases_last_3y}
Late payments: ${customer.late_payment_count_12m} | Claims: ${customer.num_claims_12m} (rejected: ${customer.num_rejected_claims_12m})
Complaint: ${customer.complaint_flag ? 'YES' : 'No'} | Quote requested: ${customer.quote_requested_flag ? 'YES' : 'No'} | Autopay: ${customer.autopay_enabled ? 'Yes' : 'No'}
Churn risk: ${risk_level} (${churn_prob}%) | Likely reason: ${customer.churn_type}
${ragContext && ragContext !== 'No similar customers found.' ? `\nSimilar churned customers context:\n${ragContext}` : ''}

Write a retention strategy with these 4 sections (keep it brief):
1. Root Cause (1-2 sentences)
2. Three Retention Actions (numbered)
3. Communication Channel & Timing
4. Offer/Discount Recommendation`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = { generateStrategy };
