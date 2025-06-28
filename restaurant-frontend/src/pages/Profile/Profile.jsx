import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) return;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await getUserProfile();
        setProfileData(data);
      } catch (err) {
        if (err.message.includes('Authentication') || err.message.includes('credentials')) {
          // If authentication failed, redirect to login
          navigate('/login');
        } else {
          setError('Failed to fetch profile data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Show loading while profile data is being fetched
  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Use user data from AuthContext if profileData is not available
  const displayUser = profileData?.user || user;
  const phone = profileData?.phone || 'Not provided';
  const address = profileData?.address || 'Not provided';
  const orders = profileData?.orders || [];

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {(displayUser?.username || displayUser?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{displayUser?.first_name || displayUser?.username || 'User'}</h1>
            <p>{displayUser?.email || 'No email provided'}</p>
          </div>
        </div>

        <div className="profile-details">
          <h2>Contact Information</h2>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Address:</strong> {address}</p>
        </div>

        <div className="profile-orders">
          <h2>Recent Orders</h2>
          {orders && orders.length > 0 ? (
            <ul className="order-list">
              {orders.map(order => (
                <li key={order.id} className="order-item">
                  <div className="order-info">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">{new Date(order.order_date).toLocaleDateString()}</span>
                  </div>
                  <div className="order-details">
                    <span>Total: ${parseFloat(order.total_amount).toFixed(2)}</span>
                    <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no recent orders.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 