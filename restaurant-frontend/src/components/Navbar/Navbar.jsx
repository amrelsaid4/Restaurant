import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-orange-600 transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="text-orange-600">🍽️</span>
            <span className="hidden sm:block">Fine Dining</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <NavLink to="/admin/dashboard">Dashboard</NavLink>
                    <NavLink to="/admin/orders">Orders</NavLink>
                    <NavLink to="/admin/dishes">Dishes</NavLink>
                    <NavLink to="/admin/customers">Customers</NavLink>
                  </>
                ) : (
                  // Customer Navigation
                  <>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/menu">Menu</NavLink>
                    <NavLink to="/profile">Profile</NavLink>
                    <NavLink to="/orders">My Orders</NavLink>
                    <Link
                      to="/cart"
                      className="relative flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <span>🛒</span>
                      <span>Cart</span>
                      {getTotalItems() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getTotalItems()}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 rounded-lg transition-colors"
                    onClick={handleLogout}
                  >
                    <span>👤</span>
                    <span>{user?.username}</span>
                    <span className="text-red-600">🚪</span>
                  </button>
                </div>
              </>
            ) : (
              // Guest Navigation
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/menu">Menu</NavLink>
                <Link
                  to="/cart"
                  className="relative flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <span>🛒</span>
                  <span>Cart ({getTotalItems()})</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <span>🔑</span>
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                >
                  <span>👤</span>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden">
            <div className="p-4">
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      // Admin Mobile Menu
                      <>
                        <MobileNavLink to="/admin/dashboard" onClick={closeMobileMenu}>📊 Dashboard</MobileNavLink>
                        <MobileNavLink to="/admin/orders" onClick={closeMobileMenu}>📋 Orders</MobileNavLink>
                        <MobileNavLink to="/admin/dishes" onClick={closeMobileMenu}>🍽️ Dishes</MobileNavLink>
                        <MobileNavLink to="/admin/customers" onClick={closeMobileMenu}>👥 Customers</MobileNavLink>
                      </>
                    ) : (
                      // Customer Mobile Menu
                      <>
                        <MobileNavLink to="/" onClick={closeMobileMenu}>🏠 Home</MobileNavLink>
                        <MobileNavLink to="/menu" onClick={closeMobileMenu}>🍽️ Menu</MobileNavLink>
                        <MobileNavLink to="/profile" onClick={closeMobileMenu}>👤 Profile</MobileNavLink>
                        <MobileNavLink to="/orders" onClick={closeMobileMenu}>📋 My Orders</MobileNavLink>
                        <MobileNavLink to="/cart" onClick={closeMobileMenu}>
                          🛒 Cart ({getTotalItems()})
                        </MobileNavLink>
                      </>
                    )}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-600">
                        مسجل دخول: <span className="font-medium">{user?.username}</span>
                      </div>
                      <button
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={handleLogout}
                      >
                        <span>🚪</span>
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </>
                ) : (
                  // Guest Mobile Menu
                  <>
                    <MobileNavLink to="/" onClick={closeMobileMenu}>🏠 Home</MobileNavLink>
                    <MobileNavLink to="/menu" onClick={closeMobileMenu}>🍽️ Menu</MobileNavLink>
                    <MobileNavLink to="/cart" onClick={closeMobileMenu}>
                      🛒 Cart ({getTotalItems()})
                    </MobileNavLink>
                    <div className="pt-4 border-t border-gray-200">
                      <MobileNavLink to="/login" onClick={closeMobileMenu}>🔑 Login</MobileNavLink>
                      <MobileNavLink to="/register" onClick={closeMobileMenu}>👤 Register</MobileNavLink>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
  >
    <span>{children}</span>
  </Link>
);

// Mobile Navigation Link Component
const MobileNavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
    onClick={onClick}
  >
    <span>{children}</span>
  </Link>
);

export default Navbar; 