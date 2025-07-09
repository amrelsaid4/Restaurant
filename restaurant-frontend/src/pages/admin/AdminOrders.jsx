import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';
import { getOrders, updateOrderStatus as updateOrderStatusAPI } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import AdminNavbar from '../../components/admin/AdminNavbar';

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
    if (!order || order.status === newStatus) return;

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
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
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

      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Order Management
              </h1>
              <p className="text-gray-600 ml-2 mt-2">
                Review and manage all customer orders
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {['all', 'pending', 'preparing', 'ready', 'delivered'].map(status => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All Orders' : getStatusLabel(status)}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-opacity-20 bg-gray-900">
                    {status === 'all' ? orders.length : orders.filter(o => o.status === status).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                        </span>
                      </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Customer</span>
                        <p className="font-medium text-gray-900">
                          {order.customer.user.first_name} {order.customer.user.last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Date</span>
                        <p className="font-medium text-gray-900">
                          {new Date(order.order_date).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Total</span>
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                      {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-2">
                          {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-700">{item.dish.name}</span>
                            <span className="text-gray-600 font-medium">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.special_instructions && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="text-sm font-medium text-blue-800">Special Instructions:</span>
                        <p className="text-blue-700 mt-1">{order.special_instructions}</p>
                        </div>
                      )}
                    </div>

                  {/* Status Update */}
                  <div className="lg:w-48">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Status
                        </label>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No orders have been placed yet.' 
                  : `No orders found with status: ${getStatusLabel(filter)}`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders; 