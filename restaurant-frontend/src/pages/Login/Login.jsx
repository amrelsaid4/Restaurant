import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import './Login.css'; // Assuming a Login.css file for styling

const Login = () => {
  const [loginType, setLoginType] = useState('customer');
  const [formData, setFormData] = useState({
    identity: '', // Use 'identity' for username or email
    email: '',    // For admin login
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
      identity: '',
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
      if (result && result.success) {
        navigate('/admin/dashboard');
      }
    } else {
      result = await login(formData.identity, formData.password);
      if (result && result.success) {
        navigate('/profile'); // Redirect to profile page
      }
    }
    
    if (result && !result.success) {
      setError(result.error || 'An unexpected error occurred.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        
        <div className="login-tab-container">
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`login-tab ${loginType === 'customer' ? 'active' : ''}`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`login-tab ${loginType === 'admin' ? 'active' : ''}`}
          >
            Admin
          </button>
        </div>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {loginType === 'customer' ? (
            <div className="login-form-group">
              <label className="login-label">Username or Email</label>
              <input
                type="text"
                name="identity"
                value={formData.identity}
                onChange={handleChange}
                required
                placeholder="Enter your username or email"
                className="login-input"
              />
            </div>
          ) : (
            <div className="login-form-group">
              <label className="login-label">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@restaurant.com"
                className="login-input"
              />
            </div>
          )}

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="login-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`login-button ${loginType === 'admin' ? 'admin' : 'customer'}`}
          >
            {loading ? 'Signing in...' : 
             loginType === 'admin' ? 'Admin Login' : 'Sign In'}
          </button>
        </form>

        {loginType === 'customer' && (
          <p className="login-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        )}

        {loginType === 'admin' && (
          <div className="login-admin-info">
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