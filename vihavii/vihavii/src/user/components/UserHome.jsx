import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Heart, MapPin, Ticket, Clock, CheckCircle2, X, ChevronDown } from 'lucide-react';
import '../styles/UserHome.css';
import housePartyPoster from '../assets/home-tab/Stay Tuned Hyderabad 🙌🏻🥳.jpg';

const UserHome = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tickets, setTickets] = useState({
    General: 0,
    Premium: 0,
    VIP: 0
  });

  const ticketPrices = {
    General: 499,
    Premium: 999,
    VIP: 1999
  };

  const handleTicketChange = (type, increment) => {
    setTickets(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + increment)
    }));
  };

  const totalPrice = Object.entries(tickets).reduce((sum, [type, count]) => sum + (ticketPrices[type] * count), 0);
  const tax = totalPrice > 0 ? totalPrice * 0.18 : 0; // 18% GST example
  const finalAmount = totalPrice + tax;

  const {
    globalWishlistIds = new Set(),
    toggleGlobalWishlist,
  } = useOutletContext();

  const eventData = {
    id: 1,
    name: 'Naach Bhajana Jam Night',
    category: 'Music Jam Session',
    date: '14 June 2026',
    time: '6:00 PM',
    duration: '2 Hours',
    venue: 'Flip Side Adventure Park, Hyderabad',
    availableTickets: 50,
    image: housePartyPoster,
    description:
      'Naach Bhajana Jam Night is a live musical jamming session where singers, musicians and music lovers come together to perform, collaborate and enjoy a vibrant musical experience.',
  };

  return (
    <div className="user-home">
      <main className="main-content">

        <section className="welcome-section">
          <h1>Upcoming Event</h1>
          <p>Discover and book exciting events on Vihavi.</p>
        </section>

        <section className="upcoming-events-section">
          <div
            className="event-card"
            onClick={() => setSelectedEvent(eventData)}
          >
            <div className="event-image-container">
              <img
                src={eventData.image}
                alt={eventData.name}
                className="event-image"
                loading="lazy"
              />
              <div className="event-badge-overlay">
                <span className="badge upcoming">Upcoming</span>
                <span className="badge limited">Limited Seats</span>
              </div>
            </div>

            <div className="event-info">
              <span className="event-category">
                {eventData.category}
              </span>

              <h2>{eventData.name}</h2>

              <div className="event-meta-grid">
                <p>
                  <Calendar size={18} />
                  {eventData.date} • {eventData.time}
                </p>
                <p>
                  <MapPin size={18} />
                  Flip Side, Hyderabad
                </p>
                <p>
                  <Clock size={18} />
                  {eventData.duration}
                </p>
                <p className="tickets-left">
                  <Ticket size={18} />
                  {eventData.availableTickets} Tickets Available
                </p>
              </div>

              <button className="view-details-btn">View Details</button>
            </div>
          </div>
        </section>

        {selectedEvent && (
          <div
            className="event-modal-overlay"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="event-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="close-btn-container">
                <button
                  className="close-btn"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-layout">
                {/* Left (Desktop) / Top (Mobile): Poster */}
                <div className="modal-left">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.name}
                    className="modal-image"
                  />
                </div>

                {/* Right (Desktop) / Bottom (Mobile): Scrollable Details */}
                <div className="modal-right">
                  <div className="modal-scroll-content">
                    
                    {/* A. Event Overview */}
                    <div className="modal-info">
                      <div className="organizer-info">Organized by Vihavi Events</div>
                      <div className="category-badges">
                        <span className="cat-badge">Music</span>
                        <span className="cat-badge">Jam Session</span>
                      </div>
                      <h2>{selectedEvent.name}</h2>

                      <div className="event-meta-details">
                        <div className="meta-item">
                          <Calendar className="meta-icon" size={20} />
                          <div>
                            <span className="meta-label">Date & Time</span>
                            <span className="meta-value">{selectedEvent.date} at {selectedEvent.time}</span>
                          </div>
                        </div>
                        <div className="meta-item">
                          <MapPin className="meta-icon" size={20} />
                          <div>
                            <span className="meta-label">Venue</span>
                            <span className="meta-value">{selectedEvent.venue}</span>
                          </div>
                        </div>
                        <div className="meta-item">
                          <Clock className="meta-icon" size={20} />
                          <div>
                            <span className="meta-label">Duration</span>
                            <span className="meta-value">{selectedEvent.duration}</span>
                          </div>
                        </div>
                        <div className="meta-item highlight">
                          <Ticket className="meta-icon" size={20} />
                          <div>
                            <span className="meta-label">Availability</span>
                            <span className="meta-value">{selectedEvent.availableTickets} Tickets Available</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="divider" />

                    {/* B. Ticket Selection */}
                    <div className="ticket-booking-section">
                      <h3 className="section-header">Select Tickets</h3>
                      
                      {['General', 'Premium', 'VIP'].map(type => (
                        <div className="ticket-tier" key={type}>
                          <div className="tier-info">
                            <h4>{type} Pass</h4>
                            <p className="tier-desc">Access to {type.toLowerCase()} areas and activities.</p>
                            <span className="seats-left">Available: {type === 'VIP' ? 10 : 50} seats</span>
                          </div>
                          <div className="tier-action">
                            <div className="tier-price">₹{ticketPrices[type]}</div>
                            <div className="quantity-selector">
                              <button onClick={() => handleTicketChange(type, -1)} aria-label="Decrease quantity">-</button>
                              <span>{tickets[type]}</span>
                              <button onClick={() => handleTicketChange(type, 1)} aria-label="Increase quantity">+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* C. Price Summary */}
                    {totalPrice > 0 && (
                      <div className="price-summary-card">
                        <h3 className="section-header">Price Summary</h3>
                        {Object.entries(tickets).map(([type, count]) => {
                          if (count > 0) {
                            return (
                              <div className="summary-row" key={type}>
                                <span>{type} Pass (x{count})</span>
                                <span>₹{ticketPrices[type] * count}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        <div className="summary-row taxes">
                          <span>Taxes (18% GST)</span>
                          <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total Amount</span>
                          <span className="total-amount">₹{finalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Accordion Group */}
                    <div className="accordion-group">
                      
                      {/* D. About Event */}
                      <details className="custom-accordion">
                        <summary>
                          <span className="summary-title">About This Event</span>
                          <ChevronDown size={20} className="accordion-icon" />
                        </summary>
                        <div className="accordion-content">
                          <p>{selectedEvent.description}</p>
                        </div>
                      </details>

                      {/* E. Event Highlights */}
                      <details className="custom-accordion">
                        <summary>
                          <span className="summary-title">Event Highlights</span>
                          <ChevronDown size={20} className="accordion-icon" />
                        </summary>
                        <div className="accordion-content">
                          <div className="highlights-grid">
                            <span className="highlight-tag"><CheckCircle2 size={18} color="#7a1f1f"/> Live Singing</span>
                            <span className="highlight-tag"><CheckCircle2 size={18} color="#7a1f1f"/> Open Mic</span>
                            <span className="highlight-tag"><CheckCircle2 size={18} color="#7a1f1f"/> Jam Session</span>
                            <span className="highlight-tag"><CheckCircle2 size={18} color="#7a1f1f"/> Networking</span>
                            <span className="highlight-tag"><CheckCircle2 size={18} color="#7a1f1f"/> Food & Beverages</span>
                            <span className="highlight-tag"><CheckCircle2 size={18} color="#7a1f1f"/> Community Meet</span>
                          </div>
                        </div>
                      </details>

                      {/* F. Venue Details */}
                      <details className="custom-accordion">
                        <summary>
                          <span className="summary-title">Venue Details</span>
                          <ChevronDown size={20} className="accordion-icon" />
                        </summary>
                        <div className="accordion-content">
                          <div className="venue-card">
                            <div className="venue-icon-wrapper">
                              <MapPin size={24} color="#7a1f1f" />
                            </div>
                            <div className="venue-info">
                              <h4>Flip Side Adventure Park</h4>
                              <p>Financial District</p>
                              <p>Nanakramguda, Hyderabad</p>
                            </div>
                          </div>
                        </div>
                      </details>

                      {/* G. Terms & Conditions */}
                      <details className="custom-accordion">
                        <summary>
                          <span className="summary-title">Terms & Conditions</span>
                          <ChevronDown size={20} className="accordion-icon" />
                        </summary>
                        <div className="accordion-content">
                          <ul className="terms-list">
                            <li>Tickets once booked cannot be exchanged or refunded.</li>
                            <li>Please carry a valid ID proof.</li>
                            <li>Security procedures, including frisking, remain the right of the management.</li>
                            <li>No external food or beverages allowed inside the venue.</li>
                          </ul>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* Sticky Footer Actions */}
                  <div className="modal-actions">
                    <button
                      className={`wishlist-btn ${globalWishlistIds.has(String(selectedEvent.id)) ? 'active' : ''}`}
                      onClick={() => toggleGlobalWishlist(selectedEvent)}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart
                        size={24}
                        fill={globalWishlistIds.has(String(selectedEvent.id)) ? '#FF3B30' : 'none'}
                        color={globalWishlistIds.has(String(selectedEvent.id)) ? '#FF3B30' : '#7a1f1f'}
                        className="wishlist-icon"
                      />
                      <span>Wishlist</span>
                    </button>

                    <button className="book-btn">
                      {totalPrice > 0 ? `Total ₹${finalAmount.toFixed(0)} • Book` : 'Book Tickets'}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default UserHome;