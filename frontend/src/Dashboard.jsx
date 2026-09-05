import React, { useState } from 'react';
import { downloadPdfReport } from './reportDownload';
import useCountUp from './useCountUp';
import {
  Sun,
  Zap,
  TrendingUp,
  ShieldCheck,
  Leaf,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Check,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Calendar,
  IndianRupee,
  Maximize2,
  Clock,
  Flame,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function Dashboard({ results }) {
  // All hooks MUST be called unconditionally at the top of the component
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  // Safe extraction of properties
  const hasResults = Boolean(results && results.roi && results.prediction && results.carbon);
  const prediction = (hasResults && results.prediction) || {};
  const roi = (hasResults && results.roi) || {};
  const carbon = (hasResults && results.carbon) || {};

  const {
    monthly_units_kwh = 0,
    recommended_capacity_kw = 0,
    number_of_panels = 0,
    roof_area_required_sq_ft = 0,
    annual_savings = 0,
    lifetime_savings_25_years = 0,
    roi_percent = 0,
    estimated_monthly_savings = 0,
    payback_period_years = 0,
    system_cost = 0,
    state_subsidy_percent = 0,
  } = roi;

  // Tickers are always called unconditionally on every render
  const animatedMonthlySavings = useCountUp(estimated_monthly_savings, { duration: 900, decimals: 0 });
  const animatedAnnualSavings = useCountUp(annual_savings, { duration: 900, decimals: 0 });
  const animatedLifetimeSavings = useCountUp(lifetime_savings_25_years, { duration: 900, decimals: 0 });
  const animatedPayback = useCountUp(payback_period_years, { duration: 900, decimals: 1 });
  const animatedROI = useCountUp(roi_percent, { duration: 900, decimals: 1 });
  const animatedCO2 = useCountUp(carbon.co2_saved_kg, { duration: 900, decimals: 0 });
  const animatedUnits = useCountUp(monthly_units_kwh, { duration: 900, decimals: 0 });
  const animatedCapacity = useCountUp(recommended_capacity_kw, { duration: 900, decimals: 1 });
  const animatedArea = useCountUp(roof_area_required_sq_ft, { duration: 900, decimals: 0 });

  // Early return for empty state happens AFTER all hooks are invoked
  if (!hasResults) {
    return (
      <div className="dashboard-empty-card">
        <div className="empty-card-inner">
          <div className="empty-icon-wrap">
            <Sun size={36} className="empty-sun" />
            <div className="empty-pulse-glow" />
          </div>
          <h3>Awaiting Assessment Parameters</h3>
          <p>
            Configure your location, monthly bill, and rooftop area in the left panel to trigger the neural forecasting model and unlock your live solar assessment.
          </p>
          <div className="empty-badges-row">
            <span className="empty-badge">☀️ 25-Year Savings</span>
            <span className="empty-badge">⚡ Solar Output</span>
            <span className="empty-badge">💰 Government Subsidy</span>
          </div>
        </div>
      </div>
    );
  }

  const systemCostEstimate = Number(system_cost || (Number(recommended_capacity_kw || 0) * 60000));
  const paybackProgress = payback_period_years > 0 ? Math.min(100, Math.max(12, (1 / payback_period_years) * 100)) : 100;
  const breakEvenLabel = payback_period_years > 0 ? `around Year ${Math.ceil(payback_period_years)}` : 'within the first year';

  // Monthly savings chart data
  const monthlySavingsData = Array.from({ length: 12 }, (_, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    savings: Number(estimated_monthly_savings) ? Math.round(Number(estimated_monthly_savings) * (0.94 + index * 0.01)) : 0,
  }));

  // 25-year cumulative savings curve
  const yearlySavings = Array.from({ length: 25 }, (_, index) => ({
    year: `Yr ${index + 1}`,
    netSavings: Number(annual_savings) ? Math.round(Number(annual_savings) * (index + 1) - systemCostEstimate) : 0,
    grossSavings: Number(annual_savings) ? Math.round(Number(annual_savings) * (index + 1)) : 0,
  }));

  // Before vs After comparison
  const beforeAfterData = Array.from({ length: 6 }, (_, index) => {
    const baseBill = Number(results.userInput?.bill || results.userInput?.monthlyBill || 3000);
    const savedAmt = Number(estimated_monthly_savings || 0);
    return {
      period: `Month ${index + 1}`,
      withoutSolar: Math.round(baseBill + index * 40),
      withSolar: Math.max(400, Math.round(baseBill + index * 40 - savedAmt * 0.9)),
    };
  });

  const seasonalData = (results.seasonalBreakdown || []).map((item) => ({
    month: item.month.slice(0, 3),
    predicted: Number(item.predicted_energy_output_kwh || 0),
  }));

  const treeEquivalent = Math.round(Number(carbon.tree_equivalent || 0));

  // Rooftop layout visualizer (authoritative backend & user data driven)
  const panelWattage = Number(roi.panel_wattage || results.panel_wattage || 400);
  const actualPanelCount = Math.max(
    1,
    Math.round(
      Number(number_of_panels) ||
        (recommended_capacity_kw ? Math.ceil(recommended_capacity_kw / (panelWattage / 1000)) : 8)
    )
  );
  const userRoofArea = Number(results.userInput?.rooftopArea || results.userInput?.area || 0);
  const requiredArrayArea = Number(roof_area_required_sq_ft) > 0
    ? Number(roof_area_required_sq_ft)
    : (actualPanelCount * 20);
  const remainingRoofArea = userRoofArea > 0 ? Math.max(0, Math.round(userRoofArea - requiredArrayArea)) : null;
  const roofCoveragePercent = userRoofArea > 0 ? Math.min(100, Math.round((requiredArrayArea / userRoofArea) * 100)) : null;

  // Array containing exactly the number of panels from the backend
  const panelsArray = Array.from({ length: actualPanelCount }, (_, index) => ({
    id: index + 1,
  }));

  const shareText = `I could save ₹${Number(annual_savings).toLocaleString('en-IN')}/year with a ${recommended_capacity_kw} kW solar system using SolisIQ! Calculate yours at ${window.location.origin}`;

  const handleCopySummary = async () => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = shareText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
      }
      setCopyMessage('Summary copied to clipboard!');
      window.setTimeout(() => setCopyMessage(''), 3000);
    } catch {
      setCopyMessage('Could not copy summary.');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadPdfReport({
        city: results.userInput?.location || results.userInput?.city || 'Your Location',
        rooftopArea: Number(results.userInput?.area || results.userInput?.rooftopArea || 0),
        monthlyBill: Number(results.userInput?.bill || results.userInput?.monthlyBill || 0),
        state: results.userInput?.state || 'Delhi',
        predictedOutput: Number(prediction.predicted_energy_output_kwh || 0),
        monthlySavings: Number(roi.estimated_monthly_savings || 0),
        annualSavings: Number(roi.annual_savings || 0),
        paybackPeriod: Number(roi.payback_period_years || 0),
        co2SavedKg: Number(carbon.co2_saved_kg || 0),
        treeEquivalent: Number(carbon.tree_equivalent || 0),
      });
    } catch (err) {
      setDownloadError(err?.message || 'Could not generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="solis-dashboard-content">
      {/* ======================================================== */}
      {/* 1. EXECUTIVE REPORT HERO BANNER                           */}
      {/* ======================================================== */}
      <section className="dashboard-exec-hero">
        <div className="exec-hero-glow" />

        <div className="exec-hero-header">
          <div className="exec-title-block">
            <div className="exec-badge">
              <Sparkles size={13} />
              <span>ASSESSMENT SYNTHESIS</span>
            </div>
            <h2 className="exec-main-title">Comprehensive Rooftop Solar Intelligence</h2>
            <p className="exec-subtext">
              Engineered evaluation for {results.userInput?.city || results.userInput?.location || 'your home'} in {results.userInput?.state || 'India'}.
            </p>
          </div>

          <div className="exec-actions-block">
            <div className="exec-capacity-pill">
              <span className="cap-label">Recommended Scale</span>
              <strong className="cap-value">{animatedCapacity} kW System</strong>
            </div>

            <div className="exec-btn-row">
              <button
                type="button"
                className="solis-btn solis-btn-secondary exec-copy-btn"
                onClick={handleCopySummary}
              >
                {copyMessage ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                <span>{copyMessage || 'Share Summary'}</span>
              </button>

              <button
                type="button"
                className="solis-btn solis-btn-primary exec-download-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <span className="solis-spinner" />
                ) : (
                  <Download size={16} />
                )}
                <span>{downloading ? 'Compiling PDF...' : 'Download Full PDF Report'}</span>
              </button>
            </div>
          </div>
        </div>

        {downloadError && (
          <p className="dashboard-inline-error">{downloadError}</p>
        )}

        {/* Highlight Summary Stats */}
        <div className="exec-kpi-summary-grid">
          <div className="exec-kpi-card highlight-kpi">
            <span className="kpi-tag">ESTIMATED INVESTMENT</span>
            <strong className="kpi-large-num">₹{Math.round(systemCostEstimate).toLocaleString('en-IN')}</strong>
            <span className="kpi-caption">
              Gross investment ({state_subsidy_percent > 0 ? `${state_subsidy_percent}% state subsidy eligible` : 'Subsidies applicable'})
            </span>
          </div>

          <div className="exec-kpi-card">
            <span className="kpi-tag">PAYBACK TIMELINE</span>
            <strong className="kpi-large-num">{Number(payback_period_years).toFixed(1)} Years</strong>
            <span className="kpi-caption">Break-even achieved {breakEvenLabel}</span>
          </div>

          <div className="exec-kpi-card green-kpi">
            <span className="kpi-tag">ANNUAL WEALTH IMPACT</span>
            <strong className="kpi-large-num">₹{Number(annual_savings).toLocaleString('en-IN')}/yr</strong>
            <span className="kpi-caption">Direct reduction in grid utility expenses</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. 10-METRIC EDITORIAL KPI GRID                          */}
      {/* ======================================================== */}
      <section className="dashboard-metrics-section">
        <div className="section-head-mini">
          <h3 className="section-mini-title">System Metrics & Financial Return</h3>
          <p className="section-mini-desc">Complete financial and environmental assessment summary.</p>
        </div>

        <div className="metrics-cards-grid">
          <div className="metric-card energy-metric">
            <div className="metric-card-top">
              <span className="metric-label">Estimated Generation</span>
              <Sun size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{animatedUnits} <span className="metric-unit">kWh/mo</span></strong>
            <span className="metric-foot">Clean rooftop power yield</span>
          </div>

          <div className="metric-card energy-metric">
            <div className="metric-card-top">
              <span className="metric-label">System Sizing</span>
              <Cpu size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{animatedCapacity} <span className="metric-unit">kW</span></strong>
            <span className="metric-foot">Optimized for rooftop profile</span>
          </div>

          <div className="metric-card energy-metric">
            <div className="metric-card-top">
              <span className="metric-label">Panels Required</span>
              <Layers size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{number_of_panels} <span className="metric-unit">Panels</span></strong>
            <span className="metric-foot">~400W Monocrystalline PERC</span>
          </div>

          <div className="metric-card energy-metric">
            <div className="metric-card-top">
              <span className="metric-label">Roof Area Required</span>
              <Maximize2 size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{animatedArea} <span className="metric-unit">sq ft</span></strong>
            <span className="metric-foot">Usable shadow-free space</span>
          </div>

          <div className="metric-card financial-metric">
            <div className="metric-card-top">
              <span className="metric-label">Monthly Savings</span>
              <TrendingUp size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">₹{animatedMonthlySavings}</strong>
            <span className="metric-foot">Average monthly tariff drop</span>
          </div>

          <div className="metric-card financial-metric">
            <div className="metric-card-top">
              <span className="metric-label">Annual Savings</span>
              <IndianRupee size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">₹{Number(animatedAnnualSavings).toLocaleString('en-IN')}</strong>
            <span className="metric-foot">Direct yearly wallet savings</span>
          </div>

          <div className="metric-card financial-metric highlight">
            <div className="metric-card-top">
              <span className="metric-label">25-Year Savings</span>
              <Award size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">₹{Number(animatedLifetimeSavings).toLocaleString('en-IN')}</strong>
            <span className="metric-foot">Cumulative asset value</span>
          </div>

          <div className="metric-card financial-metric">
            <div className="metric-card-top">
              <span className="metric-label">Payback Horizon</span>
              <Clock size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{animatedPayback} <span className="metric-unit">Years</span></strong>
            <span className="metric-foot">100% investment recouped</span>
          </div>

          <div className="metric-card financial-metric">
            <div className="metric-card-top">
              <span className="metric-label">25-Year Net ROI</span>
              <TrendingUp size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{animatedROI}%</strong>
            <span className="metric-foot">Outperforms traditional funds</span>
          </div>

          <div className="metric-card environmental-metric">
            <div className="metric-card-top">
              <span className="metric-label">CO₂ Offset / Year</span>
              <Leaf size={17} className="metric-icon" />
            </div>
            <strong className="metric-value">{animatedCO2} <span className="metric-unit">kg</span></strong>
            <span className="metric-foot">≈ {treeEquivalent} trees absorbing CO₂</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. ROOF LAYOUT & PAYBACK TIMELINE SECTION                */}
      {/* ======================================================== */}
      <section className="dashboard-visuals-dual-grid">
        {/* Rooftop Solar Layout */}
        <div className="solis-card visual-card">
          <div className="visual-card-head">
            <div>
              <h3>Rooftop Panel Layout</h3>
              <p>{`Illustrative schematic showing ${actualPanelCount} photovoltaic panels (~${panelWattage}W each) optimized for your roof.`}</p>
            </div>
            <div className="visual-head-stat">
              <span className="stat-highlight">{`${actualPanelCount} Panels`}</span>
              <span>{userRoofArea > 0 ? `${userRoofArea.toLocaleString('en-IN')} sq ft available` : `${Math.round(requiredArrayArea).toLocaleString('en-IN')} sq ft array`}</span>
            </div>
          </div>

          <div className="roof-visual-container">
            <div className="roof-panels-grid">
              {panelsArray.map((panel) => (
                <div
                  key={panel.id}
                  className="roof-solar-panel-card"
                  title={`Solar Panel #${panel.id} • ${panelWattage}W Monocrystalline PERC`}
                >
                  <span className="panel-grid-texture" />
                  <span className="panel-spec-chip">{`#${panel.id}`}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="roof-caption-bar">
            <div className="roof-stat-item">
              <span className="stat-dot panel-dot" />
              <span><strong>{actualPanelCount}</strong>{` panels (~${panelWattage}W each)`}</span>
            </div>
            {remainingRoofArea !== null ? (
              <div className="roof-stat-item">
                <span className="stat-dot avail-dot" />
                <span><strong>{`${remainingRoofArea.toLocaleString('en-IN')} sq ft`}</strong> available</span>
              </div>
            ) : (
              <div className="roof-stat-item">
                <span className="stat-dot avail-dot" />
                <span><strong>{`${Math.round(requiredArrayArea).toLocaleString('en-IN')} sq ft`}</strong> array</span>
              </div>
            )}
            {roofCoveragePercent !== null && (
              <div className="roof-stat-item">
                <span className="stat-dot coverage-dot" />
                <span><strong>{`${roofCoveragePercent}%`}</strong> roof coverage</span>
              </div>
            )}
          </div>
        </div>

        {/* Payback Progress & Environmental Tree Equiv */}
        <div className="solis-card visual-card">
          <div className="visual-card-head">
            <div>
              <h3>Capital Recovery Timeline</h3>
              <p>Break-even progression modeled against local tariff inflation.</p>
            </div>
            <span className="payback-badge">{Number(payback_period_years).toFixed(1)} Yrs Break-even</span>
          </div>

          <div className="payback-timeline-box">
            <div className="timeline-bar-track">
              <div
                className="timeline-bar-fill"
                style={{ width: `${paybackProgress}%` }}
              />
            </div>
            <div className="timeline-labels-row">
              <span>Year 0 (Install)</span>
              <span>Year {Math.ceil(payback_period_years)} (Break-even)</span>
              <span>Year 25 (Pure Profit)</span>
            </div>
          </div>

          {/* Environmental Tree Offset Box */}
          <div className="tree-offset-banner">
            <div className="tree-offset-icon">
              <Leaf size={28} />
            </div>
            <div className="tree-offset-text">
              <h4>Equivalent to Planting {treeEquivalent} Trees Yearly</h4>
              <p>
                Your rooftop installation prevents {Number(carbon.co2_saved_kg || 0).toLocaleString('en-IN')} kg of greenhouse gases from entering the atmosphere every single year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. CHARTS & REVIEWS SECTION                              */}
      {/* ======================================================== */}
      <section className="dashboard-charts-grid">
        {/* Monthly Savings Bar Chart */}
        <div className="solis-card chart-glass-card">
          <div className="chart-head">
            <h3>Monthly Financial Savings Projection</h3>
            <p>Anticipated power bill savings across all 12 calendar months.</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySavingsData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0d1322',
                    border: '1px solid rgba(255,140,50,0.3)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Monthly Savings']}
                />
                <Bar dataKey="savings" fill="#ff7a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 25-Year Cumulative Wealth Curve */}
        <div className="solis-card chart-glass-card">
          <div className="chart-head">
            <h3>25-Year Cumulative Wealth Accumulation</h3>
            <p>Net financial savings after accounting for initial capital expenditure.</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlySavings}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0d1322',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Net Wealth Gain']}
                />
                <Line
                  type="monotone"
                  dataKey="netSavings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Before vs After Energy Costs */}
        <div className="solis-card chart-glass-card">
          <div className="chart-head">
            <h3>Utility Expense: Before vs. After Solar</h3>
            <p>Contrasting grid tariff expenditure against optimized solar rooftop bills.</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beforeAfterData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0d1322',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                  }}
                  formatter={(val, name) => [`₹${val}`, name === 'withoutSolar' ? 'Without Solar' : 'With SolisIQ']}
                />
                <Legend />
                <Bar dataKey="withoutSolar" fill="#475569" name="Without Solar" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withSolar" fill="#10b981" name="With SolisIQ" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Output Variation */}
        <div className="solis-card chart-glass-card">
          <div className="chart-head">
            <h3>Seasonal Solar Generation Curve</h3>
            <p>Historical Open-Meteo monthly solar radiation output variance.</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {seasonalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1322',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                    }}
                    formatter={(val) => [`${val} kWh/day`, 'Predicted Output']}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-no-data">
                <p>Seasonal radiation telemetry will update with live location data.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. METHODOLOGY & MATHEMATICAL ACCORDION                   */}
      {/* ======================================================== */}
      <section className="dashboard-accordion-section">
        <div className="solis-card accordion-card">
          <button
            type="button"
            className="accordion-toggle-btn"
            onClick={() => setShowCalculationDetails((prev) => !prev)}
            aria-expanded={showCalculationDetails}
          >
            <div className="accordion-title-wrap">
              <Cpu size={18} className="text-solar" />
              <span>How SolisIQ Calculates Your Financial & Energy Models</span>
            </div>
            {showCalculationDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showCalculationDetails && (
            <div className="accordion-content-panel">
              <div className="accordion-grid">
                <div className="accordion-item">
                  <h4>1. Solar Irradiance Forecasting</h4>
                  <p>
                    We ingest coordinates from Open-Meteo geocoding to retrieve shortwave solar radiation (W/m²), ambient temperature, cloud cover, and relative humidity. Our trained Random Forest ensemble predicts net daily kWh generation.
                  </p>
                </div>
                <div className="accordion-item">
                  <h4>2. System Sizing & Roof Constraints</h4>
                  <p>
                    Calculates required capacity as (Monthly Units / 30) / 4.0 kWh/kW/day, and ensures the system safely fits within available roof area assuming 10 m² (107.6 sq ft) per kW of modern 400W panels.
                  </p>
                </div>
                <div className="accordion-item">
                  <h4>3. Financial Payback & Wealth Yield</h4>
                  <p>
                    Payback period is calculated against initial capital cost (₹60,000 / kW benchmark) minus applicable central & state subsidies (up to 40%), amortized against 25 years of guaranteed generation.
                  </p>
                </div>
                <div className="accordion-item">
                  <h4>4. Carbon & Tree Offsets</h4>
                  <p>
                    Computed using standard Central Electricity Authority (CEA) grid emission factors of 0.82 kg CO₂ per kWh avoided, and 21 kg CO₂ per mature tree annual absorption.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
