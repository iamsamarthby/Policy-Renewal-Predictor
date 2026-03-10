const { generateStrategy } = require('./services/geminiService');

(async () => {
    try {
        const text = await generateStrategy({
            customer: {
                customer_id: 1, age: 30, policy_type: 'Auto', region_name: 'West',
                customer_tenure_months: 12, premium_change_pct: 0.1, num_price_increases_last_3y: 1,
                late_payment_count_12m: 0, num_claims_12m: 0, num_rejected_claims_12m: 0,
                complaint_flag: false, quote_requested_flag: false, autopay_enabled: true,
                churn_type: 'Price'
            },
            risk_level: 'High', churn_prob: 0.8, ragContext: 'No similar customers'
        });
        console.log("SUCCESS:", text);
    } catch (e) {
        console.error("ERROR:", e);
    }
})();
