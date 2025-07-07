import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { Card, LoadingSpinner, Badge } from '../../components/ui';

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
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      ready: 'success',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Complete overview of restaurant performance and daily operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Today Orders',
              value: stats?.today_orders || 0,
              change: '+12%',
              changeType: 'positive'
            },
            {
              title: 'Total Orders',
              value: stats?.total_orders || 0,
              change: '+5%',
              changeType: 'positive'
            },
            {
              title: 'Today Revenue',
              value: `$${stats?.today_revenue || 0}`,
              change: '+8%',
              changeType: 'positive'
            },
            {
              title: 'Active Customers',
              value: stats?.active_customers || 0,
              change: '+3%',
              changeType: 'positive'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </h3>
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary-500 rounded"></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from yesterday
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Orders
                </h2>
                <Link to="/admin/orders">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All →
                  </button>
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
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer?.user?.first_name || 'Customer'} • 
                        {new Date(order.order_date).toLocaleDateString('en-US')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ${order.total_amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Order Status Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                {stats?.orders_by_status?.map((statusData) => (
                  <div key={statusData.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        statusData.status === 'pending' ? 'bg-yellow-500' :
                        statusData.status === 'delivered' ? 'bg-green-500' :
                        statusData.status === 'preparing' ? 'bg-blue-500' :
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
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/admin/orders">
                  <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    Manage Orders
                  </button>
                </Link>
                <Link to="/admin/dishes">
                  <button className="w-full bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors">
                    Manage Menu
                  </button>
                </Link>
                <Link to="/admin/customers">
                  <button className="w-full bg-accent-green text-white py-2 px-4 rounded-lg hover:bg-accent-dark-green transition-colors">
                    View Customers
                  </button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {((stats?.delivered_orders / stats?.total_orders) * 100 || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Order Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {stats?.average_order_value || 0}
                </div>
                <div className="text-sm text-gray-600">Average Order Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  25 minutes
                </div>
                <div className="text-sm text-gray-600">Average Preparation Time</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 