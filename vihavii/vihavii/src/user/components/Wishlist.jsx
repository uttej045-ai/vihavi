import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import '../styles/Wishlist.css';
import { Heart, Calendar, Trash2, Search, MapPin } from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  const { globalWishlist, toggleGlobalWishlist } = useOutletContext();





  return (
    <div className="wishlist-module">
      <header className="page-header">
        <h1>Your Wishlist</h1>
        <p>You have {globalWishlist.length} saved events</p>
      </header>

      {globalWishlist.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon-circle">
            <Heart size={48} className="empty-icon" />
          </div>
          <h2>No saved events</h2>
          <p>Explore the best events and save your favorites here.</p>
          <button className="btn-primary" onClick={() => navigate('/user/home')}>
            <Search size={18} style={{marginRight: 8}}/> Explore Events
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {globalWishlist.map(event => (
            <div className="wishlist-card" key={event.id} onClick={() => navigate(`/user/event/${event.eventId || event.id}`)}>
              <div className="wishlist-image-wrapper">
                <img src={event.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400'} alt={event.name} />
                <button className="remove-btn wishlist-icon-btn" onClick={(e) => { e.stopPropagation(); toggleGlobalWishlist(event); }}>
                  <Heart size={18} fill="#FF3B30" color="#FF3B30" />
                </button>
              </div>
              <div className="wishlist-card-content">
                <span className="category-badge">{event.category || 'Event'}</span>
                <h3>{event.name}</h3>
                <div className="event-meta">
                  <span><Calendar size={14}/> {event.date}</span>
                  <span><MapPin size={14}/> {event.location || 'City Venue'}</span>
                </div>
                <div className="event-footer">
                  <span className="event-price">₹{event.price}</span>
                  <button className="book-btn-small" onClick={(e) => { e.stopPropagation(); navigate(`/user/event/${event.eventId || event.id}`); }}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
