import React, { useState, useMemo } from 'react';
import { mockService } from '../../../services/mockService';
import { RemittanceObligation } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { formatGHS, formatDate } from '../../../utils/formatters';
import {
  CalendarCheck,
  Sliders,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertOctagon,
} from 'lucide-react';

export const RemittanceObligations: React.FC = () => {
  const [obligations] = useState<RemittanceObligation[]>(mockService.getObligations());
  const [activeTab, setActiveTab] = useState<'obligations' | 'reconciliation'>('obligations');

  // Obligations Monitor State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedObligation, setSelectedObligation] = useState<RemittanceObligation | null>(null);

  // Reconciliation State
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-24');

  const branches = mockService.getBranches();
  const payments = mockService.getPayments();
  const drivers = mockService.getDrivers();

  const filteredObligations = useMemo(() => {
    if (statusFilter === 'all') return obligations;
    return obligations.filter((o) => o.status === statusFilter);
  }, [obligations, statusFilter]);

  // Reconciliation calculations
  const branchPayments = useMemo(() => {
    if (selectedBranch === 'all') return payments;
    return payments.filter((p) => p.branchId === selectedBranch);
  }, [payments, selectedBranch]);

  const verifiedAutoPayments = branchPayments
    .filter((p) => p.status === 'verified' && p.method === 'momo_auto')
    .reduce((sum, p) => sum + p.amount, 0);

  const verifiedManualPayments = branchPayments
    .filter((p) => p.status === 'verified' && p.method === 'momo_manual')
    .reduce((sum, p) => sum + p.amount, 0);

  const verifiedProxyPayments = branchPayments
    .filter((p) => p.status === 'verified' && p.method === 'proxy')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalVerifiedCollections = verifiedAutoPayments + verifiedManualPayments + verifiedProxyPayments;

  const pendingVerificationTotal = branchPayments
    .filter((p) => p.status === 'pending_verification')
    .reduce((sum, p) => sum + p.amount, 0);

  const reversedTotal = branchPayments
    .filter((p) => p.status === 'reversed')
    .reduce((sum, p) => sum + p.amount, 0);

  const netCollections = totalVerifiedCollections - reversedTotal;

  const totalOutstanding = drivers
    .filter((d) => selectedBranch === 'all' || d.branchId === selectedBranch)
    .reduce((sum, d) => sum + d.currentOutstandingBalance, 0);

  const obligationColumns: Column<RemittanceObligation>[] = [
    {
      header: 'Driver & Vehicle',
      accessor: (row) => (
        <div>
          <div className="fw-bold" style={{ color: 'var(--primary)' }}>
            {row.driverName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Reg: <code>{row.vehicleRegistration}</code>
          </div>
        </div>
      ),
    },
    {
      header: 'Obligation Period',
      accessor: (row) => <span className="fw-semibold">{row.periodName}</span>,
    },
    {
      header: 'Expected Amount',
      accessor: (row) => <span className="fw-bold">{formatGHS(row.amount)}</span>,
    },
    {
      header: 'Payment Deadline',
      accessor: (row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <div>Due: {formatDate(row.dueDate)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Grace: {formatDate(row.gracePeriodDeadline)}
          </div>
        </div>
      ),
    },
    {
      header: 'Allocated Payment',
      accessor: (row) => (
        <span className="text-success fw-bold">{formatGHS(row.allocatedAmount)}</span>
      ),
    },
    {
      header: 'Current Balance',
      accessor: (row) => (
        <span
          className="fw-bold"
          style={{ color: row.balance > 0 ? 'var(--danger)' : 'var(--success)' }}
        >
          {formatGHS(row.balance)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`badge-kmtms-${
            row.status === 'settled'
              ? 'success'
              : row.status === 'overdue'
              ? 'danger'
              : row.status === 'due'
              ? 'warning'
              : row.status === 'suspended'
              ? 'info'
              : 'neutral'
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (row) => (
        <button
          onClick={() => setSelectedObligation(row)}
          className="btn btn-sm btn-outline-secondary"
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        >
          <Eye size={12} /> View
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Remittance Obligations & Reconciliation
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Monitor contractual remittance accruals, carry-forward balances, and daily ledger reconciliation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          onClick={() => setActiveTab('obligations')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'obligations' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'obligations' ? 700 : 500,
            color: activeTab === 'obligations' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CalendarCheck size={16} />
          <span>Obligations Monitor ({obligations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'reconciliation' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'reconciliation' ? 700 : 500,
            color: activeTab === 'reconciliation' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sliders size={16} />
          <span>Daily Reconciliation Ledger</span>
        </button>
      </div>

      {/* TAB 1: OBLIGATIONS MONITOR */}
      {activeTab === 'obligations' && (
        <div>
          <div className="kmtms-card p-3 mb-4">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Filter Status:
              </span>
              {[
                { id: 'all', label: 'All Obligations' },
                { id: 'due', label: 'Due Today' },
                { id: 'overdue', label: 'Overdue Arrears' },
                { id: 'settled', label: 'Settled' },
                { id: 'suspended', label: 'Suspended (Approved)' },
                { id: 'upcoming', label: 'Upcoming' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStatusFilter(item.id)}
                  className="btn btn-sm"
                  style={{
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    backgroundColor: statusFilter === item.id ? 'var(--primary)' : 'var(--surface-alt)',
                    color: statusFilter === item.id ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    fontWeight: statusFilter === item.id ? 600 : 500,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={obligationColumns}
            data={filteredObligations}
            keyExtractor={(o) => o.id}
            searchPlaceholder="Search obligations by driver or vehicle..."
            searchKey={(o) => `${o.driverName} ${o.vehicleRegistration} ${o.periodName}`}
          />
        </div>
      )}

      {/* TAB 2: DAILY RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div>
          <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={{ width: 'auto', fontWeight: 600 }}
              >
                <option value="all">Company-wide (All Branches)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="form-control form-control-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: 'auto' }}
              />
            </div>
          </div>

          {/* Reconciliation Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="kmtms-card p-3 border-start border-4 border-success">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  GROSS VERIFIED COLLECTIONS
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>
                  {formatGHS(totalVerifiedCollections)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Credited to company account
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="kmtms-card p-3 border-start border-4 border-warning">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  PENDING VERIFICATION
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {formatGHS(pendingVerificationTotal)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Manual submissions under audit
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="kmtms-card p-3 border-start border-4 border-primary">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  NET VERIFIED REVENUE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatGHS(netCollections)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  After reversals & adjustments
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="kmtms-card">
            <div className="kmtms-card-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Daily Financial Position Ledger (Accra Business Day)
              </span>
              <span className="badge bg-light text-muted border">Africa/Accra (GMT+0)</span>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-striped mb-0" style={{ fontSize: '0.85rem' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '70%' }}>
                      <strong>1. Automated Gateway Collections (MoMo-Auto via Paystack/Hubtel)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Instantly verified via authenticated webhook callbacks.
                      </div>
                    </td>
                    <td className="text-end fw-bold text-success">{formatGHS(verifiedAutoPayments)}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>2. Verified Manual MoMo Transfers</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Confirmed against official receiving statement (MTN 0241002000).
                      </div>
                    </td>
                    <td className="text-end fw-bold text-success">{formatGHS(verifiedManualPayments)}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>3. Verified Officer Proxy Cash Collections</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Physical cash deposited and verified by depot accounting.
                      </div>
                    </td>
                    <td className="text-end fw-bold text-success">{formatGHS(verifiedProxyPayments)}</td>
                  </tr>

                  <tr className="table-success fw-bold">
                    <td>TOTAL VERIFIED INFLOWS (A)</td>
                    <td className="text-end" style={{ fontSize: '1rem' }}>{formatGHS(totalVerifiedCollections)}</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>Less: Reversals & Duplicate Corrections (B)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Traceable administrative ledger adjustments.
                      </div>
                    </td>
                    <td className="text-end fw-bold text-danger">- {formatGHS(reversedTotal)}</td>
                  </tr>

                  <tr className="table-primary fw-bold">
                    <td>NET VERIFIED SETTLED COLLECTIONS (A - B)</td>
                    <td className="text-end" style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                      {formatGHS(netCollections)}
                    </td>
                  </tr>

                  <tr className="table-light">
                    <td>
                      <strong>Off-Ledger: Unverified Driver Submissions (Pending Audit)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Cannot be counted as company revenue until verified.
                      </div>
                    </td>
                    <td className="text-end fw-bold text-warning">{formatGHS(pendingVerificationTotal)}</td>
                  </tr>

                  <tr className="table-light">
                    <td>
                      <strong>Current Total Outstanding Driver Arrears</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Cumulative unpaid obligations across active fleet.
                      </div>
                    </td>
                    <td className="text-end fw-bold text-danger">{formatGHS(totalOutstanding)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Obligation Details Modal */}
      {selectedObligation && (
        <Modal
          isOpen={!!selectedObligation}
          onClose={() => setSelectedObligation(null)}
          title={`Obligation Breakdown: ${selectedObligation.periodName}`}
        >
          <div className="p-3 bg-light rounded mb-3 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Assigned Driver:</span>
              <span className="fw-bold">{selectedObligation.driverName}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Vehicle Registration:</span>
              <code>{selectedObligation.vehicleRegistration}</code>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Period Due Date:</span>
              <span>{formatDate(selectedObligation.dueDate)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Grace Period Deadline:</span>
              <span>{formatDate(selectedObligation.gracePeriodDeadline)}</span>
            </div>
          </div>

          <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
            <tbody>
              <tr>
                <td className="text-muted">Contractual Amount Due:</td>
                <td className="text-end fw-bold">{formatGHS(selectedObligation.amount)}</td>
              </tr>
              <tr>
                <td className="text-muted">Verified Payment Allocated:</td>
                <td className="text-end text-success fw-bold">
                  - {formatGHS(selectedObligation.allocatedAmount)}
                </td>
              </tr>
              <tr className="border-top">
                <td className="fw-bold">Remaining Unpaid Balance:</td>
                <td
                  className="text-end fw-bold"
                  style={{ color: selectedObligation.balance > 0 ? 'var(--danger)' : 'var(--success)' }}
                >
                  {formatGHS(selectedObligation.balance)}
                </td>
              </tr>
            </tbody>
          </table>

          {selectedObligation.status === 'suspended' && (
            <div className="alert alert-info py-2" style={{ fontSize: '0.8rem' }}>
              ℹ️ This obligation has been excluded under an approved suspension rule. No arrears carry forward for this specific period.
            </div>
          )}

          <div className="d-flex justify-content-end mt-3">
            <button onClick={() => setSelectedObligation(null)} className="btn-kmtms-secondary">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
