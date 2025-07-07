import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess } = useAlert();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Verify payment and get order details
      verifyPayment(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stripe/success/?session_id=${sessionId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
        showSuccess('Your order has been confirmed!', 'Payment Successful');
      } else {
        setPaymentStatus('error');
        setPaymentError('Payment verification failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      setPaymentError('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2>Verifying your payment...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      padding: '2rem 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: '#28a745',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '40px'
          }}>
            ✅
          </div>

          <h1 style={{
            color: '#333',
            marginBottom: '1rem',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            Order Confirmed!
          </h1>

          {orderData && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
                Thank you for your order! Your payment has been processed successfully.
              </p>
              
              <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '10px',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                {orderData.order_id && (
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Order ID:</strong> #{orderData.order_id}
                  </p>
                )}
                {orderData.total_amount && (
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Total Amount:</strong> ${parseFloat(orderData.total_amount).toFixed(2)}
                  </p>
                )}
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>Status:</strong> <span style={{ color: '#28a745' }}>Confirmed</span>
                </p>
              </div>
            </div>
          )}

          <div style={{
            background: '#e3f2fd',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>What's Next?</h3>
            <ul style={{ 
              textAlign: 'left', 
              color: '#666',
              paddingLeft: '1.5rem',
              margin: 0
            }}>
              <li>You'll receive an email confirmation shortly</li>
              <li>Your order is being prepared</li>
              <li>Estimated delivery time: 30-45 minutes</li>
              <li>You can track your order in the Orders section</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#218838'}
              onMouseOut={(e) => e.target.style.background = '#28a745'}
            >
              View My Orders
            </button>
            
            <button
              onClick={() => navigate('/menu')}
              style={{
                background: 'transparent',
                color: '#6c757d',
                border: '2px solid #6c757d',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#6c757d';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6c757d';
              }}
            >
              Continue Shopping
            </button>
            
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'transparent',
                color: '#6c757d',
                border: '2px solid #6c757d',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#6c757d';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6c757d';
              }}
            >
              Back to Home
            </button>
          </div>

          <div style={{
            background: '#fff3cd',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '2rem',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ color: '#856404', margin: '0 0 0.5rem 0' }}>Need Help?</h4>
            <p style={{ color: '#856404', margin: 0, fontSize: '0.9rem' }}>
              If you have any questions about your order, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 