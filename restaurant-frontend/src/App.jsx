import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { CartProvider } from '@/contexts/CartContext';

import Navbar from '@/components/Navbar/Navbar';
import AlertModal from './components/AlertModal';
import Home from '@/pages/Home/Home';
import Menu from '@/pages/Menu/Menu';
import DishDetail from '@/pages/DishDetail/DishDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout/Checkout';
import CheckoutTest from '@/pages/Checkout/CheckoutTest';
import Login from '@/pages/Login/Login';
import Register from '@/pages/Register/Register';
import Profile from '@/pages/Profile/Profile';
import Orders from '@/pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancelled from './pages/OrderCancelled';

// 🛡️ Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminDishes from '@/pages/admin/AdminDishes';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminCategories from '@/pages/admin/AdminCategories';

import './App.css';

const PrivateRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  


  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />; // Or a 'not authorized' page
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <AlertModal />
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/dish/:id" element={<DishDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/checkout-test" element={<CheckoutTest />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancelled" element={<OrderCancelled />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
                <Route path="/admin/orders" element={<PrivateRoute adminOnly={true}><AdminOrders /></PrivateRoute>} />
                <Route path="/admin/dishes" element={<PrivateRoute adminOnly={true}><AdminDishes /></PrivateRoute>} />
                <Route path="/admin/categories" element={<PrivateRoute adminOnly={true}><AdminCategories /></PrivateRoute>} />
                <Route path="/admin/customers" element={<PrivateRoute adminOnly={true}><AdminCustomers /></PrivateRoute>} />

              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App; 