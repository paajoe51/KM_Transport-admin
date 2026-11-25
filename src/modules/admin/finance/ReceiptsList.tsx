import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { Receipt } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { formatGHS, formatDate, formatDateTime } from '../../../utils/formatters';
import { FileText, Printer, Download, Eye, CheckCircle2 } from 'lucide-react';

export const ReceiptsList: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>(mockService.getReceipts());
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<Receipt>[] = [
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
            Official Payment Receipts
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            System-generated official receipts for every verified remittance transaction.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search receipts by receipt #, driver or vehicle..."
        searchKey={(r) => `${r.receiptNumber} ${r.driverName} ${r.vehicleRegistration}`}
      />

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Remittance Receipt #${selectedReceipt.receiptNumber}`}
          maxWidth="640px"
        >
          <div id="printable-receipt" className="p-4 bg-white border rounded">
            {/* Header */}
            <div className="text-center pb-3 border-bottom mb-3">
              <img src="/km-logo.svg" alt="KM Company LTD" width="54" height="54" className="mb-2" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#163A63', margin: 0 }}>
                KM COMPANY LIMITED
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Transport Operations & Remittance Management
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Accra Central Head Office, Graphic Road, South Industrial Area, Accra
              </div>
              <div className="badge bg-success mt-2">
                OFFICIAL PAYMENT RECEIPT — VERIFIED
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="row g-2 mb-3" style={{ fontSize: '0.825rem' }}>
              <div className="col-6">
                <div><strong>Receipt No:</strong> {selectedReceipt.receiptNumber}</div>
                <div><strong>Payment Date:</strong> {formatDateTime(selectedReceipt.paymentDate)}</div>
                <div><strong>Branch:</strong> {selectedReceipt.branchName}</div>
              </div>
              <div className="col-6 text-end">
                <div><strong>System Ref:</strong> {selectedReceipt.paymentReference}</div>
                <div><strong>Telco Ref:</strong> {selectedReceipt.transactionReference}</div>
                <div><strong>Method:</strong> {selectedReceipt.method}</div>
              </div>
            </div>

            {/* Driver & Vehicle Box */}
            <div className="p-3 bg-light rounded mb-3 border" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Driver Name:</span>
                <strong>{selectedReceipt.driverName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Registered Phone:</span>
                <span>{selectedReceipt.driverPhone}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Vehicle Registration:</span>
                <strong style={{ color: '#163A63' }}>{selectedReceipt.vehicleRegistration}</strong>
              </div>
            </div>

            {/* Obligations Covered Table */}
            <div className="mb-3">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                Obligations Settled:
              </div>
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

            {/* Balance Remaining & Verification */}
            <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded border mb-3" style={{ fontSize: '0.825rem' }}>
              <span>Remaining Outstanding Balance:</span>
              <strong style={{ color: selectedReceipt.remainingBalance > 0 ? '#DC2626' : '#16A34A' }}>
                {formatGHS(selectedReceipt.remainingBalance)}
              </strong>
            </div>

            <div className="text-center text-muted" style={{ fontSize: '0.7rem' }}>
              Verified By: <strong>{selectedReceipt.verifiedBy}</strong><br />
              This is a computer-generated financial receipt issued under KM Transport Management System v1.0.
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
    </div>
  );
};
