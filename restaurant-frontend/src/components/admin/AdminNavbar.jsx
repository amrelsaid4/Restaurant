import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/admin/dashboard', text: 'Dashboard' },
    { to: '/admin/orders', text: 'Orders' },
    { to: '/admin/dishes', text: 'Menu' },
    { to: '/admin/categories', text: 'Categories' },
    { to: '/admin/customers', text: 'Customers' },
  ];

  const getLinkClass = (path, isMobile = false) => {
    const baseClass = isMobile
      ? 'block px-3 py-2 rounded-md text-base font-medium'
      : 'px-3 py-2 transition-colors';
    
    const activeClass = isMobile
      ? 'text-orange-600 bg-orange-50'
      : 'text-orange-600 border-b-2 border-orange-600';
      
    const inactiveClass = isMobile
      ? 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
      : 'text-gray-600 hover:text-orange-600';
      
    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-orange-600">
              Restaurant Admin
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={getLinkClass(link.to)}>
                {link.text}
              </Link>
            ))}
            <Link 
              to="/" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              View Website
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className={getLinkClass(link.to, true)}>
                  {link.text}
                </Link>
              ))}
              <Link to="/" className={getLinkClass('/', true)}>View Website</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AdminNavbar; 