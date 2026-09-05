import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import {
  Sun,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  HelpCircle,
  IndianRupee,
  Sliders,
} from 'lucide-react';

const stateSubsidies = {
  'Delhi': { statePct: 40, maxKw: 3, note: 'Delhi Solar Policy 2024 offers 40% capital support + generation-based incentive (GBI) of ₹3/kWh.' },
  'Maharashtra': { statePct: 20, maxKw: 10, note: 'Direct DBT subsidy under MSEDCL rooftop program with expedited net metering.' },
  'Gujarat': { statePct: 40, maxKw: 3, note: 'Surya Gujarat Scheme: 40% subsidy for up to 3 kW and 20% for 3–10 kW systems.' },
  'Tamil Nadu': { statePct: 25, maxKw: 5, note: 'TANGEDCO solar policy with fast-track bi-directional meter provisioning.' },
  'Karnataka': { statePct: 20, maxKw: 5, note: 'BESCOM/KERC rooftop scheme with gross metering and net metering options.' },
  'Uttar Pradesh': { statePct: 15, maxKw: 3, note: 'UPNEDA rooftop solar incentive + PM Surya Ghar Muft Bijli Yojana integration.' },
  'Rajasthan': { statePct: 30, maxKw: 5, note: 'Highest irradiance zone with dedicated state capital incentive and zero wheeling charges.' },
  'Punjab': { statePct: 20, maxKw: 3, note: 'PSPCL solar scheme with agricultural feeder prioritization and residential DBT.' },
};

function SubsidyCheckerPage({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const [selectedState, setSelectedState] = useState('Delhi');
  const [systemCapacity, setSystemCapacity] = useState(3.0);
  const navigate = useNavigate();

  const currentInfo = stateSubsidies[selectedState] || stateSubsidies['Delhi'];
  const benchmarkCostPerKw = 60000;
  const grossCost = systemCapacity * benchmarkCostPerKw;

  // Central Subsidy calculation (PM Surya Ghar scheme)
  let centralSubsidy = 0;
  if (systemCapacity <= 1) {
    centralSubsidy = 30000;
  } else if (systemCapacity <= 2) {
    centralSubsidy = 60000;
  } else {
    centralSubsidy = 78000;
  }

  // State Subsidy calculation
  const stateSubsidyAmount = Math.round(grossCost * (currentInfo.statePct / 100));
  const totalSubsidies = Math.min(grossCost * 0.6, centralSubsidy + stateSubsidyAmount);
  const netConsumerCost = Math.max(0, grossCost - totalSubsidies);
  const effectiveSubsidyPercent = Math.round((totalSubsidies / grossCost) * 100);

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
        {/* Hero Section */}
        <section className="subsidy-hero-section">
          <div className="subsidy-header-inner">
            <div className="calc-eyebrow">
              <span className="eyebrow-dot" />
              <ShieldCheck size={14} className="eyebrow-icon" />
              <span>POLICY & INCENTIVE REPOSITORY</span>
            </div>
            <h1 className="subsidy-main-title">
              State & Central Subsidy Explorer
            </h1>
            <p className="subsidy-subtext">
              Calculate exact grant eligibility under PM Surya Ghar Muft Bijli Yojana and your State Solar Policy.
            </p>
          </div>
        </section>

        {/* Subsidy Interactive Calculator Card */}
        <section className="subsidy-tool-section">
          <div className="subsidy-glass-card">
            {/* Left Controls */}
            <div className="subsidy-controls-col">
              <div className="tool-block-header">
                <Building size={20} className="text-solar" />
                <h3>Select Your Parameters</h3>
              </div>

              {/* State Dropdown */}
              <div className="form-group">
                <label htmlFor="state-picker">
                  <span>State / Union Territory</span>
                </label>
                <select
                  id="state-picker"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="solis-select"
                >
                  {Object.keys(stateSubsidies).map((st) => (
                    <option key={st} value={st}>
                      {st} ({stateSubsidies[st].statePct}% State Subsidy)
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity Slider */}
              <div className="form-group slider-group">
                <div className="slider-label-row">
                  <span>Rooftop System Capacity</span>
                  <strong className="slider-val-highlight">{Number(systemCapacity).toFixed(1)} kW</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={systemCapacity}
                  onChange={(e) => setSystemCapacity(Number(e.target.value))}
                  className="solis-range-slider"
                />
                <div className="sim-slider-ticks">
                  <span>1.0 kW</span>
                  <span>5.0 kW</span>
                  <span>10.0 kW</span>
                </div>
              </div>

              {/* State Policy Note Card */}
              <div className="state-policy-note-card">
                <div className="note-head">
                  <Award size={16} className="text-solar" />
                  <strong>{selectedState} Solar Policy Overview</strong>
                </div>
                <p>{currentInfo.note}</p>
              </div>

              <button
                type="button"
                className="solis-btn solis-btn-primary full-width"
                onClick={() => navigate('/calculator')}
              >
                <span>Calculate My Rooftop with Subsidies</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Financial Breakdown */}
            <div className="subsidy-breakdown-col">
              <div className="breakdown-head">
                <span className="breakdown-eyebrow">ESTIMATED FINANCIAL SUPPORT</span>
                <h3 className="breakdown-title">Net Financial Investment</h3>
              </div>

              <div className="breakdown-kpi-grid">
                <div className="breakdown-card">
                  <span className="b-label">Gross Benchmark Cost</span>
                  <strong className="b-val">₹{grossCost.toLocaleString('en-IN')}</strong>
                  <span className="b-sub">@ ₹60,000 / kW benchmark</span>
                </div>

                <div className="breakdown-card green">
                  <span className="b-label">Central Grant (DBT)</span>
                  <strong className="b-val">₹{centralSubsidy.toLocaleString('en-IN')}</strong>
                  <span className="b-sub">PM Surya Ghar Scheme</span>
                </div>

                <div className="breakdown-card green">
                  <span className="b-label">State Incentive</span>
                  <strong className="b-val">₹{stateSubsidyAmount.toLocaleString('en-IN')}</strong>
                  <span className="b-sub">{currentInfo.statePct}% state scheme</span>
                </div>

                <div className="breakdown-card highlight">
                  <span className="b-label">Total Subsidy Support</span>
                  <strong className="b-val">₹{totalSubsidies.toLocaleString('en-IN')}</strong>
                  <span className="b-sub">{effectiveSubsidyPercent}% total savings</span>
                </div>
              </div>

              {/* Net Consumer Cost Banner */}
              <div className="net-cost-highlight-banner">
                <div>
                  <span className="net-label">FINAL NET OUT-OF-POCKET COST</span>
                  <strong className="net-price">₹{netConsumerCost.toLocaleString('en-IN')}</strong>
                </div>
                <span className="net-tag">{effectiveSubsidyPercent}% Discount</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="solis-footer simple-footer">
        <div className="footer-bottom-container">
          <span>© 2026 SolisIQ Technologies Inc. All government scheme data verified.</span>
          <div className="footer-legal-links">
            <Link to="/">Home</Link>
            <Link to="/calculator">Solar Calculator</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SubsidyCheckerPage;
