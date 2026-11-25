import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { SuspensionRequest } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { AlertOctagon, CheckCircle2, XCircle, Eye, Calendar, UserCheck } from 'lucide-react';

export const SuspensionManagement: React.FC = () => {
  const [suspensions, setSuspensions] = useState<SuspensionRequest[]>(mockService.getSuspensions());
  const [selectedReq, setSelectedReq] = useState<SuspensionRequest | null>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('Approved per submitted medical excuse notice');
  const [approvedStart, setApprovedStart] = useState('');
  const [approvedEnd, setApprovedEnd] = useState('');

  const { showToast } = useToast();

  const handleOpenDecision = (req: SuspensionRequest, type: 'approve' | 'reject') => {
    setSelectedReq(req);
    setDecisionType(type);
    setApprovedStart(req.requestedStartDate);
    setApprovedEnd(req.requestedEndDate);
    setComments(
      type === 'approve'
        ? 'Approved based on verified medical documentation'
        : 'Insufficient documentation provided by officer'
    );
    setIsDecisionOpen(true);
  };

  const handleExecuteDecision = () => {
    if (!selectedReq) return;
    const isApproved = decisionType === 'approve';
    const ok = mockService.reviewSuspension(
      selectedReq.id,
      isApproved,
      comments,
      approvedStart,
      approvedEnd,
      'Michael Abordzi (Admin)'
    );

    if (ok) {
      setSuspensions(mockService.getSuspensions());
      setIsDecisionOpen(false);
      setSelectedReq(null);
      showToast(
        isApproved ? 'success' : 'info',
        isApproved ? 'Suspension Approved' : 'Suspension Rejected',
        `Request for ${selectedReq.driverName} has been ${isApproved ? 'approved' : 'rejected'}.`
      );
    }
  };

  const columns: Column<SuspensionRequest>[] = [
    {
      header: 'Driver',
      accessor: (row) => (
        <div>
          <div className="fw-bold" style={{ color: 'var(--primary)' }}>
            {row.driverName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Officer: {row.officerName}
          </div>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => <span className="fw-semibold">{row.reason}</span>,
    },
    {
      header: 'Requested Duration',
      accessor: (row) => (
        <span style={{ fontSize: '0.8rem' }}>
          {formatDate(row.requestedStartDate)} → {formatDate(row.requestedEndDate)}
        </span>
      ),
    },
    {
      header: 'Explanation',
      accessor: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {row.explanation.length > 50 ? row.explanation.slice(0, 50) + '...' : row.explanation}
        </span>
      ),
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
              Decided by {row.reviewedBy?.split(' ')[0]}
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
            Driver Suspension Requests
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Officer-submitted requests for temporary remittance relief. Only approved periods exclude obligations; prior arrears remain intact.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={suspensions}
        keyExtractor={(s) => s.id}
        searchPlaceholder="Search suspension requests..."
        searchKey={(s) => `${s.driverName} ${s.officerName} ${s.reason}`}
      />

      {/* Decision Modal */}
      {selectedReq && (
        <Modal
          isOpen={isDecisionOpen}
          onClose={() => setIsDecisionOpen(false)}
          title={`${decisionType === 'approve' ? 'Approve' : 'Reject'} Suspension: ${selectedReq.driverName}`}
        >
          <div className="mb-3">
            <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.85rem' }}>
              <div>Driver: <strong>{selectedReq.driverName}</strong></div>
              <div>Reason: <strong>{selectedReq.reason}</strong></div>
              <div>Requested: {formatDate(selectedReq.requestedStartDate)} to {formatDate(selectedReq.requestedEndDate)}</div>
              <div className="text-secondary mt-1"><em>"{selectedReq.explanation}"</em></div>
            </div>

            {decisionType === 'approve' && (
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Approved Start Date *
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={approvedStart}
                    onChange={(e) => setApprovedStart(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Approved End Date *
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={approvedEnd}
                    onChange={(e) => setApprovedEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Administrative Decision Comments *
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
