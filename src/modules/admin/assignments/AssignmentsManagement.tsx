import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { VehicleAssignment, OfficerAssignment } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { Briefcase, ArrowRightLeft, UserCheck, Truck, Plus, History } from 'lucide-react';

export const AssignmentsManagement: React.FC = () => {
  const [vehicleAssignments, setVehicleAssignments] = useState<VehicleAssignment[]>(
    mockService.getVehicleAssignments()
  );
  const [officerAssignments, setOfficerAssignments] = useState<OfficerAssignment[]>(
    mockService.getOfficerAssignments()
  );

  const [activeTab, setActiveTab] = useState<'vehicle' | 'officer'>('vehicle');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // Reassignment form
  const [selectedDriverId, setSelectedDriverId] = useState('driver-1');
  const [newVehicleId, setNewVehicleId] = useState('');
  const [reassignReason, setReassignReason] = useState('Replacement due to maintenance schedule');

  const { showToast } = useToast();
  const drivers = mockService.getDrivers();
  const vehicles = mockService.getVehicles();
  const officers = mockService.getOfficers();

  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const handleExecuteReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !newVehicleId) {
      showToast('warning', 'Selection Required', 'Please select both driver and an available vehicle.');
      return;
    }

    const success = mockService.reassignVehicle(
      selectedDriverId,
      newVehicleId,
      reassignReason,
      'Michael Abordzi (Admin)'
    );

    if (success) {
      setVehicleAssignments(mockService.getVehicleAssignments());
      setIsReassignModalOpen(false);
      showToast('success', 'Vehicle Reassigned', 'Vehicle reassignment recorded and audit trail updated.');
    } else {
      showToast('error', 'Reassignment Failed', 'Could not complete reassignment.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Driver & Fleet Assignments
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Manage supervisory allocations and vehicle assignments. Enforces strict 1-to-1 operational pairing.
          </p>
        </div>

        <button onClick={() => setIsReassignModalOpen(true)} className="btn-kmtms-primary">
          <ArrowRightLeft size={16} /> Reassign Vehicle
        </button>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          onClick={() => setActiveTab('vehicle')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'vehicle' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'vehicle' ? 700 : 500,
            color: activeTab === 'vehicle' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
          }}
        >
          Vehicle Assignments History
        </button>
        <button
          onClick={() => setActiveTab('officer')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'officer' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'officer' ? 700 : 500,
            color: activeTab === 'officer' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
          }}
        >
          Transport Officer Allocations
        </button>
      </div>

      {activeTab === 'vehicle' ? (
        <div className="kmtms-card">
          <div className="table-responsive">
            <table className="kmtms-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle Assigned</th>
                  <th>Start Date</th>
                  <th>Assigned By</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicleAssignments.map((va) => (
                  <tr key={va.id}>
                    <td className="fw-bold">{va.driverName}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {va.vehicleRegistration}
                      </span>
                    </td>
                    <td>{formatDate(va.startDate)}</td>
                    <td>{va.assignedBy}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{va.reason}</td>
                    <td>
                      <span className={va.status === 'active' ? 'badge-kmtms-success' : 'badge-kmtms-neutral'}>
                        {va.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="kmtms-card">
          <div className="table-responsive">
            <table className="kmtms-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Supervising Officer</th>
                  <th>Start Date</th>
                  <th>Assigned By</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {officerAssignments.map((oa) => (
                  <tr key={oa.id}>
                    <td className="fw-bold">{oa.driverName}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {oa.officerName}
                      </span>
                    </td>
                    <td>{formatDate(oa.startDate)}</td>
                    <td>{oa.assignedBy}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{oa.reason}</td>
                    <td>
                      <span className={oa.status === 'active' ? 'badge-kmtms-success' : 'badge-kmtms-neutral'}>
                        {oa.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassign Vehicle Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Authorized Vehicle Reassignment"
      >
        <form onSubmit={handleExecuteReassignment}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Select Driver *
            </label>
            <select
              className="form-select"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              {drivers.map((d) => {
                const curVeh = vehicles.find((v) => v.id === d.assignedVehicleId);
                return (
                  <option key={d.id} value={d.id}>
                    {d.fullName} (Currently: {curVeh ? curVeh.registrationNumber : 'None'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Replacement Vehicle (Available Spare Pool) *
            </label>
            {availableVehicles.length === 0 ? (
              <div className="alert alert-warning py-2" style={{ fontSize: '0.8rem' }}>
                No available vehicles currently in the spare pool. Unassign an existing vehicle first.
              </div>
            ) : (
              <select
                className="form-select"
                value={newVehicleId}
                onChange={(e) => setNewVehicleId(e.target.value)}
                required
              >
                <option value="">Select available vehicle...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.make} {v.model} ({v.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Operational Reason for Reassignment *
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="Provide reason for fleet reassignment..."
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={() => setIsReassignModalOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableVehicles.length === 0 || !newVehicleId}
              className="btn-kmtms-primary"
            >
              Execute Reassignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
