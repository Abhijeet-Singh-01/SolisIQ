const rawUrl =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:5000';

export const API_BASE_URL = rawUrl.trim().replace(/\/+$/, '');

export default API_BASE_URL;
