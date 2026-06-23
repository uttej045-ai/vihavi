import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CalendarDays, Crown, BellRing, ArrowRight } from 'lucide-react';
import '../styles/FlagshipEvent.css';

// Temporarily using fallback until the actual image is saved
import housePartyPoster from '../../assets/landingpageimages/common/fallback.webp';
import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';

export default function FlagshipEvent() {
  return (
    <section className="flagship-section section-bg-dark">
      <div className="container flagship-container">
        <div className="flagship-grid">
          
          {/* Image Side */}
          <motion.div 
            className="flagship-image-wrapper"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flagship-image-inner">
              <img 
                src={housePartyPoster} 
                alt="House Party in Hyderabad" 
                className="flagship-poster"
                onError={(e) => { e.target.src = fallbackImage; }}
              />
              <div className="flagship-glow"></div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            className="flagship-content"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flagship-badges">
              <span className="badge premium-badge">
                <Crown size={14} /> Premium Event
              </span>
              <span className="badge status-badge coming-soon">
                <CalendarDays size={14} /> Coming Soon
              </span>
              <span className="badge type-badge invite-only">
                Paid & Invite Only
              </span>
            </div>

            <h2 className="flagship-title">
              <span className="text-gradient">House Party</span>
            </h2>
            
            <p className="flagship-tagline">
              Good Music. Good People. Unforgettable Nights.
            </p>

            <div className="flagship-info">
              <div className="info-row">
                <MapPin size={20} className="info-icon" />
                <span>Madhapur, Hyderabad</span>
              </div>
            </div>

            <p className="flagship-desc">
              Be the first to know when we launch. This is an exclusive invite-only experience featuring top-tier music, amazing vibes, and the best crowd in the city.
            </p>

            <div className="flagship-actions">
              <button className="btn btn-primary flagship-btn">
                <BellRing size={18} /> Notify Me
              </button>
              <button className="btn btn-secondary flagship-btn-secondary">
                Join Waitlist <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
