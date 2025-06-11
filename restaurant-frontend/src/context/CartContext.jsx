import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (dish, quantity = 1, specialInstructions = '') => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.dish.id === dish.id && item.specialInstructions === specialInstructions
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.dish.id === dish.id && item.specialInstructions === specialInstructions
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { 
          dish, 
          quantity, 
          specialInstructions,
          id: Date.now() // Simple ID for cart item
        }];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== cartItemId)
    );
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.dish.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 