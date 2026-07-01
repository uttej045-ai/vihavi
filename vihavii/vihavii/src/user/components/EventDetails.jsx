import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import eventService from '../../services/eventService';
import { dbService } from '../../services/dbService';
import '../styles/EventDetails.css';
import {
  ArrowLeft, Calendar, MapPin, Clock, Heart, Star,
  Share2, Copy, Twitter, Facebook, ChevronDown, ChevronUp,
  Users, Ticket, Info, ExternalLink, CheckCircle, Play, X
} from 'lucide-react';

/* ── FAQ Accordion ────────────────────────────────── */
const FaqItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ed-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="ed-faq-q">
        <span>{faq.q || faq.question}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {open && <div className="ed-faq-a">{faq.a || faq.answer}</div>}
    </div>
  );
};

/* ── Lightbox ─────────────────────────────────────── */
const Lightbox = ({ images, activeIdx, onClose }) => {
  const [idx, setIdx] = useState(activeIdx);
  if (!images || images.length === 0) return null;
  return (
    <div className="ed-lightbox-overlay" onClick={onClose}>
      <div className="ed-lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="ed-lightbox-close" onClick={onClose}><X size={20} /></button>
        <button className="ed-lightbox-prev" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>‹</button>
        <img src={images[idx]} alt="Gallery" className="ed-lightbox-img" />
        <button className="ed-lightbox-next" onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))} disabled={idx === images.length - 1}>›</button>
        <div className="ed-lightbox-counter">{idx + 1} / {images.length}</div>
      </div>
    </div>
  );
};

/* ── Share Modal ──────────────────────────────────── */
const ShareModal = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="v-modal-overlay" onClick={onClose}>
      <div className="v-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="v-modal-header">
          <span className="v-modal-title">Share Event</span>
          <button className="v-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="v-modal-body">
          <div className="ed-share-url">
            <span>{url.length > 48 ? url.substring(0, 48) + '...' : url}</span>
            <button onClick={copy} className="ed-copy-btn">
              {copied ? <CheckCircle size={14} color="#52c41a" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="ed-share-platforms">
            {[
              { label: 'Twitter / X', icon: <Twitter size={18} />, color: '#1DA1F2', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(event?.name)}&url=${encodeURIComponent(url)}` },
              { label: 'Facebook', icon: <Facebook size={18} />, color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
              { label: 'WhatsApp', icon: '💬', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(event?.name + ' ' + url)}` },
            ].map(p => (
              <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer" className="ed-share-platform-btn" style={{ '--platform-color': p.color }}>
                <span className="ed-share-platform-icon">{p.icon}</span>
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Mock enrichment data ─────────────────────────── */
const MOCK_SCHEDULE = [
  { time: '4:00 PM', title: 'Gates Open & Registration', desc: 'Collect your wristband and welcome kit.' },
  { time: '5:30 PM', title: 'Opening Act', desc: 'Local artists warm up the crowd.' },
  { time: '7:00 PM', title: 'Main Performance', desc: 'Headline artist takes the stage.' },
  { time: '9:30 PM', title: 'After Party', desc: 'DJ set and networking with VIP lounge access.' },
  { time: '11:00 PM', title: 'Event Concludes', desc: 'Safe transportation assistance available.' },
];

const MOCK_GALLERY = [
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600',
];

const MOCK_FAQS = [
  { q: 'What ID do I need to bring?', a: 'Please carry a valid government-issued photo ID (Aadhaar, PAN card, Passport, or Driving License).' },
  { q: 'Is outside food & drinks allowed?', a: 'No outside food or beverages are permitted inside the venue. Multiple food stalls will be available.' },
  { q: 'What is the refund policy?', a: 'Tickets are refundable up to 7 days before the event. After that, tickets are non-refundable but transferable.' },
  { q: 'Is parking available at the venue?', a: 'Yes, paid parking is available on-site. Pre-booking via the venue website is recommended for peak events.' },
  { q: 'Are tickets transferable?', a: 'Yes, tickets can be transferred to another person. Contact our support team at least 48 hours before the event.' },
];

const MOCK_SIMILAR = [
  { id: 's1', name: 'Jazz Night Hyderabad', date: 'Aug 22, 2026', price: 1200, category: 'Music', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=400&h=220' },
  { id: 's2', name: 'Dance Festival India', date: 'Nov 2, 2026', price: 2000, category: 'Dance', image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&q=80&w=400&h=220' },
  { id: 's3', name: 'Open Air Concert', date: 'Oct 15, 2026', price: 800, category: 'Music', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=220' },
];

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, globalWishlistIds, toggleGlobalWishlist } = useOutletContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketSelection, setTicketSelection] = useState({});
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch {
        try {
          const allEvents = await dbService.getAll('events');
          const found = (allEvents || []).find(e => String(e.id) === String(id));
          setEvent(found || null);
        } catch { setEvent(null); }
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  if (loading) return (
    <div className="page-enter" style={{ padding: '0 0 120px' }}>
      <div className="skeleton skeleton-banner" style={{ borderRadius: 0, height: 320 }} />
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        <div className="skeleton skeleton-card" style={{ marginTop: 16 }} />
      </div>
    </div>
  );

  if (!event) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div className="empty-state-icon">🎪</div>
      <div className="empty-state-title">Event Not Found</div>
      <div className="empty-state-subtitle">This event may have been removed or the link is incorrect.</div>
      <button className="ah-cta-btn" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Go Back</button>
    </div>
  );

  const handleQtyChange = (ticketId, delta) => {
    setTicketSelection(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const totalTickets = Object.values(ticketSelection).reduce((a, b) => a + b, 0);
  const totalPrice = event.ticketTypes?.reduce((total, t) => total + (ticketSelection[t.id] || 0) * t.price, 0) || 0;

  const handleCheckout = () => {
    if (totalTickets === 0) { showToast?.('Please select at least one ticket.', 'warning'); return; }
    navigate(`/user/checkout/${id}`, { state: { event, selectedTickets: ticketSelection, totalTickets, totalPrice } });
  };

  const gallery = event.gallery?.length > 0 ? event.gallery : MOCK_GALLERY;
  const faqs = event.faqs?.length > 0 ? event.faqs : MOCK_FAQS;
  const schedule = event.agenda?.length > 0 ? event.agenda.map(a => ({ time: a.time, title: a.title, desc: a.desc || a.speaker || '' })) : MOCK_SCHEDULE;

  const registeredCount = Math.floor(Math.random() * 400) + 120;
  const capacityPct = Math.min(100, Math.floor((registeredCount / 500) * 100));

  return (
    <div className="ed-container page-enter">

      {/* ── Hero Banner ── */}
      <div className="ed-hero">
        <img
          src={event.banner || event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'}
          alt={event.name}
          className="ed-hero-img"
        />
        <div className="ed-hero-overlay" />
        <div className="ed-hero-top-actions">
          <button className="ed-icon-action-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ed-icon-action-btn" onClick={() => setShowShare(true)}>
              <Share2 size={18} />
            </button>
            <button className="ed-icon-action-btn" onClick={() => toggleGlobalWishlist && toggleGlobalWishlist(event)}>
              <Heart
                size={18}
                fill={globalWishlistIds?.has(String(id)) ? '#ff4d4f' : 'none'}
                color={globalWishlistIds?.has(String(id)) ? '#ff4d4f' : '#fff'}
              />
            </button>
          </div>
        </div>
        <div className="ed-hero-bottom">
          <span className="ed-hero-category">{event.category}</span>
          <h1 className="ed-hero-title">{event.name}</h1>
          <div className="ed-hero-meta">
            <span><Calendar size={14} /> {event.date || event.startDate}</span>
            <span><Clock size={14} /> {event.time || event.startTime || '6:00 PM'}</span>
            <span><MapPin size={14} /> {event.location || event.venue || event.city}</span>
          </div>
        </div>
      </div>

      {/* ── Registration Stats Bar ── */}
      <div className="ed-reg-bar">
        <div className="ed-reg-item">
          <Users size={16} />
          <span><strong>{registeredCount}</strong> registered</span>
        </div>
        <div className="ed-reg-progress">
          <div className="v-progress-bar" style={{ flex: 1 }}>
            <div className="v-progress-fill" style={{ width: `${capacityPct}%` }} />
          </div>
          <span className="ed-reg-pct">{capacityPct}% full</span>
        </div>
        <div className="ed-reg-item">
          <Star size={16} fill="#ffb400" color="#ffb400" />
          <span><strong>{event.rating || 4.8}</strong> (120 reviews)</span>
        </div>
      </div>

      <div className="ed-body">

        {/* ── Left Content ── */}
        <div className="ed-main-content">

          {/* Tabs */}
          <div className="ed-tabs">
            {['about', 'schedule', 'gallery', 'faq'].map(tab => (
              <button
                key={tab}
                className={`ed-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="animate-fade-in">
              <div className="ed-card">
                <h2 className="ed-card-title">About This Event</h2>
                <p className="ed-description">{event.description || event.summary || 'Experience an unforgettable event with top-tier entertainment, great food, and an amazing atmosphere. This is a must-attend event for everyone who loves great experiences.'}</p>

                {/* Highlights */}
                <div className="ed-highlights">
                  {[
                    { icon: '🎵', title: 'Live Music', desc: 'International & local acts' },
                    { icon: '🍽️', title: 'Food & Drinks', desc: 'Multiple stalls available' },
                    { icon: '🅿️', title: 'Parking', desc: 'Available on-site' },
                    { icon: '🛡️', title: 'Security', desc: 'Professional team on-duty' },
                    { icon: '♿', title: 'Accessible', desc: 'Wheelchair friendly venue' },
                    { icon: '📸', title: 'Photo Zone', desc: 'Dedicated selfie spots' },
                  ].map(h => (
                    <div key={h.title} className="ed-highlight-chip">
                      <span className="ed-hl-icon">{h.icon}</span>
                      <div>
                        <div className="ed-hl-title">{h.title}</div>
                        <div className="ed-hl-desc">{h.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organizer Card */}
              <div className="ed-card ed-organizer-card">
                <h2 className="ed-card-title">Organized By</h2>
                <div className="ed-organizer-info">
                  <div className="ed-organizer-avatar">
                    {(event.organizerName || 'V')[0]}
                  </div>
                  <div>
                    <div className="ed-organizer-name">{event.organizerName || 'Vihavi Events'}</div>
                    <div className="ed-organizer-email">{event.organizerEmail || 'organizer@vihavi.dev'}</div>
                    <div className="ed-organizer-badges">
                      <span className="badge badge-success"><CheckCircle size={10} /> Verified</span>
                      <span className="badge badge-gold">⭐ 4.8 Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue Map */}
              <div className="ed-card">
                <h2 className="ed-card-title">Venue & Location</h2>
                <div className="ed-venue-info">
                  <div className="ed-venue-detail">
                    <MapPin size={16} color="#7A0019" />
                    <div>
                      <div className="ed-venue-name">{event.venue || event.location || 'Venue TBA'}</div>
                      <div className="ed-venue-address">{event.address || event.city || 'Address will be confirmed closer to event'}</div>
                    </div>
                  </div>
                  {event.mapsLink && (
                    <a href={event.mapsLink} target="_blank" rel="noopener noreferrer" className="ed-maps-link">
                      <ExternalLink size={14} /> Open in Maps
                    </a>
                  )}
                </div>
                <div className="ed-map-mock">
                  <div className="ed-map-grid" />
                  <div className="ed-map-pin">📍</div>
                  <div className="ed-map-label">{event.venue || event.city || 'Event Venue'}</div>
                </div>
              </div>

              {/* Terms */}
              <div className="ed-card">
                <div className="ed-terms-header" onClick={() => setShowTerms(!showTerms)}>
                  <h2 className="ed-card-title" style={{ margin: 0 }}>Terms & Conditions</h2>
                  {showTerms ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {showTerms && (
                  <div className="ed-terms-body animate-fade-in">
                    <p>{event.terms || 'Standard event terms apply. By registering, you agree to follow all venue rules and organizer guidelines. Tickets are non-refundable within 24 hours of the event. The organizer reserves the right to refuse entry.'}</p>
                    {event.refundPolicy && <p><strong>Refund Policy:</strong> {event.refundPolicy}</p>}
                    {event.cancellationPolicy && <p><strong>Cancellation:</strong> {event.cancellationPolicy}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="ed-card animate-fade-in">
              <h2 className="ed-card-title">Event Schedule & Timeline</h2>
              <div className="ed-timeline">
                {schedule.map((slot, i) => (
                  <div key={i} className="ed-timeline-item">
                    <div className="ed-timeline-connector">
                      <div className="ed-timeline-dot" />
                      {i < schedule.length - 1 && <div className="ed-timeline-line" />}
                    </div>
                    <div className="ed-timeline-content">
                      <div className="ed-timeline-time">{slot.time}</div>
                      <div className="ed-timeline-title">{slot.title}</div>
                      {slot.desc && <div className="ed-timeline-desc">{slot.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="ed-card animate-fade-in">
              <h2 className="ed-card-title">Event Gallery</h2>
              <div className="ed-gallery-grid">
                {gallery.map((img, i) => (
                  <div key={i} className="ed-gallery-thumb hover-scale" onClick={() => setLightboxIdx(i)}>
                    <img src={img} alt={`Gallery ${i + 1}`} />
                    <div className="ed-gallery-overlay">
                      <Play size={20} color="#fff" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="ed-card animate-fade-in">
              <h2 className="ed-card-title">Frequently Asked Questions</h2>
              <div className="ed-faqs">
                {faqs.map((faq, i) => <FaqItem key={i} faq={faq} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── Ticket Sidebar ── */}
        <div className="ed-ticket-sidebar">
          <div className="ed-ticket-card">
            <h3 className="ed-ticket-card-title">Select Tickets</h3>

            {event.ticketTypes?.length > 0 ? (
              event.ticketTypes.map(ticket => (
                <div key={ticket.id} className="ed-ticket-row">
                  <div className="ed-ticket-info">
                    <div className="ed-ticket-name">{ticket.name}</div>
                    <div className="ed-ticket-desc">{ticket.description}</div>
                    <div className="ed-ticket-price">₹{ticket.price?.toLocaleString()}</div>
                  </div>
                  <div className="ed-qty-controls">
                    <button className="ed-qty-btn" onClick={() => handleQtyChange(ticket.id, -1)} disabled={!ticketSelection[ticket.id]}>−</button>
                    <span className="ed-qty-val">{ticketSelection[ticket.id] || 0}</span>
                    <button className="ed-qty-btn" onClick={() => handleQtyChange(ticket.id, 1)}>+</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="ed-ticket-row">
                <div className="ed-ticket-info">
                  <div className="ed-ticket-name">General Admission</div>
                  <div className="ed-ticket-price">₹{(event.price || 0).toLocaleString()}</div>
                </div>
                <div className="ed-qty-controls">
                  <button className="ed-qty-btn" onClick={() => handleQtyChange('general', -1)} disabled={!ticketSelection['general']}>−</button>
                  <span className="ed-qty-val">{ticketSelection['general'] || 0}</span>
                  <button className="ed-qty-btn" onClick={() => handleQtyChange('general', 1)}>+</button>
                </div>
              </div>
            )}

            {totalTickets > 0 && (
              <div className="ed-ticket-total">
                <span>{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</span>
                <span className="ed-total-price">₹{totalPrice.toLocaleString()}</span>
              </div>
            )}

            <button className="ed-checkout-btn" disabled={totalTickets === 0} onClick={handleCheckout}>
              {totalTickets === 0 ? 'Select Tickets' : 'Proceed to Checkout'}
            </button>

            <div className="ed-ticket-note">
              <Info size={12} /> Secure checkout via Razorpay
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Events ── */}
      <div className="ed-similar-section">
        <div className="ah-section-header">
          <h2 className="ah-section-title">Similar Events You May Like</h2>
        </div>
        <div className="ed-similar-grid">
          {MOCK_SIMILAR.map(ev => (
            <div key={ev.id} className="ed-similar-card hover-lift" onClick={() => navigate(`/user/event/${ev.id}`)}>
              <div className="ed-similar-img">
                <img src={ev.image} alt={ev.name} />
                <div className="ed-similar-cat">{ev.category}</div>
              </div>
              <div className="ed-similar-body">
                <div className="ed-similar-name">{ev.name}</div>
                <div className="ed-similar-meta">
                  <span><Calendar size={11} /> {ev.date}</span>
                  <strong>₹{ev.price.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky Mobile Checkout Bar ── */}
      <div className="ed-sticky-bar">
        <div className="ed-sticky-info">
          <span className="ed-sticky-price">
            {event.ticketTypes?.[0]?.price ? `From ₹${event.ticketTypes[0].price.toLocaleString()}` : event.price ? `₹${Number(event.price).toLocaleString()}` : 'Free'}
          </span>
          <span className="ed-sticky-label">{totalTickets > 0 ? `${totalTickets} selected` : 'per ticket'}</span>
        </div>
        <button className="ed-checkout-btn ed-sticky-checkout" disabled={totalTickets === 0} onClick={handleCheckout}>
          {totalTickets === 0 ? 'Get Tickets' : `Checkout — ₹${totalPrice.toLocaleString()}`}
        </button>
      </div>

      {/* ── Modals ── */}
      {lightboxIdx !== null && (
        <Lightbox images={gallery} activeIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
      {showShare && <ShareModal event={event} onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default EventDetails;
