const API_BASE = '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('freshlink-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth - OTP flow
  sendOtp: (identifier: string, type: 'phone' | 'email') =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ identifier, type }) }),
  verifyOtp: (identifier: string, otp: string, role: string, name?: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ identifier, otp, role, name }) }),
  demoLogin: (email: string, password: string) =>
    request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (identifier: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ identifier }) }),
  resetPassword: (identifier: string, otp: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ identifier, otp, newPassword }) }),

  // Legacy auth (kept for backward compatibility)
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Stock
  getMyStock: () => request('/stock'),
  getAllStock: (params?: string) => request(`/stock/all${params ? `?${params}` : ''}`),
  addStock: (body: any) => request('/stock', { method: 'POST', body: JSON.stringify(body) }),
  updateStock: (id: string, body: any) => request(`/stock/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteStock: (id: string) => request(`/stock/${id}`, { method: 'DELETE' }),
  markSurplus: (id: string, discountPercent?: number) => request(`/stock/${id}/surplus`, { method: 'POST', body: JSON.stringify({ discountPercent }) }),
  getProduceList: () => request('/stock/produce-list'),

  // Orders
  getOrders: (status?: string) => request(`/orders${status ? `?status=${status}` : ''}`),
  createOrder: (body: any) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id: string, status: string) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getOrderStats: () => request('/orders/stats'),
  getOrder: (id: string) => request(`/orders/${id}`),

  // Matching
  findMatches: (body: any) => request('/matching/find', { method: 'POST', body: JSON.stringify(body) }),
  getNearbyVendors: (lat?: number, lng?: number, radius?: number) =>
    request(`/matching/nearby-vendors?lat=${lat || 17.385}&lng=${lng || 78.4867}&radius=${radius || 4}`),

  // Requirements
  getRequirements: () => request('/requirements'),
  createRequirement: (body: any) => request('/requirements', { method: 'POST', body: JSON.stringify(body) }),
  updateRequirement: (id: string, body: any) => request(`/requirements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRequirement: (id: string) => request(`/requirements/${id}`, { method: 'DELETE' }),

  // Surplus
  getSurplus: (vendorId?: string) => request(`/surplus${vendorId ? `?vendorId=${vendorId}` : ''}`),
  getMySurplus: () => request('/surplus/my'),
  requestColdStorage: (body: any) => request('/surplus/cold-storage', { method: 'POST', body: JSON.stringify(body) }),

  // Cold Storage
  getColdStorages: (lat?: number, lng?: number) => request(`/cold-storage?lat=${lat || 17.385}&lng=${lng || 78.4867}`),

  // Profile
  updateProfile: (body: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Produce catalog
  getProduce: (params?: string) => request(`/produce${params ? `?${params}` : ''}`),
};
