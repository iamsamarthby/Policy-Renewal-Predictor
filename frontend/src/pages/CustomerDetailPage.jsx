import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCustomerById, runPrediction, generateStrategy, fetchStrategy } from '../api/apiClient';
import { ArrowLeft, Zap, Brain, Shield } from 'lucide-react';

const RISK_COLORS = { High: '#f85149', Medium: '#e3b341', Low: '#3fb950' };

function getRisk(prob) {
    const p = parseFloat(prob);
    if (p >= 0.7) return 'High';
    if (p >= 0.4) return 'Medium';
    return 'Low';
}

function DetailRow({ label, value }) {
    return (
        <div className="detail-row">
            <span className="detail-key">{label}</span>
            <span className="detail-val">{value ?? '—'}</span>
        </div>
    );
}

export default function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [strategy, setStrategy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predicting, setPredicting] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCustomerById(id).then(r => {
            setCustomer(r.data);
            setPrediction(null); // Do not load previous predictions by default per user request
            setLoading(false);
        });
        fetchStrategy(id).then(r => setStrategy(r.data)).catch(() => { });
    }, [id]);

    const handlePredict = async () => {
        setPredicting(true);
        setPrediction(null); // Clear previous prediction so the gauge visually resets
        try {
            // Artificial delay to allow the gauge reset animation to play and make the action obvious
            await new Promise(resolve => setTimeout(resolve, 500));
            const r = await runPrediction(id);
            setPrediction(r.data);
        } catch (e) { alert('Prediction failed: ' + e.message); }
        finally { setPredicting(false); }
    };

    const handleStrategy = async () => {
        setGenerating(true);
        try {
            const r = await generateStrategy(id);
            setStrategy(r.data);
        } catch (e) { alert('Strategy generation failed: ' + e.message); }
        finally { setGenerating(false); }
    };

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;
    if (!customer) return <div className="empty-state">Customer not found.</div>;

    // Use the API response format (churn_probability) or the database format (churn_prob)
    const displayProb = prediction ? (parseFloat(prediction.churn_probability ?? prediction.churn_prob)) : null;
    const risk = prediction ? prediction.risk_level : 'Unknown';
    const riskColor = RISK_COLORS[risk] || '#555';
    const pct = displayProb !== null ? Math.round(displayProb * 100) : '--';

    return (
        <div>
            <div className="back-link" onClick={() => navigate('/customers')}><ArrowLeft size={15} /> Back to Customers</div>

            <div className="page-header">
                <h1>Customer #{id}</h1>
                <p>{customer.age} years · {customer.policy_type} Policy · {customer.region_name}</p>
            </div>

            {/* Risk Gauge */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
                    <div className="gauge-wrap" style={{ minWidth: 140 }}>
                        <div className="gauge-title">Churn Probability</div>
                        <div className={`gauge-value ${risk.toLowerCase()}`}>{pct}{prediction ? '%' : ''}</div>
                        <div style={{ width: 140 }}>
                            <div className="risk-bar-wrap">
                                <div className="risk-bar" style={{ width: prediction ? `${pct}%` : '0%', background: riskColor }} />
                            </div>
                        </div>
                        {prediction ? (
                            <span className={`badge badge-${risk.toLowerCase()}`} style={{ marginTop: 6 }}>{risk} Risk</span>
                        ) : (
                            <span className="badge" style={{ marginTop: 6, background: '#333', color: '#ccc' }}>Not Predicted</span>
                        )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={handlePredict} disabled={predicting}>
                            <Zap size={15} />{predicting ? 'Running...' : prediction ? 'Re-run Prediction' : 'Run ML Prediction'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleStrategy} disabled={generating}>
                            <Brain size={15} />{generating ? 'Generating strategy...' : strategy ? 'Regenerate Strategy' : 'Generate Engagement Strategy'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="detail-grid" style={{ marginBottom: 20 }}>
                <div className="card">
                    <div className="card-title">💼 Policy Information</div>
                    <DetailRow label="Policy Type" value={customer.policy_type} />
                    <DetailRow label="Premium" value={`$${parseFloat(customer.current_premium || 0).toFixed(2)}`} />
                    <DetailRow label="Premium Change" value={`${(parseFloat(customer.premium_change_pct || 0) * 100).toFixed(1)}%`} />
                    <DetailRow label="Price Increases (3y)" value={customer.num_price_increases_last_3y || 0} />
                    <DetailRow label="Coverage Amount" value={`$${parseFloat(customer.coverage_amount || 0).toLocaleString()}`} />
                    <DetailRow label="Payment Frequency" value={customer.payment_frequency} />
                    <DetailRow label="Autopay Enabled" value={customer.autopay_enabled === 1 || customer.autopay_enabled === true ? '✅ Yes' : '❌ No'} />
                    <DetailRow label="Multi-Policy" value={customer.multi_policy_flag === 1 || customer.multi_policy_flag === true ? 'Yes' : 'No'} />
                    <DetailRow label="Num Policies" value={customer.num_policies || 1} />
                    <DetailRow label="Renewal Month" value={customer.renewal_month || 'N/A'} />
                </div>
                <div className="card">
                    <div className="card-title">👤 Customer Behaviour</div>
                    <DetailRow label="Tenure" value={`${customer.customer_tenure_months || 0} months`} />
                    <DetailRow label="Late Payments (12m)" value={customer.late_payment_count_12m || 0} />
                    <DetailRow label="Missed Payment" value={customer.missed_payment_flag ? '⚠️ Yes' : 'No'} />
                    <DetailRow label="Claims (12m)" value={customer.num_claims_12m || 0} />
                    <DetailRow label="Approved Claims" value={customer.num_approved_claims_12m || 0} />
                    <DetailRow label="Rejected Claims" value={customer.num_rejected_claims_12m || 0} />
                    <DetailRow label="Total Claim Amount" value={`$${parseFloat(customer.total_claim_amount_12m || 0).toFixed(2)}`} />
                    <DetailRow label="Complaints" value={customer.complaint_flag ? '⚠️ Yes' : 'No'} />
                    <DetailRow label="Contacts (12m)" value={customer.num_contacts_12m} />
                    <DetailRow label="Quote Requested" value={customer.quote_requested_flag ? '⚠️ Yes' : 'No'} />
                    <DetailRow label="Coverage Downgrade" value={customer.coverage_downgrade_flag ? '⚠️ Yes' : 'No'} />
                </div>
            </div>

            {/* LLM Strategy */}
            {(strategy || generating) && (
                <div className="card">
                    <div className="card-title"><Shield size={14} style={{ display: 'inline', marginRight: 6 }} />Engagement Strategy</div>
                    {generating ? (
                        <div className="loading-state"><div className="spinner" /><p>Generating personalised strategy...</p></div>
                    ) : (
                        <div className="strategy-text">{strategy.strategy_text}</div>
                    )}
                </div>
            )}
        </div>
    );
}
