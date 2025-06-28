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
import axios from 'axios';
import { apiService } from '@/services/api';
import './Checkout.css';

const CheckoutForm = ({ checkoutData, onSuccess }) => {
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
      // Create payment intent
      const paymentIntentResponse = await apiService('stripe/create-payment-intent/', 'POST', {
        amount: checkoutData.total,
        delivery_address: checkoutData.delivery_address,
        special_instructions: checkoutData.special_instructions,
        items: checkoutData.items
      });

      const { client_secret, payment_intent_id, test_mode } = paymentIntentResponse;

      if (test_mode) {
        // Development mode - simulate successful payment
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
            name: checkoutData.customer_name || 'Customer',
          },
        }
      });

      if (error) {
        setPaymentError(error.message);
        showError(error.message, 'Payment Failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful, create order in database
        const orderResponse = await apiService('stripe/confirm-payment/', 'POST', {
          payment_intent_id: payment_intent_id,
          delivery_address: checkoutData.delivery_address,
          special_instructions: checkoutData.special_instructions,
          items: checkoutData.items
        });

        if (orderResponse.success) {
          showSuccess('Payment successful! Your order has been placed.', 'Order Confirmed');
          onSuccess(orderResponse.order_id);
        } else {
          throw new Error('Failed to create order after payment');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Payment failed. Please try again.';
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
      <div style={{ 
        background: '#fff3cd', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #ffeaa7'
      }}>
        <h4>🧪 Development Mode</h4>
        <p>This is running in test mode. Any card details will work - no real payment will be processed.</p>
        <p>Use card: <strong>4242 4242 4242 4242</strong>, CVV: <strong>123</strong>, Expiry: <strong>12/25</strong></p>
      </div>

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

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const { showError } = useAlert();
  const [checkoutData, setCheckoutData] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      showError('Please log in to place an order.');
      navigate('/login');
      return;
    }

    // Get checkout data from sessionStorage first
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    if (!storedCheckoutData) {
      // No checkout data, redirect to cart
      navigate('/cart');
      return;
    }
    setCheckoutData(JSON.parse(storedCheckoutData));

    // Get Stripe config and initialize
    const getStripeConfig = async () => {
      try {
        const response = await apiService('stripe/config/');
        
        if (response && response.publishable_key) {
          const stripeInstance = await loadStripe(response.publishable_key);
          setStripePromise(Promise.resolve(stripeInstance));
        } else {
          throw new Error('Invalid Stripe config response');
        }
      } catch (error) {
        // Don't show error alert here to avoid infinite loop
      }
    };

    getStripeConfig();
  }, [navigate, isAuthenticated]); // Removed showError from dependencies

  // Remove duplicate authentication check

  const handlePaymentSuccess = (orderId) => {
    // Clear cart and checkout data
    clearCart();
    sessionStorage.removeItem('checkoutData');
    
    // Redirect to order confirmation or orders page
    navigate('/orders', { 
      state: { 
        message: 'Your order has been placed successfully!',
        orderId: orderId 
      }
    });
  };

  if (!checkoutData) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">
          <h2>Loading checkout data...</h2>
          <p>Preparing your order information...</p>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="checkout-container">
        <div className="checkout-content">
          <h1>Checkout</h1>
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
            margin: '2rem auto',
            maxWidth: '600px'
          }}>
            <h2>⚠️ Payment System Loading</h2>
            <p>We're setting up the payment system. Please wait a moment or refresh the page.</p>
            <p><strong>If this persists, the backend server might not be running.</strong></p>
            <p>Backend should be running at: <code>http://127.0.0.1:8000</code></p>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
                style={{ marginRight: '1rem' }}
              >
                🔄 Refresh Page
              </button>
              <button 
                onClick={() => navigate('/cart')} 
                className="btn btn-secondary"
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1>Checkout</h1>
        
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
            <h2>Payment Information</h2>
            
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  checkoutData={{
                    ...checkoutData,
                    total: checkoutData.total + 3.99 // Include delivery fee
                  }}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #ddd'
              }}>
                <h3>Loading payment system...</h3>
                <p>Please wait while we prepare the payment form.</p>
              </div>
            )}

            <div className="security-info">
              <p className="security-text">
                🔒 Your payment information is encrypted and secure
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

export default Checkout; 