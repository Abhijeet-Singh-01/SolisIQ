import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import SolarInputForm from './SolarInputForm';
import Dashboard from './Dashboard';
import CalculationHistory from './CalculationHistory';
import API_BASE_URL from './apiConfig';
import {
  Sun,
  Sparkles,
  ArrowLeft,
  Flame,
  ShieldCheck,
  History,
  TrendingUp,
} from 'lucide-react';

function DashboardPage({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/my-calculations`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setHistory(response.data.history || []);
    } catch (err) {
      if (err.response?.status === 401) {
        if (onLogout) onLogout();
        navigate('/login');
        return;
      }
      setHistoryError(err.response?.data?.message || 'Could not load your saved calculation history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [token, onLogout, navigate]);

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, fetchHistory]);

  const handleDeleteHistory = async (id) => {
    if (!token) return;
    try {
      await axios.delete(`${API_BASE_URL}/calculation/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete calculation.');
    }
  };

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
        {/* Page Hero Header */}
        <section className="calc-page-header">
          <div className="calc-header-inner">
            <div className="calc-title-box">
              <div className="calc-kicker-wrap">
                <span className="kicker-dot" />
                <span className="calc-mono-kicker">AI SOLAR ADVISOR & CALCULATOR</span>
              </div>
              <h1 className="calc-editorial-title">
                Rooftop Solar Intelligence
              </h1>
              <p className="calc-editorial-desc">
                Enter your power consumption and rooftop dimensions to generate a precision machine learning forecast.
              </p>
            </div>

            <div className="calc-telemetry-badge">
              <span className="intel-pulse-dot" />
              <span>Real-time Satellite Irradiance Connected</span>
            </div>
          </div>
        </section>

        {/* Dual Column Layout: Form Left, Results Right */}
        <section className="calculator-workspace-grid">
          <div className="workspace-left-col">
            <SolarInputForm
              token={token}
              onResults={setResults}
              onHistoryRefresh={fetchHistory}
            />
          </div>

          <div className="workspace-right-col">
            <Dashboard results={results} />
          </div>
        </section>

        {/* Calculation History for Logged in Users */}
        {token && (
          <section className="workspace-history-section">
            <CalculationHistory
              history={history}
              loading={historyLoading}
              error={historyError}
              onDelete={handleDeleteHistory}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="solis-footer simple-footer">
        <div className="footer-bottom-inner">
          <span>© 2026 SolisIQ Technologies Inc. Solar Intelligence Engine.</span>
          <div className="footer-legal-row">
            <Link to="/">Home</Link>
            <Link to="/subsidy-checker">Subsidies</Link>
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;
