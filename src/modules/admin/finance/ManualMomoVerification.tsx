import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Payment } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate, formatDateTime } from '../../../utils/formatters';
import { CheckSquare, CheckCircle2, XCircle, AlertTriangle, Eye, ShieldCheck, ExternalLink } from 'lucide-react';

export const ManualMomoVerification: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockService.getPayments());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Transaction reference not found in company receiving statement');

  const { showToast } = useToast();
  const drivers = mockService.getDrivers();

  // Pending manual MoMo queue
  const pendingQueue = payments.filter(
    (p) => p.status === 'pending_verification' && p.method === 'momo_manual'
  );

  const handleApprove = () => {
    if (!selectedPayment) return;
    const ok = mockService.verifyPayment(selectedPayment.id, 'Michael Abordzi (Admin)');
    if (ok) {
      setPayments(mockService.getPayments());
      setIsApproveOpen(false);
      setSelectedPayment(null);
      showToast(
        'success',
        'Payment Verified & Credited',
        `Payment ${selectedPayment.reference} of ${formatGHS(selectedPayment.amount)} is now verified.`
      );
    }
  };

  const handleReject = () => {
    if (!selectedPayment) return;
    const ok = mockService.rejectPayment(selectedPayment.id, rejectionReason, 'Michael Abordzi (Admin)');
    if (ok) {
      setPayments(mockService.getPayments());
      setIsRejectOpen(false);
      setSelectedPayment(null);
      showToast('error', 'Submission Rejected', `Driver notified with reason: ${rejectionReason}`);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Manual MoMo Verification Queue
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Compare driver-submitted MoMo evidence and references against official company receiving account statements.
          </p>
        </div>
      </div>

      {/* Mandatory Verification Warning Banner */}
      <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
        <AlertTriangle size={20} className="flex-shrink-0" />
        <div>
          <strong>Financial Verification Requirement (SRD 12.5):</strong> A screenshot alone is NOT proof of receipt. Administrators must cross-reference the Telco MoMo transaction ID against the official KM Company receiving account statement (<strong>MTN 024 100 2000</strong>) before crediting.
        </div>
      </div>

      {pendingQueue.length === 0 ? (
        <div className="kmtms-card p-5 text-center">
          <CheckCircle2 size={48} color="var(--success)" className="mx-auto mb-3" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>
            Verification Queue Clear
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            All manual MoMo driver submissions have been verified or addressed.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {pendingQueue.map((item) => {
            const driver = drivers.find((d) => d.id === item.driverId);
            return (
              <div key={item.id} className="col-12 col-lg-6">
                <div className="kmtms-card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge-kmtms-warning mb-1">AWAITING ADMIN AUDIT</span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                          {item.driverName}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Vehicle: {item.vehicleRegistration} • Submitted {formatDate(item.submittedAt)}
                        </div>
                      </div>
                      <div className="text-end">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Claimed Amount</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatGHS(item.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-light rounded border mb-3" style={{ fontSize: '0.8rem' }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Telco Transaction ID:</span>
                        <code>{item.transactionReference}</code>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Internal System Ref:</span>
                        <span>{item.reference}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Driver Outstanding:</span>
                        <span className="text-danger fw-bold">{formatGHS(driver?.currentOutstandingBalance)}</span>
                      </div>
                    </div>

                    {item.evidenceUrl && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Submitted Screenshot Proof:</span>
                          <a
                            href={item.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-decoration-none"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Open Full <ExternalLink size={12} />
                          </a>
                        </div>
                        <img
                          src={item.evidenceUrl}
                          alt="Evidence"
                          className="img-fluid rounded border"
                          style={{ maxHeight: '160px', width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    {item.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <em>"{item.notes}"</em>
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
                      <XCircle size={14} /> Reject with Reason
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayment(item);
                        setIsApproveOpen(true);
                      }}
                      className="btn-kmtms-primary btn-sm flex-1"
                    >
                      <CheckCircle2 size={14} /> Verify & Credit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal - Approve */}
      {selectedPayment && (
        <Modal
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
          title="Confirm Payment Verification"
        >
          <div className="mb-3">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to verify and credit this transaction?
            </p>
            <div className="p-3 bg-light rounded border" style={{ fontSize: '0.85rem' }}>
              <div>Driver: <strong>{selectedPayment.driverName}</strong></div>
              <div>Amount to Credit: <strong className="text-success">{formatGHS(selectedPayment.amount)}</strong></div>
              <div>Transaction ID: <code>{selectedPayment.transactionReference}</code></div>
            </div>
            <p className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              ✓ This will allocate payment to oldest outstanding obligations (FIFO).<br />
              ✓ An official payment receipt will be generated automatically.
            </p>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsApproveOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button onClick={handleApprove} className="btn-kmtms-teal">
              Yes, Confirm & Issue Receipt
            </button>
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {selectedPayment && (
        <Modal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          title="Reject Manual MoMo Submission"
        >
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Mandatory Rejection Reason *
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State clear reason why this submission could not be verified..."
              required
            />
            <small className="text-muted" style={{ fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>
              The driver will receive an automated notification with this explanation to resubmit correct details.
            </small>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsRejectOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button onClick={handleReject} className="btn btn-danger">
              Reject Submission
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
