import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('samarthya_token') || null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize and check current user
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await apiRequest('/auth/me');
          setUser(profile);
          fetchNotifications();
        } catch (err) {
          console.warn('Failed to load user profile with token:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
    loadDemoAccounts();
  }, [token]);

  const loadDemoAccounts = async () => {
    try {
      const accounts = await apiRequest('/auth/demo-accounts');
      setDemoAccounts(accounts);
    } catch (e) {
      console.warn('Could not load demo accounts:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifs = await apiRequest('/notifications');
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (e) {
      // ignore
    }
  };

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('samarthya_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    fetchNotifications();
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiRequest('/auth/register', 'POST', userData);
    localStorage.setItem('samarthya_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    fetchNotifications();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('samarthya_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  // Instant persona switcher helper
  const switchPersona = async (email, defaultPassword = 'DemoPassword123!') => {
    const pass = email.includes('admin') ? 'AdminSecretPass123!' : (email.includes('kulkarni') ? 'ReviewerPass123!' : defaultPassword);
    return await login(email, pass);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      demoAccounts,
      switchPersona,
      notifications,
      unreadCount,
      fetchNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
