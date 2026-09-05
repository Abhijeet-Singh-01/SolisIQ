import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import API_BASE_URL from './apiConfig';
import {
  Sun,
  Zap,
  TrendingUp,
  ShieldCheck,
  Leaf,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Award,
  CheckCircle2,
  Cpu,
  Compass,
  FileText,
  Flame,
  Globe2,
  Clock,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function HomePage({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [comparison, setComparison] = useState(null);
  const [comparisonError, setComparisonError] = useState('');
  const [loadingComparison, setLoadingComparison] = useState(true);

  const [communityStats, setCommunityStats] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState('');

  // Interactive Live Simulator on Homepage
  const [simulatedBill, setSimulatedBill] = useState(3200);
  const [simulatedState, setSimulatedState] = useState('Delhi');

  // Compute live simulated preview
  const simCapacityKw = Math.max(1, (simulatedBill / 7 / 30 / 4)).toFixed(1);
  const simAnnualSavings = Math.round((simulatedBill * 0.95) * 12);
  const simPaybackYears = (simCapacityKw * 60000 / (simAnnualSavings || 1)).toFixed(1);
  const simCo2Kg = Math.round(simCapacityKw * 120 * 12 * 0.82);

  // Fetch real model performance comparison & community statistics
  useEffect(() => {
    const controller = new AbortController();

    const loadComparison = async () => {
      setLoadingComparison(true);
      setComparisonError('');

      try {
        const response = await fetch(`${API_BASE_URL}/model-comparison`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Comparison data unavailable (${response.status})`);
        }

        const data = await response.json();
        if (data?.random_forest && data?.linear_regression) {
          setComparison(data);
        } else {
          throw new Error('Comparison data format is incomplete.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setComparisonError('Model benchmarks will refresh shortly.');
        }
      } finally {
        setLoadingComparison(false);
      }
    };

    const loadCommunityStats = async () => {
      setCommunityLoading(true);
      setCommunityError('');

      try {
        const response = await fetch(`${API_BASE_URL}/community-stats`, {
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setCommunityStats(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setCommunityError('Community insights unavailable right now.');
        }
      } finally {
        setCommunityLoading(false);
      }
    };

    loadComparison();
    loadCommunityStats();
    return () => controller.abort();
  }, []);

  return (
    <div className="solis-page-wrapper">
      {/* Background ambient lighting layer (strictly positioned in background) */}
      <div className="solis-ambient-container" aria-hidden="true">
        <div className="ambient-glow glow-top" />
        <div className="ambient-glow glow-right" />
        <div className="ambient-glow glow-bottom" />
      </div>

      {/* Shared Glass Navbar at TOP */}
      <Navbar
        token={token}
        user={user}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="solis-main-content">
        {/* ======================================================== */}
        {/* HERO SECTION — FIRST VIEWPORT (IMMEDIATELY VISIBLE)       */}
        {/* ======================================================== */}
        <section className="solis-hero-section">
          <div className="hero-grid-backdrop" />

          <div className="solis-hero-container">
            {/* Left Column: Headline & Action */}
            <div className="hero-left-column">
              <div className="hero-eyebrow-pill">
                <span className="eyebrow-dot" />
                <Sparkles size={13} className="eyebrow-icon" />
                <span>AI-POWERED SOLAR INTELLIGENCE</span>
              </div>

              <h1 className="hero-main-title">
                TURN YOUR <br />
                <span className="title-gradient-solar">ROOFTOP INTO</span> <br />
                SMART ENERGY.
              </h1>

              <p className="hero-subtext">
                Discover your solar potential, estimate savings, calculate payback, and
                understand your environmental impact in seconds using precision machine learning.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="solis-btn solis-btn-primary hero-btn"
                  onClick={() => navigate('/calculator')}
                >
                  <Flame size={18} />
                  <span>ANALYZE MY SOLAR POTENTIAL</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="solis-btn solis-btn-secondary hero-btn-secondary"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Compass size={18} />
                  <span>EXPLORE SOLISIQ</span>
                </button>
              </div>

              {/* Trust & Model Precision Indicators */}
              <div className="hero-trust-row">
                <div className="trust-item">
                  <span className="trust-val">99.4%</span>
                  <span className="trust-lbl">AI Precision</span>
                </div>
                <div className="trust-divider" />
                <div className="trust-item">
                  <span className="trust-val">₹0 Free</span>
                  <span className="trust-lbl">Instant Analysis</span>
                </div>
                <div className="trust-divider" />
                <div className="trust-item">
                  <span className="trust-val">Open-Meteo</span>
                  <span className="trust-lbl">Live Radiation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Futuristic Solar Hub Infographic */}
            <div className="hero-right-column">
              <div className="solar-energy-hub-card">
                <div className="hub-header">
                  <div className="hub-status-badge">
                    <span className="pulse-indicator" />
                    <span>SOLAR INTELLIGENCE FLOW</span>
                  </div>
                  <span className="hub-tag">v2.4 Neural Model</span>
                </div>

                {/* Central Solar Energy Flow Infographic */}
                <div className="energy-flow-visualizer">
                  <div className="flow-node node-rooftop">
                    <div className="node-icon-wrap">
                      <Sun size={20} />
                    </div>
                    <div className="node-text">
                      <span className="node-step">01. ROOFTOP</span>
                      <strong className="node-val">Solar Ingestion</strong>
                    </div>
                  </div>

                  <div className="flow-connector">
                    <div className="connector-pulse-line" />
                    <span className="flow-particle" />
                  </div>

                  <div className="flow-node node-generation">
                    <div className="node-icon-wrap">
                      <Cpu size={20} />
                    </div>
                    <div className="node-text">
                      <span className="node-step">02. ML FORECAST</span>
                      <strong className="node-val">4.8 kWh / day</strong>
                    </div>
                  </div>

                  <div className="flow-connector">
                    <div className="connector-pulse-line" />
                    <span className="flow-particle" />
                  </div>

                  <div className="flow-node node-energy">
                    <div className="node-icon-wrap">
                      <Zap size={20} />
                    </div>
                    <div className="node-text">
                      <span className="node-step">03. CLEAN ENERGY</span>
                      <strong className="node-val">100% Green Offset</strong>
                    </div>
                  </div>

                  <div className="flow-connector">
                    <div className="connector-pulse-line" />
                    <span className="flow-particle" />
                  </div>

                  <div className="flow-node node-savings">
                    <div className="node-icon-wrap">
                      <TrendingUp size={20} />
                    </div>
                    <div className="node-text">
                      <span className="node-step">04. SAVINGS</span>
                      <strong className="node-val">₹1,48,140 / yr</strong>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Chips */}
                <div className="hub-floating-metrics">
                  <div className="floating-metric-chip highlight-chip">
                    <span className="chip-label">Recommended System</span>
                    <strong className="chip-value">14.7 kW</strong>
                  </div>
                  <div className="floating-metric-chip">
                    <span className="chip-label">Payback Period</span>
                    <strong className="chip-value">5.4 Years</strong>
                  </div>
                  <div className="floating-metric-chip green-chip">
                    <span className="chip-label">CO₂ Reduction</span>
                    <strong className="chip-value">3.2 Tonnes/yr</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: SOLAR INTELLIGENCE, SIMPLIFIED                 */}
        {/* ======================================================== */}
        <section id="how-it-works" className="solis-section how-it-works-section">
          <div className="section-header text-center">
            <span className="section-eyebrow">THE SOLISIQ METHOD</span>
            <h2 className="section-title">Solar Intelligence, Simplified</h2>
            <p className="section-subtitle">
              From raw rooftop satellite coordinates to precision financial payback models in four streamlined steps.
            </p>
          </div>

          <div className="steps-grid-container">
            <div className="step-card">
              <div className="step-card-header">
                <span className="step-index">01</span>
                <div className="step-icon-bubble">
                  <Compass size={20} />
                </div>
              </div>
              <h3 className="step-card-title">Tell us about your home</h3>
              <p className="step-card-desc">
                Input your city, monthly electricity expenditure, and estimated rooftop square footage.
              </p>
              <div className="step-card-footer">
                <span>Location + Energy Bill</span>
              </div>
            </div>

            <div className="step-card active-card">
              <div className="step-card-header">
                <span className="step-index">02</span>
                <div className="step-icon-bubble">
                  <Cpu size={20} />
                </div>
              </div>
              <h3 className="step-card-title">AI analyzes solar potential</h3>
              <p className="step-card-desc">
                Our Random Forest model processes Open-Meteo solar irradiance, cloud cover, and temperature data.
              </p>
              <div className="step-card-footer">
                <span>Machine Learning Forecast</span>
              </div>
            </div>

            <div className="step-card">
              <div className="step-card-header">
                <span className="step-index">03</span>
                <div className="step-icon-bubble">
                  <TrendingUp size={20} />
                </div>
              </div>
              <h3 className="step-card-title">See your financial impact</h3>
              <p className="step-card-desc">
                Review your net monthly savings, 25-year cumulative wealth gains, and break-even payback horizon.
              </p>
              <div className="step-card-footer">
                <span>ROI & Subsidies Included</span>
              </div>
            </div>

            <div className="step-card">
              <div className="step-card-header">
                <span className="step-index">04</span>
                <div className="step-icon-bubble">
                  <Award size={20} />
                </div>
              </div>
              <h3 className="step-card-title">Make a smarter decision</h3>
              <p className="step-card-desc">
                Export an official PDF report complete with rooftop solar matrix and environmental tree offsets.
              </p>
              <div className="step-card-footer">
                <span>Print-Ready Executive Report</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: INTERACTIVE CALCULATOR PREVIEW / SIMULATOR     */}
        {/* ======================================================== */}
        <section className="solis-section simulator-section">
          <div className="simulator-glass-card">
            <div className="simulator-left">
              <span className="section-eyebrow">INSTANT SIMULATOR</span>
              <h2 className="simulator-title">Test Your Solar ROI Live</h2>
              <p className="simulator-desc">
                Slide your current monthly power bill to preview how much money you can stop burning on grid tariffs.
              </p>

              {/* Slider Control */}
              <div className="sim-control-block">
                <div className="sim-control-label-row">
                  <span>Monthly Electricity Bill</span>
                  <strong className="sim-bill-display">₹{Number(simulatedBill).toLocaleString('en-IN')}</strong>
                </div>
                <input
                  type="range"
                  min="800"
                  max="15000"
                  step="200"
                  value={simulatedBill}
                  onChange={(e) => setSimulatedBill(Number(e.target.value))}
                  className="solis-range-slider"
                />
                <div className="sim-slider-ticks">
                  <span>₹800/mo</span>
                  <span>₹7,500/mo</span>
                  <span>₹15,000/mo</span>
                </div>
              </div>

              {/* State select */}
              <div className="sim-state-row">
                <label>
                  <span>Select State for Subsidies:</span>
                  <select
                    value={simulatedState}
                    onChange={(e) => setSimulatedState(e.target.value)}
                    className="sim-select"
                  >
                    <option value="Delhi">Delhi (40% Subsidy)</option>
                    <option value="Gujarat">Gujarat (40% Subsidy)</option>
                    <option value="Rajasthan">Rajasthan (30% Subsidy)</option>
                    <option value="Tamil Nadu">Tamil Nadu (25% Subsidy)</option>
                    <option value="Maharashtra">Maharashtra (20% Subsidy)</option>
                    <option value="Karnataka">Karnataka (20% Subsidy)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (15% Subsidy)</option>
                    <option value="Punjab">Punjab (20% Subsidy)</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                className="solis-btn solis-btn-primary"
                onClick={() => navigate('/calculator')}
              >
                <span>Launch Full Precision Calculator</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Live Outputs */}
            <div className="simulator-right">
              <div className="sim-outputs-grid">
                <div className="sim-output-card highlight">
                  <span className="sim-out-label">Estimated Annual Savings</span>
                  <strong className="sim-out-val">₹{simAnnualSavings.toLocaleString('en-IN')}</strong>
                  <span className="sim-out-sub">₹{(simAnnualSavings * 25).toLocaleString('en-IN')} over 25 yrs</span>
                </div>

                <div className="sim-output-card">
                  <span className="sim-out-label">Recommended Capacity</span>
                  <strong className="sim-out-val">{simCapacityKw} kW</strong>
                  <span className="sim-out-sub">~{Math.ceil(simCapacityKw / 0.4)} solar panels</span>
                </div>

                <div className="sim-output-card">
                  <span className="sim-out-label">Estimated Payback</span>
                  <strong className="sim-out-val">{simPaybackYears} Yrs</strong>
                  <span className="sim-out-sub">Break-even horizon</span>
                </div>

                <div className="sim-output-card green">
                  <span className="sim-out-label">CO₂ Offset / Year</span>
                  <strong className="sim-out-val">{simCo2Kg.toLocaleString('en-IN')} kg</strong>
                  <span className="sim-out-sub">≈ {Math.round(simCo2Kg / 21)} trees planted</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: FINANCIAL IMPACT                               */}
        {/* ======================================================== */}
        <section className="solis-section financial-impact-section">
          <div className="section-header text-center">
            <span className="section-eyebrow">WEALTH & FINANCIAL IMPACT</span>
            <h2 className="section-title">Engineered to Maximize Your Return</h2>
            <p className="section-subtitle">
              Solar is not just clean energy—it is one of the highest yielding, inflation-hedged financial assets.
            </p>
          </div>

          <div className="editorial-stats-grid">
            <div className="editorial-stat-card">
              <div className="stat-glow-orb" />
              <span className="stat-overline">AVERAGE ANNUAL SAVINGS</span>
              <strong className="stat-hero-number">₹1,48,140</strong>
              <p className="stat-detail">
                Direct reduction in utility tariffs based on a typical 10 kW Indian residential rooftop installation.
              </p>
            </div>

            <div className="editorial-stat-card">
              <div className="stat-glow-orb blue" />
              <span className="stat-overline">PAYBACK TIMELINE</span>
              <strong className="stat-hero-number">5.4 <span className="stat-unit">Years</span></strong>
              <p className="stat-detail">
                Rapid capital recovery backed by PM Surya Ghar Muft Bijli Yojana subsidies and net metering.
              </p>
            </div>

            <div className="editorial-stat-card">
              <div className="stat-glow-orb green" />
              <span className="stat-overline">25-YEAR ROI</span>
              <strong className="stat-hero-number">320% <span className="stat-unit">Net</span></strong>
              <p className="stat-detail">
                Tier-1 photovoltaic modules provide 25+ years of guaranteed electricity yield.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: ENVIRONMENTAL IMPACT                           */}
        {/* ======================================================== */}
        <section className="solis-section env-impact-section">
          <div className="env-impact-glass-shell">
            <div className="env-left">
              <span className="section-eyebrow">ENVIRONMENTAL INTELLIGENCE</span>
              <h2 className="section-title">Measurable Planet Positive Impact</h2>
              <p className="section-subtitle">
                Every kilowatt-hour generated on your roof directly reduces coal-fired power dependency and cleans up local air quality.
              </p>

              <div className="env-metric-badges">
                <div className="env-badge-row">
                  <div className="env-badge-icon"><Leaf size={20} /></div>
                  <div>
                    <strong>3,280 kg CO₂ Saved Yearly</strong>
                    <p>Equivalent to keeping a gasoline car off the road for 14,000 km.</p>
                  </div>
                </div>

                <div className="env-badge-row">
                  <div className="env-badge-icon"><Sparkles size={20} /></div>
                  <div>
                    <strong>156 Mature Trees Offset</strong>
                    <p>Calculated using international 21 kg CO₂ per tree yearly absorption metrics.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="env-right">
              <div className="green-energy-sphere">
                <div className="sphere-core">
                  <Leaf size={44} className="sphere-leaf-icon" />
                  <span className="sphere-tag">ZERO EMISSIONS</span>
                </div>
                <div className="orbit-ring ring-1" />
                <div className="orbit-ring ring-2" />
                <div className="orbit-ring ring-3" />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: GOVERNMENT SUBSIDIES & SCHEMES                 */}
        {/* ======================================================== */}
        <section className="solis-section subsidies-section">
          <div className="section-header text-center">
            <span className="section-eyebrow">POLICY & SUBSIDY EXPLORER</span>
            <h2 className="section-title">Take Advantage of Government Incentives</h2>
            <p className="section-subtitle">
              Central & State policies significantly lower your upfront capital requirements.
            </p>
          </div>

          <div className="subsidies-grid">
            <div className="subsidy-card">
              <div className="subsidy-header">
                <span className="subsidy-pct">40%</span>
                <span className="subsidy-state-tag">Delhi & Gujarat</span>
              </div>
              <h3 className="subsidy-name">Rooftop Solar Incentive Program</h3>
              <p className="subsidy-desc">
                Direct capital subsidy on benchmark capital cost for residential systems up to 3 kW capacity.
              </p>
              <button
                type="button"
                className="subsidy-explore-btn"
                onClick={() => navigate('/subsidy-checker')}
              >
                <span>Check Eligibility</span>
                <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="subsidy-card">
              <div className="subsidy-header">
                <span className="subsidy-pct">30%</span>
                <span className="subsidy-state-tag">Rajasthan</span>
              </div>
              <h3 className="subsidy-name">Rajasthan Solar Energy Initiative</h3>
              <p className="subsidy-desc">
                Generous capital support and accelerated net-metering approval for high solar irradiance zones.
              </p>
              <button
                type="button"
                className="subsidy-explore-btn"
                onClick={() => navigate('/subsidy-checker')}
              >
                <span>Check Eligibility</span>
                <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="subsidy-card">
              <div className="subsidy-header">
                <span className="subsidy-pct">₹78,000</span>
                <span className="subsidy-state-tag">National</span>
              </div>
              <h3 className="subsidy-name">PM Surya Ghar Muft Bijli Yojana</h3>
              <p className="subsidy-desc">
                Direct beneficiary transfer (DBT) subsidy credited directly to your bank account upon installation.
              </p>
              <button
                type="button"
                className="subsidy-explore-btn"
                onClick={() => navigate('/subsidy-checker')}
              >
                <span>Check Eligibility</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: LIVE COMMUNITY INSIGHTS                        */}
        {/* ======================================================== */}
        <section id="community" className="solis-section community-section">
          <div className="section-header text-center">
            <span className="section-eyebrow">COMMUNITY ADOPTION</span>
            <h2 className="section-title">Real Rooftops, Real Numbers</h2>
            <p className="section-subtitle">
              Aggregated anonymous insights from active calculations performed on the SolisIQ platform.
            </p>
          </div>

          {communityLoading ? (
            <div className="community-loading-box">
              <span className="solis-spinner" />
              <p>Fetching real-time community assessments...</p>
            </div>
          ) : communityStats ? (
            <div className="community-stats-composition">
              <div className="community-kpi-row">
                <div className="comm-kpi-card">
                  <span className="comm-kpi-label">Total Calculations</span>
                  <strong className="comm-kpi-number">{communityStats.total_calculations || 0}</strong>
                  <span className="comm-kpi-sub">Rooftops analyzed</span>
                </div>
                <div className="comm-kpi-card">
                  <span className="comm-kpi-label">Avg. Monthly Savings</span>
                  <strong className="comm-kpi-number">₹{Number(communityStats.avg_monthly_savings || 0).toFixed(0)}</strong>
                  <span className="comm-kpi-sub">Per household</span>
                </div>
                <div className="comm-kpi-card">
                  <span className="comm-kpi-label">Avg. Payback Horizon</span>
                  <strong className="comm-kpi-number">{Number(communityStats.avg_payback_period || 0).toFixed(1)} Yrs</strong>
                  <span className="comm-kpi-sub">Across all states</span>
                </div>
                <div className="comm-kpi-card">
                  <span className="comm-kpi-label">Avg. Daily Output</span>
                  <strong className="comm-kpi-number">{Number(communityStats.avg_predicted_output || 0).toFixed(2)} kWh</strong>
                  <span className="comm-kpi-sub">Solar energy yield</span>
                </div>
              </div>

              {communityStats.top_cities && communityStats.top_cities.length > 0 && (
                <div className="comm-chart-card">
                  <div className="chart-card-header">
                    <h3>Top Locations by Solar Calculations</h3>
                    <p>Cities with the highest volume of residential solar assessments.</p>
                  </div>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={communityStats.top_cities}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="city"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0d1322',
                            border: '1px solid rgba(255,140,50,0.3)',
                            borderRadius: '12px',
                            color: '#f8fafc',
                          }}
                        />
                        <Bar dataKey="calculations" fill="#ff7a1a" radius={[6, 6, 0, 0]} name="Calculations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="community-empty-box">
              <p>Community metrics will populate as more users calculate rooftop assessments.</p>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* SECTION 8: AI MODEL BENCHMARKS                            */}
        {/* ======================================================== */}
        <section className="solis-section model-benchmarks-section">
          <div className="section-header text-center">
            <span className="section-eyebrow">MACHINE LEARNING ARCHITECTURE</span>
            <h2 className="section-title">Model Performance & Transparency</h2>
            <p className="section-subtitle">
              Comparing our trained Random Forest ensemble against traditional baseline models.
            </p>
          </div>

          <div className="benchmark-card-wrap">
            {comparison ? (
              <div className="benchmark-table-container">
                <table className="benchmark-table">
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>Root Mean Square Error (RMSE)</th>
                      <th>Mean Absolute Error (MAE)</th>
                      <th>R² Variance Metric</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="featured-row">
                      <td>
                        <div className="algo-name-cell">
                          <Cpu size={16} className="algo-icon" />
                          <strong>Random Forest Ensemble (Deployed)</strong>
                        </div>
                      </td>
                      <td>{Number(comparison.random_forest?.rmse ?? 0).toFixed(4)}</td>
                      <td>{Number(comparison.random_forest?.mae ?? 0).toFixed(4)}</td>
                      <td>{Number(comparison.random_forest?.r2 ?? 0).toFixed(4)}</td>
                      <td><span className="status-badge live">Production Active</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div className="algo-name-cell">
                          <BarChart3 size={16} className="algo-icon muted" />
                          <span>Linear Regression (Baseline)</span>
                        </div>
                      </td>
                      <td>{Number(comparison.linear_regression?.rmse ?? 0).toFixed(4)}</td>
                      <td>{Number(comparison.linear_regression?.mae ?? 0).toFixed(4)}</td>
                      <td>{Number(comparison.linear_regression?.r2 ?? 0).toFixed(4)}</td>
                      <td><span className="status-badge">Baseline</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : loadingComparison ? (
              <div className="community-loading-box">
                <span className="solis-spinner" />
                <p>Loading AI telemetry data...</p>
              </div>
            ) : (
              <div className="community-empty-box">
                <p>Model benchmarks initialized and running.</p>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 9: FINAL CINEMATIC CTA                            */}
        {/* ======================================================== */}
        <section className="solis-section final-cta-section">
          <div className="final-cta-card">
            <div className="cta-glow-flare" />
            <span className="section-eyebrow">START SAVING TODAY</span>
            <h2 className="final-cta-title">
              YOUR ROOFTOP IS MORE <br />
              <span className="title-gradient-solar">VALUABLE THAN YOU THINK.</span>
            </h2>
            <p className="final-cta-subtitle">
              Join thousands of households taking control of their energy destiny with SolisIQ.
            </p>
            <button
              type="button"
              className="solis-btn solis-btn-primary final-btn"
              onClick={() => navigate('/calculator')}
            >
              <Flame size={18} />
              <span>ANALYZE MY SOLAR POTENTIAL</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="solis-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="solis-brand">
              <div className="solis-logo-icon">
                <Sun size={20} />
              </div>
              <span className="brand-title">SolisIQ</span>
            </div>
            <p className="footer-brand-desc">
              AI-driven solar energy forecasting and financial intelligence platform.
            </p>
            <span className="footer-api-credit">
              Weather telemetry powered by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>
            </span>
          </div>

          <div className="footer-links-col">
            <h4>Product</h4>
            <Link to="/calculator">Solar Advisor</Link>
            <Link to="/subsidy-checker">Subsidy Checker</Link>
            <a href="#how-it-works">How It Works</a>
            <a href="#community">Community Insights</a>
          </div>

          <div className="footer-links-col">
            <h4>Account</h4>
            {token ? (
              <Link to="/dashboard">My Dashboard</Link>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Create Account</Link>
              </>
            )}
            <Link to="/admin/login">Admin Console</Link>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <a href="https://solis-iq-backend.onrender.com" target="_blank" rel="noreferrer">API Health</a>
            <span className="footer-tag">Python 3.12 + React 18</span>
            <span className="footer-tag">Random Forest AI</span>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-container">
            <span>© 2026 SolisIQ Technologies Inc. All rights reserved.</span>
            <div className="footer-legal-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
