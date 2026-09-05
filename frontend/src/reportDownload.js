import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getDownloadErrorMessage = async (error) => {
  if (!error?.response) {
    return error?.message || 'Unable to connect. Please check your network and try again.';
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return 'Your session expired. Please log in again to download the report.';
  }

  if (error.response.status >= 500) {
    return 'Server error while generating the report. Please try again later.';
  }

  if (error.response.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const parsed = JSON.parse(text);
      return parsed.error || parsed.message || 'Could not generate the report.';
    } catch {
      return 'Could not generate the report.';
    }
  }

  return error.response.data?.message || error.response.data?.error || 'Could not generate the report. Please try again.';
};

export async function downloadPdfReport(reportData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/generate-report`,
      reportData,
      { responseType: 'blob' },
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedCity = (reportData.city || 'solar').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `solisiq_report_${sanitizedCity}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const message = await getDownloadErrorMessage(error);
    throw new Error(message);
  }
}
