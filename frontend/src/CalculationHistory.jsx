import React, { useState } from 'react';
import { downloadPdfReport } from './reportDownload';
import {
  Download,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

function CalculationHistory({ history, loading, error, onDelete, onStartNew }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState('');

  const handleDownloadReport = async (item) => {
    const predictedOutput = Number(item.predicted_output || 0);
    const co2SavedKg = predictedOutput * 0.82;

    setDownloadingId(item.id);
    setDownloadError('');

    try {
      await downloadPdfReport({
        city: item.city || 'Your Location',
        monthlyBill: Number(item.monthly_bill || 0),
        predictedOutput,
        monthlySavings: Number(item.monthly_savings || 0),
        annualSavings: Number(item.monthly_savings || 0) * 12,
        paybackPeriod: Number(item.payback_period || 0),
        co2SavedKg,
        treeEquivalent: co2SavedKg / 21,
      });
    } catch (downloadException) {
      const message = downloadException?.message || 'Could not download this report. Please try again.';
      setDownloadError(message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="editorial-archive-card">
      <div className="archive-header-row">
        <div className="archive-title-group">
          <span className="card-mono-kicker">YOUR SOLAR DECISIONS</span>
          <h3 className="archive-title">Calculation History</h3>
          <p className="archive-desc">Historical rooftop assessments and solar forecasts generated under your profile.</p>
        </div>
        <div className="archive-count-badge">
          <span>{history.length} {history.length === 1 ? 'Decision' : 'Decisions'}</span>
        </div>
      </div>

      {loading && (
        <div className="editorial-loading-box">
          <span className="solis-spinner" />
          <p>Retrieving calculation archive...</p>
        </div>
      )}

      {error && (
        <div className="editorial-form-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {downloadError && (
        <div className="editorial-form-error" role="alert">
          <AlertCircle size={16} />
          <span>{downloadError}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="archive-table-container">
          {history.length === 0 ? (
            <div className="editorial-empty-box">
              <p>No calculations yet.</p>
              <button
                type="button"
                className="solis-ghost-link"
                onClick={() => {
                  if (onStartNew) {
                    onStartNew();
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <span>Run your first solar analysis</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <table className="editorial-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Monthly Bill</th>
                  <th>Daily Forecast</th>
                  <th>Estimated Savings</th>
                  <th>Payback</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="archive-date-cell">
                        <Calendar size={13} className="cell-sub-icon" />
                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="archive-location-cell">
                        <MapPin size={13} className="cell-sub-icon" />
                        <strong>{item.city || 'Property'}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="num-mono">₹{Number(item.monthly_bill || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      <span className="num-mono">{item.predicted_output ? `${Number(item.predicted_output).toFixed(2)} kWh` : '—'}</span>
                    </td>
                    <td>
                      <span className="num-mono text-rose">₹{Number(item.monthly_savings || 0).toLocaleString('en-IN')}/mo</span>
                    </td>
                    <td>
                      <span className="num-mono">{Number(item.payback_period || 0).toFixed(1)} Yrs</span>
                    </td>
                    <td className="text-right">
                      <div className="archive-actions-cell">
                        <button
                          type="button"
                          className="archive-action-btn export"
                          onClick={() => handleDownloadReport(item)}
                          disabled={downloadingId === item.id}
                          title="Export PDF Report"
                        >
                          <Download size={13} />
                          <span>{downloadingId === item.id ? 'Exporting...' : 'PDF'}</span>
                        </button>
                        <button
                          type="button"
                          className="archive-action-btn delete"
                          onClick={() => onDelete(item.id)}
                          title="Remove from history"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default CalculationHistory;
