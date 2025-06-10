import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext';
import Navbar from './components/Navbar';
import AlertModal from './components/AlertModal';
import Home from './pages/Home';
import Menu from './pages/Menu';
import DishDetail from './pages/DishDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

// 🛡️ Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDishes from './pages/admin/AdminDishes';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AlertProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* 🌟 Customer Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/dish/:id" element={<DishDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  
                  {/* 🛡️ Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/dishes" element={<AdminDishes />} />
                  <Route path="/admin/customers" element={<AdminCustomers />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                </Routes>
              </main>
              
              {/* Global Alert Modal */}
              <AlertModal />
            </div>
          </Router>
        </AlertProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 