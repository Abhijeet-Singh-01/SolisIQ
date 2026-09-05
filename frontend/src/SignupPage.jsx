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
              <span>START YOUR SOLAR ODYSSEY</span>
            </div>
            <h2 className="auth-hero-title">
              Power your home with <br />
              <span className="title-gradient-solar">Zero Emissions.</span>
            </h2>
            <p className="auth-hero-desc">
              Join thousands of Indian households analyzing rooftops, saving on electricity bills, and accelerating net-zero transition.
            </p>

            <div className="auth-feature-cards-col">
              <div className="auth-feature-pill">
                <Leaf size={18} className="text-emerald" />
                <div>
                  <strong>Complete Carbon Audit</strong>
                  <p>Quantify your lifetime greenhouse gas reduction.</p>
                </div>
              </div>

              <div className="auth-feature-pill">
                <Zap size={18} className="text-solar" />
                <div>
                  <strong>Government Subsidy Tracking</strong>
                  <p>Never miss out on central or state capital grants.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Form Presentation */}
        <main className="auth-form-side">
          <div className="solis-card auth-form-card">
            <div className="auth-form-head">
              <h1 className="auth-form-title">Create Account</h1>
              <p className="auth-form-sub">Sign up for a free SolisIQ intelligence account.</p>
            </div>

            <form className="auth-actual-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="signup-username">
                  <div className="label-title">
                    <User size={15} className="label-icon" />
                    <span>Username</span>
                  </div>
                </label>
                <input
                  id="signup-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. rohit_solar"
                  required
                  disabled={loading}
                  className="solis-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">
                  <div className="label-title">
                    <Mail size={15} className="label-icon" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  id="signup-email"
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
                <label htmlFor="signup-password">
                  <div className="label-title">
                    <Lock size={15} className="label-icon" />
                    <span>Password</span>
                  </div>
                </label>
                <input
                  id="signup-password"
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
                    <span>Create Free Account</span>
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

              {success && (
                <div className="solis-form-success">
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
