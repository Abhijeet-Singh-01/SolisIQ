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
  Award,
  AlertCircle,
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

  // Tickers called unconditionally
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
      <div className="dashboard-awaiting-container">
        <div className="awaiting-content-card">
          <div className="awaiting-icon-wrap">
            <Sun size={32} className="text-solar" />
          </div>
          <span className="awaiting-mono-kicker">SYSTEM READY</span>
          <h3 className="awaiting-heading">Awaiting Assessment Parameters</h3>
          <p className="awaiting-subtext">
            Specify your geographic location, monthly bill, and rooftop dimensions in the advisor panel to run the Random Forest machine learning model.
          </p>
          <div className="awaiting-tags-row">
            <span className="awaiting-tag">Open-Meteo Telemetry</span>
            <span className="awaiting-tag">25-Year Payback</span>
            <span className="awaiting-tag">PM Surya Ghar Subsidy</span>
          </div>
        </div>
      </div>
    );
  }

  const systemCostEstimate = Number(system_cost || (Number(recommended_capacity_kw || 0) * 60000));
  const paybackProgress = payback_period_years > 0 ? Math.min(100, Math.max(12, (1 / payback_period_years) * 100)) : 100;
  const breakEvenLabel = payback_period_years > 0 ? `Year ${Math.ceil(payback_period_years)}` : 'Year 1';

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

  const isRoofConstrained = Boolean(roi.is_roof_constrained);
  const requiredCapacityKw = Number(roi.required_capacity_kw || recommended_capacity_kw);
  const maxPhysicalCapacityKw = Number(roi.max_physical_capacity_kw || roi.roof_capacity_kw || recommended_capacity_kw);
  const requiredPanels = Number(roi.required_panels || actualPanelCount);

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
      setCopyMessage('Summary copied to clipboard');
      window.setTimeout(() => setCopyMessage(''), 3000);
    } catch {
      setCopyMessage('Could not copy summary');
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
    <div className="editorial-console-wrapper">
      {/* ======================================================== */}
      {/* 1. REPORT HEADER & TOP-LEVEL ACTIONS                      */}
      {/* ======================================================== */}
      <div className="report-header-banner">
        <div className="report-meta-group">
          <span className="report-mono-kicker">SOLISIQ ENERGY REPORT</span>
          <h2 className="report-main-heading">Comprehensive Rooftop Solar Intelligence</h2>
          <p className="report-location-sub">
            Evaluated for {results.userInput?.city || results.userInput?.location || 'Property'} • {results.userInput?.state || 'India'}
          </p>
        </div>

        <div className="report-actions-row">
          <button
            type="button"
            className="solis-btn solis-btn-secondary console-action-btn"
            onClick={handleCopySummary}
          >
            {copyMessage ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>{copyMessage || 'Share Summary'}</span>
          </button>

          <button
            type="button"
            className="solis-btn solis-btn-primary console-action-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <span className="solis-spinner" />
            ) : (
              <Download size={14} />
            )}
            <span>{downloading ? 'Compiling PDF...' : 'Download Full Report'}</span>
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="editorial-form-error" role="alert">
          <span>{downloadError}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FOUR DOMINANT METRICS                                  */}
      {/* ======================================================== */}
      <section className="dominant-metrics-grid">
        <div className="dominant-metric-cell highlight">
          <span className="cell-kicker">RECOMMENDED SYSTEM SIZE</span>
          <div className="cell-number-row">
            <strong className="dominant-number">{animatedCapacity}</strong>
            <span className="dominant-unit">kW</span>
          </div>
          <span className="cell-caption">
            Optimized for ~{Math.round(animatedUnits)} kWh/month domestic consumption
          </span>
        </div>

        <div className="dominant-metric-cell">
          <span className="cell-kicker">ESTIMATED CAPITAL COST</span>
          <div className="cell-number-row">
            <strong className="dominant-number">₹{Math.round(systemCostEstimate).toLocaleString('en-IN')}</strong>
          </div>
          <span className="cell-caption">
            {state_subsidy_percent > 0 ? `${state_subsidy_percent}% state subsidy eligible` : 'Central & state incentives applicable'}
          </span>
        </div>

        <div className="dominant-metric-cell">
          <span className="cell-kicker">ANNUAL TARIFF SAVINGS</span>
          <div className="cell-number-row">
            <strong className="dominant-number">₹{Number(animatedAnnualSavings).toLocaleString('en-IN')}</strong>
            <span className="dominant-unit">/yr</span>
          </div>
          <span className="cell-caption">
            Direct reduction in monthly power utility tariff expense
          </span>
        </div>

        <div className="dominant-metric-cell">
          <span className="cell-kicker">PAYBACK HORIZON</span>
          <div className="cell-number-row">
            <strong className="dominant-number">{Number(payback_period_years).toFixed(1)}</strong>
            <span className="dominant-unit">Years</span>
          </div>
          <span className="cell-caption">
            Break-even reached around {breakEvenLabel}, pure profit thereafter
          </span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. DYNAMIC ROOFTOP SOLAR PANEL VISUALIZER                */}
      {/* ======================================================== */}
      <section className="console-visualizer-section">
        <div className="visualizer-editorial-card">
          <div className="visualizer-header">
            <div>
              <span className="card-mono-kicker">ROOFTOP ARRAY MODEL</span>
              <h3 className="visualizer-title">Rooftop Panel Layout</h3>
              <p className="visualizer-desc">
                Rooftop layout based on your available roof area and the recommended system size.
                {recommended_capacity_kw > 0 && actualPanelCount > 0 ? ` (${actualPanelCount} panels • ${recommended_capacity_kw} kW system${userRoofArea > 0 ? ` on ~${userRoofArea.toLocaleString('en-IN')} sq ft roof` : ''})` : ''}
              </p>
            </div>
            <div className="visualizer-head-pill">
              <span className="pill-strong">{`${actualPanelCount} Panels`}</span>
              <span className="pill-sub">
                {userRoofArea > 0 ? `${userRoofArea.toLocaleString('en-IN')} sq ft available` : `${Math.round(requiredArrayArea)} sq ft array`}
              </span>
            </div>
          </div>

          {/* Roof Limitation Notice if demand exceeds physical rooftop capacity */}
          {isRoofConstrained && (
            <div className="roof-constraint-banner" role="alert">
              <div className="constraint-badge-row">
                <AlertCircle size={16} className="text-amber" />
                <strong>Your rooftop area limits the recommended system size.</strong>
              </div>
              <p className="constraint-explanation">
                Your electricity demand suggests a <strong>{`${requiredCapacityKw} kW`}</strong> system ({`${requiredPanels} panels`}), but your available rooftop physically limits installation to <strong>{`${maxPhysicalCapacityKw} kW`}</strong> ({`${actualPanelCount} panels`}).
              </p>
              <div className="constraint-metrics-row">
                <div className="constraint-pill">
                  <span className="constraint-label">Estimated requirement:</span>
                  <strong>{`${requiredCapacityKw} kW`}</strong>
                </div>
                <div className="constraint-pill">
                  <span className="constraint-label">Roof capacity:</span>
                  <strong>{`${maxPhysicalCapacityKw} kW`}</strong>
                </div>
                <div className="constraint-pill highlight">
                  <span className="constraint-label">Recommended installation:</span>
                  <strong>{`${recommended_capacity_kw} kW`}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Panel Grid */}
          <div className="rooftop-canvas-container">
            <div className="rooftop-panels-flex-grid">
              {panelsArray.map((panel) => (
                <div
                  key={panel.id}
                  className="rooftop-panel-unit"
                  title={`Photovoltaic Panel #${panel.id} • ${panelWattage}W Monocrystalline PERC`}
                >
                  <div className="panel-cell-lines" />
                  <span className="panel-number-label">#{panel.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rooftop Specs Bar */}
          <div className="rooftop-specs-bar">
            <div className="spec-metric-item">
              <span className="spec-bullet panel" />
              <span><strong>{actualPanelCount}</strong>{` panels`}</span>
            </div>
            <div className="spec-metric-item">
              <span className="spec-bullet array" />
              <span><strong>{`${Math.round(requiredArrayArea).toLocaleString('en-IN')} sq ft`}</strong>{` array footprint`}</span>
            </div>
            {remainingRoofArea !== null && (
              <div className="spec-metric-item">
                <span className="spec-bullet remaining" />
                <span><strong>{`${remainingRoofArea.toLocaleString('en-IN')} sq ft`}</strong>{` available`}</span>
              </div>
            )}
            {roofCoveragePercent !== null && (
              <div className="spec-metric-item">
                <span className="spec-bullet coverage" />
                <span><strong>{`${roofCoveragePercent}%`}</strong>{` roof coverage`}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SUPPORTING TELEMETRY & ENVIRONMENTAL IMPACT           */}
      {/* ======================================================== */}
      <section className="supporting-metrics-grid">
        <div className="supporting-metric-card">
          <span className="supp-kicker">Estimated Generation</span>
          <strong className="supp-num">{animatedUnits} <span className="supp-unit">kWh/mo</span></strong>
          <span className="supp-foot">Average clean rooftop output</span>
        </div>

        <div className="supporting-metric-card">
          <span className="supp-kicker">MONTHLY BILL SAVINGS</span>
          <strong className="supp-num">₹{animatedMonthlySavings}</strong>
          <span className="supp-foot">Direct utility tariff reduction</span>
        </div>

        <div className="supporting-metric-card">
          <span className="supp-kicker">25-YEAR CUMULATIVE WEALTH</span>
          <strong className="supp-num">₹{Number(animatedLifetimeSavings).toLocaleString('en-IN')}</strong>
          <span className="supp-foot">Net lifetime financial return</span>
        </div>

        <div className="supporting-metric-card">
          <span className="supp-kicker">25-YEAR NET ROI</span>
          <strong className="supp-num">{animatedROI}%</strong>
          <span className="supp-foot">Internal rate of return</span>
        </div>

        <div className="supporting-metric-card green">
          <span className="supp-kicker">CO₂ AVOIDED ANNUALLY</span>
          <strong className="supp-num">{animatedCO2} <span className="supp-unit">kg</span></strong>
          <span className="supp-foot">Zero tailpipe grid emissions</span>
        </div>

        <div className="supporting-metric-card green">
          <span className="supp-kicker">FOREST ABSORPTION EQUIV.</span>
          <strong className="supp-num">{treeEquivalent} <span className="supp-unit">Trees</span></strong>
          <span className="supp-foot">Annual atmospheric carbon offset</span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. CAPITAL RECOVERY TIMELINE                              */}
      {/* ======================================================== */}
      <section className="capital-recovery-banner">
        <div className="recovery-head">
          <div>
            <span className="card-mono-kicker">CAPITAL AMORTIZATION</span>
            <h3 className="recovery-title">Capital Recovery Timeline</h3>
          </div>
          <span className="recovery-badge">{Number(payback_period_years).toFixed(1)} Yrs to Break-even</span>
        </div>

        <div className="recovery-track">
          <div
            className="recovery-fill-bar"
            style={{ width: `${paybackProgress}%` }}
          />
        </div>

        <div className="recovery-milestones">
          <span>Year 0 (Installation)</span>
          <span>Year {Math.ceil(payback_period_years)} (100% Recouped)</span>
          <span>Year 25 (Pure Net Profit)</span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FINANCIAL & SOLAR ANALYTICS CHARTS                    */}
      {/* ======================================================== */}
      <section className="console-charts-grid">
        {/* Monthly Financial Savings Bar Chart */}
        <div className="console-chart-card">
          <div className="chart-header-block">
            <h3>Monthly Financial Savings Projection</h3>
            <p>Anticipated power bill savings across all 12 calendar months.</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySavingsData}>
                <CartesianGrid stroke="rgba(74, 74, 74, 0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#7A7A7A" tick={{ fill: '#5C5C5C', fontSize: 11, fontFamily: 'Inter' }} />
                <YAxis stroke="#7A7A7A" tick={{ fill: '#5C5C5C', fontSize: 11, fontFamily: 'Inter' }} />
                <Tooltip
                  contentStyle={{
                    background: '#4A4A4A',
                    border: '1px solid rgba(226, 180, 189, 0.3)',
                    borderRadius: '8px',
                    color: '#FFF5F5',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Savings']}
                />
                <Bar dataKey="savings" fill="#E2B4BD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 25-Year Cumulative Wealth Curve */}
        <div className="console-chart-card">
          <div className="chart-header-block">
            <h3>25-Year Cumulative Wealth Accumulation</h3>
            <p>Net financial savings after accounting for capital expenditure.</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlySavings}>
                <CartesianGrid stroke="rgba(74, 74, 74, 0.08)" vertical={false} />
                <XAxis dataKey="year" stroke="#7A7A7A" tick={{ fill: '#5C5C5C', fontSize: 11, fontFamily: 'Inter' }} />
                <YAxis stroke="#7A7A7A" tick={{ fill: '#5C5C5C', fontSize: 11, fontFamily: 'Inter' }} />
                <Tooltip
                  contentStyle={{
                    background: '#4A4A4A',
                    border: '1px solid rgba(226, 180, 189, 0.3)',
                    borderRadius: '8px',
                    color: '#FFF5F5',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Net Wealth']}
                />
                <Line
                  type="monotone"
                  dataKey="netSavings"
                  stroke="#4A4A4A"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Before vs After Energy Costs */}
        <div className="console-chart-card">
          <div className="chart-header-block">
            <h3>Utility Expense: Before vs. After Solar</h3>
            <p>Contrasting grid tariff expenditure against optimized solar rooftop bills.</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beforeAfterData}>
                <CartesianGrid stroke="rgba(74, 74, 74, 0.08)" vertical={false} />
                <XAxis dataKey="period" stroke="#7A7A7A" tick={{ fill: '#5C5C5C', fontSize: 11, fontFamily: 'Inter' }} />
                <YAxis stroke="#7A7A7A" tick={{ fill: '#5C5C5C', fontSize: 11, fontFamily: 'Inter' }} />
                <Tooltip
                  contentStyle={{
                    background: '#4A4A4A',
                    border: '1px solid rgba(226, 180, 189, 0.3)',
                    borderRadius: '8px',
                    color: '#FFF5F5',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                  }}
                  formatter={(val, name) => [`₹${val}`, name === 'withoutSolar' ? 'Without Solar' : 'With SolisIQ']}
                />
                <Legend />
                <Bar dataKey="withoutSolar" fill="#7A7A7A" name="Grid Tariff Only" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withSolar" fill="#E2B4BD" name="With SolisIQ" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Output Variation */}
        <div className="console-chart-card">
          <div className="chart-header-block">
            <h3>Seasonal Solar Generation Curve</h3>
            <p>Historical Open-Meteo monthly solar radiation output variance.</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            {seasonalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalData}>
                  <CartesianGrid stroke="rgba(244, 245, 238, 0.06)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(244, 245, 238, 0.4)" tick={{ fill: 'rgba(244, 245, 238, 0.7)', fontSize: 11, fontFamily: 'Inter' }} />
                  <YAxis stroke="rgba(244, 245, 238, 0.4)" tick={{ fill: 'rgba(244, 245, 238, 0.7)', fontSize: 11, fontFamily: 'Inter' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#4A4A4A',
                      border: '1px solid rgba(226, 180, 189, 0.3)',
                      borderRadius: '8px',
                      color: '#FFF5F5',
                      fontSize: '12px',
                      fontFamily: 'Inter',
                    }}
                    formatter={(val) => [`${val} kWh/day`, 'Predicted Radiation Output']}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#E2B4BD"
                    strokeWidth={2.5}
                    dot={{ fill: '#E2B4BD', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <p>Seasonal radiation telemetry will update with live location data.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. METHODOLOGY & MATHEMATICAL ACCORDION                   */}
      {/* ======================================================== */}
      <section className="console-accordion-section">
        <div className="methodology-card">
          <button
            type="button"
            className="accordion-toggle-btn"
            onClick={() => setShowCalculationDetails((prev) => !prev)}
            aria-expanded={showCalculationDetails}
          >
            <div className="accordion-label-wrap">
              <Cpu size={16} className="text-solar" />
              <span>How SolisIQ Calculates Your Financial & Energy Models</span>
            </div>
            {showCalculationDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCalculationDetails && (
            <div className="accordion-body">
              <div className="method-items-grid">
                <div className="method-item">
                  <h4>1. Solar Irradiance Forecasting</h4>
                  <p>
                    We ingest coordinates from Open-Meteo geocoding to retrieve shortwave solar radiation (W/m²), ambient temperature, cloud cover, and relative humidity. Our trained Random Forest ensemble predicts net daily kWh generation.
                  </p>
                </div>
                <div className="method-item">
                  <h4>2. System Sizing & Roof Constraints</h4>
                  <p>
                    Calculates required solar capacity from electricity consumption and caps it by physical rooftop dimensions using a 70% usable roof factor (accounting for setbacks, walkways, maintenance access, and obstructions) with standard 400W monocrystalline modules (~21 sq ft per panel).
                  </p>
                </div>
                <div className="method-item">
                  <h4>3. Financial Payback & Wealth Yield</h4>
                  <p>
                    Payback period is calculated against initial capital cost (₹60,000 / kW benchmark) minus applicable central & state subsidies (up to 40%), amortized against 25 years of guaranteed generation.
                  </p>
                </div>
                <div className="method-item">
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
