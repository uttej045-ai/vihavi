import React, { useState, useEffect } from 'react';
import { Filter, Search, Calendar, LayoutGrid, List, Copy, Trash2, XCircle, CheckCircle, Edit3, Eye, Download, Archive, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';
import EventCard from './EventCard';
import '../styles/MyEvents.css';

const MyEvents = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled', 'Archived', 'Drafts'];

  const loadEventsData = async () => {
    try {
      setIsLoading(true);
      const allEvents = await dbService.getAll('events');
      const allBookings = await dbService.getAll('bookings');
      setEvents(allEvents || []);
      setBookings(allBookings || []);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will remove all associated tickets.')) {
      await dbService.delete('events', id);
      showToast('Event deleted successfully.', 'success');
      loadEventsData();
    }
  };

  const handleDuplicate = async (event) => {
    const duplicated = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
      name: `Copy of ${event.name}`,
      status: 'Draft',
      createdAt: new Date().toISOString()
    };
    await dbService.create('events', duplicated);
    showToast(`Duplicated event successfully as "${duplicated.name}"!`, 'success');
    loadEventsData();
  };

  const handleStatusChange = async (id, newStatus) => {
    await dbService.update('events', id, { status: newStatus });
    showToast(`Event status updated to ${newStatus}.`, 'success');
    loadEventsData();
  };

  const handleToggleVisibility = async (event) => {
    const nextVisibility = event.visibility === 'Private' ? 'Public' : 'Private';
    await dbService.update('events', event.id, { visibility: nextVisibility });
    showToast(`Event visibility is now ${nextVisibility}.`, 'success');
    loadEventsData();
  };

  const handleExportCSV = () => {
    if (events.length === 0) {
      showToast('No events available to export.', 'error');
      return;
    }
    const headers = ['Event ID', 'Event Name', 'Category', 'Date', 'Venue', 'Status', 'Visibility', 'Bookings Limit'];
    const rows = events.map(e => [
      e.id,
      e.name || 'Unnamed',
      e.category || 'Event',
      e.startDate || e.date || 'TBA',
      e.isOnline ? 'Online' : (e.venue || 'Venue TBA'),
      e.status || 'Published',
      e.visibility || 'Public',
      e.bookingLimit || 'Unlimited'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `events_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Events catalog exported successfully!', 'success');
  };

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    if (!event || !event.id) return false;
    const matchesSearch = event.name ? event.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    
    let matchesTab = false;
    if (activeTab === 'All') matchesTab = event.status !== 'Archived'; // hide archived from general overview
    else if (activeTab === 'Upcoming' && (event.status || 'Published') === 'Published') matchesTab = true;
    else if (activeTab === 'Completed' && event.status === 'Completed') matchesTab = true;
    else if (activeTab === 'Cancelled' && event.status === 'Cancelled') matchesTab = true;
    else if (activeTab === 'Archived' && event.status === 'Archived') matchesTab = true;
    else if (activeTab === 'Drafts' && event.status === 'Draft') matchesTab = true;

    return matchesSearch && matchesTab;
  }) : [];

  return (
    <div className="org-my-events page-enter">
      <div className="org-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Manage Events</h1>
          <p className="org-subtitle">Monitor ticket sales, configure settings, and duplicate templates for past layouts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExportCSV} className="luxury-btn-outline" style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 16px', fontSize: '12px' }}>
            <Download size={14} /> Export CSV
          </button>
          <Link to="/organizer/create-event" className="luxury-btn-primary" style={{ textDecoration: 'none' }}>+ Create Event</Link>
        </div>
      </div>

      <div className="org-filters-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div className="org-tabs" style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--org-glass-border)', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`org-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--org-burgundy)' : 'transparent',
                border: 'none',
                color: activeTab === tab ? 'var(--org-gold)' : '#aaa',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: '0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="org-search-filter-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="org-search-box" style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--org-glass-border)',
            borderRadius: '8px',
            padding: '0 12px',
            height: '38px',
            width: '240px'
          }}>
            <Search size={16} color="var(--org-gold)" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '8px', width: '100%', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Grid/List View Toggles */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--org-glass-border)' }}>
            <button 
              onClick={() => setViewMode('grid')} 
              style={{ background: viewMode === 'grid' ? 'rgba(212,175,55,0.1)' : 'transparent', border: 'none', color: viewMode === 'grid' ? 'var(--org-gold)' : '#aaa', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{ background: viewMode === 'list' ? 'rgba(212,175,55,0.1)' : 'transparent', border: 'none', color: viewMode === 'list' ? 'var(--org-gold)' : '#aaa', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="org-events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredEvents.map(event => {
              const eventBookings = Array.isArray(bookings) ? bookings.filter(b => String(b.eventId) === String(event.id)) : [];
              const salesQty = eventBookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
              const totalRevenue = eventBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
              
              return (
                <div key={event.id} className="event-luxury-card-wrapper" style={{ position: 'relative' }}>
                  <div className="card-top-actions" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleDuplicate(event)} title="Duplicate Template" style={{ background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Copy size={12} /></button>
                    <button onClick={() => handleToggleVisibility(event)} title={event.visibility === 'Private' ? 'Make Public' : 'Make Private'} style={{ background: 'rgba(0,0,0,0.65)', border: 'none', color: event.visibility === 'Private' ? '#faad14' : '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {event.visibility === 'Private' ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    {event.status !== 'Archived' ? (
                      <button onClick={() => handleStatusChange(event.id, 'Archived')} title="Archive Event" style={{ background: 'rgba(0,0,0,0.65)', border: 'none', color: 'var(--org-gold)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Archive size={12} /></button>
                    ) : (
                      <button onClick={() => handleStatusChange(event.id, 'Published')} title="Publish Event" style={{ background: 'rgba(0,0,0,0.65)', border: 'none', color: '#52c41a', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CheckCircle size={12} /></button>
                    )}
                    <button onClick={() => handleDelete(event.id)} title="Delete Event" style={{ background: 'rgba(0,0,0,0.65)', border: 'none', color: '#ff4d4f', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                  <EventCard event={{
                    id: event.id,
                    name: event.name || 'Unnamed Event',
                    date: (() => {
                      if (!event.startDate && !event.date) return 'TBA';
                      const d = new Date(event.startDate || event.date);
                      return isNaN(d.getTime()) ? (event.startDate || event.date || 'TBA') : d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
                    })(),
                    location: event.isOnline ? 'Online Event' : `${event.city || event.venue || 'City'}, ${event.country || 'India'}`,
                    image: event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
                    sales: salesQty,
                    revenue: totalRevenue,
                    status: event.status || 'Published'
                  }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="luxury-card" style={{ padding: '8px', overflowX: 'auto' }}>
            <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Event Details</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Schedule</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Visibility</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Tickets Sold</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Revenue</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => {
                  const eventBookings = Array.isArray(bookings) ? bookings.filter(b => String(b.eventId) === String(event.id)) : [];
                  const salesQty = eventBookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
                  const totalRevenue = eventBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
                  
                  return (
                    <tr key={event.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=120'} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} alt="Thumb" />
                        <span style={{ fontWeight: '600', color: '#fff' }}>{event.name}</span>
                      </td>
                      <td style={{ padding: '16px', color: '#ccc', fontSize: '13px' }}>{event.startDate || event.date || 'TBA'}</td>
                      <td style={{ padding: '16px', color: '#ccc', fontSize: '13px' }}>{event.isOnline ? 'Online' : event.venue}</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>
                        <button 
                          onClick={() => handleToggleVisibility(event)} 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: event.visibility === 'Private' ? '#faad14' : '#52c41a', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {event.visibility === 'Private' ? <EyeOff size={14} /> : <Eye size={14} />}
                          {event.visibility || 'Public'}
                        </button>
                      </td>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: 'bold' }}>{salesQty}</td>
                      <td style={{ padding: '16px', color: 'var(--org-gold)', fontWeight: 'bold' }}>₹{totalRevenue.toLocaleString()}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge-status ${(event.status || 'Published').toLowerCase()}`}>{event.status || 'Published'}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => navigate(`/organizer/create-event?edit=${event.id}`)} title="Edit Event Settings" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: '#fff', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}><Edit3 size={14} /></button>
                          <button onClick={() => handleDuplicate(event)} title="Duplicate Event" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: '#fff', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}><Copy size={14} /></button>
                          {event.status !== 'Archived' ? (
                            <button onClick={() => handleStatusChange(event.id, 'Archived')} title="Archive" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: 'var(--org-gold)', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}><Archive size={14} /></button>
                          ) : (
                            <button onClick={() => handleStatusChange(event.id, 'Published')} title="Publish" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: '#52c41a', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}><CheckCircle size={14} /></button>
                          )}
                          <button onClick={() => handleDelete(event.id)} title="Delete Event" style={{ background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.2)', color: '#ff4d4f', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="org-empty-state" style={{ textAlign: 'center', padding: '40px', background: 'var(--org-bg-card)', border: '1px solid var(--org-glass-border)', borderRadius: '12px' }}>
          <Calendar size={48} color="var(--org-gold)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ color: '#fff' }}>No events found</h3>
          <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '6px' }}>Start creating your first premium event with our designer wizard.</p>
          <Link to="/organizer/create-event" className="luxury-btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>Create Event</Link>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
