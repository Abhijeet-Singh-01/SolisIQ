import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';

const states = [
  'Delhi',
  'Maharashtra',
  'Gujarat',
  'Tamil Nadu',
  'Karnataka',
  'Uttar Pradesh',
  'Rajasthan',
  'Punjab',
];

function SubsidyCheckerPage() {
  const [formData, setFormData] = useState({ state: 'Delhi', capacity_kw: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getApiErrorMessage = (err, fallback) => {
    if (!err?.response) {
      return err?.message || fallback || 'Unable to connect. Please check your network and try again.';
    }

    const status = err.response.status;
    const backendMessage = err.response.data?.error || err.response.data?.message;

    if (status === 400) {
      return backendMessage || fallback || 'Request error. Please verify the subsidy information.';
    }
    if (status >= 500) {
      return backendMessage || fallback || 'Server error while retrieving subsidy information. Please try again later.';
    }

    return backendMessage || fallback || 'Could not load subsidy information. Please try again.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!formData.capacity_kw.trim()) {
      setError('Please enter your rooftop capacity in kW.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/subsidy-info`, {
        params: {
          state: formData.state,
          capacity_kw: formData.capacity_kw,
        },
        timeout: 10000,
      });

      if (!response?.data || response.data.error) {
        throw new Error(response.data?.error || 'Subsidy service returned invalid data.');
      }

      setResult(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load subsidy information.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subsidy-checker-page">
      <div className="page-header">
        <h1>Subsidy Checker</h1>
        <p>Use your state and rooftop capacity to estimate the solar subsidy amount.</p>
      </div>

      <form className="subsidy-form" onSubmit={handleSubmit}>
        <label>
          State
          <select name="state" value={formData.state} onChange={handleChange}>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rooftop capacity (kW)
          <input
            type="number"
            name="capacity_kw"
            step="0.1"
            min="0"
            value={formData.capacity_kw}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Checking subsidy…' : 'Check subsidy'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="subsidy-result-card">
          <h2>Subsidy details for {result.state}</h2>
          <p>
            <strong>Scheme:</strong> {result.scheme_name}
          </p>
          <p>
            <strong>Subsidy percent:</strong> {result.subsidy_percent}%
          </p>
          <p>
            <strong>Subsidy amount:</strong> ₹{result.subsidy_amount.toFixed(2)}
          </p>
          <p>
            <strong>Estimated system cost:</strong> ₹{result.system_cost.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}

export default SubsidyCheckerPage;
