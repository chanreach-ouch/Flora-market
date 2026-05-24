export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch {
      // Ignore JSON parsing error
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
