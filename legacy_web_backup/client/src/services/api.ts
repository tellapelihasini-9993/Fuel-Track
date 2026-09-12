const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('fueltrack_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('fueltrack_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('fueltrack_token');
  localStorage.removeItem('fueltrack_user');
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: any) => 
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  quickLogin: (role: string) => 
    request('/auth/quick-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => 
    request('/auth/me'),

  // Fuel Rates & Pricing
  getFuelRates: (city?: string) => 
    request(`/fuel-rates${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  calculatePrice: (litres: number, fuelType = 'PETROL', city = 'Mumbai') =>
    request(`/fuel-rates/calculate?litres=${litres}&fuelType=${fuelType}&city=${encodeURIComponent(city)}`),
  updateFuelRate: (id: string, rate_per_litre: number) =>
    request(`/fuel-rates/${id}`, { method: 'PATCH', body: JSON.stringify({ rate_per_litre }) }),

  // Orders
  getOrders: () => 
    request('/orders'),
  getOrder: (id: string) => 
    request(`/orders/${id}`),
  createOrder: (payload: any) => 
    request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  assignTanker: (orderId: string, tanker_id: string) => 
    request(`/orders/${orderId}/assign-tanker`, { method: 'POST', body: JSON.stringify({ tanker_id }) }),
  updateOrderStatus: (orderId: string, status: string, notes?: string) => 
    request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),

  // Tankers & Telematics
  getTankers: () => 
    request('/tankers'),
  getTanker: (id: string) => 
    request(`/tankers/${id}`),
  updateTankerLocation: (id: string, data: any) => 
    request(`/tankers/${id}/location`, { method: 'POST', body: JSON.stringify(data) }),
  sendSafetyAlert: (tankerId: string, payload: any) => 
    request(`/tankers/${tankerId}/safety-alert`, { method: 'POST', body: JSON.stringify(payload) }),
  resolveSafetyAlert: (alertId: string) => 
    request(`/tankers/resolve-alert/${alertId}`, { method: 'POST' }),

  // Depots & Inventory
  getDepots: () => 
    request('/depots'),
  getDepotInventory: (id: string) => 
    request(`/depots/${id}/inventory`),
  refillInventory: (payload: any) => 
    request('/inventory/refill', { method: 'POST', body: JSON.stringify(payload) }),
  triggerDemoAction: (fuel_tank_id: string, action_type: string) => 
    request('/inventory/demo-action', { method: 'POST', body: JSON.stringify({ fuel_tank_id, action_type }) }),

  // Dispensing
  startDispensing: (payload: { order_id: string; tanker_id: string }) => 
    request('/dispensing/start', { method: 'POST', body: JSON.stringify(payload) }),
  tickDispensing: (payload: any) => 
    request('/dispensing/tick', { method: 'POST', body: JSON.stringify(payload) }),
  completeDispensing: (payload: any) => 
    request('/dispensing/complete', { method: 'POST', body: JSON.stringify(payload) }),

  // Payments & Invoices
  mockCheckout: (payload: any) => 
    request('/payments/mock-checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getInvoice: (id: string) => 
    request(`/invoices/${id}`),
  getInvoiceByOrder: (orderId: string) => 
    request(`/invoices/by-order/${orderId}`),

  // Analytics & Audit
  getAnalytics: () => 
    request('/dashboard/analytics'),
  getAuditLogs: (params?: { entity_type?: string; action?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.entity_type) q.append('entity_type', params.entity_type);
    if (params?.action) q.append('action', params.action);
    if (params?.limit) q.append('limit', params.limit.toString());
    return request(`/audit-logs?${q.toString()}`);
  }
};
