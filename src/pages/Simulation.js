import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Simulation = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    availableDrivers: '',
    routeStartTime: '',
    maxHoursPerDriver: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/simulation/run', inputs);
      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="simulation-page">
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
        <h2>Run Simulation</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="simulation-form">
        <div>
          <label>Number of Available Drivers:</label>
          <input
            type="number"
            name="availableDrivers"
            value={inputs.availableDrivers}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>Route Start Time:</label>
          <input
            type="time"
            name="routeStartTime"
            value={inputs.routeStartTime}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Maximum Hours per Driver:</label>
          <input
            type="number"
            name="maxHoursPerDriver"
            value={inputs.maxHoursPerDriver}
            onChange={handleInputChange}
            min="1"
            max="12"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="simulation-results">
          <h3>Simulation Results</h3>
          <div className="results-grid">
            <div className="result-item">
              <label>Total Profit:</label>
              <span>₹{results.totalProfit.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <label>Efficiency Score:</label>
              <span>{results.efficiencyScore.toFixed(2)}%</span>
            </div>
            <div className="result-item">
              <label>On-time Deliveries:</label>
              <span>{results.onTimeDeliveries}</span>
            </div>
            <div className="result-item">
              <label>Late Deliveries:</label>
              <span>{results.lateDeliveries}</span>
            </div>
            <div className="result-item">
              <label>Total Fuel Cost:</label>
              <span>₹{results.fuelCosts.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulation;
