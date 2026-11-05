import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('naturale_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.login(email, password);
      setAdminUser(data.user);
      localStorage.setItem('naturale_admin_user', JSON.stringify(data.user));
      localStorage.setItem('naturale_admin_token', data.token);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('naturale_admin_user');
    localStorage.removeItem('naturale_admin_token');
  };

  return (
    <AuthContext.Provider value={{ adminUser, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

