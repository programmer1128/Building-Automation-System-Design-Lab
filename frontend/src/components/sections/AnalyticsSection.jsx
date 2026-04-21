import React from 'react';
import { XCircle } from 'lucide-react';

const getDeviceStatus = (device) => {
    if (device.uiStatus === 'FAIL') return {
        statusClass: 'breakdown',
        badge: <span className="status-badge crit">CRITICAL</span>,
        message: 'POTENTIAL BREAKDOWN AHEAD'
    };
    if (device.uiStatus === 'WARN') return {
        statusClass: 'anomaly',
        badge: <span className="status-badge warn" style={{ color: '#f97316', background: 'rgba(249,115,22,0.2)' }}>WARN</span>,
        message: 'Anomaly Detected'
    };
    if (device.uiStatus === 'SPIKE') return {
        statusClass: 'spike',
        badge: <span className="status-badge spike" style={{ color: '#eab308', background: 'rgba(234,179,8,0.2)' }}>SPIKE</span>,
        message: 'Temporary Spike'
    };
    return {
        statusClass: 'normal',
        badge: <span className="status-badge ok">OK</span>,
        message: 'System Nominal'
    };
};

const messageColor = (uiStatus) => {
    if (uiStatus === 'SPIKE') return '#eab308';
    if (uiStatus === 'WARN')  return '#f97316';
    if (uiStatus === 'FAIL')  return '#ef4444';
    return '#94a3b8';
};

const AnalyticsSection = ({ data, selectedDevice, currentDetailDevice, onSelectDevice }) => (
    <div style={{ scrollMarginTop: '20px' }}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: selectedDevice ? '1fr 350px' : '1fr',
            gap: '30px',
            transition: 'all 0.3s'
        }}>
            <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Appliance Analytics</h2>
                <div className="device-grid">
                    {data?.devices.map(device => {
                        const { statusClass, badge, message } = getDeviceStatus(device);
                        return (
                            <div
                                key={device.deviceId}
                                className={`device-card ${statusClass}`}
                                onClick={() => onSelectDevice(device)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '700' }}>{device.deviceId}</div>
                                    {badge}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    <span>Power</span>
                                    <span style={{ color: '#f1f5f9' }}>{device.power} W</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', marginTop: '10px', color: messageColor(device.uiStatus) }}>
                                    {message}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {currentDetailDevice && (
                <div className="card" style={{ border: '1px solid #3b82f6', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{currentDetailDevice.deviceId} Details</h2>
                        <XCircle size={20} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => onSelectDevice(null)} />
                    </div>
                    <div style={{
                        textAlign: 'center', padding: '20px',
                        background: 'rgba(59,130,246,0.05)', borderRadius: '8px', marginBottom: '20px'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>CURRENT LOAD</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6' }}>
                            {currentDetailDevice.power} W
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

export default AnalyticsSection;