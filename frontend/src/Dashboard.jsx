import React, { useState } from 'react';
import { downloadPdfReport } from './reportDownload';
import useCountUp from './useCountUp';
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
} from 'recharts';

function Dashboard({ results }) {
  if (!results) {
    return <p className="dashboard-empty-state">Fill the form to see your solar analysis.</p>;
  }

  const { prediction, roi, carbon } = results;
  const {
    monthly_units_kwh,
    recommended_capacity_kw,
    number_of_panels,
    roof_area_required_sq_ft,
    annual_savings,
    lifetime_savings_25_years,
    roi_percent,
    estimated_monthly_savings,
    payback_period_years,
  } = roi;

  const monthlyComparison = Array.from({ length: 12 }, (_, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    withoutSolar: 1200 + index * 60,
    withSolar: Math.max(700, 1200 + index * 60 - (estimated_monthly_savings || 0) * 0.9),
  }));

  const systemCostEstimate = Number(recommended_capacity_kw || 0) * 60000;
  const paybackProgress = payback_period_years > 0 ? Math.min(100, Math.max(8, (1 / payback_period_years) * 100)) : 100;
  const breakEvenLabel = payback_period_years > 0 ? `around Year ${Math.ceil(payback_period_years)}` : 'within the first year';

  const monthlySavingsData = Array.from({ length: 12 }, (_, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    savings: Number(estimated_monthly_savings) ? Number(estimated_monthly_savings) * (0.95 + index * 0.01) : 0,
  }));

  const yearlySavings = Array.from({ length: 25 }, (_, index) => ({
    year: index + 1,
    savings: Number(annual_savings) ? Number(annual_savings) * (index + 1) : 0,
  }));

  const beforeAfterData = Array.from({ length: 6 }, (_, index) => ({
    period: `Month ${index + 1}`,
    withoutSolar: 1200 + index * 60,
    withSolar: Math.max(700, 1200 + index * 60 - (estimated_monthly_savings || 0) * 0.9),
  }));

  const seasonalData = (results.seasonalBreakdown || []).map((item) => ({
    month: item.month,
    predicted: Number(item.predicted_energy_output_kwh),
  }));

  const [copyMessage, setCopyMessage] = useState('');
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const treeEquivalent = Math.round(carbon.tree_equivalent || 0);

  const animatedEstimatedMonthlySavings = useCountUp(estimated_monthly_savings, { duration: 900, decimals: 0 });
  const animatedAnnualSavings = useCountUp(annual_savings, { duration: 900, decimals: 0 });
  const animatedLifetimeSavings = useCountUp(lifetime_savings_25_years, { duration: 900, decimals: 0 });
  const animatedPayback = useCountUp(payback_period_years, { duration: 900, decimals: 1 });
  const animatedROI = useCountUp(roi_percent, { duration: 900, decimals: 1 });
  const animatedCO2 = useCountUp(carbon.co2_saved_kg, { duration: 900, decimals: 1 });
  const animatedUnits = useCountUp(monthly_units_kwh, { duration: 900, decimals: 1 });
  const animatedCapacity = useCountUp(recommended_capacity_kw, { duration: 900, decimals: 2 });
  const animatedArea = useCountUp(roof_area_required_sq_ft, { duration: 900, decimals: 1 });

  const roofPanelCount = Number(number_of_panels) || 0;
  const roofArea = Number(roof_area_required_sq_ft) || 0;
  const roofCols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(roofPanelCount || 6))));
  const roofRows = Math.ceil(Math.max(roofPanelCount, 1) / roofCols);
  const roofTotalCells = roofCols * roofRows;
  const roofFreeCells = Math.max(0, roofTotalCells - roofPanelCount);
  const roofCoverage = roofTotalCells ? Math.round((roofPanelCount / roofTotalCells) * 100) : 0;
  const roofPanelCells = Array.from({ length: roofTotalCells }, (_, index) => index < roofPanelCount);

  const shareText = `I could save ₹${Number(annual_savings).toFixed(0)}/year with solar using AI Solar Advisor! Check yours at ${window.location.origin}`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyMessage('Summary copied to clipboard!');
      window.setTimeout(() => setCopyMessage(''), 3000);
    } catch (error) {
      setCopyMessage('Could not copy summary.');
    }
  };

  const handleDownload = async () => {
    try {
      await downloadPdfReport({
        city: results.userInput.location,
        rooftopArea: results.userInput.area,
        monthlyBill: Number(results.userInput.bill),
        state: results.userInput.state,
        predictedOutput: Number(prediction.predicted_energy_output_kwh),
        monthlySavings: Number(roi.estimated_monthly_savings),
        annualSavings: Number(roi.annual_savings),
        paybackPeriod: Number(roi.payback_period_years),
        co2SavedKg: Number(carbon.co2_saved_kg),
        treeEquivalent: Number(carbon.tree_equivalent),
      });
    } catch (error) {
      console.error('PDF download failed', error);
    }
  };

  return (
    <div className="dashboard">
      <section className="savings-report-hero">
        <div className="savings-report-header">
          <div>
            <span className="banner-label">Savings Report</span>
            <h2>Comprehensive solar performance overview</h2>
            <p>Review system size, expected savings, payback, and environmental impact in one polished report.</p>
          </div>
          <div className="savings-report-actions">
            <div className="report-pill">
              <span>Recommended system</span>
              <strong>{animatedCapacity} kW</strong>
            </div>
            <button type="button" className="copy-summary-btn report-secondary-btn" onClick={handleCopySummary}>
              Copy summary
            </button>
            <button type="button" className="download-btn report-download-btn" onClick={handleDownload}>
              Download Full Report (PDF)
            </button>
          </div>
        </div>

        <div className="report-summary-grid">
          <div className="report-summary-card report-summary-highlight">
            <span>Estimated investment</span>
            <strong>₹{Math.round(systemCostEstimate).toLocaleString('en-IN')}</strong>
            <p>Based on the recommended system size and current estimate.</p>
          </div>
          <div className="report-summary-card">
            <span>Payback timeline</span>
            <strong>{Number(payback_period_years).toFixed(1)} years</strong>
            <p>Expected break-even {breakEvenLabel}.</p>
          </div>
          <div className="report-summary-card">
            <span>Annual impact</span>
            <strong>₹{Number(annual_savings).toFixed(0)}/year</strong>
            <p>Projected savings from the solar setup.</p>
          </div>
        </div>
        {copyMessage && <p className="copy-message">{copyMessage}</p>}
      </section>

      <section className="report-section">
        <div className="report-section-heading">
          <h3>Savings breakdown</h3>
          <p>Monthly, annual, and lifetime savings are grouped together so the long-term value is easy to compare.</p>
        </div>
        <div className="card-grid report-card-grid">
          <div className="card energy">
            <h3>Estimated Units</h3>
            <p>{animatedUnits} kWh/month</p>
          </div>
          <div className="card energy">
            <h3>Solar Capacity</h3>
            <p>{animatedCapacity} kW</p>
          </div>
          <div className="card energy">
            <h3>Panels Required</h3>
            <p>{number_of_panels}</p>
          </div>
          <div className="card energy">
            <h3>Roof Area Required</h3>
            <p>{animatedArea} sq ft</p>
          </div>
          <div className="card positive">
            <h3>Monthly Savings</h3>
            <p>₹{animatedEstimatedMonthlySavings}</p>
          </div>
          <div className="card positive">
            <h3>Annual Savings</h3>
            <p>₹{animatedAnnualSavings}</p>
          </div>
          <div className="card positive">
            <h3>25-Year Savings</h3>
            <p>₹{animatedLifetimeSavings}</p>
          </div>
          <div className="card neutral">
            <h3>Payback</h3>
            <p>{animatedPayback} years</p>
          </div>
          <div className="card neutral">
            <h3>ROI</h3>
            <p>{animatedROI}%</p>
          </div>
          <div className="card neutral">
            <h3>CO₂ Saved</h3>
            <p>{animatedCO2} kg/year</p>
          </div>
        </div>
      </section>

      <section className="report-section report-section-grid">
        <div className="report-panel">
          <div className="report-panel-header">
            <h3>Payback timeline</h3>
            <p>Projected break-even point based on the current estimate.</p>
          </div>
          <div className="payback-timeline">
            <div className="payback-timeline-bar">
              <div className="payback-timeline-fill" style={{ width: `${paybackProgress}%` }} />
            </div>
            <div className="payback-timeline-labels">
              <span>Start</span>
              <span>{Number(payback_period_years).toFixed(1)} years</span>
            </div>
            <p>Your system is expected to recover its cost in about {Number(payback_period_years).toFixed(1)} years.</p>
          </div>
        </div>

        <div className="env-card report-panel">
          <h3>Environmental impact summary</h3>
          <div className="env-detail">
            <span>CO₂ reduced</span>
            <strong>{Number(carbon.co2_saved_kg).toFixed(1)} kg/year</strong>
          </div>
          <div className="env-detail">
            <span>Trees equivalent</span>
            <strong>{treeEquivalent}</strong>
          </div>
          <p>Based on the existing carbon footprint estimate for your predicted solar output.</p>
        </div>
      </section>

      <section className="report-section">
        <div className="report-section-heading">
          <h3>Performance and seasonal outlook</h3>
          <p>See how your savings and energy output vary over the year.</p>
        </div>

      <div className="roof-visual-card">
        <div className="roof-visual-header">
          <div>
            <h3>Roof layout</h3>
            <p>Illustrative rooftop view showing how {number_of_panels} panels fit inside the estimated roof area.</p>
          </div>
          <div className="roof-visual-stats">
            <span>{roofPanelCount} panels</span>
            <span>{roofArea.toFixed(0)} sq ft roof</span>
          </div>
        </div>
        <div className="roof-visual-shell">
          <div className="roof-visual-grid" style={{ gridTemplateColumns: `repeat(${roofCols}, minmax(0, 1fr))` }}>
            {roofPanelCells.map((filled, index) => (
              <div
                key={index}
                className={`roof-panel ${filled ? 'filled' : 'empty'}`}
              />
            ))}
          </div>
        </div>
        <div className="roof-visual-caption">
          <span>{roofPanelCount} panel spots occupied</span>
          <span>{roofFreeCells} panel spots free</span>
        </div>
        <div className="roof-visual-bar">
          <div className="roof-visual-bar-fill" style={{ width: `${roofCoverage}%` }} />
          <span>{roofCoverage}% roof coverage</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Monthly Savings</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlySavingsData}>
              <CartesianGrid stroke="transparent" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="savings" fill="#00d9a3" name="Monthly Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Yearly Savings (25 years)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={yearlySavings}>
              <CartesianGrid stroke="transparent" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="savings" stroke="#f5a623" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Before vs After</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={beforeAfterData}>
              <CartesianGrid stroke="transparent" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="withoutSolar" fill="#60718a" name="Without Solar" />
              <Bar dataKey="withSolar" fill="#00d9a3" name="With Solar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="env-card">
          <h3>Environmental Impact</h3>
          <div className="env-detail">
            <span>CO₂ reduced</span>
            <strong>{Number(carbon.co2_saved_kg).toFixed(1)} kg/year</strong>
          </div>
          <div className="env-detail">
            <span>Trees equivalent</span>
            <strong>{treeEquivalent}</strong>
          </div>
          <p>Based on the existing carbon footprint endpoint calculation.</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card seasonal-forecast-card">
          <h3>Seasonal output variation</h3>
          <p>Month-by-month predicted energy output based on historical weather averages.</p>
          {seasonalData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={seasonalData}>
                <CartesianGrid stroke="transparent" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="predicted" stroke="#4f8cff" strokeWidth={2} name="kWh/day" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty-state">Seasonal variation will appear after you run the calculator.</p>
          )}
        </div>
      </div>
      </section>

      <div className="calc-details-card">
        <button
          type="button"
          className="calc-details-toggle"
          onClick={() => setShowCalculationDetails((prev) => !prev)}
          aria-expanded={showCalculationDetails}
        >
          {showCalculationDetails ? 'Hide' : 'How we calculate this'}
        </button>
        {showCalculationDetails && (
          <div className="calc-details-content">
            <p><strong>Energy output prediction:</strong> Our model uses historical weather averages and machine learning to estimate how much solar energy your rooftop can produce.</p>
            <p><strong>Savings calculation:</strong> We multiply the predicted energy output by your local electricity tariff to estimate monthly and annual savings.</p>
            <p className="calc-disclaimer">Estimates are based on historical averages; actual results may vary depending on weather, equipment, and usage.</p>
          </div>
        )}
      </div>

      <div className="tree-card">
        <h3>This is equivalent to planting {treeEquivalent} trees per year</h3>
        <p>That is a strong environmental impact for a college project demo.</p>
      </div>

      <p className="dashboard-footer-credit">
        Weather data powered by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>
      </p>
    </div>
  );
}

export default Dashboard;
