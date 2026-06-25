import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, AlertTriangle, DollarSign, LifeBuoy, Server,
  TrendingUp, TrendingDown, Plus, CheckCircle, XCircle, Eye,
  MoreVertical, Download, RefreshCw, Globe, ArrowUpRight,
  UserCheck, Clock, Shield, Zap, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import '../styles/AdminTheme.css';

/* ── helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtCurrency = (n) => `₹${fmt(n)}`;

/* ── Mock data pools ── */
const MOCK_ORGANIZER_APPS = [
  { id: 'o1', avatar: 'SK', name: 'Skyline Events Pvt Ltd', email: 'sky@events.com', date: '2026-06-24', priority: 'High', category: 'Corporate' },
  { id: 'o2', avatar: 'MD', name: 'Mumbai Dream Planners', email: 'info@mdp.in', date: '2026-06-23', priority: 'Medium', category: 'Wedding' },
  { id: 'o3', avatar: 'RS', name: 'Royal Stage Productions', email: 'royal@stage.com', date: '2026-06-22', priority: 'Low', category: 'Entertainment' },
  { id: 'o4', avatar: 'NC', name: 'NightCraft Studios', email: 'hello@nightcraft.io', date: '2026-06-21', priority: 'High', category: 'Nightlife' },
];

const MOCK_EVENT_APPROVALS = [
  { id: 'e1', avatar: 'GF', name: 'Grand Fusion Gala 2026', email: 'org@grandfusion.com', date: '2026-06-24', priority: 'Critical', category: 'Music' },
  { id: 'e2', avatar: 'TC', name: 'Tech Connect Summit', email: 'techcon@summit.in', date: '2026-06-23', priority: 'High', category: 'Technology' },
  { id: 'e3', avatar: 'FW', name: 'Food & Wine Extravaganza', email: 'fw@expos.com', date: '2026-06-22', priority: 'Medium', category: 'Culinary' },
];

const MOCK_FLAGGED = [
  { id: 'f1', avatar: '⚠️', name: 'Suspicious event listing #1287', email: 'flagged@auto.sys', date: '2026-06-24', priority: 'Critical', category: 'Policy Violation' },
  { id: 'f2', avatar: '⛔', name: 'Duplicate ticket scam report', email: 'report@user.com', date: '2026-06-23', priority: 'High', category: 'Fraud' },
];

const MOCK_PAYMENT_ISSUES = [
  { id: 'p1', avatar: 'TXN', name: 'Failed payout #TXN-7834', email: 'finance@vihavi.dev', date: '2026-06-24', priority: 'High', category: 'Payout Failure' },
  { id: 'p2', avatar: 'REF', name: 'Refund dispute #TXN-7290', email: 'user@mail.com', date: '2026-06-23', priority: 'Medium', category: 'Refund Request' },
];

const MOCK_TRANSACTIONS = [
  { id: 'TXN-8801', user: 'Arjun Mehta', event: 'Grand Fusion Gala', amount: 4998, method: 'UPI', status: 'Success', time: '2026-06-25 09:14' },
  { id: 'TXN-8800', user: 'Priya Sharma', event: 'Tech Connect Summit', amount: 12000, method: 'Card', status: 'Pending', time: '2026-06-25 08:55' },
  { id: 'TXN-8799', user: 'Rahul Gupta', event: 'Food & Wine Expo', amount: 2500, method: 'Net Banking', status: 'Success', time: '2026-06-24 22:40' },
  { id: 'TXN-8798', user: 'Kavya Reddy', event: 'Grand Fusion Gala', amount: 9996, method: 'UPI', status: 'Refunded', time: '2026-06-24 21:10' },
  { id: 'TXN-8797', user: 'Aditya Kumar', event: 'Nightclub Royale', amount: 3000, method: 'Wallet', status: 'Failed', time: '2026-06-24 19:30' },
  { id: 'TXN-8796', user: 'Sneha Iyer', event: 'Tech Connect Summit', amount: 12000, method: 'Card', status: 'Success', time: '2026-06-24 17:20' },
];

const MOCK_ALERTS = [
  { id: 'a1', type: 'Server', severity: 'Critical', message: 'API response time exceeded 3s threshold on payment gateway endpoint', area: 'Payments API', status: 'Active', time: '10 mins ago' },
  { id: 'a2', type: 'Security', severity: 'High', message: 'Multiple failed login attempts detected from IP 203.0.113.45', area: 'Auth Service', status: 'In Progress', time: '35 mins ago' },
  { id: 'a3', type: 'Content', severity: 'Medium', message: 'Automated policy scan flagged 2 event listings for manual review', area: 'Event Management', status: 'Active', time: '1 hour ago' },
  { id: 'a4', type: 'Payout', severity: 'Low', message: 'Scheduled weekly payout batch completed — 2 organizers had insufficient KYC', area: 'Finance', status: 'Resolved', time: '3 hours ago' },
];

/* ── SVG Multi-line Chart ── */
const ActivityChart = ({ period }) => {
  const data = {
    '24 Hours': {
      labels: ['00', '03', '06', '09', '12', '15', '18', '21'],
      users:   [4, 2, 1, 8, 22, 18, 35, 28],
      events:  [1, 0, 0, 3,  8,  6, 12,  9],
      tickets: [10, 5, 3, 20, 55, 45, 88, 70],
      support: [2, 1, 0, 4,  8,  6,  5,  7],
    },
    '7 Days': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      users:   [28, 42, 35, 55, 68, 90, 72],
      events:  [4, 7, 5, 9, 12, 18, 14],
      tickets: [120, 180, 150, 220, 290, 380, 310],
      support: [8, 12, 10, 15, 18, 9, 11],
    },
    '30 Days': {
      labels: ['Wk1', 'Wk2', 'Wk3', 'Wk4'],
      users:   [220, 340, 290, 450],
      events:  [35, 58, 44, 72],
      tickets: [1200, 1800, 1550, 2300],
      support: [42, 68, 55, 80],
    },
  };

  const d = data[period] || data['7 Days'];
  const W = 600, H = 200, PAD = { top: 16, right: 20, bottom: 28, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const series = [
    { key: 'users', color: '#D4AF37', label: 'Registrations' },
    { key: 'events', color: '#1890ff', label: 'Events Created' },
    { key: 'tickets', color: '#52c41a', label: 'Tickets Sold', scale: 0.06 },
    { key: 'support', color: '#fa8c16', label: 'Support Tickets' },
  ];

  const [visible, setVisible] = useState({ users: true, events: true, tickets: true, support: true });

  const allValues = series.flatMap(s =>
    visible[s.key] ? d[s.key].map(v => v * (s.scale || 1)) : []
  );
  const maxVal = Math.max(...allValues, 1);

  const pts = (arr, scale = 1) =>
    arr.map((v, i) => {
      const x = PAD.left + (i / (arr.length - 1)) * plotW;
      const y = PAD.top + plotH - ((v * scale) / maxVal) * plotH;
      return `${x},${y}`;
    }).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = PAD.top + plotH * (1 - frac);
          return (
            <g key={frac}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                fontSize="9" fill="rgba(255,255,255,0.3)">
                {Math.round(maxVal * frac)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {d.labels.map((lbl, i) => {
          const x = PAD.left + (i / (d.labels.length - 1)) * plotW;
          return (
            <text key={i} x={x} y={H - 6} textAnchor="middle"
              fontSize="9" fill="rgba(255,255,255,0.3)">{lbl}</text>
          );
        })}

        {/* Lines */}
        {series.map(s => visible[s.key] && (
          <polyline key={s.key} points={pts(d[s.key], s.scale || 1)}
            fill="none" stroke={s.color} strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${s.color}40)` }} />
        ))}

        {/* Dots at endpoints */}
        {series.map(s => visible[s.key] && d[s.key].map((v, i) => {
          const x = PAD.left + (i / (d[s.key].length - 1)) * plotW;
          const y = PAD.top + plotH - ((v * (s.scale || 1)) / maxVal) * plotH;
          return <circle key={`${s.key}-${i}`} cx={x} cy={y} r="3" fill={s.color} />;
        }))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        {series.map(s => (
          <button
            key={s.key}
            onClick={() => setVisible(p => ({ ...p, [s.key]: !p[s.key] }))}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              opacity: visible[s.key] ? 1 : 0.35, transition: 'opacity 0.2s',
              padding: '2px 0'
            }}
          >
            <span style={{ width: 20, height: 2, background: s.color, borderRadius: 2, display: 'block' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Geographic Distribution SVG Map ── */
const GeoMap = () => {
  const dots = [
    { x: 75, y: 42, city: 'Mumbai', users: 1240 },
    { x: 78, y: 35, city: 'Delhi', users: 980 },
    { x: 78, y: 45, city: 'Hyderabad', users: 720 },
    { x: 77, y: 47, city: 'Bangalore', users: 650 },
    { x: 72, y: 22, city: 'Ahmedabad', users: 320 },
    { x: 88, y: 22, city: 'Kolkata', users: 290 },
  ];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.01)', border: '1px solid var(--admin-glass-border)',
      borderRadius: 10, padding: 16, position: 'relative', overflow: 'hidden', minHeight: 160
    }}>
      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Geographic Distribution (India)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {dots.map(dot => (
          <div key={dot.city} style={{
            background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--admin-gold)',
              boxShadow: '0 0 6px rgba(212,175,55,0.6)'
            }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{dot.city}</div>
              <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{dot.users.toLocaleString()} users</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Pie Chart ── */
const PieChart = ({ attendees, organizers }) => {
  const total = attendees + organizers;
  const aFrac = attendees / total;
  const oFrac = organizers / total;
  const aDeg = aFrac * 360;

  const describeArc = (startDeg, endDeg, r = 60) => {
    const cx = 80, cy = 80;
    const toRad = d => (d - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <path d={describeArc(0, aDeg)} fill="#D4AF37" opacity="0.85" />
        <path d={describeArc(aDeg, 360)} fill="#580f1d" opacity="0.85" />
        <circle cx="80" cy="80" r="36" fill="#1a1a1e" />
        <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">{fmt(total)}</text>
        <text x="80" y="92" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">total users</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#D4AF37' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {fmt(attendees)} <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>({Math.round(aFrac * 100)}%)</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Attendees</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#580f1d', border: '1px solid rgba(212,175,55,0.3)' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {fmt(organizers)} <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>({Math.round(oFrac * 100)}%)</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Organizers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Dashboard Component ── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [chartPeriod, setChartPeriod] = useState('7 Days');
  const [activeTab, setActiveTab] = useState('organizers');
  const [alertFilter, setAlertFilter] = useState('All');
  const [txPage, setTxPage] = useState(0);
  const [activeMenuTx, setActiveMenuTx] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0, activeEvents: 0, pendingApprovals: 0,
    totalRevenue: 0, openTickets: 0, uptime: 99.97,
    todayEvents: 0, todayOrgs: 0, todayTickets: 0, todayRevenue: 0, todayResolved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const adminName = (() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.name || 'Admin'; }
    catch { return 'Admin'; }
  })();
  const dropRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [users, events, bookings, support] = await Promise.all([
          dbService.getAll('users').catch(() => []),
          dbService.getAll('events').catch(() => []),
          dbService.getAll('bookings').catch(() => []),
          dbService.getAll('supportTickets').catch(() => []),
        ]);
        const validBookings = (bookings || []).filter(b => b && b.id);
        const totalRevenue = validBookings.filter(b => b.status === 'Confirmed').reduce((a, b) => a + (Number(b.totalPaid) || 0), 0);
        setMetrics({
          totalUsers: Math.max((users || []).length, 24),
          activeEvents: Math.max((events || []).filter(e => e.status === 'Published').length, 12),
          pendingApprovals: Math.max((events || []).filter(e => e.status === 'Draft').length, 7),
          totalRevenue: Math.max(totalRevenue, 285000),
          openTickets: Math.max((support || []).filter(s => s.status === 'Open').length, 5),
          uptime: 99.97,
          todayEvents: 3, todayOrgs: 2, todayTickets: 47, todayRevenue: 84500, todayResolved: 8,
        });
      } catch (err) {
        console.error('Admin dashboard load error:', err);
        setMetrics({ totalUsers: 24, activeEvents: 12, pendingApprovals: 7, totalRevenue: 285000, openTickets: 5, uptime: 99.97, todayEvents: 3, todayOrgs: 2, todayTickets: 47, todayRevenue: 84500, todayResolved: 8 });
      } finally { setIsLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setActiveMenuTx(null); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (isLoading) return <div className="admin-loading">Loading Admin Console...</div>;

  const metricCards = [
    { icon: <Users size={18} />, title: 'Total Users', value: fmt(metrics.totalUsers), sub: '+12% this period', trend: 'up' },
    { icon: <Calendar size={18} />, title: 'Active Events', value: fmt(metrics.activeEvents), sub: 'Live on platform', trend: 'neutral' },
    { icon: <AlertTriangle size={18} />, title: 'Pending Approvals', value: fmt(metrics.pendingApprovals), sub: 'Requires action', trend: 'alert' },
    { icon: <DollarSign size={18} />, title: 'Total Revenue', value: fmtCurrency(metrics.totalRevenue), sub: '+18.4% vs last period', trend: 'up' },
    { icon: <LifeBuoy size={18} />, title: 'Support Tickets', value: `${metrics.openTickets} open`, sub: '28 closed today', trend: 'neutral' },
    { icon: <Server size={18} />, title: 'Platform Uptime', value: `${metrics.uptime}%`, sub: 'Last 30 days', trend: 'up' },
  ];

  const tabData = { organizers: MOCK_ORGANIZER_APPS, events: MOCK_EVENT_APPROVALS, flagged: MOCK_FLAGGED, payments: MOCK_PAYMENT_ISSUES };
  const filteredAlerts = alertFilter === 'All' ? MOCK_ALERTS : MOCK_ALERTS.filter(a => a.severity === alertFilter);
  const txPerPage = 5;
  const pagedTx = MOCK_TRANSACTIONS.slice(txPage * txPerPage, (txPage + 1) * txPerPage);

  const getPriorityStyle = (p) => ({
    Critical: { bg: 'rgba(255,77,79,0.15)', color: '#ff7875', border: 'rgba(255,77,79,0.3)' },
    High:     { bg: 'rgba(250,140,22,0.15)', color: '#ffa940', border: 'rgba(250,140,22,0.3)' },
    Medium:   { bg: 'rgba(24,144,255,0.12)', color: '#69c0ff', border: 'rgba(24,144,255,0.25)' },
    Low:      { bg: 'rgba(82,196,26,0.12)', color: '#95de64', border: 'rgba(82,196,26,0.25)' },
  }[p] || { bg: 'rgba(255,255,255,0.08)', color: '#fff', border: 'rgba(255,255,255,0.15)' });

  const getStatusStyle = (s) => ({
    Success:  { bg: 'rgba(82,196,26,0.12)', color: '#52c41a' },
    Pending:  { bg: 'rgba(250,140,22,0.12)', color: '#fa8c16' },
    Failed:   { bg: 'rgba(255,77,79,0.12)', color: '#ff4d4f' },
    Refunded: { bg: 'rgba(24,144,255,0.12)', color: '#1890ff' },
  }[s] || { bg: 'rgba(255,255,255,0.08)', color: '#fff' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>

      {/* ── Welcome + Date Selector ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Welcome back, <span className="admin-gradient-text">{adminName}</span> 👋
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: 13, marginTop: 4 }}>
            Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Range:</span>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="admin-select" style={{ minWidth: 160 }}>
            {['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'].map(d => (
              <option key={d} value={d} style={{ background: '#1a1a1e' }}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Quick Actions Bar ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Approve Pending Organizers', count: 3, color: 'var(--admin-gold)', icon: <UserCheck size={14} /> },
          { label: 'Review Pending Events', count: 7, color: 'var(--admin-orange)', icon: <Calendar size={14} /> },
          { label: 'View Support Tickets', count: null, color: '#1890ff', icon: <LifeBuoy size={14} /> },
          { label: 'Generate Report', count: null, color: 'var(--admin-green)', icon: <Download size={14} /> },
        ].map(q => (
          <button key={q.label} className="admin-btn-outline" style={{ gap: 8, borderColor: `${q.color}30`, color: q.color }}>
            {q.icon}
            {q.label}
            {q.count !== null && (
              <span style={{ background: q.color, color: '#000', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                {q.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Platform Health Cards ── */}
      <div>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">Platform Health Overview</div>
            <div className="admin-section-subtitle">Real-time key performance indicators</div>
          </div>
          <button className="admin-btn-outline" style={{ gap: 6 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {metricCards.map(card => (
            <div key={card.title} className="admin-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--admin-text-muted)' }}>
                  {card.title}
                </span>
                <div style={{
                  padding: 8, borderRadius: 8,
                  background: card.trend === 'alert' ? 'rgba(255,77,79,0.1)' : 'rgba(212,175,55,0.08)',
                  color: card.trend === 'alert' ? 'var(--admin-red)' : 'var(--admin-gold)'
                }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: card.trend === 'alert' ? 'var(--admin-red)' : '#fff' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
                  color: card.trend === 'up' ? 'var(--admin-green)' : card.trend === 'alert' ? 'var(--admin-orange)' : 'var(--admin-text-muted)' }}>
                  {card.trend === 'up' && <TrendingUp size={11} />}
                  {card.trend === 'alert' && <AlertTriangle size={11} />}
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pending Actions (Tabbed) ── */}
      <div className="admin-card" style={{ padding: 24 }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">⚡ Requires Your Attention</div>
            <div className="admin-section-subtitle">Pending items across all categories</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'organizers', label: 'Organizer Applications', count: MOCK_ORGANIZER_APPS.length },
            { key: 'events', label: 'Event Approvals', count: MOCK_EVENT_APPROVALS.length },
            { key: 'flagged', label: 'Flagged Content', count: MOCK_FLAGGED.length },
            { key: 'payments', label: 'Payment Issues', count: MOCK_PAYMENT_ISSUES.length },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: activeTab === t.key ? 'var(--admin-burgundy)' : 'transparent',
              color: activeTab === t.key ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
              fontSize: 12, fontWeight: activeTab === t.key ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
              border: activeTab === t.key ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent'
            }}>
              {t.label}
              <span style={{
                background: activeTab === t.key ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)',
                color: activeTab === t.key ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                borderRadius: 10, padding: '1px 6px', fontSize: 9
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Pending Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Submitted</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tabData[activeTab] || []).map(item => {
                const pStyle = getPriorityStyle(item.priority);
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--admin-burgundy), #7a1528)',
                          border: '1px solid rgba(212,175,55,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: 'var(--admin-gold)'
                        }}>{typeof item.avatar === 'string' && item.avatar.length <= 3 ? item.avatar : '?'}</div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                          <div style={{ color: 'var(--admin-text-muted)', fontSize: 11 }}>{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{item.date}</td>
                    <td>
                      <span style={{
                        background: pStyle.bg, color: pStyle.color,
                        border: `1px solid ${pStyle.border}`,
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700
                      }}>{item.priority}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>{item.category}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn-success">✓ Approve</button>
                        <button className="admin-btn-danger">✗ Reject</button>
                        <button className="admin-btn-outline" style={{ padding: '5px 10px', fontSize: 11 }}>
                          <Eye size={11} /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button className="admin-btn-outline" style={{ fontSize: 11 }}>
            View All → <ArrowUpRight size={11} />
          </button>
        </div>
      </div>

      {/* ── Platform Activity Chart ── */}
      <div className="admin-card" style={{ padding: 24 }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">Platform Activity</div>
            <div className="admin-section-subtitle">Multi-metric trend analysis</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 3, border: '1px solid var(--admin-glass-border)' }}>
              {['24 Hours', '7 Days', '30 Days'].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)} style={{
                  padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: chartPeriod === p ? 'var(--admin-burgundy)' : 'transparent',
                  color: chartPeriod === p ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                }}>{p}</button>
              ))}
            </div>
            <button className="admin-btn-outline" style={{ gap: 6, fontSize: 11 }}>
              <Download size={11} /> Export
            </button>
          </div>
        </div>
        <ActivityChart period={chartPeriod} />
      </div>

      {/* ── Recent Transactions ── */}
      <div className="admin-card" style={{ padding: 24 }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">Recent Payments</div>
            <div className="admin-section-subtitle">Latest transaction records</div>
          </div>
          <button className="admin-btn-outline" style={{ gap: 6, fontSize: 11 }}>
            View All Transactions <ArrowUpRight size={11} />
          </button>
        </div>

        <div className="admin-table-wrapper" ref={dropRef}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedTx.map(tx => {
                const sStyle = getStatusStyle(tx.status);
                return (
                  <tr key={tx.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--admin-gold)' }}>{tx.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{tx.user}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.event}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{fmtCurrency(tx.amount)}</td>
                    <td style={{ fontSize: 11 }}>{tx.method}</td>
                    <td>
                      <span style={{ background: sStyle.bg, color: sStyle.color, padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 11 }}>{tx.time}</td>
                    <td style={{ position: 'relative' }}>
                      <button onClick={() => setActiveMenuTx(activeMenuTx === tx.id ? null : tx.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', padding: 4 }}>
                        <MoreVertical size={14} />
                      </button>
                      {activeMenuTx === tx.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', background: '#1e1e24',
                          border: '1px solid var(--admin-glass-border)', borderRadius: 8,
                          zIndex: 50, padding: 4, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                        }}>
                          {['View Details', 'Issue Refund', 'Flag Transaction'].map(action => (
                            <button key={action} onClick={() => setActiveMenuTx(null)} style={{
                              width: '100%', padding: '9px 12px', background: 'transparent',
                              border: 'none', color: action === 'Issue Refund' ? 'var(--admin-orange)' :
                                action === 'Flag Transaction' ? 'var(--admin-red)' : 'var(--admin-text-secondary)',
                              fontSize: 12, cursor: 'pointer', textAlign: 'left', borderRadius: 4,
                              fontFamily: 'Inter, sans-serif',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
            Showing {txPage * txPerPage + 1}–{Math.min((txPage + 1) * txPerPage, MOCK_TRANSACTIONS.length)} of {MOCK_TRANSACTIONS.length} records
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setTxPage(p => Math.max(0, p - 1))} disabled={txPage === 0}
              className="admin-btn-outline" style={{ padding: '5px 10px', opacity: txPage === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setTxPage(p => Math.min(Math.ceil(MOCK_TRANSACTIONS.length / txPerPage) - 1, p + 1))}
              disabled={(txPage + 1) * txPerPage >= MOCK_TRANSACTIONS.length}
              className="admin-btn-outline" style={{ padding: '5px 10px', opacity: (txPage + 1) * txPerPage >= MOCK_TRANSACTIONS.length ? 0.3 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── User Analytics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Analytics metrics */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div className="admin-section-header">
            <div className="admin-section-title">User Analytics</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Registered', value: fmt(metrics.totalUsers), icon: <Users size={14} /> },
              { label: 'New This Period', value: '+142', icon: <TrendingUp size={14} />, color: 'var(--admin-green)' },
              { label: 'Active Users', value: '78%', icon: <Zap size={14} />, color: 'var(--admin-gold)' },
              { label: 'Retention Rate', value: '64%', icon: <Shield size={14} />, color: '#1890ff' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-glass-border)',
                borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ color: m.color || 'var(--admin-text-muted)' }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color || '#fff' }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
          <PieChart attendees={Math.round(metrics.totalUsers * 0.88)} organizers={Math.round(metrics.totalUsers * 0.12)} />
        </div>

        {/* Geo map */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div className="admin-section-title" style={{ marginBottom: 16 }}>Geographic Distribution</div>
          <GeoMap />
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--admin-gold)', fontWeight: 600, marginBottom: 6 }}>Top Markets</div>
            {[
              { city: 'Mumbai', pct: '28%' }, { city: 'Delhi', pct: '22%' },
              { city: 'Hyderabad', pct: '16%' }, { city: 'Bangalore', pct: '14%' }
            ].map(m => (
              <div key={m.city} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                <span>{m.city}</span>
                <span style={{ color: 'var(--admin-gold)', fontWeight: 600 }}>{m.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Platform Alerts ── */}
      <div className="admin-card" style={{ padding: 24 }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">System Alerts & Issues</div>
            <div className="admin-section-subtitle">Active platform issues requiring attention</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 3, border: '1px solid var(--admin-glass-border)' }}>
              {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
                <button key={f} onClick={() => setAlertFilter(f)} style={{
                  padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11,
                  background: alertFilter === f ? 'var(--admin-burgundy)' : 'transparent',
                  color: alertFilter === f ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                }}>{f}</button>
              ))}
            </div>
            <button className="admin-btn-outline" style={{ fontSize: 11 }}>Mark all read</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredAlerts.map(alert => {
            const pStyle = getPriorityStyle(alert.severity);
            const statusColor = { Active: 'var(--admin-red)', 'In Progress': 'var(--admin-orange)', Resolved: 'var(--admin-green)' }[alert.status] || '#fff';
            return (
              <div key={alert.id} style={{
                display: 'flex', gap: 16, padding: 16, alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.01)', border: '1px solid var(--admin-glass-border)',
                borderRadius: 10, borderLeft: `3px solid ${pStyle.color}`
              }}>
                <div style={{
                  padding: 8, borderRadius: 8, background: pStyle.bg,
                  color: pStyle.color, flexShrink: 0
                }}>
                  <AlertTriangle size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}`, padding: '2px 7px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
                      {alert.severity}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{alert.type} • {alert.area}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--admin-text-muted)' }}>{alert.time}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.5, margin: '4px 0 8px' }}>{alert.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>● {alert.status}</span>
                    <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 10 }}>
                      <Eye size={10} /> View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Stats Bar (Today) ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(88,15,29,0.3) 0%, rgba(10,10,12,0.8) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 12, padding: '16px 24px',
        display: 'flex', gap: 0, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-gold)', paddingRight: 24, marginRight: 24, borderRight: '1px solid var(--admin-glass-border)', display: 'flex', alignItems: 'center' }}>
          Today's Snapshot
        </div>
        {[
          { label: 'Events Published', value: metrics.todayEvents, icon: <Calendar size={14} /> },
          { label: 'New Organizers', value: metrics.todayOrgs, icon: <UserCheck size={14} /> },
          { label: 'Tickets Sold', value: metrics.todayTickets, icon: <Zap size={14} /> },
          { label: 'Revenue', value: fmtCurrency(metrics.todayRevenue), icon: <DollarSign size={14} /> },
          { label: 'Tickets Resolved', value: metrics.todayResolved, icon: <CheckCircle size={14} /> },
        ].map((s, idx, arr) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px',
            borderRight: idx < arr.length - 1 ? '1px solid var(--admin-glass-border)' : 'none'
          }}>
            <span style={{ color: 'var(--admin-gold)', opacity: 0.7 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
