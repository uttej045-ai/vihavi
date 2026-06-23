import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, CheckCircle2, Heart } from 'lucide-react';
import '../styles/FeaturedEvents.css';

import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';
import event1Img from '../../assets/images/events/imagess.jpeg';
import event2Img from '../../assets/images/events/event2.webp';
import event3Img from '../../assets/images/events/event3.webp';
import housePartyImg from '../../assets/landingpageimages/common/fallback.webp';

const events = [
  {
    id: 0,
    title: 'House Party',
    organizer: 'Vihavi Events',
    date: 'Coming Soon',
    time: 'TBA',
    location: 'Madhapur, Hyderabad',
    price: 'Invite Only',
    image: housePartyImg,
    status: 'Coming Soon',
    seatsLeft: 'N/A',
    verified: true,
    isPremium: true
  },
  {
    id: 1,
    title: 'Neon Nights Tech Festival 2026',
    organizer: 'Rhythm Entertainment',
    date: 'Oct 15, 2026',
    time: '09:00 AM',
    location: 'Silicon Valley, CA',
    price: '$299',
    image: event1Img,
    status: 'Selling Fast',
    seatsLeft: 124,
    verified: true
  },
  {
    id: 2,
    title: 'Global Rhythm Music Summit',
    organizer: 'InnovateX',
    date: 'Nov 02, 2026',
    time: '04:00 PM',
    location: 'Austin, TX',
    price: '$150',
    image: event2Img,
    status: 'Available',
    seatsLeft: 45,
    verified: true
  },
  {
    id: 3,
    title: 'Startup Pitch & Connect',
    organizer: 'Zen Space',
    date: 'Dec 10, 2026',
    time: '06:30 PM',
    location: 'New York, NY',
    price: '$49',
    image: event3Img,
    status: 'Almost Full',
    seatsLeft: 300,
    verified: false
  }
];

export default React.memo(function FeaturedEvents() {
  const [savedEvents, setSavedEvents] = useState([]);

  const toggleSaveEvent = (eventId) => {
    setSavedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <section className="featured-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">Featured <span className="text-gradient">Events</span></h2>
          <p className="text-body">Handpicked experiences you don't want to miss.</p>
        </div>

        <div className="events-grid">
          {events.map((evt, index) => (
            <motion.div
              key={evt.id}
              className={`event-card glass-panel ${evt.isPremium ? 'premium-card' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="event-image-container">
                <img src={evt.image} alt={evt.title} loading="lazy" className="event-image" onError={(e) => { e.target.src = fallbackImage; }} />
                <div className="event-status-badge" data-status={evt.status}>
                  {evt.status}
                </div>
                <button
                  className={`favorite-btn ${savedEvents.includes(evt.id) ? 'saved' : ''}`}
                  onClick={() => toggleSaveEvent(evt.id)}
                  aria-label="Save Favorite Event"
                >
                  <Heart
                    size={20}
                    className="heart-icon"
                    fill={savedEvents.includes(evt.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              <div className="event-details">
                <div className="event-organizer">
                  <span>By {evt.organizer}</span>
                  {evt.verified && <CheckCircle2 size={14} className="verified-icon" />}
                </div>

                <h3 className="event-title">{evt.title}</h3>

                <div className="event-info-grid">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>{evt.date}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <span>{evt.time}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{evt.location}</span>
                  </div>
                  <div className="info-item highlight">
                    <Ticket size={16} />
                    <span>{evt.seatsLeft} seats left</span>
                  </div>
                </div>

                <div className="event-footer">
                  <div className="event-price">{evt.price}</div>
                  {evt.status === 'Coming Soon' ? (
                    <button className="btn btn-secondary event-book-btn">Notify Me</button>
                  ) : (
                    <button className="btn btn-primary event-book-btn">Book Now</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
