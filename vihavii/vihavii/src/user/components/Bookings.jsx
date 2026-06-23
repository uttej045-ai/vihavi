import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import '../styles/Bookings.css';
import { Ticket, Calendar, Clock, CheckCircle, MapPin, Search } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getBookings();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'past');
  
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div>Loading tickets...</div>;
  }

  return (
    <div className="bookings-module">
      <header className="page-header">
        <h1>Your Bookings</h1>
        <p>Access your digital tickets and booking history.</p>
      </header>

      <div className="bookings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon-circle">
            <Ticket size={48} className="empty-icon" />
          </div>
          <h2>No {activeTab} bookings</h2>
          <p>You don't have any tickets in this category right now.</p>
          <button className="btn-primary" onClick={() => navigate('/user/home')}>
             Explore Events
          </button>
        </div>
      ) : (
        <div className="bookings-ticket-list">
          {displayedBookings.map(booking => (
            <div className={`booking-ticket-card ${booking.status === 'past' ? 'past-ticket' : ''}`} key={booking.id}>
              
              <div className="bt-image-section">
                <img src={booking.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'} alt={booking.eventName} />
                <div className="bt-status-badge">
                  {booking.status === 'upcoming' ? <Clock size={12} /> : <CheckCircle size={12} />}
                  <span>{booking.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="bt-info-section">
                <h3>{booking.eventName}</h3>
                <div className="bt-meta">
                  <div className="bt-meta-item">
                    <Calendar size={14}/> <span>{booking.date}</span>
                  </div>
                  <div className="bt-meta-item">
                    <MapPin size={14}/> <span>{booking.venue || 'Venue TBD'}</span>
                  </div>
                </div>
                
                <div className="bt-divider"></div>
                
                <div className="bt-footer">
                  <div className="bt-ticket-count">
                    <Ticket size={16}/> 
                    <span>{booking.tickets} Ticket(s)</span>
                  </div>
                  <div className="bt-actions">
                    {booking.status === 'upcoming' && (
                      <button className="btn-view-ticket" onClick={() => navigate(`/user/confirmation/${booking.id}`, { state: { booking, event: { image: booking.image, name: booking.eventName, date: booking.date, location: booking.venue }, totalTickets: booking.tickets } })}>
                        View Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
