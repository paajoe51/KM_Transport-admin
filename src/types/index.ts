// TypeScript Domain Types for KM Transport Management System (KMTMS)
// Aligned with SRD.md requirements baseline

export type UserRole = 'admin' | 'officer' | 'driver';

export type AccountStatus = 'pending_activation' | 'active' | 'suspended' | 'inactive' | 'archived';

export type RemittanceFrequency = 'daily' | 'weekly' | 'monthly';

export type ObligationStatus = 'upcoming' | 'due' | 'outstanding' | 'overdue' | 'settled' | 'suspended';

export type PaymentMethod = 'momo_auto' | 'momo_manual' | 'proxy';

export type PaymentStatus =
  | 'initiated'
  | 'pending_provider'
  | 'provider_failed'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'reversed';

export type VehicleStatus =
  | 'available'
  | 'assigned'
  | 'under_breakdown'
  | 'suspended'
  | 'maintenance'
  | 'inactive'
  | 'archived';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPhone: string;
  managerName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface UserPermissions {
  viewAssignedDrivers: boolean;
  viewPaymentHistory: boolean;
  viewDriverStatements: boolean;
  recordProxyPayment: boolean;
  requestDriverSuspension: boolean;
  requestBreakdownSuspension: boolean;
  reassignVehicle: boolean;
  viewVehicleRecords: boolean;
  viewBranchReports: boolean;
  exportReports: boolean;
}

export interface BaseUser {
  id: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  role: UserRole;
  status: AccountStatus;
  branchId: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Driver extends BaseUser {
  role: 'driver';
  ghanaCardNumber: string; // Formatted / masked
  residentialAddress: string;
  licenceNumber: string;
  licenceExpiryDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  assignedOfficerId: string;
  assignedVehicleId?: string;
  remittanceConfigId?: string;
  currentOutstandingBalance: number;
  totalVerifiedPayments: number;
  overdueObligationsCount: number;
  lastPaymentDate?: string;
  ghanaCardDocUrl?: string;
  licenceDocUrl?: string;
}

export interface TransportOfficer extends BaseUser {
  role: 'officer';
  permissions: UserPermissions;
  assignedDriverIds: string[];
}

export interface Administrator extends BaseUser {
  role: 'admin';
}

export type AppUser = Driver | TransportOfficer | Administrator;

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  type: string; // e.g. "Toyota HiAce (Minibus)", "Hyundai Accent (Sedan)"
  year: number;
  chassisNumber: string;
  insuranceExpiryDate: string;
  roadworthinessExpiryDate: string;
  photoUrl: string;
  branchId: string;
  currentDriverId?: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface VehicleAssignment {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  startDate: string;
  endDate?: string;
  assignedBy: string;
  reason: string;
  status: 'active' | 'completed';
}

export interface OfficerAssignment {
  id: string;
  driverId: string;
  driverName: string;
  officerId: string;
  officerName: string;
  branchId: string;
  startDate: string;
  endDate?: string;
  assignedBy: string;
  reason: string;
  status: 'active' | 'completed';
}

export interface RemittanceConfig {
  id: string;
  driverId: string;
  fixedAmount: number;
  frequency: RemittanceFrequency;
  effectiveDate: string;
  dueTime: string; // e.g., "18:00"
  gracePeriodHours: number; // e.g., 16
  status: 'active' | 'superseded';
  createdBy: string;
  reason?: string;
  createdAt: string;
}

export interface RemittanceObligation {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  configId: string;
  periodName: string; // e.g., "Mon 24 Nov 2026"
  periodStartDate: string;
  periodEndDate: string;
  amount: number;
  dueDate: string;
  gracePeriodDeadline: string;
  status: ObligationStatus;
  allocatedAmount: number;
  balance: number;
  suspensionId?: string;
}

export interface PaymentAllocation {
  obligationId: string;
  periodName: string;
  amountAllocated: number;
}

export interface Payment {
  id: string;
  reference: string; // System internal unique ref e.g. "KMP-20261124-001"
  transactionReference: string; // Gateway / MoMo Telco ref e.g. "MM-482910492"
  driverId: string;
  driverName: string;
  vehicleRegistration: string;
  branchId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  submittedBy: string; // "driver" or officerId
  submittingOfficerName?: string;
  rejectionReason?: string;
  evidenceUrl?: string; // Screenshot proof
  obligationsCovered: PaymentAllocation[];
  receiptNumber?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. "KMR-2026-0941"
  paymentId: string;
  paymentReference: string;
  transactionReference: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  branchName: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  obligationsCovered: PaymentAllocation[];
  remainingBalance: number;
  verificationStatus: 'Verified';
  verifiedBy: string;
}

export interface SuspensionRequest {
  id: string;
  driverId: string;
  driverName: string;
  officerId: string;
  officerName: string;
  branchId: string;
  reason: 'Medical' | 'Personal Leave' | 'Disciplinary' | 'Other';
  explanation: string;
  requestedStartDate: string;
  requestedEndDate: string;
  approvedStartDate?: string;
  approvedEndDate?: string;
  status: RequestStatus;
  adminComments?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  evidenceUrl?: string;
}

export interface BreakdownRequest {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegistration: string;
  officerId: string;
  officerName: string;
  branchId: string;
  breakdownDate: string;
  location: string;
  description: string;
  expectedRepairDate: string;
  approvedStartDate?: string;
  approvedEndDate?: string;
  status: RequestStatus;
  adminComments?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  photoUrl?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  role: UserRole | 'all';
  title: string;
  message: string;
  type: 'payment' | 'overdue' | 'approval' | 'rejection' | 'assignment' | 'alert' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface GatewayConfig {
  provider: 'Paystack' | 'Hubtel' | 'Flutterwave';
  environment: 'sandbox' | 'production';
  publicKey: string;
  secretKeyMasked: string;
  webhookUrl: string;
  webhookStatus: 'active' | 'inactive';
  momoReceivingNumber: string;
  momoAccountName: string;
  isEnabled: boolean;
  lastTestedAt?: string;
}

export interface NotificationSettings {
  smsSenderId: string;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  reminderBeforeDeadlineHours: number;
  gracePeriodReminder: boolean;
  recurringOverdueReminderDays: number;
  documentExpiryAlertDays: number;
}
