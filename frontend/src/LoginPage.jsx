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

      <div className="auth-split-container">
        {/* Left Visual Presentation */}
        <aside className="auth-visual-side">
          <Link to="/" className="solis-brand auth-brand">
            <div className="solis-logo-icon">
              <Sun size={22} />
            </div>
            <span className="brand-title">SolisIQ</span>
          </Link>

          <div className="auth-visual-content">
            <div className="auth-eyebrow">
              <Sparkles size={14} className="text-solar" />
              <span>PRECISION ENERGY REVOLUTION</span>
            </div>
            <h2 className="auth-hero-title">
              Welcome back to <br />
              <span className="title-gradient-solar">Solar Intelligence.</span>
            </h2>
            <p className="auth-hero-desc">
              Sign in to manage your rooftop assessments, track tariff savings, and download executive PDF reports.
            </p>

            <div className="auth-feature-cards-col">
              <div className="auth-feature-pill">
                <Zap size={18} className="text-solar" />
                <div>
                  <strong>Instant Saved Calculations</strong>
                  <p>Access your past rooftop forecasts anytime.</p>
                </div>
              </div>

              <div className="auth-feature-pill">
                <TrendingUp size={18} className="text-emerald" />
                <div>
                  <strong>Personalized Tariff Modeling</strong>
                  <p>Tailored financial yields and payback timelines.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Form Presentation */}
        <main className="auth-form-side">
          <div className="solis-card auth-form-card">
            <div className="auth-form-head">
              <h1 className="auth-form-title">Sign In</h1>
              <p className="auth-form-sub">Enter your email credentials to access your dashboard.</p>
            </div>

            <form className="auth-actual-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">
                  <div className="label-title">
                    <Mail size={15} className="label-icon" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  className="solis-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">
                  <div className="label-title">
                    <Lock size={15} className="label-icon" />
                    <span>Password</span>
                  </div>
                </label>
                <input
                  id="login-password"
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
                className="solis-btn solis-btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="solis-spinner" />
                ) : (
                  <>
                    <span>Sign In</span>
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
