import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults once
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

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

  // Helper function to update user state and storage
  const updateUserState = (userData) => {
    if (userData && userData.is_authenticated) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get('/api/check-user-type/');
      updateUserState(data);
    } catch (error) {
      console.error('API Error: Auth check failed', { message: error.message });
      updateUserState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      checkAuthStatus();
    }
  }, []);

  const login = async (identity, password) => {
    try {
      const { data, status } = await axios.post('/api/login/', { identity, password });
      if (status === 200) {
        // Directly update state with login response
        updateUserState({ ...data.user, is_authenticated: true });
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('API Error: Login failed', { message: error.message, response: error.response });
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const { data, status } = await axios.post('/api/admin/login/', { email, password });
      if (status === 200) {
        // Directly update state with admin login response
        updateUserState({ ...data.user, is_authenticated: true, is_admin: true });
        return { success: true };
      }
      return { success: false, error: 'Admin login failed' };
    } catch (error) {
      console.error('API Error: Admin login failed', { message: error.message, response: error.response });
      return { success: false, error: error.response?.data?.error || 'Admin login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register/', userData);
      if (response.status === 201 || response.status === 200) {
        // Automatically log in after successful registration
        await login(userData.username, userData.password);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('API Error: Registration failed', { message: error.message, response: error.response });
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout/');
    } catch (error) {
      console.error('API Error: Logout failed', { message: error.message });
    } finally {
      // Always clear state and storage on logout
      updateUserState(null);
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
      {!loading && children}
    </AuthContext.Provider>
  );
}; 