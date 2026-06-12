import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../../config';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
 const navigate = useNavigate();
 const [devToken] = useState(() => localStorage.getItem("devToken"));
 const [keys, setKeys] = useState([]);
 const [stats, setStats] = useState(null);
 const [logs, setLogs] = useState([]);
 const [apiTransactions, setApiTransactions] = useState([]);
 const [availableCountries, setAvailableCountries] = useState([]);
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const API = getApiUrl();
 const headers = { Authorization: `Bearer ${devToken}`, "Content-Type": "application/json" };

 const fetchAll = useCallback(async () => {
 if (!devToken) {
 navigate("/login");
 return;
 }
 setLoading(true);
 try {
 const [keysRes, statsRes, logsRes, txRes, countriesRes, profileRes] = await Promise.all([
 fetch(`${API}/developer/keys`, { headers }),
 fetch(`${API}/developer/stats`, { headers }),
 fetch(`${API}/developer/logs?limit=20`, { headers }),
 fetch(`${API}/developer/transactions`, { headers }),
 fetch(`${API}/developer/countries`, { headers }),
 fetch(`${API}/developer/profile`, { headers }),
 ]);

 if (keysRes.status === 401) {
 localStorage.removeItem("devToken");
 navigate("/login");
 return;
 }

 const [keysData, statsData, logsData, txData, countriesData, profileData] = await Promise.all([
 keysRes.json(),
 statsRes.json(),
 logsRes.json(),
 txRes.json(),
 countriesRes.json(),
 profileRes.json(),
 ]);

 setKeys(keysData.keys || []);
 setStats(statsData || null);
 setLogs(logsData.logs || []);
 setApiTransactions(txData.transactions || []);
 setAvailableCountries(countriesData.countries || []);
 setProfile(profileData || null);
 } catch (e) {
 console.error(e);
 setError(e.message);
 } finally {
 setLoading(false);
 }
 }, [devToken, navigate, API]);

 useEffect(() => {
 fetchAll();
 }, [fetchAll]);

 return (
 <DashboardContext.Provider value={{
 keys, setKeys, stats, setStats, logs, setLogs, 
 apiTransactions, setApiTransactions, availableCountries, setAvailableCountries,
 profile, setProfile,
 loading, error, refresh: fetchAll, devToken, headers, API
 }}>
 {children}
 </DashboardContext.Provider>
 );
};

export const useDashboard = () => {
 const context = useContext(DashboardContext);
 if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
 return context;
};
