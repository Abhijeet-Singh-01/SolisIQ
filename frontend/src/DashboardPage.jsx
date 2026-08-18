import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import SolarInputForm from './SolarInputForm';
import Dashboard from './Dashboard';
import CalculationHistory from './CalculationHistory';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function DashboardPage({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [communityStats, setCommunityStats] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to AI Solar Advisor',
      time: 'Just now',
      read: false,
    },
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const getApiErrorMessage = (err, fallback) => {
    if (!err?.response) {
      return err?.message || fallback || 'Unable to connect. Please check your network and try again.';
    }

    const status = err.response.status;
    const backendMessage = err.response.data?.error || err.response.data?.message;

    if (status === 400) {
      return backendMessage || fallback || 'Invalid request. Please check your input.';
    }
    if (status === 401 || status === 403) {
      return backendMessage || 'Your session has expired. Please sign in again.';
    }
    if (status >= 500) {
      return backendMessage || fallback || 'Server error. Please try again later.';
    }

    return backendMessage || fallback || 'Something went wrong. Please refresh the page.';
  };

  const handleSessionExpired = () => {
    onLogout();
    navigate('/login');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const fetchHistory = async () => {
    if (!token) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/my-calculations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(response.data.calculations || []);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not load your calculation history.');
      setHistoryError(message);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleSessionExpired();
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchCommunityStats = async () => {
    setCommunityLoading(true);
    setCommunityError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/community-stats`);
      setCommunityStats(response.data);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not load community insights.');
      setCommunityError(message);
    } finally {
      setCommunityLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchCommunityStats();
  }, [token]);

  const addNotification = (title) => {
    setNotifications((prev) => [
      { id: Date.now(), title, time: 'Just now', read: false },
      ...prev,
    ].slice(0, 6));
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen((prevOpen) => {
      if (!prevOpen) {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      }
      return !prevOpen;
    });
  };

  const handleNewResults = (newResults) => {
    setResults(newResults);
    addNotification('Calculation saved');
  };

  const handleDeleteCalculation = async (calculationId) => {
    if (!token) return;

    try {
      await axios.delete(`${API_BASE_URL}/my-calculations/${calculationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchHistory();
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not delete this saved calculation.');
      console.error('Delete failed', message, err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleSessionExpired();
      }
    }
  };

  return (
    <div className="app-container dashboard-page-container">
      <div className="topbar">
        <div>
          <div className="topbar-label">Dashboard</div>
          <h1>AI Solar Advisor</h1>
          <p>Enter your location and energy details to get a premium solar assessment.</p>
        </div>
        <div className="topbar-controls">
          <button type="button" className="theme-toggle-btn" onClick={toggleDarkMode}>
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="notification-menu">
            <button
              type="button"
              className="notification-btn"
              onClick={handleToggleNotifications}
              aria-label="Show recent activity"
            >
              <span className="bell-icon">🔔</span>
              {notifications.some((item) => !item.read) && <span className="notification-badge" />}
            </button>
            {notificationsOpen && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">Recent activity</div>
                {notifications.length === 0 ? (
                  <div className="notification-empty">No recent activity</div>
                ) : (
                  notifications.map((note) => (
                    <div key={note.id} className={`notification-item ${note.read ? '' : 'unread'}`}>
                      <div className="notification-title">{note.title}</div>
                      <div className="notification-time">{note.time}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="user-pill">
            <span>{user?.username || 'Guest'}</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-hero">
        <div className="hero-content">
          <span className="hero-badge">Solar Pulse</span>
          <h2>Intelligent rooftop solar guidance</h2>
          <p>Realtime savings and emissions insight tailored to your home and location.</p>
        </div>

        <div className="hero-metrics">
          <div className="hero-metric">
            <span>Energy forecast</span>
            <strong>{results ? `${Number(results.prediction.predicted_energy_output_kwh).toFixed(1)} kWh/day` : '--'}</strong>
          </div>
          <div className="hero-metric">
            <span>Monthly savings</span>
            <strong>{results ? `₹${Number(results.roi.estimated_monthly_savings).toFixed(0)}` : '--'}</strong>
          </div>
          <div className="hero-metric">
            <span>CO₂ reduction</span>
            <strong>{results ? `${Number(results.carbon.co2_saved_kg).toFixed(0)} kg/yr` : '--'}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <SolarInputForm token={token} onResults={handleNewResults} onHistoryRefresh={fetchHistory} />
        <Dashboard results={results} />
      </div>

      <section className="community-insights-section">
        <div className="community-insights-header">
          <h2>Community Insights</h2>
          <p>Anonymous aggregated results from other users' calculations.</p>
        </div>

        {communityLoading ? (
          <p className="loading-state">Loading community stats...</p>
        ) : communityError ? (
          <p className="error-message">{communityError}</p>
        ) : communityStats ? (
          <>
            <div className="community-insights-grid">
              <div className="community-card">
                <h3>Total calculations</h3>
                <p>{communityStats.total_calculations}</p>
              </div>
              <div className="community-card">
                <h3>Avg. monthly savings</h3>
                <p>₹{Number(communityStats.avg_monthly_savings).toFixed(0)}</p>
              </div>
              <div className="community-card">
                <h3>Avg. payback</h3>
                <p>{Number(communityStats.avg_payback_period).toFixed(1)} years</p>
              </div>
              <div className="community-card">
                <h3>Avg. forecast</h3>
                <p>{Number(communityStats.avg_predicted_output).toFixed(1)} kWh/day</p>
              </div>
            </div>

            {communityStats.top_cities?.length ? (
              <div className="community-chart-card">
                <h3>Top locations by calculations</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={communityStats.top_cities} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Calculations']} />
                    <Bar dataKey="calculations" fill="#4f8cff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </>
        ) : (
          <p>No community data available yet.</p>
        )}
      </section>

      <CalculationHistory
        history={history}
        loading={historyLoading}
        error={historyError}
        onDelete={handleDeleteCalculation}
      />
    </div>
  );
}

export default DashboardPage;
