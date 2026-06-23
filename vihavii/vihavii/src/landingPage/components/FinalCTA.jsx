import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import '../styles/FinalCTA.css';

import ctaImage from '../../assets/images/cta/cta-image.webp';

export default React.memo(function FinalCTA() {
  const particles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${10 + Math.random() * 10}s`
    }));
  }, []);

  return (
    <section className="final-cta-section">
      <div className="cta-background">
        <div className="mesh-gradient"></div>
        <div className="particles">
          {particles.map((p) => (
            <div 
              key={p.id} 
              className="particle" 
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.animationDelay,
                animationDuration: p.animationDuration
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="cta-container">
        <motion.div 
          className="cta-content glass-panel"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="cta-text-area">
            <div className="cta-badge">
              <Sparkles size={16} className="text-accent" />
              <span>Join 100k+ Users</span>
            </div>
            
            <h2 className="heading-xl cta-title">
              Ready to Experience <br />
              Your <span className="text-gradient">Next Event?</span>
            </h2>
            
            <p className="text-body cta-desc">
              Whether you're looking to attend the biggest festivals or organize intimate community gatherings, Vihavi is your ultimate platform.
            </p>
            
            <div className="cta-buttons">
              <button className="btn btn-primary cta-btn">
                Explore Events <ArrowRight size={18} />
              </button>
              <button className="btn btn-outline cta-btn-outline">
                Create Event
              </button>
            </div>
          </div>
          <div className="cta-image-area">
            <img src={ctaImage} alt="Party" className="cta-illustration" loading="lazy" />
          </div>
        </motion.div>
      </div>
    </section>
  );
});
