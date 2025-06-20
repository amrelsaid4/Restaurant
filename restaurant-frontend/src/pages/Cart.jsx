import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showWarning('Please login to place an order.', 'Login Required');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!address.trim()) {
      showWarning('Please enter a delivery address to continue.', 'Address Required');
      return;
    }

    // Prepare checkout data and navigate to checkout page
    const checkoutData = {
      items: cartItems.map(item => ({
        dish_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        special_instructions: item.specialInstructions || ''
      })),
      delivery_address: address,
      special_instructions: instructions,
      total: getTotalPrice()
    };

    // Store checkout data in sessionStorage for checkout page
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate('/checkout-test'); // Use test checkout for now
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Add some delicious dishes to your cart!</p>
          <button 
            onClick={() => navigate('/menu')} 
            className="btn btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-grid">
        {/* Cart Items */}
        <div>
          {cartItems.map(item => (
            <div key={item.id} className="card cart-item-card">
              <div className="card-body">
                <div className="cart-item-content">
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>Price: ${item.price}</p>
                    {item.specialInstructions && (
                      <p><small>Special Instructions: {item.specialInstructions}</small></p>
                    )}
                  </div>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div className="card checkout-card">
          <div className="card-body">
            <h3>Order Summary</h3>
            <div className="order-summary-total">
              <div className="total-display">
                <span>Total: </span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="📍 Enter your complete delivery address"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea
                className="form-control"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="✨ Any special instructions for your order (optional)"
                rows="2"
              />
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!address.trim()}
              className="checkout-btn"
            >
              Proceed to Payment
            </button>

            {!isAuthenticated && (
              <p className="login-prompt">
                You need to <button onClick={() => navigate('/login')} className="login-link">login</button> to place an order.
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Cart; 