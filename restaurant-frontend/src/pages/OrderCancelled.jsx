import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCancelled = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
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
          {/* Cancel Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: '#dc3545',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '40px'
          }}>
            ❌
          </div>

          <h1 style={{
            color: '#333',
            marginBottom: '1rem',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            Order Cancelled
          </h1>

          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666',
            marginBottom: '2rem'
          }}>
            Your order was cancelled and no payment was processed. You can try placing your order again whenever you're ready.
          </p>

          <div style={{
            background: '#ffeaa7',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#d68910', marginBottom: '1rem' }}>What happened?</h3>
            <ul style={{ 
              textAlign: 'left', 
              color: '#856404',
              paddingLeft: '1.5rem',
              margin: 0
            }}>
              <li>You may have closed the payment window</li>
              <li>Your payment method might have been declined</li>
              <li>The payment process was interrupted</li>
              <li>You chose to cancel the transaction</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/cart')}
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
              Try Again
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
              Browse Menu
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
            background: '#d4edda',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '2rem',
            border: '1px solid #c3e6cb'
          }}>
            <h4 style={{ color: '#155724', margin: '0 0 0.5rem 0' }}>Don't worry!</h4>
            <p style={{ color: '#155724', margin: 0, fontSize: '0.9rem' }}>
              No payment was charged to your account. Your cart items are still saved and ready for checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCancelled; 