import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

/**
 * Navigation Bar with Dynamic Menu Based on User Type
 * - Admin: Home, Menu, Admin Dashboard
 * - Customer: Home, Menu, About, Contact, Profile, Orders, Cart
 * - Guest: Home, Menu, About, Contact, Login, Sign Up
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout, loading: authLoading, initialized } = useAuth();
  const { cart } = useCart();

  console.log('🔍 Navbar render - Auth state:', { 
    isAuthenticated, 
    isAdmin, 
    user: !!user, 
    authLoading, 
    initialized,
    cartCount: cart?.length || 0
  });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  // Define navigation links based on user type
  const getNavLinks = () => {
    // Don't show any links until auth is initialized
    if (!initialized || authLoading) return [];
    
    if (isAuthenticated && isAdmin) {
      // Admin navigation
      return [
        { to: '/', label: 'Home' },
        { to: '/menu', label: 'Menu' },
        { to: '/admin/dashboard', label: 'Admin Dashboard', isAdmin: true }
      ];
    } else if (isAuthenticated && !isAdmin) {
      // Customer navigation
      return [
        { to: '/', label: 'Home' },
        { to: '/menu', label: 'Menu' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' }
      ];
    } else {
      // Guest navigation
      return [
        { to: '/', label: 'Home' },
        { to: '/menu', label: 'Menu' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' }
      ];
    }
  };

  const navLinks = getNavLinks();
  const isActiveLink = (path) => location.pathname === path;
  const cartCount = cart?.length || 0;

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
            : 'bg-white/90 backdrop-blur-sm shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🏪</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">Fine Dining</h1>
                  <p className="text-xs text-gray-500">Exceptional Experience</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.div
                  key={link.to}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink(link.to)
                        ? 'bg-orange-600 text-white shadow-lg'
                        : link.isAdmin 
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {initialized && !authLoading && (
                <>
                  {/* Cart (only for customers) */}
                  {isAuthenticated && !isAdmin && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/cart" className="relative">
                        <button className="p-2 text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                          🛒
                        </button>
                        {cartCount > 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center">
                            {cartCount}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  )}

                  {/* User Actions */}
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      {/* Profile and Orders (only for customers) */}
                      {!isAdmin && (
                        <>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/profile">
                              <button className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium">
                                Profile
                              </button>
                            </Link>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/orders">
                              <button className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium">
                                Orders
                              </button>
                            </Link>
                          </motion.div>
                        </>
                      )}
                      
                      {/* Welcome message */}
                      <div className="px-3 py-2 text-sm text-gray-600">
                        Welcome, {user?.first_name || user?.username || 'User'}
                        {isAdmin && ' 🔴 (Admin)'}
                      </div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={handleLogout}
                          className="px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Logout
                        </button>
                      </motion.div>
                    </div>
                  ) : (
                    /* Guest Actions */
                    <div className="flex items-center space-x-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/login">
                          <button className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium">
                            Login
                          </button>
                        </Link>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/register">
                          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm font-medium">
                            Sign Up
                          </button>
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
              
              {/* Loading state */}
              {(!initialized || authLoading) && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                ☰
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🏪</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Fine Dining</h2>
                    <p className="text-sm text-gray-500">Exceptional Experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActiveLink(link.to)
                        ? 'bg-orange-600 text-white'
                        : link.isAdmin
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile User Actions */}
              <div className="border-t border-gray-200 p-6">
                {initialized && !authLoading && (
                  <>
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-lg">👤</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.first_name || user?.username || 'User'}
                              {isAdmin && ' 🔴'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {isAdmin ? 'Administrator' : 'Customer'}
                            </p>
                          </div>
                        </div>

                        {/* Customer specific actions */}
                        {!isAdmin && (
                          <>
                            <Link to="/profile" className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                              Profile
                            </Link>
                            <Link to="/orders" className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                              Orders
                            </Link>
                            <Link to="/cart" className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                              Cart ({cartCount})
                            </Link>
                          </>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-left"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          to="/login"
                          className="block w-full px-4 py-3 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full px-4 py-3 text-center bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </>
                )}
                
                {/* Mobile Loading state */}
                {(!initialized || authLoading) && (
                  <div className="flex items-center justify-center space-x-2 text-gray-500 py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                    <span>Loading authentication...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar; 