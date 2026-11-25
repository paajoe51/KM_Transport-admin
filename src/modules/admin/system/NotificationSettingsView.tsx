import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { NotificationSettings, AppNotification } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { Bell, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

export const NotificationSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(mockService.getNotificationSettings());
  const [notifications] = useState<AppNotification[]>(mockService.getNotifications());
  const { showToast } = useToast();

  const [senderId, setSenderId] = useState(settings.smsSenderId);
  const [smsEnabled, setSmsEnabled] = useState(settings.smsEnabled);
  const [deadlineHours, setDeadlineHours] = useState(String(settings.reminderBeforeDeadlineHours));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = mockService.updateNotificationSettings({
      smsSenderId: senderId,
      smsEnabled,
      reminderBeforeDeadlineHours: parseInt(deadlineHours) || 2,
    });
    setSettings(updated);
    showToast('success', 'Settings Saved', 'SMS and dispatch notification preferences updated.');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Notification & SMS Dispatch Settings
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Configure SMS sender profiles, automated reminder intervals and review notification logs.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Settings Form */}
        <div className="col-12 col-lg-6">
          <div className="kmtms-card p-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Automated Reminders & SMS Configuration
            </h3>

            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Approved Telco SMS Sender ID *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  maxLength={11}
                  required
                />
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Registered with National Communications Authority (Ghana). Maximum 11 alphanumeric characters.
                </small>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="smsSwitch"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="smsSwitch" style={{ fontSize: '0.85rem' }}>
                    Enable SMS Notifications to Drivers & Officers
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Pre-Deadline Reminder Dispatch (Hours Before 6:00 PM Due Time)
                </label>
                <select
                  className="form-select"
                  value={deadlineHours}
                  onChange={(e) => setDeadlineHours(e.target.value)}
                >
                  <option value="1">1 Hour Prior (5:00 PM)</option>
                  <option value="2">2 Hours Prior (4:00 PM - Default)</option>
                  <option value="4">4 Hours Prior (2:00 PM)</option>
                </select>
              </div>

              <button type="submit" className="btn-kmtms-primary">
                Save Notification Rules
              </button>
            </form>
          </div>
        </div>

        {/* Message Logs */}
        <div className="col-12 col-lg-6">
          <div className="kmtms-card p-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Recent Notification Audit Log
            </h3>

            <div className="list-group" style={{ fontSize: '0.8rem' }}>
              {notifications.map((n) => (
                <div key={n.id} className="list-group-item p-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark">{n.title}</span>
                    <span className="badge bg-light text-muted border">{formatDate(n.createdAt)}</span>
                  </div>
                  <div className="text-secondary">{n.message}</div>
                  <div className="mt-1 d-flex align-items-center gap-1 text-success" style={{ fontSize: '0.72rem' }}>
                    <CheckCircle2 size={12} /> Delivered successfully
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
