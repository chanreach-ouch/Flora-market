import type { MockPlant, MockSeller, MockReview, MockOrder } from './data';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Core fetch helper ─────────────────────────────────────────────────────────

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const callerHeaders = (options.headers as Record<string, string>) || {};
  const isFormEncoded = callerHeaders['Content-Type'] === 'application/x-www-form-urlencoded';

  const headers: Record<string, string> = {
    ...(!isFormEncoded && !callerHeaders['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
    ...callerHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Cannot connect to the server. Please make sure the backend is running on port 8000.');
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ── Backend response types (snake_case) ───────────────────────────────────────

export interface ApiPlant {
  id: string;
  seller_id: string;
  name_en: string;
  name_kh: string | null;
  category: string;
  price: number;
  stock: number;
  tagline: string | null;
  tagline_kh: string | null;
  images: string[];
  pros: string[];
  pros_kh: string[];
  cons: string[];
  cons_kh: string[];
  water_freq: string | null;
  water_freq_kh: string | null;
  light_req: string | null;
  light_req_kh: string | null;
  temp_range: string | null;
  difficulty: string | null;
  difficulty_kh: string | null;
  total_sold: number;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ApiSeller {
  id: string;
  user_id: string;
  nursery_name: string;
  nursery_name_kh: string | null;
  description: string | null;
  description_kh: string | null;
  location: string | null;
  district: string | null;
  city: string | null;
  cover_photo: string | null;
  avatar: string | null;
  is_verified: boolean;
  rating: number;
  total_orders: number;
  total_plants: number;
  year_joined: number | null;
  specialties: string[] | null;
  specialties_kh: string[] | null;
  created_at: string;
}

export interface ApiReview {
  id: string;
  buyer_id: string;
  seller_id: string;
  plant_id: string;
  rating: number;
  comment: string | null;
  comment_kh: string | null;
  created_at: string;
}

export interface ApiOrderItem {
  id: string;
  plant_id: string;
  quantity: number;
  unit_price: number;
}

export interface ApiOrder {
  id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  items: ApiOrderItem[];
  created_at: string;
}

// ── Mappers: backend snake_case → frontend camelCase ──────────────────────────

export function mapPlant(p: ApiPlant): MockPlant {
  return {
    id: p.id,
    sellerId: p.seller_id,
    nameEn: p.name_en,
    nameKh: p.name_kh || p.name_en,
    category: p.category,
    price: p.price,
    stock: p.stock,
    tagline: p.tagline || '',
    taglineKh: p.tagline_kh || p.tagline || '',
    images: p.images || [],
    pros: p.pros || [],
    prosKh: p.pros_kh || [],
    cons: p.cons || [],
    consKh: p.cons_kh || [],
    waterFreq: p.water_freq || '',
    waterFreqKh: p.water_freq_kh || p.water_freq || '',
    lightReq: p.light_req || '',
    lightReqKh: p.light_req_kh || p.light_req || '',
    tempRange: p.temp_range || '',
    difficulty: p.difficulty || '',
    difficultyKh: p.difficulty_kh || p.difficulty || '',
    totalSold: p.total_sold,
    rating: p.rating,
    reviewCount: p.review_count,
    isNew: p.is_new,
    isActive: p.is_active,
  };
}

export function mapSeller(s: ApiSeller): MockSeller {
  return {
    id: s.id,
    nurseryName: s.nursery_name,
    nurseryNameKh: s.nursery_name_kh || s.nursery_name,
    description: s.description || '',
    descriptionKh: s.description_kh || s.description || '',
    location: s.location || '',
    district: s.district || '',
    city: s.city || '',
    coverPhoto: s.cover_photo || '',
    avatar: s.avatar || '',
    isVerified: s.is_verified,
    rating: s.rating,
    totalOrders: s.total_orders,
    totalPlants: s.total_plants,
    yearJoined: s.year_joined || new Date(s.created_at).getFullYear(),
    specialties: s.specialties || [],
    specialtiesKh: s.specialties_kh || [],
  };
}

export function mapReview(r: ApiReview): MockReview {
  return {
    id: r.id,
    buyerId: r.buyer_id,
    buyerName: 'Customer',
    buyerAvatar: '',
    sellerId: r.seller_id,
    plantId: r.plant_id,
    plantNameKh: '',
    plantNameEn: '',
    rating: r.rating,
    comment: r.comment || '',
    commentKh: r.comment_kh || '',
    date: r.created_at.slice(0, 10),
  };
}

export function mapOrder(o: ApiOrder): MockOrder {
  const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
  return {
    id: o.id,
    buyerName: 'Customer',
    plantNameEn: o.items.length === 1 ? `Item (${o.items[0].plant_id.slice(0, 6)})` : `${o.items.length} items`,
    plantNameKh: o.items.length === 1 ? `ទំនិញ` : `${o.items.length} ទំនិញ`,
    quantity: itemCount,
    total: o.total_amount,
    status: o.status as 'pending' | 'preparing' | 'completed',
    timestamp: o.created_at.replace('T', ' ').slice(0, 16),
    sellerId: o.seller_id,
  };
}

// ── Typed API functions ───────────────────────────────────────────────────────

// Plants
export async function apiFetchPlants(category?: string): Promise<MockPlant[]> {
  const params = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  const data: ApiPlant[] = await fetchApi(`/plants/${params}`);
  return data.map(mapPlant);
}

export async function apiFetchPlantById(id: string): Promise<MockPlant> {
  const data: ApiPlant = await fetchApi(`/plants/${id}`);
  return mapPlant(data);
}

export async function apiFetchPlantsBySeller(sellerId: string): Promise<MockPlant[]> {
  const data: ApiPlant[] = await fetchApi(`/plants/seller/${sellerId}`);
  return data.map(mapPlant);
}

export async function apiUpdatePlant(id: string, payload: Record<string, unknown>): Promise<MockPlant> {
  const data: ApiPlant = await fetchApi(`/plants/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  return mapPlant(data);
}

export async function apiDeletePlant(id: string): Promise<void> {
  await fetchApi(`/plants/${id}`, { method: 'DELETE' });
}

export async function apiTogglePlant(id: string): Promise<MockPlant> {
  const data: ApiPlant = await fetchApi(`/plants/${id}/toggle`, { method: 'PATCH' });
  return mapPlant(data);
}

export async function apiCreatePlant(payload: {
  name_en: string;
  name_kh?: string;
  category: string;
  price: number;
  stock: number;
  difficulty?: string;
}): Promise<MockPlant> {
  const data: ApiPlant = await fetchApi('/plants/', { method: 'POST', body: JSON.stringify(payload) });
  return mapPlant(data);
}

// Sellers
export async function apiFetchSellers(): Promise<MockSeller[]> {
  const data: ApiSeller[] = await fetchApi('/sellers/');
  return data.map(mapSeller);
}

export async function apiFetchSellerById(id: string): Promise<MockSeller> {
  const data: ApiSeller = await fetchApi(`/sellers/${id}`);
  return mapSeller(data);
}

export async function apiFetchMySeller(): Promise<MockSeller> {
  const data: ApiSeller = await fetchApi('/sellers/me');
  return mapSeller(data);
}

// Reviews
export async function apiFetchReviewsByPlant(plantId: string): Promise<MockReview[]> {
  const data: ApiReview[] = await fetchApi(`/reviews/plant/${plantId}`);
  return data.map(mapReview);
}

export async function apiFetchReviewsBySeller(sellerId: string): Promise<MockReview[]> {
  const data: ApiReview[] = await fetchApi(`/reviews/seller/${sellerId}`);
  return data.map(mapReview);
}

export async function apiPostReview(payload: {
  plant_id: string;
  seller_id: string;
  rating: number;
  comment: string;
}): Promise<MockReview> {
  const data: ApiReview = await fetchApi('/reviews/', { method: 'POST', body: JSON.stringify(payload) });
  return mapReview(data);
}

// Orders
export async function apiPlaceOrders(
  groups: { sellerId: string; items: { plant_id: string; quantity: number }[] }[]
): Promise<ApiOrder[]> {
  return Promise.all(
    groups.map(g =>
      fetchApi('/orders/', {
        method: 'POST',
        body: JSON.stringify({ seller_id: g.sellerId, items: g.items }),
      })
    )
  );
}

export async function apiFetchMyOrders(): Promise<ApiOrder[]> {
  return fetchApi('/orders/me');
}

export async function apiFetchSellerOrders(): Promise<MockOrder[]> {
  const data: ApiOrder[] = await fetchApi('/orders/seller');
  return data.map(mapOrder);
}

export async function apiUpdateOrderStatus(orderId: string, status: string): Promise<void> {
  await fetchApi(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiFetchAllOrders(): Promise<MockOrder[]> {
  const data: ApiOrder[] = await fetchApi('/orders/');
  return data.map(mapOrder);
}

export interface ApiStats {
  total_users: number;
  active_sellers: number;
  total_plants: number;
  total_orders: number;
  total_revenue: number;
  total_commission: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
}

export async function apiFetchStats(): Promise<ApiStats> {
  return fetchApi('/stats/');
}
