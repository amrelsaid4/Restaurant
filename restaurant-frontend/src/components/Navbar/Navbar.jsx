import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
        
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
        
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Authenticated User Links */}
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                // Admin-specific links
                <>
                  <li className="nav-item">
                    <Link to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/orders" className="nav-link" onClick={closeMobileMenu}>Orders</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/dishes" className="nav-link" onClick={closeMobileMenu}>Dishes</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/customers" className="nav-link" onClick={closeMobileMenu}>Customers</Link>
                  </li>
                </>
              ) : (
                // Customer-specific links
                <>
                  <li className="nav-item">
                    <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/menu" className="nav-link" onClick={closeMobileMenu}>Menu</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>Profile</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/orders" className="nav-link" onClick={closeMobileMenu}>My Orders</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/cart" className="nav-link cart-link" onClick={closeMobileMenu}>
                      🛒 Cart ({getTotalItems()})
                    </Link>
                  </li>
                </>
              )}
              {/* Logout button for all authenticated users */}
              <li className="nav-item">
                <Link onClick={handleLogout} className="nav-link">
                  Logout ({user?.username})
                </Link>
              </li>
            </>
          ) : (
            // Guest Links
            <>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/menu" className="nav-link" onClick={closeMobileMenu}>Menu</Link>
              </li>
              <li className="nav-item">
                <Link to="/cart" className="nav-link cart-link" onClick={closeMobileMenu}>
                  🛒 Cart ({getTotalItems()})
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-link login-link" onClick={closeMobileMenu}>Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-link" onClick={closeMobileMenu}>Register</Link>
              </li>
            </>
          )}
        </ul>
        
        {isMobileMenuOpen && (
          <div className="menu-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 