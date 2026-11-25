import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { TransportOfficer, UserPermissions } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { UserCheck, Plus, Edit2, ShieldCheck, Users, BarChart3, Phone, Mail } from 'lucide-react';

export const OfficerManagement: React.FC = () => {
  const [officers, setOfficers] = useState<TransportOfficer[]>(mockService.getOfficers());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<TransportOfficer | null>(null);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);

  // Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+233 24 ');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('branch-1');
  const [permissions, setPermissions] = useState<UserPermissions>({
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
  });

  const { showToast } = useToast();
  const branches = mockService.getBranches();
  const drivers = mockService.getDrivers();
  const payments = mockService.getPayments();

  const handleOpenAdd = () => {
    setSelectedOfficer(null);
    setFullName('');
    setPhone('+233 24 ');
    setEmail('');
    setBranchId('branch-1');
    setIsAddModalOpen(true);
  };

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      showToast('warning', 'Missing Details', 'Full name and phone are required.');
      return;
    }

    const saved = mockService.saveOfficer({
      id: selectedOfficer ? selectedOfficer.id : undefined,
      fullName,
      phone,
      email,
      branchId,
      permissions,
      status: 'active',
    });

    setOfficers(mockService.getOfficers());
    setIsAddModalOpen(false);
    showToast('success', selectedOfficer ? 'Officer Updated' : 'Officer Created', `${saved.fullName} saved.`);
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePermissions = () => {
    if (selectedOfficer) {
      selectedOfficer.permissions = permissions;
      mockService.saveOfficer(selectedOfficer);
      setOfficers(mockService.getOfficers());
      setIsPermModalOpen(false);
      showToast('success', 'Permissions Saved', `Updated permissions for ${selectedOfficer.fullName}.`);
    }
  };

  const columns: Column<TransportOfficer>[] = [
    {
      header: 'Transport Officer',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={row.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
            alt=""
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="fw-bold" style={{ color: 'var(--primary)' }}>
              {row.fullName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      accessor: (row) => <span style={{ fontSize: '0.85rem' }}>{row.phone}</span>,
    },
    {
      header: 'Branch Depot',
      accessor: (row) => {
        const branch = branches.find((b) => b.id === row.branchId);
        return <span className="fw-semibold">{branch?.name || 'Accra Central'}</span>;
      },
    },
    {
      header: 'Assigned Drivers',
      accessor: (row) => {
        const count = drivers.filter((d) => d.assignedOfficerId === row.id).length;
        return (
          <span className="badge bg-light text-dark border">
            {count} Drivers Supervised
          </span>
        );
      },
    },
    {
      header: 'Permissions Scope',
      accessor: (row) => {
        const canReassign = row.permissions.reassignVehicle;
        const canExport = row.permissions.exportReports;
        return (
          <div style={{ fontSize: '0.75rem' }}>
            {canReassign && <span className="badge bg-primary-subtle text-primary me-1">Reassign</span>}
            {canExport && <span className="badge bg-secondary-subtle text-secondary me-1">Export</span>}
            <span className="badge bg-light text-muted border">Proxy Pay</span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={row.status === 'active' ? 'badge-kmtms-success' : 'badge-kmtms-danger'}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => {
              setSelectedOfficer(row);
              setPermissions({ ...row.permissions });
              setIsPermModalOpen(true);
            }}
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            <ShieldCheck size={12} /> Permissions
          </button>
          <button
            onClick={() => {
              setSelectedOfficer(row);
              setFullName(row.fullName);
              setPhone(row.phone);
              setEmail(row.email || '');
              setBranchId(row.branchId);
              setPermissions({ ...row.permissions });
              setIsAddModalOpen(true);
            }}
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Transport Officer Management
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Register officers, assign branch jurisdictions, configure permissions and track collections.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-kmtms-primary">
          <Plus size={16} /> Register New Officer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={officers}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search officer by name, phone or email..."
        searchKey={(o) => `${o.fullName} ${o.phone} ${o.email}`}
      />

      {/* Add / Edit Officer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={selectedOfficer ? 'Edit Transport Officer' : 'Register New Transport Officer'}
      >
        <form onSubmit={handleSaveOfficer}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Richmond Baah"
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Mobile Number *
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
                Corporate Email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@kmtransport.com.gh"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Operating Branch Assignment *
            </label>
            <select
              className="form-select"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-kmtms-primary">
              Save Officer Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Permissions Modal */}
      {selectedOfficer && (
        <Modal
          isOpen={isPermModalOpen}
          onClose={() => setIsPermModalOpen(false)}
          title={`Configure Permissions: ${selectedOfficer.fullName}`}
          maxWidth="620px"
        >
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Set fine-grained operational permissions for this Transport Officer according to company security policy.
          </p>

          <div className="list-group mb-4" style={{ fontSize: '0.85rem' }}>
            {[
              { key: 'viewAssignedDrivers', label: 'View Assigned Drivers & Profiles', desc: 'Can inspect drivers assigned to their supervisory remit.' },
              { key: 'viewPaymentHistory', label: 'View Driver Payment Histories', desc: 'Can review payment transaction records for assigned drivers.' },
              { key: 'viewDriverStatements', label: 'View Driver Remittance Statements', desc: 'Can view full financial obligation statements and debit/credit ledgers.' },
              { key: 'recordProxyPayment', label: 'Record Proxy Cash Collections', desc: 'Authorized to collect cash and submit proxy payment for admin approval.' },
              { key: 'requestDriverSuspension', label: 'Submit Driver Suspension Requests', desc: 'Can request temporary remittance pause for medical or disciplinary reasons.' },
              { key: 'requestBreakdownSuspension', label: 'Submit Vehicle Breakdown Requests', desc: 'Can submit mechanical breakdown reports and photos for fleet review.' },
              { key: 'reassignVehicle', label: 'Perform Vehicle Reassignments', desc: 'Can reassign drivers to available replacement vehicles.' },
              { key: 'viewVehicleRecords', label: 'View Fleet & Vehicle Details', desc: 'Access chassis, roadworthiness and insurance expiry information.' },
              { key: 'viewBranchReports', label: 'View Branch Performance Reports', desc: 'Can view aggregated collection performance for their branch.' },
              { key: 'exportReports', label: 'Export Reports (PDF / Excel)', desc: 'Authorized to download official financial and collection summaries.' },
            ].map((item) => (
              <label
                key={item.key}
                className="list-group-item d-flex align-items-start gap-3 py-2"
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={permissions[item.key as keyof UserPermissions]}
                  onChange={() => handleTogglePermission(item.key as keyof UserPermissions)}
                  className="form-check-input mt-1"
                />
                <div>
                  <div className="fw-semibold text-dark">{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={() => setIsPermModalOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSavePermissions} className="btn-kmtms-primary">
              Save Permissions
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
