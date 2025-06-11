import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import './Profile.css'; // We will create this file for styling

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/profile/');
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data. Please try again later.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="profile-container"><h2>Loading Profile...</h2></div>;
  }

  if (error) {
    return <div className="profile-container"><p className="error-message">{error}</p></div>;
  }

  if (!profileData) {
    return <div className="profile-container"><p>No profile data available.</p></div>;
  }

  const { user: profileUser, phone, address, orders } = profileData;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{profileUser.first_name || profileUser.username}</h1>
            <p>{profileUser.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <h2>Contact Information</h2>
          <p><strong>Phone:</strong> {phone || 'Not provided'}</p>
          <p><strong>Address:</strong> {address || 'Not provided'}</p>
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