import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address
      });

      setSuccess('Account created successfully! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const registerPageStyles = {
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
      maxWidth: '500px',
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
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem'
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
      outline: 'none',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      minHeight: '80px',
      resize: 'vertical'
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
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
    success: {
      background: '#dcfce7',
      color: '#166534',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '14px',
      border: '1px solid #bbf7d0'
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
    }
  };

  return (
    <div style={registerPageStyles.container}>
      <div style={registerPageStyles.card}>
        <h2 style={registerPageStyles.title}>Create Account</h2>
        
        {error && (
          <div style={registerPageStyles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={registerPageStyles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={registerPageStyles.formRow}>
            <div>
              <label style={registerPageStyles.label}>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
                style={registerPageStyles.input}
              />
            </div>
            <div>
              <label style={registerPageStyles.label}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
                style={registerPageStyles.input}
              />
            </div>
          </div>

          <div style={registerPageStyles.formGroup}>
            <label style={registerPageStyles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              style={registerPageStyles.input}
            />
          </div>

          <div style={registerPageStyles.formGroup}>
            <label style={registerPageStyles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              style={registerPageStyles.input}
            />
          </div>

          <div style={registerPageStyles.formRow}>
            <div>
              <label style={registerPageStyles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                style={registerPageStyles.input}
              />
            </div>
            <div>
              <label style={registerPageStyles.label}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                style={registerPageStyles.input}
              />
            </div>
          </div>

          <div style={registerPageStyles.formGroup}>
            <label style={registerPageStyles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              style={registerPageStyles.input}
            />
          </div>

          <div style={registerPageStyles.formGroup}>
            <label style={registerPageStyles.label}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              style={registerPageStyles.textarea}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={registerPageStyles.button}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={registerPageStyles.link}>
          Already have an account? <Link to="/login" style={registerPageStyles.linkAnchor}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 