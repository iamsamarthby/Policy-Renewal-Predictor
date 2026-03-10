import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import NewCustomerPage from './pages/NewCustomerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Navbar />
        <div className="sidebar-push main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/new-customer" element={<NewCustomerPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
