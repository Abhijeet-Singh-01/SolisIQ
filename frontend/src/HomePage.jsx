import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [comparison, setComparison] = useState(null);
  const [comparisonError, setComparisonError] = useState('');
  const [loadingComparison, setLoadingComparison] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadComparison = async () => {
      setLoadingComparison(true);
      setComparisonError('');

      try {
        const response = await fetch('http://127.0.0.1:5000/model-comparison', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Comparison data unavailable (${response.status})`);
        }

        const data = await response.json();
        if (!data?.random_forest || !data?.linear_regression) {
          throw new Error('Comparison data is incomplete.');
        }

        setComparison(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }

        setComparisonError(err.message || 'Could not load model performance data.');
      } finally {
        setLoadingComparison(false);
      }
    };

    loadComparison();
    return () => controller.abort();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">SolisIQ</span>
          <h1>Smarter solar decisions for your rooftop.</h1>
          <p>Discover your solar potential, estimate savings, and measure environmental impact in one sleek experience.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate('/calculator')}>
              Calculate Now
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-stat">
            <span>Instant forecast</span>
            <strong>Solar energy in minutes</strong>
          </div>
          <div className="hero-stat">
            <span>Verified savings</span>
            <strong>Realistic cost estimates</strong>
          </div>
        </div>
      </section>

      <section className="why-solar-section">
        <h2>Why Solar?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">☀️</div>
            <h3>Lower bills</h3>
            <p>Reduce your energy costs with rooftop generation built for your home.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌍</div>
            <h3>Cleaner energy</h3>
            <p>Cut carbon emissions and move toward a greener future.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Reliable insights</h3>
            <p>Use data-driven output estimates and payback projections.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📈</div>
            <h3>Smart planning</h3>
            <p>Make decisions with easy-to-read savings and performance metrics.</p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <strong>500+</strong>
          <p>users served</p>
        </div>
        <div className="stat-card">
          <strong>1200+</strong>
          <p>kWh forecasted daily</p>
        </div>
        <div className="stat-card">
          <strong>98%</strong>
          <p>customer satisfaction</p>
        </div>
      </section>

      <section className="subsidy-link-card">
        <h2>Check your state subsidy</h2>
        <p>Use our subsidy checker to estimate the support available for your rooftop solar system.</p>
        <button className="primary-btn" onClick={() => window.location.href = '/subsidy-checker'}>
          Go to Subsidy Checker
        </button>
      </section>

      <section className="model-performance-section">
        <div className="model-performance-header">
          <h2>Model Performance</h2>
          <p>See how the Random Forest prediction compares to a simple linear baseline.</p>
        </div>
        {comparisonError ? (
          <p className="error-message">{comparisonError}</p>
        ) : comparison ? (
          <div className="model-comparison-table-wrapper">
            <table className="model-comparison-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>RMSE</th>
                  <th>MAE</th>
                  <th>R²</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Random Forest</td>
                  <td>{comparison.random_forest.rmse.toFixed(4)}</td>
                  <td>{comparison.random_forest.mae.toFixed(4)}</td>
                  <td>{comparison.random_forest.r2.toFixed(4)}</td>
                </tr>
                <tr>
                  <td>Linear Regression</td>
                  <td>{comparison.linear_regression.rmse.toFixed(4)}</td>
                  <td>{comparison.linear_regression.mae.toFixed(4)}</td>
                  <td>{comparison.linear_regression.r2.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : loadingComparison ? (
          <p>Loading model performance...</p>
        ) : (
          <p className="error-message">Could not display model performance right now.</p>
        )}
      </section>

      <footer className="home-footer">
        <div>
          <strong>SolisIQ</strong>
          <p>Helping households make smarter solar choices.</p>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/calculator">Calculator</a>
          <a href="/login">Login</a>
        </div>
        <div className="footer-copy">© 2026 SolisIQ. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default HomePage;
