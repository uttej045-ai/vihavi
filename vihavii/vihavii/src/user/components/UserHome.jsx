import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar, MapPin, Ticket, Heart, ArrowRight, Star, Clock,
  Bookmark, ChevronRight, TrendingUp, Users, Zap, Bell,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Download,
  Search, Filter, Eye
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import '../styles/UserHome.css';

/* ─── Countdown Timer Component ─────────────────────── */
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  const calcTime = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  useEffect(() => {
    setTimeLeft(calcTime());
    const t = setInterval(() => setTimeLeft(calcTime()), 1000);
    return () => clearInterval(t);
  }, [calcTime]);

  return (
    <div className="countdown-timer">
      {[['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([k, label]) => (
        <React.Fragment key={k}>
          <div className="countdown-unit">
            <span className="countdown-value">{String(timeLeft[k] ?? 0).padStart(2, '0')}</span>
            <span className="countdown-label">{label}</span>
          </div>
          {k !== 's' && <span className="countdown-sep">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Mock data ──────────────────────────────────────── */
const MOCK_UPCOMING = [
  { id: '1', name: 'Summer Music Festival 2026', date: '2026-08-15', time: '6:00 PM', venue: 'Central Park Arena, NY', ticketType: 'VIP Pass', status: 'Active', banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600&h=300', category: 'Music' },
  { id: '2', name: 'Tech Innovators Conference 2026', date: '2026-09-10', time: '9:00 AM', venue: 'Moscone Center, SF', ticketType: 'Standard Pass', status: 'Active', banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600&h=300', category: 'Technology' },
];

const MOCK_HISTORY = [
  { id: 'h1', name: 'Food & Wine Expo 2025', date: '2025-10-05', venue: 'Novotel, Mumbai', attended: true, rating: 4, category: 'Food', banner: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=120&h=80' },
  { id: 'h2', name: 'Dance Festival India 2025', date: '2025-11-02', venue: 'JN Stadium, Delhi', attended: true, rating: 5, category: 'Dance', banner: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&q=80&w=120&h=80' },
  { id: 'h3', name: 'Comedy Night Live', date: '2025-09-20', venue: 'Kamani Auditorium', attended: false, rating: 0, category: 'Comedy', banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=120&h=80' },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'confirmed', title: 'Booking Confirmed', message: 'Your tickets for Summer Music Festival are confirmed.', time: '2 hours ago', read: false },
  { id: 'n2', type: 'reminder', title: 'Event Reminder', message: 'Tech Innovators Conference starts in 3 days. Don\'t miss it!', time: '1 day ago', read: false },
  { id: 'n3', type: 'updated', title: 'Event Updated', message: 'Food & Wine Expo schedule has been updated. Check details.', time: '3 days ago', read: true },
  { id: 'n4', type: 'cancelled', title: 'Event Cancelled', message: 'Comedy Open Mic on June 15 has been cancelled. Refund initiated.', time: '5 days ago', read: true },
];

const EXPLORE_EVENTS = [
  { id: 'e1', title: 'Jazz Night Hyderabad', date: 'Aug 22, 2026', price: 1200, category: 'Music', rating: 4.7, image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=400&h=240' },
  { id: 'e2', title: 'Startup Summit Bangalore', date: 'Sep 3, 2026', price: 4500, category: 'Business', rating: 4.9, image: 'https://images.unsplash.com/photo-1560439513-74b037a25d84?auto=format&fit=crop&q=80&w=400&h=240' },
  { id: 'e3', title: 'Art & Culture Expo', date: 'Sep 18, 2026', price: 600, category: 'Culture', rating: 4.6, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400&h=240' },
  { id: 'e4', title: 'Fitness Challenge 2026', date: 'Oct 1, 2026', price: 0, category: 'Sports', rating: 4.5, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400&h=240' },
];

/* ─── Main Component ─────────────────────────────────── */
const UserHome = () => {
  const navigate = useNavigate();
  const { globalWishlistIds = new Set(), toggleGlobalWishlist } = useOutletContext() || {};

  const [upcomingEvents, setUpcomingEvents] = useState(MOCK_UPCOMING);
  const [history] = useState(MOCK_HISTORY);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [exploreEvents] = useState(EXPLORE_EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNotifFilter, setActiveNotifFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return (u.name || localStorage.getItem('email') || 'there').split(' ')[0];
    } catch { return 'there'; }
  })();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, bookingsData] = await Promise.all([
          dbService.getAll('events').catch(() => []),
          dbService.getAll('bookings').catch(() => []),
        ]);
        const published = (eventsData || []).filter(e => e.status === 'Published');
        if (published.length > 0) {
          const mapped = published.slice(0, 3).map(e => ({
            id: e.id, name: e.name, date: e.startDate, time: e.startTime || '6:00 PM',
            venue: e.venue || e.city || 'Venue TBA', ticketType: 'General', status: 'Active',
            banner: e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600&h=300',
            category: e.category || 'Event'
          }));
          setUpcomingEvents(mapped);
        }
      } catch { /* keep mock */ }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const notifIcon = (type) => ({
    confirmed: <CheckCircle size={16} color="#52c41a" />,
    reminder:  <Bell size={16} color="#1890ff" />,
    updated:   <AlertCircle size={16} color="#faad14" />,
    cancelled: <XCircle size={16} color="#ff4d4f" />,
  }[type] || <Bell size={16} />);

  const filteredNotifs = activeNotifFilter === 'All'
    ? notifications
    : activeNotifFilter === 'Unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === activeNotifFilter.toLowerCase());

  const filteredExplore = exploreEvents.filter(e =>
    !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── LOADING SKELETON ── */
  if (isLoading) {
    return (
      <div className="attendee-home page-enter">
        <div className="ah-welcome-skeleton">
          <div className="skeleton skeleton-title" style={{ width: '200px', height: 32 }} />
          <div className="skeleton skeleton-text" style={{ width: '300px' }} />
        </div>
        <div className="ah-stats-row">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card ah-stat-skeleton" />)}
        </div>
        <div className="ah-section-skeleton">
          <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="attendee-home page-enter">

      {/* ── Welcome Banner ── */}
      <section className="ah-welcome-banner">
        <div className="ah-welcome-content">
          <div className="ah-welcome-greeting">
            <div className="ah-wave">👋</div>
            <div>
              <h1>Welcome back, <span className="ah-name">{userName}</span></h1>
              <p>Discover, book, and manage your event experiences all in one place.</p>
            </div>
          </div>
          <div className="ah-welcome-actions">
            <button className="ah-cta-btn" onClick={() => navigate('/user/home')}>
              <Search size={16} /> Explore Events
            </button>
            <button className="ah-cta-outline" onClick={() => navigate('/user/tickets')}>
              <Ticket size={16} /> My Tickets
            </button>
          </div>
        </div>
        <div className="ah-welcome-stats">
          {[
            { icon: <Calendar size={20} />, value: upcomingEvents.length, label: 'Upcoming', color: '#7A0019' },
            { icon: <Ticket size={20} />, value: 3, label: 'My Tickets', color: '#1890ff' },
            { icon: <Bookmark size={20} />, value: globalWishlistIds.size, label: 'Saved', color: '#D4AF37' },
            { icon: <CheckCircle size={20} />, value: history.filter(h => h.attended).length, label: 'Attended', color: '#52c41a' },
          ].map((stat, i) => (
            <div className="ah-stat-chip animate-fade-in-up" key={stat.label} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="ah-stat-chip-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div className="ah-stat-chip-value">{stat.value}</div>
                <div className="ah-stat-chip-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="ah-section">
        <div className="ah-section-header">
          <div>
            <h2 className="ah-section-title">Your Upcoming Events</h2>
            <p className="ah-section-subtitle">Events you're registered for</p>
          </div>
          <button className="ah-see-all" onClick={() => navigate('/user/tickets')}>
            View All <ChevronRight size={14} />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎪</div>
            <div className="empty-state-title">No upcoming events</div>
            <div className="empty-state-subtitle">Browse and register for events to see them here.</div>
            <button className="ah-cta-btn" onClick={() => navigate('/user/home')} style={{ marginTop: 8 }}>
              Explore Events
            </button>
          </div>
        ) : (
          <div className="ah-upcoming-grid">
            {upcomingEvents.map((event, i) => (
              <div
                key={event.id}
                className="ah-upcoming-card hover-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => navigate(`/user/event/${event.id}`)}
              >
                <div className="ah-upcoming-banner">
                  <img src={event.banner} alt={event.name} />
                  <div className="ah-upcoming-category">{event.category}</div>
                  <div className={`ah-upcoming-status ${event.status === 'Active' ? 'active' : 'inactive'}`}>
                    {event.status}
                  </div>
                </div>
                <div className="ah-upcoming-body">
                  <h3 className="ah-upcoming-name">{event.name}</h3>
                  <div className="ah-upcoming-meta">
                    <span><Calendar size={12} /> {event.date}</span>
                    <span><Clock size={12} /> {event.time}</span>
                    <span><MapPin size={12} /> {event.venue}</span>
                  </div>
                  <div className="ah-upcoming-ticket">
                    <Ticket size={12} /> {event.ticketType}
                  </div>
                  <div className="ah-upcoming-countdown-wrap">
                    <div className="ah-countdown-label">Event starts in:</div>
                    <CountdownTimer targetDate={event.date} />
                  </div>
                  <button className="ah-view-ticket-btn" onClick={e => { e.stopPropagation(); navigate('/user/tickets'); }}>
                    View Ticket <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Explore Events (Discover) ── */}
      <section className="ah-section">
        <div className="ah-section-header">
          <div>
            <h2 className="ah-section-title">Discover Events</h2>
            <p className="ah-section-subtitle">Find your next experience</p>
          </div>
          <div className="v-search-bar" style={{ width: 220 }}>
            <Search size={14} color="#999" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events..."
            />
          </div>
        </div>

        <div className="ah-explore-grid">
          {filteredExplore.map((event, i) => (
            <div
              key={event.id}
              className="ah-explore-card hover-lift animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => navigate(`/user/event/${event.id}`)}
            >
              <div className="ah-explore-img">
                <img src={event.image} alt={event.title} />
                <button
                  className="ah-wishlist-btn"
                  onClick={e => { e.stopPropagation(); toggleGlobalWishlist && toggleGlobalWishlist(event); }}
                >
                  <Heart
                    size={16}
                    fill={globalWishlistIds.has(String(event.id)) ? '#ff4d4f' : 'none'}
                    color={globalWishlistIds.has(String(event.id)) ? '#ff4d4f' : '#fff'}
                  />
                </button>
                <div className="ah-explore-category">{event.category}</div>
              </div>
              <div className="ah-explore-body">
                <h3 className="ah-explore-title">{event.title}</h3>
                <div className="ah-explore-meta">
                  <span><Calendar size={11} /> {event.date}</span>
                  <span className="ah-explore-rating"><Star size={11} fill="#ffb400" color="#ffb400" /> {event.rating}</span>
                </div>
                <div className="ah-explore-footer">
                  <span className="ah-explore-price">
                    {event.price === 0 ? <span className="ah-free-badge">FREE</span> : `₹${event.price.toLocaleString()}`}
                  </span>
                  <button className="ah-register-btn">Register</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom two-column: Event History + Notifications ── */}
      <div className="ah-two-col">

        {/* Event History */}
        <section className="ah-section v-section-card">
          <div className="ah-section-header v-section-card-header" style={{ padding: '20px 24px 0' }}>
            <div>
              <h2 className="ah-section-title v-section-card-title">Event History</h2>
              <p className="ah-section-subtitle v-section-card-subtitle">Your past attendance records</p>
            </div>
          </div>
          <div className="ah-history-list v-section-card-body">
            {history.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-title">No history yet</div>
              </div>
            ) : (
              history.map((item, i) => (
                <div key={item.id} className="ah-history-item animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <img src={item.banner} alt={item.name} className="ah-history-thumb" />
                  <div className="ah-history-info">
                    <div className="ah-history-name">{item.name}</div>
                    <div className="ah-history-meta">
                      <span><Calendar size={11} /> {item.date}</span>
                      <span><MapPin size={11} /> {item.venue}</span>
                    </div>
                    {item.rating > 0 && (
                      <div className="ah-history-rating">
                        {Array.from({ length: 5 }, (_, k) => (
                          <Star key={k} size={11} fill={k < item.rating ? '#ffb400' : '#ddd'} color={k < item.rating ? '#ffb400' : '#ddd'} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`badge ${item.attended ? 'badge-success' : 'badge-muted'}`}>
                    {item.attended ? 'Attended' : 'Absent'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="ah-section v-section-card">
          <div className="ah-section-header v-section-card-header" style={{ padding: '20px 24px 0' }}>
            <div>
              <h2 className="ah-section-title v-section-card-title">
                Notifications
                {unreadCount > 0 && <span className="ah-notif-badge">{unreadCount}</span>}
              </h2>
              <p className="ah-section-subtitle v-section-card-subtitle">Stay updated on your events</p>
            </div>
            {unreadCount > 0 && (
              <button className="ah-mark-read" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="ah-notif-filters">
            {['All', 'Unread', 'Confirmed', 'Reminder', 'Updated', 'Cancelled'].map(f => (
              <button
                key={f}
                className={`v-filter-tab ${activeNotifFilter === f ? 'active' : ''}`}
                onClick={() => setActiveNotifFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ah-notif-list v-section-card-body">
            {filteredNotifs.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">🔔</div>
                <div className="empty-state-title">No notifications</div>
              </div>
            ) : (
              filteredNotifs.map((n, i) => (
                <div
                  key={n.id}
                  className={`ah-notif-item animate-fade-in-up ${!n.read ? 'unread' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                >
                  <div className="ah-notif-icon">{notifIcon(n.type)}</div>
                  <div className="ah-notif-content">
                    <div className="ah-notif-title">{n.title}</div>
                    <div className="ah-notif-message">{n.message}</div>
                    <div className="ah-notif-time">{n.time}</div>
                  </div>
                  {!n.read && <div className="ah-notif-dot" />}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Quick Actions ── */}
      <section className="ah-quick-actions">
        {[
          { icon: <Ticket size={24} />, label: 'My Tickets', desc: 'View & download QR tickets', path: '/user/tickets', color: '#7A0019' },
          { icon: <Bookmark size={24} />, label: 'Saved Events', desc: 'Events you bookmarked', path: '/user/wishlist', color: '#D4AF37' },
          { icon: <Users size={24} />, label: 'My Profile', desc: 'Manage your account', path: '/user/profile', color: '#1890ff' },
          { icon: <TrendingUp size={24} />, label: 'Explore More', desc: 'Discover new experiences', path: '/user/home', color: '#52c41a' },
        ].map((action, i) => (
          <div
            key={action.label}
            className="ah-quick-action-card hover-lift animate-fade-in-up press-effect"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => navigate(action.path)}
          >
            <div className="ah-qa-icon" style={{ background: `${action.color}15`, color: action.color }}>
              {action.icon}
            </div>
            <div>
              <div className="ah-qa-label">{action.label}</div>
              <div className="ah-qa-desc">{action.desc}</div>
            </div>
            <ChevronRight size={16} className="ah-qa-arrow" />
          </div>
        ))}
      </section>

    </div>
  );
};

export default UserHome;