import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import axios from 'axios';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to place an order.',
        type: 'warning'
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!address.trim()) {
      setModalState({
        isOpen: true,
        title: 'Address Required',
        message: 'Please enter a delivery address to continue.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        delivery_address: address,
        special_instructions: instructions,
        items: cartItems.map(item => ({
          dish_id: item.dish.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions || ''
        }))
      };

      const response = await axios.post('/api/orders/', orderData);
      
      if (response.status === 201) {
        clearCart();
        setModalState({
          isOpen: true,
          title: 'Order Placed Successfully!',
          message: 'Your order has been placed and will be prepared shortly. You can track your order status in the "My Orders" section.',
          type: 'success'
        });
        setTimeout(() => navigate('/orders'), 3000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setModalState({
        isOpen: true,
        title: 'Order Failed',
        message: 'Failed to place order. Please check your details and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p>Add some delicious dishes to your cart!</p>
        <button 
          onClick={() => navigate('/menu')} 
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Shopping Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map(item => (
            <div key={item.id} className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3>{item.dish.name}</h3>
                    <p>Price: ${item.dish.price}</p>
                    {item.specialInstructions && (
                      <p><small>Special Instructions: {item.specialInstructions}</small></p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        style={{ 
                          padding: '5px 10px', 
                          border: '1px solid #ddd', 
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        style={{ 
                          padding: '5px 10px', 
                          border: '1px solid #ddd', 
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                    
                    <div style={{ minWidth: '4rem', textAlign: 'right' }}>
                      <strong>${(item.dish.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-danger"
                      style={{ padding: '5px 10px' }}
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
        <div className="card">
          <div className="card-body">
            <h3>Order Summary</h3>
            <div style={{ margin: '1rem 0', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total: </span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions for your order"
                rows="2"
              />
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading || !address.trim()}
              className="btn btn-success"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            {!isAuthenticated && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                You need to <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>login</button> to place an order.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default Cart; 