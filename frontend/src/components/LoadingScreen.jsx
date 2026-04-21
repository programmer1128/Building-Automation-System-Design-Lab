import React from 'react';
import { Activity } from 'lucide-react';

const LoadingScreen = () => (
    <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0b1120',
        color: '#3b82f6',
        flexDirection: 'column'
    }}>
        <Activity size={48} className="spin" />
        <h2 style={{ marginTop: '20px' }}>Establishing Neural Link...</h2>
    </div>
);

export default LoadingScreen;