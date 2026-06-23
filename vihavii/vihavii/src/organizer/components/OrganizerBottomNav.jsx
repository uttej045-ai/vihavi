import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PlusCircle, Users, User } from 'lucide-react';
import '../styles/OrganizerBottomNav.css';

const OrganizerBottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/organizer', icon: LayoutDashboard, exact: true },
    { name: 'Events', path: '/organizer/events', icon: CalendarDays },
    { name: 'Create', path: '/organizer/create-event', icon: PlusCircle, isCreate: true },
    { name: 'Bookings', path: '/organizer/bookings', icon: Users },
    { name: 'Profile', path: '/organizer/profile', icon: User },
  ];

  return (
    <nav className="org-bottom-nav">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={index}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `org-nav-item ${isActive ? 'active' : ''} ${item.isCreate ? 'org-nav-create' : ''}`
            }
          >
            <div className="org-nav-icon-wrapper">
              <Icon size={item.isCreate ? 24 : 20} />
            </div>
            <span className="org-nav-text">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default OrganizerBottomNav;
