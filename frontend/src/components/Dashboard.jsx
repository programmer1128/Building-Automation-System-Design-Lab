import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useEnergy } from '../context/EnergyContext';
import { ENDPOINTS } from '../config/api';
import { loadRazorpayScript } from '../utils/razorpay';

import Sidebar from './Sidebar';
import LoadingScreen from './LoadingScreen';
import MonitorSection from './sections/MonitorSection';
import LoadGraphSection from './sections/LoadGraphSection';
import AnalyticsSection from './sections/AnalyticsSection';
import SystemLogsSection from './sections/SystemLogsSection';
import GmailLogsSection from './sections/GmailLogsSection';
import BillingSection from './sections/BillingSection';
import PaymentHistorySection from './sections/PaymentHistorySection';
import BalanceSection from './sections/BalanceSection';

const Dashboard = ({ onLogout }) => {
    const {
        data, logs, emailLogs, bills, transactions, commonBalance, graphHistory, isConnected,
        setBills, setCommonBalance
    } = useEnergy();

    // UI STATE
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [selectedTxn, setSelectedTxn] = useState(null);
    const [displayBalance, setDisplayBalance] = useState(0);
    const [activeSection, setActiveSection] = useState('monitor');

    // PAYMENT STATE
    const [showPayModal, setShowPayModal] = useState(false);
    const [payerName, setPayerName] = useState("");
    const [payerEmail, setPayerEmail] = useState("");
    const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(null);

    // SECTION REFS
    const monitorRef  = useRef(null);
    const graphRef    = useRef(null);
    const analyticsRef = useRef(null);
    const logsRef     = useRef(null);
    const gmailRef    = useRef(null);
    const billingRef  = useRef(null);
    const historyRef  = useRef(null);
    const balanceRef  = useRef(null);

    const SECTION_REFS = {
        monitor:   monitorRef,
        graph:     graphRef,
        analytics: analyticsRef,
        logs:      logsRef,
        gmail:     gmailRef,
        billing:   billingRef,
        history:   historyRef,
        balance:   balanceRef,
    };

    const handleNavClick = (sectionKey) => {
        setActiveSection(sectionKey);
        SECTION_REFS[sectionKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // BALANCE ANIMATION
    useEffect(() => {
        if (displayBalance < commonBalance) {
            const step = Math.ceil((commonBalance - displayBalance) / 10);
            const timer = setTimeout(() => setDisplayBalance(prev => prev + step), 30);
            return () => clearTimeout(timer);
        } else if (displayBalance > commonBalance) {
            setDisplayBalance(commonBalance);
        }
    }, [commonBalance, displayBalance]);

    // RAZORPAY PAYMENT HANDLER
    const proceedToRazorpay = useCallback(async () => {
        const res = await loadRazorpayScript();
        if (!res) { alert("Razorpay SDK failed to load"); return; }
        const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

        try {
            const orderData = await axios.post(ENDPOINTS.CREATE_ORDER, { amount: totalAmount });
            const orderJson = (typeof orderData.data === 'string')
                ? JSON.parse(orderData.data)
                : orderData.data;

            const options = {
                key: "rzp_test_S0IvbKCzGAoXnH",
                amount: orderJson.amount,
                currency: orderJson.currency,
                name: "SmartHive Maintenance",
                description: "Consolidated Utility Bill",
                order_id: orderJson.id,
                handler: async function (response) {
                    try {
                        const verifyPayload = {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            payerName,
                            payerEmail
                        };
                        const verifyRes = await axios.post(ENDPOINTS.VERIFY_PAYMENT, verifyPayload);
                        if (verifyRes.data === true) {
                            setShowPayModal(false);
                            setPaymentSuccessMsg(
                                `Payment of ₹${totalAmount} successful at ${new Date().toLocaleString()}`
                            );
                            setBills([]);
                            const balRes = await axios.get(ENDPOINTS.BALANCE);
                            setCommonBalance(balRes.data);
                            setTimeout(() => setPaymentSuccessMsg(null), 8000);
                        } else {
                            alert("Payment Verification Failed!");
                        }
                    } catch (verifyErr) {
                        console.error("Verification Error:", verifyErr);
                        alert("Server error during verification");
                    }
                },
                prefill: { name: payerName, email: payerEmail },
                theme: { color: "#3b82f6" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error("Payment Error:", err);
            if (err.response && err.response.status === 403) {
                alert("Session Expired.");
                onLogout();
            } else {
                alert("Payment Init Failed.");
            }
        }
    }, [bills, payerName, payerEmail, onLogout, setBills, setCommonBalance]);

    if (!data && !isConnected) return <LoadingScreen />;

    // DERIVED VALUES
    const activeThreats      = data ? data.devices.filter(d => d.breakdown) : [];
    const currentDetailDevice = selectedDevice
        ? data.devices.find(d => d.deviceId === selectedDevice.deviceId)
        : null;
    const totalDue = bills.reduce((sum, bill) => sum + bill.amount, 0);

    return (
        <div className="app-container">
            <Sidebar
                activeSection={activeSection}
                isConnected={isConnected}
                onNavClick={handleNavClick}
                onLogout={onLogout}
            />

            <div className="main-area">
                <div ref={monitorRef}>
                    <MonitorSection data={data} activeThreats={activeThreats} />
                </div>

                <div ref={graphRef}>
                    <LoadGraphSection graphHistory={graphHistory} />
                </div>

                <div ref={analyticsRef}>
                    <AnalyticsSection
                        data={data}
                        selectedDevice={selectedDevice}
                        currentDetailDevice={currentDetailDevice}
                        onSelectDevice={setSelectedDevice}
                    />
                </div>

                <div ref={logsRef}>
                    <SystemLogsSection logs={logs} />
                </div>

                <div ref={gmailRef}>
                    <GmailLogsSection
                        emailLogs={emailLogs}
                        selectedEmail={selectedEmail}
                        onSelectEmail={setSelectedEmail}
                    />
                </div>

                <div ref={billingRef}>
                    <BillingSection
                        bills={bills}
                        totalDue={totalDue}
                        paymentSuccessMsg={paymentSuccessMsg}
                        showPayModal={showPayModal}
                        setShowPayModal={setShowPayModal}
                        payerName={payerName}
                        setPayerName={setPayerName}
                        payerEmail={payerEmail}
                        setPayerEmail={setPayerEmail}
                        onProceedToRazorpay={proceedToRazorpay}
                    />
                </div>

                <div ref={historyRef}>
                    <PaymentHistorySection
                        transactions={transactions}
                        selectedTxn={selectedTxn}
                        onSelectTxn={setSelectedTxn}
                    />
                </div>

                <div ref={balanceRef}>
                    <BalanceSection
                        displayBalance={displayBalance}
                        transactions={transactions}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;