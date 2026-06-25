import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar, MapPin, Ticket, Heart, ArrowRight, Star, Clock,
  Bookmark, ChevronRight, TrendingUp, Users, Zap
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import '../styles/UserHome.css';
import housePartyPoster from '../assets/home-tab/Stay Tuned Hyderabad 🙌🏻🥳.jpg';

const RECOMMENDED_EVENTS = [
  { id: 'r1', title: 'Summer Music Festival', date: 'Aug 15, 2026', time: '6:00 PM', location: 'HICC, Hyderabad', price: 1500, category: 'Music', rating: 4.8, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400&h=240' },
  { id: 'r2', title: 'Tech Innovators Summit', date: 'Sep 10, 2026', time: '9:00 AM', location: 'HITEX, Hyderabad', price: 3500, category: 'Technology', rating: 4.9, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400&h=240' },
  { id: 'r3', title: 'Food & Wine Expo', date: 'Oct 5, 2026', time: '11:00 AM', location: 'Novotel, Mumbai', price: 800, category: 'Culinary', rating: 4.6, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400&h=240' },
  { id: 'r4', title: 'Dance Festival India', date: 'Nov 2, 2026', time: '7:00 PM', location: 'Jawaharlal Nehru Stadium, Delhi', price: 2000, category: 'Dance', rating: 4.7, image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&q=80&w=400&h=240' },
];

const UPCOMING_EVENTS = [
  {
    id: 'u1', title: 'Naach Bhajana Jam Night', date: '14 Jun 2026', time: '6:00 PM',
    location: 'Flip Side, Hyderabad', ticketType: 'General Pass', status: 'Active',
    image: housePartyPoster,
  },
];

const MOCK_BOOKINGS = [
  { id: 'b1', eventName: 'Tech Innovators Conference', date: 'Sep 10, 2026', qty: 2, amount: 7000, status: 'Confirmed', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=80&h=60' },
  { id: 'b2', eventName: 'Naach Bhajana Jam Night', date: 'Jun 14, 2026', qty: 1, amount: 499, status: 'Confirmed', image: housePartyPoster },
  { id: 'b3', eventName: 'Food & Wine Expo', date: 'Oct 5, 2026', qty: 3, amount: 2400, status: 'Pending', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=80&h=60' },
];

const UserHome = () => {
  const navigate = useNavigate();
  const { globalWishlistIds = new Set(), toggleGlobalWishlist } = useOutletContext() || {};
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [isLoading, setIsLoading] = useState(false);

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return (u.name || localStorage.getItem('email') || 'there').split(' ')[0];
    } catch { return 'there'; }
  })();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await dbService.getAll('recentBookings').catch(() => []);
        if (data && data.length > 0) setBookings(data);
      } catch { /* use mock */ }
    };
    loadBookings();
  }, []);

  const getStatusStyle = (s) => ({
    Confirmed: { bg: 'rgba(82,196,26,0.12)', color: '#52c41a' },
    Pending:   { bg: 'rgba(250,140,22,0.12)', color: '#fa8c16' },
    Cancelled: { bg: 'rgba(255,77,79,0.12)', color: '#ff4d4f' },
  }[s] || { bg: 'rgba(255,255,255,0.08)', color: '#fff' });

  return (
    <div className="attendee-home">

      {/* ── Welcome + Quick Stats ── */}
      <section className="attendee-welcome-section">
        <div className="welcome-content">
          <div className="welcome-greeting">
            <h1>Welcome back, <span className="welcome-name">{userName}</span> 👋</h1>
            <p>Discover and manage your event experiences</p>
          </div>
          <div className="quick-stats-row">
            <div className="quick-stat-card">
              <div className="qs-icon" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                <Calendar size={18} />
              </div>
              <div>
                <div className="qs-value">{UPCOMING_EVENTS.length}</div>
                <div className="qs-label">Upcoming Events</div>
              </div>
            </div>
            <div className="quick-stat-card">
              <div className="qs-icon" style={{ background: 'rgba(24,144,255,0.1)', color: '#1890ff' }}>
                <Ticket size={18} />
              </div>
              <div>
                <div className="qs-value">{bookings.length}</div>
                <div className="qs-label">Total Tickets</div>
              </div>
            </div>
            <div className="quick-stat-card">
              <div className="qs-icon" style={{ background: 'rgba(255,77,79,0.1)', color: '#ff4d4f' }}>
                <Bookmark size={18} />
              </div>
              <div>
                <div className="qs-value">{globalWishlistIds.size || 0}</div>
                <div className="qs-label">Saved Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events Section ── */}
      <section className="attendee-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Your Upcoming Events</h2>
            <p className="section-subtitle">Events you're registered for</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate('/user/tickets')}>
            View All Tickets <ChevronRight size={14} />
          </button>
        </div>

        {UPCOMING_EVENTS.length > 0 ? (
          <div className="upcoming-scroll-container">
            {UPCOMING_EVENTS.map(event => (
              <div key={event.id} className="upcoming-event-card">
                <div className="uec-image-wrapper">
                  <img src={event.image} alt={event.title} className="uec-image" loading="lazy" />
                  <span className="uec-status-badge">{event.status}</span>
                </div>
                <div className="uec-info">
                  <div className="uec-ticket-type">{event.ticketType}</div>
                  <h3 className="uec-title">{event.title}</h3>
                  <div className="uec-meta">
                    <span><Calendar size={12} /> {event.date} • {event.time}</span>
                    <span><MapPin size={12} /> {event.location}</span>
                  </div>
                  <button className="uec-cta" onClick={() => navigate('/user/tickets')}>
                    <Ticket size={13} /> View Ticket
                  </button>
                </div>
              </div>
            ))}

            {/* Browse more card */}
            <div className="upcoming-browse-card" onClick={() => navigate('/user/home')}>
              <Zap size={28} style={{ color: 'var(--gold)', marginBottom: 8, opacity: 0.6 }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                Explore more events
              </p>
              <button className="uec-cta">Browse Events</button>
            </div>
          </div>
        ) : (
          <div className="empty-upcoming">
            <Calendar size={40} style={{ color: 'rgba(212,175,55,0.3)', marginBottom: 12 }} />
            <p>No upcoming events yet</p>
            <button className="cta-primary-btn" onClick={() => navigate('/user/home')}>Browse Events</button>
          </div>
        )}
      </section>

      {/* ── Recommended Events ── */}
      <section className="attendee-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Recommended For You</h2>
            <p className="section-subtitle">Based on your interests</p>
          </div>
          <button className="view-all-btn">See All <ChevronRight size={14} /></button>
        </div>

        <div className="recommended-grid">
          {RECOMMENDED_EVENTS.map(event => {
            const isWishlisted = globalWishlistIds.has(String(event.id));
            return (
              <div key={event.id} className="rec-event-card" onClick={() => navigate(`/user/event/${event.id}`)}>
                <div className="rec-img-wrapper">
                  <img src={event.image} alt={event.title} className="rec-img" loading="lazy" />
                  <button
                    className={`rec-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleGlobalWishlist && toggleGlobalWishlist(event); }}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart size={14} fill={isWishlisted ? '#ff4d4f' : 'none'} color={isWishlisted ? '#ff4d4f' : '#fff'} />
                  </button>
                  <span className="rec-category-tag">{event.category}</span>
                </div>
                <div className="rec-info">
                  <h3 className="rec-title">{event.title}</h3>
                  <div className="rec-meta">
                    <span><Calendar size={11} /> {event.date}</span>
                    <span><MapPin size={11} /> {event.location}</span>
                  </div>
                  <div className="rec-footer">
                    <span className="rec-price">₹{event.price.toLocaleString()}</span>
                    <span className="rec-rating">
                      <Star size={11} fill="#D4AF37" color="#D4AF37" /> {event.rating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recent Bookings ── */}
      <section className="attendee-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Recent Bookings</h2>
            <p className="section-subtitle">Your latest ticket purchases</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate('/user/bookings')}>
            View All Bookings <ChevronRight size={14} />
          </button>
        </div>

        <div className="bookings-list">
          {bookings.slice(0, 5).map(booking => {
            const sStyle = getStatusStyle(booking.status);
            return (
              <div key={booking.id} className="booking-list-item">
                <div className="bli-image-wrapper">
                  {typeof booking.image === 'string' && booking.image.startsWith('http') ? (
                    <img src={booking.image} alt={booking.eventName} className="bli-image" />
                  ) : (
                    <img src={booking.image} alt={booking.eventName} className="bli-image" />
                  )}
                </div>
                <div className="bli-info">
                  <div className="bli-event-name">{booking.eventName}</div>
                  <div className="bli-meta">
                    <span><Calendar size={11} /> {booking.date}</span>
                    <span><Ticket size={11} /> {booking.qty || 1} ticket{(booking.qty || 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="bli-right">
                  <div className="bli-amount">₹{(booking.amount || 0).toLocaleString()}</div>
                  <span className="bli-status" style={{ background: sStyle.bg, color: sStyle.color }}>
                    {booking.status}
                  </span>
                  <button className="bli-view-btn" onClick={() => navigate('/user/bookings')}>View</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quick Actions Panel ── */}
      <section className="attendee-section quick-actions-panel">
        {[
          { label: 'Explore All Events', icon: <TrendingUp size={18} />, onClick: () => navigate('/user/home'), primary: true },
          { label: 'View My Tickets', icon: <Ticket size={18} />, onClick: () => navigate('/user/tickets') },
          { label: 'Browse Saved Events', icon: <Bookmark size={18} />, onClick: () => navigate('/user/wishlist') },
          { label: 'Update Profile', icon: <Users size={18} />, onClick: () => navigate('/user/profile') },
        ].map(action => (
          <button
            key={action.label}
            className={`quick-action-btn ${action.primary ? 'primary' : ''}`}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
            <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
          </button>
        ))}
      </section>
    </div>
  );
};

export default UserHome;