import { 
  ApiResponse, 
  User, 
  Product, 
  Plan, 
  Subscription, 
  Invoice, 
  Payment, 
  Tax, 
  Discount, 
  KPIStats,
  Quotation
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data as ApiResponse<T>;
}

export const api = {
  // ─── Auth ──────────────────────────────────────────────────
  auth: {
    login: (credentials: any) => 
      request<{ user: User, token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    signup: (data: any) => 
      request<{ user: User, token: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => 
      request<null>('/auth/logout', { method: 'POST' }),
    me: () => 
      request<User>('/auth/me'),
    refresh: () => 
      request<{ token: string }>('/auth/refresh', { method: 'POST' }),
  },
  
  // ─── Users ─────────────────────────────────────────────────
  users: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<User[]>(`/users${q}`);
    },
    getById: (id: string) => request<User>(`/users/${id}`),
    update: (id: string, data: any) => 
      request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    toggleStatus: (id: string) => 
      request<User>(`/users/${id}/toggle-status`, { method: 'POST' }),
  },

  // ─── Products ──────────────────────────────────────────────
  products: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Product[]>(`/products${q}`);
    },
    getById: (id: string) => request<Product>(`/products/${id}`),
    create: (data: any) => 
      request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => 
      request<null>(`/products/${id}`, { method: 'DELETE' }),
  },

  // ─── Plans ─────────────────────────────────────────────────
  plans: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Plan[]>(`/plans${q}`);
    },
    getById: (id: string) => request<Plan>(`/plans/${id}`),
    create: (data: any) => 
      request<Plan>('/plans', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      request<Plan>(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => 
      request<null>(`/plans/${id}`, { method: 'DELETE' }),
  },

  // ─── Subscriptions ─────────────────────────────────────────
  subscriptions: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Subscription[]>(`/subscriptions${q}`);
    },
    getById: (id: string) => request<Subscription>(`/subscriptions/${id}`),
    create: (data: any) => 
      request<Subscription>('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      request<Subscription>(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    confirm: (id: string) => 
      request<Subscription>(`/subscriptions/${id}/confirm`, { method: 'POST' }),
    activate: (id: string) => 
      request<Subscription>(`/subscriptions/${id}/activate`, { method: 'POST' }),
    cancel: (id: string, reason: string) => 
      request<Subscription>(`/subscriptions/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
    pause: (id: string) => 
      request<Subscription>(`/subscriptions/${id}/pause`, { method: 'POST' }),
    resume: (id: string) => 
      request<Subscription>(`/subscriptions/${id}/resume`, { method: 'POST' }),
  },

  // ─── Quotations ────────────────────────────────────────────
  quotations: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Quotation[]>(`/quotations${q}`);
    },
    getById: (id: string) => request<Quotation>(`/quotations/${id}`),
    create: (data: any) => 
      request<Quotation>('/quotations', { method: 'POST', body: JSON.stringify(data) }),
    send: (id: string) => 
      request<Quotation>(`/quotations/${id}/send`, { method: 'POST' }),
  },

  // ─── Invoices ──────────────────────────────────────────────
  invoices: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Invoice[]>(`/invoices${q}`);
    },
    getById: (id: string) => request<Invoice>(`/invoices/${id}`),
    confirm: (id: string) => 
      request<Invoice>(`/invoices/${id}/confirm`, { method: 'POST' }),
    send: (id: string) => 
      request<Invoice>(`/invoices/${id}/send`, { method: 'POST' }),
    cancel: (id: string) => 
      request<Invoice>(`/invoices/${id}/cancel`, { method: 'POST' }),
    downloadPdf: async (id: string) => {
      const url = `${API_BASE_URL}/invoices/${id}/download`;
      return fetch(url);
    },
  },

  // ─── Payments ──────────────────────────────────────────────
  payments: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Payment[]>(`/payments${q}`);
    },
    getById: (id: string) => request<Payment>(`/payments/${id}`),
    record: (data: any) => 
      request<Payment>('/payments', { method: 'POST', body: JSON.stringify(data) }),
    refund: (id: string) => 
      request<Payment>(`/payments/${id}/refund`, { method: 'POST' }),
  },

  // ─── Discounts ─────────────────────────────────────────────
  discounts: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Discount[]>(`/discounts${q}`);
    },
    getById: (id: string) => request<Discount>(`/discounts/${id}`),
    create: (data: any) => 
      request<Discount>('/discounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      request<Discount>(`/discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggle: (id: string) => 
      request<Discount>(`/discounts/${id}/toggle`, { method: 'POST' }),
    delete: (id: string) => 
      request<null>(`/discounts/${id}`, { method: 'DELETE' }),
  },

  // ─── Taxes ─────────────────────────────────────────────────
  taxes: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Tax[]>(`/taxes${q}`);
    },
    create: (data: any) => 
      request<Tax>('/taxes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      request<Tax>(`/taxes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => 
      request<null>(`/taxes/${id}`, { method: 'DELETE' }),
  },

  // ─── Reports ───────────────────────────────────────────────
  reports: {
    getDashboardStats: () => request<KPIStats>('/reports/dashboard-stats'),
    getRevenueReport: (params: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/revenue${q}`);
    },
    getSubscriptionReport: (params: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/subscriptions${q}`);
    },
  }
};


