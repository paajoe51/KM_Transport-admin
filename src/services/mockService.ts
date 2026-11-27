// Mock Service and Data Store for KM Transport Management System (KMTMS)
// Persists demonstration state to LocalStorage with fallback to initial data

import {
  AccountStatus,
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
  PaymentMethod,
} from '../types';

import { apiClient } from './apiClient';

import {
  INITIAL_BRANCHES,
  INITIAL_ADMIN,
  INITIAL_OFFICERS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_REMITTANCE_CONFIGS,
  INITIAL_OBLIGATIONS,
  INITIAL_PAYMENTS,
  INITIAL_RECEIPTS,
  INITIAL_SUSPENSIONS,
  INITIAL_BREAKDOWNS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GATEWAY_CONFIG,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_VEHICLE_ASSIGNMENTS,
  INITIAL_OFFICER_ASSIGNMENTS,
} from './mockData';

const STORAGE_PREFIX = 'kmtms_db_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

class MockService {
  private branches: Branch[] = loadFromStorage('branches', INITIAL_BRANCHES);
  private drivers: Driver[] = loadFromStorage('drivers', INITIAL_DRIVERS);
  private officers: TransportOfficer[] = loadFromStorage('officers', INITIAL_OFFICERS);
  private vehicles: Vehicle[] = loadFromStorage('vehicles', INITIAL_VEHICLES);
  private remittanceConfigs: RemittanceConfig[] = loadFromStorage('rem_configs', INITIAL_REMITTANCE_CONFIGS);
  private obligations: RemittanceObligation[] = loadFromStorage('obligations', INITIAL_OBLIGATIONS);
  private payments: Payment[] = loadFromStorage('payments', INITIAL_PAYMENTS);
  private receipts: Receipt[] = loadFromStorage('receipts', INITIAL_RECEIPTS);
  private suspensions: SuspensionRequest[] = loadFromStorage('suspensions', INITIAL_SUSPENSIONS);
  private breakdowns: BreakdownRequest[] = loadFromStorage('breakdowns', INITIAL_BREAKDOWNS);
  private notifications: AppNotification[] = loadFromStorage('notifications', INITIAL_NOTIFICATIONS);
  private auditLogs: AuditLog[] = loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS);
  private gatewayConfig: GatewayConfig = loadFromStorage('gateway_config', INITIAL_GATEWAY_CONFIG);
  private notificationSettings: NotificationSettings = loadFromStorage('notif_settings', INITIAL_NOTIFICATION_SETTINGS);
  private vehicleAssignments: VehicleAssignment[] = loadFromStorage('veh_assignments', INITIAL_VEHICLE_ASSIGNMENTS);
  private officerAssignments: OfficerAssignment[] = loadFromStorage('off_assignments', INITIAL_OFFICER_ASSIGNMENTS);

  private syncPromise: Promise<void> | null = null;

  constructor() {
    this.syncWithApi();
  }

  async syncWithApi(): Promise<void> {
    if (this.syncPromise) return this.syncPromise;
    this.syncPromise = (async () => {
      try {
        const data = await apiClient.getBootstrapState();
        if (data) {
          if (Array.isArray(data.branches)) this.branches = data.branches;
          if (Array.isArray(data.drivers)) this.drivers = data.drivers;
          if (Array.isArray(data.officers)) this.officers = data.officers;
          if (Array.isArray(data.vehicles)) this.vehicles = data.vehicles;
          if (Array.isArray(data.remittanceConfigs)) this.remittanceConfigs = data.remittanceConfigs;
          if (Array.isArray(data.obligations)) this.obligations = data.obligations;
          if (Array.isArray(data.payments)) this.payments = data.payments;
          if (Array.isArray(data.receipts)) this.receipts = data.receipts;
          if (Array.isArray(data.suspensions)) this.suspensions = data.suspensions;
          if (Array.isArray(data.breakdowns)) this.breakdowns = data.breakdowns;
          if (Array.isArray(data.notifications)) this.notifications = data.notifications;
          if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
          if (Array.isArray(data.vehicleAssignments)) this.vehicleAssignments = data.vehicleAssignments;
          if (Array.isArray(data.officerAssignments)) this.officerAssignments = data.officerAssignments;
          if (data.gatewayConfig) this.gatewayConfig = data.gatewayConfig;
          if (data.notificationSettings) this.notificationSettings = data.notificationSettings;
          this.persistAll();
        }
      } catch (err) {
        console.warn('API bootstrap failed, using cached/fallback data:', err);
      }
    })();
    return this.syncPromise;
  }

  // Reset to initial demo data
  resetAllData(): void {
    localStorage.clear();
    this.branches = [...INITIAL_BRANCHES];
    this.drivers = [...INITIAL_DRIVERS];
    this.officers = [...INITIAL_OFFICERS];
    this.vehicles = [...INITIAL_VEHICLES];
    this.remittanceConfigs = [...INITIAL_REMITTANCE_CONFIGS];
    this.obligations = [...INITIAL_OBLIGATIONS];
    this.payments = [...INITIAL_PAYMENTS];
    this.receipts = [...INITIAL_RECEIPTS];
    this.suspensions = [...INITIAL_SUSPENSIONS];
    this.breakdowns = [...INITIAL_BREAKDOWNS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.gatewayConfig = { ...INITIAL_GATEWAY_CONFIG };
    this.notificationSettings = { ...INITIAL_NOTIFICATION_SETTINGS };
    this.vehicleAssignments = [...INITIAL_VEHICLE_ASSIGNMENTS];
    this.officerAssignments = [...INITIAL_OFFICER_ASSIGNMENTS];
    this.persistAll();
  }

  private persistAll(): void {
    saveToStorage('branches', this.branches);
    saveToStorage('drivers', this.drivers);
    saveToStorage('officers', this.officers);
    saveToStorage('vehicles', this.vehicles);
    saveToStorage('rem_configs', this.remittanceConfigs);
    saveToStorage('obligations', this.obligations);
    saveToStorage('payments', this.payments);
    saveToStorage('receipts', this.receipts);
    saveToStorage('suspensions', this.suspensions);
    saveToStorage('breakdowns', this.breakdowns);
    saveToStorage('notifications', this.notifications);
    saveToStorage('audit_logs', this.auditLogs);
    saveToStorage('gateway_config', this.gatewayConfig);
    saveToStorage('notif_settings', this.notificationSettings);
    saveToStorage('veh_assignments', this.vehicleAssignments);
    saveToStorage('off_assignments', this.officerAssignments);
  }

  // --- BRANCHES ---
  getBranches(): Branch[] {
    return [...this.branches];
  }

  getBranch(id: string): Branch | undefined {
    return this.branches.find((b) => b.id === id);
  }

  saveBranch(branch: Partial<Branch>): Branch {
    if (branch.id) {
      const idx = this.branches.findIndex((b) => b.id === branch.id);
      if (idx !== -1) {
        this.branches[idx] = { ...this.branches[idx], ...branch } as Branch;
        saveToStorage('branches', this.branches);
        return this.branches[idx];
      }
    }
    const newBranch: Branch = {
      id: 'branch-' + Date.now(),
      name: branch.name || 'New Branch',
      code: branch.code || 'BR-' + Math.floor(10 + Math.random() * 90),
      address: branch.address || '',
      contactPhone: branch.contactPhone || '',
      managerName: branch.managerName,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.branches.unshift(newBranch);
    saveToStorage('branches', this.branches);
    return newBranch;
  }

  // --- DRIVERS ---
  getDrivers(): Driver[] {
    return [...this.drivers];
  }

  getDriver(id: string): Driver | undefined {
    return this.drivers.find((d) => d.id === id);
  }

  saveDriver(driverData: Partial<Driver>): Driver {
    if (driverData.id) {
      const idx = this.drivers.findIndex((d) => d.id === driverData.id);
      if (idx !== -1) {
        this.drivers[idx] = { ...this.drivers[idx], ...driverData } as Driver;
        saveToStorage('drivers', this.drivers);
        return this.drivers[idx];
      }
    }
    const newDriver: Driver = {
      id: 'driver-' + Date.now(),
      fullName: driverData.fullName || 'New Driver',
      phone: driverData.phone || '+233 24 000 0000',
      altPhone: driverData.altPhone,
      email: driverData.email,
      role: 'driver',
      status: driverData.status || 'pending_activation',
      branchId: driverData.branchId || 'branch-1',
      avatarUrl: driverData.avatarUrl,
      ghanaCardNumber: driverData.ghanaCardNumber || 'GHA-000000000-0',
      ghanaCardDocUrl: driverData.ghanaCardDocUrl,
      residentialAddress: driverData.residentialAddress || 'Accra, Ghana',
      licenceNumber: driverData.licenceNumber || 'DL-ACC-2026-0000',
      licenceDocUrl: driverData.licenceDocUrl,
      licenceExpiryDate: driverData.licenceExpiryDate || '2028-12-31',
      emergencyContactName: driverData.emergencyContactName || 'Family Member',
      emergencyContactPhone: driverData.emergencyContactPhone || '+233 24 111 2222',
      emergencyContactRelationship: driverData.emergencyContactRelationship,
      emergencyContactTown: driverData.emergencyContactTown,
      guarantorName: driverData.guarantorName,
      guarantorGhanaCardNumber: driverData.guarantorGhanaCardNumber,
      guarantorTown: driverData.guarantorTown,
      guarantorPhotoUrl: driverData.guarantorPhotoUrl,
      guarantorGhanaCardDocUrl: driverData.guarantorGhanaCardDocUrl,
      assignedOfficerId: driverData.assignedOfficerId || 'officer-1',
      assignedVehicleId: driverData.assignedVehicleId,
      currentOutstandingBalance: 0,
      totalVerifiedPayments: 0,
      overdueObligationsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.drivers.unshift(newDriver);
    saveToStorage('drivers', this.drivers);
    apiClient.saveDriver(newDriver).catch(() => {});
    return newDriver;
  }

  deleteDriver(driverId: string): boolean {
    const idx = this.drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return false;

    const driver = this.drivers[idx];

    // If driver had assigned vehicle, unassign it
    if (driver.assignedVehicleId) {
      const veh = this.vehicles.find((v) => v.id === driver.assignedVehicleId);
      if (veh) {
        veh.currentDriverId = undefined;
        veh.status = 'available';
        saveToStorage('vehicles', this.vehicles);
      }
    }

    this.drivers.splice(idx, 1);
    saveToStorage('drivers', this.drivers);
    apiClient.deleteDriver(driverId).catch(() => {});

    this.addAuditLog({
      userId: 'admin-1',
      userName: 'Michael Abordzi',
      userRole: 'admin',
      action: 'DRIVER_DELETED',
      entityType: 'driver',
      entityId: driver.id,
      reason: `Driver ${driver.fullName} (${driver.id}) was permanently deleted from the system.`,
    });

    return true;
  }

  toggleDriverStatus(driverId: string, forcedStatus?: AccountStatus): Driver | undefined {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return undefined;

    const previousStatus = driver.status;
    const newStatus: AccountStatus = forcedStatus || (driver.status === 'active' ? 'inactive' : 'active');
    driver.status = newStatus;

    // If deactivated and vehicle was assigned, make vehicle available
    if (newStatus === 'inactive' && driver.assignedVehicleId) {
      const veh = this.vehicles.find((v) => v.id === driver.assignedVehicleId);
      if (veh) {
        veh.currentDriverId = undefined;
        veh.status = 'available';
        saveToStorage('vehicles', this.vehicles);
      }
      driver.assignedVehicleId = undefined;
    }

    saveToStorage('drivers', this.drivers);
    apiClient.updateDriverStatus(driverId, newStatus).catch(() => {});

    this.addAuditLog({
      userId: 'admin-1',
      userName: 'Michael Abordzi',
      userRole: 'admin',
      action: 'DRIVER_STATUS_CHANGE',
      entityType: 'driver',
      entityId: driver.id,
      previousValue: previousStatus,
      newValue: newStatus,
      reason: `Driver ${driver.fullName} status changed from ${previousStatus} to ${newStatus}.`,
    });

    return driver;
  }

  // --- OFFICERS ---
  getOfficers(): TransportOfficer[] {
    return [...this.officers];
  }

  getOfficer(id: string): TransportOfficer | undefined {
    return this.officers.find((o) => o.id === id);
  }

  saveOfficer(officerData: Partial<TransportOfficer>): TransportOfficer {
    if (officerData.id) {
      const idx = this.officers.findIndex((o) => o.id === officerData.id);
      if (idx !== -1) {
        this.officers[idx] = { ...this.officers[idx], ...officerData } as TransportOfficer;
        saveToStorage('officers', this.officers);
        return this.officers[idx];
      }
    }
    const newOfficer: TransportOfficer = {
      id: 'officer-' + Date.now(),
      fullName: officerData.fullName || 'New Officer',
      phone: officerData.phone || '+233 24 000 0000',
      altPhone: officerData.altPhone,
      email: officerData.email || 'officer@kmtransport.com.gh',
      role: 'officer',
      status: 'active',
      branchId: officerData.branchId || 'branch-1',
      assignedDriverIds: [],
      permissions: officerData.permissions || {
        viewAssignedDrivers: true,
        viewPaymentHistory: true,
        viewDriverStatements: true,
        recordProxyPayment: true,
        requestDriverSuspension: true,
        requestBreakdownSuspension: true,
        reassignVehicle: true,
        viewVehicleRecords: true,
        viewBranchReports: true,
        exportReports: true,
      },
      createdAt: new Date().toISOString(),
    };
    this.officers.unshift(newOfficer);
    saveToStorage('officers', this.officers);
    return newOfficer;
  }

  deleteOfficer(officerId: string): boolean {
    const idx = this.officers.findIndex((o) => o.id === officerId);
    if (idx === -1) return false;

    const officer = this.officers[idx];

    // Unassign supervised drivers from this officer
    this.drivers.forEach((d) => {
      if (d.assignedOfficerId === officerId) {
        d.assignedOfficerId = '';
      }
    });
    saveToStorage('drivers', this.drivers);

    this.officers.splice(idx, 1);
    saveToStorage('officers', this.officers);
    apiClient.deleteOfficer(officerId).catch(() => {});

    this.addAuditLog({
      userId: 'admin-1',
      userName: 'Michael Abordzi',
      userRole: 'admin',
      action: 'OFFICER_DELETED',
      entityType: 'officer',
      entityId: officer.id,
      reason: `Transport Officer ${officer.fullName} (${officer.id}) was permanently deleted from the system.`,
    });

    return true;
  }

  toggleOfficerStatus(officerId: string, forcedStatus?: AccountStatus): TransportOfficer | undefined {
    const officer = this.officers.find((o) => o.id === officerId);
    if (!officer) return undefined;

    const previousStatus = officer.status;
    const newStatus: AccountStatus = forcedStatus || (officer.status === 'active' ? 'inactive' : 'active');
    officer.status = newStatus;

    saveToStorage('officers', this.officers);
    apiClient.updateOfficerStatus(officerId, newStatus).catch(() => {});

    this.addAuditLog({
      userId: 'admin-1',
      userName: 'Michael Abordzi',
      userRole: 'admin',
      action: 'OFFICER_STATUS_CHANGE',
      entityType: 'officer',
      entityId: officer.id,
      previousValue: previousStatus,
      newValue: newStatus,
      reason: `Transport Officer ${officer.fullName} status changed from ${previousStatus} to ${newStatus}.`,
    });

    return officer;
  }

  // --- VEHICLES ---
  getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  getVehicle(id: string): Vehicle | undefined {
    return this.vehicles.find((v) => v.id === id);
  }

  saveVehicle(vehData: Partial<Vehicle>): Vehicle {
    if (vehData.id) {
      const idx = this.vehicles.findIndex((v) => v.id === vehData.id);
      if (idx !== -1) {
        this.vehicles[idx] = { ...this.vehicles[idx], ...vehData } as Vehicle;
        saveToStorage('vehicles', this.vehicles);
        return this.vehicles[idx];
      }
    }
    const newVeh: Vehicle = {
      id: 'veh-' + Date.now(),
      registrationNumber: vehData.registrationNumber || 'GT 0000-26',
      make: vehData.make || 'Toyota',
      model: vehData.model || 'HiAce',
      type: vehData.type || 'Minibus',
      year: vehData.year || 2023,
      chassisNumber: vehData.chassisNumber || 'JTF' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      insuranceExpiryDate: vehData.insuranceExpiryDate || '2027-12-31',
      roadworthinessExpiryDate: vehData.roadworthinessExpiryDate || '2027-12-31',
      photoUrl: vehData.photoUrl || 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=300',
      branchId: vehData.branchId || 'branch-1',
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    this.vehicles.unshift(newVeh);
    saveToStorage('vehicles', this.vehicles);
    apiClient.saveVehicle(newVeh).catch(() => {});
    return newVeh;
  }

  // Vehicle Reassignment Rule: One active driver per vehicle, one active vehicle per driver
  reassignVehicle(driverId: string, newVehicleId: string, reason: string, assignedBy: string): boolean {
    const driver = this.drivers.find((d) => d.id === driverId);
    const newVehicle = this.vehicles.find((v) => v.id === newVehicleId);
    if (!driver || !newVehicle) return false;

    // Release old vehicle
    if (driver.assignedVehicleId) {
      const oldVeh = this.vehicles.find((v) => v.id === driver.assignedVehicleId);
      if (oldVeh) {
        oldVeh.currentDriverId = undefined;
        oldVeh.status = 'available';
      }
    }

    // Assign new vehicle
    newVehicle.currentDriverId = driver.id;
    newVehicle.status = 'assigned';
    driver.assignedVehicleId = newVehicle.id;

    // Record assignment history
    this.vehicleAssignments.unshift({
      id: 'va-' + Date.now(),
      driverId: driver.id,
      driverName: driver.fullName,
      vehicleId: newVehicle.id,
      vehicleRegistration: newVehicle.registrationNumber,
      startDate: new Date().toISOString().split('T')[0],
      assignedBy,
      reason,
      status: 'active',
    });

    this.addAuditLog({
      userId: 'system',
      userName: assignedBy,
      userRole: 'admin',
      action: 'REASSIGN_VEHICLE',
      entityType: 'VEHICLE_ASSIGNMENT',
      entityId: newVehicle.id,
      reason,
      previousValue: `Driver ${driver.fullName} previous vehicle unassigned`,
      newValue: `Assigned to ${newVehicle.registrationNumber}`,
    });

    this.persistAll();
    apiClient.reassignVehicle(driverId, newVehicleId, reason, assignedBy).catch(() => {});
    return true;
  }

  // --- REMITTANCE CONFIG ---
  getRemittanceConfigs(): RemittanceConfig[] {
    return [...this.remittanceConfigs];
  }

  getConfigForDriver(driverId: string): RemittanceConfig | undefined {
    return this.remittanceConfigs.find((c) => c.driverId === driverId && c.status === 'active');
  }

  saveRemittanceConfig(config: Partial<RemittanceConfig>): RemittanceConfig {
    // Supersede old config for driver
    if (config.driverId) {
      this.remittanceConfigs.forEach((c) => {
        if (c.driverId === config.driverId && c.status === 'active') {
          c.status = 'superseded';
        }
      });
    }

    const newConfig: RemittanceConfig = {
      id: 'rem-cfg-' + Date.now(),
      driverId: config.driverId || 'driver-1',
      fixedAmount: config.fixedAmount || 150.00,
      frequency: config.frequency || 'daily',
      effectiveDate: config.effectiveDate || new Date().toISOString().split('T')[0],
      dueTime: config.dueTime || '18:00',
      gracePeriodHours: config.gracePeriodHours || 16,
      status: 'active',
      createdBy: config.createdBy || 'Michael Abordzi',
      reason: config.reason,
      createdAt: new Date().toISOString(),
    };
    this.remittanceConfigs.unshift(newConfig);
    saveToStorage('rem_configs', this.remittanceConfigs);
    return newConfig;
  }

  // --- OBLIGATIONS ---
  getObligations(): RemittanceObligation[] {
    return [...this.obligations];
  }

  getObligationsForDriver(driverId: string): RemittanceObligation[] {
    return this.obligations.filter((o) => o.driverId === driverId);
  }

  // --- PAYMENTS & ALLOCATION (FIFO) ---
  getPayments(): Payment[] {
    return [...this.payments];
  }

  getPayment(id: string): Payment | undefined {
    return this.payments.find((p) => p.id === id);
  }

  // Core rule: Driver must pay full outstanding amount. No partial payments, no advance payments.
  submitPayment(
    driverId: string,
    amount: number,
    method: PaymentMethod,
    submittedBy: string,
    transactionReference?: string,
    evidenceUrl?: string,
    submittingOfficerName?: string,
    notes?: string
  ): Payment {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) throw new Error('Driver not found');

    const vehicle = this.vehicles.find((v) => v.id === driver.assignedVehicleId);
    const vehicleReg = vehicle ? vehicle.registrationNumber : 'UNASSIGNED';

    const payRef = 'KMP-' + new Date().toISOString().replace(/\D/g, '').slice(0, 14) + '-' + Math.floor(100 + Math.random() * 900);
    const txRef = transactionReference || 'TX-' + Math.floor(100000000 + Math.random() * 900000000);

    const initialStatus = method === 'momo_auto' ? 'verified' : 'pending_verification';

    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      reference: payRef,
      transactionReference: txRef,
      driverId: driver.id,
      driverName: driver.fullName,
      vehicleRegistration: vehicleReg,
      branchId: driver.branchId,
      amount,
      method,
      status: initialStatus,
      submittedAt: new Date().toISOString(),
      submittedBy,
      submittingOfficerName,
      evidenceUrl,
      notes,
      obligationsCovered: [],
    };

    if (initialStatus === 'verified') {
      newPayment.verifiedAt = new Date().toISOString();
      newPayment.verifiedBy = 'Paystack Automated Gateway Callback';
      this.allocatePaymentToObligations(newPayment, driver);
    }

    this.payments.unshift(newPayment);
    saveToStorage('payments', this.payments);

    // Notification
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      userId: driver.id,
      role: 'driver',
      title: initialStatus === 'verified' ? 'Payment Verified Successfully' : 'Payment Submitted for Verification',
      message:
        initialStatus === 'verified'
          ? `Your payment of GH₵${amount.toFixed(2)} was verified via ${method}. Receipt generated.`
          : `Your manual payment submission of GH₵${amount.toFixed(2)} is pending administrative review.`,
      type: 'payment',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/driver/payments',
    });

    this.persistAll();
    apiClient.submitPayment({ driverId, amount, method, submittedBy, transactionReference: txRef, evidenceUrl, submittingOfficerName, notes }).catch(() => {});
    return newPayment;
  }

  // Allocate verified payment to oldest unsettled obligations (FIFO)
  private allocatePaymentToObligations(payment: Payment, driver: Driver): void {
    let remainingAmount = payment.amount;
    const allocations: { obligationId: string; periodName: string; amountAllocated: number }[] = [];

    // Find unsettled obligations for driver
    const driverObs = this.obligations
      .filter((o) => o.driverId === driver.id && o.status !== 'settled' && o.status !== 'suspended')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    for (const ob of driverObs) {
      if (remainingAmount <= 0) break;
      const need = ob.balance;
      const allocate = Math.min(remainingAmount, need);
      ob.allocatedAmount += allocate;
      ob.balance -= allocate;
      remainingAmount -= allocate;

      if (ob.balance <= 0) {
        ob.status = 'settled';
      }

      allocations.push({
        obligationId: ob.id,
        periodName: ob.periodName,
        amountAllocated: allocate,
      });
    }

    payment.obligationsCovered = allocations;

    // Recalculate driver balance
    const updatedBalance = this.obligations
      .filter((o) => o.driverId === driver.id && o.status !== 'settled' && o.status !== 'suspended')
      .reduce((sum, o) => sum + o.balance, 0);

    driver.currentOutstandingBalance = updatedBalance;
    driver.totalVerifiedPayments += payment.amount;
    driver.overdueObligationsCount = this.obligations.filter(
      (o) => o.driverId === driver.id && o.status === 'overdue'
    ).length;
    driver.lastPaymentDate = payment.verifiedAt || new Date().toISOString();

    // Create Receipt
    const receiptNum = 'KMR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    payment.receiptNumber = receiptNum;

    const branch = this.getBranch(driver.branchId);

    const receipt: Receipt = {
      id: 'rec-' + Date.now(),
      receiptNumber: receiptNum,
      paymentId: payment.id,
      paymentReference: payment.reference,
      transactionReference: payment.transactionReference,
      driverId: driver.id,
      driverName: driver.fullName,
      driverPhone: driver.phone,
      vehicleRegistration: payment.vehicleRegistration,
      branchName: branch ? branch.name : 'KM Transport Head Office',
      amount: payment.amount,
      method: payment.method,
      paymentDate: payment.verifiedAt || new Date().toISOString(),
      obligationsCovered: allocations,
      remainingBalance: updatedBalance,
      verificationStatus: 'Verified',
      verifiedBy: payment.verifiedBy || 'Administrator',
    };

    this.receipts.unshift(receipt);
    saveToStorage('receipts', this.receipts);
  }

  // Administrator verifies manual MoMo or Proxy payment
  verifyPayment(paymentId: string, verifiedBy: string): boolean {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment || payment.status === 'verified') return false;

    const driver = this.drivers.find((d) => d.id === payment.driverId);
    if (!driver) return false;

    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    payment.verifiedBy = verifiedBy;

    this.allocatePaymentToObligations(payment, driver);

    this.addAuditLog({
      userId: 'admin-1',
      userName: verifiedBy,
      userRole: 'admin',
      action: 'VERIFY_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment.id,
      reason: `Verified manual/proxy submission of GH₵${payment.amount.toFixed(2)} against receiving account statement`,
      previousValue: 'Status: pending_verification',
      newValue: 'Status: verified',
    });

    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      userId: driver.id,
      role: 'driver',
      title: 'Payment Verified & Receipt Issued',
      message: `Your payment of GH₵${payment.amount.toFixed(2)} has been verified. Receipt #${payment.receiptNumber} generated.`,
      type: 'payment',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/driver/receipts',
    });

    this.persistAll();
    apiClient.verifyPayment(paymentId, verifiedBy).catch(() => {});
    return true;
  }

  // Administrator rejects manual MoMo or Proxy payment
  rejectPayment(paymentId: string, reason: string, reviewerName: string): boolean {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment || payment.status === 'verified') return false;

    payment.status = 'rejected';
    payment.rejectionReason = reason;

    this.addAuditLog({
      userId: 'admin-1',
      userName: reviewerName,
      userRole: 'admin',
      action: 'REJECT_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment.id,
      reason,
      previousValue: 'Status: pending_verification',
      newValue: 'Status: rejected',
    });

    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      userId: payment.driverId,
      role: 'driver',
      title: 'Payment Submission Rejected',
      message: `Your payment submission of GH₵${payment.amount.toFixed(2)} was rejected. Reason: ${reason}`,
      type: 'rejection',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/driver/payments',
    });

    this.persistAll();
    apiClient.rejectPayment(paymentId, reason, reviewerName).catch(() => {});
    return true;
  }

  // Authorized reversal of verified payment (Never physical deletion!)
  reversePayment(paymentId: string, reason: string, adminName: string): boolean {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment || payment.status !== 'verified') return false;

    const driver = this.drivers.find((d) => d.id === payment.driverId);
    if (!driver) return false;

    payment.status = 'reversed';
    payment.notes = (payment.notes ? payment.notes + ' | ' : '') + `Reversed by ${adminName} on ${new Date().toISOString()}: ${reason}`;

    // Rollback allocations from obligations
    for (const alloc of payment.obligationsCovered) {
      const ob = this.obligations.find((o) => o.id === alloc.obligationId);
      if (ob) {
        ob.allocatedAmount -= alloc.amountAllocated;
        ob.balance += alloc.amountAllocated;
        ob.status = ob.balance === ob.amount ? 'outstanding' : 'due';
      }
    }

    // Recalculate driver balance
    const updatedBalance = this.obligations
      .filter((o) => o.driverId === driver.id && o.status !== 'settled' && o.status !== 'suspended')
      .reduce((sum, o) => sum + o.balance, 0);

    driver.currentOutstandingBalance = updatedBalance;
    driver.totalVerifiedPayments -= payment.amount;

    this.addAuditLog({
      userId: 'admin-1',
      userName: adminName,
      userRole: 'admin',
      action: 'REVERSE_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment.id,
      reason,
      previousValue: 'Status: verified',
      newValue: 'Status: reversed | Driver balance adjusted',
    });

    this.persistAll();
    apiClient.reversePayment(paymentId, reason, adminName).catch(() => {});
    return true;
  }

  // --- RECEIPTS ---
  getReceipts(): Receipt[] {
    return [...this.receipts];
  }

  getReceipt(id: string): Receipt | undefined {
    return this.receipts.find((r) => r.id === id);
  }

  getReceiptByNumber(num: string): Receipt | undefined {
    return this.receipts.find((r) => r.receiptNumber === num);
  }

  // --- SUSPENSIONS ---
  getSuspensions(): SuspensionRequest[] {
    return [...this.suspensions];
  }

  submitSuspension(req: Partial<SuspensionRequest>): SuspensionRequest {
    const driver = this.drivers.find((d) => d.id === req.driverId);
    const newReq: SuspensionRequest = {
      id: 'susp-' + Date.now(),
      driverId: req.driverId || 'driver-1',
      driverName: driver ? driver.fullName : 'Driver',
      officerId: req.officerId || 'officer-1',
      officerName: req.officerName || 'Transport Officer',
      branchId: driver ? driver.branchId : 'branch-1',
      reason: req.reason || 'Medical',
      explanation: req.explanation || '',
      requestedStartDate: req.requestedStartDate || new Date().toISOString().split('T')[0],
      requestedEndDate: req.requestedEndDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      evidenceUrl: req.evidenceUrl,
      submittedAt: new Date().toISOString(),
    };
    this.suspensions.unshift(newReq);
    saveToStorage('suspensions', this.suspensions);
    apiClient.submitSuspension(newReq).catch(() => {});
    return newReq;
  }

  reviewSuspension(id: string, approved: boolean, comments: string, approvedStart?: string, approvedEnd?: string, reviewerName = 'Michael Abordzi'): boolean {
    const susp = this.suspensions.find((s) => s.id === id);
    if (!susp) return false;

    susp.status = approved ? 'approved' : 'rejected';
    susp.adminComments = comments;
    susp.reviewedAt = new Date().toISOString();
    susp.reviewedBy = reviewerName;
    if (approved) {
      susp.approvedStartDate = approvedStart || susp.requestedStartDate;
      susp.approvedEndDate = approvedEnd || susp.requestedEndDate;

      // Mark affected driver obligations in range as suspended
      // Note SRD rule: Arrears before suspension period remain payable!
      this.obligations.forEach((o) => {
        if (o.driverId === susp.driverId && o.status !== 'settled') {
          const obDate = o.periodStartDate.split('T')[0];
          if (obDate >= susp.approvedStartDate! && obDate <= susp.approvedEndDate!) {
            o.status = 'suspended';
            o.suspensionId = susp.id;
          }
        }
      });
    }

    this.persistAll();
    apiClient.reviewSuspension(id, approved, comments, approvedStart, approvedEnd, reviewerName).catch(() => {});
    return true;
  }

  // --- BREAKDOWNS ---
  getBreakdowns(): BreakdownRequest[] {
    return [...this.breakdowns];
  }

  submitBreakdown(req: Partial<BreakdownRequest>): BreakdownRequest {
    const driver = this.drivers.find((d) => d.id === req.driverId);
    const veh = this.vehicles.find((v) => v.id === req.vehicleId);

    const newReq: BreakdownRequest = {
      id: 'bd-' + Date.now(),
      driverId: req.driverId || 'driver-1',
      driverName: driver ? driver.fullName : 'Driver',
      vehicleId: req.vehicleId || 'veh-1',
      vehicleRegistration: veh ? veh.registrationNumber : 'GT 0000-24',
      officerId: req.officerId || 'officer-1',
      officerName: req.officerName || 'Transport Officer',
      branchId: driver ? driver.branchId : 'branch-1',
      breakdownDate: req.breakdownDate || new Date().toISOString().split('T')[0],
      location: req.location || 'Accra Central',
      description: req.description || 'Engine breakdown',
      expectedRepairDate: req.expectedRepairDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      photoUrl: req.photoUrl,
      submittedAt: new Date().toISOString(),
    };
    this.breakdowns.unshift(newReq);
    saveToStorage('breakdowns', this.breakdowns);
    apiClient.submitBreakdown(newReq).catch(() => {});
    return newReq;
  }

  reviewBreakdown(id: string, approved: boolean, comments: string, approvedStart?: string, approvedEnd?: string, reviewerName = 'Michael Abordzi'): boolean {
    const bd = this.breakdowns.find((b) => b.id === id);
    if (!bd) return false;

    bd.status = approved ? 'approved' : 'rejected';
    bd.adminComments = comments;
    bd.reviewedAt = new Date().toISOString();
    bd.reviewedBy = reviewerName;

    if (approved) {
      bd.approvedStartDate = approvedStart || bd.breakdownDate;
      bd.approvedEndDate = approvedEnd || bd.expectedRepairDate;

      // Update vehicle status
      const veh = this.vehicles.find((v) => v.id === bd.vehicleId);
      if (veh) {
        veh.status = 'under_breakdown';
      }

      // Exclude obligations during breakdown period
      this.obligations.forEach((o) => {
        if (o.driverId === bd.driverId && o.status !== 'settled') {
          const obDate = o.periodStartDate.split('T')[0];
          if (obDate >= bd.approvedStartDate! && obDate <= bd.approvedEndDate!) {
            o.status = 'suspended';
          }
        }
      });
    }

    this.persistAll();
    apiClient.reviewBreakdown(id, approved, comments, approvedStart, approvedEnd, reviewerName).catch(() => {});
    return true;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId?: string): AppNotification[] {
    if (!userId) return [...this.notifications];
    return this.notifications.filter((n) => n.userId === userId || n.role === 'all');
  }

  markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      saveToStorage('notifications', this.notifications);
      apiClient.markNotificationRead(id).catch(() => {});
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId || n.role === 'all') {
        n.read = true;
      }
    });
    saveToStorage('notifications', this.notifications);
    apiClient.markAllNotificationsRead(userId).catch(() => {});
  }

  // --- AUDIT LOGS (Append-only) ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): void {
    const newLog: AuditLog = {
      ...log,
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      ipAddress: '197.251.240.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    };
    this.auditLogs.unshift(newLog);
    saveToStorage('audit_logs', this.auditLogs);
  }

  // --- GATEWAY CONFIG ---
  getGatewayConfig(): GatewayConfig {
    return { ...this.gatewayConfig };
  }

  updateGatewayConfig(config: Partial<GatewayConfig>): GatewayConfig {
    this.gatewayConfig = { ...this.gatewayConfig, ...config };
    saveToStorage('gateway_config', this.gatewayConfig);
    apiClient.updateGatewayConfig(this.gatewayConfig).catch(() => {});
    return this.gatewayConfig;
  }

  // --- NOTIFICATION SETTINGS ---
  getNotificationSettings(): NotificationSettings {
    return { ...this.notificationSettings };
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    saveToStorage('notif_settings', this.notificationSettings);
    apiClient.updateNotificationSettings(this.notificationSettings).catch(() => {});
    return this.notificationSettings;
  }

  // --- ASSIGNMENTS ---
  getVehicleAssignments(): VehicleAssignment[] {
    return [...this.vehicleAssignments];
  }

  getOfficerAssignments(): OfficerAssignment[] {
    return [...this.officerAssignments];
  }
}

export const mockService = new MockService();
