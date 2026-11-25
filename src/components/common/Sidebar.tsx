import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Truck,
  Building2,
  CalendarCheck,
  CreditCard,
  CheckSquare,
  AlertOctagon,
  BarChart3,
  ShieldCheck,
  Settings,
  History,
  Briefcase,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Drivers', path: '/admin/drivers', icon: <Users size={18} /> },
        { label: 'Transport Officers', path: '/admin/officers', icon: <UserCheck size={18} /> },
        { label: 'Vehicles', path: '/admin/vehicles', icon: <Truck size={18} /> },
        { label: 'Branches', path: '/admin/branches', icon: <Building2 size={18} /> },
        { label: 'Assignments', path: '/admin/assignments', icon: <Briefcase size={18} /> },
        { label: 'Suspension Requests', path: '/admin/suspensions', icon: <AlertOctagon size={18} /> },
      ],
    },
    {
      title: 'FINANCE & REMITTANCE',
      items: [
        { label: 'Payment Approvals', path: '/admin/approvals', icon: <CheckSquare size={18} /> },
        { label: 'Payments & Collections', path: '/admin/payments', icon: <CreditCard size={18} /> },
        { label: 'Obligations & Reconciliation', path: '/admin/obligations', icon: <CalendarCheck size={18} /> },
      ],
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { label: 'Reports & Analytics', path: '/admin/reports', icon: <BarChart3 size={18} /> },
      ],
    },
    {
      title: 'SYSTEM ADMINISTRATION',
      items: [
        { label: 'Roles & Permissions', path: '/admin/permissions', icon: <ShieldCheck size={18} /> },
        { label: 'System Config', path: '/admin/config', icon: <Settings size={18} /> },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: <History size={18} /> },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--primary)',
        color: '#FFFFFF',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 1030,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {collapsed ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src="/branding/kmt-badge-logo.png"
              alt="KMT"
              style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }}
            />
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src="/branding/km-horizontal-logo.png"
              alt="KM Transport"
              style={{ height: '32px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '1.25rem' }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  letterSpacing: '0.06em',
                  padding: '4px 12px 6px',
                }}
              >
                {section.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.825rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  })}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.7rem',
            color: '#94A3B8',
          }}
        >
          <div>KM Company LTD © 2026</div>
          <div>Africa/Accra (GMT+0)</div>
        </div>
      )}
    </aside>
  );
};
