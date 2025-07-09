import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import { getCustomers } from '../../services/api';
import { color } from 'framer-motion';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showInfo, showError } = useAlert();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      // Handle paginated response from DRF
      const customersArray = data.results ? data.results : (Array.isArray(data) ? data : []);
      setCustomers(customersArray);
    } catch (error) {
      showError('Failed to load customers.', 'Loading Failed');
      setCustomers([]);
    } finally {
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
    if (totalSpent >= 1000) return { level: '🥇 Gold', color: 'black' };
    if (totalSpent >= 500) return { level: '🥈 Silver', color: 'black' };
    if (totalSpent >= 50) return { level: '🥉 Bronze', color: 'black' };
    return {level: 'New', color: 'black'};
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
     <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage customer database
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Customers</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600">
              {customers.filter(c => c.orders_count > 0).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Active Customers</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {customers.filter(c => c.total_spent >= 1000).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Gold Customers</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600">
              ${(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Spending</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Customers
          </label>
              <input
                type="text"
                placeholder="Search by name, email, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
        </div>

        {/* Customers List */}
        <div className="space-y-4">
                {filteredCustomers.map((customer, index) => {
                  const customerLevel = getCustomerLevel(customer.total_spent);
                  return (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                            {customer.user.first_name} {customer.user.last_name}
                      </h3>
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
                    </div>
                      
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="font-medium text-gray-900">{customer.user.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone</span>
                        <p className="font-medium text-gray-900">{customer.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Registration</span>
                        <p className="font-medium text-gray-900">
                          {new Date(customer.created_at).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Address</span>
                      <p className="text-gray-700">{customer.address}</p>
                    </div>
                  </div>

                  <div className="lg:w-64">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {customer.orders_count}
                        </div>
                        <div className="text-sm text-gray-500">Orders</div>
                        </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${customer.total_spent}
                        </div>
                        <div className="text-sm text-gray-500">Total Spent</div>
                        </div>
                        </div>
                      
                    <div className="flex gap-2">
                          <button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => showInfo(`Viewing details for ${customer.user.first_name} ${customer.user.last_name}`, 'Customer Details')}
                          >
                        View
                          </button>
                          <button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => showInfo(`Message sent to ${customer.user.email}`, 'Message Sent')}
                          >
                        Message
                          </button>
                        </div>
                  </div>
                </div>
              </div>
                  );
                })}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">
              {searchTerm ? `No results found for: "${searchTerm}"` : 'No customers registered yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers; 