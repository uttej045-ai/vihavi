import React from 'react';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import '../styles/EventCard.css';

const EventCard = ({ event }) => {
  const { name, date, location, image, sales, revenue, status } = event;

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'published': return 'status-published';
      case 'draft': return 'status-draft';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="org-event-card">
      <div className="org-event-image-container">
        <img src={image} alt={name} className="org-event-image" />
        <div className={`org-event-status ${getStatusClass(status)}`}>
          {status}
        </div>
      </div>
      
      <div className="org-event-content">
        <h3 className="org-event-title">{name}</h3>
        
        <div className="org-event-details">
          <div className="org-event-detail-item">
            <Calendar size={14} />
            <span>{date}</span>
          </div>
          <div className="org-event-detail-item">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="org-event-metrics">
          <div className="org-event-metric">
            <div className="metric-label"><Users size={12} /> Tickets</div>
            <div className="metric-value">{sales}</div>
          </div>
          <div className="org-event-metric">
            <div className="metric-label"><DollarSign size={12} /> Revenue</div>
            <div className="metric-value">${revenue.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="org-event-actions">
          <button className="org-btn-outline">Edit</button>
          <button className="org-btn-primary">Manage</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
