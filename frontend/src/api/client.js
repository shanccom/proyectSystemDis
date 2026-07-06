const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_GATEWAY}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || `Request failed (${res.status})`, res.status);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export { request, ApiError };
export default request;
