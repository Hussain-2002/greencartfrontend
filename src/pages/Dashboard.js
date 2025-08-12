import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import Navigation from '../components/Navigation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simulationRes, ordersRes, driversRes] = await Promise.all([
          api.get('/simulation/history'),
          api.get('/orders'),
          api.get('/drivers')
        ]);

        if (simulationRes.data.length > 0) {
          setStats(simulationRes.data[0].results);
        }
        setOrders(ordersRes.data);
        setDrivers(driversRes.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <Navigation />
        <div className="content">
          <div className="loading">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Navigation />
        <div className="content">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  const deliveryData = {
    labels: ['On-time', 'Late'],
    datasets: [
      {
        data: [
          orders.filter(o => o.status !== 'late').length,
          orders.filter(o => o.status === 'late').length
        ],
        backgroundColor: ['#4CAF50', '#f44336'],
        borderWidth: 1
      }
    ]
  };

  const driverPerformanceData = {
    labels: drivers.map(d => d.name),
    datasets: [
      {
        label: 'Deliveries Completed',
        data: drivers.map(driver => 
          orders.filter(o => o.driver && o.driver._id === driver._id).length
        ),
        backgroundColor: '#2196F3'
      }
    ]
  };

  return (
    <div className="dashboard">
      <Navigation />
      <div className="content">
        <h2>Dashboard Overview</h2>
        {!stats && !loading ? (
          <div className="no-data-message">
            <p>No simulation data available yet. Run a simulation to see results.</p>
            <a href="/simulation" className="button">Run New Simulation</a>
          </div>
        ) : (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total Profit</h3>
                <p>₹{stats?.totalProfit?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="stat-card">
                <h3>Efficiency Score</h3>
                <p>{stats?.efficiencyScore?.toFixed(2) || '0.00'}%</p>
              </div>
              <div className="stat-card">
                <h3>Total Fuel Cost</h3>
                <p>₹{stats?.fuelCosts?.total?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-card">
                <h3>Delivery Performance</h3>
                {orders.length > 0 ? (
                  <Doughnut
                    data={deliveryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="no-data">No delivery data available</p>
                )}
              </div>
              <div className="chart-card">
                <h3>Driver Performance</h3>
                {drivers.length > 0 ? (
                  <Bar
                    data={driverPerformanceData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="no-data">No driver data available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
