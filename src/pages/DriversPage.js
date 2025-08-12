import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Navigation from '../components/Navigation';

const DriversPage = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    currentShiftHours: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

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
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver._id}`, formData);
      } else {
        await api.post('/drivers', formData);
      }
      setEditingDriver(null);
      setFormData({ name: '', currentShiftHours: 0 });
      fetchDrivers();
    } catch (error) {
      setError('Failed to save driver');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      currentShiftHours: driver.currentShiftHours,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.delete(`/drivers/${id}`);
        fetchDrivers();
      } catch (error) {
        setError('Failed to delete driver');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'currentShiftHours', label: 'Current Shift Hours' },
    {
      key: 'isFatigued',
      label: 'Fatigue Status',
      render: (driver) => (driver.isFatigued ? 'Fatigued' : 'Normal'),
    },
  ];

  return (
    <div className="drivers-page">
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
          <h2>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
        </div>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="driver-form">
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Current Shift Hours:</label>
            <input
              type="number"
              value={formData.currentShiftHours}
              onChange={(e) => setFormData({
                ...formData,
                currentShiftHours: parseFloat(e.target.value)
              })}
              min="0"
              step="0.5"
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit">
              {editingDriver ? 'Update Driver' : 'Add Driver'}
            </button>
            {editingDriver && (
              <button
                type="button"
                onClick={() => {
                  setEditingDriver(null);
                  setFormData({ name: '', currentShiftHours: 0 });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2>Drivers List</h2>
        <DataTable
          data={drivers}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default DriversPage;
