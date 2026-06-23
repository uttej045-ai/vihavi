import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Music, Code, Briefcase, Calendar, Star } from 'lucide-react';
import '../styles/Hero.css';

const highlightFeatured = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920';
const previewImage1 = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600';
const previewImage2 = 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=600';
const heroVideo = '/hero.mp4';

export default React.memo(function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section className="hero-section" id="home">

      {/* ── BACKGROUND ── */}
      <div className="hero-video-bg">
        <video
          className="hero-bg-video"
          src={heroVideo}
          poster={highlightFeatured}
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Adjusted overlay to reduce background dominance with blur */}
        <div className="hero-video-overlay" />
      </div>

      {/* ── CONTENT ── */}
      <div className="hero-container container">
        
        {/* Left Column: Text & Search */}
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="hero-badge" variants={itemVariants}>
            <span className="pulse-dot" />
            <Sparkles size={13} />
            <span>Premium Event Discovery</span>
          </motion.div>

          <motion.h1 className="hero-title" variants={itemVariants}>
            Find Your Next <br />
            <span className="hero-title-gradient">Unforgettable Experience.</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={itemVariants}>
            Join the exclusive community discovering the city's best concerts, private networking events, and curated supper clubs.
          </motion.p>

          {/* Primary CTAs */}
          <motion.div className="hero-cta-group" variants={itemVariants}>
            <button className="btn-primary-large">Explore Events</button>
            <button className="btn-secondary-large">Become Organizer</button>
          </motion.div>

          {/* Category Chips with Icons */}
          <motion.div className="hero-category-chips" variants={itemVariants}>
            <span>Trending:</span>
            <div className="chip"><Music size={14} /> Music</div>
            <div className="chip"><Code size={14} /> Tech</div>
            <div className="chip"><Briefcase size={14} /> Networking</div>
            <div className="chip"><Calendar size={14} /> Culture</div>
          </motion.div>
        </motion.div>

        {/* Right Column: Preview Cards (Desktop Only) */}
        <motion.div 
          className="hero-preview-cards"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="preview-card card-front glass-card">
            <img src={previewImage1} alt="Event Preview" className="preview-img" />
            <div className="preview-info">
              <div className="preview-badge">Featured</div>
              <h4>Global Tech Summit</h4>
              <div className="preview-meta">
                <span><MapPin size={12} /> Bangalore</span>
                <span><Star size={12} fill="currentColor" /> 4.9</span>
              </div>
            </div>
          </div>
          <div className="preview-card card-back glass-card">
            <img src={previewImage2} alt="Event Preview" className="preview-img" />
            <div className="preview-info">
              <div className="preview-badge">Networking</div>
              <h4>Founders Mixer</h4>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
});