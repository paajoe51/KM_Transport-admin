import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout/AdminLayout';

// Auth Modules
import { Login } from '../modules/authentication/Login';
import { AccountActivation } from '../modules/authentication/AccountActivation';
import { ForgotPin } from '../modules/authentication/ForgotPin';

// Admin Modules
import { AdminDashboard } from '../modules/admin/dashboard/AdminDashboard';
import { BranchManagement } from '../modules/admin/branches/BranchManagement';
import { DriverManagement } from '../modules/admin/drivers/DriverManagement';
import { OfficerManagement } from '../modules/admin/officers/OfficerManagement';
import { VehicleManagement } from '../modules/admin/vehicles/VehicleManagement';
import { AssignmentsManagement } from '../modules/admin/assignments/AssignmentsManagement';
import { SuspensionManagement } from '../modules/admin/requests/SuspensionManagement';
import { PaymentApprovals } from '../modules/admin/finance/PaymentApprovals';
import { PaymentManagement } from '../modules/admin/finance/PaymentManagement';
import { RemittanceObligations } from '../modules/admin/finance/RemittanceObligations';
import { ReportsAnalytics } from '../modules/admin/reports/ReportsAnalytics';
import { UserPermissionsView } from '../modules/admin/system/UserPermissions';
import { SystemConfigView } from '../modules/admin/system/SystemConfigView';
import { AuditLogsView } from '../modules/admin/system/AuditLogsView';

export const router = createBrowserRouter([
  // Default Redirect
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />,
  },

  // Auth Routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/activate',
    element: <AccountActivation />,
  },
  {
    path: '/forgot-pin',
    element: <ForgotPin />,
  },

  // Administrator Portal
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'drivers', element: <DriverManagement /> },
      { path: 'officers', element: <OfficerManagement /> },
      { path: 'vehicles', element: <VehicleManagement /> },
      { path: 'branches', element: <BranchManagement /> },
      { path: 'assignments', element: <AssignmentsManagement /> },
      { path: 'suspensions', element: <SuspensionManagement /> },
      { path: 'approvals', element: <PaymentApprovals /> },
      { path: 'payments', element: <PaymentManagement /> },
      { path: 'obligations', element: <RemittanceObligations /> },
      { path: 'reports', element: <ReportsAnalytics /> },
      { path: 'permissions', element: <UserPermissionsView /> },
      { path: 'config', element: <SystemConfigView /> },
      { path: 'audit-logs', element: <AuditLogsView /> },

      // Consolidated redirects
      { path: 'momo-verification', element: <Navigate to="/admin/approvals" replace /> },
      { path: 'proxy-approvals', element: <Navigate to="/admin/approvals" replace /> },
      { path: 'receipts', element: <Navigate to="/admin/payments" replace /> },
      { path: 'reconciliation', element: <Navigate to="/admin/obligations" replace /> },
      { path: 'reversals', element: <Navigate to="/admin/payments" replace /> },
      { path: 'breakdowns', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'notifications', element: <Navigate to="/admin/config" replace /> },
      { path: 'gateway-settings', element: <Navigate to="/admin/config" replace /> },
      { path: 'settings', element: <Navigate to="/admin/config" replace /> },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/admin/dashboard" replace />,
  },
]);
