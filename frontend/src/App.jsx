import React, { useState, useCallback } from 'react';
import Auth from './components/Auth';
import { EnergyProvider } from './context/EnergyContext';
import Dashboard from './components/Dashboard';

function App() {
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));

    const handleLogin = (newToken) => {
        setToken(newToken);
    };

    const handleLogout = useCallback(() => {
        console.log("🔒 Logging out due to security threat or user request");
        localStorage.removeItem('jwtToken');
        setToken(null);
    }, []);

    if (!token) {
        return <Auth onLogin={handleLogin} />;
    }

    return (
        <EnergyProvider token={token} onLogout={handleLogout}>
            <Dashboard onLogout={handleLogout} />
        </EnergyProvider>
    );
}

export default App;