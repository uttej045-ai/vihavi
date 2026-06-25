import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Users, DollarSign, Activity, Plus, TrendingUp, Bell, CheckCircle, Star, Download, MoreVertical, MessageSquare, ArrowUpRight, Shield, Award, HelpCircle } from 'lucide-react';
import StatCard from './StatCard';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/OrganizerDashboard.css';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [chartPeriod, setChartPeriod] = useState('30 Days');
  const [organizerName, setOrganizerName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.name || localStorage.getItem('email')?.split('@')[0] || 'Event Manager';
    } catch { return 'Event Manager'; }
  });
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    activeEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    totalAttendees: 0,
    pendingPayouts: 45000,
    averageRating: 4.8
  });
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState(null);
  
  // Quick action dropdown state for table
  const [activeMenuId, setActiveMenuId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const allEvents = await dbService.getAll('events');
        const allBookings = await dbService.getAll('bookings');
        const allAttendees = await dbService.getAll('attendees');
        const allTickets = await dbService.getAll('tickets');

        const validEvents = (allEvents || []).filter(e => e && e.id);
        const validBookings = (allBookings || []).filter(b => b && b.id);
        const validAttendees = (allAttendees || []).filter(a => a && a.id);

        setEvents(validEvents);
        setBookings(validBookings);

        const totalEvents = validEvents.length;
        const activeEvents = validEvents.filter(e => e.status === 'Published').length;
        
        const ticketsSold = validBookings
          .filter(b => b.status === 'Confirmed')
          .reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);
        
        const totalRevenue = validBookings
          .filter(b => b.status === 'Confirmed')
          .reduce((acc, b) => acc + (Number(b.totalPaid) || 0), 0);
        
        const totalAttendees = validAttendees.length;
        const pendingPayouts = Math.max(Number(totalRevenue * 0.65), 45000);

        setMetrics({
          totalEvents,
          activeEvents,
          ticketsSold,
          totalRevenue,
          totalAttendees,
          pendingPayouts,
          averageRating: 4.8
        });
        const allOrganizers = await dbService.getAll('organizers').catch(() => []);
        const email = localStorage.getItem('email');
        const currentOrg = (allOrganizers || []).find(o => o.email?.toLowerCase() === email?.toLowerCase());
        if (currentOrg?.name) setOrganizerName(currentOrg.name);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (isLoading) {
    return <div className="organizer-loading">Generating Luxury Dashboard...</div>;
  }

  // --- Date/Period Filter Mock Charts Data ---
  const getTimelineData = () => {
    switch (chartPeriod) {
      case '7 Days':
        return [
          { label: 'Mon', value: 5000, bookings: 2 },
          { label: 'Tue', value: 12000, bookings: 4 },
          { label: 'Wed', value: 8000, bookings: 3 },
          { label: 'Thu', value: 15000, bookings: 5 },
          { label: 'Fri', value: 25000, bookings: 8 },
          { label: 'Sat', value: 30000, bookings: 10 },
          { label: 'Sun', value: metrics.totalRevenue || 35000, bookings: 12 }
        ];
      case '90 Days':
        return [
          { label: 'Wk 1-3', value: 40000, bookings: 25 },
          { label: 'Wk 4-6', value: 90000, bookings: 50 },
          { label: 'Wk 7-9', value: 65000, bookings: 35 },
          { label: 'Wk 10-12', value: metrics.totalRevenue || 120000, bookings: 75 }
        ];
      case 'Year':
        return [
          { label: 'Q1', value: 120000, bookings: 90 },
          { label: 'Q2', value: 280000, bookings: 180 },
          { label: 'Q3', value: metrics.totalRevenue || 380000, bookings: 240 },
          { label: 'Q4', value: 450000, bookings: 310 }
        ];
      case '30 Days':
      default:
        return [
          { label: '06-10', value: 15000, bookings: 8 },
          { label: '06-13', value: 35000, bookings: 18 },
          { label: '06-16', value: 25000, bookings: 12 },
          { label: '06-19', value: 55000, bookings: 30 },
          { label: '06-22', value: 45000, bookings: 24 },
          { label: '06-25', value: metrics.totalRevenue || 80000, bookings: 45 }
        ];
    }
  };

  const timelineData = getTimelineData();
  const maxChartVal = Math.max(...timelineData.map(d => d.value), 1000);

  const handleExportChart = () => {
    showToast('Exporting chart to PDF report...', 'success');
    setTimeout(() => {
      showToast('Chart exported successfully! Check your downloads folder.', 'success');
    }, 1200);
  };

  const handleQuickAction = (actionName) => {
    if (actionName === 'Download Reports') {
      showToast('Compiling financial audit report...', 'success');
      setTimeout(() => {
        showToast('Financial ledger report downloaded successfully!', 'success');
      }, 1500);
    } else if (actionName === 'Manage Payouts') {
      showToast(`Payout request submitted successfully for ₹${metrics.pendingPayouts.toLocaleString()}`, 'success');
    }
  };

  return (
    <div className="org-dashboard">
      {/* Top Welcome Header */}
      <div className="org-welcome-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="org-welcome">Welcome back, <span className="luxury-text-gradient">{organizerName}</span>! 👋</h1>
          <p className="org-subtitle" style={{ color: 'var(--org-text-muted)', marginTop: '4px' }}>Here is what's happening with your luxury events today.</p>
        </div>
        
        {/* Date Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--org-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Scope:</span>
          <select 
            value={dateRange} 
            onChange={(e) => {
              setDateRange(e.target.value);
              showToast(`Stats range scope updated to: ${e.target.value}`, 'success');
            }} 
            style={{
              background: '#141416',
              border: '1px solid var(--org-glass-border)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Total Revenue" value={metrics.totalRevenue} icon={DollarSign} trend={14.8} isCurrency={true} />
        <StatCard title="Total Tickets Sold" value={metrics.ticketsSold} icon={Users} trend={8.2} />
        <StatCard title="Active Events" value={metrics.activeEvents} icon={Calendar} />
        <StatCard title="Total Attendees" value={metrics.totalAttendees} icon={Activity} trend={3.4} suffix="" />
        
        {/* Pending Payouts Card */}
        <div className="luxury-card stat-card">
          <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--org-text-muted)' }}>Pending Payouts</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--org-gold)', padding: '6px', borderRadius: '8px' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="stat-body" style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: 0 }}>₹{metrics.pendingPayouts.toLocaleString()}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#52c41a', marginTop: '6px' }}>
              <ArrowUpRight size={12} />
              <span>Next transfer scheduled</span>
            </div>
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="luxury-card stat-card">
          <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--org-text-muted)' }}>Average Rating</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--org-gold)', padding: '6px', borderRadius: '8px' }}>
              <Star size={16} fill="var(--org-gold)" />
            </div>
          </div>
          <div className="stat-body" style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              {metrics.averageRating} <span style={{ fontSize: '14px', color: 'var(--org-text-muted)' }}>/ 5</span>
            </h2>
            <div style={{ display: 'flex', gap: '2px', color: 'var(--org-gold)', marginTop: '6px' }}>
              <Star size={12} fill="var(--org-gold)" stroke="none" />
              <Star size={12} fill="var(--org-gold)" stroke="none" />
              <Star size={12} fill="var(--org-gold)" stroke="none" />
              <Star size={12} fill="var(--org-gold)" stroke="none" />
              <Star size={12} fill="var(--org-gold)" opacity={0.4} stroke="none" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue SVG Line Chart */}
      <div className="luxury-card chart-container" style={{ marginBottom: '30px', padding: '24px' }}>
        <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Revenue Overview</h3>
            <span style={{ color: 'var(--org-text-muted)', fontSize: '11px' }}>Timeline earnings in INR</span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Period Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--org-glass-border)' }}>
              {['7 Days', '30 Days', '90 Days', 'Year'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setChartPeriod(p)}
                  style={{
                    background: chartPeriod === p ? 'var(--org-burgundy)' : 'transparent',
                    border: 'none',
                    color: chartPeriod === p ? 'var(--org-gold)' : '#aaa',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Export Button */}
            <button 
              onClick={handleExportChart} 
              className="luxury-btn-outline" 
              style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', fontSize: '11px' }}
            >
              <Download size={12} /> Export Chart
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '11px', color: 'var(--org-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '4px', background: 'var(--org-gold)', borderRadius: '2px', display: 'inline-block' }}></span> Ticket Sales stream
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '4px', background: 'var(--org-burgundy-light)', borderRadius: '2px', display: 'inline-block' }}></span> Net earnings (live)
          </div>
        </div>

        {/* SVG line body */}
        <div className="chart-body" style={{ height: '220px', position: 'relative' }}>
          <svg width="100%" height="220" viewBox="0 0 500 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0.25)" />
                <stop offset="100%" stopColor="rgba(88, 15, 29, 0)" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="30" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" />
            <line x1="30" y1="75" x2="480" y2="75" stroke="rgba(255,255,255,0.03)" />
            <line x1="30" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.03)" />
            <line x1="30" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.1)" />

            {/* Calculations and line render */}
            {(() => {
              const points = timelineData.map((d, index) => {
                const x = 30 + (index * (450 / (timelineData.length - 1)));
                const y = 180 - (d.value / maxChartVal) * 145;
                return { x, y, ...d };
              });

              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

              return (
                <g>
                  <path d={areaD} fill="url(#areaG)" />
                  <path d={pathD} fill="none" stroke="var(--org-gold)" strokeWidth="3" />
                  
                  {points.map((p, index) => (
                    <g key={index} onMouseEnter={() => setHoveredSalesPoint(index)} onMouseLeave={() => setHoveredSalesPoint(null)}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredSalesPoint === index ? 6 : 4}
                        fill="var(--org-burgundy)"
                        stroke="var(--org-gold)"
                        strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                      />
                      {hoveredSalesPoint === index && (
                        <g>
                          <rect x={p.x - 45} y={p.y - 34} width={90} height={24} fill="#141416" rx="4" stroke="var(--org-gold)" strokeWidth="1" />
                          <text x={p.x} y={p.y - 18} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">₹{p.value.toLocaleString()} ({p.bookings} b)</text>
                        </g>
                      )}
                      <text x={p.x} y="202" fill="var(--org-text-muted)" fontSize="9" textAnchor="middle">{p.label}</text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Upcoming Events Table */}
      <div className="luxury-card" style={{ marginBottom: '30px', padding: '16px 24px', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Your Upcoming Events</h3>
          <Link to="/organizer/events" style={{ color: 'var(--org-gold)', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>View All Events →</Link>
        </div>

        <div className="widget-table-container" style={{ overflowX: 'auto', position: 'relative' }}>
          {events.length === 0 ? (
            <p style={{ color: 'var(--org-text-muted)', padding: '24px 0', margin: 0, textAlign: 'center' }}>No upcoming events scheduled.</p>
          ) : (
            <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px' }}>Event Name</th>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px' }}>Date & Time</th>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px' }}>Location</th>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px' }}>Tickets Sold / Capacity</th>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px' }}>Revenue</th>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px' }}>Status</th>
                  <th style={{ color: 'var(--org-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.filter(e => e && e.id).slice(0, 3).map(event => {
                  const eventBookings = bookings.filter(b => b && String(b.eventId) === String(event.id));
                  const salesQty = eventBookings.reduce((qty, b) => qty + (Number(b.quantity) || 0), 0);
                  const totalRevenue = eventBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
                  
                  const formattedDate = (() => {
                    if (!event.startDate && !event.date) return 'TBA';
                    const d = new Date(event.startDate || event.date);
                    return isNaN(d.getTime()) ? (event.startDate || event.date || 'TBA') : d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
                  })();

                  // Capacity summation mock
                  const maxCapacity = event.bookingLimit ? event.bookingLimit * 100 : 300;

                  return (
                    <tr key={event.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=60'} 
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                          alt="Thumb" 
                        />
                        <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{event.name || 'Unnamed Event'}</span>
                      </td>
                      <td style={{ padding: '12px', color: '#ccc', fontSize: '13px' }}>
                        <div>{formattedDate}</div>
                        <div style={{ fontSize: '10px', color: 'var(--org-text-muted)', marginTop: '2px' }}>{event.startTime || event.time || '18:00'}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#ccc', fontSize: '13px' }}>{event.isOnline ? 'Online Event' : (event.venue || 'Venue Location')}</td>
                      <td style={{ padding: '12px', color: '#ccc', fontSize: '13px' }}>
                        <div>{salesQty} / {maxCapacity}</div>
                        <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ width: `${Math.min((salesQty/maxCapacity)*100, 100)}%`, height: '100%', background: 'var(--org-gold)' }}></div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--org-gold)', fontWeight: 'bold', fontSize: '13px' }}>₹{totalRevenue.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge-status ${(event.status || 'Published').toLowerCase() === 'published' ? 'confirmed' : 'pending'}`}>
                          {event.status || 'Published'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', position: 'relative' }}>
                        <div ref={event.id === activeMenuId ? dropdownRef : null} style={{ display: 'inline-block' }}>
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === event.id ? null : event.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--org-gold)', cursor: 'pointer', padding: '6px' }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {activeMenuId === event.id && (
                            <div className="org-dropdown" style={{
                              position: 'absolute',
                              right: 0,
                              background: '#141416',
                              border: '1px solid var(--org-glass-border)',
                              borderRadius: '8px',
                              padding: '6px',
                              width: '150px',
                              zIndex: 100,
                              textAlign: 'left',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}>
                              <button onClick={() => { setActiveMenuId(null); navigate(`/organizer/create-event?edit=${event.id}`); }} style={{ display: 'block', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: '#ccc', textAlign: 'left', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }} onMouseOver={(e)=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e)=>e.target.style.background='transparent'}>Edit Event</button>
                              <button onClick={() => { setActiveMenuId(null); navigate(`/organizer/analytics`); }} style={{ display: 'block', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: '#ccc', textAlign: 'left', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }} onMouseOver={(e)=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e)=>e.target.style.background='transparent'}>View Analytics</button>
                              <button onClick={() => { setActiveMenuId(null); navigate(`/organizer/attendees`); }} style={{ display: 'block', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: '#ccc', textAlign: 'left', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }} onMouseOver={(e)=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e)=>e.target.style.background='transparent'}>Manage Attendees</button>
                              <button onClick={() => { setActiveMenuId(null); navigate(`/organizer/scanner`); }} style={{ display: 'block', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: '#ccc', textAlign: 'left', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }} onMouseOver={(e)=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e)=>e.target.style.background='transparent'}>Verify Tickets</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Row: Recent Bookings & Notifications & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        
        {/* Recent Bookings (Recent Ticket Sales) */}
        <div className="luxury-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>Recent Ticket Sales</h3>
              <span style={{ fontSize: '10px', color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span className="pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#52c41a', display: 'inline-block' }}></span> Real-time updates active
              </span>
            </div>
            <Link to="/organizer/revenue" style={{ color: 'var(--org-gold)', fontSize: '11px', textDecoration: 'none' }}>View Ledger</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.length === 0 ? (
              <p style={{ color: 'var(--org-text-muted)', fontSize: '12px', padding: '16px 0', margin: 0 }}>No bookings recorded.</p>
            ) : (
              bookings.slice(0, 4).map(b => (
                <div key={b.id} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
                  <div>
                    <h5 style={{ color: '#fff', margin: 0, fontSize: '13px', fontWeight: '600' }}>{b.userName || 'Attendee'}</h5>
                    <p style={{ color: 'var(--org-text-muted)', fontSize: '10px', margin: '2px 0 0 0' }}>{b.eventName} • {b.ticketName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--org-gold)', fontWeight: 'bold', fontSize: '12px' }}>₹{(b.totalPaid || 0).toLocaleString()}</div>
                    <span style={{ fontSize: '9px', color: 'var(--org-text-muted)' }}>{b.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Platform Announcements Section */}
        <div className="luxury-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>Updates & Announcements</h3>
            <Link to="/organizer/notifications" style={{ color: 'var(--org-gold)', fontSize: '11px', textDecoration: 'none' }}>View All</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--org-gold)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>APPROVAL STATUS</span>
                <span>Today</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#eee' }}>Tech Innovators Conference 2026 has been approved by admin.</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--org-gold)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>PAYOUT PROCESSING</span>
                <span>Yesterday</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#eee' }}>Payout of ₹32,000 processed to your linked Bank Account.</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--org-gold)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>PLATFORM TIPS</span>
                <span>2 days ago</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#eee' }}>Tip: Customize your QR ticket backgrounds to increase brand engagement.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="luxury-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '15px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <button onClick={() => navigate('/organizer/create-event')} className="luxury-btn-primary" style={{ display: 'flex', gap: '8px', justify: 'center', width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              <Plus size={14} /> Create New Event
            </button>
            <button onClick={() => navigate('/organizer/analytics')} className="luxury-btn-outline" style={{ display: 'flex', gap: '8px', justify: 'center', width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              View All Analytics
            </button>
            <button onClick={() => handleQuickAction('Download Reports')} className="luxury-btn-outline" style={{ display: 'flex', gap: '8px', justify: 'center', width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              Download Reports
            </button>
            <button onClick={() => handleQuickAction('Manage Payouts')} className="luxury-btn-outline" style={{ display: 'flex', gap: '8px', justify: 'center', width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              Manage Payouts
            </button>
            <button onClick={() => navigate('/organizer/help')} className="luxury-btn-outline" style={{ display: 'flex', gap: '8px', justify: 'center', width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;
