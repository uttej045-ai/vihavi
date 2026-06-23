import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import BookingCard from './BookingCard';
import '../styles/EventBookings.css';

const MOCK_BOOKINGS = [
  {
    id: 'BKG-001',
    userName: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    eventName: 'Tech Innovators Summit 2026',
    date: 'Aug 10, 2026',
    ticketCount: 2,
    status: 'Confirmed'
  },
  {
    id: 'BKG-002',
    userName: 'Priya Patel',
    email: 'priya.p@example.com',
    eventName: 'Acoustic Nights Open Mic',
    date: 'Aug 12, 2026',
    ticketCount: 4,
    status: 'Confirmed'
  },
  {
    id: 'BKG-003',
    userName: 'Amit Kumar',
    email: 'amit.k@example.com',
    eventName: 'Tech Innovators Summit 2026',
    date: 'Aug 13, 2026',
    ticketCount: 1,
    status: 'Pending'
  },
  {
    id: 'BKG-004',
    userName: 'Sneha Reddy',
    email: 'sneha.r@example.com',
    eventName: 'Summer Neon Party',
    date: 'May 18, 2026',
    ticketCount: 5,
    status: 'Cancelled'
  }
];

const EventBookings = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = MOCK_BOOKINGS.filter(booking => 
    booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.eventName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="org-bookings">
      <div className="org-page-header">
        <div>
          <h1>Bookings</h1>
          <p className="org-subtitle">Manage all attendee bookings across your events.</p>
        </div>
        <button className="org-btn-outline org-header-cta">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="org-bookings-stats">
        <div className="org-b-stat">
          <div className="org-b-stat-label">Total Bookings</div>
          <div className="org-b-stat-value">1,245</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Confirmed</div>
          <div className="org-b-stat-value" style={{color: '#27c93f'}}>1,180</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Pending</div>
          <div className="org-b-stat-value" style={{color: '#d4a000'}}>45</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Cancelled</div>
          <div className="org-b-stat-value" style={{color: '#ff5f56'}}>20</div>
        </div>
      </div>

      <div className="org-filters-section">
        <div className="org-search-filter-wrapper" style={{width: '100%'}}>
          <div className="org-search-box" style={{flex: 1}}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or event..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{width: '100%'}}
            />
          </div>
          <button className="org-filter-btn">
            <Filter size={18} /> <span className="hidden-mobile">Filters</span>
          </button>
        </div>
      </div>

      <div className="org-bookings-grid">
        {filteredBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
        {filteredBookings.length === 0 && (
          <div className="org-empty-state" style={{gridColumn: '1 / -1'}}>
            <p>No bookings found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookings;
