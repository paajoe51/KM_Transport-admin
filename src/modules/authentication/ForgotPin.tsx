import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Phone, KeyRound, Lock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPin: React.FC = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('+233 24 555 0192');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      showToast('info', 'Reset OTP Sent', 'Demo verification OTP is 123456');
    }, 500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      showToast('error', 'Invalid OTP', 'Please enter demo OTP: 123456');
      return;
    }
    setStep(3);
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      showToast('error', 'Mismatch', 'New PIN and confirm PIN do not match.');
      return;
    }
    setLoading(true);
    const res = await resetPin(phone, otp, newPin);
    setLoading(false);
    if (res.success) {
      setStep(4);
      showToast('success', 'PIN Reset', 'Your security PIN has been updated.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <img src="/km-logo.svg" alt="KM Company Logo" width="54" height="54" style={{ borderRadius: '12px' }} />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginTop: '10px', marginBottom: '2px' }}>
            Reset Security PIN
          </h1>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            KM Transport Management System
          </div>
        </div>

        <div className="kmtms-card p-4 shadow-md">
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Enter Registered Phone
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                We will send an OTP verification code to reset your PIN.
              </p>
              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '36px', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-kmtms-primary w-100">
                {loading ? 'Sending...' : 'Send Verification OTP'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Enter OTP Code
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter the code sent to <strong>{phone}</strong> (Demo: 123456).
              </p>
              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  style={{ borderRadius: '8px', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '4px' }}
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="btn-kmtms-secondary">
                  <ArrowLeft size={16} />
                </button>
                <button type="submit" className="btn-kmtms-primary flex-1 w-100">
                  Verify & Proceed <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPin}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Create New PIN
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter your new 4 to 6 digit security PIN.
              </p>
              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  New PIN
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={6}
                  placeholder="New PIN"
                  style={{ borderRadius: '8px' }}
                  required
                />
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={6}
                  placeholder="Confirm New PIN"
                  style={{ borderRadius: '8px' }}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-kmtms-primary w-100">
                {loading ? 'Updating...' : 'Update PIN'}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-3">
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-subtle)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                PIN Reset Successfully
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                You can now log in with your new PIN.
              </p>
              <Link to="/login" className="btn-kmtms-primary w-100" style={{ textDecoration: 'none' }}>
                Sign In Now <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <div className="text-center mt-3 pt-3 border-top" style={{ fontSize: '0.8rem' }}>
            Remembered your PIN?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
