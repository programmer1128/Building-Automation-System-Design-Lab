import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

const EnergyContext = createContext();

export const useEnergy = () => useContext(EnergyContext);

export const EnergyProvider = ({ children, token, onLogout }) => {
    const [data, setData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [emailLogs, setEmailLogs] = useState([]);
    const [bills, setBills] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [commonBalance, setCommonBalance] = useState(0);
    const [graphHistory, setGraphHistory] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // --- SECURITY INTERCEPTOR ---
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // --- DATA FETCHING ENGINE ---
    const fetchData = useCallback(async () => {
        if (!token) return;

        try {
            const [dashRes, logsRes, emailsRes, billsRes, historyRes, balRes] = await Promise.all([
                axios.get(ENDPOINTS.DASHBOARD),
                axios.get(ENDPOINTS.LOGS),
                axios.get(ENDPOINTS.EMAILS),
                axios.get(ENDPOINTS.BILLS),
                axios.get(ENDPOINTS.HISTORY),
                axios.get(ENDPOINTS.BALANCE)
            ]);

            setData(dashRes.data);
            setLogs(logsRes.data);
            setEmailLogs(emailsRes.data);
            setBills(billsRes.data);
            setTransactions(historyRes.data);
            setCommonBalance(balRes.data);
            setIsConnected(true);

            // Graph Logic (The "Heartbeat")
            setGraphHistory(prev => {
                const now = new Date();
                const timeLabel = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
                const validPower = Number(dashRes.data.totalPower) || 0;
                const newPoint = { time: timeLabel, power: validPower };
                let updated = [...prev, newPoint];
                if (updated.length > 20) updated.shift();
                return updated;
            });

        } catch (err) {
            console.error("Connection Lost or Auth Failed:", err);
            if (err.response && err.response.status === 403) {
                console.warn("⚠️ Security Alert: Session Expired. Logging out.");
                onLogout();
            } else {
                setIsConnected(false);
            }
        }
    }, [token, onLogout]);

    // --- THE POLLING LOOP ---
    useEffect(() => {
        if (!token) return;

        fetchData();
        const interval = setInterval(fetchData, 1000);

        const handleVisibilityChange = () => {
            if (!document.hidden) fetchData();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchData, token]);

    return (
        <EnergyContext.Provider value={{
            data, logs, emailLogs, bills, transactions, commonBalance, graphHistory, isConnected,
            setBills, setCommonBalance, fetchData
        }}>
            {children}
        </EnergyContext.Provider>
    );
};