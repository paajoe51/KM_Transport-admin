import React, { useState, useMemo } from 'react';
import { mockService } from '../../../services/mockService';
import { AuditLog } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { formatDateTime } from '../../../utils/formatters';
import { History, Shield, Eye, Lock } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs] = useState<AuditLog[]>(mockService.getAuditLogs());
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {formatDateTime(row.timestamp)}
        </span>
      ),
    },
    {
      header: 'Actor & Role',
      accessor: (row) => (
        <div>
          <div className="fw-bold" style={{ color: 'var(--primary)' }}>
            {row.userName}
          </div>
          <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
            {row.userRole.toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <code className="fw-bold" style={{ color: 'var(--info)' }}>
          {row.action}
        </code>
      ),
    },
    {
      header: 'Entity Target',
      accessor: (row) => (
        <span style={{ fontSize: '0.8rem' }}>
          {row.entityType} ({row.entityId})
        </span>
      ),
    },
    {
      header: 'Audit Reason / Justification',
      accessor: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {row.reason}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (row) => (
        <button
          onClick={() => setSelectedLog(row)}
          className="btn btn-sm btn-outline-secondary"
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        >
          <Eye size={12} /> Trail
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            System Audit Trail & Compliance Log
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Append-only, immutable activity log of all sensitive operational, payment and assignment actions.
          </p>
        </div>

        <div className="badge bg-dark d-flex align-items-center gap-1 p-2">
          <Lock size={14} /> Immutable Audit Vault
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search audit log by actor, action, or entity..."
        searchKey={(l) => `${l.userName} ${l.action} ${l.entityType} ${l.reason}`}
      />

      {/* Audit Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.id}`}
        >
          <div className="p-3 bg-light rounded border mb-3" style={{ fontSize: '0.825rem' }}>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Actor:</span>
              <strong>{selectedLog.userName} ({selectedLog.userRole})</strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Timestamp:</span>
              <span>{formatDateTime(selectedLog.timestamp)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Action:</span>
              <code>{selectedLog.action}</code>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Target Entity:</span>
              <span>{selectedLog.entityType} #{selectedLog.entityId}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Client IP:</span>
              <code>{selectedLog.ipAddress}</code>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Client Agent:</span>
              <span style={{ fontSize: '0.72rem' }}>{selectedLog.userAgent}</span>
            </div>
          </div>

          <div className="mb-3">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Before & After Ledger State</h4>
            <div className="p-2 border rounded mb-2 bg-white" style={{ fontSize: '0.8rem' }}>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>PREVIOUS VALUE:</div>
              <div>{selectedLog.previousValue || 'None'}</div>
            </div>
            <div className="p-2 border rounded bg-white" style={{ fontSize: '0.8rem' }}>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>NEW COMMITTED VALUE:</div>
              <div className="text-success fw-semibold">{selectedLog.newValue || 'None'}</div>
            </div>
          </div>

          <div className="p-2 bg-light rounded text-muted mb-3" style={{ fontSize: '0.78rem' }}>
            <strong>Mandatory Justification:</strong> {selectedLog.reason}
          </div>

          <div className="d-flex justify-content-end">
            <button onClick={() => setSelectedLog(null)} className="btn-kmtms-secondary">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
