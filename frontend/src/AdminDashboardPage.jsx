
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';

function AdminDashboardPage({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);

  const authConfig = useMemo(() => {
    const config = { headers: {} };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, [token]);

  const getApiErrorMessage = (err) => {
    if (!err?.response) {
      return err?.message || 'Unable to connect. Please check your network and try again.';
    }

    const status = err.response.status;
    const backendMessage = err.response.data?.error || err.response.data?.message;

    if (status === 400) {
      return backendMessage || 'Could not load the requested admin data. Please try again.';
    }
    if (status === 401 || status === 403) {
      return backendMessage || 'Your session has expired. Please sign in again.';
    }
    if (status >= 500) {
      return backendMessage || 'Server error while loading admin data. Try again in a few moments.';
    }

    return backendMessage || 'Something went wrong. Please refresh the page.';
  };

  const handleUnauthorized = () => {
    onLogout();
    navigate('/admin/login');
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`, authConfig),
        axios.get(`${API_BASE_URL}/admin/users`, authConfig),
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data.users || []);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleUnauthorized();
      }
    } finally {
      setLoading(false);
    }
  }, [authConfig]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((account) => (
      account.username.toLowerCase().includes(query)
      || account.email.toLowerCase().includes(query)
    ));
  }, [searchTerm, users]);

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingUserId(userId);
    setError('');

    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, authConfig);
      setUsers((currentUsers) => currentUsers.filter((account) => account.id !== userId));
      setStats((currentStats) => (
        currentStats
          ? { ...currentStats, total_users: Math.max(0, currentStats.total_users - 1) }
          : currentStats
      ));
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleUnauthorized();
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="app-container admin-app-container">
      <div className="topbar">
        <div>
          <div className="topbar-label">Administration</div>
          <h1>Admin Dashboard</h1>
          <p>Administrative overview for AI Solar Advisor.</p>
        </div>
        <div className="topbar-controls">
          <button type="button" className="theme-toggle-btn" onClick={toggleDarkMode}>
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="user-pill">
            <span>{user?.username || 'Admin'}</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {error && <p className="error-message admin-dashboard-error">{error}</p>}

      <section className="admin-dashboard" aria-label="Admin dashboard overview">
        <div className="card-grid admin-stats-grid">
          <article className="card positive">
            <h3>Total users</h3>
            <p>{loading ? '...' : stats?.total_users ?? 0}</p>
          </article>
          <article className="card energy">
            <h3>New this week</h3>
            <p>{loading ? '...' : stats?.new_registrations_this_week ?? 0}</p>
          </article>
        </div>

        <section className="admin-users-card">
          <div className="admin-users-header">
            <div>
              <h2>Registered users</h2>
              <p>Search and manage regular user accounts.</p>
            </div>
            <input
              type="search"
              className="admin-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search username or email"
              aria-label="Search users by username or email"
              disabled={loading}
            />
          </div>

          {loading ? (
            <p className="admin-table-message loading-state">Loading users...</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Joined date</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length ? filteredUsers.map((account) => (
                    <tr key={account.id}>
                      <td>{account.username}</td>
                      <td>{account.email}</td>
                      <td>{account.created_at ? new Date(account.created_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteUser(account.id)}
                          disabled={deletingUserId === account.id}
                        >
                          {deletingUserId === account.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="admin-table-message">No users match your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
