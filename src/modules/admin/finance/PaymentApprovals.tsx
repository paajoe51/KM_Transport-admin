import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Payment } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate } from '../../../utils/formatters';
import {
  CheckSquare,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

export const PaymentApprovals: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockService.getPayments());
  const [activeTab, setActiveTab] = useState<'momo' | 'proxy'>('momo');

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    'Transaction reference not found in company receiving statement'
  );

  const { showToast } = useToast();
  const drivers = mockService.getDrivers();

  const momoQueue = payments.filter(
    (p) => p.status === 'pending_verification' && p.method === 'momo_manual'
  );
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
      showToast(
        'success',
        'Payment Verified & Credited',
        `Payment ${selectedPayment.reference} of ${formatGHS(selectedPayment.amount)} is now verified.`
      );
    }
  };

  const handleReject = () => {
    if (!selectedPayment) return;
    const ok = mockService.rejectPayment(
      selectedPayment.id,
      rejectionReason,
      'Michael Abordzi (Admin)'
    );
    if (ok) {
      setPayments(mockService.getPayments());
      setIsRejectOpen(false);
      setSelectedPayment(null);
      showToast(
        'error',
        'Submission Rejected',
        `Driver notified with reason: ${rejectionReason}`
      );
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Payment Approvals & Verifications
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Unified audit queue for manual direct MoMo transfers and officer proxy cash collections.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          onClick={() => setActiveTab('momo')}
          className="btn btn-sm pb-2 position-relative"
          style={{
            border: 'none',
            borderBottom: activeTab === 'momo' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'momo' ? 700 : 500,
            color: activeTab === 'momo' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckSquare size={16} />
          <span>Manual MoMo Transfers</span>
          {momoQueue.length > 0 && (
            <span
              className="badge rounded-pill bg-warning text-dark"
              style={{ fontSize: '0.68rem', padding: '2px 7px' }}
            >
              {momoQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('proxy')}
          className="btn btn-sm pb-2 position-relative"
          style={{
            border: 'none',
            borderBottom: activeTab === 'proxy' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'proxy' ? 700 : 500,
            color: activeTab === 'proxy' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <DollarSign size={16} />
          <span>Officer Proxy Payments</span>
          {proxyQueue.length > 0 && (
            <span
              className="badge rounded-pill bg-info text-white"
              style={{ fontSize: '0.68rem', padding: '2px 7px' }}
            >
              {proxyQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MANUAL MOMO VERIFICATION */}
      {activeTab === 'momo' && (
        <div>
          <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div>
              <strong>Financial Verification Requirement (SRD 12.5):</strong> A screenshot alone is NOT proof of receipt. Cross-reference the Telco MoMo transaction ID against official receiving statements (<strong>MTN 024 100 2000</strong>) before crediting.
            </div>
          </div>

          {momoQueue.length === 0 ? (
            <div className="kmtms-card p-5 text-center">
              <CheckCircle2 size={48} color="var(--success)" className="mx-auto mb-3" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>
                Manual MoMo Queue Clear
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                All driver-submitted manual MoMo transfers have been verified or rejected.
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {momoQueue.map((item) => {
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
                            setRejectionReason('Transaction reference not found in company receiving statement');
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
                          <CheckCircle2 size={14} /> Verify & Credit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OFFICER PROXY PAYMENT APPROVALS */}
      {activeTab === 'proxy' && (
        <div>
          <div className="alert alert-info d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
            <ShieldAlert size={20} className="flex-shrink-0" />
            <div>
              <strong>Segregation of Duties Enforcement (SRD 12.7):</strong> Transport Officers cannot approve their own proxy collections. All physical cash collections recorded by officers require Administrator verification before crediting.
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
                          setRejectionReason(
                            'Physical cash receipt deposit not verified by depot cashier'
                          );
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
              <div>Transaction ID / Ref: <code>{selectedPayment.transactionReference}</code></div>
              <div>Method: <strong>{selectedPayment.method}</strong></div>
            </div>
            <p className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              ✓ Payment will be allocated to oldest outstanding obligations (FIFO).<br />
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
          title="Reject Payment Submission"
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
              required
            />
            <small className="text-muted" style={{ fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>
              The submitter will receive an automated notification with this explanation.
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
