import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { showSuccess } = useAlert();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data for now
      setTimeout(() => {
        setOrders([
          {
            id: 1,
            customer: { user: { first_name: 'Ahmed', last_name: 'Salem' } },
            order_date: '2024-06-10T10:30:00',
            status: 'pending',
            total_amount: 120.50,
            items: [
              { dish: { name: 'Margherita Pizza' }, quantity: 2 },
              { dish: { name: 'Cola' }, quantity: 1 }
            ]
          },
          {
            id: 2,
            customer: { user: { first_name: 'Sarah', last_name: 'Mohamed' } },
            order_date: '2024-06-10T11:15:00',
            status: 'preparing',
            total_amount: 85.00,
            items: [
              { dish: { name: 'Cheese Burger' }, quantity: 1 },
              { dish: { name: 'Mango Juice' }, quantity: 1 }
            ]
          },
          {
            id: 3,
            customer: { user: { first_name: 'Omar', last_name: 'Hassan' } },
            order_date: '2024-06-10T09:45:00',
            status: 'delivered',
            total_amount: 200.75,
            items: [
              { dish: { name: 'Spaghetti Bolognese' }, quantity: 2 },
              { dish: { name: 'Caesar Salad' }, quantity: 1 }
            ]
          }
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update order status in mock data
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      showSuccess(`Order #${orderId} status updated to: ${getStatusLabel(newStatus)}`, 'Status Updated');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      preparing: '👨‍🍳 Preparing',
      ready: '🍽️ Ready',
      delivered: '🚚 Delivered',
      cancelled: '❌ Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'var(--warning-orange)',
      confirmed: 'var(--info-blue)',
      preparing: 'var(--primary-orange)',
      ready: 'var(--success-green)',
      delivered: 'var(--primary-green)',
      cancelled: 'var(--danger-red)'
    };
    return colors[status] || 'var(--medium-gray)';
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <div className="admin-sidebar">
        <div style={{ padding: '0 2rem' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
            🛡️ Admin Panel
          </h3>
          
          <nav className="admin-nav">
            <Link to="/admin/dashboard" className="admin-nav-link">
              📊 Dashboard
            </Link>
            <Link to="/admin/orders" className="admin-nav-link active">
              📋 Orders
            </Link>
            <Link to="/admin/dishes" className="admin-nav-link">
              🍕 Dishes
            </Link>
            <Link to="/admin/categories" className="admin-nav-link">
              📂 Categories
            </Link>
            <Link to="/admin/customers" className="admin-nav-link">
              👥 Customers
            </Link>
            <Link to="/" className="admin-nav-link" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2rem' }}>
              🏠 Back to Website
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary-orange)' }}>
            📋 Order Management
          </h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '1.1rem' }}>
            Review and manage all customer orders
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {['all', 'pending', 'preparing', 'ready', 'delivered'].map(status => (
              <button
                key={status}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? '🔄 All Orders' : getStatusLabel(status)}
                <span style={{ 
                  marginLeft: '0.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem'
                }}>
                  {status === 'all' ? orders.length : orders.filter(o => o.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card">
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'start' }}>
                  {/* Order Info */}
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--dark-charcoal)' }}>
                      Order #{order.id}
                    </h3>
                    <p style={{ color: 'var(--medium-gray)', marginBottom: '1rem' }}>
                      Customer: {order.customer.user.first_name} {order.customer.user.last_name}
                    </p>
                    
                    {/* Order Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Items:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none'
                        }}>
                          <span>{item.dish.name}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: 'var(--medium-gray)' }}>
                      {new Date(order.order_date).toLocaleString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: 'center' }}>
                    <div 
                      style={{ 
                        padding: '0.5rem 1rem',
                        borderRadius: '25px',
                        background: getStatusColor(order.status),
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginBottom: '1rem'
                      }}
                    >
                      {getStatusLabel(order.status)}
                    </div>
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ 
                          padding: '0.3rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          fontSize: '0.8rem'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ color: 'var(--primary-green)', fontSize: '1.5rem' }}>
                      ${order.total_amount.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medium-gray)' }}>
            <h3>No orders found</h3>
            <p>There are no orders matching the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders; 