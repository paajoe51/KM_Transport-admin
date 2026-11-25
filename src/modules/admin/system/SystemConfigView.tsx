import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { GatewayConfig, NotificationSettings, AppNotification } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import {
  Settings,
  CreditCard,
  Bell,
  Building2,
  RefreshCw,
  CheckCircle2,
  Globe,
  Sliders,
  Send,
} from 'lucide-react';

export const SystemConfigView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'gateway' | 'notifications'>('general');
  const { showToast } = useToast();

  // General Settings State
  const [companyName, setCompanyName] = useState('KM COMPANY LIMITED');
  const [currency] = useState('GHS (Ghana Cedi)');
  const [timezone] = useState('Africa/Accra (GMT+0)');
  const [headOfficeAddress, setHeadOfficeAddress] = useState(
    'Plot 14, Graphic Road, South Industrial Area, Accra'
  );
  const [supportPhone, setSupportPhone] = useState('+233 30 223 4567');

  // Gateway Settings State
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(mockService.getGatewayConfig());
  const [provider, setProvider] = useState(gatewayConfig.provider);
  const [environment, setEnvironment] = useState(gatewayConfig.environment);
  const [momoNumber, setMomoNumber] = useState(gatewayConfig.momoReceivingNumber);
  const [accountName, setAccountName] = useState(gatewayConfig.momoAccountName);
  const [isTestingGateway, setIsTestingGateway] = useState(false);

  // Notification Settings State
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(
    mockService.getNotificationSettings()
  );
  const [notifications] = useState<AppNotification[]>(mockService.getNotifications());
  const [senderId, setSenderId] = useState(notifSettings.smsSenderId);
  const [smsEnabled, setSmsEnabled] = useState(notifSettings.smsEnabled);
  const [deadlineHours, setDeadlineHours] = useState(
    String(notifSettings.reminderBeforeDeadlineHours)
  );

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'General Settings Saved', 'Company parameters updated.');
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = mockService.updateGatewayConfig({
      provider,
      environment,
      momoReceivingNumber: momoNumber,
      momoAccountName: accountName,
    });
    setGatewayConfig(updated);
    showToast('success', 'Gateway Updated', 'Payment gateway configuration saved.');
  };

  const handleTestGateway = () => {
    setIsTestingGateway(true);
    setTimeout(() => {
      setIsTestingGateway(false);
      showToast(
        'success',
        'Gateway Test 200 OK',
        'Successfully pinged payment gateway webhook listener.'
      );
    }, 700);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = mockService.updateNotificationSettings({
      smsSenderId: senderId,
      smsEnabled,
      reminderBeforeDeadlineHours: parseInt(deadlineHours) || 2,
    });
    setNotifSettings(updated);
    showToast('success', 'Notification Rules Saved', 'SMS and dispatch rules updated.');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            System Configuration
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Unified administrative controls for company organization, payment gateway, and SMS notifications.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          onClick={() => setActiveTab('general')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'general' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'general' ? 700 : 500,
            color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building2 size={16} />
          <span>General Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('gateway')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'gateway' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'gateway' ? 700 : 500,
            color: activeTab === 'gateway' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CreditCard size={16} />
          <span>Payment Gateway & MoMo</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className="btn btn-sm pb-2"
          style={{
            border: 'none',
            borderBottom: activeTab === 'notifications' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'notifications' ? 700 : 500,
            color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Bell size={16} />
          <span>Notifications & SMS Dispatch</span>
        </button>
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="kmtms-card p-4" style={{ maxWidth: '780px' }}>
          <form onSubmit={handleSaveGeneral}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
              Company Legal Entity & Defaults
            </h3>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Company Name (Legal Registered Entity)
              </label>
              <input
                type="text"
                className="form-control"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Corporate Head Office Address
              </label>
              <input
                type="text"
                className="form-control"
                value={headOfficeAddress}
                onChange={(e) => setHeadOfficeAddress(e.target.value)}
                required
              />
            </div>

            <div className="row g-2 mb-4">
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Corporate Support Phone
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  System Operating Timezone (SRD 10.4)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={timezone}
                  readOnly
                  style={{ backgroundColor: 'var(--surface-alt)' }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 1rem', color: 'var(--primary)' }}>
              Financial & Currency Standards
            </h3>

            <div className="row g-2 mb-4">
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Primary Financial Currency
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={currency}
                  readOnly
                  style={{ backgroundColor: 'var(--surface-alt)' }}
                />
              </div>
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Accounting Carry-Forward Rule
                </label>
                <input
                  type="text"
                  className="form-control"
                  value="FIFO (Oldest Unpaid Settlement First)"
                  readOnly
                  style={{ backgroundColor: 'var(--surface-alt)' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-kmtms-primary">
              Save General Parameters
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PAYMENT GATEWAY */}
      {activeTab === 'gateway' && (
        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="kmtms-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Provider Credentials & Environment
                </h3>
                <button
                  onClick={handleTestGateway}
                  disabled={isTestingGateway}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                  <RefreshCw size={14} className={isTestingGateway ? 'spin' : ''} />
                  {isTestingGateway ? 'Pinging Gateway...' : 'Test Connection'}
                </button>
              </div>

              <form onSubmit={handleSaveGateway}>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      Gateway Provider Adapter
                    </label>
                    <select
                      className="form-select"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as any)}
                    >
                      <option value="Paystack">Paystack (Ghana MoMo & Cards)</option>
                      <option value="Hubtel">Hubtel Direct Merchant Gateway</option>
                      <option value="Flutterwave">Flutterwave MobileMoney</option>
                    </select>
                  </div>

                  <div className="col-6">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      Environment Mode
                    </label>
                    <select
                      className="form-select"
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                    >
                      <option value="sandbox">Sandbox (Testing / Demo)</option>
                      <option value="production">Production (Live Payments)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Public Integration Key
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={gatewayConfig.publicKey}
                    readOnly
                    style={{ backgroundColor: 'var(--surface-alt)' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Secret Key (Masked for Security per SRD 18.1)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={gatewayConfig.secretKeyMasked}
                    readOnly
                    style={{ backgroundColor: 'var(--surface-alt)' }}
                  />
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Stored in private environment variables. Never leaked to client code.
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Automated Webhook Callback Endpoint
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted" style={{ fontSize: '0.8rem' }}>
                      <Globe size={14} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={gatewayConfig.webhookUrl}
                      readOnly
                      style={{ backgroundColor: 'var(--surface-alt)', fontSize: '0.85rem' }}
                    />
                    <span className="input-group-text bg-success-subtle text-success fw-bold" style={{ fontSize: '0.75rem' }}>
                      ACTIVE (200 OK)
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.5rem 0 0.75rem', color: 'var(--primary)' }}>
                  Direct MoMo Receiving Account (Manual Transfers)
                </h4>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      Official Receiving Phone Number *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      Registered Merchant Account Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-kmtms-primary">
                  Save Gateway Configurations
                </button>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="kmtms-card p-4">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Security & Webhook Safeguards
              </h3>

              <div className="list-group" style={{ fontSize: '0.8rem' }}>
                <div className="list-group-item d-flex align-items-start gap-2">
                  <CheckCircle2 size={16} color="var(--success)" className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>HMAC SHA-512 Signature Validation:</strong> All webhook callbacks verify cryptographic header signature.
                  </div>
                </div>

                <div className="list-group-item d-flex align-items-start gap-2">
                  <CheckCircle2 size={16} color="var(--success)" className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Idempotency Controls:</strong> Duplicate callbacks for identical transaction references are rejected without double-crediting.
                  </div>
                </div>

                <div className="list-group-item d-flex align-items-start gap-2">
                  <CheckCircle2 size={16} color="var(--success)" className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Transaction Isolation:</strong> Database transactions ensure payment status and FIFO obligation allocation succeed or rollback together.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & SMS */}
      {activeTab === 'notifications' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="kmtms-card p-4">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Automated Reminders & SMS Dispatch
              </h3>

              <form onSubmit={handleSaveNotifications}>
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
                    Registered with National Communications Authority (NCA Ghana). Max 11 characters.
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

          <div className="col-12 col-lg-6">
            <div className="kmtms-card p-4">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Recent Notification Dispatch Log
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
      )}
    </div>
  );
};
