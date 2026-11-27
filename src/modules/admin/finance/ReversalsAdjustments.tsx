import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Payment } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { RotateCcw, AlertTriangle, ShieldCheck, History } from 'lucide-react';

export const ReversalsAdjustments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockService.getPayments());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState('Duplicate telco provider credit callback detected');

  const { showToast } = useToast();

  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const reversedPayments = payments.filter((p) => p.status === 'reversed');

  const handleOpenReverse = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleExecuteReversal = () => {
    if (!selectedPayment) return;
    const ok = mockService.reversePayment(
      selectedPayment.id,
      reversalReason,
      'Michael Abordzi (Admin)'
    );

    if (ok) {
      setPayments(mockService.getPayments());
      setIsModalOpen(false);
      setSelectedPayment(null);
      showToast(
        'warning',
        'Payment Reversed',
        `Payment ${selectedPayment.reference} reversed. Driver balance restored.`
      );
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Payment Reversals & Ledger Adjustments
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Strict audit-controlled reversal of verified payments. Physical deletion of financial transactions is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
        <AlertTriangle size={20} className="flex-shrink-0" />
        <div>
          <strong>Financial Audit Rule:</strong> Verified payments cannot be permanently deleted. Reversals restore driver obligations to unpaid status, recalculate balances, and preserve an immutable audit trail with justification.
        </div>
      </div>

      {/* Verified Payments Available for Correction */}
      <div className="kmtms-card mb-4">
        <div className="kmtms-card-header">
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            Eligible Verified Transactions for Adjustment
          </span>
          <span className="badge bg-light text-dark border">
            {verifiedPayments.length} Active Verified Records
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
                      onClick={() => handleOpenReverse(p)}
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

      {/* Historical Reversals Log */}
      <div className="kmtms-card">
        <div className="kmtms-card-header">
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Historical Reversal Trail</span>
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
            {reversedPayments.length} Reversed Record(s)
          </span>
        </div>

        <div className="table-responsive">
          <table className="kmtms-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Driver</th>
                <th>Amount</th>
                <th>Reason & Ledger Audit Notes</th>
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

      {/* Reversal Confirmation Modal */}
      {selectedPayment && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Execute Payment Reversal: ${selectedPayment.reference}`}
        >
          <div className="mb-3">
            <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
              <div>Driver: <strong>{selectedPayment.driverName}</strong></div>
              <div>Amount to Reverse: <strong className="text-danger">{formatGHS(selectedPayment.amount)}</strong></div>
              <div>Transaction Reference: <code>{selectedPayment.transactionReference}</code></div>
            </div>

            <div className="alert alert-warning py-2" style={{ fontSize: '0.78rem' }}>
              ⚠️ Reversing this transaction will restore the covered obligations to an <strong>Unpaid / Outstanding</strong> status and increase the driver's current balance by {formatGHS(selectedPayment.amount)}.
            </div>

            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Mandatory Reversal Justification *
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="Provide explicit operational or audit reason for reversing this payment..."
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="btn-kmtms-secondary">
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
