import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
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

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      if (error.response?.data) {
        setErrors({
          ...errors,
          apiError: error.response.data.error || 'Registration failed. Please try again.'
        });
      } else {
        setErrors({
          ...errors,
          apiError: 'Network error. Please check your connection.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Branding */}
        <div className="register-image-section">
          <div className="register-brand">
            Delicious Bites
          </div>
          <p className="register-tagline">
            Join our culinary community and experience exceptional dining
          </p>
          <div className="register-benefits">
            <div className="register-benefit">
              <span className="register-benefit-icon">🎯</span>
              <span className="register-benefit-text">
                Priority reservations and exclusive offers
              </span>
            </div>
            <div className="register-benefit">
              <span className="register-benefit-icon">⭐</span>
              <span className="register-benefit-text">
                Personalized dining recommendations
              </span>
            </div>
            <div className="register-benefit">
              <span className="register-benefit-icon">🎉</span>
              <span className="register-benefit-text">
                Special birthday and anniversary treats
              </span>
            </div>
            <div className="register-benefit">
              <span className="register-benefit-icon">📱</span>
              <span className="register-benefit-text">
                Easy online ordering and delivery tracking
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-section">
          <div className="register-header">
            <h2 className="register-title">Create Account</h2>
            <p className="register-subtitle">
              Join us for an unforgettable dining experience
            </p>
          </div>

          {errors.apiError && (
            <div className="validation-message error">
              <span className="validation-icon">⚠️</span>
              {errors.apiError}
            </div>
          )}

          {success && (
            <div className="validation-message success">
              <span className="validation-icon">✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Name Fields */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <div className="validation-message error">
                    <span className="validation-icon">⚠️</span>
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <div className="validation-message error">
                    <span className="validation-icon">⚠️</span>
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Choose a username"
              />
              {errors.username && (
                <div className="validation-message error">
                  <span className="validation-icon">⚠️</span>
                  {errors.username}
                </div>
              )}
            </div>

            {/* Contact Fields */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <div className="validation-message error">
                    <span className="validation-icon">⚠️</span>
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <div className="validation-message error">
                    <span className="validation-icon">⚠️</span>
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <div className="validation-message error">
                    <span className="validation-icon">⚠️</span>
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="validation-message error">
                    <span className="validation-icon">⚠️</span>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address" className="form-label">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your address"
                rows="3"
              ></textarea>
            </div>

            {/* Terms and Conditions */}
            <div className="terms-section">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="terms-checkbox"
              />
              <label htmlFor="termsAccepted" className="terms-text">
                I agree to the{' '}
                <Link to="/terms" className="terms-link">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="terms-link">Privacy Policy</Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <div className="validation-message error">
                <span className="validation-icon">⚠️</span>
                {errors.termsAccepted}
              </div>
            )}

            <button 
              type="submit" 
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : 'Create My Account'}
            </button>
          </form>

          <div className="form-links">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="form-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;