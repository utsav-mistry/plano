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

// ─── Token Refresh Mutex ──────────────────────────────────────────────
// Prevents multiple parallel requests from each triggering a refresh.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function notifyQueue(newToken: string) {
  refreshQueue.forEach(cb => cb(newToken));
  refreshQueue = [];
}

async function silentRefresh(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',          // sends the httpOnly refreshToken cookie
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Refresh failed');

  const body = await res.json();
  const newToken: string = body?.data?.token;
  if (!newToken) throw new Error('No token in refresh response');

  localStorage.setItem('plano_token', newToken);
  return newToken;
}

// ─── Core Request ─────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('plano_token') : null;

  const buildHeaders = (token: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // ── First attempt ──────────────────────────────────────────────────
  const response = await fetch(url, {
    ...options,
    credentials: 'include',           // send cookies (refresh token) on every request
    headers: buildHeaders(getToken()),
  });

  // 204 No Content
  if (response.status === 204) {
    return { success: true, data: null as any };
  }

  const data = await response.json();

  // ── Token expired → silent refresh + retry ─────────────────────────
  if (response.status === 401 && data?.message === 'Access token expired') {
    try {
      let newToken: string;

      if (isRefreshing) {
        // Another request is already refreshing — wait for it
        newToken = await new Promise<string>(resolve => refreshQueue.push(resolve));
      } else {
        isRefreshing = true;
        newToken = await silentRefresh();
        notifyQueue(newToken);
        isRefreshing = false;
      }

      // Retry the original request with the fresh token
      const retried = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(newToken),
      });

      if (retried.status === 204) return { success: true, data: null as any };
      return retried.json() as Promise<ApiResponse<T>>;

    } catch {
      isRefreshing = false;
      // Refresh failed — clear session and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('plano_token');
        localStorage.removeItem('plano_user');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  // ── Other 401 (invalid token, not expired) ─────────────────────────
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('plano_token');
    localStorage.removeItem('plano_user');
  }

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
    register: (data: any) => 
      request<{ user: User, token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => 
      request<null>('/auth/logout', { method: 'POST' }),
    me: () => 
      request<User>('/auth/me'),
    forgotPassword: (data: any) =>
      request<null>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (token: string, data: any) =>
      request<null>(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(data) }),
    refresh: () => 
      request<{ token: string }>('/auth/refresh-token', { method: 'POST' }),
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
    getRevenueReport: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/revenue${q}`);
    },
    getSubscriptionReport: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/subscriptions${q}`);
    },
  }
};


