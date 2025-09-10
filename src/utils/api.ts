import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-06ac22f4`;

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
  accessToken?: string;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, requireAuth = false, accessToken } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requireAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (!requireAuth) {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Products API
export const productsApi = {
  getAll: () => apiRequest('/products'),
  create: (product: any, accessToken: string) => 
    apiRequest('/products', { method: 'POST', body: product, requireAuth: true, accessToken }),
  update: (id: string, updates: any, accessToken: string) => 
    apiRequest(`/products/${id}`, { method: 'PUT', body: updates, requireAuth: true, accessToken }),
  delete: (id: string, accessToken: string) => 
    apiRequest(`/products/${id}`, { method: 'DELETE', requireAuth: true, accessToken }),
};

// Customers API
export const customersApi = {
  getAll: () => apiRequest('/customers'),
  create: (customer: any) => apiRequest('/customers', { method: 'POST', body: customer }),
  update: (id: string, updates: any) => 
    apiRequest(`/customers/${id}`, { method: 'PUT', body: updates }),
};

// Sales API
export const salesApi = {
  create: (sale: any, accessToken: string) => 
    apiRequest('/sales', { method: 'POST', body: sale, requireAuth: true, accessToken }),
  getAll: (accessToken: string) => 
    apiRequest('/sales', { requireAuth: true, accessToken }),
};

// Stock movements API
export const stockMovementsApi = {
  getAll: (accessToken: string) => 
    apiRequest('/stock-movements', { requireAuth: true, accessToken }),
  create: (movement: any, accessToken: string) => 
    apiRequest('/stock-movements', { method: 'POST', body: movement, requireAuth: true, accessToken }),
  update: (id: string, updates: any, accessToken: string) => 
    apiRequest(`/stock-movements/${id}`, { method: 'PUT', body: updates, requireAuth: true, accessToken }),
};

// Metal tracking API
export const metalApi = {
  createTransaction: (transaction: any, accessToken: string) => 
    apiRequest('/metal-transactions', { method: 'POST', body: transaction, requireAuth: true, accessToken }),
  getSummary: (accessToken: string) => 
    apiRequest('/metal-summary', { requireAuth: true, accessToken }),
};

// Settings API
export const settingsApi = {
  get: (accessToken: string) => 
    apiRequest('/settings', { requireAuth: true, accessToken }),
  update: (settings: any, accessToken: string) => 
    apiRequest('/settings', { method: 'PUT', body: settings, requireAuth: true, accessToken }),
};

// Reports API
export const reportsApi = {
  getSalesSummary: (fromDate?: string, toDate?: string, accessToken?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiRequest(`/reports/sales-summary${query}`, { 
      requireAuth: true, 
      accessToken: accessToken || '' 
    });
  },
};

// User management API
export const userApi = {
  signup: (userData: { email: string; password: string; name: string; role: string }) => 
    apiRequest('/signup', { method: 'POST', body: userData }),
};

// Health check
export const healthCheck = () => apiRequest('/health');