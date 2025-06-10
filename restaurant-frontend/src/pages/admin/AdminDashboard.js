import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      setTimeout(() => {
        setStats({
          overview: {
            total_orders: 142,
            total_customers: 89,
            total_dishes: 19,
            total_categories: 7,
            total_revenue: 15420.50,
            average_rating: 4.3
          },
          recent_stats: {
            recent_orders: 23,
            recent_revenue: 2840.75
          },
          order_statuses: [
            { status: 'pending', count: 12 },
            { status: 'preparing', count: 8 },
            { status: 'ready', count: 5 },
            { status: 'delivered', count: 117 }
          ],
          top_dishes: [
            { dish__name: 'Margherita Pizza', total_ordered: 45 },
            { dish__name: 'Cheeseburger', total_ordered: 38 },
            { dish__name: 'Spaghetti Bolognese', total_ordered: 32 },
            { dish__name: 'Caesar Salad', total_ordered: 28 },
            { dish__name: 'Chocolate Cake', total_ordered: 25 }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* 🛡️ Admin Sidebar */}
      <div className="admin-sidebar">
        <div style={{ padding: '0 2rem' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
            🛡️ Admin Panel
          </h3>
          
          <nav className="admin-nav">
            <Link to="/admin/dashboard" className="admin-nav-link active">
              📊 Dashboard
            </Link>
            <Link to="/admin/orders" className="admin-nav-link">
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

      {/* 📊 Main Content */}
      <div className="admin-content">
        {/* Header */}
        <div className="admin-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary-orange)' }}>
            Welcome to Admin Dashboard
          </h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '1.1rem' }}>
            Complete management for Fine Dining Restaurant
          </p>
        </div>

        {/* 📈 Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.overview.total_orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--success-green)' }}>
            <div className="stat-value" style={{ color: 'var(--success-green)' }}>
              ${stats.overview.total_revenue.toLocaleString()}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--info-blue)' }}>
            <div className="stat-value" style={{ color: 'var(--info-blue)' }}>
              {stats.overview.total_customers}
            </div>
            <div className="stat-label">Customers</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--warning-orange)' }}>
            <div className="stat-value" style={{ color: 'var(--warning-orange)' }}>
              {stats.overview.total_dishes}
            </div>
            <div className="stat-label">Dishes</div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--primary-gold)' }}>
            <div className="stat-value" style={{ color: 'var(--primary-gold)' }}>
              ⭐ {stats.overview.average_rating}
            </div>
            <div className="stat-label">Average Rating</div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--secondary-green)' }}>
            <div className="stat-value" style={{ color: 'var(--secondary-green)' }}>
              {stats.recent_stats.recent_orders}
            </div>
            <div className="stat-label">Orders This Week</div>
          </div>
        </div>

        {/* 📊 Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Order Status Chart */}
          <div className="card">
            <div className="card-header">
              <h3>📋 Order Status</h3>
            </div>
            <div className="card-body">
              {stats.order_statuses.map((status, index) => (
                <div key={status.status} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < stats.order_statuses.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span style={{ 
                    textTransform: 'capitalize',
                    fontWeight: '500'
                  }}>
                    {getStatusLabel(status.status)}
                  </span>
                  <span style={{ 
                    background: getStatusColor(status.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Dishes */}
          <div className="card">
            <div className="card-header">
              <h3>🏆 Most Ordered Dishes</h3>
            </div>
            <div className="card-body">
              {stats.top_dishes.map((dish, index) => (
                <div key={dish.dish__name} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < stats.top_dishes.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      background: 'var(--primary-orange)',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontWeight: '500' }}>{dish.dish__name}</span>
                  </div>
                  <span style={{ 
                    color: 'var(--primary-orange)',
                    fontWeight: '700'
                  }}>
                    {dish.total_ordered} orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🔗 Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link to="/admin/dishes" className="btn btn-primary">
                ➕ Add New Dish
              </Link>
              <Link to="/admin/categories" className="btn btn-secondary">
                📂 Manage Categories
              </Link>
              <Link to="/admin/orders" className="btn btn-warning">
                📋 Review Orders
              </Link>
              <Link to="/admin/customers" className="btn btn-success">
                👥 Manage Customers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ Pending',
    preparing: '👨‍🍳 Preparing',
    ready: '✅ Ready',
    delivered: '🚚 Delivered',
    cancelled: '❌ Cancelled'
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'var(--warning-orange)',
    preparing: 'var(--info-blue)',
    ready: 'var(--success-green)',
    delivered: 'var(--primary-green)',
    cancelled: 'var(--danger-red)'
  };
  return colors[status] || 'var(--medium-gray)';
};

export default AdminDashboard; 