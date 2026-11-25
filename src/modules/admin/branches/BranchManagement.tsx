import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Branch } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { Building2, Plus, Edit2, CheckCircle2, XCircle, Users, Truck, DollarSign } from 'lucide-react';

export const BranchManagement: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(mockService.getBranches());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailBranch, setDetailBranch] = useState<Branch | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const { showToast } = useToast();
  const drivers = mockService.getDrivers();
  const vehicles = mockService.getVehicles();
  const payments = mockService.getPayments();

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setContactPhone('+233 30 ');
    setManagerName('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address);
    setContactPhone(branch.contactPhone);
    setManagerName(branch.managerName || '');
    setStatus(branch.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      showToast('warning', 'Missing Details', 'Please provide branch name and code.');
      return;
    }

    const saved = mockService.saveBranch({
      id: selectedBranch ? selectedBranch.id : undefined,
      name,
      code,
      address,
      contactPhone,
      managerName,
      status,
    });

    setBranches(mockService.getBranches());
    setIsModalOpen(false);
    showToast('success', selectedBranch ? 'Branch Updated' : 'Branch Created', `${saved.name} saved successfully.`);
  };

  const handleViewDetails = (branch: Branch) => {
    setDetailBranch(branch);
    setIsDetailsOpen(true);
  };

  const columns: Column<Branch>[] = [
    {
      header: 'Branch Name & Code',
      accessor: (row) => (
        <div>
          <div className="fw-bold" style={{ color: 'var(--primary)' }}>
            {row.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Code: <code>{row.code}</code>
          </div>
        </div>
      ),
    },
    {
      header: 'Address / Location',
      accessor: (row) => <span style={{ fontSize: '0.85rem' }}>{row.address}</span>,
    },
    {
      header: 'Manager / Contact',
      accessor: (row) => (
        <div>
          <div className="fw-semibold">{row.managerName || 'Unassigned'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.contactPhone}</div>
        </div>
      ),
    },
    {
      header: 'Fleet Stats',
      accessor: (row) => {
        const bDrivers = drivers.filter((d) => d.branchId === row.id).length;
        const bVehicles = vehicles.filter((v) => v.branchId === row.id).length;
        return (
          <span style={{ fontSize: '0.8rem' }}>
            <strong>{bDrivers}</strong> Drivers • <strong>{bVehicles}</strong> Vehicles
          </span>
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
            onClick={() => handleViewDetails(row)}
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            Overview
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
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
            Branch Management
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Manage regional operating branches, depots, and assigned fleet resources.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-kmtms-primary">
          <Plus size={16} /> Add New Branch
        </button>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        keyExtractor={(b) => b.id}
        searchPlaceholder="Search branch by name, code or address..."
        searchKey={(b) => `${b.name} ${b.code} ${b.address} ${b.managerName}`}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBranch ? 'Edit Operating Branch' : 'Add New Operating Branch'}
      >
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Branch Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Greater Accra Central Branch"
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Branch Code *
              </label>
              <input
                type="text"
                className="form-control"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ACC-01"
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Operational Status
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Location Address
            </label>
            <input
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 14 Graphic Road, South Industrial Area, Accra"
            />
          </div>

          <div className="row g-2 mb-4">
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Depot Manager Name
              </label>
              <input
                type="text"
                className="form-control"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Kojo Antwi-Boasiako"
              />
            </div>
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Contact Phone
              </label>
              <input
                type="text"
                className="form-control"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+233 30 223 4567"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-kmtms-primary">
              Save Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* Branch Details Overview Modal */}
      {detailBranch && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Branch Overview: ${detailBranch.name}`}
          maxWidth="680px"
        >
          <div className="row g-3 mb-4">
            <div className="col-4">
              <div className="p-3 bg-light rounded text-center">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Drivers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {drivers.filter((d) => d.branchId === detailBranch.id).length}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded text-center">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fleet Vehicles</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {vehicles.filter((v) => v.branchId === detailBranch.id).length}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded text-center">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Collections</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                  {formatGHS(
                    payments
                      .filter((p) => p.branchId === detailBranch.id && p.status === 'verified')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Branch Metadata</h4>
            <ul className="list-group list-group-flush" style={{ fontSize: '0.85rem' }}>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span className="text-muted">Branch Code:</span>
                <strong>{detailBranch.code}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span className="text-muted">Address:</span>
                <span>{detailBranch.address}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span className="text-muted">Contact Phone:</span>
                <span>{detailBranch.contactPhone}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span className="text-muted">Depot Manager:</span>
                <strong>{detailBranch.managerName || 'Unassigned'}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span className="text-muted">Created Date:</span>
                <span>{formatDate(detailBranch.createdAt)}</span>
              </li>
            </ul>
          </div>

          <div className="d-flex justify-content-end">
            <button onClick={() => setIsDetailsOpen(false)} className="btn-kmtms-secondary">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
