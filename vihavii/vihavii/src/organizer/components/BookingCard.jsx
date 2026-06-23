import React from 'react';
import { Mail, Ticket, Calendar } from 'lucide-react';
import '../styles/BookingCard.css';

const BookingCard = ({ booking }) => {
  const { userName, email, eventName, date, ticketCount, status } = booking;

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="org-booking-card">
      <div className="org-booking-header">
        <div className="org-booking-user">
          <div className="org-booking-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="org-booking-name">{userName}</h4>
            <div className="org-booking-email">
              <Mail size={12} /> {email}
            </div>
          </div>
        </div>
        <div className={`org-booking-status ${getStatusBadge(status)}`}>
          {status}
        </div>
      </div>
      
      <div className="org-booking-body">
        <div className="org-booking-info">
          <div className="info-label">Event</div>
          <div className="info-value event-name">{eventName}</div>
        </div>
        
        <div className="org-booking-meta">
          <div className="org-booking-info">
            <div className="info-label"><Calendar size={12} /> Date</div>
            <div className="info-value">{date}</div>
          </div>
          <div className="org-booking-info">
            <div className="info-label"><Ticket size={12} /> Tickets</div>
            <div className="info-value ticket-count">{ticketCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
