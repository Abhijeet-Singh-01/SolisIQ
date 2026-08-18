import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';

function AdminLoginPage({ onAdminLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.username.trim()) {
      return 'Admin username is required.';
    }
    if (!formData.password) {
      return 'Password is required.';
    }
    return '';
  };

  const getApiErrorMessage = (err, fallback) => {
    if (!err?.response) {
      return err?.message || fallback || 'Unable to connect. Please check your network and try again.';
    }

    if (err.response.status === 400) {
      return err.response.data?.error || fallback || 'Invalid credentials or request. Please try again.';
    }

    if (err.response.status >= 500) {
      return err.response.data?.error || fallback || 'Server error. Please try again later.';
    }

    return err.response.data?.error || err.response.data?.message || fallback || 'Admin login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        username: formData.username,
        password: formData.password,
      }, { timeout: 10000 });

      if (response.data?.token) {
        onAdminLogin(response.data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Admin login failed. Please verify your credentials.');
      }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Admin login failed. Please verify your credentials.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell admin-shell">
      <form className="auth-card admin-card" onSubmit={handleSubmit}>
        <div className="auth-heading">
          <h2>Admin access</h2>
          <p>Secure panel for authorised administrators.</p>
        </div>

        <label>
          Username
          <input type="text" name="username" value={formData.username} onChange={handleChange} />
        </label>

        <label>
          Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Checking access...' : 'Admin Login'}
        </button>

        {error && <p className="error-message">{error}</p>}

        <p className="auth-link-row">
          <button type="button" className="text-link" onClick={() => navigate('/login')}>
            Back to user login
          </button>
        </p>
      </form>
    </div>
  );
}

export default AdminLoginPage;
