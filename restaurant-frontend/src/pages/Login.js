import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loginType, setLoginType] = useState('customer'); // 'customer' or 'admin'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (type) => {
    setLoginType(type);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (loginType === 'admin') {
      result = await adminLogin(formData.email, formData.password);
      if (result.success) {
        navigate('/admin/dashboard');
      }
    } else {
      result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/');
      }
    }
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const loginPageStyles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
      padding: '3rem',
      maxWidth: '450px',
      width: '100%'
    },
    title: {
      textAlign: 'center',
      marginBottom: '2rem',
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2d3748',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    tabContainer: {
      display: 'flex',
      marginBottom: '2rem',
      borderRadius: '12px',
      background: '#f7fafc',
      padding: '6px'
    },
    tab: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      background: 'transparent',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    activeTab: {
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transform: 'translateY(-1px)'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#667eea'
    },
    button: {
      width: '100%',
      padding: '14px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    customerButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    adminButton: {
      background: 'linear-gradient(135deg, #dc3545 0%, #e55353 100%)',
      color: 'white'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    },
    error: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '14px',
      border: '1px solid #fecaca'
    },
    link: {
      textAlign: 'center',
      marginTop: '1.5rem',
      fontSize: '14px',
      color: '#6b7280'
    },
    linkAnchor: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600'
    },
    adminInfo: {
      textAlign: 'center',
      marginTop: '1rem',
      padding: '16px',
      background: '#f0f9ff',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#0369a1',
      border: '1px solid #bae6fd'
    }
  };

  return (
    <div style={loginPageStyles.container}>
      <div style={loginPageStyles.card}>
        <h2 style={loginPageStyles.title}>Welcome Back</h2>
        
        {/* Login Type Tabs */}
        <div style={loginPageStyles.tabContainer}>
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            style={{
              ...loginPageStyles.tab,
              ...(loginType === 'customer' ? loginPageStyles.activeTab : {}),
              color: loginType === 'customer' ? '#667eea' : '#6b7280'
            }}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            style={{
              ...loginPageStyles.tab,
              ...(loginType === 'admin' ? loginPageStyles.activeTab : {}),
              color: loginType === 'admin' ? '#dc3545' : '#6b7280'
            }}
          >
            Admin
          </button>
        </div>
        
        {error && (
          <div style={loginPageStyles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {loginType === 'customer' ? (
            <div style={loginPageStyles.formGroup}>
              <label style={loginPageStyles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                style={loginPageStyles.input}
              />
            </div>
          ) : (
            <div style={loginPageStyles.formGroup}>
              <label style={loginPageStyles.label}>Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@restaurant.com"
                style={loginPageStyles.input}
              />
            </div>
          )}

          <div style={loginPageStyles.formGroup}>
            <label style={loginPageStyles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              style={loginPageStyles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...loginPageStyles.button,
              ...(loginType === 'admin' ? loginPageStyles.adminButton : loginPageStyles.customerButton)
            }}
          >
            {loading ? 'Signing in...' : 
             loginType === 'admin' ? 'Admin Login' : 'Sign In'}
          </button>
        </form>

        {loginType === 'customer' && (
          <p style={loginPageStyles.link}>
            Don't have an account? <Link to="/register" style={loginPageStyles.linkAnchor}>Register here</Link>
          </p>
        )}

        {loginType === 'admin' && (
          <div style={loginPageStyles.adminInfo}>
            <strong>Admin Credentials:</strong><br/>
            Email: admin@restaurant.com<br/>
            Password: admin123
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 