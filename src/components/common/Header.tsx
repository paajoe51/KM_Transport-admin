import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockService } from '../../services/mockService';
import { Bell, Menu, Search, LogOut, CheckCheck, ExternalLink, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

interface HeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  logoType?: 'horizontal' | 'badge' | 'auto';
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  showSearch = true,
  logoType = 'auto',
}) => {
  const { currentUser, logout, activeRole } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const effectiveLogoType =
    logoType === 'auto'
      ? activeRole === 'driver'
        ? 'badge'
        : 'horizontal'
      : logoType;

  const notifications = currentUser ? mockService.getNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      mockService.markAllNotificationsAsRead(currentUser.id);
      setShowNotifications(false);
    }
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn btn-link text-dark p-1 d-flex align-items-center"
            style={{ textDecoration: 'none' }}
            aria-label="Toggle Navigation"
          >
            <Menu size={22} color="var(--primary)" />
          </button>
        )}

        <div className="d-flex align-items-center gap-2">
          {effectiveLogoType === 'badge' ? (
            <img
              src="/branding/kmt-badge-logo.png"
              alt="KMT"
              style={{ height: '34px', width: '34px', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            />
          ) : (
            <img
              src="/branding/km-horizontal-logo.png"
              alt="KM Transport"
              style={{ height: '32px', maxWidth: '160px', objectFit: 'contain' }}
            />
          )}

          {title && (
            <>
              <div
                style={{
                  height: '20px',
                  width: '1px',
                  backgroundColor: 'var(--border)',
                  margin: '0 4px',
                }}
              />
              <div>
                <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--primary)' }}>
                  {title}
                </h2>
                {subtitle && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                    {subtitle}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="d-none d-md-flex align-items-center" style={{ flex: '0 1 360px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search drivers, vehicles, references..."
              className="form-control form-control-sm"
              style={{
                paddingLeft: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-link p-1 position-relative"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              className="kmtms-card shadow-lg"
              style={{
                position: 'absolute',
                top: '120%',
                right: '0',
                width: '340px',
                maxHeight: '420px',
                overflowY: 'auto',
                zIndex: 1050,
                padding: '0',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="btn btn-link p-0"
                    style={{ fontSize: '0.75rem', textDecoration: 'none', color: 'var(--primary)' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        mockService.markNotificationAsRead(n.id);
                        setShowNotifications(false);
                        if (n.link) navigate(n.link);
                      }}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.read ? 'transparent' : 'var(--primary-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {formatDate(n.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px',
              cursor: 'pointer',
            }}
          >
            <img
              src={
                currentUser?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
              }
              alt="Avatar"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border)',
              }}
            />
            <div className="d-none d-sm-block text-start">
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentUser?.fullName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentUser?.role.toUpperCase()}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="kmtms-card shadow-lg"
              style={{
                position: 'absolute',
                top: '120%',
                right: '0',
                width: '210px',
                zIndex: 1050,
                padding: '6px 0',
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentUser?.fullName}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser?.phone}</div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="btn btn-link text-danger w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
                style={{ fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
