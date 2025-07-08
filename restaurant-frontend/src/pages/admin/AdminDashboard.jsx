import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/admin/dashboard/'),
        axios.get('http://127.0.0.1:8000/api/admin/orders/?limit=5')
      ]);
      
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.results || ordersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-orange-600">
                Restaurant Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/dashboard" 
                className="text-orange-600 border-b-2 border-orange-600 px-3 py-2"
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/orders" 
                className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
              >
                Orders
              </Link>
              <Link 
                to="/admin/dishes" 
                className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
              >
                Menu
              </Link>
              <Link 
                to="/admin/categories" 
                className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
              >
                Categories
              </Link>
              <Link 
                to="/admin/customers" 
                className="text-gray-600 hover:text-orange-600 px-3 py-2 transition-colors"
              >
                Customers
              </Link>
              <Link 
                to="/" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                View Website
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your restaurant's performance and operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Today Orders',
              value: stats?.today_stats?.today_orders || 0,
              change: stats?.today_stats?.orders_change || 0,
              color: 'blue'
            },
            {
              title: 'Total Orders',
              value: stats?.overview?.total_orders || 0,
              change: '+5%',
              color: 'green'
            },
            {
              title: 'Today Revenue',
              value: `$${stats?.today_stats?.today_revenue?.toFixed(2) || '0.00'}`,
              change: stats?.today_stats?.revenue_change || 0,
              color: 'emerald'
            },
            {
              title: 'Active Customers',
              value: stats?.recent_stats?.active_customers || 0,
              change: '+3%',
              color: 'purple'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <div className={`text-sm mt-1 ${
                    typeof stat.change === 'number' && stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {typeof stat.change === 'number' ? 
                      `${stat.change > 0 ? '+' : ''}${stat.change.toFixed(1)}%` : 
                      stat.change
                    } from yesterday
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <Link 
                  to="/admin/orders"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          Order #{order.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer?.user?.first_name || 'Customer'} • 
                        {new Date(order.order_date).toLocaleDateString('en-US')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${order.total_amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Summary */}
          <div className="space-y-6">
            {/* Order Status Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                {stats?.orders_by_status?.map((statusData) => (
                  <div key={statusData.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        statusData.status === 'pending' ? 'bg-yellow-500' :
                        statusData.status === 'delivered' ? 'bg-green-500' :
                        statusData.status === 'preparing' ? 'bg-orange-500' :
                        statusData.status === 'ready' ? 'bg-purple-500' :
                        statusData.status === 'cancelled' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {getStatusText(statusData.status)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {statusData.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats?.performance?.completion_rate || 0}%
                </div>
                <div className="text-sm text-blue-700 font-medium">Order Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${stats?.performance?.average_order_value || 0}
                </div>
                <div className="text-sm text-green-700 font-medium">Average Order Value</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats?.recent_stats?.pending_orders || 0}
                </div>
                <div className="text-sm text-purple-700 font-medium">Pending Orders</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats?.overview?.average_rating || 0}★
                </div>
                <div className="text-sm text-orange-700 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Dishes Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Selling Dishes
            </h3>
            <div className="space-y-4">
              {stats?.top_dishes?.slice(0, 5).map((dish, index) => (
                <div
                  key={dish.dish__name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{dish.dish__name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{dish.total_ordered} orders</div>
                    <div className="text-sm text-gray-500">This period</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 