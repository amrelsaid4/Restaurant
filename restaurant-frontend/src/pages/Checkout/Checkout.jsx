import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import toast from 'react-hot-toast';
import { checkoutAPI } from '@/services/api';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    // Delivery Info
    deliveryType: 'delivery',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    specialInstructions: '',
  });

  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    if (!storedCheckoutData) {
      navigate('/cart');
      return;
    }
    setCheckoutData(JSON.parse(storedCheckoutData));
  }, [navigate]);

  const subtotal = getTotalPrice();
  const deliveryFee = orderForm.deliveryType === 'delivery' ? (subtotal > 50 ? 0 : 5) : 0;
  const tax = subtotal * 0.08;
  const tip = subtotal * 0.15;
  const total = subtotal + deliveryFee + tax + tip;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStepChange = (step) => {
    if (step > currentStep) {
      if (validateCurrentStep()) {
        setCurrentStep(step);
      }
    } else {
      setCurrentStep(step);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (orderForm.deliveryType === 'delivery') {
          if (!orderForm.address || !orderForm.city || !orderForm.zipCode || !orderForm.phone) {
            toast.error('Please fill in all delivery details');
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const orderPayload = {
        items: checkoutData.items,
        delivery_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.zipCode}`,
        special_instructions: orderForm.specialInstructions,
      };

      const response = await checkoutAPI.createCheckoutSession(orderPayload);
      
      sessionStorage.setItem('stripe_session_id', response.session_id);
      sessionStorage.setItem('checkout_total', response.total_amount.toString());

      window.location.href = response.checkout_url;

    } catch (error) {
      toast.error(error.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Delivery', icon: '🚚' },
    { id: 2, title: 'Review', icon: '✅' }
  ];

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
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
          <motion.button
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => navigate('/menu')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.h1 
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🛒 Checkout
            </motion.h1>
            <motion.p 
              className="text-orange-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Complete your order
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
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Progress Steps */}
            <motion.div 
              className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <motion.button
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all ${
                        currentStep >= step.id
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                      onClick={() => handleStepChange(step.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {step.icon}
                    </motion.button>
                    <div className="ml-3">
                      <div className={`font-medium ${
                        currentStep >= step.id ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-orange-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step Content */}
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-sm"
              variants={itemVariants}
            >
              <AnimatePresence mode="wait">
                {/* Step 1: Delivery Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
                    
                    {/* Delivery Type */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Delivery Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          type="button"
                          className={`p-4 border-2 rounded-lg transition-all ${
                            orderForm.deliveryType === 'delivery'
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setOrderForm(prev => ({ ...prev, deliveryType: 'delivery' }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-2xl mb-2">🚚</div>
                          <div className="font-medium">Delivery</div>
                          <div className="text-sm text-gray-600">
                            {subtotal > 50 ? 'Free' : '$5.00'}
                          </div>
                        </motion.button>
                        
                        <motion.button
                          type="button"
                          className={`p-4 border-2 rounded-lg transition-all ${
                            orderForm.deliveryType === 'pickup'
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setOrderForm(prev => ({ ...prev, deliveryType: 'pickup' }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-2xl mb-2">🏪</div>
                          <div className="font-medium">Pickup</div>
                          <div className="text-sm text-gray-600">Free</div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {orderForm.deliveryType === 'delivery' && (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                              Address
                          </label>
                          <input
                            type="text"
                              id="address" 
                            name="address"
                            value={orderForm.address}
                            onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                              placeholder="123 Main St"
                          />
                        </div>
                        
                          {/* City */}
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              id="city" 
                              name="city"
                              value={orderForm.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                              placeholder="Anytown"
                            />
                          </div>

                          {/* Zip Code */}
                          <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                              Zip Code
                            </label>
                            <input
                              type="text"
                              id="zipCode" 
                              name="zipCode"
                              value={orderForm.zipCode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                              placeholder="12345"
                            />
                        </div>
                        
                          {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                          </label>
                          <input
                            type="tel"
                              id="phone" 
                            name="phone"
                            value={orderForm.phone}
                            onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                              placeholder="(123) 456-7890"
                          />
                        </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Special Instructions */}
                    <div className="mb-6">
                      <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions (optional)
                      </label>
                      <textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        rows="3"
                        value={orderForm.specialInstructions}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., leave at the front door"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        type="button"
                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
                        onClick={() => handleStepChange(2)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Review Order →
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Review & Place Order */}
                {currentStep === 2 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                    
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center mb-2">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Delivery Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{orderForm.deliveryType}</span>
                        </div>
                        {orderForm.deliveryType === 'delivery' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Address:</span>
                              <span className="font-medium text-right max-w-xs">
                                {orderForm.address}, {orderForm.city} {orderForm.zipCode}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{orderForm.phone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium capitalize">Secure Stripe Checkout</span>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <motion.button
                        type="button"
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                        onClick={() => handleStepChange(1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        type="submit"
                        className={`px-8 py-3 rounded-lg font-medium text-white transition-all ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                        }`}
                        onClick={handleSubmitOrder}
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.05 } : {}}
                        whileTap={!loading ? { scale: 0.95 } : {}}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          'Proceed to Payment 🚀'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 sticky top-4"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tip (15%)</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 mb-4">
                🔒 Your payment information is secure and encrypted
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout; 