import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import {
  Sun,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Zap,
  Leaf,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function SignupPage({ onSignup }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, formData, { timeout: 10000 });
      setSuccess(response.data.message || 'Account created successfully! Redirecting to login...');
      if (typeof onSignup === 'function') {
        onSignup();
      }
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Could not register account. Please try again.';
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
              src="/assets/hero-rooftop.jpg"
              alt="Sustainable architectural home with rooftop solar"
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
              <span className="auth-mono-kicker">SOLISIQ REGISTRY</span>
              <h2 className="auth-hero-title">
                Zero emissions, <br />
                lasting wealth.
              </h2>
              <p className="auth-hero-desc">
                Join homeowners evaluating rooftops, maximizing tariff savings, and accelerating energy independence.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Form Presentation */}
        <main className="auth-editorial-form-side">
          <div className="auth-editorial-card">
            <div className="auth-form-head">
              <span className="auth-mono-kicker">REGISTRATION</span>
              <h1 className="auth-form-title">Create Account</h1>
              <p className="auth-form-sub">Sign up for a free SolisIQ intelligence account.</p>
            </div>

            <form className="auth-form-body" onSubmit={handleSubmit}>
              <div className="form-field-group">
                <label htmlFor="signup-username" className="field-label">
                  Username
                </label>
                <div className="input-affix-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    id="signup-username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. rohit_solar"
                    required
                    disabled={loading}
                    className="solis-editorial-input"
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="signup-email" className="field-label">
                  Email Address
                </label>
                <div className="input-affix-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="signup-email"
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
                <label htmlFor="signup-password" className="field-label">
                  Password
                </label>
                <div className="input-affix-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="signup-password"
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
                    <span>Create Free Account</span>
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

              {success && (
                <div className="editorial-form-success" role="status">
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </div>
              )}

              <div className="auth-links-footer">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-link-btn highlight"
                    onClick={() => navigate('/login')}
                  >
                    Sign in here
                  </button>
                </p>

                <div className="auth-divider-line" />

                <div className="auth-secondary-links">
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

export default SignupPage;
