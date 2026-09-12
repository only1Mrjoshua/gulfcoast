// Production (Render) — update this to your actual service URL
const RENDER_BACKEND_URL = 'https://backend-lilac-delta-18.vercel.app/api';

// Local development fallback
const LOCAL_BACKEND_URL = 'http://localhost:5000/api';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? LOCAL_BACKEND_URL : RENDER_BACKEND_URL);

export const apiFetch = async (endpoint, options = {}) => {
  const { skipAuth = false, ...fetchOptions } = options;

  const isFormData =
    typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(fetchOptions.headers || {}),
  };

  if (!skipAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Auto-logout on expired/invalid token
  if (response.status === 401 && !skipAuth) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.error || json.message || 'Something went wrong');
  }

  return {
    data: json,
    status: response.status,
    ...json,
  };
};