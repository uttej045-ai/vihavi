import React, { useState } from 'react';
import { Filter, Search, Calendar } from 'lucide-react';
import EventCard from './EventCard';
import { Link } from 'react-router-dom';
import '../styles/MyEvents.css';

const MOCK_ALL_EVENTS = [
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
  },
  {
    id: 3,
    name: 'Design Systems Workshop',
    date: 'Oct 12, 2026',
    location: 'Online',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000',
    sales: 0,
    revenue: 0,
    status: 'Draft'
  },
  {
    id: 4,
    name: 'Summer Neon Party',
    date: 'May 20, 2026',
    location: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000',
    sales: 850,
    revenue: 42500,
    status: 'Completed'
  },
  {
    id: 5,
    name: 'Food Truck Festival',
    date: 'Jul 10, 2026',
    location: 'Delhi, India',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000',
    sales: 120,
    revenue: 6000,
    status: 'Cancelled'
  }
];

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled', 'Drafts'];

  const filteredEvents = MOCK_ALL_EVENTS.filter(event => {
    // Search filter
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    let matchesTab = false;
    if (activeTab === 'All') matchesTab = true;
    else if (activeTab === 'Upcoming' && event.status === 'Published') matchesTab = true;
    else if (activeTab === 'Completed' && event.status === 'Completed') matchesTab = true;
    else if (activeTab === 'Cancelled' && event.status === 'Cancelled') matchesTab = true;
    else if (activeTab === 'Drafts' && event.status === 'Draft') matchesTab = true;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="org-my-events">
      <div className="org-page-header">
        <h1>My Events</h1>
      </div>

      <div className="org-filters-section">
        <div className="org-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`org-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="org-search-filter-wrapper">
          <div className="org-search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="org-filter-btn">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="org-events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="org-empty-state">
          <div className="org-empty-icon"><Calendar size={48} /></div>
          <h3>No events found</h3>
          <p>You don't have any events matching the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
