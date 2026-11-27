import React, { useState, useMemo } from 'react';
import { mockService } from '../../../services/mockService';
import { Payment, Receipt } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate, formatDateTime } from '../../../utils/formatters';
import {
  CreditCard,
  FileText,
  RotateCcw,
  Eye,
  Printer,
  AlertTriangle,
  History,
} from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockService.getPayments());
  const [receipts] = useState<Receipt[]>(mockService.getReceipts());
  const [activeTab, setActiveTab] = useState<'transactions' | 'receipts' | 'reversals'>('transactions');

  // Filters for Transactions
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Transaction Detail Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Reversal Modal
  const [reversalTarget, setReversalTarget] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState('Duplicate telco provider credit callback detected');
  const [isReversalOpen, setIsReversalOpen] = useState(false);

  const { showToast } = useToast();

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchMethod && matchStatus;
    });
  }, [payments, methodFilter, statusFilter]);

  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const reversedPayments = payments.filter((p) => p.status === 'reversed');

  const handleExecuteReversal = () => {
    if (!reversalTarget) return;
    const ok = mockService.reversePayment(
      reversalTarget.id,
      reversalReason,
      'Michael Abordzi (Admin)'
    );

    if (ok) {
      setPayments(mockService.getPayments());
      setIsReversalOpen(false);
      setReversalTarget(null);
      showToast(
        'warning',
        'Payment Reversed',
        `Payment ${reversalTarget.reference} reversed. Driver balance restored.`
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Columns: Transactions
  const transactionColumns: Column<Payment>[] = [
    {
      header: 'Internal Reference',
      accessor: (row) => (
        <div>
          <div className="fw-bold" style={{ color: 'var(--primary)' }}>
            {row.reference}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            TxID: <code>{row.transactionReference}</code>
          </div>
        </div>
      ),
    },
    {
      header: 'Driver & Vehicle',
      accessor: (row) => (
        <div>
          <div className="fw-semibold">{row.driverName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Reg: {row.vehicleRegistration}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => <span className="fw-bold">{formatGHS(row.amount)}</span>,
    },
    {
      header: 'Method',
      accessor: (row) => (
        <span className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
          {row.method === 'momo_auto'
            ? 'MoMo (Auto)'
            : row.method === 'momo_manual'
            ? 'MoMo (Manual)'
            : 'Proxy Cash'}
        </span>
      ),
    },
    {
      header: 'Submitted',
      accessor: (row) => (
        <div style={{ fontSize: '0.75rem' }}>
          <div>{formatDate(row.submittedAt)}</div>
          <div style={{ color: 'var(--text-muted)' }}>
            By: {row.submittingOfficerName || 'Driver'}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`badge-kmtms-${
            row.status === 'verified'
              ? 'success'
              : row.status === 'rejected'
              ? 'danger'
              : 'warning'
          }`}
        >
          {row.status.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button
            onClick={() => setSelectedPayment(row)}
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            <Eye size={12} /> Dossier
          </button>
          {row.receiptNumber && (
            <button
              onClick={() => {
                const r = mockService.getReceiptByNumber(row.receiptNumber!);
                if (r) setSelectedReceipt(r);
              }}
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              title="View Receipt"
            >
              <FileText size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Columns: Receipts
  const receiptColumns: Column<Receipt>[] = [
    {
      header: 'Receipt #',
      accessor: (row) => (
        <span className="fw-bold" style={{ color: 'var(--primary)' }}>
          {row.receiptNumber}
        </span>
      ),
    },
    {
      header: 'Driver & Vehicle',
      accessor: (row) => (
        <div>
          <div className="fw-semibold">{row.driverName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Reg: {row.vehicleRegistration} • {row.driverPhone}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount Paid',
      accessor: (row) => <span className="fw-bold text-success">{formatGHS(row.amount)}</span>,
    },
    {
      header: 'Payment Date',
      accessor: (row) => <span style={{ fontSize: '0.8rem' }}>{formatDateTime(row.paymentDate)}</span>,
    },
    {
      header: 'Branch',
      accessor: (row) => <span style={{ fontSize: '0.8rem' }}>{row.branchName}</span>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => setSelectedReceipt(row)}
          className="btn btn-sm btn-outline-primary"
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        >
          <Eye size={12} /> View Official Receipt
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Payments & Collections Hub
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Central ledger for verified inflows, official receipts, and audit-controlled adjustments.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          onClick={() => setActiveTab('transactions')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'transactions' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'transactions' ? 700 : 500,
            color: activeTab === 'transactions' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CreditCard size={16} />
          <span>Transactions Ledger ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'receipts' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'receipts' ? 700 : 500,
            color: activeTab === 'receipts' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={16} />
          <span>Official Receipts ({receipts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reversals')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'reversals' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'reversals' ? 700 : 500,
            color: activeTab === 'reversals' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RotateCcw size={16} />
          <span>Reversals & Adjustments</span>
          {reversedPayments.length > 0 && (
            <span
              className="badge rounded-pill bg-danger-subtle text-danger"
              style={{ fontSize: '0.68rem', padding: '2px 7px' }}
            >
              {reversedPayments.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TRANSACTIONS LEDGER */}
      {activeTab === 'transactions' && (
        <div>
          <div className="kmtms-card p-3 mb-4">
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Payment Channel:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                >
                  <option value="all">All Channels</option>
                  <option value="momo_auto">Automated Gateway (Paystack/Hubtel)</option>
                  <option value="momo_manual">Manual Direct MoMo Transfer</option>
                  <option value="proxy">Officer Proxy Cash Collection</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Status:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="rejected">Rejected</option>
                  <option value="reversed">Reversed</option>
                </select>
              </div>

              <div className="col-12 col-md-4 d-flex align-items-end">
                <button
                  onClick={() => {
                    setMethodFilter('all');
                    setStatusFilter('all');
                  }}
                  className="btn btn-sm btn-outline-secondary w-100"
                  style={{ height: '31px', fontSize: '0.78rem' }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <DataTable
            columns={transactionColumns}
            data={filteredPayments}
            keyExtractor={(p) => p.id}
            searchPlaceholder="Search payment by reference, driver, or vehicle..."
            searchKey={(p) => `${p.reference} ${p.transactionReference} ${p.driverName} ${p.vehicleRegistration}`}
          />
        </div>
      )}

      {/* TAB 2: OFFICIAL RECEIPTS */}
      {activeTab === 'receipts' && (
        <div>
          <DataTable
            columns={receiptColumns}
            data={receipts}
            keyExtractor={(r) => r.id}
            searchPlaceholder="Search receipts by receipt #, driver or vehicle..."
            searchKey={(r) => `${r.receiptNumber} ${r.driverName} ${r.vehicleRegistration}`}
          />
        </div>
      )}

      {/* TAB 3: REVERSALS & ADJUSTMENTS */}
      {activeTab === 'reversals' && (
        <div>
          {/* Active Verified Transactions */}
          <div className="kmtms-card mb-4">
            <div className="kmtms-card-header">
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Active Verified Transactions Eligible for Adjustment
              </span>
              <span className="badge bg-light text-dark border">
                {verifiedPayments.length} Active Records
              </span>
            </div>

            <div className="table-responsive">
              <table className="kmtms-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Driver</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Verified Date</th>
                    <th>Verified By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.reference}</td>
                      <td>{p.driverName}</td>
                      <td className="fw-bold text-success">{formatGHS(p.amount)}</td>
                      <td>{p.method}</td>
                      <td>{formatDate(p.verifiedAt)}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.verifiedBy}</td>
                      <td>
                        <button
                          onClick={() => {
                            setReversalTarget(p);
                            setIsReversalOpen(true);
                          }}
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        >
                          <RotateCcw size={12} /> Reverse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Reversals */}
          <div className="kmtms-card">
            <div className="kmtms-card-header">
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Historical Reversal Trail</span>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                {reversedPayments.length} Record(s)
              </span>
            </div>

            <div className="table-responsive">
              <table className="kmtms-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Driver</th>
                    <th>Amount</th>
                    <th>Reason & Audit Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reversedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4" style={{ fontSize: '0.85rem' }}>
                        No transactions have been reversed. Financial ledger remains fully consistent.
                      </td>
                    </tr>
                  ) : (
                    reversedPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">{p.reference}</td>
                        <td>{p.driverName}</td>
                        <td className="fw-bold text-danger">{formatGHS(p.amount)}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.notes}</td>
                        <td>
                          <span className="badge-kmtms-danger">REVERSED</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Dossier Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Transaction Audit: ${selectedPayment.reference}`}
          maxWidth="640px"
        >
          <div className="p-3 bg-light rounded mb-3 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Claimed Amount:</span>
              <span className="fw-bold" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                {formatGHS(selectedPayment.amount)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Verification State:</span>
              <span
                className={`badge-kmtms-${
                  selectedPayment.status === 'verified'
                    ? 'success'
                    : selectedPayment.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {selectedPayment.status.toUpperCase()}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Payment Method:</span>
              <strong>{selectedPayment.method}</strong>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Provider Reference:</span>
              <code>{selectedPayment.transactionReference}</code>
            </div>
          </div>

          {selectedPayment.evidenceUrl && (
            <div className="mb-3">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Uploaded Evidence / Proof:
              </div>
              <img
                src={selectedPayment.evidenceUrl}
                alt="Evidence"
                className="img-fluid rounded border shadow-sm"
                style={{ maxHeight: '220px', width: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {selectedPayment.obligationsCovered.length > 0 && (
            <div className="mb-3">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Allocated Contractual Obligations (FIFO Settlement):
              </div>
              <div className="list-group" style={{ fontSize: '0.8rem' }}>
                {selectedPayment.obligationsCovered.map((alloc, idx) => (
                  <div key={idx} className="list-group-item d-flex justify-content-between">
                    <span>{alloc.periodName}</span>
                    <strong className="text-success">{formatGHS(alloc.amountAllocated)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end">
            <button onClick={() => setSelectedPayment(null)} className="btn-kmtms-secondary">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Remittance Receipt #${selectedReceipt.receiptNumber}`}
          maxWidth="640px"
        >
          <div id="printable-receipt" className="p-4 bg-white border rounded">
            <div className="text-center pb-3 border-bottom mb-3">
              <img src="/km-logo.svg" alt="KM Company LTD" width="54" height="54" className="mb-2" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163A63', margin: 0 }}>
                KM COMPANY LIMITED
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Transport Operations & Remittance Management
              </div>
              <span className="badge bg-success mt-2">
                OFFICIAL PAYMENT RECEIPT — VERIFIED
              </span>
            </div>

            <div className="row g-2 mb-3" style={{ fontSize: '0.825rem' }}>
              <div className="col-6">
                <div><strong>Receipt No:</strong> {selectedReceipt.receiptNumber}</div>
                <div><strong>Date:</strong> {formatDateTime(selectedReceipt.paymentDate)}</div>
                <div><strong>Branch:</strong> {selectedReceipt.branchName}</div>
              </div>
              <div className="col-6 text-end">
                <div><strong>System Ref:</strong> {selectedReceipt.paymentReference}</div>
                <div><strong>Telco Ref:</strong> {selectedReceipt.transactionReference}</div>
                <div><strong>Method:</strong> {selectedReceipt.method}</div>
              </div>
            </div>

            <div className="p-3 bg-light rounded mb-3 border" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Driver:</span>
                <strong>{selectedReceipt.driverName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Vehicle:</span>
                <strong style={{ color: '#163A63' }}>{selectedReceipt.vehicleRegistration}</strong>
              </div>
            </div>

            <div className="mb-3">
              <table className="table table-sm table-bordered" style={{ fontSize: '0.8rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Obligation Period</th>
                    <th className="text-end">Amount Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.obligationsCovered.map((alloc, idx) => (
                    <tr key={idx}>
                      <td>{alloc.periodName}</td>
                      <td className="text-end fw-semibold">{formatGHS(alloc.amountAllocated)}</td>
                    </tr>
                  ))}
                  <tr className="table-light">
                    <td className="fw-bold">TOTAL AMOUNT RECEIVED</td>
                    <td className="text-end fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                      {formatGHS(selectedReceipt.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded border mb-3" style={{ fontSize: '0.825rem' }}>
              <span>Remaining Outstanding Balance:</span>
              <strong style={{ color: selectedReceipt.remainingBalance > 0 ? '#DC2626' : '#16A34A' }}>
                {formatGHS(selectedReceipt.remainingBalance)}
              </strong>
            </div>

            <div className="text-center text-muted" style={{ fontSize: '0.7rem' }}>
              Verified By: <strong>{selectedReceipt.verifiedBy}</strong><br />
              Computer-generated financial receipt under KM Transport Management System v1.0.
            </div>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button onClick={handlePrint} className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2">
              <Printer size={14} /> Print Receipt
            </button>
            <button onClick={() => setSelectedReceipt(null)} className="btn-kmtms-secondary btn-sm">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Reversal Confirmation Modal */}
      {reversalTarget && (
        <Modal
          isOpen={isReversalOpen}
          onClose={() => setIsReversalOpen(false)}
          title={`Execute Payment Reversal: ${reversalTarget.reference}`}
        >
          <div className="mb-3">
            <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
              <div>Driver: <strong>{reversalTarget.driverName}</strong></div>
              <div>Amount to Reverse: <strong className="text-danger">{formatGHS(reversalTarget.amount)}</strong></div>
              <div>Reference: <code>{reversalTarget.transactionReference}</code></div>
            </div>

            <div className="alert alert-warning py-2" style={{ fontSize: '0.78rem' }}>
              ⚠️ Reversing this transaction will restore the covered obligations to an <strong>Unpaid / Outstanding</strong> status and increase the driver's current balance by {formatGHS(reversalTarget.amount)}.
            </div>

            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Mandatory Reversal Justification *
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="State explicit operational or audit reason for reversing this payment..."
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsReversalOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button onClick={handleExecuteReversal} className="btn btn-danger">
              Confirm & Execute Reversal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
