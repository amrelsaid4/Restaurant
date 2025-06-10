import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://127.0.0.1:8000';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/check-user-type/');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      // Get CSRF token
      await axios.get('/api-auth/login/');
      
      // Login
      const response = await axios.post('/api-auth/login/', {
        username,
        password
      });

      if (response.status === 200) {
        await checkAuthStatus();
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await axios.post('/api/admin/login/', {
        email,
        password
      });

      if (response.status === 200) {
        await checkAuthStatus();
        return { success: true, data: response.data };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Admin login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api-auth/logout/');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    adminLogin,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    isCustomer: user?.is_customer || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 