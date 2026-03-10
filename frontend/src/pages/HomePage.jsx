import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { fetchKPIs, fetchDistribution, fetchChurnByType, fetchRenewalTrend } from '../api/apiClient';
import { Users, AlertTriangle, TrendingDown, Activity } from 'lucide-react';

const COLORS = ['#f85149', '#e3b341', '#3fb950', '#58a6ff', '#bc8cff'];

function KpiCard({ label, value, sub, icon: Icon, color }) {
    return (
        <div className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="kpi-label">{label}</span>
                {Icon && <Icon size={16} color={color || '#8b949e'} />}
            </div>
            <div className="kpi-value">{value}</div>
            {sub && <div className="kpi-sub">{sub}</div>}
        </div>
    );
}

export default function HomePage() {
    const [kpis, setKpis] = useState(null);
    const [dist, setDist] = useState([]);
    const [churnTypes, setChurnTypes] = useState([]);
    const [trend, setTrend] = useState([]);

    useEffect(() => {
        fetchKPIs().then(r => setKpis(r.data));
        fetchDistribution().then(r => setDist(r.data));
        fetchChurnByType().then(r => setChurnTypes(r.data));
        fetchRenewalTrend().then(r => setTrend(r.data));
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Policy renewal prediction overview — {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <KpiCard label="Total Customers" value={kpis ? kpis.total.toLocaleString() : '—'} icon={Users} />
                <KpiCard label="High Risk" value={kpis ? kpis.highRisk.toLocaleString() : '—'} sub={kpis ? `${kpis.highRiskPct}% of total` : ''} icon={AlertTriangle} color="#f85149" />
                <KpiCard label="Churners" value={kpis ? kpis.churners.toLocaleString() : '—'} icon={TrendingDown} color="#f85149" />
                <KpiCard label="Avg Churn Prob" value={kpis ? `${(parseFloat(kpis.avgChurnProbability) * 100).toFixed(1)}%` : '—'} icon={Activity} color="#e3b341" />
            </div>

            <div className="charts-grid">
                {/* Risk by Policy Type */}
                <div className="card">
                    <div className="card-title">Risk Distribution by Policy Type</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dist} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis dataKey="policy_type" tick={{ fill: '#8b949e', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3' }} />
                            <Legend />
                            <Bar dataKey="High" fill="#f85149" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="Medium" fill="#e3b341" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="Low" fill="#3fb950" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Churn Type Pie */}
                <div className="card">
                    <div className="card-title">Churn Type Breakdown</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={churnTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {churnTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Renewal Month Trend */}
            <div className="card">
                <div className="card-title">Avg Churn Probability by Renewal Month</div>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                        <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 12 }} label={{ value: 'Month', position: 'insideBottom', offset: -2, fill: '#8b949e', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} domain={[0, 0.6]} />
                        <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3' }} formatter={v => `${(v * 100).toFixed(1)}%`} />
                        <Line type="monotone" dataKey="avgChurnProb" stroke="#58a6ff" strokeWidth={2} dot={false} name="Avg Churn Prob" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
