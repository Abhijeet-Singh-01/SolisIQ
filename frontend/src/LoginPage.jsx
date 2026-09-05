import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import {
  Sun,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

function LoginPage({ onLogin }) {
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
      const response = await axios.post(`${API_BASE_URL}/login`, formData, { timeout: 10000 });
      const { token, user } = response.data;
      if (token && user) {
        onLogin(token, user);
        navigate('/calculator');
      } else {
        setError('Login succeeded but token was missing.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(msg);
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

      <div className="auth-split-editorial-container">
        {/* Left Visual Presentation */}
        <aside className="auth-editorial-visual">
          <div className="auth-img-backdrop">
            <img
              src="/assets/solar-cells.jpg"
              alt="Monocrystalline solar photovoltaic cells with warm sunlight reflection"
              className="auth-cinematic-img"
            />
            <div className="auth-visual-scrim" />
          </div>

          <div className="auth-visual-content">
            <Link to="/" className="solis-brand auth-brand">
              <span className="brand-dot" aria-hidden="true" />
              <span className="brand-title">SolisIQ</span>
              <span className="brand-mono-badge">AI</span>
            </Link>

            <div className="auth-copy-bottom">
              <span className="auth-mono-kicker">SOLISIQ CONSOLE</span>
              <h2 className="auth-hero-title">
                Solar intelligence, <br />
                refined.
              </h2>
              <p className="auth-hero-desc">
                Sign in to manage your rooftop assessments, track tariff savings, and download executive PDF reports.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Form Presentation */}
        <main className="auth-editorial-form-side">
          <div className="auth-editorial-card">
            <div className="auth-form-head">
              <span className="auth-mono-kicker">AUTHENTICATION</span>
              <h1 className="auth-form-title">Welcome back</h1>
              <p className="auth-form-sub">Enter your email and credentials to access your account.</p>
            </div>

            <form className="auth-form-body" onSubmit={handleSubmit}>
              <div className="form-field-group">
                <label htmlFor="login-email" className="field-label">
                  Email Address
                </label>
                <div className="input-affix-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                    disabled={loading}
                    className="solis-editorial-input"
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="login-password" className="field-label">
                  Password
                </label>
                <div className="input-affix-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="solis-editorial-input"
                  />
                </div>
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
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {error && (
                <div className="editorial-form-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-links-footer">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-link-btn highlight"
                    onClick={() => navigate('/signup')}
                  >
                    Create one now
                  </button>
                </p>

                <div className="auth-divider-line" />

                <div className="auth-secondary-links">
                  <button
                    type="button"
                    className="text-link-btn muted"
                    onClick={() => navigate('/admin/login')}
                  >
                    Admin Console Access
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
        </main>
      </div>
    </div>
  );
}

export default LoginPage;
