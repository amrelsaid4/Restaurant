import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
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
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          🍽️ Fine Dining Restaurant
        </Link>
        
        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {!isAdmin && (
            <>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🏠</span>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/menu" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">📋</span>
                  Menu
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/cart" className="nav-link cart-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🛒</span>
                  Cart ({getTotalItems()})
                </Link>
              </li>
            </>
          )}
          
          {isAdmin && (
            <>
              <li className="nav-item">
                <Link to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/orders" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">📋</span>
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/dishes" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🍕</span>
                  Dishes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/categories" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">📂</span>
                  Categories
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/customers" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">👥</span>
                  Customers
                </Link>
              </li>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className="nav-link admin-link" onClick={closeMobileMenu}>
                    <span className="nav-icon">🛡️</span>
                    Admin Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/orders" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">📦</span>
                      My Orders
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">👤</span>
                      My Profile
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-button">
                  <span className="nav-icon">🚪</span>
                  Logout ({user?.username || user?.email})
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link login-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🔑</span>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">📝</span>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
        
        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div className="menu-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 