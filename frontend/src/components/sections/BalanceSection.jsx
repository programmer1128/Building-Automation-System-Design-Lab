import React from 'react';

const BalanceSection = ({ displayBalance, transactions }) => (
    <div style={{ scrollMarginTop: '20px', paddingBottom: '50px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Common Balance Fund</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>

            {/* Balance Display */}
            <div className="card" style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: '1px solid #334155'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '10px' }}>
                    TOTAL ACCUMULATED FUNDS
                </div>
                <div style={{
                    fontSize: '4rem', fontWeight: '800', color: '#10b981',
                    textShadow: '0 0 20px rgba(16,185,129,0.3)'
                }}>
                    ₹{displayBalance.toLocaleString()}
                </div>
            </div>

            {/* Recent Inflows */}
            <div className="card" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="card-label" style={{ marginBottom: '15px' }}>Recent Inflows</div>
                {transactions.slice(0, 10).map(txn => (
                    <div key={txn.id} style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '10px', fontSize: '0.9rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>+ ₹{txn.amount}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                {new Date(txn.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>
                            {txn.itemsPaid.substring(0, 15)}...
                        </div>
                    </div>
                ))}
            </div>

        </div>
    </div>
);

export default BalanceSection;