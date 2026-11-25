import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/common/Sidebar';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { WifiOff } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isOffline } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>Offline Mode: Financial transactions & approvals require server connectivity.</span>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Collapsible Sidebar */}
        <Sidebar collapsed={collapsed} />

        {/* Content Wrapper */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header onToggleSidebar={() => setCollapsed(!collapsed)} logoType="horizontal" />

          <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
