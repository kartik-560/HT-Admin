'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { setBasicAuth, clearAuth, restoreAuth } from '@/lib/axios';
import api from '@/lib/axios';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const basicAuth = localStorage.getItem('basicAuth');
    
    if (basicAuth && savedUser) {
      restoreAuth();
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    if (!phone || !password) {
      throw new Error('Phone and password are required');
    }

    try {
      // Step 1: Set Basic Auth headers and cookies
      setBasicAuth(phone, password);

      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 2: Make POST request to /users/login
      const response = await api.post('/users/login', {});

      console.log('Login successful:', response.data);

      // Step 3: Store user info
      const userData = { 
        id: response.data.user.id,
        name: response.data.user.name,
        phone: response.data.user.phone,
        createdAt: response.data.user.createdAt,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      clearAuth();
      localStorage.removeItem('user');
      
      const errorMessage = error.response?.data?.error || error.message || 'Invalid phone or password';
      console.error('Login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    clearAuth();
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
