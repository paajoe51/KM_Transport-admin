import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppUser, UserRole, Driver, TransportOfficer, Administrator } from '../types';
import { mockService } from '../services/mockService';
import { apiClient } from '../services/apiClient';
import { INITIAL_ADMIN, INITIAL_OFFICERS, INITIAL_DRIVERS } from '../services/mockData';

interface AuthContextType {
  currentUser: AppUser | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  login: (phone: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoUser: (role: UserRole, userId?: string) => void;
  activateAccount: (phone: string, otp: string, newPin: string) => Promise<{ success: boolean; message?: string }>;
  resetPin: (phone: string, otp: string, newPin: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'kmtms_current_user_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default to Administrator for immediate full management inspection
    return INITIAL_ADMIN;
  });

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeRole: UserRole = currentUser ? currentUser.role : 'admin';

  const login = async (phone: string, pin: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Attempt Live PHP Backend Authentication
    try {
      const res = await apiClient.login(phone, pin);
      if (res && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        mockService.syncWithApi();
        return { success: true };
      }
    } catch (apiErr: any) {
      console.warn('Backend API login error or offline, checking local credentials:', apiErr);
      if (apiErr?.message && (apiErr.message.includes('suspended') || apiErr.message.includes('not yet activated'))) {
        return { success: false, message: apiErr.message };
      }
    }

    // 2. Offline / Local fallback logic
    // Normalise phone
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // Check Admin
    if (INITIAL_ADMIN.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-9))) {
      setCurrentUser(INITIAL_ADMIN);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN));
      return { success: true };
    }

    // Check Officers
    const officers = mockService.getOfficers();
    const officer = officers.find((o) => o.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-9)));
    if (officer) {
      if (officer.status === 'suspended') {
        return { success: false, message: 'Account is suspended. Please contact head office.' };
      }
      setCurrentUser(officer);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(officer));
      return { success: true };
    }

    // Check Drivers
    const drivers = mockService.getDrivers();
    const driver = drivers.find((d) => d.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-9)));
    if (driver) {
      if (driver.status === 'pending_activation') {
        return { success: false, message: 'Account not yet activated. Please complete first-time activation.' };
      }
      if (driver.status === 'suspended') {
        return { success: false, message: 'Driver account is suspended. Contact your Transport Officer.' };
      }
      setCurrentUser(driver);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(driver));
      return { success: true };
    }

    return { success: false, message: 'Invalid phone number or PIN. Please check your credentials.' };
  };

  const logout = () => {
    apiClient.logout().catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchDemoUser = (role: UserRole, userId?: string) => {
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN));
    } else if (role === 'officer') {
      const officer = userId
        ? mockService.getOfficer(userId) || mockService.getOfficers()[0]
        : mockService.getOfficers()[0];
      if (officer) {
        setCurrentUser(officer);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(officer));
      }
    } else if (role === 'driver') {
      const driver = userId
        ? mockService.getDriver(userId) || mockService.getDrivers()[0]
        : mockService.getDrivers()[0];
      if (driver) {
        setCurrentUser(driver);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(driver));
      }
    }
  };

  const activateAccount = async (phone: string, otp: string, newPin: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.activateAccount(phone, otp, newPin);
    } catch (e) {
      console.warn('Backend API activate deferred or offline:', e);
    }
    if (otp !== '123456') {
      return { success: false, message: 'Invalid OTP code. Please enter 123456 (demo code).' };
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const drivers = mockService.getDrivers();
    const driver = drivers.find((d) => d.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-9)));
    if (!driver) {
      return { success: false, message: 'No registered driver found for this phone number.' };
    }
    driver.status = 'active';
    mockService.saveDriver(driver);
    setCurrentUser(driver);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(driver));
    return { success: true };
  };

  const resetPin = async (phone: string, otp: string, newPin: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.resetPin(phone, otp, newPin);
    } catch (e) {
      console.warn('Backend API reset PIN deferred or offline:', e);
    }
    if (otp !== '123456') {
      return { success: false, message: 'Invalid OTP code. Use demo OTP 123456.' };
    }
    return { success: true, message: 'PIN reset successfully. You can now log in.' };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        isAuthenticated: !!currentUser,
        isOffline,
        setIsOffline,
        login,
        logout,
        switchDemoUser,
        activateAccount,
        resetPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
