import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, Shield, HelpCircle, LogOut, Link as LinkIcon, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/OrganizerProfile.css';

const OrganizerProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    id: '',
    name: 'Vihavi Event Management',
    email: '',
    phone: '+91 98765 43210',
    location: 'Hyderabad, India',
    about: 'We are a premier event management company.',
    logo: '',
    website: '',
    twitter: '',
    linkedin: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Password Change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const loadOrganizerProfile = async () => {
    try {
      setIsLoading(true);
      const email = localStorage.getItem('email');
      const allOrgs = await dbService.getAll('organizers');
      const currentOrg = allOrgs.find(o => o.email.toLowerCase() === email?.toLowerCase());
      
      if (currentOrg) {
        setProfile(currentOrg);
        setEditData(currentOrg);
      } else {
        // Fallback or create mock org if not found
        const fallback = {
          id: 'mock-organizer-456',
          name: 'Vihavi Event Management',
          email: email || 'organizer@vihavi.dev',
          phone: '+91 98765 43210',
          location: 'Hyderabad, India',
          about: 'Premium Event Organizer',
          logo: '',
          website: '',
          twitter: '',
          linkedin: ''
        };
        setProfile(fallback);
        setEditData(fallback);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await dbService.update('organizers', profile.id, editData);
      
      // Also update the associated user name in the users table
      const users = await dbService.getAll('users');
      const currentUser = users.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
      if (currentUser) {
        await dbService.update('users', currentUser.id, {
          name: editData.name
        });
      }

      setProfile(editData);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(`Failed to save profile: ${err.message}`, 'error');
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast('New passwords do not match!', 'warning');
      return;
    }
    if (passwords.new.length < 8) {
      showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }

    try {
      const users = await dbService.getAll('users');
      const currentUser = users.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
      
      if (!currentUser || currentUser.password !== passwords.old) {
        showToast('Old password check failed. Please try again.', 'error');
        return;
      }

      await dbService.update('users', currentUser.id, {
        password: passwords.new
      });

      showToast('Password updated successfully!', 'success');
      setShowPasswordChange(false);
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      showToast(`Failed to change password: ${err.message}`, 'error');
    }
  };

  if (isLoading) {
    return <div className="organizer-loading">Retrieving Organizer Ledger...</div>;
  }

  return (
    <div className="org-profile">
      <div className="org-page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Profile Settings</h1>
      </div>

      <div className="org-profile-layout">
        
        {/* Profile Card Header */}
        <div className="org-profile-card org-profile-main luxury-card" style={{ padding: '0 0 24px 0', overflow: 'hidden' }}>
          <div className="org-profile-cover" style={{ height: '140px', background: 'linear-gradient(135deg, var(--org-burgundy) 0%, var(--org-burgundy-light) 50%, var(--org-gold) 100%)' }}></div>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-50px' }}>
            <div className="org-profile-avatar-large" style={{
              width: '100px',
              height: '100px',
              background: '#141416',
              borderRadius: '50%',
              border: '3px solid var(--org-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--org-gold)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}>
              {profile.logo ? (
                <img src={profile.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
              ) : (
                <Building size={40} />
              )}
            </div>
            
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginTop: '16px' }}>{profile.name}</h2>
            <p style={{ color: 'var(--org-gold)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Premium Event Organizer</p>

            <div className="org-profile-about" style={{ marginTop: '20px', textAlign: 'center', maxWidth: '500px' }}>
              <p style={{ color: 'var(--org-text-muted)', fontSize: '13px' }}>{profile.about}</p>
            </div>
          </div>
        </div>

        {/* Profile Editing Form / Views */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Main Info */}
          <div className="luxury-card">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Edit Company Details</h3>
                <div className="org-form-group">
                  <label>Company/Org Name</label>
                  <input type="text" name="name" className="luxury-input" value={editData.name} onChange={handleEditChange} required />
                </div>
                <div className="org-form-group">
                  <label>About Organizer</label>
                  <textarea name="about" className="luxury-textarea" rows="3" value={editData.about} onChange={handleEditChange}></textarea>
                </div>
                <div className="org-form-row">
                  <div className="org-form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" className="luxury-input" value={editData.phone} onChange={handleEditChange} />
                  </div>
                  <div className="org-form-group">
                    <label>Location</label>
                    <input type="text" name="location" className="luxury-input" value={editData.location} onChange={handleEditChange} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="luxury-btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="luxury-btn-primary" style={{ flex: 1, padding: '10px' }}>Save Changes</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', color: '#fff' }}>Company Information</h3>
                  <button className="luxury-btn-outline" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
                <div className="org-info-row" style={{ display: 'flex', gap: '12px' }}>
                  <Building size={16} color="var(--org-gold)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>Company Name</div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{profile.name}</div>
                  </div>
                </div>
                <div className="org-info-row" style={{ display: 'flex', gap: '12px' }}>
                  <Mail size={16} color="var(--org-gold)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>Email Address</div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{profile.email}</div>
                  </div>
                </div>
                <div className="org-info-row" style={{ display: 'flex', gap: '12px' }}>
                  <Phone size={16} color="var(--org-gold)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>Phone Number</div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{profile.phone}</div>
                  </div>
                </div>
                <div className="org-info-row" style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={16} color="var(--org-gold)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>Location</div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{profile.location}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Links & Passwords settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Social Links Widget */}
            <div className="luxury-card">
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Social Handles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <LinkIcon size={16} color="var(--org-gold)" />
                  <input type="text" name="website" className="luxury-input" placeholder="Website URL" value={profile.website} readOnly />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <LinkIcon size={16} color="var(--org-gold)" />
                  <input type="text" name="twitter" className="luxury-input" placeholder="Twitter @username" value={profile.twitter} readOnly />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <LinkIcon size={16} color="var(--org-gold)" />
                  <input type="text" name="linkedin" className="luxury-input" placeholder="LinkedIn handle" value={profile.linkedin} readOnly />
                </div>
              </div>
            </div>

            {/* Change Password Widget */}
            <div className="luxury-card">
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Security Settings</h3>
              
              {showPasswordChange ? (
                <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="org-form-group">
                    <label>Old Password</label>
                    <input type="password" className="luxury-input" value={passwords.old} onChange={(e) => setPasswords({...passwords, old: e.target.value})} required />
                  </div>
                  <div className="org-form-group">
                    <label>New Password</label>
                    <input type="password" className="luxury-input" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} required />
                  </div>
                  <div className="org-form-group">
                    <label>Confirm Password</label>
                    <input type="password" className="luxury-input" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="luxury-btn-outline" style={{ flex: 1, padding: '8px' }} onClick={() => setShowPasswordChange(false)}>Cancel</button>
                    <button type="submit" className="luxury-btn-primary" style={{ flex: 1, padding: '8px' }}>Update</button>
                  </div>
                </form>
              ) : (
                <button className="luxury-btn-outline" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowPasswordChange(true)}>
                  <Lock size={16} /> Change Account Password
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrganizerProfile;
