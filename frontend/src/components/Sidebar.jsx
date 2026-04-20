import React from 'react';
import {
    Zap, LayoutDashboard, TrendingUp, Server, FileText,
    Mail, CreditCard, History, Wallet, Lock
} from 'lucide-react';

const NAV_ITEMS = [
    { key: 'monitor',   label: 'Monitor',             Icon: LayoutDashboard },
    { key: 'graph',     label: 'Load Graph',          Icon: TrendingUp },
    { key: 'analytics', label: 'Analytics',            Icon: Server },
    { key: 'logs',      label: 'System Logs',          Icon: FileText },
    { key: 'gmail',     label: 'Gmail Logs',           Icon: Mail },
    { key: 'billing',   label: 'Maintenance Billing',  Icon: CreditCard },
    { key: 'history',   label: 'Payment History',      Icon: History },
    { key: 'balance',   label: 'Common Balance',       Icon: Wallet },
];

const Sidebar = ({ activeSection, isConnected, onNavClick, onLogout }) => (
    <div className="sidebar">
        <div className="brand">
            <Zap size={28} strokeWidth={2.5} /> SmartHive
        </div>

        {NAV_ITEMS.map(({ key, label, Icon }) => (
            <div
                key={key}
                className={`nav-item ${activeSection === key ? 'active' : ''}`}
                onClick={() => onNavClick(key)}
            >
                <Icon size={20} /> {label}
            </div>
        ))}

        <div
            className="nav-item"
            onClick={onLogout}
            style={{ marginTop: 'auto', color: '#ef4444', marginBottom: '5px' }}
        >
            <Lock size={20} /> Logout
        </div>

        <div style={{
            color: isConnected ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            marginBottom: '10px'
        }}>
            <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isConnected ? '#10b981' : '#ef4444'
            }} />
            {isConnected ? 'Server Online' : 'Reconnecting...'}
        </div>
    </div>
);

export default Sidebar;