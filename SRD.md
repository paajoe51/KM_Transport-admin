# KM Transport Management System (KMTMS) — Enterprise Administrator Portal
## Software Requirements Specification (SRS) — Administrative & Operations Scope

**Document Version:** 1.0  
**Target Scope:** Central Administration, Fleet Operations & Financial Governance  
**Organization:** KM Company LTD  

---

## 1. Executive Summary & Purpose

This specification governs the **Enterprise Administrator Web Portal** of the KM Transport Management System. The portal serves as the primary command center for company leadership, operational managers, and finance auditors to manage fleet assets, oversee commercial driver performance, enforce strict financial remittance policies, reconcile telecom payment statements, and maintain compliance across all branches.

---

## 2. Administrative Scope & User Roles

### 2.1 Role-Based Access Control (RBAC) Matrix
The portal enforces strict Segregation of Duties (SOD):
- **Super Administrator (`super_admin`)**: Full access across all regional branches, system configuration, audit logs, role management, and global rate policies.
- **Branch Administrator (`branch_admin`)**: Manages drivers, officers, vehicles, and daily operational assignments localized to their assigned branch/depot.
- **Finance Auditor (`finance_auditor`)**: Audit and reconciliation authority for Mobile Money statement matching, manual payment approvals, reversals, and financial ledger exports. Prohibited from modifying vehicle assignments or driver status.

---

## 3. Fleet Asset & Operations Management

### 3.1 Driver Master Register
- **Centralized Profiles**: Name, photo, verified Ghana Card number (masked in general views, unmasked on authorized audit), driving license class, contact details, and emergency contacts.
- **Compliance Status**: Tracks real-time standing:
  - `ACTIVE`: Assigned to an authorized vehicle with settled remittances.
  - `SUSPENDED`: Administrative or disciplinary hold.
  - `OVERDUE_LOCKED`: Automated recovery lock triggered by consecutive unpaid cycles.
- **Document Expiry Tracking**: Automated alert flags for roadworthiness, driver licenses, and insurance renewals.

### 3.2 Vehicle Inventory & Telematics Association
- **Vehicle Profiles**: Registration number (e.g. `GT 4582-24`), chassis number, make/model, passenger capacity (e.g. 15-seater Minibus), and assigned depot.
- **One-to-One Assignment Constraint**: Strict business rule: A vehicle can only have **one** active assigned driver at any given time. Re-assignment requires official unlinking of the previous operator.
- **Maintenance & Breakdown Tracking**: Logs maintenance history, repair tickets, and vehicle downtime.

### 3.3 Branch & Officer Allocation
- Multi-branch hierarchy supporting Greater Accra depot hubs (Accra Central, Kaneshie, Madina, Tema).
- Allocation of Transport Officers to regional operational sectors with driver supervision quotas.

---

## 4. Financial Remittance & Obligation Engine

### 4.1 Daily Remittance Policy
- **Standard Daily Rate**: Fixed at **GH₵ 150.00** per operational day (customizable per vehicle type by Super Admin).
- **Automated Generation**: Background scheduler generates new remittance obligations every night at `00:01 UTC`.
- **Zero Partial Payment Rule**: Drivers and officers must settle the complete outstanding balance. Ledger does not permit partial fractional payments unless authorized via an explicit Administrative Adjustment.
- **Grace Period Cut-offs**:
  - Daily Settlement Cut-off: **6:00 PM**
  - Grace Period Expiration: **10:00 AM the following morning**
  - Arrears Escalation: Obligations unremitted past grace period convert to `OVERDUE` arrears.

---

## 5. Payment Verification & Audit Reconciliation

### 5.1 Verification Channels
1. **Automated Gateway (MoMo - Auto)**:
   - System receives webhook callbacks from telecom aggregators (Paystack/Hubtel).
   - Instant automated clearance upon verified settlement ID.
2. **Manual MoMo Statement Reconciliation (MoMo - Manual)**:
   - Matches driver/officer submitted Telco Transaction IDs against KM Company's bank/MoMo statements (`024 100 2000`).
   - Requires Finance Auditor sign-off before crediting driver obligations.
3. **Pay for Driver (Officer Proxy) Auditing**:
   - Transport Officers recording digital payments on behalf of drivers are audited to maintain strict segregation of duties (officers cannot approve their own submissions).

### 5.2 Receipting & Ledger Integrity
- Every verified payment generates an immutable digital receipt with sequential numbering (`KMR-YYYY-XXXX`).
- Double-entry accounting trail reflecting debits and credits across Fleet Accounts, Suspense Accounts, and Cash Clearing.

---

## 6. Dashboards, Reporting & System Administration

### 6.1 Administrator Command Dashboard
- High-level KPIs: Active Fleet Utilization %, Total Outstanding Arrears, Verified Collections MTD, Pending Audit Approvals.
- Real-time fleet health bar and compliance breakdown.
- Quick navigation to pending transaction approvals and vehicle suspension requests.

### 6.2 Financial & Operational Analytics
- **Collection Efficiency Reports**: Trend charts tracking compliance across branches and officer sectors.
- **Arrears Aging Reports**: Categorization of overdue obligations (1–3 days, 4–7 days, >7 days).
- **Export Formats**: PDF official statement generation and CSV/Excel raw financial data export.

### 6.3 Audit Trail & Activity Logs
- Comprehensive tracking of every sensitive action:
  - User ID, Timestamp, IP Address, Action Type, Target Record, Before/After Payload.
  - Audit logs are read-only and immutable.

---

## 7. Technical Architecture & Backend Endpoints

### 7.1 Key Administrative Endpoints
- `GET /api/v1/admin/dashboard/summary`: High-level fleet & remittance metrics.
- `GET /api/v1/admin/drivers`: Paginated driver list with filters (status, officer, branch).
- `POST /api/v1/admin/drivers`: Register new commercial driver.
- `GET /api/v1/admin/vehicles`: Vehicle inventory register and assignments.
- `POST /api/v1/admin/assignments`: Bind verified driver to available vehicle.
- `GET /api/v1/admin/finance/approvals`: Transactions pending manual statement verification.
- `POST /api/v1/admin/finance/approve`: Authorize and credit pending payment.
- `POST /api/v1/admin/finance/reject`: Reject payment submission with mandatory reason code.
- `GET /api/v1/admin/audit-logs`: Immutable system activity logs.

---
*End of Administrative Specification — KM Company LTD.*
