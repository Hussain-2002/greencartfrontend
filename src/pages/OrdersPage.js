import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Navigation from '../components/Navigation';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderId: '',
    valueRs: 0,
    route: '',
    driver: '',
    deliveryTimestamp: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchRoutes();
    fetchDrivers();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders');
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data);
    } catch (error) {
      setError('Failed to fetch routes');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      setError('Failed to fetch drivers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await api.put(`/orders/${editingOrder._id}`, formData);
      } else {
        await api.post('/orders', formData);
      }
      setEditingOrder(null);
      setFormData({
        orderId: '',
        valueRs: 0,
        route: '',
        driver: '',
        deliveryTimestamp: '',
      });
      fetchOrders();
    } catch (error) {
      setError('Failed to save order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      orderId: order.orderId,
      valueRs: order.valueRs,
      route: order.route._id,
      driver: order.driver?._id || '',
      deliveryTimestamp: order.deliveryTimestamp.slice(0, 16),
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders();
      } catch (error) {
        setError('Failed to delete order');
      }
    }
  };

  const columns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'valueRs', label: 'Value (₹)' },
    {
      key: 'route',
      label: 'Route',
      render: (order) => order.route?.routeId || 'N/A',
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (order) => order.driver?.name || 'Unassigned',
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => order.status.charAt(0).toUpperCase() + order.status.slice(1),
    },
    {
      key: 'deliveryTimestamp',
      label: 'Delivery Time',
      render: (order) => new Date(order.deliveryTimestamp).toLocaleString(),
    },
  ];

  return (
    <div className="orders-page">
      <Navigation />
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              marginRight: '20px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          <h2>{editingOrder ? 'Edit Order' : 'Add New Order'}</h2>
        </div>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="order-form">
          <div>
            <label>Order ID:</label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Value (₹):</label>
            <input
              type="number"
              value={formData.valueRs}
              onChange={(e) => setFormData({
                ...formData,
                valueRs: parseFloat(e.target.value)
              })}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label>Route:</label>
            <select
              value={formData.route}
              onChange={(e) => setFormData({
                ...formData,
                route: e.target.value
              })}
              required
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Driver (Optional):</label>
            <select
              value={formData.driver}
              onChange={(e) => setFormData({
                ...formData,
                driver: e.target.value
              })}
            >
              <option value="">Unassigned</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Delivery Time:</label>
            <input
              type="datetime-local"
              value={formData.deliveryTimestamp}
              onChange={(e) => setFormData({
                ...formData,
                deliveryTimestamp: e.target.value
              })}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit">
              {editingOrder ? 'Update Order' : 'Add Order'}
            </button>
            {editingOrder && (
              <button
                type="button"
                onClick={() => {
                  setEditingOrder(null);
                  setFormData({
                    orderId: '',
                    valueRs: 0,
                    route: '',
                    driver: '',
                    deliveryTimestamp: '',
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2>Orders List</h2>
        <DataTable
          data={orders}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default OrdersPage;
