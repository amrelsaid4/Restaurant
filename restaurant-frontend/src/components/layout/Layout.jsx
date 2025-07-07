import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Main Layout Component
 * Contains main content area
 */
const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 