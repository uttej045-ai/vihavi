import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import profileService from '../../services/profileService';
import bookingService from '../../services/bookingService';
import '../styles/Profile.css';
import { User, Mail, Phone, Bell, Shield, Camera, Heart, Ticket, LogOut, ChevronRight } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { globalWishlist = [] } = useOutletContext() || {};

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [notifications, setNotifications] = useState({ email: true, sms: false });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.allSettled([
          profileService.getProfile(),
          bookingService.getBookings()
        ]);
        
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const data = profileRes.value;
          setProfile(data);
          setFormData({ name: data.name, email: data.email, phone: data.phone });
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
        
        if (bookingsRes.status === 'fulfilled') {
          setBookings(bookingsRes.value || []);
        }
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await profileService.updateProfile({ ...profile, ...formData, notifications });
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      setProfile({ ...profile, ...formData, notifications });
      setIsEditing(false);
    }
  };

  const toggleNotification = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleLogout = () => {
    // Basic mock logout flow
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div>Loading profile...</div>;
  }

  const bookingsCount = bookings?.length || 0;
  const wishlistCount = globalWishlist?.length || 0;

  return (
    <div className="profile-module">
      <header className="page-header">
        <h1>Account Settings</h1>
      </header>

      <div className="profile-layout">
        
        {/* Left Sidebar / Top Section on Mobile */}
        <aside className="profile-sidebar">
          <div className="user-identity-card">
            <div className="avatar-wrapper">
              <div className="avatar-placeholder">
                <User size={40} />
              </div>
              <button className="upload-avatar-btn"><Camera size={14}/></button>
            </div>
            <div className="user-identity-info">
              <h3>{profile?.name || 'User'}</h3>
              <p>{profile?.email || 'user@example.com'}</p>
            </div>
          </div>

          <div className="activity-summary-card">
            <div className="activity-stat" onClick={() => navigate('/user/wishlist')}>
              <div className="stat-icon-bg"><Heart size={20} fill="var(--primary-burgundy)" color="var(--primary-burgundy)"/></div>
              <div className="stat-text">
                <span className="stat-num">{wishlistCount}</span>
                <span className="stat-label">Wishlist</span>
              </div>
            </div>
            <div className="activity-stat" onClick={() => navigate('/user/bookings')}>
              <div className="stat-icon-bg"><Ticket size={20} color="var(--primary-burgundy)"/></div>
              <div className="stat-text">
                <span className="stat-num">{bookingsCount}</span>
                <span className="stat-label">Bookings</span>
              </div>
            </div>
          </div>

          <div className="settings-nav-card">
            <button className="settings-nav-item active">
              <div className="sn-left"><User size={18}/> Personal Info</div>
              <ChevronRight size={16} className="sn-chevron"/>
            </button>
            <button className="settings-nav-item">
              <div className="sn-left"><Bell size={18}/> Notifications</div>
              <ChevronRight size={16} className="sn-chevron"/>
            </button>
            <button className="settings-nav-item">
              <div className="sn-left"><Shield size={18}/> Security</div>
              <ChevronRight size={16} className="sn-chevron"/>
            </button>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </aside>

        {/* Right Content Area */}
        <main className="profile-main">
          
          {/* Personal Info Card */}
          <section className="settings-card">
            <div className="card-header-flex">
              <h2>Personal Information</h2>
              {!isEditing && (
                <button className="btn-edit-text" onClick={() => setIsEditing(true)}>Edit</button>
              )}
            </div>

            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon"/>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing} 
                    className={!isEditing ? 'disabled-input' : ''}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon"/>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing} 
                    className={!isEditing ? 'disabled-input' : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon"/>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing} 
                    className={!isEditing ? 'disabled-input' : ''}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              )}
            </form>
          </section>

          {/* Notifications Card */}
          <section className="settings-card">
            <h2>Notification Preferences</h2>
            
            <div className="notification-list">
              <div className="notification-item">
                <div className="notif-info">
                  <h4>Email Notifications</h4>
                  <p>Receive tickets and updates via email.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.email} onChange={() => toggleNotification('email')} />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="notification-divider"></div>

              <div className="notification-item">
                <div className="notif-info">
                  <h4>SMS Notifications</h4>
                  <p>Get instant SMS alerts for events.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.sms} onChange={() => toggleNotification('sms')} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Profile;
