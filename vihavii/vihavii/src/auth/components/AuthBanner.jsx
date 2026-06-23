import React from 'react';
import { Link } from 'react-router-dom';
import '../auth.css';

// We use a premium fallback image from Unsplash
const fallbackBg = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920';
import logo from '../../assets/landingpageimages/common/logo.png';

export default function AuthBanner() {
  return (
    <div className="auth-banner-container">
      <img src={fallbackBg} alt="Vihavi Events" className="auth-banner-img" crossOrigin="anonymous" />
      <div className="auth-banner-overlay">
        <Link to="/">
          <img src={logo} alt="Vihavi Logo" className="auth-banner-logo" />
        </Link>
        <div className="auth-banner-content">
          <h1>
            Discover.<br />
            Book.<br />
            Experience Events.
          </h1>
          <p>
            Find and book the best events happening around you. Create memories that last.
          </p>
        </div>
      </div>
    </div>
  );
}
