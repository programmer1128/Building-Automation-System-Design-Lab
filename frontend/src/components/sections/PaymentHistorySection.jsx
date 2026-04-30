import React from 'react';
import { CheckCircle } from 'lucide-react';

const PaymentHistorySection = ({ transactions, selectedTxn, onSelectTxn }) => (
    <div style={{ scrollMarginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Payment History (Ledger)</h2>
        <div className="card">
            <div className="logs-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Transaction ID</th>
                            <th>Payer</th>
                            <th>Amount</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(txn => (
                            <tr
                                key={txn.id}
                                onClick={() => onSelectTxn(txn)}
                                style={{
                                    cursor: 'pointer',
                                    background: selectedTxn?.id === txn.id
                                        ? 'rgba(59,130,246,0.1)'
                                        : 'transparent'
                                }}
                            >
                                <td>{new Date(txn.timestamp).toLocaleString()}</td>
                                <td>{txn.razorpayPaymentId}</td>
                                <td>{txn.payerName}</td>
                                <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{txn.amount}</td>
                                <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{txn.itemsPaid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {selectedTxn && (
            <div className="card" style={{ marginTop: '20px', border: '1px dashed #94a3b8' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 10px' }} />
                    <h3 style={{ margin: 0 }}>Payment Receipt</h3>
                    <div style={{ color: '#94a3b8' }}>Sent to: {selectedTxn.payerEmail}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem' }}>
                    <div><strong>Transaction ID:</strong> {selectedTxn.razorpayPaymentId}</div>
                    <div><strong>Amount Paid:</strong> ₹{selectedTxn.amount}</div>
                    <div><strong>Date:</strong> {new Date(selectedTxn.timestamp).toLocaleString()}</div>
                    <div><strong>Status:</strong> <span style={{ color: '#10b981' }}>SUCCESS</span></div>
                </div>
                <div style={{
                    marginTop: '20px', padding: '10px',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '4px'
                }}>
                    <strong>Services Covered:</strong> {selectedTxn.itemsPaid}
                </div>
            </div>
        )}
    </div>
);

export default PaymentHistorySection;