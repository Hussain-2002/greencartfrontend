import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Navigation from '../components/Navigation';

const RoutesPage = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    routeId: '',
    distance: 0,
    trafficLevel: 'Low',
    baseTime: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data);
    } catch (error) {
      setError('Failed to fetch routes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await api.put(`/routes/${editingRoute._id}`, formData);
      } else {
        await api.post('/routes', formData);
      }
      setEditingRoute(null);
      setFormData({
        routeId: '',
        distance: 0,
        trafficLevel: 'Low',
        baseTime: 0,
      });
      fetchRoutes();
    } catch (error) {
      setError('Failed to save route');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      routeId: route.routeId,
      distance: route.distance,
      trafficLevel: route.trafficLevel,
      baseTime: route.baseTime,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await api.delete(`/routes/${id}`);
        fetchRoutes();
      } catch (error) {
        setError('Failed to delete route');
      }
    }
  };

  const columns = [
    { key: 'routeId', label: 'Route ID' },
    { key: 'distance', label: 'Distance (km)' },
    { key: 'trafficLevel', label: 'Traffic Level' },
    { key: 'baseTime', label: 'Base Time (min)' },
  ];

  return (
    <div className="routes-page">
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
          <h2>{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
        </div>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="route-form">
          <div>
            <label>Route ID:</label>
            <input
              type="text"
              value={formData.routeId}
              onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Distance (km):</label>
            <input
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({
                ...formData,
                distance: parseFloat(e.target.value)
              })}
              min="0"
              step="0.1"
              required
            />
          </div>
          <div>
            <label>Traffic Level:</label>
            <select
              value={formData.trafficLevel}
              onChange={(e) => setFormData({
                ...formData,
                trafficLevel: e.target.value
              })}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label>Base Time (minutes):</label>
            <input
              type="number"
              value={formData.baseTime}
              onChange={(e) => setFormData({
                ...formData,
                baseTime: parseInt(e.target.value)
              })}
              min="0"
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit">
              {editingRoute ? 'Update Route' : 'Add Route'}
            </button>
            {editingRoute && (
              <button
                type="button"
                onClick={() => {
                  setEditingRoute(null);
                  setFormData({
                    routeId: '',
                    distance: 0,
                    trafficLevel: 'Low',
                    baseTime: 0,
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2>Routes List</h2>
        <DataTable
          data={routes}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default RoutesPage;
