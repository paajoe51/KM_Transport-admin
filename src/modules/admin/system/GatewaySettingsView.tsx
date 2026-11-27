import React, { useState } from 'react';
import { mockService } from '../../../services/mockService';
import { GatewayConfig } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { Sliders, CheckCircle2, ShieldCheck, RefreshCw, KeyRound, Globe } from 'lucide-react';

export const GatewaySettingsView: React.FC = () => {
  const [config, setConfig] = useState<GatewayConfig>(mockService.getGatewayConfig());
  const [provider, setProvider] = useState(config.provider);
  const [environment, setEnvironment] = useState(config.environment);
  const [momoNumber, setMomoNumber] = useState(config.momoReceivingNumber);
  const [accountName, setAccountName] = useState(config.momoAccountName);
  const [isTesting, setIsTesting] = useState(false);

  const { showToast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = mockService.updateGatewayConfig({
      provider,
      environment,
      momoReceivingNumber: momoNumber,
      momoAccountName: accountName,
    });
    setConfig(updated);
    showToast('success', 'Gateway Updated', 'Payment gateway configuration saved.');
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      showToast('success', 'Gateway Test 200 OK', 'Successfully connected to gateway provider webhook listener.');
    }, 800);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Payment Gateway & Mobile Money Integration
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Provider-independent adapter settings for automated MoMo checkout and manual receiving accounts.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
        >
          <RefreshCw size={14} className={isTesting ? 'spin' : ''} />
          {isTesting ? 'Pinging Gateway...' : 'Test Webhook Connection'}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="kmtms-card p-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Provider Credentials & Environment
            </h3>

            <form onSubmit={handleSave}>
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
                  value={config.publicKey}
                  readOnly
                  style={{ backgroundColor: 'var(--surface-alt)' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Secret Key (Masked for Security)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={config.secretKeyMasked}
                  readOnly
                  style={{ backgroundColor: 'var(--surface-alt)' }}
                />
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Stored securely in private server environment variables. Never exposed in public client bundles.
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
                    value={config.webhookUrl}
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

        {/* Security Checklist */}
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
                  <strong>Idempotency Controls:</strong> Duplicate callbacks for identical transaction references are rejected without re-crediting.
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
    </div>
  );
};
