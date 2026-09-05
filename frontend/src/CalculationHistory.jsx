import React, { useState } from 'react';
import { downloadPdfReport } from './reportDownload';
import {
  History,
  Download,
  Trash2,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';

function CalculationHistory({ history, loading, error, onDelete }) {
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
    <div className="solis-card history-panel-card">
      <div className="history-head">
        <div className="history-head-title">
          <History size={20} className="text-solar" />
          <div>
            <h3>Your Saved Calculations</h3>
            <p>Historical rooftop assessments generated under your account.</p>
          </div>
        </div>
        <span className="history-count-badge">
          {history.length} {history.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {loading && (
        <div className="history-loading-box">
          <span className="solis-spinner" />
          <p>Retrieving calculation records...</p>
        </div>
      )}

      {error && (
        <div className="solis-form-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {downloadError && (
        <div className="solis-form-error">
          <AlertCircle size={16} />
          <span>{downloadError}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="history-table-responsive">
          {history.length === 0 ? (
            <div className="history-empty-view">
              <p>No saved calculations found. Complete a rooftop assessment above to save it to your profile.</p>
            </div>
          ) : (
            <table className="solis-glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Monthly Bill</th>
                  <th>Estimated Savings</th>
                  <th>Payback</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="history-date-cell">
                        <Calendar size={14} className="cell-icon" />
                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="history-loc-cell">
                        <MapPin size={14} className="cell-icon" />
                        <strong>{item.city || 'Unknown'}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="cell-bill">₹{Number(item.monthly_bill || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      <span className="cell-savings">₹{Number(item.monthly_savings || 0).toLocaleString('en-IN')}/mo</span>
                    </td>
                    <td>
                      <span className="cell-payback">{Number(item.payback_period || 0).toFixed(1)} Yrs</span>
                    </td>
                    <td className="text-right">
                      <div className="history-action-btns">
                        <button
                          type="button"
                          className="action-btn report-btn"
                          onClick={() => handleDownloadReport(item)}
                          disabled={downloadingId === item.id}
                          title="Download PDF Report"
                        >
                          <Download size={14} />
                          <span>{downloadingId === item.id ? 'Exporting...' : 'PDF'}</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => onDelete(item.id)}
                          title="Delete record"
                        >
                          <Trash2 size={14} />
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
