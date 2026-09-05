import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import API_BASE_URL from './apiConfig';
import {
  ShieldCheck,
  Users,
  Search,
  Trash2,
  AlertCircle,
  Database,
  Calendar,
  Mail,
  User,
} from 'lucide-react';

function AdminDashboardPage({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setUsers(response.data.users || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (onLogout) onLogout();
        navigate('/admin/login');
        return;
      }
      setError(err.response?.data?.message || 'Could not fetch user directory.');
    } finally {
      setLoading(false);
    }
  }, [token, onLogout, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you wish to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete user.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="solis-page-wrapper">
      <div className="solis-ambient-container" aria-hidden="true">
        <div className="ambient-glow glow-top" />
        <div className="ambient-glow glow-right" />
      </div>

      {/* Shared Glass Navbar */}
      <Navbar
        token={token}
        user={user}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="solis-main-content">
        <section className="admin-dash-header">
          <div className="admin-dash-header-inner">
            <div className="calc-eyebrow">
              <span className="eyebrow-dot" />
              <ShieldCheck size={14} className="eyebrow-icon" />
              <span>ADMINISTRATIVE CONTROL CONSOLE</span>
            </div>
            <h1 className="admin-dash-title">Platform Operations & User Registry</h1>
            <p className="admin-dash-sub">
              Manage registered accounts, view system telemetry, and inspect database state.
            </p>
          </div>
        </section>

        {/* Top KPIs */}
        <section className="admin-kpis-grid">
          <div className="solis-card admin-kpi-card">
            <Users size={22} className="text-solar" />
            <strong className="kpi-num">{users.length}</strong>
            <span className="kpi-desc">Total Registered Users</span>
          </div>

          <div className="solis-card admin-kpi-card">
            <Database size={22} className="text-emerald" />
            <strong className="kpi-num">Active</strong>
            <span className="kpi-desc">Aiven MySQL Cluster</span>
          </div>

          <div className="solis-card admin-kpi-card">
            <ShieldCheck size={22} className="text-blue" />
            <strong className="kpi-num">Admin Active</strong>
            <span className="kpi-desc">Signed in as {user?.username}</span>
          </div>
        </section>

        {/* User Management Table */}
        <section className="admin-table-section">
          <div className="solis-card admin-table-card">
            <div className="admin-table-header">
              <div className="table-title-block">
                <h3>User Management</h3>
                <p>Directory of registered users on SolisIQ.</p>
              </div>

              <div className="table-search-input">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="solis-search-box"
                />
              </div>
            </div>

            {loading && (
              <div className="history-loading-box">
                <span className="solis-spinner" />
                <p>Loading user directory...</p>
              </div>
            )}

            {error && (
              <div className="solis-form-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className="history-table-responsive">
                <table className="solis-glass-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Registration Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td>
                          <div className="history-loc-cell">
                            <User size={14} className="cell-icon" />
                            <strong>{u.username}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="history-date-cell">
                            <Mail size={14} className="cell-icon" />
                            <span>{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="history-date-cell">
                            <Calendar size={14} className="cell-icon" />
                            <span>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center" style={{ padding: '32px' }}>
                          No users matched your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="solis-footer simple-footer">
        <div className="footer-bottom-container">
          <span>© 2026 SolisIQ Internal Admin Console. Restricted access.</span>
          <div className="footer-legal-links">
            <Link to="/">Home</Link>
            <Link to="/calculator">Solar Calculator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboardPage;
