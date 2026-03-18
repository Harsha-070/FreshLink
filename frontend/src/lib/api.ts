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
  // Auth - Phone + Password
  login: (phone: string, password: string, role: 'vendor' | 'business') =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password, role }) }),

  register: (body: {
    name: string;
    phone: string;
    password: string;
    role: 'vendor' | 'business';
    email?: string;
    shopName?: string;
    shopAddress?: string;
    shopDescription?: string;
    upiId?: string;
    businessType?: string;
    deliveryAddress?: string;
  }) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  checkPhone: (phone: string, role?: string) =>
    request('/auth/check-phone', { method: 'POST', body: JSON.stringify({ phone, role }) }),

  getMe: () => request('/auth/me'),

  updateProfile: (body: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

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

  // Produce catalog
  getProduce: (params?: string) => request(`/produce${params ? `?${params}` : ''}`),

  // Logistics (Instakart)
  getLogisticsPartners: (lat?: number, lng?: number, vehicleType?: string) =>
    request(`/logistics/partners?lat=${lat || 17.385}&lng=${lng || 78.4867}${vehicleType ? `&vehicleType=${vehicleType}` : ''}`),
  getDeliveryEstimate: (body: { pickupLocation: any; dropLocation: any; weightKg?: number; preferredVehicle?: string }) =>
    request('/logistics/estimate', { method: 'POST', body: JSON.stringify(body) }),
  bookDelivery: (body: any) => request('/logistics/book', { method: 'POST', body: JSON.stringify(body) }),
  trackDelivery: (bookingId: string) => request(`/logistics/track/${bookingId}`),
  getLogisticsPricing: () => request('/logistics/pricing'),

  // Notifications
  getNotifications: (unreadOnly?: boolean, limit?: number) =>
    request(`/notifications?unreadOnly=${unreadOnly || false}${limit ? `&limit=${limit}` : ''}`),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  deleteNotification: (id: string) => request(`/notifications/${id}`, { method: 'DELETE' }),
  getNotificationPreferences: () => request('/notifications/preferences'),

  // Payments
  createPaymentOrder: (orderId: string, amount: number, method?: string) =>
    request('/payments/create-order', { method: 'POST', body: JSON.stringify({ orderId, amount, method }) }),
  verifyUPIPayment: (paymentId: string, upiTransactionId?: string) =>
    request('/payments/verify', { method: 'POST', body: JSON.stringify({ paymentId, upiTransactionId }) }),
  createRazorpayOrder: (orderId: string, amount: number) =>
    request('/payments/razorpay/create', { method: 'POST', body: JSON.stringify({ orderId, amount }) }),
  verifyRazorpayPayment: (body: { paymentId: string; razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string }) =>
    request('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(body) }),
  getPaymentStatus: (orderId: string) => request(`/payments/${orderId}`),
  getPaymentHistory: () => request('/payments'),
  requestRefund: (paymentId: string, reason?: string) =>
    request('/payments/refund', { method: 'POST', body: JSON.stringify({ paymentId, reason }) }),

  // Areas
  getServiceAreas: () => request('/areas'),

  // Health
  getHealth: () => request('/health'),
};
