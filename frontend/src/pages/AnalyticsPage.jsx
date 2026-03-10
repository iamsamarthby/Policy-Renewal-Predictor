import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
    ScatterChart, Scatter, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { fetchDistribution, fetchChurnByType, fetchHeatmap } from '../api/apiClient';

const RISK_COLORS = { High: '#f85149', Medium: '#e3b341', Low: '#3fb950' };
const PIE_COLORS = ['#f85149', '#e3b341', '#3fb950', '#58a6ff', '#bc8cff', '#fd7e14', '#20c997'];

export default function AnalyticsPage() {
    const [dist, setDist] = useState([]);
    const [churnTypes, setChurnTypes] = useState([]);
    const [heatmap, setHeatmap] = useState([]);

    useEffect(() => {
        fetchDistribution().then(r => setDist(r.data));
        fetchChurnByType().then(r => setChurnTypes(r.data));
        fetchHeatmap().then(r => setHeatmap(r.data));
    }, []);

    // Churn rate by region (aggregate heatmap data)
    const regionData = heatmap.reduce((acc, row) => {
        if (!acc[row.region]) acc[row.region] = { region: row.region, count: 0, churnCount: 0 };
        acc[row.region].count += row.count;
        acc[row.region].churnCount += row.churnCount;
        return acc;
    }, {});
    const regionChart = Object.values(regionData).map(r => ({
        region: r.region.split('-')[0], // shorten names
        churnRate: r.count > 0 ? parseFloat((r.churnCount / r.count * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.churnRate - a.churnRate);

    // Scatter: per policy type avg churn rate vs total count
    const scatterData = dist.map(d => ({
        name: d.policy_type,
        total: d.total,
        highRiskPct: d.total > 0 ? parseFloat(((d.High / d.total) * 100).toFixed(1)) : 0,
    }));

    // Churn type bar
    const churnBar = [...churnTypes].sort((a, b) => b.value - a.value);

    return (
        <div>
            <div className="page-header">
                <h1>Analytics</h1>
                <p>Deep-dive into churn patterns across the portfolio</p>
            </div>

            <div className="charts-grid" style={{ marginBottom: 20 }}>
                {/* Churn rate by region */}
                <div className="card">
                    <div className="card-title">Churn Rate by Region (%)</div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={regionChart} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 12 }} unit="%" />
                            <YAxis dataKey="region" type="category" tick={{ fill: '#8b949e', fontSize: 12 }} width={80} />
                            <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3' }} formatter={v => `${v}%`} />
                            <Bar dataKey="churnRate" radius={[0, 4, 4, 0]} name="Churn Rate">
                                {regionChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* High-risk % by policy type */}
                <div className="card">
                    <div className="card-title">High-Risk % by Policy Type</div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={scatterData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                            <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} unit="%" />
                            <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3' }} formatter={v => `${v}%`} />
                            <Bar dataKey="highRiskPct" fill="#f85149" radius={[4, 4, 0, 0]} name="High Risk %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Churn Type distribution */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title">Customer Count by Churn Type</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={churnBar} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                        <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Customers">
                            {churnBar.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Risk breakdown table */}
            <div className="card">
                <div className="card-title">Risk Breakdown by Policy Type</div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Policy Type</th><th>Total</th><th>🔴 High</th><th>🟡 Medium</th><th>🟢 Low</th><th>High %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dist.map(d => (
                                <tr key={d.policy_type}>
                                    <td><strong>{d.policy_type}</strong></td>
                                    <td>{d.total.toLocaleString()}</td>
                                    <td style={{ color: '#f85149' }}>{d.High.toLocaleString()}</td>
                                    <td style={{ color: '#e3b341' }}>{d.Medium.toLocaleString()}</td>
                                    <td style={{ color: '#3fb950' }}>{d.Low.toLocaleString()}</td>
                                    <td>{d.total > 0 ? ((d.High / d.total) * 100).toFixed(1) : 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
