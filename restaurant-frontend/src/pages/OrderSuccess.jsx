import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { CheckCircle, ShoppingCart, Home, ArrowLeft } from 'lucide-react';
import { checkoutAPI } from '../services/api';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setLoading(false);
      navigate('/'); // Redirect if no session ID
    }
  }, [searchParams]);

  useEffect(() => {
    if (orderData) {
      clearCart();
    }
  }, [orderData]);

  const verifyPayment = async (sessionId) => {
    try {
      const data = await checkoutAPI.verifyPayment(sessionId);
      if (data.success) {
        setOrderData(data);
      } else {
        console.error('Failed to verify payment:', data.error);
        navigate('/order-cancelled');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      navigate('/order-cancelled');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader text="Verifying your payment, please wait..." />;
  }
  
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-10 rounded-2xl shadow-xl"
        >
            <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-6">We couldn't confirm your order details. Please try again or contact support.</p>
            <button
                onClick={() => navigate('/menu')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
                Back to Menu
            </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
            className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
                >
                    <CheckCircle className="text-green-600 w-16 h-16" />
                </motion.div>

                <motion.h1 
                    className="text-3xl font-bold text-gray-900 mt-6 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Order Confirmed!
                </motion.h1>
                <motion.p 
                    className="text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Thank you for your purchase! Your payment was successful.
                </motion.p>
            </div>

            <motion.div 
                className="bg-gray-50 rounded-lg p-6 my-8 border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium text-gray-900">#{orderData.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-green-600">${parseFloat(orderData.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Order Status:</span>
                        <span className="font-medium text-orange-500 capitalize">Pending</span>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <h3 className="text-md font-semibold text-blue-800 mb-2">What's Next?</h3>
                <p className="text-blue-700 text-sm">
                    You'll receive an email confirmation shortly. You can track your order status in the "My Orders" section.
                </p>
            </motion.div>

            <motion.div 
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                    <ShoppingCart size={20} />
                    View My Orders
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                    <Home size={20} />
                    Back to Home
                </button>
            </motion.div>

        </motion.div>
    </div>
  );
};

export default OrderSuccess; 