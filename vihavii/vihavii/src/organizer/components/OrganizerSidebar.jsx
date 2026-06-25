import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  PlusCircle, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  HelpCircle,
  LogOut
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import '../styles/OrganizerSidebar.css';

export default function OrganizerSidebar() {
  const navigate = useNavigate();
  const [eventCount, setEventCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(3); // Mock message count

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const eventsList = await dbService.getAll('events');
        const validEvents = (eventsList || []).filter(e => e && e.id);
        setEventCount(validEvents.length);
      } catch (err) {
        console.warn('Failed to load events count', err);
      }
    };
    fetchStats();

    // Refresh every 10s to keep badge in sync
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/organizer', icon: LayoutDashboard, exact: true },
    { 
      name: 'My Events', 
      path: '/organizer/events', 
      icon: CalendarDays,
      badge: eventCount > 0 ? eventCount : null 
    },
    { name: 'Create Event', path: '/organizer/create-event', icon: PlusCircle },
    { name: 'Attendees', path: '/organizer/attendees', icon: Users },
    { name: 'Revenue', path: '/organizer/revenue', icon: DollarSign },
    { name: 'Analytics', path: '/organizer/analytics', icon: TrendingUp },
    { 
      name: 'Messages', 
      path: '/organizer/messages', 
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    { name: 'Profile Settings', path: '/organizer/profile', icon: Settings },
    { name: 'Help & Support', path: '/organizer/help', icon: HelpCircle }
  ];

  return (
    <aside className="org-sidebar">
      <div className="org-sidebar-brand">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
        <span className="brand-text luxury-text-gradient">Vihavi</span>
      </div>

      <nav className="org-sidebar-nav">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `org-sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="item-icon" />
              <span className="item-name">{item.name}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className="item-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="org-sidebar-footer">
        <button className="sidebar-logout-btn" onClick={() => authService.logout()}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
