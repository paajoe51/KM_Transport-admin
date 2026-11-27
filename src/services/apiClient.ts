/**
 * KM Transport Management System (KMTMS) - Unified Backend API Client
 * Connects frontend React application directly to the PHP API backend
 */

import {
  Branch,
  Driver,
  TransportOfficer,
  Vehicle,
  RemittanceConfig,
  RemittanceObligation,
  Payment,
  Receipt,
  SuspensionRequest,
  BreakdownRequest,
  AppNotification,
  AuditLog,
  GatewayConfig,
  NotificationSettings,
  VehicleAssignment,
  OfficerAssignment,
  AppUser,
} from '../types';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api').replace(/\/$/, '');

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
  errors?: any;
}

export interface BootstrapData {
  branches: Branch[];
  drivers: Driver[];
  officers: TransportOfficer[];
  vehicles: Vehicle[];
  remittanceConfigs: RemittanceConfig[];
  obligations: RemittanceObligation[];
  payments: Payment[];
  receipts: Receipt[];
  suspensions: SuspensionRequest[];
  breakdowns: BreakdownRequest[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  vehicleAssignments: VehicleAssignment[];
  officerAssignments: OfficerAssignment[];
  gatewayConfig?: GatewayConfig;
  notificationSettings?: NotificationSettings;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('kmtms_token_v1');
  const storedUser = localStorage.getItem('kmtms_current_user_v1');
  let userId = '';
  let userRole = '';
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      userId = parsed.id || '';
      userRole = parsed.role || '';
    } catch {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  if (userRole) {
    headers['X-User-Role'] = userRole;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const apiClient = {
  // --- Bootstrap & Sync ---
  getBootstrapState: async (): Promise<BootstrapData> => {
    const res = await request<BootstrapData>('/sync/bootstrap');
    return res.data;
  },

  // --- Auth ---
  login: async (phone: string, pin: string): Promise<{ token: string; user: AppUser }> => {
    const res = await request<{ token: string; user: AppUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    if (res.data?.token) {
      localStorage.setItem('kmtms_token_v1', res.data.token);
    }
    return res.data;
  },

  getCurrentUser: async (): Promise<AppUser> => {
    const res = await request<AppUser>('/auth/me');
    return res.data;
  },

  activateAccount: async (phone: string, otp: string, newPin: string): Promise<void> => {
    await request('/auth/activate', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, newPin }),
    });
  },

  resetPin: async (phone: string, otp: string, newPin: string): Promise<void> => {
    await request('/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, newPin }),
    });
  },

  logout: async (): Promise<void> => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('kmtms_token_v1');
  },

  // --- Drivers ---
  getDrivers: async (): Promise<Driver[]> => {
    const res = await request<Driver[]>('/drivers');
    return res.data;
  },

  saveDriver: async (driver: Partial<Driver>): Promise<Driver> => {
    const isUpdate = !!driver.id && !driver.id.startsWith('driver-') ? false : !!driver.id;
    const method = driver.id ? 'PUT' : 'POST';
    const endpoint = driver.id ? `/drivers/${driver.id}` : '/drivers';
    const res = await request<Driver>(endpoint, {
      method,
      body: JSON.stringify(driver),
    });
    return res.data;
  },

  deleteDriver: async (id: string): Promise<boolean> => {
    await request(`/drivers/${id}`, { method: 'DELETE' });
    return true;
  },

  updateDriverStatus: async (id: string, status: string): Promise<Driver> => {
    const res = await request<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // --- Officers ---
  getOfficers: async (): Promise<TransportOfficer[]> => {
    const res = await request<TransportOfficer[]>('/officers');
    return res.data;
  },

  saveOfficer: async (officer: Partial<TransportOfficer>): Promise<TransportOfficer> => {
    const method = officer.id ? 'PUT' : 'POST';
    const endpoint = officer.id ? `/officers/${officer.id}` : '/officers';
    const res = await request<TransportOfficer>(endpoint, {
      method,
      body: JSON.stringify(officer),
    });
    return res.data;
  },

  deleteOfficer: async (id: string): Promise<boolean> => {
    await request(`/officers/${id}`, { method: 'DELETE' });
    return true;
  },

  updateOfficerStatus: async (id: string, status: string): Promise<TransportOfficer> => {
    const res = await request<TransportOfficer>(`/officers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // --- Vehicles ---
  getVehicles: async (): Promise<Vehicle[]> => {
    const res = await request<Vehicle[]>('/vehicles');
    return res.data;
  },

  saveVehicle: async (veh: Partial<Vehicle>): Promise<Vehicle> => {
    const method = veh.id ? 'PUT' : 'POST';
    const endpoint = veh.id ? `/vehicles/${veh.id}` : '/vehicles';
    const res = await request<Vehicle>(endpoint, {
      method,
      body: JSON.stringify(veh),
    });
    return res.data;
  },

  reassignVehicle: async (driverId: string, newVehicleId: string, reason: string, assignedBy: string): Promise<boolean> => {
    await request('/assignments/vehicles/reassign', {
      method: 'POST',
      body: JSON.stringify({ driverId, newVehicleId, reason, assignedBy }),
    });
    return true;
  },

  // --- Payments ---
  getPayments: async (): Promise<Payment[]> => {
    const res = await request<Payment[]>('/payments');
    return res.data;
  },

  submitPayment: async (payload: {
    driverId: string;
    amount: number;
    method: string;
    submittedBy: string;
    transactionReference?: string;
    evidenceUrl?: string;
    submittingOfficerName?: string;
    notes?: string;
  }): Promise<Payment> => {
    const res = await request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  verifyPayment: async (paymentId: string, verifiedBy: string): Promise<boolean> => {
    await request(`/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verifiedBy }),
    });
    return true;
  },

  rejectPayment: async (paymentId: string, reason: string, reviewerName: string): Promise<boolean> => {
    await request(`/payments/${paymentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, reviewerName }),
    });
    return true;
  },

  reversePayment: async (paymentId: string, reason: string, adminName: string): Promise<boolean> => {
    await request(`/payments/${paymentId}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ reason, adminName }),
    });
    return true;
  },

  // --- Suspensions ---
  submitSuspension: async (payload: Partial<SuspensionRequest>): Promise<SuspensionRequest> => {
    const res = await request<SuspensionRequest>('/suspensions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  reviewSuspension: async (
    id: string,
    approved: boolean,
    comments: string,
    approvedStart?: string,
    approvedEnd?: string,
    reviewerName?: string
  ): Promise<boolean> => {
    await request(`/suspensions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, comments, approvedStartDate: approvedStart, approvedEndDate: approvedEnd, reviewerName }),
    });
    return true;
  },

  // --- Breakdowns ---
  submitBreakdown: async (payload: Partial<BreakdownRequest>): Promise<BreakdownRequest> => {
    const res = await request<BreakdownRequest>('/breakdowns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  reviewBreakdown: async (
    id: string,
    approved: boolean,
    comments: string,
    approvedStart?: string,
    approvedEnd?: string,
    reviewerName?: string
  ): Promise<boolean> => {
    await request(`/breakdowns/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, comments, approvedStartDate: approvedStart, approvedEndDate: approvedEnd, reviewerName }),
    });
    return true;
  },

  // --- Settings ---
  updateGatewayConfig: async (config: Partial<GatewayConfig>): Promise<GatewayConfig> => {
    const res = await request<GatewayConfig>('/settings/gateway', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return res.data;
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const res = await request<NotificationSettings>('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return res.data;
  },

  // --- Notifications ---
  markNotificationRead: async (id: string): Promise<void> => {
    await request(`/notifications/${id}/read`, { method: 'POST' });
  },

  markAllNotificationsRead: async (userId?: string): Promise<void> => {
    await request('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // --- File Upload ---
  uploadImage: async (
    payload: { file?: File; data?: string; category: 'passport' | 'id' }
  ): Promise<{ filename: string; category: string; url: string }> => {
    if (payload.file) {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('category', payload.category);
      const token = localStorage.getItem('kmtms_token_v1');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'File upload failed');
      if (data.data?.url && data.data.url.startsWith('/api/') && API_BASE_URL.startsWith('http')) {
        data.data.url = `${API_BASE_URL}${data.data.url.slice(4)}`;
      }
      return data.data;
    } else {
      const res = await request<{ filename: string; category: string; url: string }>('/upload', {
        method: 'POST',
        body: JSON.stringify({ data: payload.data, category: payload.category }),
      });
      if (res.data?.url && res.data.url.startsWith('/api/') && API_BASE_URL.startsWith('http')) {
        res.data.url = `${API_BASE_URL}${res.data.url.slice(4)}`;
      }
      return res.data;
    }
  },

  // --- KYC AI Vision ---
  analyzeGhanaCard: async (imageBase64: string): Promise<{
    available: boolean;
    pin?: string | null;
    surname?: string | null;
    firstnames?: string | null;
    fullName?: string | null;
    documentNumber?: string | null;
  }> => {
    const res = await request<{
      available: boolean;
      pin?: string | null;
      surname?: string | null;
      firstnames?: string | null;
      fullName?: string | null;
      documentNumber?: string | null;
    }>('/kyc/analyze-card', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    });
    return res.data;
  },
};
