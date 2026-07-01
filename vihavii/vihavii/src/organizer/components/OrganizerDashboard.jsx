import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Users, DollarSign, Activity, Plus, TrendingUp, Bell, CheckCircle, Star, Download, MoreVertical, MessageSquare, ArrowUpRight, Shield, Award, HelpCircle, BarChart2, CheckSquare, ClipboardList, Clock, LayoutDashboard } from 'lucide-react';
import StatCard from './StatCard';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/OrganizerDashboard.css';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Dashboard Tabs
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview'); // 'overview' | 'revenue' | 'registrations' | 'attendance'
  
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
  const [attendees, setAttendees] = useState([]);
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

        const validEvents = (allEvents || []).filter(e => e && e.id);
        const validBookings = (allBookings || []).filter(b => b && b.id);
        const validAttendees = (allAttendees || []).filter(a => a && a.id);

        setEvents(validEvents);
        setBookings(validBookings);
        setAttendees(validAttendees);

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

  const handleExportData = (type) => {
    showToast(`Compiling and exporting ${type} report...`, 'success');
    setTimeout(() => {
      showToast(`${type} ledger downloaded successfully!`, 'success');
    }, 1200);
  };

  return (
    <div className="org-dashboard">
      {/* Top Welcome Header */}
      <div className="org-welcome-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="org-welcome">Welcome back, <span className="luxury-text-gradient">{organizerName}</span>! 👋</h1>
          <p className="org-subtitle" style={{ color: 'var(--org-text-muted)', marginTop: '4px' }}>Here is what's happening with your luxury events today.</p>
        </div>
        
        {/* Date Scope Filter */}
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
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Analytics Tabs Selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto', gap: '8px' }}>
        {[
          { id: 'overview', name: 'Overview', icon: LayoutDashboard },
          { id: 'revenue', name: 'Revenue Analytics', icon: DollarSign },
          { id: 'registrations', name: 'Registration Analytics', icon: Users },
          { id: 'attendance', name: 'Attendance Logs', icon: CheckSquare }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveDashboardTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeDashboardTab === t.id ? 'var(--org-burgundy)' : 'transparent',
                border: activeDashboardTab === t.id ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
                color: activeDashboardTab === t.id ? 'var(--org-gold)' : '#aaa',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: '0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} /> {t.name}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeDashboardTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Key Metrics Grid */}
          <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <StatCard title="Total Revenue" value={metrics.totalRevenue} icon={DollarSign} trend={14.8} isCurrency={true} />
            <StatCard title="Total Tickets Sold" value={metrics.ticketsSold} icon={Users} trend={8.2} />
            <StatCard title="Active Events" value={metrics.activeEvents} icon={Calendar} />
            <StatCard title="Average Rating" value={metrics.averageRating} icon={Star} trend={0} suffix="/ 5" />
          </div>

          {/* Revenue Overview chart block */}
          <div className="luxury-card chart-container" style={{ padding: '24px' }}>
            <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Revenue Trends</h3>
                <span style={{ color: 'var(--org-text-muted)', fontSize: '11px' }}>Timeline earnings in INR</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--org-glass-border)' }}>
                  {['7 Days', '30 Days', '90 Days', 'Year'].map(p => (
                    <button key={p} onClick={() => setChartPeriod(p)} style={{ background: chartPeriod === p ? 'var(--org-burgundy)' : 'transparent', border: 'none', color: chartPeriod === p ? 'var(--org-gold)' : '#aaa', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>{p}</button>
                  ))}
                </div>
                <button onClick={() => handleExportData('Revenue Chart')} className="luxury-btn-outline" style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', fontSize: '11px' }}><Download size={12} /> Export</button>
              </div>
            </div>

            <div className="chart-body" style={{ height: '220px', position: 'relative' }}>
              <svg width="100%" height="220" viewBox="0 0 500 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(212, 175, 55, 0.25)" />
                    <stop offset="100%" stopColor="rgba(88, 15, 29, 0)" />
                  </linearGradient>
                </defs>
                <line x1="30" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" />
                <line x1="30" y1="75" x2="480" y2="75" stroke="rgba(255,255,255,0.03)" />
                <line x1="30" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.03)" />
                <line x1="30" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.1)" />
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
                          <circle cx={p.x} cy={p.y} r={hoveredSalesPoint === index ? 6 : 4} fill="var(--org-burgundy)" stroke="var(--org-gold)" strokeWidth="2" style={{ cursor: 'pointer', transition: 'r 0.2s ease' }} />
                          {hoveredSalesPoint === index && (
                            <g>
                              <rect x={p.x - 45} y={p.y - 34} width={90} height={24} fill="#141416" rx="4" stroke="var(--org-gold)" strokeWidth="1" />
                              <text x={p.x} y={p.y - 18} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">₹{p.value.toLocaleString()}</text>
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

          {/* Details list split panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="luxury-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '15px' }}>Recent Sales Ledger</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookings.slice(0, 3).map(b => (
                  <div key={b.id} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
                    <div>
                      <h5 style={{ color: '#fff', margin: 0, fontSize: '13px' }}>{b.userName || b.user_name || 'Guest'}</h5>
                      <p style={{ color: 'var(--org-text-muted)', fontSize: '10px', margin: '2px 0 0 0' }}>{b.eventName || b.event_name || ''} • {b.ticketName || b.ticket_name || ''}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--org-gold)', fontWeight: 'bold', fontSize: '12px' }}>₹{Number(b.totalPaid || b.total_paid || 0).toLocaleString()}</div>
                      <span style={{ fontSize: '9px', color: 'var(--org-text-muted)' }}>{b.date || b.created_at || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="luxury-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '15px' }}>Important Updates</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
                  <div style={{ display: 'flex', justify: 'space-between', fontSize: '10px', color: 'var(--org-gold)', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>APPROVAL</span>
                    <span>Today</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#eee' }}>Tech Innovators Conference 2026 has been approved by admin.</p>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
                  <div style={{ display: 'flex', justify: 'space-between', fontSize: '10px', color: 'var(--org-gold)', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>PAYOUT</span>
                    <span>Yesterday</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#eee' }}>Payout of ₹45,000 processed to your bank account.</p>
                </div>
              </div>
            </div>

            <div className="luxury-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '15px' }}>Quick Operations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => navigate('/organizer/create-event')} className="luxury-btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold', display: 'flex', gap: '6px', justifyContent: 'center' }}><Plus size={14} /> Create Event</button>
                <button onClick={() => navigate('/organizer/bookings')} className="luxury-btn-outline" style={{ width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>Manage Bookings</button>
                <button onClick={() => navigate('/organizer/scanner')} className="luxury-btn-outline" style={{ width: '100%', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>Entry Check-in</button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* REVENUE ANALYTICS TAB */}
      {activeDashboardTab === 'revenue' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <StatCard title="Gross Earnings" value={metrics.totalRevenue} icon={DollarSign} trend={12.4} isCurrency={true} />
            <StatCard title="Payout Status" value={metrics.pendingPayouts} icon={Award} suffix=" Pending" isCurrency={true} />
            <StatCard title="Average Order Value" value={metrics.totalRevenue / (metrics.ticketsSold || 1)} icon={TrendingUp} isCurrency={true} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {/* SVG Bar Chart: Revenue by Event */}
            <div className="luxury-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Revenue Contribution by Event</h3>
              <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {events.map((ev, index) => {
                  const eventBookings = bookings.filter(b => String(b.eventId) === String(ev.id));
                  const revenue = eventBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
                  const maxRevenue = metrics.totalRevenue || 1000;
                  const heightPct = Math.max((revenue / maxRevenue) * 150, 15);
                  
                  return (
                    <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--org-gold)', fontWeight: 'bold', marginBottom: '8px' }}>₹{revenue.toLocaleString()}</span>
                      <div style={{ width: '28px', height: `${heightPct}px`, background: 'linear-gradient(180deg, var(--org-gold) 0%, var(--org-burgundy) 100%)', borderRadius: '4px 4px 0 0', boxShadow: '0 4px 15px rgba(212,175,55,0.1)' }}></div>
                      <span style={{ fontSize: '10px', color: 'var(--org-text-muted)', marginTop: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '60px', textAlign: 'center' }}>{ev.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly performance overview list */}
            <div className="luxury-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Monthly Ledger Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { month: 'June 2026', total: metrics.totalRevenue, status: 'Active' },
                  { month: 'May 2026', total: 32000, status: 'Paid out' },
                  { month: 'April 2026', total: 18000, status: 'Paid out' }
                ].map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{m.month}</div>
                      <div style={{ fontSize: '10px', color: 'var(--org-text-muted)' }}>Status: {m.status}</div>
                    </div>
                    <span style={{ color: 'var(--org-gold)', fontWeight: '800', fontSize: '14px' }}>₹{Number(m.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION ANALYTICS TAB */}
      {activeDashboardTab === 'registrations' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <StatCard title="Total Registrants" value={bookings.length} icon={Users} trend={11.0} />
            <StatCard title="Avg Tickets / Order" value={(metrics.ticketsSold / (bookings.filter(b=>b.status==='Confirmed').length || 1)).toFixed(1)} icon={ClipboardList} />
            <StatCard title="Conversion Ratio" value={14.8} icon={TrendingUp} suffix="%" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {/* SVG line: Daily Registrations trend */}
            <div className="luxury-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Daily Sign-Up Progression</h3>
              <div style={{ height: '200px', position: 'relative' }}>
                <svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="20" y1="10" x2="380" y2="10" stroke="rgba(255,255,255,0.03)" />
                  <line x1="20" y1="90" x2="380" y2="90" stroke="rgba(255,255,255,0.03)" />
                  <line x1="20" y1="150" x2="380" y2="150" stroke="rgba(255,255,255,0.1)" />
                  {(() => {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const values = [5, 12, 8, 15, 22, 30, 25];
                    const pts = values.map((v, i) => ({
                      x: 20 + i * (360 / 6),
                      y: 150 - (v / 30) * 130,
                      label: days[i],
                      val: v
                    }));
                    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    return (
                      <g>
                        <path d={linePath} fill="none" stroke="var(--org-gold)" strokeWidth="2" />
                        {pts.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--org-burgundy)" stroke="var(--org-gold)" strokeWidth="1.5" />
                            <text x={p.x} y="168" fill="var(--org-text-muted)" fontSize="9" textAnchor="middle">{p.label}</text>
                            <text x={p.x} y={p.y - 8} fill="#fff" fontSize="8" textAnchor="middle">{p.val}</text>
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Target event registrations progress bars */}
            <div className="luxury-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Event Registrations progression</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.map(ev => {
                  const registered = bookings.filter(b => String(b.eventId) === String(ev.id)).reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
                  const capacity = ev.bookingLimit ? ev.bookingLimit * 50 : 250;
                  const pct = Math.min(Math.round((registered / capacity) * 100), 100);
                  return (
                    <div key={ev.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fff', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '500' }}>{ev.name}</span>
                        <span style={{ color: 'var(--org-gold)' }}>{registered} / {capacity} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--org-gold)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE ANALYTICS TAB */}
      {activeDashboardTab === 'attendance' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <StatCard title="Checked In Attendees" value={attendees.filter(a => a.checkedIn).length} icon={CheckSquare} trend={0} />
            <StatCard title="Pending Check-in" value={bookings.filter(b=>b.checkInStatus!=='Checked In' && b.status==='Confirmed').length} icon={Clock} />
            <StatCard title="Attendance Rate" value={metrics.ticketsSold > 0 ? Math.round((attendees.filter(a => a.checkedIn).length / metrics.ticketsSold) * 100) : 75} icon={Activity} suffix="%" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Live attendance ratio card */}
            <div className="luxury-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'center' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#fff' }}>Overall Attendance Ratio</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  {/* Styled circular progress background */}
                  <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--org-gold)" strokeWidth="3" strokeDasharray="75 100" />
                  </svg>
                  <span style={{ position: 'absolute', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>75%</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--org-gold)', borderRadius: '20%' }}></span> Checked-In Attendees
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ccc' }}>
                    <span style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '20%' }}></span> Awaiting Check-In
                  </div>
                </div>
              </div>
            </div>

            {/* List of recent check-ins with verification badges */}
            <div className="luxury-card" style={{ padding: '20px', gridColumn: 'span 2' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#fff' }}>Recent Entry Logs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attendees.filter(a => a.checkedIn).slice(0, 4).map((a, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(82,196,26,0.1)', color: '#52c41a', display: 'flex', alignItems: 'center', justify: 'center' }}>
                        <CheckCircle size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{a.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--org-text-muted)' }}>Verified Entry Pass</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--org-text-muted)' }}>{a.checkedInAt ? new Date(a.checkedInAt).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                ))}
                {attendees.filter(a => a.checkedIn).length === 0 && (
                  <p style={{ color: 'var(--org-text-muted)', fontSize: '12px', textAlign: 'center', padding: '10px' }}>No attendee check-in logs recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
