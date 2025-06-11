import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (dish) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item.id === dish.id);
            if (itemExists) {
                return prevItems.map(item =>
                    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...dish, quantity: 1 }];
        });
    };

    const removeFromCart = (dishId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== dishId));
    };

    const updateQuantity = (dishId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(dishId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === dishId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
        cartTotal: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 