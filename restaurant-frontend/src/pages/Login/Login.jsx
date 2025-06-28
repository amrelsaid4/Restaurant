import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [loginType, setLoginType] = useState('customer');
  const [formData, setFormData] = useState({
    identity: '', // Use 'identity' for username or email
    email: '',    // For admin login
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleTabChange = (type) => {
    setLoginType(type);
    setError('');
    setFormData({
      identity: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (loginType === 'admin') {
        result = await adminLogin({ email: formData.email, password: formData.password });
      } else {
        result = await login({ identity: formData.identity, password: formData.password });
      }
      
      if (result.success) {
        const targetRoute = loginType === 'admin' ? '/admin/dashboard' : '/profile';
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          if (loginType === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/profile');
          }
        }, 100);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-image-section">
          <div className="login-brand">
            Fine Dining
          </div>
          <p className="login-tagline">
            Welcome back to exceptional culinary experiences
          </p>
          <div className="login-benefits">
            <div className="login-benefit">
              <span className="login-benefit-icon">🔐</span>
              <span className="login-benefit-text">
                Secure and fast login system
              </span>
            </div>
            <div className="login-benefit">
              <span className="login-benefit-icon">🍽️</span>
              <span className="login-benefit-text">
                Access to exclusive menu items
              </span>
            </div>
            <div className="login-benefit">
              <span className="login-benefit-icon">📱</span>
              <span className="login-benefit-text">
                Seamless ordering experience
              </span>
            </div>
            <div className="login-benefit">
              <span className="login-benefit-icon">⚡</span>
              <span className="login-benefit-text">
                Quick checkout and delivery
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to continue your culinary journey
            </p>
          </div>
          
          <div className="login-tab-container">
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`login-tab ${loginType === 'customer' ? 'active' : ''}`}
            >
              <span className="tab-icon">👤</span>
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`login-tab ${loginType === 'admin' ? 'active' : ''}`}
            >
              <span className="tab-icon">⚡</span>
              Admin
            </button>
          </div>
          
          {error && (
            <div className="validation-message error">
              <span className="validation-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {loginType === 'customer' ? (
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  name="identity"
                  value={formData.identity}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username or email"
                  className="form-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@restaurant.com"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`login-submit-btn ${loginType}`}
            >
              {loading && <div className="loading-spinner"></div>}
              {loading ? 'Signing in...' : 
               loginType === 'admin' ? 'Admin Access' : 'Sign In'}
            </button>
          </form>

          {loginType === 'customer' && (
            <div className="form-links">
              <p className="form-link">
                Don't have an account? <Link to="/register">Create Account</Link>
              </p>
            </div>
          )}

          {loginType === 'admin' && (
            <div className="admin-info">
              <div className="admin-credentials">
                <h4>Demo Admin Credentials:</h4>
                <p><strong>Email:</strong> admin@restaurant.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 