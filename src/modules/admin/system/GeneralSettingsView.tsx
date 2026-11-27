import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { Settings, Building2, Globe, Clock, ShieldCheck } from 'lucide-react';

export const GeneralSettingsView: React.FC = () => {
  const [companyName, setCompanyName] = useState('KM COMPANY LIMITED');
  const [currency, setCurrency] = useState('GHS (Ghana Cedi)');
  const [timezone, setTimezone] = useState('Africa/Accra (GMT+0)');
  const [headOfficeAddress, setHeadOfficeAddress] = useState('Plot 14, Graphic Road, South Industrial Area, Accra');
  const [supportPhone, setSupportPhone] = useState('+233 30 223 4567');

  const { showToast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'General Settings Saved', 'Company parameters updated.');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            General System Settings & Organization Profile
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Core organization parameters, corporate headquarters address, legal entity details, currency and timezone.
          </p>
        </div>
      </div>

      <div className="kmtms-card p-4" style={{ maxWidth: '780px' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
            Company Legal Entity
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
                System Operating Timezone
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
            Save System Parameters
          </button>
        </form>
      </div>
    </div>
  );
};
