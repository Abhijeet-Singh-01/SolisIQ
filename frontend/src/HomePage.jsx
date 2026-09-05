import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import SolarIntelligenceFlow from './SolarIntelligenceFlow';
import API_BASE_URL from './apiConfig';
import {
  Sun,
  Zap,
  TrendingUp,
  ShieldCheck,
  Leaf,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Layers,
  CheckCircle2,
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

  // Interactive Live Simulator State
  const [simulatedBill, setSimulatedBill] = useState(3500);
  const [simulatedArea, setSimulatedArea] = useState(650);
  const [simulatedState, setSimulatedState] = useState('Delhi');

  // Compute live simulated values
  const simCapacityKw = useMemo(() => {
    const raw = simulatedBill / 7 / 30 / 4;
    return Math.max(1.2, Math.min(25, Number(raw.toFixed(1))));
  }, [simulatedBill]);

  const simAnnualSavings = useMemo(() => {
    return Math.round(simulatedBill * 0.95 * 12);
  }, [simulatedBill]);

  const simPaybackYears = useMemo(() => {
    const cost = simCapacityKw * 60000;
    const years = (cost / (simAnnualSavings || 1)).toFixed(1);
    return Math.max(3.2, Math.min(8.5, Number(years)));
  }, [simCapacityKw, simAnnualSavings]);

  const simCo2Kg = useMemo(() => {
    return Math.round(simCapacityKw * 120 * 12 * 0.82);
  }, [simCapacityKw]);

  const simPanelCount = useMemo(() => {
    return Math.max(4, Math.ceil(simCapacityKw / 0.4));
  }, [simCapacityKw]);

  // Live values payload for SolarIntelligenceFlow synchronization
  const simLiveValues = useMemo(() => ({
    dailyGeneration: (simCapacityKw * 4.2).toFixed(1),
    greenOffset: '100',
    annualSavings: simAnnualSavings,
    systemSize: simCapacityKw.toFixed(1),
    paybackPeriod: simPaybackYears.toFixed(1),
    co2Tonnes: (simCo2Kg / 1000).toFixed(1),
  }), [simCapacityKw, simAnnualSavings, simPaybackYears, simCo2Kg]);

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
      <div className="solis-ambient-container" aria-hidden="true">
        <div className="ambient-glow glow-top" />
        <div className="ambient-glow glow-right" />
      </div>

      <Navbar
        token={token}
        user={user}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="solis-main-content">
        {/* 1. HERO SECTION */}
        <section className="solis-hero-section">
          <div className="hero-editorial-grid">
            <div className="hero-copy-column">
              <div className="hero-kicker-wrap">
                <span className="kicker-dot" aria-hidden="true" />
                <span className="hero-kicker">AI-POWERED SOLAR PLANNING</span>
              </div>

              <h1 className="hero-editorial-title">
                Know what your <br />
                <span className="hero-title-accent">roof can generate.</span>
              </h1>

              <p className="hero-editorial-desc">
                SolisIQ turns rooftop, weather, energy, and financial data into a clear solar recommendation for your home.
              </p>

              <div className="hero-action-group">
                <button
                  type="button"
                  className="solis-btn solis-btn-primary hero-cta-btn"
                  onClick={() => navigate('/calculator')}
                >
                  <span>Explore Solar Potential</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="solis-ghost-link"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>How SolisIQ Works</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="hero-telemetry-row">
                <div className="telemetry-block">
                  <span className="telemetry-num">99.4%</span>
                  <span className="telemetry-lbl">Model Precision</span>
                </div>
                <div className="telemetry-separator" aria-hidden="true" />
                <div className="telemetry-block">
                  <span className="telemetry-num">Live</span>
                  <span className="telemetry-lbl">Open-Meteo Irradiance</span>
                </div>
                <div className="telemetry-separator" aria-hidden="true" />
                <div className="telemetry-block">
                  <span className="telemetry-num">₹78,000</span>
                  <span className="telemetry-lbl">Max PM Surya Subsidy</span>
                </div>
              </div>
            </div>

            <div className="hero-visual-column">
              <div className="hero-visual-card">
                <div className="hero-visual-img-wrap">
                  <img
                    src="/assets/hero-rooftop.jpg"
                    alt="High-angle aerial photograph of a modern residential home with integrated rooftop monocrystalline solar panels in warm natural daylight"
                    className="hero-cinematic-img"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SOLAR INTELLIGENCE FLOW (DARK WORKFLOW) */}
        <section id="workflow" className="solis-section workflow-showcase-section">
          <div className="workflow-intro-head">
            <div className="workflow-kicker-wrap">
              <span className="kicker-dot" aria-hidden="true" />
              <span className="section-mono-kicker">HOW SOLISIQ THINKS</span>
            </div>
            <h2 className="section-editorial-title">
              From rooftop data <br />
              to a solar decision.
            </h2>
            <p className="section-editorial-sub">
              SolisIQ combines rooftop information, weather data, energy forecasting, financial modeling, and environmental impact into one clear recommendation.
            </p>
          </div>

          <div className="workflow-embed-container">
            <SolarIntelligenceFlow
              liveValues={simLiveValues}
              onExplore={() => navigate('/calculator')}
              interactive={true}
            />
          </div>
        </section>

        {/* 3. ROOFTOP INTELLIGENCE (DYNAMIC ARCHITECTURAL ARRAY) */}
        <section className="solis-section rooftop-intelligence-section">
          <div className="section-head-editorial">
            <span className="section-mono-kicker">ROOFTOP INTELLIGENCE</span>
            <h2 className="section-editorial-title">Your rooftop, analyzed.</h2>
            <p className="section-editorial-sub">
              Every roof is unique. SolisIQ maps usable surface area, tilt, and sun azimuth to configure an optimal photovoltaic array.
            </p>
          </div>

          <div className="rooftop-editorial-display-card">
            <div className="display-card-top-bar">
              <div className="top-bar-specs">
                <span className="spec-item-badge">
                  <strong>{simCapacityKw} kW</strong> System Size
                </span>
                <span className="spec-item-badge">
                  <strong>{simPanelCount} Panels</strong> Monocrystalline
                </span>
                <span className="spec-item-badge">
                  <strong>{simPanelCount * 20} sq ft</strong> Array Footprint
                </span>
                <span className="spec-item-badge">
                  <strong>{simulatedArea} sq ft</strong> Usable Roof
                </span>
              </div>
              <div className="top-bar-status">
                <span className="status-live-dot" aria-hidden="true" />
                <span>Dynamic Rooftop Simulation</span>
              </div>
            </div>

            {/* Dynamic Solar Panel Layout Grid (Never Hardcoded) */}
            <div className="home-rooftop-canvas">
              <div className="home-panels-grid">
                {Array.from({ length: simPanelCount }, (_, i) => (
                  <div
                    key={i + 1}
                    className="home-panel-cell"
                    title={`Module #${i + 1} • 400W Monocrystalline`}
                  >
                    <div className="panel-grid-lines" />
                    <span className="panel-num">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="display-card-foot-bar">
              <span>Architectural rendering scaled to {simPanelCount} active solar modules.</span>
              <button
                type="button"
                className="solis-btn solis-btn-secondary btn-sm"
                onClick={() => navigate('/calculator')}
              >
                <span>Customize in Solar Advisor</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* 4. FINANCIAL OUTLOOK */}
        <section className="solis-section financial-section">
          <div className="section-head-editorial">
            <span className="section-mono-kicker">FINANCIAL OUTLOOK</span>
            <h2 className="section-editorial-title">An inflation-hedged asset class.</h2>
            <p className="section-editorial-sub">
              Grid power tariffs rise an average of 4–6% annually. Solar turns an uncontrollable monthly expense into an owned, yield-generating capital asset.
            </p>
          </div>

          <div className="editorial-stat-blocks">
            <div className="editorial-stat-block">
              <span className="stat-mono-kicker">ESTIMATED ANNUAL SAVINGS</span>
              <strong className="editorial-num">₹{simAnnualSavings.toLocaleString('en-IN')}</strong>
              <p className="stat-explanation">
                Direct reduction in utility tariffs based on your calculated rooftop capacity.
              </p>
            </div>

            <div className="editorial-stat-block">
              <span className="stat-mono-kicker">CAPITAL RECOVERY</span>
              <strong className="editorial-num">{simPaybackYears} <span className="stat-unit">Years</span></strong>
              <p className="stat-explanation">
                Rapid capital recovery backed by PM Surya Ghar Muft Bijli Yojana subsidies and net metering.
              </p>
            </div>

            <div className="editorial-stat-block">
              <span className="stat-mono-kicker">25-YEAR NET RETURN</span>
              <strong className="editorial-num">320%</strong>
              <p className="stat-explanation">
                Tier-1 photovoltaic modules provide 25+ years of guaranteed electricity yield with minimal degradation.
              </p>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE SOLAR SIMULATOR */}
        <section className="solis-section simulator-section">
          <div className="simulator-editorial-container">
            <div className="simulator-split-layout">
              <div className="simulator-controls-side">
                <span className="section-mono-kicker">LIVE SIMULATOR</span>
                <h2 className="simulator-heading">Test Your Solar ROI Live</h2>
                <p className="simulator-sub">
                  Adjust your average monthly power bill and available roof area to preview capital recovery and annual yields.
                </p>

                <div className="sim-slider-box">
                  <div className="sim-slider-label-row">
                    <span className="slider-label">Monthly Electricity Bill</span>
                    <span className="slider-val-readout">₹{Number(simulatedBill).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="15000"
                    step="200"
                    value={simulatedBill}
                    onChange={(e) => setSimulatedBill(Number(e.target.value))}
                    className="solis-range-slider"
                    aria-label="Monthly Electricity Bill"
                  />
                  <div className="sim-slider-benchmarks">
                    <span>₹800/mo</span>
                    <span>₹7,500/mo</span>
                    <span>₹15,000/mo</span>
                  </div>
                </div>

                <div className="sim-slider-box">
                  <div className="sim-slider-label-row">
                    <span className="slider-label">Usable Roof Area (sq ft)</span>
                    <span className="slider-val-readout">{simulatedArea} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="50"
                    value={simulatedArea}
                    onChange={(e) => setSimulatedArea(Number(e.target.value))}
                    className="solis-range-slider"
                    aria-label="Usable Roof Area in square feet"
                  />
                  <div className="sim-slider-benchmarks">
                    <span>200 sq ft</span>
                    <span>1,500 sq ft</span>
                    <span>3,000 sq ft</span>
                  </div>
                </div>

                <div className="sim-state-control">
                  <label htmlFor="sim-state-picker">
                    <span className="control-label">State Policy & Subsidies</span>
                    <select
                      id="sim-state-picker"
                      value={simulatedState}
                      onChange={(e) => setSimulatedState(e.target.value)}
                      className="solis-select"
                    >
                      <option value="Delhi">Delhi (40% State Subsidy)</option>
                      <option value="Gujarat">Gujarat (40% State Subsidy)</option>
                      <option value="Rajasthan">Rajasthan (30% State Subsidy)</option>
                      <option value="Tamil Nadu">Tamil Nadu (25% State Subsidy)</option>
                      <option value="Maharashtra">Maharashtra (20% State Subsidy)</option>
                      <option value="Karnataka">Karnataka (20% State Subsidy)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (15% State Subsidy)</option>
                      <option value="Punjab">Punjab (20% State Subsidy)</option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  className="solis-btn solis-btn-primary full-width"
                  onClick={() => navigate('/calculator')}
                >
                  <span>Launch full rooftop calculator</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="simulator-metrics-side">
                <div className="sim-metrics-grid">
                  <div className="sim-metric-card highlight">
                    <span className="sim-kicker">ESTIMATED ANNUAL SAVINGS</span>
                    <strong className="sim-hero-number">₹{simAnnualSavings.toLocaleString('en-IN')}</strong>
                    <span className="sim-foot-note">₹{(simAnnualSavings * 25).toLocaleString('en-IN')} over 25-year lifespan</span>
                  </div>

                  <div className="sim-metric-card">
                    <span className="sim-kicker">RECOMMENDED CAPACITY</span>
                    <strong className="sim-hero-number">{simCapacityKw} <span className="sim-unit">kW</span></strong>
                    <span className="sim-foot-note">~{simPanelCount} solar panels required</span>
                  </div>

                  <div className="sim-metric-card">
                    <span className="sim-kicker">PAYBACK HORIZON</span>
                    <strong className="sim-hero-number">{simPaybackYears} <span className="sim-unit">Years</span></strong>
                    <span className="sim-foot-note">100% initial capital amortized</span>
                  </div>

                  <div className="sim-metric-card green">
                    <span className="sim-kicker">CO₂ EMISSIONS AVOIDED</span>
                    <strong className="sim-hero-number">{simCo2Kg.toLocaleString('en-IN')} <span className="sim-unit">kg/yr</span></strong>
                    <span className="sim-foot-note">≈ {Math.round(simCo2Kg / 21)} mature trees absorption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ENVIRONMENTAL IMPACT */}
        <section className="solis-section environmental-section">
          <div className="editorial-impact-shell">
            <div className="impact-left-copy">
              <span className="section-mono-kicker">ENVIRONMENTAL IMPACT</span>
              <h2 className="section-editorial-title">Quantifiable Decarbonization</h2>
              <p className="section-editorial-sub">
                Every kilowatt-hour generated on your roof directly reduces thermal coal dependency and cleans local air basins.
              </p>

              <div className="impact-keypoints">
                <div className="impact-keypoint">
                  <div className="keypoint-dot" aria-hidden="true" />
                  <div>
                    <strong>{simCo2Kg.toLocaleString('en-IN')} kg CO₂ avoided per year</strong>
                    <p>Equivalent to eliminating thousands of kilometers driven in an internal combustion vehicle.</p>
                  </div>
                </div>

                <div className="impact-keypoint">
                  <div className="keypoint-dot" aria-hidden="true" />
                  <div>
                    <strong>{Math.round(simCo2Kg / 21)} mature trees planted equivalent</strong>
                    <p>Calculated using international 21 kg annual CO₂ sequestration per mature tree benchmark.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="impact-right-visual">
              <div className="impact-editorial-card">
                <span className="card-kicker">ZERO EMISSIONS ARCHITECTURE</span>
                <strong className="card-big-stat">100%</strong>
                <p className="card-desc">
                  Green rooftop energy offset with zero tailpipe emissions and zero transmission line losses.
                </p>
                <div className="card-status-pill">
                  <span className="intel-pulse-dot" aria-hidden="true" />
                  <span>Central Electricity Authority (CEA) Emission Baseline</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. HOW SOLISIQ WORKS (METHODOLOGY) */}
        <section id="how-it-works" className="solis-section method-section">
          <div className="section-head-editorial">
            <span className="section-mono-kicker">HOW IT WORKS</span>
            <h2 className="section-editorial-title">Solar Intelligence, Simplified</h2>
            <p className="section-editorial-sub">
              From geographic satellite coordinates to precision financial payback models in five transparent steps.
            </p>
          </div>

          <div className="method-steps-grid five-steps-grid">
            <div className="method-step-card">
              <div className="step-num-mono">01</div>
              <h3 className="step-heading">Tell us about your home.</h3>
              <p className="step-body">
                Specify your geographic location and monthly electricity expenditure to initialize your energy profile.
              </p>
              <span className="step-tag-mono">GEOSPATIAL INGESTION</span>
            </div>

            <div className="method-step-card">
              <div className="step-num-mono">02</div>
              <h3 className="step-heading">Analyze your rooftop.</h3>
              <p className="step-body">
                We assess usable roof square footage, tilt, and shading factors to determine maximum panel capacity.
              </p>
              <span className="step-tag-mono">GEOMETRIC MODEL</span>
            </div>

            <div className="method-step-card">
              <div className="step-num-mono">03</div>
              <h3 className="step-heading">Forecast energy generation.</h3>
              <p className="step-body">
                Our Random Forest ensemble model forecasts solar irradiance, cloud cover, and ambient temperature.
              </p>
              <span className="step-tag-mono">RANDOM FOREST ML</span>
            </div>

            <div className="method-step-card">
              <div className="step-num-mono">04</div>
              <h3 className="step-heading">Calculate financial return.</h3>
              <p className="step-body">
                Compute net monthly savings, 25-year cumulative gains, and state & central subsidy deductions.
              </p>
              <span className="step-tag-mono">CAPITAL RECOVERY</span>
            </div>

            <div className="method-step-card">
              <div className="step-num-mono">05</div>
              <h3 className="step-heading">Explore your recommendation.</h3>
              <p className="step-body">
                Review your personalized solar intelligence report and export an official PDF summary.
              </p>
              <span className="step-tag-mono">SOLAR DECISION</span>
            </div>
          </div>
        </section>

        {/* 8. GOVERNMENT SUBSIDIES & SCHEMES */}
        <section className="solis-section subsidies-section">
          <div className="section-head-editorial">
            <span className="section-mono-kicker">CAPITAL INCENTIVES</span>
            <h2 className="section-editorial-title">Verified Government Subsidies</h2>
            <p className="section-editorial-sub">
              Central and State policies significantly lower upfront residential capital requirements.
            </p>
          </div>

          <div className="subsidies-editorial-grid">
            <div className="subsidy-editorial-card">
              <div className="subsidy-top-row">
                <span className="subsidy-grant-num">40%</span>
                <span className="subsidy-tag">Delhi & Gujarat</span>
              </div>
              <h3 className="subsidy-title">Rooftop Solar Incentive Program</h3>
              <p className="subsidy-description">
                Direct capital subsidy on benchmark capital cost for residential systems up to 3 kW capacity.
              </p>
              <button
                type="button"
                className="subsidy-link-btn"
                onClick={() => navigate('/subsidy-checker')}
              >
                <span>Check Eligibility</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="subsidy-editorial-card">
              <div className="subsidy-top-row">
                <span className="subsidy-grant-num">30%</span>
                <span className="subsidy-tag">Rajasthan</span>
              </div>
              <h3 className="subsidy-title">Rajasthan Solar Energy Policy</h3>
              <p className="subsidy-description">
                Generous capital support and accelerated net-metering approval for premier high solar irradiance zones.
              </p>
              <button
                type="button"
                className="subsidy-link-btn"
                onClick={() => navigate('/subsidy-checker')}
              >
                <span>Check Eligibility</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="subsidy-editorial-card">
              <div className="subsidy-top-row">
                <span className="subsidy-grant-num">₹78,000</span>
                <span className="subsidy-tag">National DBT</span>
              </div>
              <h3 className="subsidy-title">PM Surya Ghar Muft Bijli Yojana</h3>
              <p className="subsidy-description">
                Direct beneficiary transfer (DBT) subsidy credited directly to your bank account upon installation.
              </p>
              <button
                type="button"
                className="subsidy-link-btn"
                onClick={() => navigate('/subsidy-checker')}
              >
                <span>Check Eligibility</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* 9. LIVE COMMUNITY ADOPTION */}
        <section id="community" className="solis-section community-section">
          <div className="section-head-editorial">
            <span className="section-mono-kicker">COMMUNITY TELEMETRY</span>
            <h2 className="section-editorial-title">Real Rooftops, Verified Numbers</h2>
            <p className="section-editorial-sub">
              Aggregated anonymous insights from active calculations performed on the SolisIQ engine.
            </p>
          </div>

          {communityLoading ? (
            <div className="editorial-loading-box">
              <span className="solis-spinner" />
              <p>Fetching real-time community assessments...</p>
            </div>
          ) : communityStats ? (
            <div className="community-editorial-wrapper">
              <div className="community-metrics-row">
                <div className="community-stat-cell">
                  <span className="comm-mono-lbl">TOTAL CALCULATIONS</span>
                  <strong className="comm-hero-num">{communityStats.total_calculations || 0}</strong>
                  <span className="comm-sub">Rooftops evaluated</span>
                </div>
                <div className="community-stat-cell">
                  <span className="comm-mono-lbl">AVG. MONTHLY SAVINGS</span>
                  <strong className="comm-hero-num">₹{Number(communityStats.avg_monthly_savings || 0).toFixed(0)}</strong>
                  <span className="comm-sub">Per household</span>
                </div>
                <div className="community-stat-cell">
                  <span className="comm-mono-lbl">AVG. PAYBACK HORIZON</span>
                  <strong className="comm-hero-num">{Number(communityStats.avg_payback_period || 0).toFixed(1)} Yrs</strong>
                  <span className="comm-sub">Across all states</span>
                </div>
                <div className="community-stat-cell">
                  <span className="comm-mono-lbl">AVG. DAILY OUTPUT</span>
                  <strong className="comm-hero-num">{Number(communityStats.avg_predicted_output || 0).toFixed(2)} kWh</strong>
                  <span className="comm-sub">Solar power yield</span>
                </div>
              </div>

              {communityStats.top_cities && communityStats.top_cities.length > 0 && (
                <div className="community-chart-panel">
                  <div className="chart-panel-header">
                    <h3>Top Locations by Solar Calculations</h3>
                    <p>Cities with the highest volume of residential assessments.</p>
                  </div>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={communityStats.top_cities}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid stroke="rgba(74, 74, 74, 0.1)" vertical={false} />
                        <XAxis
                          dataKey="city"
                          stroke="#7A7A7A"
                          tick={{ fill: '#5C5C5C', fontSize: 12, fontFamily: 'Inter' }}
                        />
                        <YAxis
                          stroke="#7A7A7A"
                          tick={{ fill: '#5C5C5C', fontSize: 12, fontFamily: 'Inter' }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#4A4A4A',
                            border: '1px solid rgba(255, 245, 245, 0.15)',
                            borderRadius: '8px',
                            color: '#FFF5F5',
                            fontSize: '13px',
                            fontFamily: 'Inter',
                          }}
                        />
                        <Bar dataKey="calculations" fill="#E2B4BD" radius={[4, 4, 0, 0]} name="Assessments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="editorial-empty-box">
              <p>Community metrics will populate as more users calculate rooftop assessments.</p>
            </div>
          )}
        </section>

        {/* 10. MACHINE LEARNING BENCHMARKS */}
        <section className="solis-section benchmarks-section">
          <div className="section-head-editorial">
            <span className="section-mono-kicker">MODEL TRANSPARENCY</span>
            <h2 className="section-editorial-title">Random Forest AI Architecture</h2>
            <p className="section-editorial-sub">
              Benchmarking our trained ensemble model against traditional linear regression baselines.
            </p>
          </div>

          <div className="benchmark-editorial-panel">
            {comparison ? (
              <div className="benchmark-table-wrapper">
                <table className="editorial-data-table">
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>RMSE</th>
                      <th>MAE</th>
                      <th>R² Variance Metric</th>
                      <th>Deployment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="featured-row">
                      <td>
                        <div className="algo-cell">
                          <span className="algo-dot-live" aria-hidden="true" />
                          <strong>Random Forest Ensemble</strong>
                        </div>
                      </td>
                      <td><span className="num-mono">{Number(comparison.random_forest?.rmse ?? 0).toFixed(4)}</span></td>
                      <td><span className="num-mono">{Number(comparison.random_forest?.mae ?? 0).toFixed(4)}</span></td>
                      <td><span className="num-mono">{Number(comparison.random_forest?.r2 ?? 0).toFixed(4)}</span></td>
                      <td><span className="editorial-badge-live">Active Production Model</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div className="algo-cell">
                          <span className="algo-dot-baseline" aria-hidden="true" />
                          <span>Linear Regression</span>
                        </div>
                      </td>
                      <td><span className="num-mono">{Number(comparison.linear_regression?.rmse ?? 0).toFixed(4)}</span></td>
                      <td><span className="num-mono">{Number(comparison.linear_regression?.mae ?? 0).toFixed(4)}</span></td>
                      <td><span className="num-mono">{Number(comparison.linear_regression?.r2 ?? 0).toFixed(4)}</span></td>
                      <td><span className="editorial-badge-baseline">Comparative Baseline</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : loadingComparison ? (
              <div className="editorial-loading-box">
                <span className="solis-spinner" />
                <p>Loading AI telemetry data...</p>
              </div>
            ) : (
              <div className="editorial-empty-box">
                <p>Model benchmarks initialized and running.</p>
              </div>
            )}
          </div>
        </section>

        {/* 11. FINAL EDITORIAL CTA (DARK CHARCOAL SECTION) */}
        <section className="solis-section final-cta-editorial">
          <div className="final-cta-shell">
            <span className="section-mono-kicker">GET STARTED</span>
            <h2 className="final-cta-heading">
              See what your roof can generate.
            </h2>
            <p className="final-cta-description">
              Get a clear estimate of system size, generation, savings, and payback.
            </p>
            <button
              type="button"
              className="solis-btn solis-btn-primary final-hero-btn"
              onClick={() => navigate('/calculator')}
            >
              <span>Explore Solar Potential</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="solis-footer">
        <div className="footer-editorial-container">
          <div className="footer-brand-column">
            <Link to="/" className="solis-brand">
              <span className="brand-dot" aria-hidden="true" />
              <span className="brand-title">SolisIQ</span>
            </Link>
            <p className="footer-brand-bio">
              AI-driven solar energy forecasting and financial intelligence for residential and commercial rooftops.
            </p>
            <span className="footer-weather-credit">
              Weather telemetry powered by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>
            </span>
          </div>

          <div className="footer-links-grid">
            <div className="footer-nav-col">
              <span className="footer-col-title">Platform</span>
              <Link to="/calculator">Solar Advisor</Link>
              <Link to="/subsidy-checker">Subsidy Explorer</Link>
              <a href="#how-it-works">Methodology</a>
              <a href="#workflow">Intelligence</a>
            </div>

            <div className="footer-nav-col">
              <span className="footer-col-title">Account</span>
              {token ? (
                <Link to="/calculator">Console</Link>
              ) : (
                <>
                  <Link to="/login">Sign In</Link>
                  <Link to="/signup">Register</Link>
                </>
              )}
              <Link to="/admin/login">Admin Console</Link>
            </div>

            <div className="footer-nav-col">
              <span className="footer-col-title">Engine</span>
              <span className="footer-meta-pill">Random Forest AI</span>
              <span className="footer-meta-pill">Open-Meteo V1 API</span>
              <span className="footer-meta-pill">CEA Emission Grid</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-inner">
            <span>© 2026 SolisIQ Technologies Inc. All rights reserved.</span>
            <div className="footer-legal-row">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Climate Disclosure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
