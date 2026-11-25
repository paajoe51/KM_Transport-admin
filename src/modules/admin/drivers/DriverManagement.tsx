import React, { useState, useMemo } from 'react';
import { mockService } from '../../../services/mockService';
import { Driver, RemittanceFrequency, AccountStatus } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate, maskGhanaCard, maskPhoneNumber } from '../../../utils/formatters';
import {
  Users,
  Plus,
  Eye,
  Edit2,
  FileText,
  Truck,
  UserCheck,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FolderOpen,
} from 'lucide-react';

export const DriverManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(mockService.getDrivers());
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [officerFilter, setOfficerFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Add Driver Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+233 24 ');
  const [altPhone, setAltPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [ghanaCard, setGhanaCard] = useState('GHA-');
  const [licenceNumber, setLicenceNumber] = useState('DL-');
  const [licenceExpiry, setLicenceExpiry] = useState('2028-12-31');
  const [branchId, setBranchId] = useState('branch-1');
  const [officerId, setOfficerId] = useState('officer-1');
  const [vehicleId, setVehicleId] = useState('');
  const [fixedAmount, setFixedAmount] = useState('150.00');
  const [frequency, setFrequency] = useState<RemittanceFrequency>('daily');
  const [dueTime, setDueTime] = useState('18:00');
  const [gracePeriod, setGracePeriod] = useState(16);

  const { showToast } = useToast();
  const branches = mockService.getBranches();
  const officers = mockService.getOfficers();
  const vehicles = mockService.getVehicles();
  const obligations = mockService.getObligations();
  const payments = mockService.getPayments();
  const configs = mockService.getRemittanceConfigs();

  // Filtered drivers list
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchBranch = branchFilter === 'all' || d.branchId === branchFilter;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchOfficer = officerFilter === 'all' || d.assignedOfficerId === officerFilter;
      return matchBranch && matchStatus && matchOfficer;
    });
  }, [drivers, branchFilter, statusFilter, officerFilter]);

  const handleOpenAdd = () => {
    setAddStep(1);
    setFullName('');
    setPhone('+233 24 ');
    setAltPhone('');
    setResidentialAddress('');
    setEmergencyName('');
    setEmergencyPhone('+233 ');
    setGhanaCard('GHA-');
    setLicenceNumber('DL-');
    setLicenceExpiry('2028-12-31');
    setBranchId('branch-1');
    setOfficerId('officer-1');
    // find first available vehicle
    const available = vehicles.find((v) => v.status === 'available');
    setVehicleId(available ? available.id : '');
    setFixedAmount('150.00');
    setFrequency('daily');
    setIsAddModalOpen(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !ghanaCard || !licenceNumber) {
      showToast('warning', 'Missing Details', 'Please complete required personal and licensing fields.');
      return;
    }

    const newDriver = mockService.saveDriver({
      fullName,
      phone,
      altPhone,
      residentialAddress,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      ghanaCardNumber: ghanaCard,
      licenceNumber,
      licenceExpiryDate: licenceExpiry,
      branchId,
      assignedOfficerId: officerId,
      assignedVehicleId: vehicleId || undefined,
      status: 'active',
      currentOutstandingBalance: parseFloat(fixedAmount) || 150,
    });

    // Save remittance configuration
    mockService.saveRemittanceConfig({
      driverId: newDriver.id,
      fixedAmount: parseFloat(fixedAmount) || 150,
      frequency,
      dueTime,
      gracePeriodHours: gracePeriod,
      effectiveDate: new Date().toISOString().split('T')[0],
      createdBy: 'Michael Abordzi',
    });

    // Assign vehicle if selected
    if (vehicleId) {
      mockService.reassignVehicle(newDriver.id, vehicleId, 'Initial onboarding assignment', 'Michael Abordzi');
    }

    setDrivers(mockService.getDrivers());
    setIsAddModalOpen(false);
    showToast('success', 'Driver Enrolled', `${newDriver.fullName} successfully registered.`);
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setActiveTab('overview');
  };

  const columns: Column<Driver>[] = [
    {
      header: 'Driver & ID',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={row.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt=""
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="fw-bold" style={{ color: 'var(--primary)' }}>
              {row.fullName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {maskGhanaCard(row.ghanaCardNumber)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (row) => <span style={{ fontSize: '0.85rem' }}>{row.phone}</span>,
    },
    {
      header: 'Branch & Officer',
      accessor: (row) => {
        const branch = branches.find((b) => b.id === row.branchId);
        const officer = officers.find((o) => o.id === row.assignedOfficerId);
        return (
          <div>
            <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
              {branch?.code || 'ACC-01'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Off: {officer?.fullName.split(' ')[0] || 'Unassigned'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Vehicle',
      accessor: (row) => {
        const veh = vehicles.find((v) => v.id === row.assignedVehicleId);
        return (
          <div>
            <div className="fw-bold" style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
              {veh ? veh.registrationNumber : 'None'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {veh ? veh.type : 'Unassigned'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Arrangement',
      accessor: (row) => {
        const cfg = configs.find((c) => c.driverId === row.id && c.status === 'active');
        return (
          <span style={{ fontSize: '0.8rem' }}>
            <strong>{formatGHS(cfg?.fixedAmount || 150)}</strong> / {cfg?.frequency || 'daily'}
          </span>
        );
      },
    },
    {
      header: 'Outstanding Balance',
      accessor: (row) => (
        <span
          className="fw-bold"
          style={{
            fontSize: '0.85rem',
            color: row.currentOutstandingBalance > 0 ? 'var(--danger)' : 'var(--success)',
          }}
        >
          {formatGHS(row.currentOutstandingBalance)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={row.status === 'active' ? 'badge-kmtms-success' : row.status === 'suspended' ? 'badge-kmtms-danger' : 'badge-kmtms-warning'}>
          {row.status.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleViewDriver(row)}
          className="btn btn-sm btn-outline-primary"
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        >
          <Eye size={12} /> View Profile
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Title Bar */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Driver Management
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Centralized driver register, operational allocations, licensing and accounts.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-kmtms-primary">
          <Plus size={16} /> Enroll New Driver
        </button>
      </div>

      {/* Filters Bar */}
      <div className="kmtms-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Filter by Branch:
            </label>
            <select
              className="form-select form-select-sm"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Account Status:
            </label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_activation">Pending Activation</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Assigned Transport Officer:
            </label>
            <select
              className="form-select form-select-sm"
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
            >
              <option value="all">All Officers</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3 d-flex align-items-end">
            <button
              onClick={() => {
                setBranchFilter('all');
                setStatusFilter('all');
                setOfficerFilter('all');
              }}
              className="btn btn-sm btn-outline-secondary w-100"
              style={{ height: '31px', fontSize: '0.78rem' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Data Table */}
      <DataTable
        columns={columns}
        data={filteredDrivers}
        keyExtractor={(d) => d.id}
        searchPlaceholder="Search driver by name, phone, licence, Ghana Card..."
        searchKey={(d) => `${d.fullName} ${d.phone} ${d.ghanaCardNumber} ${d.licenceNumber}`}
      />

      {/* ENROLL DRIVER MODAL (Multi-step per SRD 7.1) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Driver Registration & Fleet Enrollment (Step ${addStep} of 3)`}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveDriver}>
          {/* Step 1: Personal & Emergency Details */}
          {addStep === 1 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                1. Personal Information & Emergency Contact
              </h3>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwabena Darko"
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Primary Phone Number *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Alternative Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="+233 20 000 0000"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Residential Address *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="e.g. House No. 12, Block C, Dansoman, Accra"
                  required
                />
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Akosua Mensah (Spouse)"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+233 24 112 3344"
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-kmtms-secondary">
                  Cancel
                </button>
                <button type="button" onClick={() => setAddStep(2)} className="btn-kmtms-primary">
                  Next: Identification & Licence →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Identification & Driver's Licence */}
          {addStep === 2 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                2. Ghana Card & Driving Licence
              </h3>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Ghana Card PIN *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={ghanaCard}
                    onChange={(e) => setGhanaCard(e.target.value)}
                    placeholder="GHA-718293841-9"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Driver's Licence Number *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={licenceNumber}
                    onChange={(e) => setLicenceNumber(e.target.value)}
                    placeholder="DL-ACC-2022-8921"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Licence Expiry Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={licenceExpiry}
                  onChange={(e) => setLicenceExpiry(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-light rounded mb-4 border">
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Document Upload Verification (Simulated)
                </div>
                <div className="row g-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div className="col-6">
                    <span className="badge bg-secondary mb-1">Ghana Card PDF/Photo</span>
                    <div>ghana_card_verification.pdf (Uploaded)</div>
                  </div>
                  <div className="col-6">
                    <span className="badge bg-secondary mb-1">Licence Document</span>
                    <div>driving_licence_copy.pdf (Uploaded)</div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" onClick={() => setAddStep(1)} className="btn-kmtms-secondary">
                  ← Back
                </button>
                <button type="button" onClick={() => setAddStep(3)} className="btn-kmtms-primary">
                  Next: Remittance & Assignment →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Operational Assignment & Remittance */}
          {addStep === 3 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                3. Operational Assignment & Remittance Configuration
              </h3>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Branch *
                  </label>
                  <select
                    className="form-select"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Assigned Officer *
                  </label>
                  <select
                    className="form-select"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                  >
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.fullName} ({o.branchId === 'branch-1' ? 'Accra' : 'Tema'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Assigned Vehicle (Rule: 1 active driver per vehicle)
                </label>
                <select
                  className="form-select"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                >
                  <option value="">No Vehicle Assigned Yet (Standby)</option>
                  {vehicles
                    .filter((v) => v.status === 'available')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} — {v.make} {v.model} ({v.type})
                      </option>
                    ))}
                </select>
              </div>

              <div className="row g-2 mb-4 p-3 bg-light rounded border">
                <div className="col-12 fw-bold text-dark mb-2" style={{ fontSize: '0.825rem' }}>
                  Remittance Agreement Settings
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Fixed Remittance Amount (GHS) *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Remittance Frequency *
                  </label>
                  <select
                    className="form-select"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RemittanceFrequency)}
                  >
                    <option value="daily">Daily (Calendar Days)</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" onClick={() => setAddStep(2)} className="btn-kmtms-secondary">
                  ← Back
                </button>
                <button type="submit" className="btn-kmtms-primary">
                  Enroll Driver & Activate
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* DRIVER PROFILE DETAILS (8 TABS per SRD 9.3) */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          title={`Driver Dossier: ${selectedDriver.fullName}`}
          maxWidth="840px"
        >
          {/* Header Summary */}
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <img
                src={selectedDriver.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt=""
                style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                  {selectedDriver.fullName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedDriver.phone} • {maskGhanaCard(selectedDriver.ghanaCardNumber)}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className={selectedDriver.status === 'active' ? 'badge-kmtms-success' : 'badge-kmtms-danger'}>
                {selectedDriver.status.toUpperCase()}
              </span>
              <div className="text-end">
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Balance</div>
                <div className="fw-bold" style={{ color: selectedDriver.currentOutstandingBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {formatGHS(selectedDriver.currentOutstandingBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* 8 Tabs Navigation */}
          <div className="d-flex gap-1 border-bottom mb-3 overflow-x-auto pb-1" style={{ fontSize: '0.8rem' }}>
            {[
              { id: 'overview', label: '1. Overview' },
              { id: 'remittances', label: '2. Remittances' },
              { id: 'payments', label: '3. Payments' },
              { id: 'vehicle', label: '4. Vehicle' },
              { id: 'documents', label: '5. Documents' },
              { id: 'assignments', label: '6. Assignments' },
              { id: 'suspensions', label: '7. Suspensions' },
              { id: 'audit', label: '8. Audit History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn btn-sm"
                style={{
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === tab.id ? 'var(--primary-subtle)' : 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational Branch</div>
                    <div className="fw-bold">
                      {branches.find((b) => b.id === selectedDriver.branchId)?.name || 'Accra Central'}
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responsible Transport Officer</div>
                    <div className="fw-bold">
                      {officers.find((o) => o.id === selectedDriver.assignedOfficerId)?.fullName || 'Emmanuel Kwakye'}
                    </div>
                  </div>
                </div>
              </div>

              <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: '35%' }}>Residential Address:</td>
                    <td className="fw-semibold">{selectedDriver.residentialAddress}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Driving Licence No:</td>
                    <td className="fw-semibold">{selectedDriver.licenceNumber} (Exp: {selectedDriver.licenceExpiryDate})</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Emergency Contact:</td>
                    <td>{selectedDriver.emergencyContactName} ({selectedDriver.emergencyContactPhone})</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Total Verified Remittance:</td>
                    <td className="fw-bold text-success">{formatGHS(selectedDriver.totalVerifiedPayments)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Overdue Periods:</td>
                    <td>
                      <span className={selectedDriver.overdueObligationsCount > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                        {selectedDriver.overdueObligationsCount} period(s)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: REMITTANCES */}
          {activeTab === 'remittances' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Contractual Obligations Register</span>
                <span className="badge bg-light text-dark border">
                  Total Outstanding: {formatGHS(selectedDriver.currentOutstandingBalance)}
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr className="text-muted">
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Allocated</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obligations
                      .filter((o) => o.driverId === selectedDriver.id)
                      .map((ob) => (
                        <tr key={ob.id}>
                          <td className="fw-semibold">{ob.periodName}</td>
                          <td>{formatGHS(ob.amount)}</td>
                          <td>{formatDate(ob.dueDate)}</td>
                          <td className="text-success">{formatGHS(ob.allocatedAmount)}</td>
                          <td className="fw-bold">{formatGHS(ob.balance)}</td>
                          <td>
                            <span className={`badge-kmtms-${ob.status === 'settled' ? 'success' : ob.status === 'overdue' ? 'danger' : 'warning'}`}>
                              {ob.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Verified & Submitted Transactions</span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr className="text-muted">
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter((p) => p.driverId === selectedDriver.id)
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.reference}</td>
                          <td className="fw-bold">{formatGHS(p.amount)}</td>
                          <td>{p.method}</td>
                          <td>{formatDate(p.submittedAt)}</td>
                          <td>
                            <span className={`badge-kmtms-${p.status === 'verified' ? 'success' : 'warning'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VEHICLE */}
          {activeTab === 'vehicle' && (
            <div>
              {selectedDriver.assignedVehicleId ? (
                (() => {
                  const veh = vehicles.find((v) => v.id === selectedDriver.assignedVehicleId);
                  return veh ? (
                    <div className="row g-3 align-items-center">
                      <div className="col-sm-5">
                        <img
                          src={veh.photoUrl}
                          alt="Vehicle"
                          className="img-fluid rounded border shadow-sm"
                        />
                      </div>
                      <div className="col-sm-7">
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {veh.registrationNumber}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          {veh.make} {veh.model} ({veh.year}) — {veh.type}
                        </div>
                        <ul className="list-group list-group-flush" style={{ fontSize: '0.8rem' }}>
                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">Chassis No:</span>
                            <code>{veh.chassisNumber}</code>
                          </li>
                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">Insurance Expiry:</span>
                            <span>{formatDate(veh.insuranceExpiryDate)}</span>
                          </li>
                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">Roadworthiness:</span>
                            <span>{formatDate(veh.roadworthinessExpiryDate)}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div>No vehicle record found.</div>
                  );
                })()
              ) : (
                <div className="p-4 text-center text-muted">
                  Driver currently has no active assigned vehicle.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded border text-center">
                  <FileText size={32} color="var(--primary)" className="mb-2" />
                  <div className="fw-bold" style={{ fontSize: '0.85rem' }}>Ghana National ID Card</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Document (PDF)</div>
                  <button className="btn btn-sm btn-outline-primary mt-2" style={{ fontSize: '0.75rem' }}>
                    View Secure Document
                  </button>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded border text-center">
                  <FileText size={32} color="var(--secondary)" className="mb-2" />
                  <div className="fw-bold" style={{ fontSize: '0.85rem' }}>Driving Licence</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class C / Commercial (PDF)</div>
                  <button className="btn btn-sm btn-outline-primary mt-2" style={{ fontSize: '0.75rem' }}>
                    View Secure Document
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Vehicle & Transport Officer Assignment Audit
              </div>
              <div className="p-3 bg-light rounded border" style={{ fontSize: '0.8rem' }}>
                <div className="d-flex justify-content-between mb-1">
                  <strong>Initial Onboarding Assignment</strong>
                  <span className="text-muted">01 Feb 2025</span>
                </div>
                <div className="text-secondary">Assigned to Toyota HiAce GT 4582-24 by Admin Michael Abordzi.</div>
              </div>
            </div>
          )}

          {/* TAB 7: SUSPENSIONS */}
          {activeTab === 'suspensions' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Suspension History (SRD 11.4)
              </div>
              <div className="p-3 bg-light rounded border" style={{ fontSize: '0.8rem' }}>
                {selectedDriver.status === 'suspended' ? (
                  <div>
                    <div className="badge-kmtms-danger mb-2">ACTIVE SUSPENSION</div>
                    <div>Approved medical suspension period: 11 Nov 2026 – 25 Nov 2026.</div>
                    <div className="text-muted mt-1">Daily obligations excluded during approved duration. Prior arrears remain payable.</div>
                  </div>
                ) : (
                  <div className="text-muted">No historical suspension records for this driver.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT HISTORY */}
          {activeTab === 'audit' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Driver Ledger & Modification Trail
              </div>
              <ul className="list-group list-group-flush" style={{ fontSize: '0.8rem' }}>
                <li className="list-group-item px-0">
                  <span className="text-muted">{formatDate(selectedDriver.createdAt)}:</span> Account created and onboarding initiated.
                </li>
                <li className="list-group-item px-0">
                  <span className="text-muted">23 Nov 2026:</span> Verified payment GH₵150.00 credited via Paystack.
                </li>
              </ul>
            </div>
          )}

          <div className="d-flex justify-content-end mt-4 pt-3 border-top">
            <button onClick={() => setSelectedDriver(null)} className="btn-kmtms-secondary">
              Close Profile
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
