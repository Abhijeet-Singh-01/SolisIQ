import axios from 'axios';

const getDownloadErrorMessage = (error) => {
  if (!error?.response) {
    return error?.message || 'Unable to connect. Please check your network and try again.';
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return 'Your session expired. Please log in again to download the report.';
  }

  if (error.response.status >= 500) {
    return 'Server error while generating the report. Please try again later.';
  }

  return error.response.data?.message || error.response.data?.error || 'Could not generate the report. Please try again.';
};

export async function downloadPdfReport(reportData) {
  try {
    const response = await axios.post(
      'http://127.0.0.1:5000/generate-report',
      reportData,
      { responseType: 'blob' },
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai_solar_advisor_report.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const message = getDownloadErrorMessage(error);
    throw new Error(message);
  }
}
