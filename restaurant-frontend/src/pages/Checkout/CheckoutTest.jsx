import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useCart } from '../../contexts/CartContext';


const CheckoutTest = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const { showSuccess, showError } = useAlert();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get checkout data from sessionStorage (no auth required for guest checkout)
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    if (!storedCheckoutData) {
      navigate('/cart');
      return;
    }
    setCheckoutData(JSON.parse(storedCheckoutData));
  }, [navigate]);

  const handleStripeCheckout = async () => {
    setLoading(true);
    
    try {
      
      // Create checkout session
      const response = await fetch('http://127.0.0.1:8000/api/stripe/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: checkoutData.items,
          delivery_address: checkoutData.delivery_address,
          special_instructions: checkoutData.special_instructions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkout_url, session_id, total_amount } = await response.json();
      
      
      // Save session info for success page
      sessionStorage.setItem('stripe_session_id', session_id);
      sessionStorage.setItem('checkout_total', total_amount.toString());
      
      // Redirect to Stripe Checkout
      window.location.href = checkout_url;
      
    } catch (error) {
      showError(error.message || 'Failed to start checkout. Please try again.', 'Checkout Error');
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">
          <h2>Loading checkout data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1>🛒 Order Summary</h1>
        
        <div className="checkout-grid">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Your Order</h2>
            
            <div className="order-items">
              {checkoutData.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    {item.special_instructions && (
                      <p className="special-instructions">
                        <small>Special: {item.special_instructions}</small>
                      </p>
                    )}
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="delivery-info">
              <h3>Delivery Information</h3>
              <p><strong>Address:</strong> {checkoutData.delivery_address}</p>
              {checkoutData.special_instructions && (
                <p><strong>Special Instructions:</strong> {checkoutData.special_instructions}</p>
              )}
            </div>

            <div className="total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${checkoutData.total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee:</span>
                <span>$3.99</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>${(checkoutData.total + 3.99).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="payment-section">
            <h2>🔒 Secure Checkout</h2>
            
            <div className="stripe-info">
              <div className="stripe-logo">
                <img 
                  src="https://stripe.com/img/v3/home/twitter.png" 
                  alt="Stripe" 
                  style={{ width: '60px', height: 'auto' }}
                />
              </div>
              <p>Powered by Stripe - Secure payment processing</p>
              <ul className="payment-features">
                <li>✅ SSL encrypted payments</li>
                <li>✅ PCI DSS compliant</li>
                <li>✅ Accept all major cards</li>
                <li>✅ Mobile-friendly checkout</li>
              </ul>
            </div>

            <button 
              onClick={handleStripeCheckout}
              disabled={loading}
              className="checkout-button"
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                marginTop: '20px',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <span>
                  <span className="spinner"></span>
                  Creating Checkout...
                </span>
              ) : (
                <span>
                  🚀 Proceed to Stripe Checkout - ${(checkoutData.total + 3.99).toFixed(2)}
                </span>
              )}
            </button>

            <div className="checkout-note">
              <p>
                <strong>Note:</strong> You'll be redirected to Stripe's secure checkout page 
                where you can safely enter your payment information.
              </p>
            </div>

            <div className="security-badges">
              <div className="security-info">
                <p className="security-text">
                  🔒 Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-actions">
          <button 
            onClick={() => navigate('/cart')} 
            className="btn btn-secondary"
            disabled={loading}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
      
      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .checkout-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
        }
        
        .stripe-info {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .payment-features {
          list-style: none;
          padding: 0;
          margin: 15px 0;
        }
        
        .payment-features li {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .checkout-note {
          margin-top: 15px;
          padding: 12px;
          background: #e3f2fd;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .security-badges {
          margin-top: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default CheckoutTest; 