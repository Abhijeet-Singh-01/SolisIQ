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
            <div className="calc-kicker-wrap">
              <span className="kicker-dot" />
              <span className="calc-mono-kicker">ADMINISTRATIVE OPERATIONS</span>
            </div>
            <h1 className="admin-editorial-title">Platform Registry & Systems</h1>
            <p className="admin-editorial-desc">
              Manage registered accounts, inspect user telemetry, and verify database integrity.
            </p>
          </div>
        </section>

        {/* Top KPIs */}
        <section className="admin-kpis-grid">
          <div className="admin-kpi-card">
            <span className="admin-kpi-kicker">USER DIRECTORY</span>
            <strong className="admin-kpi-val">{users.length}</strong>
            <span className="admin-kpi-foot">Total registered accounts</span>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-kicker">DATABASE CLUSTER</span>
            <div className="status-row">
              <span className="intel-pulse-dot" />
              <strong className="admin-kpi-val text-emerald">Connected</strong>
            </div>
            <span className="admin-kpi-foot">Aiven MySQL Production</span>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-kicker">AUTHENTICATED ADMIN</span>
            <strong className="admin-kpi-val">{user?.username || 'SuperAdmin'}</strong>
            <span className="admin-kpi-foot">Full access role granted</span>
          </div>
        </section>

        {/* User Management Table */}
        <section className="admin-table-section">
          <div className="editorial-archive-card admin-table-card">
            <div className="archive-header-row">
              <div className="archive-title-group">
                <span className="card-mono-kicker">DIRECTORY CONTROL</span>
                <h3 className="archive-title">User Accounts</h3>
                <p className="archive-desc">Inspect registered accounts and manage platform permissions.</p>
              </div>

              <div className="table-search-wrap">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="solis-search-input"
                />
              </div>
            </div>

            {loading && (
              <div className="editorial-loading-box">
                <span className="solis-spinner" />
                <p>Loading user directory...</p>
              </div>
            )}

            {error && (
              <div className="editorial-form-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className="archive-table-container">
                <table className="editorial-data-table admin-dense-table">
                  <thead>
                    <tr>
                      <th>UID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td><span className="num-mono">#{u.id}</span></td>
                        <td>
                          <div className="archive-location-cell">
                            <User size={13} className="cell-sub-icon" />
                            <strong>{u.username}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="archive-email-text">{u.email}</span>
                        </td>
                        <td>
                          <span className="archive-date-text">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="archive-action-btn delete"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center" style={{ padding: '40px', color: 'var(--dim)' }}>
                          No users matched your query filter.
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
        <div className="footer-bottom-inner">
          <span>© 2026 SolisIQ Internal Operations Console. Authorized administrators only.</span>
          <div className="footer-legal-row">
            <Link to="/">Home</Link>
            <Link to="/calculator">Solar Calculator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboardPage;
