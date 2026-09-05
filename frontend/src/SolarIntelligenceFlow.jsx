import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  TrendingUp,
  Cpu,
  Zap,
  ArrowRight,
} from 'lucide-react';

/**
 * SolarIntelligenceFlow
 *
 * Implements the core "FROM ROOFTOP DATA TO SOLAR DECISION" visual workflow
 * on a dark charcoal surface (#4A4A4A) with muted rose (#E2B4BD) and warm blush (#F7D6D0) accents.
 *
 * Stages:
 * 01. ROOFTOP       - Solar Ingestion
 * 02. ML FORECAST   - X kWh / day
 * 03. CLEAN ENERGY  - X% Green Offset
 * 04. SAVINGS       - ₹X / yr
 *
 * Bottom Metrics:
 * - RECOMMENDED SYSTEM (X kW)
 * - PAYBACK PERIOD     (X.X Years)
 * - CO₂ REDUCTION      (X.X Tonnes/yr)
 */
function SolarIntelligenceFlow({
  calculation = null,
  liveValues = null,
  onExplore = null,
  interactive = true,
}) {
  const navigate = useNavigate();

  // Determine active values (from calculation result, live values, or default reference)
  const isLoaded = Boolean(calculation || liveValues);

  // Stage values
  const dailyGen = calculation?.prediction?.predicted_energy_output_kwh
    ?? liveValues?.dailyGeneration
    ?? (isLoaded ? '—' : '4.8');

  const greenOffset = calculation?.roi
    ? '100'
    : liveValues?.greenOffset
    ?? (isLoaded ? '—' : '100');

  const annualSavings = calculation?.roi?.annual_savings
    ?? liveValues?.annualSavings
    ?? (isLoaded ? null : 148140);

  const formattedSavings = annualSavings !== null && annualSavings !== undefined
    ? `₹${Number(annualSavings).toLocaleString('en-IN')}`
    : '—';

  // Bottom metric values
  const systemSize = calculation?.roi?.recommended_capacity_kw
    ?? liveValues?.systemSize
    ?? (isLoaded ? '—' : '14.7');

  const paybackPeriod = calculation?.roi?.payback_period_years
    ?? liveValues?.paybackPeriod
    ?? (isLoaded ? '—' : '5.4');

  const co2Reduction = calculation?.carbon?.co2_saved_kg
    ? (Number(calculation.carbon.co2_saved_kg) / 1000).toFixed(1)
    : liveValues?.co2Tonnes
    ?? (isLoaded ? '—' : '3.2');

  const handleAction = () => {
    if (onExplore) {
      onExplore();
    } else {
      navigate('/calculator');
    }
  };

  return (
    <div className="flow-editorial-panel" role="region" aria-label="Solar Intelligence Flow">
      {/* Workflow Header */}
      <div className="flow-panel-header">
        <div className="flow-title-group">
          <span className="flow-status-pulse" aria-hidden="true" />
          <span className="flow-mono-title">SOLAR INTELLIGENCE FLOW</span>
        </div>
        <div className="flow-meta-pill">
          <span className="flow-meta-dot" aria-hidden="true" />
          <span>AI SOLAR MODEL</span>
        </div>
      </div>

      {/* Workflow Stages Stack */}
      <div className="flow-stages-container">
        {/* STAGE 01: ROOFTOP */}
        <div className="flow-stage-card stage-rooftop">
          <div className="stage-left">
            <span className="stage-number">01.</span>
            <div className="stage-text-group">
              <span className="stage-label">ROOFTOP</span>
              <h4 className="stage-title">Solar Ingestion</h4>
              <span className="stage-desc">Geospatial satellite irradiance & usable roof geometry</span>
            </div>
          </div>
          <div className="stage-icon-box icon-rooftop" aria-hidden="true">
            <Sun size={20} />
          </div>
        </div>

        {/* Connector 1 -> 2 */}
        <div className="flow-connector" aria-hidden="true">
          <div className="connector-line" />
          <div className="connector-dot" />
        </div>

        {/* STAGE 02: ML FORECAST */}
        <div className="flow-stage-card stage-forecast">
          <div className="stage-left">
            <span className="stage-number">02.</span>
            <div className="stage-text-group">
              <span className="stage-label">ML FORECAST</span>
              <h4 className="stage-title">
                {dailyGen !== '—' ? `${dailyGen} kWh / day` : 'Irradiance Forecast'}
              </h4>
              <span className="stage-desc">Random Forest ensemble trained on ambient weather parameters</span>
            </div>
          </div>
          <div className="stage-icon-box icon-forecast" aria-hidden="true">
            <Cpu size={20} />
          </div>
        </div>

        {/* Connector 2 -> 3 */}
        <div className="flow-connector" aria-hidden="true">
          <div className="connector-line" />
          <div className="connector-dot" />
        </div>

        {/* STAGE 03: CLEAN ENERGY */}
        <div className="flow-stage-card stage-energy">
          <div className="stage-left">
            <span className="stage-number">03.</span>
            <div className="stage-text-group">
              <span className="stage-label">CLEAN ENERGY</span>
              <h4 className="stage-title">
                {greenOffset !== '—' ? `${greenOffset}% Green Offset` : 'Clean Energy Potential'}
              </h4>
              <span className="stage-desc">Zero tailpipe emissions and zero transmission line losses</span>
            </div>
          </div>
          <div className="stage-icon-box icon-energy" aria-hidden="true">
            <Zap size={20} />
          </div>
        </div>

        {/* Connector 3 -> 4 */}
        <div className="flow-connector" aria-hidden="true">
          <div className="connector-line" />
          <div className="connector-dot" />
        </div>

        {/* STAGE 04: SAVINGS */}
        <div className="flow-stage-card stage-savings featured-stage">
          <div className="stage-left">
            <span className="stage-number">04.</span>
            <div className="stage-text-group">
              <span className="stage-label">SAVINGS</span>
              <h4 className="stage-title savings-value">
                {formattedSavings !== '—' ? `${formattedSavings} / yr` : 'Tariff Elimination'}
              </h4>
              <span className="stage-desc">Direct reduction in monthly power utility tariff expense</span>
            </div>
          </div>
          <div className="stage-icon-box icon-savings" aria-hidden="true">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Bottom Key Metrics Row */}
      <div className="flow-metrics-footer">
        <div className="flow-metric-block">
          <span className="flow-metric-kicker">RECOMMENDED SYSTEM</span>
          <strong className="flow-metric-val">
            {systemSize} {systemSize !== '—' && <span className="metric-unit">kW</span>}
          </strong>
          <span className="flow-metric-sub">Optimized roof array</span>
        </div>

        <div className="flow-metric-divider" aria-hidden="true" />

        <div className="flow-metric-block">
          <span className="flow-metric-kicker">PAYBACK PERIOD</span>
          <strong className="flow-metric-val">
            {paybackPeriod} {paybackPeriod !== '—' && <span className="metric-unit">Years</span>}
          </strong>
          <span className="flow-metric-sub">Capital recovery</span>
        </div>

        <div className="flow-metric-divider" aria-hidden="true" />

        <div className="flow-metric-block">
          <span className="flow-metric-kicker">CO₂ REDUCTION</span>
          <strong className="flow-metric-val">
            {co2Reduction} {co2Reduction !== '—' && <span className="metric-unit">Tonnes/yr</span>}
          </strong>
          <span className="flow-metric-sub">Atmospheric offset</span>
        </div>
      </div>

      {/* Action Strip */}
      {interactive && (
        <div className="flow-action-strip">
          <button
            type="button"
            className="flow-cta-btn"
            onClick={handleAction}
          >
            <span>Explore Your Solar Potential</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default SolarIntelligenceFlow;
