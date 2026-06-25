import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';

export default function Attendees() {
  const { showToast } = useToast();
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Checked In, Pending
  const [selectedEventId, setSelectedEventId] = useState('All');

  const loadAttendeesData = async () => {
    try {
      setIsLoading(true);
      const allAttendees = await dbService.getAll('attendees');
      const allEvents = await dbService.getAll('events');
      const allBookings = await dbService.getAll('bookings');
      setAttendees(allAttendees);
      setEvents(allEvents);
      setBookings(allBookings);
    } catch (err) {
      console.error('Failed to load attendees list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendeesData();
  }, []);

  // Handle manual toggle check-in action
  const toggleCheckIn = async (attendee) => {
    const updatedStatus = !attendee.checkedIn;
    const updatedAttendee = {
      ...attendee,
      checkedIn: updatedStatus,
      checkedInAt: updatedStatus ? new Date().toISOString() : null
    };

    // Update booking check-in state too
    const booking = bookings.find(b => String(b.id) === String(attendee.bookingId));
    if (booking) {
      await dbService.update('bookings', booking.id, {
        checkInStatus: updatedStatus ? 'Checked In' : 'Pending',
        checkedInAt: updatedStatus ? new Date().toISOString() : null
      });
    }

    await dbService.update('attendees', attendee.id, updatedAttendee);
    showToast(`Marked ${attendee.name} as ${updatedStatus ? 'Checked In' : 'Pending'}.`, 'success');
    loadAttendeesData();
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (filteredAttendees.length === 0) {
      showToast('No data available to export.', 'warning');
      return;
    }

    const headers = ['Attendee Name', 'Email', 'Phone', 'Company', 'Event', 'Check-In Status', 'Check-In Date/Time'];
    const rows = filteredAttendees.map(a => {
      const event = events.find(e => String(e.id) === String(a.eventId));
      return [
        a.name,
        a.email,
        a.phone || 'N/A',
        a.company || 'N/A',
        event ? event.name : 'Unknown Event',
        a.checkedIn ? 'Checked In' : 'Pending',
        (() => {
          if (!a.checkedInAt || a.checkedInAt === 'N/A') return 'N/A';
          const d = new Date(a.checkedInAt);
          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
        })()
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vihavi_attendees_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendees = Array.isArray(attendees) ? attendees.filter(a => {
    if (!a) return false;
    const name = a.name || '';
    const email = a.email || '';
    const event = Array.isArray(events) ? events.find(e => String(e.id) === String(a.eventId)) : null;
    const eventName = event ? event.name.toLowerCase() : '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eventName.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Checked In' && a.checkedIn) ||
      (statusFilter === 'Pending' && !a.checkedIn);

    const matchesEvent = selectedEventId === 'All' || String(a.eventId) === String(selectedEventId);

    return matchesSearch && matchesStatus && matchesEvent;
  }) : [];

  if (isLoading) {
    return <div className="organizer-loading">Loading Attendee Directory...</div>;
  }

  return (
    <div className="org-attendees-page">
      <div className="org-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Attendees</h1>
        <button className="luxury-btn-primary" onClick={exportToCSV} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter workspace toolbar */}
      <div className="luxury-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search bar */}
          <div className="org-search-box" style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--org-glass-border)',
            borderRadius: '8px',
            padding: '0 12px',
            height: '38px',
            flex: 2,
            minWidth: '200px'
          }}>
            <Search size={16} color="var(--org-gold)" />
            <input 
              type="text" 
              placeholder="Search by name, email or event..." 
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
          </div>

          {/* Event Select filter */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select 
              className="luxury-select" 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ height: '38px' }}
            >
              <option value="All">All Events</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Status Select filter */}
          <div style={{ flex: 1, minWidth: '120px' }}>
            <select 
              className="luxury-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: '38px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Checked In">Checked In Only</option>
              <option value="Pending">Pending Check-in</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Attendees Table List */}
      <div className="luxury-card" style={{ padding: '8px', overflowX: 'auto' }}>
        {filteredAttendees.length === 0 ? (
          <p style={{ color: 'var(--org-text-muted)', padding: '24px', textAlign: 'center' }}>No attendees found matching selection.</p>
        ) : (
          <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Attendee Info</th>
                <th>Company</th>
                <th>Event / Ticket</th>
                <th>Check-In Status</th>
                <th>Check-In Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map(a => {
                const event = events.find(e => String(e.id) === String(a.eventId));
                const booking = bookings.find(b => String(b.id) === String(a.bookingId));
                
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{a.name}</div>
                      <div style={{ color: 'var(--org-text-muted)', fontSize: '11px', marginTop: '2px' }}>{a.email} | {a.phone || 'No Phone'}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#ccc', fontSize: '13px' }}>{a.company || 'N/A'}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{event ? event.name : 'Unknown Event'}</div>
                      <div style={{ color: 'var(--org-gold)', fontSize: '11px', marginTop: '2px' }}>{booking ? booking.ticketName : 'General'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {a.checkedIn ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#52c41a', fontSize: '12px', fontWeight: 'bold' }}>
                          <CheckCircle2 size={14} /> Checked In
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#faad14', fontSize: '12px', fontWeight: 'bold' }}>
                          <AlertCircle size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '12px' }}>
                      {(() => {
                        if (!a.checkedInAt || a.checkedInAt === 'N/A') return 'N/A';
                        const d = new Date(a.checkedInAt);
                        if (isNaN(d.getTime())) return 'N/A';
                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
                      })()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleCheckIn(a)}
                        className={a.checkedIn ? 'luxury-btn-outline' : 'luxury-btn-primary'}
                        style={{
                          padding: '6px 14px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {a.checkedIn ? 'Undo Check-In' : 'Check In User'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
