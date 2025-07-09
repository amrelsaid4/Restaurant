import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Add safety check for cart - default to empty array if undefined
  const cartItems = cart || [];

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id, name) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`);
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const promoCodes = {
      'WELCOME20': 0.20,
      'SAVE10': 0.10,
      'NEWUSER': 0.15
    };
    
    if (promoCodes[promoCode.toUpperCase()]) {
      setDiscount(promoCodes[promoCode.toUpperCase()]);
      toast.success(`Promo code applied! ${(promoCodes[promoCode.toUpperCase()] * 100)}% off`);
    } else {
      toast.error('Invalid promo code');
    }
    
    setLoading(false);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    // Prepare checkout data and store in session storage
    const checkoutData = {
      items: cartItems.map(item => ({
        dish_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        special_instructions: item.specialInstructions || '',
      })),
      subtotal: subtotal,
      total: total,
    };
    
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    navigate('/checkout');
  };

  const subtotal = getTotalPrice ? getTotalPrice() : 0;
  const discountAmount = subtotal * discount;
  const deliveryFee = subtotal > 50 ? 0 : 5;
  const total = subtotal - discountAmount + deliveryFee;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🛒
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any delicious items to your cart yet!
          </p>
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/menu"
                className="inline-block w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🍽️ Browse Menu
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-block w-full px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                🏠 Go Home
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🛒 Your Cart
            </motion.h1>
            <motion.p 
              className="text-orange-100 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Review your delicious selections
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          className="flex flex-col lg:flex-row gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
                <motion.button
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  onClick={() => {
                    clearCart();
                    toast.success('Cart cleared');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗑️ Clear All
                </motion.button>
              </div>

              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                    variants={itemVariants}
                    exit="exit"
                    layout
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-orange-600 font-medium mb-1">${parseFloat(item.price).toFixed(2)}</p>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600 bg-yellow-50 px-2 py-1 rounded border-l-2 border-yellow-400">
                          <span className="font-medium">Note:</span> {item.specialInstructions}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <motion.button
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        -
                      </motion.button>
                      <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        +
                      </motion.button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🗑️
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 sticky top-4"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  <motion.button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      loading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                    onClick={handlePromoCode}
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.05 } : {}}
                    whileTap={!loading ? { scale: 0.95 } : {}}
                  >
                    {loading ? '...' : 'Apply'}
                  </motion.button>
                </div>
                {discount > 0 && (
                  <motion.p 
                    className="text-green-600 text-sm mt-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ✅ {(discount * 100)}% discount applied!
                  </motion.p>
                )}
              </div>

              {/* Order Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <motion.div 
                    className="flex justify-between text-green-600"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span>Discount ({(discount * 100)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </motion.div>
                )}
                
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="flex items-center">
                    ${deliveryFee.toFixed(2)}
                    {subtotal > 50 && (
                      <span className="ml-2 text-green-600 text-sm">FREE</span>
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Free Delivery Notice */}
              {subtotal < 50 && (
                <motion.div 
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-orange-700 text-sm">
                    🚚 Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🛒 Proceed to Checkout
                </motion.button>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/menu"
                    className="block w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-center"
                  >
                    ← Continue Shopping
                  </Link>
                </motion.div>
              </div>

              {/* Payment Options */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">We Accept</h3>
                <div className="flex space-x-2">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    💳
                  </div>
                  <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    💰
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart; 