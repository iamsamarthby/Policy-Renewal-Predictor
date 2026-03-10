import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: 200000, // 200s — Ollama/llama3 can be slow on first generation
});

export const fetchCustomers = (params) => api.get('/customers', { params });
export const fetchCustomerById = (id) => api.get(`/customers/${id}`);
export const searchCustomers = (q) => api.get('/customers/search', { params: { q } });

export const fetchKPIs = () => api.get('/analytics/kpis');
export const fetchDistribution = () => api.get('/analytics/distribution');
export const fetchChurnByType = () => api.get('/analytics/churn-by-type');
export const fetchRenewalTrend = () => api.get('/analytics/renewal-trend');
export const fetchHeatmap = () => api.get('/analytics/heatmap');

export const runPrediction = (id) => api.post(`/predict/${id}`);
export const fetchPrediction = (id) => api.get(`/predictions/${id}`);
export const generateStrategy = (id) => api.post(`/strategy/${id}`);
export const fetchStrategy = (id) => api.get(`/strategy/${id}`);

export default api;
