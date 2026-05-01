const IP_ADDRESS = '10.229.207.87'; 

export const API_URL = `http://${IP_ADDRESS}:8080/api`;

export const ENDPOINTS = {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    DASHBOARD: `${API_URL}/energy/dashboard`,
    LOGS: `${API_URL}/energy/logs`,
    EMAILS: `${API_URL}/energy/emails`,
    BILLS: `${API_URL}/energy/bills/pending`,
    CREATE_ORDER: `${API_URL}/energy/payment/create-order`,
    VERIFY_PAYMENT: `${API_URL}/energy/payment/verify`,
    HISTORY: `${API_URL}/energy/payment/history`,
    BALANCE: `${API_URL}/energy/payment/balance`,
};