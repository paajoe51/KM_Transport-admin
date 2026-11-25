import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { TransportOfficer, UserPermissions } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { ShieldCheck, UserCheck, Check, X } from 'lucide-react';

export const UserPermissionsView: React.FC = () => {
  const [officers, setOfficers] = useState<TransportOfficer[]>(mockService.getOfficers());
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(officers[0]?.id || 'officer-1');
  const { showToast } = useToast();

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId) || officers[0];
  const permissions = selectedOfficer.permissions;

  const handleToggle = (key: keyof UserPermissions) => {
    selectedOfficer.permissions[key] = !selectedOfficer.permissions[key];
    mockService.saveOfficer(selectedOfficer);
    setOfficers([...mockService.getOfficers()]);
    showToast('success', 'Permission Updated', `Toggled ${key} for ${selectedOfficer.fullName}.`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            User Roles & Access Permissions
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Configure granular role capabilities and Transport Officer operational access bounds.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Role Matrix Card */}
        <div className="col-12 col-lg-4">
          <div className="kmtms-card p-3">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              Select Transport Officer
            </h3>
            <div className="list-group">
              {officers.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOfficerId(o.id)}
                  className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 ${
                    selectedOfficerId === o.id ? 'active' : ''
                  }`}
                  style={{ borderRadius: '8px', marginBottom: '4px' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={o.avatarUrl}
                      alt=""
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="text-start">
                      <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{o.fullName}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{o.branchId === 'branch-1' ? 'Accra' : 'Tema'}</div>
                    </div>
                  </div>
                  <ShieldCheck size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Detail Configuration */}
        <div className="col-12 col-lg-8">
          <div className="kmtms-card p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  Active Operational Scope: {selectedOfficer.fullName}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enforced by system backend authorization guards.
                </div>
              </div>
              <span className="badge bg-success">ACTIVE OFFICER</span>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="table-light">
                    <th>Permission Capability</th>
                    <th>Business Purpose</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'viewAssignedDrivers', label: 'View Assigned Drivers', desc: 'Inspect driver records in their supervisory remit' },
                    { key: 'viewPaymentHistory', label: 'View Payment Transactions', desc: 'Review verified remittance history' },
                    { key: 'viewDriverStatements', label: 'View Financial Statements', desc: 'Inspect debit/credit balance statements' },
                    { key: 'recordProxyPayment', label: 'Record Proxy Collections', desc: 'Submit cash payments on behalf of drivers' },
                    { key: 'requestDriverSuspension', label: 'Submit Suspension Requests', desc: 'Request relief for medical or disciplinary leave' },
                    { key: 'requestBreakdownSuspension', label: 'Submit Breakdown Reports', desc: 'Submit vehicle mechanical breakdown requests' },
                    { key: 'reassignVehicle', label: 'Execute Vehicle Reassignment', desc: 'Permitted to reassign spare pool vehicles' },
                    { key: 'viewVehicleRecords', label: 'Inspect Fleet Records', desc: 'Access chassis and vehicle expiry details' },
                    { key: 'viewBranchReports', label: 'View Depot Reports', desc: 'Inspect branch collection performance' },
                    { key: 'exportReports', label: 'Export Report Files', desc: 'Download PDF / Excel summaries' },
                  ].map((p) => {
                    const isGranted = permissions[p.key as keyof UserPermissions];
                    return (
                      <tr key={p.key}>
                        <td className="fw-semibold text-dark">{p.label}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.desc}</td>
                        <td className="text-center">
                          {isGranted ? (
                            <span className="badge-kmtms-success">
                              <Check size={12} /> Granted
                            </span>
                          ) : (
                            <span className="badge-kmtms-danger">
                              <X size={12} /> Denied
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleToggle(p.key as keyof UserPermissions)}
                            className={`btn btn-sm ${isGranted ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                          >
                            {isGranted ? 'Revoke' : 'Grant'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
