import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import {
  Sun,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

function AdminLoginPage({ onAdminLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, formData, { timeout: 10000 });
      const { token, user } = response.data;
      if (token && user) {
        onAdminLogin(token, user);
        navigate('/admin/dashboard');
      } else {
        setError('Admin access granted but token was missing.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unauthorized admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="solis-auth-page-wrapper">
      <div className="solis-ambient-container" aria-hidden="true">
        <div className="ambient-glow glow-top" />
        <div className="ambient-glow glow-right" />
      </div>

      <div className="admin-login-box-wrapper">
        <div className="solis-card admin-auth-card">
          <div className="admin-auth-head">
            <div className="admin-shield-icon">
              <ShieldCheck size={28} />
            </div>
            <h1 className="admin-title">Admin Management Console</h1>
            <p className="admin-subtitle">Authenticate with administrative credentials.</p>
          </div>

          <form className="auth-actual-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-email">
                <div className="label-title">
                  <Mail size={15} className="label-icon" />
                  <span>Admin Email</span>
                </div>
              </label>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@solisiq.internal"
                required
                disabled={loading}
                className="solis-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">
                <div className="label-title">
                  <Lock size={15} className="label-icon" />
                  <span>Administrative Password</span>
                </div>
              </label>
              <input
                id="admin-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                className="solis-input"
              />
            </div>

            <button
              type="submit"
              className="solis-btn solis-btn-primary full-width"
              disabled={loading}
            >
              {loading ? (
                <span className="solis-spinner" />
              ) : (
                <>
                  <span>Authenticate Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {error && (
              <div className="solis-form-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-links-footer">
              <div className="auth-secondary-links">
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => navigate('/login')}
                >
                  Return to User Login
                </button>
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => navigate('/')}
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
