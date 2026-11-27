// KM Transport Management System (KMTMS) Initial Clean State
// All operational records are loaded live from the backend database.

import {
  Branch,
  Driver,
  TransportOfficer,
  Administrator,
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
} from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Greater Accra Central Branch',
    code: 'ACC-01',
    address: 'Plot 14, Graphic Road, South Industrial Area, Accra',
    contactPhone: '+233 30 223 4567',
    managerName: 'Michael Abordzi',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

export const INITIAL_ADMIN: Administrator = {
  id: 'admin-1',
  fullName: 'Michael Abordzi',
  phone: '+233 24 100 2000',
  altPhone: '+233 20 100 2001',
  email: 'm.abordzi@kmtransport.com.gh',
  role: 'admin',
  status: 'active',
  branchId: 'branch-1',
  createdAt: '2025-01-01T00:00:00Z',
};

export const INITIAL_OFFICERS: TransportOfficer[] = [];

export const INITIAL_DRIVERS: Driver[] = [];

export const INITIAL_VEHICLES: Vehicle[] = [];

export const INITIAL_REMITTANCE_CONFIGS: RemittanceConfig[] = [];

export const INITIAL_OBLIGATIONS: RemittanceObligation[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_RECEIPTS: Receipt[] = [];

export const INITIAL_SUSPENSIONS: SuspensionRequest[] = [];

export const INITIAL_BREAKDOWNS: BreakdownRequest[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_GATEWAY_CONFIG: GatewayConfig = {
  provider: 'Paystack',
  environment: 'sandbox',
  publicKey: '',
  secretKeyMasked: '',
  webhookUrl: '',
  webhookStatus: 'inactive',
  momoReceivingNumber: '+233 24 100 2000',
  momoAccountName: 'KM COMPANY LIMITED',
  isEnabled: true,
};

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  smsSenderId: 'KM-TRANS',
  smsEnabled: true,
  inAppEnabled: true,
  reminderBeforeDeadlineHours: 2,
  gracePeriodReminder: true,
  recurringOverdueReminderDays: 1,
  documentExpiryAlertDays: 14,
};

export const INITIAL_VEHICLE_ASSIGNMENTS: VehicleAssignment[] = [];

export const INITIAL_OFFICER_ASSIGNMENTS: OfficerAssignment[] = [];
