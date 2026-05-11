import React from 'react';

const SystemLogsSection = ({ logs }) => (
    <div style={{ scrollMarginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            System Logs (Anomaly and Potential Breakdown)
        </h2>
        <div className="card">
            <div className="logs-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Device ID</th>
                            <th>Event Type</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just Now'}</td>
                                <td>{log.deviceId}</td>
                                <td>
                                    {log.breakdown
                                        ? <span style={{ color: '#ef4444' }}>BREAKDOWN PREDICTED</span>
                                        : <span style={{ color: '#f59e0b' }}>Anomaly Detected</span>
                                    }
                                </td>
                                <td>{log.power} W</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default SystemLogsSection;