import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, BarChart3, Activity } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Activity size={20} />
                Policy Renewal
            </div>
            <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Users size={16} /> Customers
            </NavLink>
            <NavLink to="/new-customer" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <UserPlus size={16} /> Data Entry
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <BarChart3 size={16} /> Analytics
            </NavLink>
        </nav>
    );
}
