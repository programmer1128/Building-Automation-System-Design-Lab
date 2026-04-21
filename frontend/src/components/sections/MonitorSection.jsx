import React from 'react';
import { CheckCircle, AlertOctagon } from 'lucide-react';

const MonitorSection = ({ data, activeThreats }) => (
    <div style={{ scrollMarginTop: '20px' }}>
        <div className="top-header" style={{ marginBottom: '50px' }}>
            <div>
                <h1 style={{
                    margin: 0, fontSize: '2rem', letterSpacing: '1px',
                    background: '-webkit-linear-gradient(45deg, #f8fafc, #94a3b8)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    APPLIANCE INTEGRITY MONITOR
                </h1>
                <p style={{
                    marginTop: '5px', marginBottom: 0, color: '#64748b',
                    fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.5px'
                }}>
                    REAL-TIME LOAD ANALYSIS & BREAKDOWN DEFENCE
                </p>
            </div>
            <div className="system-status">
                <CheckCircle size={16} /> SYSTEM {activeThreats.length > 0 ? 'COMPROMISED' : 'NOMINAL'}
            </div>
        </div>

        {activeThreats.length > 0 && (
            <div className="threat-panel" style={{ margin: '30px 0' }}>
                <div className="threat-content">
                    <div className="threat-title">
                        <AlertOctagon size={24} /> CRITICAL BREAKDOWN PREDICTED
                    </div>
                    <div style={{ color: '#fca5a5' }}>
                        The following appliances have exceeded failure thresholds:{' '}
                        {activeThreats.map(t => <b key={t.deviceId}> {t.deviceId},</b>)}
                    </div>
                </div>
            </div>
        )}

        <div className="kpi-grid">
            <div className="card">
                <div className="card-label">Total Consumption</div>
                <div className="card-value" style={{ color: '#3b82f6' }}>
                    {data?.totalPower.toFixed(0)} <span style={{ fontSize: '1rem' }}>W</span>
                </div>
            </div>
            <div className="card">
                <div className="card-label">Monitored Appliances</div>
                <div className="card-value">{data?.devices.length}</div>
            </div>
            <div className="card">
                <div className="card-label">Active Anomalies</div>
                <div className="card-value" style={{ color: '#f59e0b' }}>
                    {data?.devices.filter(d => d.anomaly && !d.breakdown).length}
                </div>
            </div>
        </div>
    </div>
);

export default MonitorSection;