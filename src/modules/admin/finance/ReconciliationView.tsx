import React, { useState, useMemo } from 'react';
import { mockService } from '../../../services/mockService';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { Sliders, Calendar, CheckCircle2, Clock, XCircle, AlertOctagon, RotateCcw } from 'lucide-react';

export const ReconciliationView: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-24');

  const branches = mockService.getBranches();
  const payments = mockService.getPayments();
  const obligations = mockService.getObligations();
  const drivers = mockService.getDrivers();

  // Filter payments by branch
  const branchPayments = useMemo(() => {
    if (selectedBranch === 'all') return payments;
    return payments.filter((p) => p.branchId === selectedBranch);
  }, [payments, selectedBranch]);

  // Reconciliation calculations
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

  const rejectedTotal = branchPayments
    .filter((p) => p.status === 'rejected')
    .reduce((sum, p) => sum + p.amount, 0);

  const reversedTotal = branchPayments
    .filter((p) => p.status === 'reversed')
    .reduce((sum, p) => sum + p.amount, 0);

  const netCollections = totalVerifiedCollections - reversedTotal;

  const totalOutstanding = drivers
    .filter((d) => selectedBranch === 'all' || d.branchId === selectedBranch)
    .reduce((sum, d) => sum + d.currentOutstandingBalance, 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Daily Remittance & Collections Reconciliation
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Daily financial ledger balancing. Reconciles verified bank/telco inflows against contractual obligations.
          </p>
        </div>

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

      {/* Accounting Notice */}
      <div className="alert alert-info py-2 mb-4" style={{ fontSize: '0.825rem' }}>
        <strong>Financial Integrity Standard:</strong> Unverified submissions (GH₵{pendingVerificationTotal.toFixed(2)}) are explicitly excluded from actual collections. Balances adjust only upon authorized verification.
      </div>

      {/* Reconciliation Summary Cards */}
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

      {/* Comprehensive Ledger Table */}
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
  );
};
