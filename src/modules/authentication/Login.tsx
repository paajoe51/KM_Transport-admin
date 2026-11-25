import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Lock, Phone, ShieldCheck, UserCheck, Truck, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [phone, setPhone] = useState('+233 24 100 2000');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login, switchDemoUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      showToast('warning', 'Missing Details', 'Please provide both phone number and PIN.');
      return;
    }

    setLoading(true);
    const result = await login(phone, pin);
    setLoading(false);

    if (result.success) {
      showToast('success', 'Authentication Successful', 'Welcome to KM Transport Management System');
      // Navigate according to phone or default
      if (phone.includes('100 2000')) {
        navigate('/admin/dashboard');
      } else if (phone.includes('458 2910')) {
        navigate('/officer/dashboard');
      } else {
        navigate('/driver/dashboard');
      }
    } else {
      showToast('error', 'Login Failed', result.message);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'officer' | 'driver', dest: string) => {
    switchDemoUser(role);
    showToast('success', 'Demo Persona Loaded', `Signed in as ${role.toUpperCase()}`);
    navigate(dest);
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
        {/* Branding */}
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-2">
            <img
              src="/branding/km-horizontal-logo.png"
              alt="KM Transport"
              style={{ height: '56px', maxWidth: '280px', objectFit: 'contain' }}
            />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 600 }}>
            FLEET MANAGEMENT SYSTEM (KMTMS)
          </div>
        </div>

        {/* Login Card */}
        <div className="kmtms-card p-4 shadow-md">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Account Sign In
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter your registered Ghana mobile number and secure PIN.
          </p>

          <form onSubmit={handleLogin}>
            {/* Phone Number */}
            <div className="mb-3">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Registered Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
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
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  style={{ paddingLeft: '36px', fontSize: '0.9rem', borderRadius: '8px' }}
                  required
                />
              </div>
            </div>

            {/* PIN */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  Security PIN
                </label>
                <Link
                  to="/forgot-pin"
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot PIN?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
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
                  type={showPin ? 'text' : 'password'}
                  className="form-control"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4 or 6-digit PIN"
                  maxLength={6}
                  style={{ paddingLeft: '36px', paddingRight: '36px', fontSize: '0.9rem', borderRadius: '8px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="mb-4 d-flex align-items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer', marginRight: '8px' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
                Remember this device
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-kmtms-orange w-100 shadow-sm"
              style={{ padding: '0.65rem', fontSize: '0.9rem', fontWeight: 700 }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Reviewer Logins */}
          <div className="mt-3 pt-3 border-top">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin', '/admin/dashboard')}
              className="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <ShieldCheck size={14} color="var(--primary)" />
              <span>Quick Demo Sign In as Administrator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
