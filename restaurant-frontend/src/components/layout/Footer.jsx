import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from '../icons/IconLibrary';

/**
 * Advanced Footer Component
 * - Modern responsive design
 * - Various useful links
 * - Restaurant information and contact
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 opacity-50"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Main row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Restaurant information section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {React.createElement(Icons.restaurant, { className: "w-8 h-8 text-primary-400" })}
              <h3 className="text-xl font-bold">Fine Dining Restaurant</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              We offer the finest authentic Eastern and Arabic dishes with the highest quality and best service in a comfortable and family-friendly atmosphere.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                {React.createElement(Icons.share, { className: "w-5 h-5" })}
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                {React.createElement(Icons.photo, { className: "w-5 h-5" })}
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                {React.createElement(Icons.chat, { className: "w-5 h-5" })}
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                {React.createElement(Icons.video, { className: "w-5 h-5" })}
              </a>
            </div>
          </div>

          {/* Quick links section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  {React.createElement(Icons.home, { className: "w-4 h-4" })}
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/menu" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  {React.createElement(Icons.menu, { className: "w-4 h-4" })}
                  <span>Menu</span>
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  {React.createElement(Icons.info, { className: "w-4 h-4" })}
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  {React.createElement(Icons.phone, { className: "w-4 h-4" })}
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Services section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Our Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-300 flex items-center space-x-2 rtl:space-x-reverse">
                {React.createElement(Icons.truck, { className: "w-4 h-4 text-primary-400" })}
                <span>Fast Delivery</span>
              </li>
              <li className="text-gray-300 flex items-center space-x-2 rtl:space-x-reverse">
                {React.createElement(Icons.clock, { className: "w-4 h-4 text-primary-400" })}
                <span>24/7 Service</span>
              </li>
              <li className="text-gray-300 flex items-center space-x-2 rtl:space-x-reverse">
                {React.createElement(Icons.shield, { className: "w-4 h-4 text-primary-400" })}
                <span>Quality Guarantee</span>
              </li>
              <li className="text-gray-300 flex items-center space-x-2 rtl:space-x-reverse">
                {React.createElement(Icons.heart, { className: "w-4 h-4 text-primary-400" })}
                <span>Healthy Dishes</span>
              </li>
            </ul>
          </div>

          {/* Contact information section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {React.createElement(Icons.location, { className: "w-5 h-5 text-primary-400 flex-shrink-0" })}
                <span className="text-gray-300 text-sm">King Fahd Street, Riyadh, Saudi Arabia</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {React.createElement(Icons.phone, { className: "w-5 h-5 text-primary-400 flex-shrink-0" })}
                <span className="text-gray-300 text-sm">+966 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {React.createElement(Icons.email, { className: "w-5 h-5 text-primary-400 flex-shrink-0" })}
                <span className="text-gray-300 text-sm">info@restaurant.com</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {React.createElement(Icons.clock, { className: "w-5 h-5 text-primary-400 flex-shrink-0" })}
                <span className="text-gray-300 text-sm">Daily: 10:00 AM - 12:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-white mb-4">Subscribe to Newsletter</h4>
            <p className="text-gray-300 text-sm mb-6">
              Subscribe to receive the latest offers and new dishes directly to your email
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse">
                {React.createElement(Icons.send, { className: "w-4 h-4" })}
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Fine Dining Restaurant. All rights reserved.
            </div>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 