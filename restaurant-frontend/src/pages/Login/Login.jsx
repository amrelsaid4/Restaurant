import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/components/icons/IconLibrary';

const Login = () => {
  const [formData, setFormData] = useState({
    identity: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const { login, adminLogin, isAuthenticated, isAdmin, user, loading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();

  // 🔥 KEY FIX: Wait for auth state to be ready before redirecting
  useEffect(() => {
    console.log('🔍 Auth state monitor:', { 
      isAuthenticated, 
      isAdmin, 
      user: !!user, 
      authLoading, 
      initialized,
      pendingNavigation 
    });


    if (initialized && !authLoading && isAuthenticated && user) {
      console.log('🎯 Auth state ready for navigation');
      
      if (isAdmin) {
        console.log('🔴 Admin user - navigating to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('🟢 Customer user - navigating to home');
        navigate('/', { replace: true });
      }
      
      // Clear pending navigation
      setPendingNavigation(null);
    }
  }, [isAuthenticated, isAdmin, user, authLoading, initialized, navigate, pendingNavigation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleTabChange = (type) => {
    setLoginType(type);
    setError('');
    setFormData({
      identity: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    setError('');

    try {
      let result;
      if (loginType === 'admin') {
        result = await adminLogin({ email: formData.email, password: formData.password });
      } else {
        result = await login({ identity: formData.identity, password: formData.password });
      }
      
      if (result && result.success) {
        toast.success('Login successful! 🎉');
        console.log('✅ Login successful, setting pending navigation');
        
        // Set pending navigation flag - useEffect will handle actual navigation
        setPendingNavigation(loginType);
        
        console.log('⏳ Waiting for auth state to update...');
      } else {
        setError(result?.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const benefits = [
    {
      icon: Icons.shield,
      text: "Secure and fast login system",
      color: "text-green-600"
    },
    {
      icon: Icons.restaurant,
      text: "Access to exclusive menu items", 
      color: "text-orange-600"
    },
    {
      icon: Icons.mobile,
      text: "Seamless ordering experience",
      color: "text-blue-600"
    },
    {
      icon: Icons.lightning,
      text: "Quick checkout and delivery",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex">
      <motion.div 
        className="flex w-full max-w-6xl mx-auto my-auto shadow-2xl rounded-2xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Branding */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-red-600 p-12 text-white relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center">
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <h1 className="text-4xl font-bold mb-4">Fine Dining</h1>
              <p className="text-xl text-orange-100">
                Welcome back to exceptional culinary experiences
              </p>
            </motion.div>

            <motion.div 
              className="space-y-6"
              variants={itemVariants}
            >
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-4"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {React.createElement(benefit.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <span className="text-orange-100">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          className="w-full lg:w-1/2 bg-white p-8 lg:p-12"
          variants={itemVariants}
        >
          <div className="max-w-md mx-auto">
            <motion.div 
              className="mb-8 text-center"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">
                Sign in to continue your culinary journey
              </p>
            </motion.div>
            
            {/* Login Type Tabs */}
            <motion.div 
              className="flex mb-6 bg-gray-100 rounded-xl p-1"
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={() => handleTabChange('customer')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loginType === 'customer' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {React.createElement(Icons.user, { className: "w-5 h-5" })}
                <span>Customer</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loginType === 'admin' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {React.createElement(Icons.admin, { className: "w-5 h-5" })}
                <span>Admin</span>
              </motion.button>
            </motion.div>
            
            {/* Error Message */}
            {error && (
              <motion.div 
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {React.createElement(Icons.warning, { className: "w-5 h-5 text-red-600 flex-shrink-0" })}
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={itemVariants}
            >
              {/* Email/Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {loginType === 'customer' ? 'Username or Email' : 'Admin Email'}
                </label>
                <motion.input
                  type={loginType === 'customer' ? 'text' : 'email'}
                  name={loginType === 'customer' ? 'identity' : 'email'}
                  value={loginType === 'customer' ? formData.identity : formData.email}
                  onChange={handleChange}
                  required
                  placeholder={loginType === 'customer' ? 'Enter your username or email' : 'admin@restaurant.com'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {React.createElement(showPassword ? Icons.eye : Icons.eyeOff, { className: "w-5 h-5" })}
                  </motion.button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                }`}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  `Sign in as ${loginType === 'customer' ? 'Customer' : 'Admin'}`
                )}
              </motion.button>
            </motion.form>

            {/* Register Link */}
            {loginType === 'customer' && (
              <motion.div 
                className="mt-6 text-center"
                variants={itemVariants}
              >
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 