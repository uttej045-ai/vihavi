import React from 'react';
import { Calendar, Users, DollarSign, Activity, Plus } from 'lucide-react';
import StatCard from './StatCard';
import EventCard from './EventCard';
import { Link } from 'react-router-dom';
import '../styles/OrganizerDashboard.css';

const MOCK_EVENTS = [
  {
    id: 1,
    name: 'Tech Innovators Summit 2026',
    date: 'Aug 15, 2026',
    location: 'Hyderabad, India',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
    sales: 1250,
    revenue: 125000,
    status: 'Published'
  },
  {
    id: 2,
    name: 'Acoustic Nights Open Mic',
    date: 'Sep 02, 2026',
    location: 'Mumbai, India',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000',
    sales: 340,
    revenue: 15000,
    status: 'Published'
  }
];

const OrganizerDashboard = () => {
  return (
    <div className="org-dashboard">
      <div className="org-welcome-section">
        <div className="org-dash-header">
          <div>
            <h1 className="org-welcome">Welcome back, <span className="text-gradient">Event Manager</span>! 👋</h1>
            <p className="org-subtitle">Here is what's happening with your events today.</p>
          </div>
          <div className="org-dash-actions hidden-mobile-tablet">
            <Link to="/organizer/create-event" className="org-btn-primary org-header-cta">
              <Plus size={16} /> Create New Event
            </Link>
          </div>
        </div>
      </div>

      <div className="org-stats-grid">
        <StatCard title="Total Revenue" value={245890} icon={DollarSign} trend={12.5} isCurrency={true} />
        <StatCard title="Total Tickets Sold" value={8459} icon={Users} trend={8.2} />
        <StatCard title="Total Events" value={24} icon={Calendar} trend={15.0} />
        <StatCard title="Active Views" value={12500} icon={Activity} trend={-2.4} />
      </div>

      <div className="org-dash-content">
        <div className="org-recent-events">
          <div className="org-section-header">
            <h2>Recent Events</h2>
            <Link to="/organizer/events" className="org-link">View All</Link>
          </div>
          <div className="org-events-grid">
            {MOCK_EVENTS.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>      </div>
    </div>
  );
};

export default OrganizerDashboard;
