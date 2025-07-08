import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '../services/api';

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Show success message if coming from successful payment
    if (location.state?.message) {
      showSuccess(location.state.message);
    }
    
    fetchOrders();
  }, [location.state?.message, isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await apiService('orders/', 'GET');
      const orderData = response.results || response;
      // Ensure we always set an array
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      if (error.response?.status === 401) {
        showError('Please log in to view your orders.');
        navigate('/login');
        return;
      }
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'preparing': '#fd7e14',
      'ready': '#28a745',
      'delivered': '#6c757d',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchOrders} style={{
          background: '#007bff',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No orders yet</h3>
          <p>When you place your first order, it will appear here.</p>
          <button 
            onClick={() => navigate('/menu')}
            style={{
              background: '#28a745',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <span style={{
                  background: getStatusColor(order.status),
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Total:</strong> ${parseFloat(order.total_amount).toFixed(2)}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Payment:</strong> 
                  <span style={{ 
                    color: order.payment_status === 'paid' ? '#28a745' : '#ffc107',
                    marginLeft: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Delivery Address:</strong> {order.delivery_address}
                </p>
                {order.special_instructions && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Special Instructions:</strong> {order.special_instructions}
                  </p>
                )}
              </div>

              {order.items && order.items.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Items:</h4>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px' }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span>{(item.dish_name || item.dish?.name)} x {item.quantity}</span>
                        <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 