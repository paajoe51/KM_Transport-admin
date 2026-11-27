import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Payment } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { DollarSign, CheckCircle2, XCircle, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

export const ProxyPaymentApprovals: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockService.getPayments());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Physical cash receipt deposit not verified by depot cashier');

  const { showToast } = useToast();

  const proxyQueue = payments.filter(
    (p) => p.status === 'pending_verification' && p.method === 'proxy'
  );

  const handleApprove = () => {
    if (!selectedPayment) return;
    const ok = mockService.verifyPayment(selectedPayment.id, 'Michael Abordzi (Admin)');
    if (ok) {
      setPayments(mockService.getPayments());
      setIsApproveOpen(false);
      setSelectedPayment(null);
      showToast('success', 'Proxy Payment Approved', `Payment of ${formatGHS(selectedPayment.amount)} credited to ${selectedPayment.driverName}.`);
    }
  };

  const handleReject = () => {
    if (!selectedPayment) return;
    const ok = mockService.rejectPayment(selectedPayment.id, rejectionReason, 'Michael Abordzi (Admin)');
    if (ok) {
      setPayments(mockService.getPayments());
      setIsRejectOpen(false);
      setSelectedPayment(null);
      showToast('error', 'Proxy Payment Rejected', `Reason: ${rejectionReason}`);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Proxy Payment Approval Queue
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Officer-collected physical cash payments requiring Administrator verification before ledger credit.
          </p>
        </div>
      </div>

      {/* Segregation of Duties Warning */}
      <div className="alert alert-info d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
        <ShieldAlert size={20} className="flex-shrink-0" />
        <div>
          <strong>Segregation of Duties Enforcement:</strong> Transport Officers cannot approve their own proxy payment recordings. All physical collections must be confirmed by an Administrator.
        </div>
      </div>

      {proxyQueue.length === 0 ? (
        <div className="kmtms-card p-5 text-center">
          <CheckCircle2 size={48} color="var(--success)" className="mx-auto mb-3" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>
            No Pending Proxy Payments
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            All Transport Officer proxy submissions have been verified and processed.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {proxyQueue.map((item) => (
            <div key={item.id} className="col-12 col-lg-6">
              <div className="kmtms-card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge-kmtms-info mb-1">OFFICER PROXY CASH</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                        {item.driverName}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Vehicle: {item.vehicleRegistration} • Recorded {formatDate(item.submittedAt)}
                      </div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Collected Amount</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        {formatGHS(item.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-light rounded border mb-3" style={{ fontSize: '0.8rem' }}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Submitting Officer:</span>
                      <strong>{item.submittingOfficerName || 'Transport Officer'}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Proxy Ref:</span>
                      <code>{item.reference}</code>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Cash Receipt Slip:</span>
                      <span>{item.transactionReference}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <em>"{item.notes}"</em>
                    </div>
                  )}

                  {item.evidenceUrl && (
                    <div className="mb-3">
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                        Deposit / Cash Receipt Voucher:
                      </div>
                      <img
                        src={item.evidenceUrl}
                        alt="Proxy Evidence"
                        className="img-fluid rounded border"
                        style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2 pt-2 border-top">
                  <button
                    onClick={() => {
                      setSelectedPayment(item);
                      setIsRejectOpen(true);
                    }}
                    className="btn btn-sm btn-outline-danger flex-1"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPayment(item);
                      setIsApproveOpen(true);
                    }}
                    className="btn-kmtms-primary btn-sm flex-1"
                  >
                    <CheckCircle2 size={14} /> Approve & Credit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {selectedPayment && (
        <Modal
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
          title="Approve Proxy Cash Payment"
        >
          <div className="mb-3">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Confirm that cash amounting to <strong className="text-success">{formatGHS(selectedPayment.amount)}</strong> collected by <strong>{selectedPayment.submittingOfficerName}</strong> has been received by KM Transport accounting.
            </p>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsApproveOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button onClick={handleApprove} className="btn-kmtms-teal">
              Confirm & Issue Official Receipt
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {selectedPayment && (
        <Modal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          title="Reject Proxy Payment"
        >
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Reason for Rejection *
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsRejectOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button onClick={handleReject} className="btn btn-danger">
              Reject
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
