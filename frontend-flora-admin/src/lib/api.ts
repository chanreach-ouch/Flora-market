export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.headers) Object.assign(headers, options.headers);

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null;
  return response.json();
}

// Users
export async function getUsers(params?: { role?: string; skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.role) q.set('role', params.role);
  if (params?.skip !== undefined) q.set('skip', String(params.skip));
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  return fetchApi(`/users/?${q}`);
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  return fetchApi(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function deleteUser(userId: string) {
  return fetchApi(`/users/${userId}`, { method: 'DELETE' });
}

// Sellers
export async function getSellers(params?: { skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.skip !== undefined) q.set('skip', String(params.skip));
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  return fetchApi(`/sellers/?${q}`);
}

export async function verifySeller(sellerId: string) {
  return fetchApi(`/sellers/${sellerId}/verify`, { method: 'PATCH' });
}

export async function suspendSeller(sellerId: string) {
  return fetchApi(`/sellers/${sellerId}/suspend`, { method: 'PATCH' });
}

// Orders
export async function getAllOrders(params?: { status?: string; skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.skip !== undefined) q.set('skip', String(params.skip));
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  return fetchApi(`/orders/?${q}`);
}

export async function updateOrderStatus(orderId: string, status: string) {
  return fetchApi(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Plants — include_inactive=true so admin sees all plants, not just active ones
export async function getAllPlants(params?: { category?: string; skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  q.set('include_inactive', 'true');
  if (params?.category) q.set('category', params.category);
  if (params?.skip !== undefined) q.set('skip', String(params.skip));
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  return fetchApi(`/plants/?${q}`);
}

export async function togglePlantStatus(plantId: string) {
  return fetchApi(`/plants/${plantId}/toggle`, { method: 'PATCH' });
}

// Reviews
export async function getReviews(params?: { skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.skip !== undefined) q.set('skip', String(params.skip));
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  return fetchApi(`/reviews/?${q}`);
}

// Platform stats / analytics
export async function getPlatformStats() {
  return fetchApi('/stats/');
}
