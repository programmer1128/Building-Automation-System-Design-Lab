import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from '@/constants/Config';
import { Colors } from '@/constants/Colors';

export type DeviceStatus = 'OFF' | 'NORMAL' | 'SPIKE' | 'ANOMALY' | 'BREAKDOWN';

// Data Types
export type Device = {
  deviceId: string;
  name: string;
  type: string;
  wattage: number;
  isOn: boolean;
  breakdown: boolean;
  anomaly: boolean;
  injected: boolean;
  uiStatus: DeviceStatus;
  uiMessage: string;
  uiColor: string;
};

export type SystemLog = { id: number; timestamp: string; deviceId: string; breakdown: boolean; power: number; };
export type EmailLog = { id: number; sentAt: string; deviceId: string; recipient: string; subject: string; body: string; };
export type Bill = { id: number; deviceId: string; amount: number; generatedAt: string; };
export type Transaction = { id: number; razorpayPaymentId: string; payerName: string; payerEmail: string; amount: number; itemsPaid: string; timestamp: string; };

type GraphData = {
  dataPoints: any[];
  currentLoad: number;
  yAxisMax: number;
  devices: Device[];
  logs: SystemLog[];
  emailLogs: EmailLog[]; 
  bills: Bill[]; 
  transactions: Transaction[]; 
  commonBalance: number; // <--- NEW EXPORT
  refreshData: () => void;
  getDeviceById: (id: string) => Device | undefined;
};

const GraphContext = createContext<GraphData | null>(null);
const MAX_POINTS = 20;

const getDeviceUiInfo = (d: any, wattage: number): { status: DeviceStatus, message: string, color: string } => {
  const backendStatus = d.uiStatus || 'OK'; 
  if (backendStatus === 'FAIL') return { status: 'BREAKDOWN', message: 'POTENTIAL BREAKDOWN AHEAD', color: '#ef4444' };
  if (backendStatus === 'WARN') return { status: 'ANOMALY', message: 'Anomaly Detected', color: '#f97316' };
  if (backendStatus === 'SPIKE') return { status: 'SPIKE', message: 'Temporary Spike', color: '#eab308' };
  if (wattage > 0) return { status: 'NORMAL', message: 'System Nominal', color: '#10b981' };
  return { status: 'OFF', message: 'Offline', color: Colors.dark.textMuted };
};

export const GraphProvider = ({ children }: { children: React.ReactNode }) => {
  const [dataPoints, setDataPoints] = useState<any[]>(Array(MAX_POINTS).fill({ value: 0, label: '' }));
  const [currentLoad, setCurrentLoad] = useState(0);
  const [yAxisMax, setYAxisMax] = useState(100);
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commonBalance, setCommonBalance] = useState(0); // <--- NEW STATE

  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (isSessionExpired) return;

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) return; 

      const headers = { Authorization: `Bearer ${token}` };

      // PARALLEL FETCHING: Add BALANCE
      const [dashRes, logsRes, emailsRes, billsRes, historyRes, balRes] = await Promise.all([
        axios.get(ENDPOINTS.DASHBOARD, { headers }),
        axios.get(ENDPOINTS.LOGS, { headers }),
        axios.get(ENDPOINTS.EMAILS, { headers }),
        axios.get(ENDPOINTS.BILLS, { headers }),
        axios.get(ENDPOINTS.HISTORY, { headers }),
        axios.get(ENDPOINTS.BALANCE, { headers }) // <--- FETCH BALANCE
      ]);

      // 1. Dashboard
      const power = dashRes.data.totalPower || 0;
      const cleanDevices = (dashRes.data.devices || []).map((d: any) => {
        const rawWattage = Number(d.wattage || d.power || d.load || 0);
        const { status, message, color } = getDeviceUiInfo(d, rawWattage);
        return {
            deviceId: d.deviceId || d.id || 'unknown',
            name: d.name || d.deviceName || d.deviceId || 'Unknown Device',
            type: d.type || d.deviceType || 'Generic',
            wattage: rawWattage,
            isOn: rawWattage > 0,
            breakdown: Boolean(d.breakdown),
            anomaly: Boolean(d.anomaly),
            injected: Boolean(d.injected || d.artificial || d.isInjected),
            uiStatus: status,
            uiMessage: message,
            uiColor: color,
        };
      });

      setCurrentLoad(power);
      setDevices(cleanDevices);
      setLogs(logsRes.data || []);
      setEmailLogs(emailsRes.data || []);
      setBills(billsRes.data || []);
      setTransactions(historyRes.data || []);
      setCommonBalance(balRes.data || 0); // <--- SET BALANCE

      setDataPoints((prev) => {
        const newArray = [...prev]; newArray.shift(); newArray.push({ value: power, label: '' });
        const maxVal = Math.max(...newArray.map((p) => p.value));
        setYAxisMax(maxVal > 100 ? maxVal * 1.2 : 100);
        return newArray;
      });

    } catch (error: any) {
       if (error.response && error.response.status === 403) {
           console.log("⚠️ Security Alert: 403 Forbidden Detected.");
           setIsSessionExpired(true);
       }
    }
  }, [isSessionExpired]);

  useEffect(() => {
    if (isSessionExpired) {
        const performLogout = async () => {
            try {
                await AsyncStorage.removeItem('jwtToken');
                setDevices([]); setLogs([]); setEmailLogs([]); setBills([]); setTransactions([]); setCommonBalance(0);
                setTimeout(() => {
                    if (router.canGoBack()) router.dismissAll();
                    router.replace('/');
                }, 100);
            } catch (e) { console.log("Logout Error:", e); }
        };
        performLogout();
    }
  }, [isSessionExpired]);

  useEffect(() => {
    if (isSessionExpired) return;
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData, isSessionExpired]);

  const getDeviceById = useCallback((id: string) => devices.find(d => d.deviceId === id), [devices]);

  return (
    <GraphContext.Provider value={{ dataPoints, currentLoad, yAxisMax, devices, logs, emailLogs, bills, transactions, commonBalance, refreshData: fetchData, getDeviceById }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphData = () => {
  const context = useContext(GraphContext);
  if (!context) throw new Error('useGraphData must be used within a GraphProvider');
  return context;
};