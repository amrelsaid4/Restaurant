import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            // Failed to parse cart from localStorage, start with empty cart
            setCartItems([]);
        }
    }, []);

    // Save cart to localStorage whenever cartItems changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        window.dispatchEvent(new Event('cartUpdated'));
    }, [cartItems]);

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

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.dish?.price || item.price || 0) * item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
        cartTotal: cartItems.reduce((total, item) => total + (item.dish?.price || item.price || 0) * item.quantity, 0),
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 