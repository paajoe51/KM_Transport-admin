import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { BreakdownRequest } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { Wrench, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export const BreakdownManagement: React.FC = () => {
  const [breakdowns, setBreakdowns] = useState<BreakdownRequest[]>(mockService.getBreakdowns());
  const [selectedReq, setSelectedReq] = useState<BreakdownRequest | null>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('Approved by Fleet Manager; parts ordered from authorized dealer');
  const [approvedEnd, setApprovedEnd] = useState('');

  const { showToast } = useToast();

  const handleOpenDecision = (req: BreakdownRequest, type: 'approve' | 'reject') => {
    setSelectedReq(req);
    setDecisionType(type);
    setApprovedEnd(req.expectedRepairDate);
    setComments(
      type === 'approve'
        ? 'Confirmed by fleet mechanical supervisor at depot'
        : 'Inspection did not reveal mechanical defect requiring downtime'
    );
    setIsDecisionOpen(true);
  };

  const handleExecuteDecision = () => {
    if (!selectedReq) return;
    const isApproved = decisionType === 'approve';
    const ok = mockService.reviewBreakdown(
      selectedReq.id,
      isApproved,
      comments,
      selectedReq.breakdownDate,
      approvedEnd,
      'Michael Abordzi (Admin)'
    );

    if (ok) {
      setBreakdowns(mockService.getBreakdowns());
      setIsDecisionOpen(false);
      setSelectedReq(null);
      showToast(
        isApproved ? 'success' : 'info',
        isApproved ? 'Breakdown Approved' : 'Breakdown Rejected',
        `Vehicle ${selectedReq.vehicleRegistration} status updated.`
      );
    }
  };

  const columns: Column<BreakdownRequest>[] = [
    {
      header: 'Vehicle & Driver',
      accessor: (row) => (
        <div>
          <div className="fw-bold" style={{ color: 'var(--primary)' }}>
            {row.vehicleRegistration}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Driver: {row.driverName}
          </div>
        </div>
      ),
    },
    {
      header: 'Breakdown Date',
      accessor: (row) => <span style={{ fontSize: '0.8rem' }}>{formatDate(row.breakdownDate)}</span>,
    },
    {
      header: 'Location & Defect',
      accessor: (row) => (
        <div>
          <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>{row.location}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {row.description.length > 55 ? row.description.slice(0, 55) + '...' : row.description}
          </div>
        </div>
      ),
    },
    {
      header: 'Expected Repair',
      accessor: (row) => <span style={{ fontSize: '0.8rem' }}>{formatDate(row.expectedRepairDate)}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`badge-kmtms-${
            row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-1">
          {row.status === 'pending' ? (
            <>
              <button
                onClick={() => handleOpenDecision(row, 'approve')}
                className="btn btn-sm btn-outline-success"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                Approve
              </button>
              <button
                onClick={() => handleOpenDecision(row, 'reject')}
                className="btn btn-sm btn-outline-danger"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                Reject
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Reviewed by {row.reviewedBy?.split(' ')[0]}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Vehicle Breakdown Requests
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Officer-reported mechanical failures. Approved requests pause daily obligations for the verified repair duration.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={breakdowns}
        keyExtractor={(b) => b.id}
        searchPlaceholder="Search breakdown reports..."
        searchKey={(b) => `${b.vehicleRegistration} ${b.driverName} ${b.location} ${b.description}`}
      />

      {/* Decision Modal */}
      {selectedReq && (
        <Modal
          isOpen={isDecisionOpen}
          onClose={() => setIsDecisionOpen(false)}
          title={`${decisionType === 'approve' ? 'Approve' : 'Reject'} Breakdown: ${selectedReq.vehicleRegistration}`}
          maxWidth="640px"
        >
          <div className="mb-3">
            <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
              <div>Vehicle: <strong>{selectedReq.vehicleRegistration}</strong> (Driver: {selectedReq.driverName})</div>
              <div>Reported Location: <strong>{selectedReq.location}</strong></div>
              <div>Defect Description: <em>"{selectedReq.description}"</em></div>
              <div className="mt-1 text-muted">Breakdown Date: {formatDate(selectedReq.breakdownDate)} | Target Repair: {formatDate(selectedReq.expectedRepairDate)}</div>
            </div>

            {selectedReq.photoUrl && (
              <div className="mb-3">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Mechanical Failure Evidence:
                </div>
                <img
                  src={selectedReq.photoUrl}
                  alt="Defect"
                  className="img-fluid rounded border"
                  style={{ maxHeight: '180px', width: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {decisionType === 'approve' && (
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Approved Repair Completion Date *
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={approvedEnd}
                  onChange={(e) => setApprovedEnd(e.target.value)}
                  required
                />
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Daily remittance obligations will be suspended from {formatDate(selectedReq.breakdownDate)} through this date.
                </small>
              </div>
            )}

            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Administrative Notes *
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button onClick={() => setIsDecisionOpen(false)} className="btn-kmtms-secondary">
              Cancel
            </button>
            <button
              onClick={handleExecuteDecision}
              className={`btn btn-${decisionType === 'approve' ? 'success' : 'danger'}`}
            >
              Confirm {decisionType === 'approve' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
