import React from 'react';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { id, name, date, location, image, sales, revenue, status } = event;

  const getStatusClass = (s) => {
    const statusLower = (s || 'Published').toLowerCase();
    switch (statusLower) {
      case 'published': return 'status-published';
      case 'draft': return 'status-draft';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="org-event-card luxury-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      <div className="org-event-image-container" style={{ position: 'relative', height: '160px' }}>
        <img src={image} alt={name} className="org-event-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className={`org-event-status ${getStatusClass(status)}`} style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {status || 'Published'}
        </div>
      </div>
      
      <div className="org-event-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
        <h3 className="org-event-title" style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0, lineHeight: 1.3 }}>{name}</h3>
        
        <div className="org-event-details" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="org-event-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--org-text-muted)', fontSize: '12px' }}>
            <Calendar size={14} color="var(--org-gold)" />
            <span>{date}</span>
          </div>
          <div className="org-event-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--org-text-muted)', fontSize: '12px' }}>
            <MapPin size={14} color="var(--org-gold)" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="org-event-metrics" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 'auto'
        }}>
          <div className="org-event-metric">
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>
              <Users size={12} /> Tickets Sold
            </div>
            <div className="metric-value" style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{sales || 0}</div>
          </div>
          <div className="org-event-metric">
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>
              <DollarSign size={12} /> Revenue
            </div>
            <div className="metric-value" style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--org-gold)', marginTop: '4px' }}>₹{(revenue || 0).toLocaleString()}</div>
          </div>
        </div>
        
        <div className="org-event-actions" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button 
            className="luxury-btn-outline" 
            style={{ flex: 1, padding: '8px 0', fontSize: '12px', borderRadius: '8px' }}
            onClick={() => navigate(`/organizer/create-event?edit=${id}`)}
          >
            Edit
          </button>
          <button 
            className="luxury-btn-primary" 
            style={{ flex: 1, padding: '8px 0', fontSize: '12px', borderRadius: '8px' }}
            onClick={() => navigate(`/organizer/events`)}
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
