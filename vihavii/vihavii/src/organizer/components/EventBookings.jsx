import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Filter, CheckSquare, Square, Check, X, ShieldAlert, BadgeCheck, AlertTriangle, ArrowUpDown, ChevronDown } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/EventBookings.css';

const EventBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [checkInFilter, setCheckInFilter] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Modals / Details Drawer
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(null); // stores booking object to approve/reject
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchBookingsData = async () => {
    try {
      setIsLoading(true);
      const [allBookings, allEvents] = await Promise.all([
        dbService.getAll('bookings'),
        dbService.getAll('events')
      ]);
      setBookings(allBookings || []);
      setEvents(allEvents || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Error loading bookings data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  // Handler for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Actions
  const handleToggleCheckIn = async (booking) => {
    const newStatus = booking.checkInStatus === 'Checked In' ? 'Pending' : 'Checked In';
    try {
      const updated = await dbService.update('bookings', booking.id, {
        checkInStatus: newStatus,
        checkedInAt: newStatus === 'Checked In' ? new Date().toISOString() : null
      });
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...updated } : b));
      showToast(`Checked ${newStatus === 'Checked In' ? 'in' : 'out'} ${booking.userName} successfully!`, 'success');
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const updated = await dbService.update('bookings', id, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
      showToast(`Booking ${status.toLowerCase()} successfully!`, 'success');
      setShowApprovalModal(null);
      if (activeBookingDetails && activeBookingDetails.id === id) {
        setActiveBookingDetails(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      showToast(`Processing bulk action: ${action}...`, 'success');
      await Promise.all(ids.map(id => {
        const payload = {};
        if (action === 'Confirm') payload.status = 'Confirmed';
        if (action === 'Cancel') payload.status = 'Cancelled';
        if (action === 'Check-In') {
          payload.checkInStatus = 'Checked In';
          payload.checkedInAt = new Date().toISOString();
        }
        if (action === 'Check-Out') {
          payload.checkInStatus = 'Pending';
          payload.checkedInAt = null;
        }
        return dbService.update('bookings', id, payload);
      }));
      showToast(`Successfully processed bulk action for ${ids.length} bookings!`, 'success');
      setSelectedIds(new Set());
      fetchBookingsData();
    } catch (err) {
      showToast('Bulk action failed.', 'error');
    }
  };

  // Checkbox handlers
  const handleSelectAll = (filteredList) => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(item => item.id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export filtered CSV
  const handleExportCSV = (filteredList) => {
    if (filteredList.length === 0) {
      showToast('No records to export.', 'error');
      return;
    }
    const headers = ['Booking ID', 'Attendee Name', 'Email', 'Phone', 'Event', 'Ticket Name', 'Quantity', 'Total Paid (INR)', 'Booking Date', 'Status', 'Check-In Status'];
    const rows = filteredList.map(b => [
      b.id,
      b.userName,
      b.userEmail || '',
      b.userPhone || '',
      b.eventName,
      b.ticketName,
      b.quantity,
      b.totalPaid,
      b.date,
      b.status,
      b.checkInStatus
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings CSV exported successfully!', 'success');
  };

  // Calculations derived from current bookings
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  // Filtered & Sorted bookings
  const filteredBookings = bookings
    .filter(b => {
      const matchesSearch = 
        b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.userEmail && b.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.eventName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchesEvent = eventFilter === 'All' || String(b.eventId) === String(eventFilter);
      const matchesCheckIn = checkInFilter === 'All' || b.checkInStatus === checkInFilter;

      return matchesSearch && matchesStatus && matchesEvent && matchesCheckIn;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortField === 'name') {
        comparison = a.userName.localeCompare(b.userName);
      } else if (sortField === 'amount') {
        comparison = a.totalPaid - b.totalPaid;
      } else if (sortField === 'qty') {
        comparison = a.quantity - b.quantity;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="org-bookings page-enter">
      {/* Page Header */}
      <div className="org-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Registration Bookings</h1>
          <p className="org-subtitle">Review ticket orders, manage entry approvals, and track attendee check-in logs</p>
        </div>
        <button className="luxury-btn-outline" onClick={() => handleExportCSV(filteredBookings)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="org-bookings-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Total Bookings</div>
          <div className="org-b-stat-value" style={{ color: '#fff' }}>{stats.total}</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Confirmed</div>
          <div className="org-b-stat-value" style={{ color: '#52c41a' }}>{stats.confirmed}</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Pending Approval</div>
          <div className="org-b-stat-value" style={{ color: '#faad14' }}>{stats.pending}</div>
        </div>
        <div className="org-b-stat">
          <div className="org-b-stat-label">Cancelled</div>
          <div className="org-b-stat-value" style={{ color: '#ff4d4f' }}>{stats.cancelled}</div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="luxury-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="org-search-box" style={{ flex: 1, minWidth: '260px', height: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="var(--org-gold)" />
            <input
              type="text"
              placeholder="Search attendee, booking ref, or event name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '8px', width: '100%', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Toggle Advanced Filters Button */}
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="luxury-btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 16px', fontSize: '12px' }}
          >
            <Filter size={14} /> {showAdvancedFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {/* Collapsible Advanced Filters Options */}
        {showAdvancedFilters && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Event Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
              <span style={{ fontSize: '11px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Filter by Event</span>
              <select 
                value={eventFilter}
                onChange={e => setEventFilter(e.target.value)}
                style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
              >
                <option value="All">All Events</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
              <span style={{ fontSize: '11px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Booking Status</span>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Check-In Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
              <span style={{ fontSize: '11px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Check-In Attendance</span>
              <select 
                value={checkInFilter}
                onChange={e => setCheckInFilter(e.target.value)}
                style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
              >
                <option value="All">All Attendance</option>
                <option value="Checked In">Checked-In Only</option>
                <option value="Pending">Pending Check-In</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Panel */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-banner animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '12px 20px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--org-gold)', fontWeight: '600' }}>
            {selectedIds.size} bookings selected for bulk action
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleBulkAction('Confirm')} className="luxury-btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>Confirm</button>
            <button onClick={() => handleBulkAction('Check-In')} className="luxury-btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }}>Check-in</button>
            <button onClick={() => handleBulkAction('Check-Out')} className="luxury-btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }}>Check-out</button>
            <button onClick={() => handleBulkAction('Cancel')} className="luxury-btn-outline" style={{ padding: '6px 12px', fontSize: '11px', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Cancel</button>
            <button onClick={() => setSelectedIds(new Set())} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Deselect</button>
          </div>
        </div>
      )}

      {/* Bookings Table list */}
      <div className="luxury-card" style={{ padding: '8px', overflow: 'visible' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--org-text-muted)' }}>Aggregating entries...</div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--org-text-muted)' }}>No bookings matches search filters.</div>
        ) : (
          <div className="table-scroll-wrapper">
            <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px', padding: '16px' }}>
                    <button 
                      onClick={() => handleSelectAll(filteredBookings)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--org-gold)', cursor: 'pointer', padding: 0 }}
                    >
                      {selectedIds.size === filteredBookings.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th onClick={() => handleSort('date')} style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Date <ArrowUpDown size={10} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Ref ID</th>
                  <th onClick={() => handleSort('name')} style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Attendee <ArrowUpDown size={10} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Event & Ticket</th>
                  <th onClick={() => handleSort('qty')} style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'center' }}>
                    Qty <ArrowUpDown size={10} style={{ display: 'inline' }} />
                  </th>
                  <th onClick={() => handleSort('amount')} style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Paid <ArrowUpDown size={10} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Check-in</th>
                  <th style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => {
                  const isSel = selectedIds.has(b.id);
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isSel ? 'rgba(212,175,55,0.02)' : 'transparent' }}>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleSelectOne(b.id)} 
                          style={{ background: 'transparent', border: 'none', color: isSel ? 'var(--org-gold)' : '#555', cursor: 'pointer', padding: 0 }}
                        >
                          {isSel ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#aaa' }}>{b.date}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'var(--org-gold)', fontFamily: 'monospace', fontWeight: 'bold' }}>{b.id}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>{b.userName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>{b.userEmail}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#eee', fontSize: '13px', fontWeight: '500' }}>{b.eventName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>{b.ticketName}</div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#fff', fontSize: '13px' }}>{b.quantity}</td>
                      <td style={{ padding: '16px', color: 'var(--org-gold)', fontWeight: 'bold', fontSize: '13px' }}>₹{(b.totalPaid || 0).toLocaleString()}</td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleToggleCheckIn(b)}
                          className={`badge-status ${b.checkInStatus === 'Checked In' ? 'confirmed' : 'pending'}`}
                          style={{ background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {b.checkInStatus === 'Checked In' ? <BadgeCheck size={12} /> : <Clock size={12} />}
                          {b.checkInStatus || 'Pending'}
                        </button>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge-status ${(b.status || 'Pending').toLowerCase()}`}>
                          {b.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setActiveBookingDetails(b)} 
                            className="luxury-btn-outline" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            Details
                          </button>
                          
                          {b.status === 'Pending' && (
                            <button 
                              onClick={() => setShowApprovalModal(b)} 
                              className="luxury-btn-primary" 
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Approval / Verify Modal */}
      {showApprovalModal && (
        <div className="v-modal-overlay" onClick={() => setShowApprovalModal(null)}>
          <div className="v-modal" onClick={e => e.stopPropagation()} style={{ background: '#101012', border: '1px solid var(--org-glass-border)' }}>
            <div className="v-modal-header">
              <h3 className="v-modal-title" style={{ color: '#fff' }}>Verify Booking Request</h3>
              <button className="v-modal-close" onClick={() => setShowApprovalModal(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}><X size={16} /></button>
            </div>
            <div className="v-modal-body" style={{ color: '#ccc' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.15)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                <ShieldAlert size={20} color="#ffc107" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '12px' }}>This attendee is registering for a premium session. Please manually approve or reject this booking after verifying ledger payment confirmation.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Attendee:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{showApprovalModal.userName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Email:</span>
                  <span style={{ color: '#fff' }}>{showApprovalModal.userEmail}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Phone:</span>
                  <span style={{ color: '#fff' }}>{showApprovalModal.userPhone || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Event:</span>
                  <span style={{ color: '#fff' }}>{showApprovalModal.eventName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Ticket Class:</span>
                  <span style={{ color: '#fff' }}>{showApprovalModal.ticketName} (x{showApprovalModal.quantity})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Total Amount Paid:</span>
                  <span style={{ color: 'var(--org-gold)', fontWeight: 'bold' }}>₹{showApprovalModal.totalPaid.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleUpdateStatus(showApprovalModal.id, 'Cancelled')} 
                  className="luxury-btn-outline" 
                  style={{ borderColor: '#ff4d4f', color: '#ff4d4f', padding: '10px 20px', borderRadius: '8px' }}
                >
                  Reject & Refund
                </button>
                <button 
                  onClick={() => handleUpdateStatus(showApprovalModal.id, 'Confirmed')} 
                  className="luxury-btn-primary"
                  style={{ padding: '10px 20px', borderRadius: '8px' }}
                >
                  Approve Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Drawer Modal */}
      {activeBookingDetails && (
        <div className="v-modal-overlay" onClick={() => setActiveBookingDetails(null)}>
          <div className="v-modal" onClick={e => e.stopPropagation()} style={{ background: '#101012', border: '1px solid var(--org-glass-border)' }}>
            <div className="v-modal-header">
              <h3 className="v-modal-title" style={{ color: '#fff' }}>Booking Details: {activeBookingDetails.id}</h3>
              <button className="v-modal-close" onClick={() => setActiveBookingDetails(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}><X size={16} /></button>
            </div>
            <div className="v-modal-body" style={{ color: '#ccc' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Registration Date:</span>
                  <span style={{ color: '#fff' }}>{activeBookingDetails.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Ticket Purchaser:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{activeBookingDetails.userName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Contact Email:</span>
                  <span style={{ color: '#fff' }}>{activeBookingDetails.userEmail}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Event Title:</span>
                  <span style={{ color: '#fff' }}>{activeBookingDetails.eventName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Ticket Selected:</span>
                  <span style={{ color: '#fff' }}>{activeBookingDetails.ticketName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Quantity Purchased:</span>
                  <span style={{ color: '#fff' }}>{activeBookingDetails.quantity} passes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Net Amount Paid:</span>
                  <span style={{ color: 'var(--org-gold)', fontWeight: 'bold', fontSize: '14px' }}>₹{(activeBookingDetails.totalPaid || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Check-In Attendance:</span>
                  <span className={`badge-status ${activeBookingDetails.checkInStatus === 'Checked In' ? 'confirmed' : 'pending'}`}>
                    {activeBookingDetails.checkInStatus}
                  </span>
                </div>
                {activeBookingDetails.checkedInAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--org-text-muted)' }}>Checked In Time:</span>
                    <span style={{ color: '#ccc' }}>{new Date(activeBookingDetails.checkedInAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--org-text-muted)' }}>Status:</span>
                  <span className={`badge-status ${(activeBookingDetails.status || '').toLowerCase()}`}>
                    {activeBookingDetails.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {activeBookingDetails.status === 'Confirmed' && (
                  <button 
                    onClick={() => handleUpdateStatus(activeBookingDetails.id, 'Cancelled')} 
                    className="luxury-btn-outline" 
                    style={{ borderColor: '#ff4d4f', color: '#ff4d4f', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Cancel Booking
                  </button>
                )}
                {activeBookingDetails.status === 'Cancelled' && (
                  <button 
                    onClick={() => handleUpdateStatus(activeBookingDetails.id, 'Confirmed')} 
                    className="luxury-btn-primary" 
                    style={{ padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Re-Confirm Booking
                  </button>
                )}
                <button 
                  onClick={() => setActiveBookingDetails(null)} 
                  className="luxury-btn-outline" 
                  style={{ padding: '8px 16px', borderRadius: '6px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBookings;
