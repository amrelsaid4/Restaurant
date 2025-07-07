import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Providers
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { CartProvider } from './contexts/CartContext';

// Import new Layout
import Layout from './components/layout/Layout';

// Import pages
import Home from './pages/Home/Home';
import Menu from './pages/Menu/Menu';
import DishDetail from './pages/DishDetail/DishDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import CheckoutTest from './pages/Checkout/CheckoutTest';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import VerifyPhone from './pages/VerifyPhone';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancelled from './pages/OrderCancelled';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDishes from './pages/admin/AdminDishes';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';

// Import updated components
import { PageLoader } from './components/ui/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import AlertModal from './components/AlertModal';
import Navbar from './components/layout/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

/**
 * Protected Route Component for Private Pages
 */
const PrivateRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

/**
 * Main App Component
 * - Router setup
 * - Notifications setup
 * - Apply new system
 */
function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <CartProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50">
                <Navbar />
                <Toast />
                
                {/* Alert Modal */}
                <AlertModal />
                
                {/* Main Routing */}
                <Routes>
                  {/* Public pages */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="dish/:id" element={<DishDetail />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                    <Route path="checkout-test" element={<CheckoutTest />} />
                    <Route path="order-success" element={<OrderSuccess />} />
                    <Route path="order-cancelled" element={<OrderCancelled />} />
                    <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                    
                    {/* Admin pages */}
                    <Route path="admin">
                      <Route path="dashboard" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
                      <Route path="orders" element={<PrivateRoute adminOnly={true}><AdminOrders /></PrivateRoute>} />
                      <Route path="dishes" element={<PrivateRoute adminOnly={true}><AdminDishes /></PrivateRoute>} />
                      <Route path="categories" element={<PrivateRoute adminOnly={true}><AdminCategories /></PrivateRoute>} />
                      <Route path="customers" element={<PrivateRoute adminOnly={true}><AdminCustomers /></PrivateRoute>} />
                    </Route>
                  </Route>
                  
                  {/* Login and Register pages (without Layout) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-phone" element={<VerifyPhone />} />
                  
                  {/* Redirect for non-existent pages */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </CartProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App; 