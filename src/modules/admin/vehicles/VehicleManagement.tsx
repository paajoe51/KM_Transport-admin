import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Vehicle, VehicleStatus } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { Truck, Plus, Edit2, AlertTriangle, CheckCircle2, Wrench, Shield, Calendar } from 'lucide-react';

export const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockService.getVehicles());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form
  const [regNumber, setRegNumber] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('HiAce');
  const [type, setType] = useState('Minibus (15-Seater)');
  const [year, setYear] = useState('2022');
  const [chassisNumber, setChassisNumber] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('2027-12-31');
  const [roadworthinessExpiry, setRoadworthinessExpiry] = useState('2027-12-31');
  const [branchId, setBranchId] = useState('branch-1');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=300');

  const { showToast } = useToast();
  const branches = mockService.getBranches();
  const drivers = mockService.getDrivers();

  const handleOpenAdd = () => {
    setSelectedVehicle(null);
    setRegNumber('GT ');
    setMake('Toyota');
    setModel('HiAce Commuter');
    setType('Minibus (15-Seater)');
    setYear('2023');
    setChassisNumber('JTF' + Math.random().toString(36).substring(2, 12).toUpperCase());
    setInsuranceExpiry('2027-12-31');
    setRoadworthinessExpiry('2027-12-31');
    setBranchId('branch-1');
    setIsModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber || !chassisNumber) {
      showToast('warning', 'Missing Details', 'Registration number and chassis number are required.');
      return;
    }

    const saved = mockService.saveVehicle({
      id: selectedVehicle ? selectedVehicle.id : undefined,
      registrationNumber: regNumber,
      make,
      model,
      type,
      year: parseInt(year) || 2023,
      chassisNumber,
      insuranceExpiryDate: insuranceExpiry,
      roadworthinessExpiryDate: roadworthinessExpiry,
      branchId,
      photoUrl,
    });

    setVehicles(mockService.getVehicles());
    setIsModalOpen(false);
    showToast('success', selectedVehicle ? 'Vehicle Updated' : 'Vehicle Registered', `${saved.registrationNumber} recorded.`);
  };

  const columns: Column<Vehicle>[] = [
    {
      header: 'Vehicle & Reg',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={row.photoUrl}
            alt=""
            style={{ width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
          />
          <div>
            <div className="fw-bold" style={{ color: 'var(--primary)' }}>
              {row.registrationNumber}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.make} {row.model} ({row.year})
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => <span style={{ fontSize: '0.8rem' }}>{row.type}</span>,
    },
    {
      header: 'Chassis Number',
      accessor: (row) => (
        <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.chassisNumber}</code>
      ),
    },
    {
      header: 'Current Driver',
      accessor: (row) => {
        const driver = drivers.find((d) => d.id === row.currentDriverId);
        return driver ? (
          <div>
            <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>{driver.fullName}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{driver.phone}</div>
          </div>
        ) : (
          <span className="badge bg-light text-muted border">Unassigned</span>
        );
      },
    },
    {
      header: 'Document Expiries',
      accessor: (row) => {
        const isRoadExpiring = new Date(row.roadworthinessExpiryDate).getTime() < new Date().getTime() + 30 * 86400000;
        return (
          <div style={{ fontSize: '0.75rem' }}>
            <div>
              Ins: <span>{formatDate(row.insuranceExpiryDate)}</span>
            </div>
            <div className={isRoadExpiring ? 'text-danger fw-bold' : ''}>
              Road: <span>{formatDate(row.roadworthinessExpiryDate)}</span>
              {isRoadExpiring && ' ⚠️'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={
            row.status === 'assigned'
              ? 'badge-kmtms-success'
              : row.status === 'available'
              ? 'badge-kmtms-info'
              : 'badge-kmtms-warning'
          }
        >
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => {
            setSelectedVehicle(row);
            setRegNumber(row.registrationNumber);
            setMake(row.make);
            setModel(row.model);
            setType(row.type);
            setYear(String(row.year));
            setChassisNumber(row.chassisNumber);
            setInsuranceExpiry(row.insuranceExpiryDate);
            setRoadworthinessExpiry(row.roadworthinessExpiryDate);
            setBranchId(row.branchId);
            setPhotoUrl(row.photoUrl);
            setIsModalOpen(true);
          }}
          className="btn btn-sm btn-outline-primary"
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        >
          <Edit2 size={12} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Fleet & Vehicle Management
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Register company fleet vehicles, monitor insurance/roadworthiness expiries, and assignments.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-kmtms-primary">
          <Plus size={16} /> Register New Vehicle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        keyExtractor={(v) => v.id}
        searchPlaceholder="Search vehicle by reg, make, model or chassis..."
        searchKey={(v) => `${v.registrationNumber} ${v.make} ${v.model} ${v.chassisNumber}`}
      />

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? 'Edit Vehicle Details' : 'Register New Fleet Vehicle'}
      >
        <form onSubmit={handleSaveVehicle}>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Registration Number *
              </label>
              <input
                type="text"
                className="form-control"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. GT 1234-24"
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Vehicle Type *
              </label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Minibus (15-Seater)">Minibus (15-Seater)</option>
                <option value="Sedan (Taxi/Ride)">Sedan (Taxi/Ride)</option>
                <option value="Commercial Bus">Commercial Bus</option>
                <option value="Van/Delivery">Van / Delivery</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-4">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Make *
              </label>
              <input
                type="text"
                className="form-control"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Toyota"
                required
              />
            </div>
            <div className="col-4">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Model *
              </label>
              <input
                type="text"
                className="form-control"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="HiAce"
                required
              />
            </div>
            <div className="col-4">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Year *
              </label>
              <input
                type="number"
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Chassis Number (VIN) *
            </label>
            <input
              type="text"
              className="form-control"
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value)}
              placeholder="JTFB24P89N0128912"
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Insurance Expiry Date *
              </label>
              <input
                type="date"
                className="form-control"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Roadworthiness Expiry *
              </label>
              <input
                type="date"
                className="form-control"
                value={roadworthinessExpiry}
                onChange={(e) => setRoadworthinessExpiry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Branch Depot Allocation *
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

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-kmtms-primary">
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
