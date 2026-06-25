import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket, Calendar, MapPin, Search, Download, Share2, X,
  ChevronDown, QrCode, CheckCircle, Clock, XCircle,
  ArrowLeft, Printer, Smartphone, Navigation
} from 'lucide-react';
import housePartyPoster from '../assets/home-tab/Stay Tuned Hyderabad 🙌🏻🥳.jpg';
import '../styles/MyTickets.css';

const MOCK_TICKETS = [
  {
    id: 't1', eventId: 'u1', eventTitle: 'Naach Bhajana Jam Night',
    eventDate: '14 Jun 2026', eventTime: '6:00 PM',
    eventVenue: 'Flip Side Adventure Park, Financial District, Hyderabad',
    ticketType: 'General Pass', holderName: 'Vihavi User',
    bookingRef: 'VHV-2026-0141', qrData: 'VHV-2026-0141',
    status: 'Active', purchaseDate: 'Jun 02, 2026', price: 499,
    image: housePartyPoster, tab: 'upcoming',
    countdown: '19 days',
    entryInstructions: 'Please arrive 30 minutes before the event starts. Carry this QR code for entry.',
    whatToBring: 'Valid ID proof, printed or digital ticket.',
    contactInfo: 'events@vihavi.dev | +91 98765 43210',
  },
  {
    id: 't2', eventId: 'r2', eventTitle: 'Tech Innovators Summit 2026',
    eventDate: 'Sep 10, 2026', eventTime: '9:00 AM',
    eventVenue: 'HITEX Exhibition Centre, Hyderabad',
    ticketType: 'VIP Pass', holderName: 'Vihavi User',
    bookingRef: 'VHV-2026-0198', qrData: 'VHV-2026-0198',
    status: 'Active', purchaseDate: 'Jun 15, 2026', price: 3500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400&h=240',
    tab: 'upcoming', countdown: '77 days',
    entryInstructions: 'VIP gate opens 1 hour before. Lounge access included.',
    whatToBring: 'VIP badge will be mailed to your email.',
    contactInfo: 'summit@techinnovators.in',
  },
  {
    id: 't3', eventId: 'past1', eventTitle: 'Startup Founders Meetup',
    eventDate: 'May 20, 2026', eventTime: '5:00 PM',
    eventVenue: 'T-Hub, Hyderabad',
    ticketType: 'General', holderName: 'Vihavi User',
    bookingRef: 'VHV-2026-0088', qrData: 'VHV-2026-0088',
    status: 'Used', purchaseDate: 'May 10, 2026', price: 200,
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&q=80&w=400&h=240',
    tab: 'past', countdown: null,
    entryInstructions: '', whatToBring: '', contactInfo: '',
  },
];

/* ── Simple SVG QR Code Mockup ── */
const QRCodeMockup = ({ data, size = 120 }) => {
  const cells = 9;
  const cell = size / cells;
  const hash = (str) => str.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  const seed = hash(data);
  const pattern = Array.from({ length: cells * cells }, (_, i) => {
    const r = Math.floor(i / cells), c = i % cells;
    if ((r < 3 && c < 3) || (r < 3 && c > cells - 4) || (r > cells - 4 && c < 3)) return true;
    return ((seed >> ((r * cells + c) % 32)) & 1) === 1;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8 }}>
      <rect width={size} height={size} fill="#fff" rx="4" />
      {pattern.map((on, i) => on && (
        <rect
          key={i} x={(i % cells) * cell + 2} y={Math.floor(i / cells) * cell + 2}
          width={cell - 2} height={cell - 2}
          fill={
            i % cells < 3 && Math.floor(i / cells) < 3 ? '#580f1d' :
            i % cells > cells - 4 && Math.floor(i / cells) < 3 ? '#580f1d' :
            i % cells < 3 && Math.floor(i / cells) > cells - 4 ? '#580f1d' : '#000'
          }
          rx="1"
        />
      ))}
    </svg>
  );
};

const MyTickets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Date');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const getStatusIcon = (s) => ({
    Active:    <CheckCircle size={13} color="#52c41a" />,
    Used:      <Clock size={13} color="rgba(255,255,255,0.3)" />,
    Cancelled: <XCircle size={13} color="#ff4d4f" />,
  }[s]);

  const getStatusStyle = (s) => ({
    Active:    { bg: 'rgba(82,196,26,0.12)', color: '#52c41a' },
    Used:      { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
    Cancelled: { bg: 'rgba(255,77,79,0.12)', color: '#ff4d4f' },
  }[s] || {});

  const filtered = MOCK_TICKETS
    .filter(t => t.tab === activeTab)
    .filter(t => !search || t.eventTitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="my-tickets-page">

      {/* ── Page Header ── */}
      <div className="tickets-page-header">
        <div>
          <h1 className="tickets-page-title">My Tickets</h1>
          <p className="tickets-page-sub">Manage all your event tickets in one place</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/user/home')}>
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="tickets-filter-bar">
        {/* Tab toggles */}
        <div className="ticket-tabs">
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(t => (
            <button
              key={t.key}
              className={`ticket-tab-btn ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className="tab-count">{MOCK_TICKETS.filter(tk => tk.tab === t.key).length}</span>
            </button>
          ))}
        </div>

        <div className="filter-right">
          {/* Search */}
          <div className="ticket-search-input">
            <Search size={13} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
            />
          </div>
          {/* Sort */}
          <div className="ticket-sort-select">
            <select value={sort} onChange={e => setSort(e.target.value)}>
              {['Date', 'Event Name', 'Purchase Date'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="tickets-results-count">
        {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
      </div>

      {/* ── Ticket Cards Grid ── */}
      {filtered.length > 0 ? (
        <div className="tickets-grid">
          {filtered.map(ticket => {
            const sStyle = getStatusStyle(ticket.status);
            return (
              <div key={ticket.id} className="ticket-card">
                {/* Event Banner */}
                <div className="tc-image-wrapper">
                  <img src={ticket.image} alt={ticket.eventTitle} className="tc-image" loading="lazy" />
                  {ticket.countdown && (
                    <span className="tc-countdown">
                      <Clock size={10} /> {ticket.countdown}
                    </span>
                  )}
                  <span className="tc-type-badge">{ticket.ticketType}</span>
                </div>

                {/* Card Body */}
                <div className="tc-body">
                  <h3 className="tc-title">{ticket.eventTitle}</h3>
                  <div className="tc-meta">
                    <span><Calendar size={11} /> {ticket.eventDate} • {ticket.eventTime}</span>
                    <span><MapPin size={11} /> {ticket.eventVenue.split(',')[0]}</span>
                  </div>

                  <div className="tc-info-row">
                    <div>
                      <div className="tc-label">Holder</div>
                      <div className="tc-value">{ticket.holderName}</div>
                    </div>
                    <div>
                      <div className="tc-label">Booking Ref</div>
                      <div className="tc-ref">{ticket.bookingRef}</div>
                    </div>
                  </div>

                  {/* QR Preview */}
                  <div className="tc-qr-preview">
                    <QRCodeMockup data={ticket.qrData} size={56} />
                    <div style={{ flex: 1 }}>
                      <div className="tc-label">Scan to Enter</div>
                      <div className="tc-ref" style={{ marginTop: 3 }}>{ticket.qrData}</div>
                    </div>
                    <span className="tc-status-badge" style={{ background: sStyle.bg, color: sStyle.color }}>
                      {getStatusIcon(ticket.status)} {ticket.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="tc-actions">
                    <button className="tc-primary-btn" onClick={() => setSelectedTicket(ticket)}>
                      <Ticket size={13} /> View Full Ticket
                    </button>
                    <button className="tc-icon-btn" aria-label="Download Ticket">
                      <Download size={14} />
                    </button>
                    <button className="tc-icon-btn" aria-label="Share Ticket">
                      <Share2 size={14} />
                    </button>
                  </div>

                  {ticket.status === 'Active' && (
                    <button className="tc-cancel-link">Cancel Booking</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="tickets-empty-state">
          <div className="empty-icon-wrapper">
            <Ticket size={48} style={{ color: 'rgba(212,175,55,0.3)' }} />
          </div>
          <h3>No {activeTab} tickets found</h3>
          <p>
            {activeTab === 'upcoming'
              ? 'You have no upcoming events. Browse events and book your first ticket!'
              : activeTab === 'past'
              ? 'No past events yet. Start attending events!'
              : 'No cancelled bookings.'}
          </p>
          {activeTab !== 'cancelled' && (
            <button className="cta-browse-btn" onClick={() => navigate('/user/home')}>
              Browse Events
            </button>
          )}
        </div>
      )}

      {/* ── Ticket Detail Modal ── */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedTicket(null)}>
              <X size={18} />
            </button>

            {/* Modal Banner */}
            <div className="modal-banner-wrapper">
              <img src={selectedTicket.image} alt={selectedTicket.eventTitle} className="modal-banner-img" />
              <div className="modal-banner-overlay">
                <span className="modal-ticket-type">{selectedTicket.ticketType}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="modal-body">
              <div className="modal-left">
                <h2 className="modal-event-title">{selectedTicket.eventTitle}</h2>
                <p className="modal-organizer">Organized by Vihavi Events</p>

                <div className="modal-event-meta">
                  {[
                    { icon: <Calendar size={15} />, label: 'Date & Time', value: `${selectedTicket.eventDate} at ${selectedTicket.eventTime}` },
                    { icon: <MapPin size={15} />, label: 'Venue', value: selectedTicket.eventVenue },
                    { icon: <Ticket size={15} />, label: 'Ticket Type', value: selectedTicket.ticketType },
                    { icon: <CheckCircle size={15} />, label: 'Purchase Date', value: selectedTicket.purchaseDate },
                  ].map(m => (
                    <div key={m.label} className="meta-row">
                      <span className="meta-icon-wrap">{m.icon}</span>
                      <div>
                        <div className="meta-label-txt">{m.label}</div>
                        <div className="meta-value-txt">{m.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Holder Info */}
                <div className="modal-section">
                  <div className="modal-section-title">Ticket Holder</div>
                  <div className="holder-info-row">
                    <div className="holder-avatar">{selectedTicket.holderName[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{selectedTicket.holderName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Primary Ticket Holder</div>
                    </div>
                  </div>
                </div>

                {/* Important info */}
                {selectedTicket.entryInstructions && (
                  <div className="modal-section">
                    <div className="modal-section-title">Important Information</div>
                    <div className="info-card">
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                        📋 {selectedTicket.entryInstructions}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                        🎒 {selectedTicket.whatToBring}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        📞 {selectedTicket.contactInfo}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: QR + Actions */}
              <div className="modal-right-panel">
                {/* Booking ref */}
                <div className="booking-ref-display">
                  <div className="brd-label">Booking Reference</div>
                  <div className="brd-value">{selectedTicket.bookingRef}</div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Ticket Price</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#D4AF37' }}>₹{selectedTicket.price.toLocaleString()}</div>
                </div>

                {/* Large QR */}
                <div className="large-qr-wrapper">
                  <QRCodeMockup data={selectedTicket.qrData} size={160} />
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 8, textAlign: 'center' }}>
                    Scan at entry gate
                  </div>
                </div>

                {/* Action buttons */}
                <div className="modal-action-buttons">
                  <button className="modal-action-btn">
                    <Download size={14} /> Download PDF
                  </button>
                  <button className="modal-action-btn">
                    <Calendar size={14} /> Add to Calendar
                  </button>
                  <button className="modal-action-btn">
                    <Smartphone size={14} /> Add to Wallet
                  </button>
                  <button className="modal-action-btn">
                    <Navigation size={14} /> Get Directions
                  </button>
                  <button className="modal-action-btn support-link" onClick={() => navigate('/user/home')}>
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
