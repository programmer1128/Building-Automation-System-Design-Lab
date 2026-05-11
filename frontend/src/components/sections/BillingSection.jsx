import React from 'react';
import { Check, CheckCircle } from 'lucide-react';

const BillingSection = ({
    bills,
    totalDue,
    paymentSuccessMsg,
    showPayModal,
    setShowPayModal,
    payerName,
    setPayerName,
    payerEmail,
    setPayerEmail,
    onProceedToRazorpay
}) => (
    <div style={{ scrollMarginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Maintenance Billing</h2>

        {paymentSuccessMsg && (
            <div style={{
                background: '#10b981', color: '#fff', padding: '15px', borderRadius: '8px',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'
            }}>
                <Check size={24} /> {paymentSuccessMsg}
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>

            {/* Outstanding Dues Table */}
            <div className="card">
                <div className="card-label">Outstanding Dues</div>
                {bills.length === 0 ? (
                    <div style={{
                        padding: '40px', textAlign: 'center', color: '#10b981',
                        background: 'rgba(16,185,129,0.1)', borderRadius: '8px', marginTop: '10px'
                    }}>
                        <CheckCircle size={48} style={{ margin: '0 auto 10px auto' }} />
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>All Dues Cleared</div>
                        <div>No pending maintenance charges</div>
                    </div>
                ) : (
                    <div className="logs-table-container">
                        <table>
                            <thead>
                                <tr><th>Device</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => (
                                    <tr key={bill.id}>
                                        <td>{bill.deviceId}</td>
                                        <td>₹{bill.amount}</td>
                                        <td style={{ color: '#ef4444', fontWeight: 'bold' }}>PENDING</td>
                                        <td>{new Date(bill.generatedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Consolidated Invoice */}
            <div className="card" style={{ border: '1px solid #3b82f6', height: 'fit-content' }}>
                <div className="card-label">Consolidated Invoice</div>
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#94a3b8' }}>
                        <span>Total Items</span>
                        <span>{bills.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                        <span>Total Due</span>
                        <span>₹{totalDue}</span>
                    </div>
                </div>

                {totalDue > 0 && !showPayModal && (
                    <button
                        onClick={() => setShowPayModal(true)}
                        style={{
                            width: '100%', padding: '15px', background: '#3b82f6', color: '#fff',
                            border: 'none', borderRadius: '6px', fontSize: '1rem',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        PAY TOTAL DUE
                    </button>
                )}

                {showPayModal && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '6px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>
                                Full Name
                            </label>
                            <input
                                type="text" value={payerName}
                                onChange={e => setPayerName(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px', background: '#0f172a',
                                    border: '1px solid #334155', color: '#fff', borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>
                                Email (For Receipt)
                            </label>
                            <input
                                type="email" value={payerEmail}
                                onChange={e => setPayerEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px', background: '#0f172a',
                                    border: '1px solid #334155', color: '#fff', borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowPayModal(false)}
                                style={{
                                    flex: 1, padding: '10px', background: '#334155',
                                    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onProceedToRazorpay}
                                disabled={!payerName || !payerEmail}
                                style={{
                                    flex: 1, padding: '10px', background: '#10b981',
                                    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    opacity: (!payerName || !payerEmail) ? 0.5 : 1
                                }}
                            >
                                PROCEED
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    </div>
);

export default BillingSection;