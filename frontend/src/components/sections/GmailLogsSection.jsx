import React from 'react';

const GmailLogsSection = ({ emailLogs, selectedEmail, onSelectEmail }) => (
    <div style={{ scrollMarginTop: '20px', paddingBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Gmail Incident History</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

            {/* Email List */}
            <div className="card" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className="card-label" style={{ marginBottom: '15px' }}>Sent Alerts</div>
                {emailLogs.map(email => (
                    <div
                        key={email.id}
                        onClick={() => onSelectEmail(email)}
                        style={{
                            padding: '15px',
                            background: selectedEmail?.id === email.id
                                ? 'rgba(59,130,246,0.2)'
                                : 'rgba(255,255,255,0.05)',
                            marginBottom: '10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: selectedEmail?.id === email.id
                                ? '1px solid #3b82f6'
                                : '1px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{email.deviceId}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {new Date(email.sentAt).toLocaleTimeString()}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>To: {email.recipient}</div>
                    </div>
                ))}
            </div>

            {/* Email Body */}
            <div className="card" style={{ position: 'relative' }}>
                <div className="card-label">Message Content</div>
                {selectedEmail ? (
                    <div style={{ marginTop: '15px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '10px' }}>
                            Subject: <span style={{ color: '#fff' }}>{selectedEmail.subject}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
                            Date: <span style={{ color: '#fff' }}>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                        </div>
                        <div style={{
                            background: '#f1f5f9', color: '#0f172a', padding: '20px',
                            borderRadius: '4px', fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap', fontSize: '0.9rem'
                        }}>
                            {selectedEmail.body}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        height: '200px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                        Select an email to view content
                    </div>
                )}
            </div>

        </div>
    </div>
);

export default GmailLogsSection;