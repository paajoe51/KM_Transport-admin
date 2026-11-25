import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Phone, KeyRound, Lock, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export const AccountActivation: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [phone, setPhone] = useState('+233 24 123 9876'); // Kwabena Darko (pending activation)
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const [loading, setLoading] = useState(false);

  const { activateAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (isCounting && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      showToast('warning', 'Phone Required', 'Please enter your registered phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setIsCounting(true);
      setCountdown(60);
      showToast('info', 'OTP Sent', 'Demo verification code is 123456');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      showToast('error', 'Invalid OTP', 'Please enter the demo OTP: 123456');
      return;
    }
    setStep(3);
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      showToast('warning', 'PIN Too Short', 'PIN must be at least 4 digits.');
      return;
    }
    setStep(4);
  };

  const handleConfirmPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      showToast('error', 'PIN Mismatch', 'The confirmed PIN does not match the created PIN.');
      return;
    }

    setLoading(true);
    const result = await activateAccount(phone, otp, pin);
    setLoading(false);

    if (result.success) {
      setStep(5);
      showToast('success', 'Account Activated!', 'Your PIN has been created.');
    } else {
      showToast('error', 'Activation Failed', result.message);
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
            First-Time Account Activation
          </h1>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            KM Transport Management System
          </div>
        </div>

        {/* Step Indicator */}
        <div className="d-flex justify-content-between mb-3 px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                width: '18%',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: s <= step ? 'var(--secondary)' : 'var(--border)',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>

        <div className="kmtms-card p-4 shadow-md">
          {/* STEP 1: Phone submission */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Step 1: Enter Registered Phone
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter the mobile number provided during your KM Transport registration.
              </p>

              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Mobile Number
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
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Sample pending driver: +233 24 123 9876 (Kwabena Darko)
                </small>
              </div>

              <button type="submit" disabled={loading} className="btn-kmtms-primary w-100">
                {loading ? 'Sending OTP...' : 'Send Activation OTP'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Step 2: Verify OTP Code
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                We sent a 6-digit one-time code to <strong>{phone}</strong>.
              </p>

              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  6-Digit OTP Code
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control text-center letter-spacing-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    style={{ paddingLeft: '36px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '4px' }}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.75rem' }}>
                  <span className="text-muted">
                    {isCounting ? `Resend code in ${countdown}s` : 'Code expired?'}
                  </span>
                  <button
                    type="button"
                    disabled={isCounting}
                    onClick={() => {
                      setIsCounting(true);
                      setCountdown(60);
                      showToast('info', 'Code Resent', 'Demo OTP: 123456');
                    }}
                    className="btn btn-link p-0 text-decoration-none"
                    style={{ fontSize: '0.75rem', color: isCounting ? 'var(--text-muted)' : 'var(--primary)' }}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="btn-kmtms-secondary">
                  <ArrowLeft size={16} />
                </button>
                <button type="submit" className="btn-kmtms-primary flex-1 w-100">
                  Verify OTP <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Create PIN */}
          {step === 3 && (
            <form onSubmit={handleCreatePin}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Step 3: Create New PIN
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Choose a 4 to 6 digit security PIN you will use to sign in.
              </p>

              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  New PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-control"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    placeholder="Enter 4-6 digits"
                    style={{ paddingLeft: '36px', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-kmtms-primary w-100">
                Continue to Confirm <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 4: Confirm PIN */}
          {step === 4 && (
            <form onSubmit={handleConfirmPin}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Step 4: Confirm PIN
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Re-enter your new PIN to ensure there are no typing errors.
              </p>

              <div className="mb-3">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Re-type PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    maxLength={6}
                    placeholder="Confirm PIN"
                    style={{ paddingLeft: '36px', borderRadius: '8px' }}
                    required
                  />
                </div>
                {confirmPin && pin !== confirmPin && (
                  <span className="text-danger" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    PINs do not match!
                  </span>
                )}
              </div>

              <div className="d-flex gap-2">
                <button type="button" onClick={() => setStep(3)} className="btn-kmtms-secondary">
                  <ArrowLeft size={16} />
                </button>
                <button type="submit" disabled={loading || pin !== confirmPin} className="btn-kmtms-primary flex-1 w-100">
                  {loading ? 'Activating Account...' : 'Complete Activation'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <div className="text-center py-3">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-subtle)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Account Successfully Activated!
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your account is now active and your PIN is secured. You can now access your dashboard.
              </p>
              <button
                type="button"
                onClick={() => navigate('/driver/dashboard')}
                className="btn-kmtms-teal w-100"
                style={{ padding: '0.65rem' }}
              >
                Go to Driver Dashboard <ArrowRight size={16} />
              </button>
            </div>
          )}

          <div className="text-center mt-3 pt-3 border-top" style={{ fontSize: '0.8rem' }}>
            Already have an active PIN?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
