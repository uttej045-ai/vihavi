import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/BookingConfirmation.css';
import { CheckCircle, Download, ArrowRight, QrCode, Calendar, MapPin, Ticket } from 'lucide-react';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, event, totalTickets, finalAmount } = location.state || {};

  if (!booking || !event) {
    return (
      <div className="error-container">
        <h2>Booking Not Found</h2>
        <button onClick={() => navigate('/user/home')}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      {/* Success Header */}
      <div className="success-header">
        <CheckCircle size={64} className="success-icon" />
        <h2>Booking Confirmed!</h2>
        <p>Your payment of ₹{finalAmount?.toFixed(2)} was successful.</p>
        <span className="booking-id">Booking ID: #{booking.id}</span>
      </div>

      {/* QR Ticket */}
      <div className="ticket-wrapper">
        <div className="digital-ticket">
          <div className="ticket-top">
            <img src={event.image} alt={event.name} className="ticket-hero" />
            <div className="ticket-gradient-overlay"></div>
            <div className="ticket-overlay-content">
              <h3>{event.name}</h3>
              <span className="ticket-type-badge">Admit {totalTickets}</span>
            </div>
          </div>
          
          <div className="ticket-middle">
            <div className="ticket-info-grid">
              <div className="t-info-item">
                <Calendar size={16} />
                <div>
                  <label>Date</label>
                  <span>{event.date}</span>
                </div>
              </div>
              <div className="t-info-item">
                <MapPin size={16} />
                <div>
                  <label>Venue</label>
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="t-info-item">
                <Ticket size={16} />
                <div>
                  <label>Ticket Type</label>
                  <span>General Access</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ticket-divider">
            <div className="notch left"></div>
            <div className="dash-line"></div>
            <div className="notch right"></div>
          </div>

          <div className="ticket-bottom">
            <div className="qr-container">
              {/* Using a lucide icon as placeholder for an actual QR image */}
              <QrCode size={100} strokeWidth={1} color="#333" />
            </div>
            <p className="scan-text">Scan this QR code at the venue entry</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="confirmation-actions">
        <button className="btn-download">
          <Download size={20} /> Download Ticket
        </button>
        <button className="btn-secondary" onClick={() => navigate('/user/bookings')}>
          Go to My Bookings <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
