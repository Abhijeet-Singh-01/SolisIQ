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
            <div className="calc-kicker-wrap">
              <span className="kicker-dot" />
              <span className="calc-mono-kicker">SUBSIDY DISCOVERY</span>
            </div>
            <h1 className="subsidy-editorial-title">
              State & Central Subsidy Explorer
            </h1>
            <p className="subsidy-editorial-desc">
              Find incentives available for your solar installation under the PM Surya Ghar Scheme (Muft Bijli Yojana) and state renewable directives.
            </p>
          </div>
        </section>

        {/* Subsidy Interactive Calculator Card */}
        <section className="subsidy-tool-section">
          <div className="subsidy-editorial-card">
            {/* Left Controls */}
            <div className="subsidy-controls-col">
              <div className="tool-block-header">
                <span className="tool-mono-kicker">PARAMETERS</span>
                <h3 className="tool-title">Installation Profile</h3>
              </div>

              {/* State Dropdown */}
              <div className="form-field-group">
                <label htmlFor="state-picker" className="field-label">
                  State / Union Territory
                </label>
                <div className="input-affix-wrap">
                  <Building size={16} className="input-icon" />
                  <select
                    id="state-picker"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="solis-editorial-select"
                  >
                    {Object.keys(stateSubsidies).map((st) => (
                      <option key={st} value={st}>
                        {st} ({stateSubsidies[st].statePct}% State Subsidy)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacity Slider */}
              <div className="form-field-group">
                <div className="slider-label-row">
                  <span className="field-label">Rooftop System Capacity</span>
                  <strong className="slider-val-readout">{Number(systemCapacity).toFixed(1)} kW</strong>
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
                <div className="sim-slider-benchmarks">
                  <span>1.0 kW</span>
                  <span>5.0 kW</span>
                  <span>10.0 kW</span>
                </div>
              </div>

              {/* State Policy Note Card */}
              <div className="state-policy-editorial-note">
                <div className="note-head">
                  <Award size={15} className="text-solar" />
                  <strong>{selectedState} Policy Summary</strong>
                </div>
                <p>{currentInfo.note}</p>
              </div>

              <button
                type="button"
                className="solis-btn solis-btn-primary full-width"
                onClick={() => navigate('/calculator')}
              >
                <span>Calculate My Rooftop with Subsidies</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Right Financial Breakdown */}
            <div className="subsidy-breakdown-col">
              <div className="breakdown-header-block">
                <span className="card-mono-kicker">FINANCIAL BREAKDOWN</span>
                <h3 className="breakdown-editorial-title">Capital Support & Net Financial Investment</h3>
              </div>

              <div className="breakdown-editorial-grid">
                <div className="breakdown-stat-cell">
                  <span className="b-kicker">GROSS BENCHMARK COST</span>
                  <strong className="b-number">₹{grossCost.toLocaleString('en-IN')}</strong>
                  <span className="b-footnote">@ ₹60,000 / kW benchmark</span>
                </div>

                <div className="breakdown-stat-cell green">
                  <span className="b-kicker">CENTRAL DBT GRANT</span>
                  <strong className="b-number">₹{centralSubsidy.toLocaleString('en-IN')}</strong>
                  <span className="b-footnote">PM Surya Ghar Yojana</span>
                </div>

                <div className="breakdown-stat-cell green">
                  <span className="b-kicker">STATE CAPITAL INCENTIVE</span>
                  <strong className="b-number">₹{stateSubsidyAmount.toLocaleString('en-IN')}</strong>
                  <span className="b-footnote">{currentInfo.statePct}% state scheme</span>
                </div>

                <div className="breakdown-stat-cell highlight">
                  <span className="b-kicker">TOTAL SUBSIDY SAVINGS</span>
                  <strong className="b-number">₹{totalSubsidies.toLocaleString('en-IN')}</strong>
                  <span className="b-footnote">{effectiveSubsidyPercent}% upfront discount</span>
                </div>
              </div>

              {/* Net Consumer Cost Banner */}
              <div className="net-outlay-banner">
                <div>
                  <span className="net-kicker">FINAL NET OUT-OF-POCKET OUTLAY</span>
                  <strong className="net-big-price">₹{netConsumerCost.toLocaleString('en-IN')}</strong>
                </div>
                <div className="net-savings-badge">
                  <span>{effectiveSubsidyPercent}% Government Supported</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="solis-footer simple-footer">
        <div className="footer-bottom-inner">
          <span>© 2026 SolisIQ Technologies Inc. All government scheme data verified.</span>
          <div className="footer-legal-row">
            <Link to="/">Home</Link>
            <Link to="/calculator">Solar Calculator</Link>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SubsidyCheckerPage;
