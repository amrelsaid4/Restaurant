import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import { getOrders, updateOrderStatus as updateOrderStatusAPI } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { showSuccess, showError } = useAlert();
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      // Handle paginated response from DRF
      const ordersArray = data.results ? data.results : (Array.isArray(data) ? data : []);
      setOrders(ordersArray);
    } catch (error) {
      showError('Failed to load orders.', 'Loading error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    await modalState.onConfirm();
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Prevent showing modal if status is the same
    if (order.status === newStatus) return;

    const action = async () => {
      try {
        await updateOrderStatusAPI(orderId, newStatus);
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        showSuccess(`Order #${orderId} status updated to: ${getStatusLabel(newStatus)}`, 'Status Updated');
      } catch (error) {
        showError(`Failed to update status: ${error.message}`, 'Update Failed');
      }
    };

    setModalState({
        isOpen: true,
        title: 'Confirm Status Change',
        message: `Are you sure you want to change order #${orderId} status to "${getStatusLabel(newStatus)}"?`,
        onConfirm: action
    });
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
    <>
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title={modalState.title}
      >
        <p>{modalState.message}</p>
      </ConfirmModal>
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

          {/* Orders List */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredOrders.map(order => (
              <div key={order.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: 'var(--dark-charcoal)' }}>
                        Order #{order.id}
                      </h3>
                      <p style={{ color: 'var(--medium-gray)', marginBottom: '1rem' }}>
                        Customer: {order.customer.user.first_name} {order.customer.user.last_name}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{ background: 'var(--light-background)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                          📅 {new Date(order.order_date).toLocaleDateString()}
                        </span>
                        <span style={{ background: 'var(--info-blue)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                          📦 {order.items.length} items
                        </span>
                        <span style={{ background: 'var(--success-green)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>
                          💰 ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--dark-charcoal)' }}>Items:</h4>
                        <div style={{ background: 'var(--light-background)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                          {order.items.map((item, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem 0',
                              borderBottom: index < order.items.length - 1 ? '1px solid #ddd' : 'none'
                            }}>
                              <span style={{ fontWeight: '500' }}>{item.dish.name}</span>
                              <span style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.special_instructions && (
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.75rem', 
                          background: 'var(--secondary-cream)', 
                          borderRadius: 'var(--border-radius)',
                          fontSize: '0.9rem',
                          color: 'var(--medium-gray)'
                        }}>
                          💬 Special Instructions: {order.special_instructions}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div 
                        style={{ 
                          padding: '0.5rem 1rem',
                          borderRadius: '25px',
                          background: getStatusColor(order.status),
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          minWidth: '120px',
                          textAlign: 'center'
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </div>
                      
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="btn btn-sm btn-secondary"
                          style={{ 
                            minWidth: '120px',
                            textAlign: 'center'
                          }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="preparing">👨‍🍳 Preparing</option>
                          <option value="ready">🍽️ Ready</option>
                          <option value="delivered">🚚 Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      )}
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
    </>
  );
};

export default AdminOrders; 