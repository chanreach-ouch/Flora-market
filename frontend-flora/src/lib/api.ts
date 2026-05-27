export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  // Caller-provided headers always take priority over defaults.
  // If the caller sets Content-Type themselves (e.g. form-urlencoded), we must NOT
  // override it with application/json.
  const callerHeaders = (options.headers as Record<string, string>) || {};
  const isFormEncoded = callerHeaders['Content-Type'] === 'application/x-www-form-urlencoded';

  const headers: Record<string, string> = {
    // Only set the JSON default if the caller hasn't specified a Content-Type
    ...(!isFormEncoded && !callerHeaders['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
    ...callerHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network-level failure (backend not reachable, CORS preflight failed, etc.)
    throw new Error(
      'Cannot connect to the server. Please make sure the backend is running on port 8000.'
    );
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
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
