import React from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrganizerProfile.css';

const OrganizerProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate('/login');
  };

  return (
    <div className="org-profile">
      <div className="org-page-header">
        <h1>Organizer Profile</h1>
      </div>

      <div className="org-profile-layout">
        {/* Profile Header Card */}
        <div className="org-profile-card org-profile-main">
          <div className="org-profile-cover"></div>
          <div className="org-profile-avatar-container">
            <div className="org-profile-avatar-large">
              <Building size={40} />
            </div>
          </div>
          
          <div className="org-profile-info">
            <h2>Vihavi Event Management</h2>
            <p className="org-profile-role">Premium Organizer Account</p>
            
            <div className="org-profile-stats">
              <div className="p-stat">
                <span className="p-stat-val">24</span>
                <span className="p-stat-lbl">Events</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-val">1.2K</span>
                <span className="p-stat-lbl">Bookings</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-val">4.8</span>
                <span className="p-stat-lbl">Rating</span>
              </div>
            </div>
            
            <div className="org-profile-about">
              <h3>About Organizer</h3>
              <p>We are a premier event management company specializing in tech conferences, open mics, and exclusive social gatherings across India.</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="org-profile-settings">
          <div className="org-settings-section">
            <div className="org-settings-header">
              <User size={18} />
              <h3>Personal Information</h3>
            </div>
            <div className="org-settings-body">
              <div className="org-info-row">
                <div className="org-info-icon"><User size={16} /></div>
                <div className="org-info-content">
                  <div className="org-info-label">Manager Name</div>
                  <div className="org-info-val">Event Manager</div>
                </div>
              </div>
              <div className="org-info-row">
                <div className="org-info-icon"><Mail size={16} /></div>
                <div className="org-info-content">
                  <div className="org-info-label">Email Address</div>
                  <div className="org-info-val">event@gmail.com</div>
                </div>
              </div>
              <div className="org-info-row">
                <div className="org-info-icon"><Phone size={16} /></div>
                <div className="org-info-content">
                  <div className="org-info-label">Phone Number</div>
                  <div className="org-info-val">+91 98765 43210</div>
                </div>
              </div>
              <div className="org-info-row">
                <div className="org-info-icon"><MapPin size={16} /></div>
                <div className="org-info-content">
                  <div className="org-info-label">Location</div>
                  <div className="org-info-val">Hyderabad, India</div>
                </div>
              </div>
              <button className="org-btn-outline org-full-btn">Edit Details</button>
            </div>
          </div>

          <div className="org-settings-section">
            <div className="org-settings-header">
              <CreditCard size={18} />
              <h3>Bank Details</h3>
            </div>
            <div className="org-settings-body">
              <div className="org-info-row">
                <div className="org-info-content">
                  <div className="org-info-label">Account Number</div>
                  <div className="org-info-val">•••• •••• •••• 4589</div>
                </div>
              </div>
              <div className="org-info-row">
                <div className="org-info-content">
                  <div className="org-info-label">IFSC Code</div>
                  <div className="org-info-val">HDFC0001234</div>
                </div>
              </div>
              <button className="org-btn-outline org-full-btn">Manage Payouts</button>
            </div>
          </div>

          <div className="org-settings-menu">
            <button className="org-menu-item">
              <Shield size={18} /> Account Settings
            </button>
            <button className="org-menu-item">
              <HelpCircle size={18} /> Help & Support
            </button>
            <button className="org-menu-item logout" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
