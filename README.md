# KM Transport — Enterprise Administrator Portal

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

The **Enterprise Administrator Web Portal** for the **KM Transport Management System (KMTMS)**. This portal provides centralized operational oversight, financial remittance reconciliation, fleet vehicle inventory management, and system administration across the Greater Accra transit network.

---

## 🚀 Key Modules & Capabilities

### 1. Operations & Fleet Administration
- **Driver Management**: Register, activate, review compliance records, and manage commercial drivers.
- **Transport Officer Supervision**: Assign operational territories, field routes, and driver quotas to field officers.
- **Vehicle Fleet Inventory**: Track vehicle health, roadworthiness certificates, inspection schedules, and route assignments.
- **Branch Management**: Configure depot locations, regional offices, and operational hubs.
- **Vehicle Assignments**: Match verified drivers to fleet vehicles with strict one-to-one operational validation.
- **Suspension & Recovery Requests**: Review and authorize officer requests for vehicle recovery or route suspensions.

### 2. Finance, Audit & Remittance Reconciliation
- **Payment Approvals**: Audit Mobile Money transactions and verify driver/officer proxy submissions.
- **Daily Remittance Obligations**: Monitor real-time settlement cycles (GH₵ 150.00/day standard rate) and overdue arrears.
- **Automated Gateway Reconciliation**: Cross-check system ledgers against telco statements (MTN MobileMoney, Telecel Cash).
- **Official Receipts Generation**: Issue verifiable digital receipts for all approved payments.

### 3. System Administration & Security
- **Role-Based Access Control (RBAC)**: Manage granular permissions for Super Admins, Branch Managers, and Finance Auditors.
- **Immutable Audit Logs**: Chronological trace of all financial approvals, vehicle assignments, and rate modifications.
- **System Configuration**: Adjust daily rates, grace period cut-offs (6:00 PM deadline / 10:00 AM grace), and telecom gateway credentials.

---

## 🎨 Visual Identity & Brand Guidelines

- **Primary Anchor**: Deep Executive Navy (`#0B2545` / `#071A31`)
- **Action & Accent**: Vibrant Fleet Orange (`#F26522` / `#FF8533`)
- **Branding Asset**: Full Horizontal Landscape Logo (`public/branding/km-horizontal-logo.png`) prominently displayed in the sidebar header and enterprise login screen.

---

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 5
- **UI & Grid**: Bootstrap 5 + Custom Design Tokens (`design-tokens.css`)
- **Icons**: Lucide React
- **Analytics & Charts**: Recharts
- **Routing**: React Router DOM v6

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/paajoe51/KM_Transport-admin.git
cd KM_Transport-admin

# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev
```

### Production Build
```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔐 Default Demo Access

- **Role**: Administrator (Super Admin)
- **Persona**: Michael Abordzi
- **Default Phone**: `+233 24 100 2000`
- **Default PIN**: `1234`
- **Portal Landing**: `http://localhost:3000/admin/dashboard`

---

## 📦 Repository Information

- **GitHub Repository**: [https://github.com/paajoe51/KM_Transport-admin.git](https://github.com/paajoe51/KM_Transport-admin.git)
- **Deployment Branch**: `main`
- **Owner**: KM Transport Company Limited
