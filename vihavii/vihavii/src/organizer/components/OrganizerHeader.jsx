import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import '../styles/OrganizerHeader.css';

const OrganizerHeader = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate('/login');
  };

  return (
    <header className="organizer-header">
      <div className="org-header-left">
        <Link to="/organizer" className="org-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          <span className="org-logo-text">Vihavi <span className="org-badge">Organizer</span></span>
        </Link>
      </div>

      <nav className="org-top-nav hidden-mobile-tablet">
        <NavLink to="/organizer" end className={({ isActive }) => `org-top-nav-item ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/organizer/events" className={({ isActive }) => `org-top-nav-item ${isActive ? 'active' : ''}`}>Events</NavLink>
        <NavLink to="/organizer/bookings" className={({ isActive }) => `org-top-nav-item ${isActive ? 'active' : ''}`}>Bookings</NavLink>
        <NavLink to="/organizer/profile" className={({ isActive }) => `org-top-nav-item ${isActive ? 'active' : ''}`}>Profile</NavLink>
      </nav>

      <div className="org-header-right">
        
        <button className="org-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="org-notification-dot"></span>
        </button>
        
        <div className="org-profile-menu">
          <button 
            className="org-profile-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="org-avatar">
              <User size={18} />
            </div>
            <span className="hidden-mobile">Event Manager</span>
          </button>
          
          {showDropdown && (
            <div className="org-dropdown">
              <Link to="/organizer/profile" onClick={() => setShowDropdown(false)}>Profile Settings</Link>
              <button onClick={handleLogout} className="org-logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default OrganizerHeader;
