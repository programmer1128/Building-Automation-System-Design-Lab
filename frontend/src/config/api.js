const BASE_URL = "http://localhost:8080/api/energy";

export const ENDPOINTS = {
    DASHBOARD: `${BASE_URL}/dashboard`,
    LOGS: `${BASE_URL}/logs`,
    EMAILS: `${BASE_URL}/emails`,
    BILLS: `${BASE_URL}/bills/pending`,
    HISTORY: `${BASE_URL}/payment/history`,
    BALANCE: `${BASE_URL}/payment/balance`,
    CREATE_ORDER: `${BASE_URL}/payment/create-order`,
    VERIFY_PAYMENT: `${BASE_URL}/payment/verify`
};