import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Save, AlertCircle } from 'lucide-react';

export default function NewCustomerPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial state with empty/default values
    const [formData, setFormData] = useState({
        age: '',
        customer_tenure_months: '',
        policy_type: 'Auto',
        region_name: 'Urban',
        current_premium: '',
        premium_change_pct: '',
        num_claims_12m: '',
        late_payment_count_12m: '',
        autopay_enabled: false,
        complaint_flag: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5001/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create customer');
            }

            const data = await response.json();
            // Redirect to customer detail page immediately
            navigate(`/customers/${data.customer_id}`);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserPlus size={32} className="text-secondary" />
                <h1 className="page-title">New Customer Inquiry</h1>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <div className="card-header">
                    <h2>Customer Details</h2>
                </div>

                {error && (
                    <div className="card-content" style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Column 1 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Age</label>
                            <input type="number" name="age" required value={formData.age} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #a6a8abff', backgroundColor: '#92a1b1ff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Tenure (Months)</label>
                            <input type="number" name="customer_tenure_months" required min="0" value={formData.customer_tenure_months} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Policy Type</label>
                            <select name="policy_type" value={formData.policy_type} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }}>
                                <option value="Auto">Auto</option>
                                <option value="Home">Home</option>
                                <option value="Health">Health</option>
                                <option value="Life">Life</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Region Name</label>
                            <select name="region_name" value={formData.region_name} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }}>
                                <option value="Urban">Urban</option>
                                <option value="Suburban">Suburban</option>
                                <option value="Rural">Rural</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Current Premium ($)</label>
                            <input type="number" name="current_premium" required min="0" step="0.01" value={formData.current_premium} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Premium Change Percentage</label>
                            <input type="number" name="premium_change_pct" required step="0.01" value={formData.premium_change_pct} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }} />
                            <small style={{ color: '#c5c5c7ff' }}>e.g. 0.05 for 5% increase</small>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Claims in last 12 months</label>
                            <input type="number" name="num_claims_12m" required min="0" value={formData.num_claims_12m} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500', color: '#e5e6e7ff' }}>Late Payments in last 12 months</label>
                            <input type="number" name="late_payment_count_12m" required min="0" value={formData.late_payment_count_12m} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#92a1b1ff' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#92a1b1ff', borderRadius: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500', color: '#0e0e0eff' }}>
                            <input type="checkbox" name="autopay_enabled" checked={formData.autopay_enabled} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }} />
                            Autopay Enabled
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500', color: '#0e0e0eff' }}>
                            <input type="checkbox" name="complaint_flag" checked={formData.complaint_flag} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }} />
                            Has Complaint on record
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                            {loading ? 'Saving...' : <><Save size={20} /> Save & Predict Churn</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
