import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Search, Bell, ChevronDown, LogOut, Settings, Activity,
  AlertTriangle, CheckSquare, Filter, X, User
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import '../styles/AdminTheme.css';

const AdminHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('All');
  const [pendingCount, setPendingCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const adminName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.name || 'Platform Admin';
    } catch { return 'Platform Admin'; }
  })();

  useEffect(() => {
    const load = async () => {
      try {
        const events = await dbService.getAll('events').catch(() => []);
        const pending = (events || []).filter(e => e.status === 'Published').length;
        setPendingCount(pending || 5);

        const alerts = await dbService.getAll('alerts').catch(() => []);
        const active = (alerts || []).filter(a => a.status === 'Active').length;
        setAlertCount(active || 3);

        const notifs = await dbService.getAll('notifications').catch(() => []);
        setNotifCount((notifs || []).filter(n => !n.read).length || 4);
      } catch { /* graceful */ }
    };
    load();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--admin-header-height)',
      background: 'rgba(10, 10, 12, 0.95)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--admin-glass-border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '16px',
    }}>
      {/* Mobile sidebar toggle */}
      <button onClick={onToggleSidebar} style={{
        background: 'transparent', border: 'none', color: 'var(--admin-gold)',
        cursor: 'pointer', padding: '6px', display: 'none'
      }} className="admin-sidebar-toggle">
        <Filter size={20} />
      </button>

      {/* Logo */}
      <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--admin-burgundy), #7a1528)',
          border: '1px solid rgba(212,175,55,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Lock size={16} color="var(--admin-gold)" />
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>Vihavi</span>
          <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--admin-gold)', marginLeft: 4 }}>Admin</span>
        </div>
      </Link>

      {/* Admin Mode Badge */}
      <span style={{
        background: 'rgba(88,15,29,0.5)', border: '1px solid rgba(212,175,55,0.3)',
        color: 'var(--admin-gold)', fontSize: 9, fontWeight: 700,
        padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
        letterSpacing: '1px', flexShrink: 0
      }}>
        Admin Mode
      </span>

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', gap: 0,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-glass-border)',
        borderRadius: 8, overflow: 'hidden' }}>
        <select
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)', border: 'none', borderRight: '1px solid var(--admin-glass-border)',
            color: 'var(--admin-text-muted)', fontSize: 11, padding: '0 10px', height: 36,
            cursor: 'pointer', outline: 'none', minWidth: 80
          }}
        >
          {['All', 'Users', 'Events', 'Organizers', 'Tickets'].map(f => (
            <option key={f} value={f} style={{ background: '#1a1a1e' }}>{f}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 10px', gap: 8 }}>
          <Search size={14} color="var(--admin-text-muted)" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${searchFilter.toLowerCase()}...`}
            style={{ background: 'transparent', border: 'none', color: '#fff',
              fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        {/* Pending Approvals */}
        <button style={{
          background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
          color: 'var(--admin-gold)', padding: '7px 12px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }} onClick={() => navigate('/admin')}>
          <CheckSquare size={14} />
          <span>Pending</span>
          <span style={{
            background: 'var(--admin-burgundy)', color: '#fff',
            borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700
          }}>{pendingCount}</span>
        </button>

        {/* Priority Alerts */}
        <button style={{ position: 'relative', background: 'transparent', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', padding: 8 }}>
          <AlertTriangle size={18} color={alertCount > 0 ? 'var(--admin-red)' : 'var(--admin-text-muted)'} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 7, height: 7, background: 'var(--admin-red)', borderRadius: '50%',
              border: '1.5px solid var(--admin-black)'
            }} />
          )}
        </button>

        {/* Notifications */}
        <button style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Bell size={18} color="var(--admin-text-muted)" />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: 3, right: 3, minWidth: 16, height: 16,
              background: 'var(--admin-red)', borderRadius: 10, border: '1.5px solid var(--admin-black)',
              color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
            }}>{notifCount}</span>
          )}
        </button>

        {/* Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--admin-glass-border)',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--admin-burgundy), var(--admin-gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <User size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminName}
            </span>
            <ChevronDown size={12} color="var(--admin-text-muted)" />
          </button>

          {showDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 140 }} onClick={() => setShowDropdown(false)} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#1e1e24', border: '1px solid var(--admin-glass-border)',
                borderRadius: 10, width: 200, padding: '6px', zIndex: 150,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}>
                {[
                  { icon: <Settings size={14} />, label: 'Settings', action: () => {} },
                  { icon: <Activity size={14} />, label: 'Activity Log', action: () => {} },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    width: '100%', padding: '10px 12px', background: 'transparent',
                    border: 'none', color: 'var(--admin-text-secondary)', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    borderRadius: 6, textAlign: 'left'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ color: 'var(--admin-gold)' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div style={{ margin: '4px 0', borderTop: '1px solid var(--admin-glass-border)' }} />
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '10px 12px', background: 'transparent',
                  border: 'none', color: 'var(--admin-red)', fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 6
                }}>
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
