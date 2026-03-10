import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCustomers } from '../api/apiClient';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const RISK_COLORS = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

function getRisk(prob) {
    const p = parseFloat(prob);
    if (p >= 0.7) return 'High';
    if (p >= 0.4) return 'Medium';
    return 'Low';
}

export default function CustomersPage() {
    const navigate = useNavigate();
    const [data, setData] = useState({ rows: [], total: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ policy_type: '', region_name: '', risk_level: '' });
    const LIMIT = 25;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchCustomers({ page, limit: LIMIT, ...filters });
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => { load(); }, [load]);

    const totalPages = Math.ceil(data.total / LIMIT);

    return (
        <div>
            <div className="page-header">
                <h1>Customers</h1>
                <p>{data.total.toLocaleString()} customers loaded from CSV</p>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <select className="filter-select" value={filters.policy_type} onChange={e => { setFilters(f => ({ ...f, policy_type: e.target.value })); setPage(1); }}>
                    <option value="">All Policy Types</option>
                    {['Auto', 'Home', 'Health', 'Life', 'Travel'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="filter-select" value={filters.risk_level} onChange={e => { setFilters(f => ({ ...f, risk_level: e.target.value })); setPage(1); }}>
                    <option value="">All Risk Levels</option>
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                </select>
                <select className="filter-select" value={filters.region_name} onChange={e => { setFilters(f => ({ ...f, region_name: e.target.value })); setPage(1); }}>
                    <option value="">All Regions</option>
                    {['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Otago', 'Bay of Plenty', 'Manawatu-Whanganui'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-state"><div className="spinner" /></div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th><th>Age</th><th>Region</th><th>Policy</th>
                                    <th>Tenure (mo)</th><th>Premium</th><th>Risk Level</th><th>Churn Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.rows.map(c => {
                                    const risk = getRisk(c.churn_probability_true);
                                    return (
                                        <tr key={c.customer_id} className="clickable-row" onClick={() => navigate(`/customers/${c.customer_id}`)}>
                                            <td><strong>{c.customer_id}</strong></td>
                                            <td>{c.age}</td>
                                            <td>{c.region_name}</td>
                                            <td>{c.policy_type}</td>
                                            <td>{c.customer_tenure_months}</td>
                                            <td>${parseFloat(c.current_premium).toFixed(0)}</td>
                                            <td><span className={`badge ${RISK_COLORS[risk]}`}>{risk}</span></td>
                                            <td><span className="badge badge-neutral">{c.churn_type}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="pagination">
                    <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}><ChevronLeft size={14} /></button>
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}><ChevronRight size={14} /></button>
                </div>
            </div>
        </div>
    );
}
