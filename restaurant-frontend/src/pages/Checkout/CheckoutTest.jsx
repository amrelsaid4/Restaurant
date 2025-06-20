import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { useCart } from '@/contexts/CartContext';
import './Checkout.css';

// Direct Stripe key for testing
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const TestCheckoutForm = ({ checkoutData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Payment system not ready. Please refresh the page.');
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      console.log('💳 Creating payment intent...');
      
      // Create payment intent with direct fetch (bypass authentication issues)
      const paymentIntentResponse = await fetch('http://127.0.0.1:8000/api/stripe/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: checkoutData.total,
          delivery_address: checkoutData.delivery_address,
          special_instructions: checkoutData.special_instructions,
          items: checkoutData.items
        })
      });

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { client_secret, payment_intent_id, test_mode } = await paymentIntentResponse.json();
      console.log('✅ Payment intent created:', payment_intent_id);

      if (test_mode) {
        // Development mode - simulate successful payment
        console.log('🧪 Test mode detected - simulating successful payment');
        showSuccess('Test payment simulated successfully! No real money charged.', 'Test Payment Complete');
        
        // Simulate order creation with test order ID
        const testOrderId = `TEST-ORDER-${Date.now()}`;
        setTimeout(() => {
          onSuccess(testOrderId);
        }, 1000);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Test Customer',
          },
        }
      });

      if (error) {
        setPaymentError(error.message);
        showError(error.message, 'Payment Failed');
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!');
        
        // For testing, just show success without creating order
        showSuccess('Payment successful! This is a test payment.', 'Test Payment Complete');
        
        // Simulate order creation
        setTimeout(() => {
          onSuccess('TEST-ORDER-123');
        }, 1000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      showError(errorMessage, 'Payment Error');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="card-element-container">
        <label className="form-label">Card Information</label>
        <CardElement 
          options={cardStyle} 
          className="card-element"
        />
        {paymentError && (
          <div className="payment-error">
            {paymentError}
          </div>
        )}
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #ffeaa7'
      }}>
        <h4>🧪 Test Mode</h4>
        <p>This is a test payment. Use card: <strong>4242 4242 4242 4242</strong></p>
        <p>CVV: <strong>123</strong>, Expiry: <strong>12/25</strong></p>
      </div>

      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Test Pay $${checkoutData.total.toFixed(2)}`}
      </button>
    </form>
  );
};

const CheckoutTest = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get checkout data from sessionStorage
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    if (!storedCheckoutData) {
      navigate('/cart');
      return;
    }
    setCheckoutData(JSON.parse(storedCheckoutData));
  }, [navigate, isAuthenticated]);

  const handlePaymentSuccess = (orderId) => {
    // Clear cart and checkout data
    clearCart();
    sessionStorage.removeItem('checkoutData');
    
    // Redirect to orders page
    navigate('/orders', { 
      state: { 
        message: 'Test payment completed successfully!',
        orderId: orderId 
      }
    });
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
        <h1>🧪 Test Checkout</h1>
        
        <div className="checkout-grid">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
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

          {/* Payment Form */}
          <div className="payment-section">
            <h2>Test Payment</h2>
            
            <Elements stripe={stripePromise}>
              <TestCheckoutForm 
                checkoutData={{
                  ...checkoutData,
                  total: checkoutData.total + 3.99
                }}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <div className="security-info">
              <p className="security-text">
                🧪 This is a test environment - no real money will be charged
              </p>
            </div>
          </div>
        </div>

        <div className="checkout-actions">
          <button 
            onClick={() => navigate('/cart')} 
            className="btn btn-secondary"
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTest; 