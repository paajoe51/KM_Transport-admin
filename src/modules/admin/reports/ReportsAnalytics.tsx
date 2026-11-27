import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { useToast } from '../../../context/ToastContext';
import { BarChart3, Download, Printer, Filter, Calendar, FileText, User, Truck, Building2 } from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const { showToast } = useToast();
  const branches = mockService.getBranches();
  const drivers = mockService.getDrivers();
  const payments = mockService.getPayments();
  const obligations = mockService.getObligations();
  const officers = mockService.getOfficers();
  const vehicles = mockService.getVehicles();

  const handleExport = (format: 'PDF' | 'Excel') => {
    showToast('success', `Exporting ${format}`, `Generated ${selectedReport.toUpperCase()} report in ${format} format.`);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const driverObs = selectedDriver ? obligations.filter((o) => o.driverId === selectedDriver.id) : [];
  const driverPays = selectedDriver ? payments.filter((p) => p.driverId === selectedDriver.id && p.status === 'verified') : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Reports & Operational Analytics
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Authoritative financial reports, driver statement ledgers, officer collection performance and fleet compliance.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={() => handleExport('Excel')} className="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
            <Download size={14} /> Export Excel (.xlsx)
          </button>
          <button onClick={() => handleExport('PDF')} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
            <Download size={14} /> Export PDF
          </button>
          <button onClick={handlePrint} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Report Categories Nav */}
      <div className="kmtms-card p-2 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {[
            { id: 'financial', label: 'Financial Collections Summary' },
            { id: 'driver_statement', label: 'Individual Driver Statement' },
            { id: 'officer_performance', label: 'Officer Collection Ranking' },
            { id: 'vehicle_compliance', label: 'Fleet & Document Expiries' },
            { id: 'branch_summary', label: 'Regional Branch Performance' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedReport(item.id)}
              className="btn btn-sm"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: selectedReport === item.id ? 700 : 500,
                backgroundColor: selectedReport === item.id ? 'var(--primary)' : 'transparent',
                color: selectedReport === item.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* REPORT 1: FINANCIAL SUMMARY */}
      {selectedReport === 'financial' && (
        <div className="kmtms-card p-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                KM Company LTD — Consolidated Financial Report
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reporting Period: 01 Nov 2026 – 24 Nov 2026 • Currency: GHS (Ghana Cedis)
              </div>
            </div>
            <div className="text-end">
              <span className="badge bg-success">AUDITED POSITION</span>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-4">
              <div className="p-3 bg-light rounded text-center">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Contractual Expected</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatGHS(obligations.filter((o) => o.status !== 'suspended').reduce((s, o) => s + o.amount, 0))}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded text-center">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Verified Collections</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>
                  {formatGHS(payments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount, 0))}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded text-center">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cumulative Fleet Arrears</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--danger)' }}>
                  {formatGHS(drivers.reduce((s, d) => s + d.currentOutstandingBalance, 0))}
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
            Breakdown by Payment Method & Channel
          </h3>
          <table className="table table-bordered table-sm mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th>Payment Channel</th>
                <th className="text-center">Transaction Count</th>
                <th className="text-end">Gross Collections</th>
                <th className="text-end">Contribution %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Automated Mobile Money Gateway (Paystack/Hubtel)</td>
                <td className="text-center">2</td>
                <td className="text-end fw-bold text-success">{formatGHS(3650.00)}</td>
                <td className="text-end">15.5%</td>
              </tr>
              <tr>
                <td>Manual Direct MoMo Transfer (Verified)</td>
                <td className="text-center">12</td>
                <td className="text-end fw-bold text-success">{formatGHS(18400.00)}</td>
                <td className="text-end">78.0%</td>
              </tr>
              <tr>
                <td>Officer Proxy Cash Collections (Verified)</td>
                <td className="text-center">3</td>
                <td className="text-end fw-bold text-success">{formatGHS(1550.00)}</td>
                <td className="text-end">6.5%</td>
              </tr>
              <tr className="table-light fw-bold">
                <td>TOTAL VERIFIED NET REVENUE</td>
                <td className="text-center">17</td>
                <td className="text-end" style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
                  {formatGHS(23600.00)}
                </td>
                <td className="text-end">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 2: DRIVER STATEMENT (DEBIT, CREDIT, BALANCE PER SRD 16.2) */}
      {selectedReport === 'driver_statement' && (
        <div className="kmtms-card p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-3 mb-3">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                Individual Driver Statement Ledger
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Debits, Credits and Closing Balance Statement (SRD 16.2)
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Driver:</label>
              <select
                className="form-select form-select-sm"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                style={{ width: 'auto', fontWeight: 600 }}
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statement Header Card */}
          <div className="p-3 bg-light rounded border mb-4" style={{ fontSize: '0.85rem' }}>
            <div className="row g-2">
              <div className="col-sm-6">
                <div><strong>Driver:</strong> {selectedDriver?.fullName || 'No Driver Selected'}</div>
                <div><strong>Ghana Card:</strong> {selectedDriver?.ghanaCardNumber || '—'}</div>
                <div><strong>Address:</strong> {selectedDriver?.residentialAddress || '—'}</div>
              </div>
              <div className="col-sm-6 text-sm-end">
                <div><strong>Vehicle Reg:</strong> {selectedDriver?.assignedVehicleId ? (vehicles.find(v => v.id === selectedDriver.assignedVehicleId)?.registrationNumber || 'Unassigned') : 'Unassigned'}</div>
                <div><strong>Branch:</strong> {selectedDriver?.branchId ? (branches.find(b => b.id === selectedDriver.branchId)?.name || 'Central') : 'Central'}</div>
                <div className="fw-bold mt-1" style={{ color: (selectedDriver?.currentOutstandingBalance || 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  Current Closing Balance: {formatGHS(selectedDriver?.currentOutstandingBalance || 0)}
                </div>
              </div>
            </div>
          </div>

          <table className="table table-bordered table-sm mb-0" style={{ fontSize: '0.825rem' }}>
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Transaction Description</th>
                <th className="text-end">Debit (Obligation)</th>
                <th className="text-end">Credit (Verified Paid)</th>
                <th className="text-end">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01 Nov 2026</td>
                <td>Opening Balance Carried Forward</td>
                <td className="text-end">—</td>
                <td className="text-end">—</td>
                <td className="text-end fw-semibold">GH₵ 0.00</td>
              </tr>
              <tr>
                <td>22 Nov 2026</td>
                <td>Daily Remittance Obligation</td>
                <td className="text-end text-danger fw-semibold">GH₵ 150.00</td>
                <td className="text-end">—</td>
                <td className="text-end fw-semibold">GH₵ 150.00</td>
              </tr>
              <tr>
                <td>23 Nov 2026</td>
                <td>Daily Remittance Obligation</td>
                <td className="text-end text-danger fw-semibold">GH₵ 150.00</td>
                <td className="text-end">—</td>
                <td className="text-end fw-semibold">GH₵ 300.00</td>
              </tr>
              <tr>
                <td>23 Nov 2026</td>
                <td>Verified Payment (Ref: KMP-20261123-001)</td>
                <td className="text-end">—</td>
                <td className="text-end text-success fw-bold">GH₵ 150.00</td>
                <td className="text-end fw-semibold">GH₵ 150.00</td>
              </tr>
              <tr>
                <td>24 Nov 2026</td>
                <td>Daily Remittance Obligation (Today)</td>
                <td className="text-end text-danger fw-semibold">GH₵ 150.00</td>
                <td className="text-end">—</td>
                <td className="text-end fw-bold" style={{ color: 'var(--danger)' }}>GH₵ 150.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 3: OFFICER PERFORMANCE */}
      {selectedReport === 'officer_performance' && (
        <div className="kmtms-card p-4">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            Transport Officer Collection & Supervisory Performance
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Monitors assigned driver collection rate without confusing expected obligations with actual collections.
          </p>

          <table className="table table-bordered table-sm mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th>Transport Officer</th>
                <th>Branch Depot</th>
                <th className="text-center">Drivers Assigned</th>
                <th className="text-end">Expected Target</th>
                <th className="text-end">Verified Collections</th>
                <th className="text-end">Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => {
                const assignedCount = drivers.filter((d) => d.assignedOfficerId === o.id).length;
                return (
                  <tr key={o.id}>
                    <td className="fw-semibold">{o.fullName}</td>
                    <td>{o.branchId === 'branch-1' ? 'Accra Central' : o.branchId === 'branch-2' ? 'Tema Hub' : 'Kumasi'}</td>
                    <td className="text-center">{assignedCount}</td>
                    <td className="text-end">{formatGHS(assignedCount * 4500)}</td>
                    <td className="text-end fw-bold text-success">{formatGHS(assignedCount * 4100)}</td>
                    <td className="text-end fw-bold text-primary">91.1%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 4: FLEET COMPLIANCE */}
      {selectedReport === 'vehicle_compliance' && (
        <div className="kmtms-card p-4">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            Fleet Statutory Document Expiries & Breakdown Report
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Insurance and roadworthiness certificates requiring renewal attention.
          </p>

          <table className="table table-bordered table-sm mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th>Registration</th>
                <th>Type & Make</th>
                <th>Current Status</th>
                <th>Insurance Expiry</th>
                <th>Roadworthiness Expiry</th>
                <th>Compliance State</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const isUrgent = new Date(v.roadworthinessExpiryDate).getTime() < new Date().getTime() + 15 * 86400000;
                return (
                  <tr key={v.id}>
                    <td className="fw-bold">{v.registrationNumber}</td>
                    <td>{v.make} {v.model} ({v.type})</td>
                    <td>
                      <span className={`badge-kmtms-${v.status === 'assigned' ? 'success' : v.status === 'under_breakdown' ? 'danger' : 'info'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>{formatDate(v.insuranceExpiryDate)}</td>
                    <td className={isUrgent ? 'text-danger fw-bold' : ''}>
                      {formatDate(v.roadworthinessExpiryDate)}
                    </td>
                    <td>
                      {isUrgent ? (
                        <span className="badge bg-danger">Expiring in 7 Days</span>
                      ) : (
                        <span className="badge bg-success">Valid & Compliant</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 5: REGIONAL BRANCH SUMMARY */}
      {selectedReport === 'branch_summary' && (
        <div className="kmtms-card p-4">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            Regional Branch Performance Comparison
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Consolidated comparison of collections, fleet allocations and arrears across depots.
          </p>

          <table className="table table-bordered table-sm mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th>Branch</th>
                <th className="text-center">Drivers</th>
                <th className="text-center">Vehicles</th>
                <th className="text-end">Verified Collections</th>
                <th className="text-end">Outstanding Arrears</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => {
                const bDrivers = drivers.filter((d) => d.branchId === b.id);
                const bVehs = vehicles.filter((v) => v.branchId === b.id);
                const bPays = payments.filter((p) => p.branchId === b.id && p.status === 'verified');
                return (
                  <tr key={b.id}>
                    <td className="fw-bold">{b.name}</td>
                    <td className="text-center">{bDrivers.length}</td>
                    <td className="text-center">{bVehs.length}</td>
                    <td className="text-end fw-bold text-success">
                      {formatGHS(bPays.reduce((s, p) => s + p.amount, 0))}
                    </td>
                    <td className="text-end fw-bold text-danger">
                      {formatGHS(bDrivers.reduce((s, d) => s + d.currentOutstandingBalance, 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
