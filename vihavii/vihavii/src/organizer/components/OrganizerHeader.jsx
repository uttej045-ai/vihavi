import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Menu, MessageSquare, Search, Plus, Settings } from 'lucide-react';
import { authService } from '../../services/authService';
import { dbService } from '../../services/dbService';
import '../styles/OrganizerHeader.css';

const OrganizerHeader = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [organizerName, setOrganizerName] = useState('Event Manager');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Get organizer details dynamically
    const email = localStorage.getItem('email');
    const loadProfile = async () => {
      try {
        const orgs = await dbService.getAll('organizers');
        const currentOrg = orgs.find(o => o.email.toLowerCase() === email?.toLowerCase());
        if (currentOrg) {
          setOrganizerName(currentOrg.name);
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setOrganizerName(user.name || 'Event Manager');
          }
        }
      } catch (err) {
        console.warn('Failed to load header profile name', err);
      }
    };
    loadProfile();

    // Check notifications for unread count
    const checkNotifications = async () => {
      try {
        const notifs = await dbService.getAll('notifications');
        const count = (notifs || []).filter(n => n && !n.read).length;
        setUnreadNotifications(count);
      } catch {}
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/organizer/events?search=${searchQuery}`);
    }
  };

  return (
    <header className="organizer-header" style={{
      background: 'rgba(10, 10, 12, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--org-glass-border)',
      color: '#fff',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div className="org-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="org-sidebar-toggle-btn" 
          onClick={onToggleMobileSidebar} 
          aria-label="Toggle Menu"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--org-gold)',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '4px'
          }}
        >
          <Menu size={24} />
        </button>
        
        {/* Logo and Mode Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/organizer" className="org-logo" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
            <span className="org-logo-text" style={{ fontWeight: 'bold', fontSize: '18px', display: 'none', md: 'inline' }}>Vihavi</span>
          </Link>
          <span className="org-badge" style={{ 
            fontSize: '10px', 
            padding: '4px 8px', 
            background: 'rgba(88, 15, 29, 0.4)', 
            color: 'var(--org-gold)', 
            borderRadius: '4px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Organizer Mode
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="org-header-search" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--org-glass-border)',
        borderRadius: '20px',
        padding: '0 16px',
        height: '38px',
        width: '300px',
        maxWidth: '100%',
        margin: '0 16px',
        transition: 'border-color 0.3s'
      }}>
        <Search size={16} color="var(--org-gold)" />
        <input 
          type="text" 
          placeholder="Global search events, bookings..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            marginLeft: '8px',
            width: '100%',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </form>

      <div className="org-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Create Event CTA */}
        <Link to="/organizer/create-event" className="luxury-btn-primary" style={{
          display: 'flex', 
          gap: '6px', 
          alignItems: 'center', 
          textDecoration: 'none',
          padding: '8px 16px',
          fontSize: '12px',
          borderRadius: '20px',
          fontWeight: 'bold'
        }}>
          <Plus size={14} /> Create New Event
        </Link>

        {/* Notifications Icon */}
        <button 
          className="org-icon-btn" 
          aria-label="Notifications"
          onClick={() => navigate('/organizer/notifications')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--org-gold)',
            cursor: 'pointer',
            position: 'relative',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="org-notification-dot" style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              background: '#ff4d4f',
              borderRadius: '50%',
              fontSize: '10px',
              color: '#fff',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Messages Icon */}
        <button 
          className="org-icon-btn" 
          aria-label="Messages"
          onClick={() => navigate('/organizer/messages')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--org-gold)',
            cursor: 'pointer',
            position: 'relative',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageSquare size={20} />
          <span className="org-notification-dot" style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            background: 'var(--org-burgundy)',
            border: '1px solid var(--org-gold)',
            borderRadius: '50%',
            fontSize: '10px',
            color: '#fff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            3
          </span>
        </button>
        
        {/* Profile Dropdown */}
        <div className="org-profile-menu" style={{ position: 'relative' }}>
          <button 
            className="org-profile-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--org-glass-border)',
              borderRadius: '20px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'var(--org-transition)'
            }}
          >
            <div className="org-avatar" style={{
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, var(--org-burgundy) 0%, var(--org-burgundy-light) 100%)',
              color: 'var(--org-gold)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--org-gold)'
            }}>
              <User size={14} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500', display: 'none', lg: 'inline' }}>{organizerName}</span>
          </button>
          
          {showDropdown && (
            <div className="org-dropdown" style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              background: '#141416',
              border: '1px solid var(--org-glass-border)',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              padding: '8px',
              width: '190px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <Link 
                to="/organizer/profile" 
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#ccc',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: '0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}
              >
                <User size={14} color="var(--org-gold)" />
                Profile Settings
              </Link>
              <Link 
                to="/organizer/profile?tab=security" 
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#ccc',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: '0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}
              >
                <Settings size={14} color="var(--org-gold)" />
                Account Settings
              </Link>
              <Link 
                to="/user" 
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#ccc',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: '0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--org-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Switch to Attendee View
              </Link>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
              <button 
                onClick={() => { setShowDropdown(false); authService.logout(); }} 
                className="org-logout-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#ff4d4f',
                  background: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.08)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
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
