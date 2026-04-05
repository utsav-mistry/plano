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

function normalizePlanEntity(plan: any) {
  if (!plan || typeof plan !== 'object') return plan;
  return {
    ...plan,
    id: plan.id || plan._id,
  };
}

function normalizeProductEntity(product: any) {
  if (!product || typeof product !== 'object') return product;
  return {
    ...product,
    id: product.id || product._id,
    plans: Array.isArray(product.plans) ? product.plans.map(normalizePlanEntity) : product.plans,
  };
}

function normalizeProductsPayload(data: any) {
  if (Array.isArray(data)) return data.map(normalizeProductEntity);
  if (data && typeof data === 'object') {
    if (Array.isArray(data.products)) {
      return { ...data, products: data.products.map(normalizeProductEntity) };
    }
    if (data.product && typeof data.product === 'object') {
      return { ...data, product: normalizeProductEntity(data.product) };
    }
    if (data._id || data.id) return normalizeProductEntity(data);
  }
  return data;
}

function normalizePlansPayload(data: any) {
  if (Array.isArray(data)) return data.map(normalizePlanEntity);
  if (data && typeof data === 'object') {
    if (Array.isArray(data.plans)) {
      return { ...data, plans: data.plans.map(normalizePlanEntity) };
    }
    if (data.plan && typeof data.plan === 'object') {
      return { ...data, plan: normalizePlanEntity(data.plan) };
    }
    if (data._id || data.id) return normalizePlanEntity(data);
  }
  return data;
}

// ─── Token Refresh Mutex ──────────────────────────────────────────────
// Prevents multiple parallel requests from each triggering a refresh.
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

function notifyQueue() {
  refreshQueue.forEach(cb => cb());
  refreshQueue = [];
}

async function silentRefresh(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',          // sends the httpOnly refreshToken cookie
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Refresh failed');

  // refreshToken endpoint now sets both accessToken & refreshToken cookies.
  // We no longer need to manually extract or store any token in localStorage.
}

// ─── Core Request ─────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const buildHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  });

  // ── First attempt ──────────────────────────────────────────────────
  const response = await fetch(url, {
    ...options,
    credentials: 'include',           // send both accessToken & refreshToken cookies
    headers: buildHeaders(),
  });

  if (response.status === 204) return { success: true, data: null as any };

  const data = await response.json();

  // ── Token expired → silent refresh + retry ─────────────────────────
  if (response.status === 401 && data?.message === 'Access token expired') {
    try {
      if (isRefreshing) {
        // Wait for current refresh to complete
        await new Promise<void>(resolve => refreshQueue.push(resolve));
      } else {
        isRefreshing = true;
        await silentRefresh();
        notifyQueue();
        isRefreshing = false;
      }

      // Retry original request
      // Browser automatically sends updated cookies received in silentRefresh()
      const retried = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(),
      });

      if (retried.status === 204) return { success: true, data: null as any };
      return retried.json() as Promise<ApiResponse<T>>;

    } catch {
      isRefreshing = false;
      // Refresh failed — clear session and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('plano_user');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  // ── Other 401 (invalid session, not expired) ─────────────────────────
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('plano_user');
    window.location.href = '/login';
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
      request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) =>
      request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    inviteCustomer: (data: { name: string; email: string }) =>
      request<{ user: User }>('/auth/invite-customer', { method: 'POST', body: JSON.stringify(data) }),
    sendVerificationEmail: (data: { email: string }) =>
      request<null>('/auth/send-verification-email', { method: 'POST', body: JSON.stringify(data) }),
    verifyEmail: (data: { token: string }) =>
      request<{ user: User }>('/auth/verify-email', { method: 'POST', body: JSON.stringify(data) }),
    sendOtp: (data: { email: string; purpose?: 'verify_email' | 'login' }) =>
      request<null>('/auth/send-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data: { email: string; otp: string; purpose?: 'verify_email' | 'login' }) =>
      request<{ user: User }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    logout: () =>
      request<null>('/auth/logout', { method: 'POST' }),
    me: () =>
      request<User>('/auth/me'),
    forgotPassword: (data: any) =>
      request<null>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (token: string, data: any) =>
      request<null>(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(data) }),
    refresh: () =>
      request<null>('/auth/refresh-token', { method: 'POST' }),
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
    delete: (id: string) =>
      request<null>(`/users/${id}`, { method: 'DELETE' }),
  },

  // ─── Products ──────────────────────────────────────────────
  products: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Product[] | { products?: Product[] }>(`/products${q}`).then((res) => ({
        ...res,
        data: normalizeProductsPayload(res.data),
      }));
    },
    getById: (id: string) => request<Product | { product?: Product }>(`/products/${id}`).then((res) => ({
      ...res,
      data: normalizeProductsPayload(res.data),
    })),
    create: (data: any) =>
      request<Product | { product?: Product }>('/products', { method: 'POST', body: JSON.stringify(data) }).then((res) => ({
        ...res,
        data: normalizeProductsPayload(res.data),
      })),
    update: (id: string, data: any) =>
      request<Product | { product?: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then((res) => ({
        ...res,
        data: normalizeProductsPayload(res.data),
      })),
    delete: (id: string) =>
      request<null>(`/products/${id}`, { method: 'DELETE' }),
  },

  // ─── Plans ─────────────────────────────────────────────────
  plans: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Plan[] | { plans?: Plan[] }>(`/plans${q}`).then((res) => ({
        ...res,
        data: normalizePlansPayload(res.data),
      }));
    },
    getById: (id: string) => request<Plan | { plan?: Plan }>(`/plans/${id}`).then((res) => ({
      ...res,
      data: normalizePlansPayload(res.data),
    })),
    create: (data: any) =>
      request<Plan | { plan?: Plan }>('/plans', { method: 'POST', body: JSON.stringify(data) }).then((res) => ({
        ...res,
        data: normalizePlansPayload(res.data),
      })),
    update: (id: string, data: any) =>
      request<Plan | { plan?: Plan }>(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then((res) => ({
        ...res,
        data: normalizePlansPayload(res.data),
      })),
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
    update: (id: string, data: any) =>
      request<Quotation>(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    send: (id: string) =>
      request<Quotation>(`/quotations/${id}/send`, { method: 'POST' }),
    convert: (id: string) =>
      request<Quotation>(`/quotations/${id}/convert`, { method: 'POST' }),
  },

  // ─── Invoices ──────────────────────────────────────────────
  invoices: {
    getAll: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<Invoice[]>(`/invoices${q}`);
    },
    create: (data: any) =>
      request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    getById: (id: string) => request<Invoice>(`/invoices/${id}`),
    confirm: (id: string) =>
      request<Invoice>(`/invoices/${id}/confirm`, { method: 'POST' }),
    send: (id: string) =>
      request<Invoice>(`/invoices/${id}/send`, { method: 'POST' }),
    cancel: (id: string) =>
      request<Invoice>(`/invoices/${id}/cancel`, { method: 'POST' }),
    voidInvoice: (id: string, reason?: string) =>
      request<Invoice>(`/invoices/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) }),
    downloadPdf: async (id: string) => {
      const url = `${API_BASE_URL}/invoices/${id}/download`;
      return fetch(url, {
        credentials: 'include',
        headers: {},
      });
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
    getById: (id: string) => request<Tax>(`/taxes/${id}`),
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
    getMrrReport: () => request<any>('/reports/mrr'),
    getChurnReport: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/churn${q}`);
    },
    getUserGrowthReport: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/users${q}`);
    },
    getInvoiceReport: (params?: any) => {
      const q = params ? `?${new URLSearchParams(params)}` : '';
      return request<any>(`/reports/invoices${q}`);
    },
  }
};
