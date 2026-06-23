import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import eventService from '../../services/eventService';
import '../styles/EventDetails.css';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Heart, Star,
  Music, Utensils, Car, ShieldCheck, Speaker
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, globalWishlistIds, toggleGlobalWishlist } = useOutletContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketSelection, setTicketSelection] = useState({});

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (error) {
        console.error('Failed to fetch event data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner"></div>Loading event details...</div>;
  if (!event) return <div className="error-container">Event not found.</div>;

  const handleQuantityChange = (ticketId, delta) => {
    setTicketSelection(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const totalTickets = Object.values(ticketSelection).reduce((a, b) => a + b, 0);
  const totalPrice = event.ticketTypes?.reduce((total, t) => total + (ticketSelection[t.id] || 0) * t.price, 0) || 0;

  const handleCheckout = () => {
    if (totalTickets === 0) {
      alert("Please select at least one ticket.");
      return;
    }
    // Navigate to checkout with selected tickets in state
    navigate(`/user/checkout/${id}`, { 
      state: { 
        event, 
        selectedTickets: ticketSelection, 
        totalTickets, 
        totalPrice 
      } 
    });
  };



  return (
    <div className="event-details-container">
      {/* Header Actions */}
      <div className="details-header-actions">
        <button className="icon-btn back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="actions-right">
          <button className="icon-btn wishlist-icon-btn" onClick={() => toggleGlobalWishlist(event)}>
            <Heart 
              size={22} 
              fill={globalWishlistIds.has(String(id)) ? '#FF3B30' : 'none'} 
              color={globalWishlistIds.has(String(id)) ? '#FF3B30' : '#B0B0B0'} 
            />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="details-hero">
        <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'} alt={event.name} />
      </div>

      <div className="details-content">
        {/* Event Header Info */}
        <div className="event-title-section">
          <span className="category-tag">{event.category}</span>
          <h1>{event.name}</h1>
          <div className="event-rating">
            <Star size={16} fill="#ffb400" color="#ffb400" />
            <span>{event.rating || 4.5}</span>
            <span className="reviews-count">(120 Reviews)</span>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="quick-info-bar">
          <div className="info-item">
            <Calendar size={20} className="info-icon" />
            <div>
              <p className="info-label">Date</p>
              <p className="info-value">{event.date}</p>
            </div>
          </div>
          <div className="info-item">
            <Clock size={20} className="info-icon" />
            <div>
              <p className="info-label">Time</p>
              <p className="info-value">{event.time || '18:00 PM'}</p>
            </div>
          </div>
          <div className="info-item">
            <MapPin size={20} className="info-icon" />
            <div>
              <p className="info-label">Venue</p>
              <p className="info-value">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="description-section">
          <h2>About Event</h2>
          <p>{event.description}</p>
        </div>

        {/* Highlights */}
        <div className="highlights-section">
          <h2>Highlights</h2>
          <div className="highlights-grid">
            <div className="highlight-item">
              <div className="hl-icon"><Music size={20} /></div>
              <div className="hl-text">
                <span className="hl-title">Top Artists</span>
                <span className="hl-subtitle">International & Local acts</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon"><Clock size={20} /></div>
              <div className="hl-text">
                <span className="hl-title">8+ Hours</span>
                <span className="hl-subtitle">Non-stop entertainment</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon"><Utensils size={20} /></div>
              <div className="hl-text">
                <span className="hl-title">Food & Drinks</span>
                <span className="hl-subtitle">Multiple food stalls</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon"><Car size={20} /></div>
              <div className="hl-text">
                <span className="hl-title">Parking</span>
                <span className="hl-subtitle">Available on-site</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon"><ShieldCheck size={20} /></div>
              <div className="hl-text">
                <span className="hl-title">Security</span>
                <span className="hl-subtitle">High-level security</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon"><Speaker size={20} /></div>
              <div className="hl-text">
                <span className="hl-title">Live DJ</span>
                <span className="hl-subtitle">After party with top DJs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="tickets-section">
          <h2>Select Tickets</h2>
          
          <div className="ticket-options">
            {event.ticketTypes?.map(ticket => (
              <div className="ticket-type-card" key={ticket.id}>
                <div className="ticket-type-info">
                  <h3>{ticket.name}</h3>
                  <p>{ticket.description}</p>
                  <span className="ticket-price">₹{ticket.price}</span>
                </div>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn" 
                    onClick={() => handleQuantityChange(ticket.id, -1)}
                    disabled={!ticketSelection[ticket.id]}
                  >-</button>
                  <span className="qty-value">{ticketSelection[ticket.id] || 0}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => handleQuantityChange(ticket.id, 1)}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout Bar */}
      <div className="sticky-checkout-bar">
        <div className="checkout-summary">
          <span className="total-label">{totalTickets} Ticket(s)</span>
          <span className="total-price">₹{totalPrice}</span>
        </div>
        <button 
          className="btn-checkout" 
          disabled={totalTickets === 0}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>

    </div>
  );
};

export default EventDetails;
