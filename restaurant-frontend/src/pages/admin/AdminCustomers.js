import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showInfo } = useAlert();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Mock data
      setTimeout(() => {
        setCustomers([
          {
            id: 1,
            user: {
              first_name: 'Ahmed',
              last_name: 'Salem',
              email: 'ahmed@example.com',
              username: 'ahmed_salem'
            },
            phone: '+201234567890',
            address: 'Zamalek, Cairo',
            created_at: '2024-01-15T10:30:00',
            orders_count: 12,
            total_spent: 850.50
          },
          {
            id: 2,
            user: {
              first_name: 'Sarah',
              last_name: 'Mohamed',
              email: 'sara@example.com',
              username: 'sara_mohamed'
            },
            phone: '+201234567891',
            address: 'Maadi, Cairo',
            created_at: '2024-02-10T14:20:00',
            orders_count: 8,
            total_spent: 640.75
          },
          {
            id: 3,
            user: {
              first_name: 'Omar',
              last_name: 'Hassan',
              email: 'omar@example.com',
              username: 'omar_hassan'
            },
            phone: '+201234567892',
            address: 'Heliopolis, Cairo',
            created_at: '2024-03-05T09:15:00',
            orders_count: 15,
            total_spent: 1200.25
          },
          {
            id: 4,
            user: {
              first_name: 'Fatma',
              last_name: 'Ali',
              email: 'fatma@example.com',
              username: 'fatma_ali'
            },
            phone: '+201234567893',
            address: 'Dokki, Giza',
            created_at: '2024-03-20T16:45:00',
            orders_count: 6,
            total_spent: 420.00
          },
          {
            id: 5,
            user: {
              first_name: 'Mohamed',
              last_name: 'Ahmed',
              email: 'mohamed@example.com',
              username: 'mohamed_ahmed'
            },
            phone: '+201234567894',
            address: 'Nasr City, Cairo',
            created_at: '2024-04-01T11:30:00',
            orders_count: 10,
            total_spent: 750.80
          }
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getCustomerLevel = (totalSpent) => {
    if (totalSpent >= 1000) return { level: '🥇 Gold', color: 'var(--primary-gold)' };
    if (totalSpent >= 500) return { level: '🥈 Silver', color: 'var(--medium-gray)' };
    return { level: '🥉 Bronze', color: 'var(--primary-brown)' };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading customers...</p>
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
            <Link to="/admin/orders" className="admin-nav-link">
              📋 Orders
            </Link>
            <Link to="/admin/dishes" className="admin-nav-link">
              🍕 Dishes
            </Link>
            <Link to="/admin/categories" className="admin-nav-link">
              📂 Categories
            </Link>
            <Link to="/admin/customers" className="admin-nav-link active">
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
            👥 Customer Management
          </h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '1.1rem' }}>
            Review and manage customer database
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--success-green)' }}>
            <div className="stat-value" style={{ color: 'var(--success-green)' }}>
              {customers.filter(c => c.orders_count > 0).length}
            </div>
            <div className="stat-label">Active Customers</div>
          </div>
          
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary-gold)' }}>
            <div className="stat-value" style={{ color: 'var(--primary-gold)' }}>
              {customers.filter(c => c.total_spent >= 1000).length}
            </div>
            <div className="stat-label">Gold Customers</div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--info-blue)' }}>
            <div className="stat-value" style={{ color: 'var(--info-blue)' }}>
              ${(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(0)}
            </div>
            <div className="stat-label">Average Spending</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">🔍 Search Customers</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="card">
          <div className="card-header">
            <h3>📋 Customer List ({filteredCustomers.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ 
                  background: 'var(--light-gray)',
                  borderBottom: '2px solid var(--primary-orange)'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Level</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Orders</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Total Spent</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Registration Date</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => {
                  const customerLevel = getCustomerLevel(customer.total_spent);
                  return (
                    <tr key={customer.id} style={{ 
                      borderBottom: '1px solid #eee',
                      background: index % 2 === 0 ? 'var(--white)' : 'var(--light-gray)'
                    }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {customer.user.first_name} {customer.user.last_name}
                          </div>
                          <div style={{ color: 'var(--medium-gray)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            📧 {customer.user.email}
                          </div>
                          <div style={{ color: 'var(--medium-gray)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            📱 {customer.phone}
                          </div>
                          <div style={{ color: 'var(--medium-gray)', fontSize: '0.8rem' }}>
                            📍 {customer.address}
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          background: customerLevel.color,
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          {customerLevel.level}
                        </span>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: 'var(--primary-orange)',
                          fontSize: '1.1rem'
                        }}>
                          {customer.orders_count}
                        </div>
                        <div style={{ color: 'var(--medium-gray)', fontSize: '0.8rem' }}>
                          orders
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: 'var(--success-green)',
                          fontSize: '1.1rem'
                        }}>
                          ${customer.total_spent}
                        </div>
                        <div style={{ color: 'var(--medium-gray)', fontSize: '0.8rem' }}>
                          total
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--medium-gray)', fontSize: '0.9rem' }}>
                          {new Date(customer.created_at).toLocaleDateString('en-US')}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => showInfo(`Viewing details for ${customer.user.first_name} ${customer.user.last_name}`, 'Customer Details')}
                          >
                            👁️ View
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => showInfo(`Message sent to ${customer.user.email}`, 'Message Sent')}
                          >
                            ✉️ Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: 'var(--medium-gray)', marginBottom: '1rem' }}>
              👥 No Results Found
            </h3>
            <p style={{ color: 'var(--medium-gray)' }}>
              {searchTerm ? `No results found for: "${searchTerm}"` : 'No customers registered yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers; 