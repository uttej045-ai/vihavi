import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import OrganizerHeader from './OrganizerHeader';
import OrganizerSidebar from './OrganizerSidebar';
import OrganizerBottomNav from './OrganizerBottomNav';
import '../styles/OrganizerTheme.css'; // Global luxury theme
import '../styles/OrganizerLayout.css';

const OrganizerLayout = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Role verification guard
    const role = localStorage.getItem("userRole") || localStorage.getItem("role")?.toLowerCase();
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    if (!isAuthenticated || role !== "organizer") {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="organizer-layout">
      {/* Sticky Left Sidebar for Desktop */}
      <div className={`org-sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Overlay backdrop for mobile */}
        {mobileOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 99
            }}
          />
        )}
        <div className={mobileOpen ? 'org-sidebar mobile-open' : 'org-sidebar'}>
          <OrganizerSidebar />
        </div>
      </div>

      <div className="organizer-content-wrapper">
        {/* Header containing the mobile menu toggle */}
        <OrganizerHeader onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
        
        <main className="organizer-main-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile screens */}
      <OrganizerBottomNav />
    </div>
  );
};

export default OrganizerLayout;
