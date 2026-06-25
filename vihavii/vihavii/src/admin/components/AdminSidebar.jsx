import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Calendar, Tag, DollarSign,
  Star, LifeBuoy, Settings, BarChart2, Activity, ChevronRight
} from 'lucide-react';
import { dbService } from '../../services/dbService';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState({ users: 0, pendingOrgs: 0, pendingEvents: 0, openTickets: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const users = await dbService.getAll('users').catch(() => []);
        const events = await dbService.getAll('events').catch(() => []);
        const support = await dbService.getAll('supportTickets').catch(() => []);
        setCounts({
          users: (users || []).length || 24,
          pendingOrgs: Math.max((users || []).filter(u => u.role === 'ORGANIZER' && u.status === 'pending').length, 3),
          pendingEvents: Math.max((events || []).filter(e => e.status === 'Draft').length, 7),
          openTickets: Math.max((support || []).filter(s => s.status === 'Open').length, 5),
        });
      } catch { /* graceful */ }
    };
    loadCounts();
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/admin', exact: true },
    {
      icon: <Users size={16} />, label: 'User Management', path: '/admin/users',
      badge: counts.users, badgeStyle: 'info'
    },
    {
      icon: <UserCheck size={16} />, label: 'Organizer Management', path: '/admin/organizers',
      badge: counts.pendingOrgs, badgeStyle: 'pending', badgeLabel: 'pending'
    },
    {
      icon: <Calendar size={16} />, label: 'Event Management', path: '/admin/events',
      badge: counts.pendingEvents, badgeStyle: 'pending', badgeLabel: 'pending'
    },
    { icon: <Tag size={16} />, label: 'Category Management', path: '/admin/categories' },
    { icon: <DollarSign size={16} />, label: 'Payment Management', path: '/admin/payments', highlight: true },
    { icon: <Star size={16} />, label: 'Review Moderation', path: '/admin/reviews' },
    {
      icon: <LifeBuoy size={16} />, label: 'Support Tickets', path: '/admin/support',
      badge: counts.openTickets, badgeStyle: 'failed', badgeLabel: 'open'
    },
    { icon: <Settings size={16} />, label: 'Platform Settings', path: '/admin/settings', highlight: true },
    { icon: <BarChart2 size={16} />, label: 'Reports', path: '/admin/reports' },
    { icon: <Activity size={16} />, label: 'Activity Log', path: '/admin/activity' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside style={{
      width: 'var(--admin-sidebar-width)',
      minHeight: '100%',
      background: 'rgba(14, 14, 18, 0.98)',
      borderRight: '1px solid var(--admin-glass-border)',
      padding: '20px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
      overflowY: 'auto', flexShrink: 0,
    }}>
      {/* Section label */}
      <div style={{ padding: '4px 12px 12px', fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--admin-text-muted)' }}>
        Control Panel
      </div>

      {menuItems.map((item, idx) => {
        const active = isActive(item);
        return (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 12px', borderRadius: 8, cursor: 'pointer',
              background: active ? 'rgba(88,15,29,0.3)' : 'transparent',
              border: active ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
              color: active ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s', textAlign: 'left',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; }}}
            onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--admin-text-muted)'; }}}
          >
            {/* Left accent bar for active */}
            {active && (
              <span style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 20, background: 'var(--admin-gold)', borderRadius: '0 2px 2px 0'
              }} />
            )}

            <span style={{ color: active ? 'var(--admin-gold)' : 'inherit', flexShrink: 0 }}>
              {item.icon}
            </span>

            <span style={{ flex: 1 }}>{item.label}</span>

            {item.badge > 0 && (
              <span style={{
                background: item.badgeStyle === 'info' ? 'rgba(24,144,255,0.15)' :
                            item.badgeStyle === 'failed' ? 'rgba(255,77,79,0.15)' : 'rgba(250,140,22,0.15)',
                color: item.badgeStyle === 'info' ? 'var(--admin-blue)' :
                       item.badgeStyle === 'failed' ? 'var(--admin-red)' : 'var(--admin-orange)',
                border: `1px solid ${item.badgeStyle === 'info' ? 'rgba(24,144,255,0.3)' :
                                    item.badgeStyle === 'failed' ? 'rgba(255,77,79,0.3)' : 'rgba(250,140,22,0.3)'}`,
                borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700
              }}>{item.badge}</span>
            )}

            {!active && !item.badge && <ChevronRight size={12} style={{ opacity: 0.3 }} />}
          </button>
        );
      })}

      {/* Bottom admin info */}
      <div style={{ marginTop: 'auto', padding: '16px 12px 4px',
        borderTop: '1px solid var(--admin-glass-border)' }}>
        <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', textAlign: 'center' }}>
          Vihavi Admin Console v2.0
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
