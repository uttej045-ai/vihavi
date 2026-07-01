import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import '../styles/AdminTheme.css';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-portal">
      <AdminHeader onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

      <div className="admin-layout-wrapper">
        {/* Sidebar overlay for mobile */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 95 }}
          />
        )}
        <div className={`admin-sidebar-wrapper${mobileOpen ? ' mobile-open' : ''}`} style={{ position: 'sticky', top: 'var(--admin-header-height)', height: 'calc(100vh - var(--admin-header-height))', overflowY: 'auto', flexShrink: 0 }}>
          <AdminSidebar />
        </div>

        <main className="admin-main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
