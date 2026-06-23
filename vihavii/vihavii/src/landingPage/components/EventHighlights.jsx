import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/EventHighlights.css';

import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';

// Temporarily commented out local imports to prevent Vite crashes
// import highlightFeatured from '../../assets/images/highlights/highlight-featured.webp';
// import highlight1 from '../../assets/images/highlights/highlight1.webp';
// import highlight2 from '../../assets/images/highlights/highlight2.webp';
// import highlight3 from '../../assets/images/highlights/highlight3.webp';
// import highlight4 from '../../assets/images/highlights/highlight4.webp';
// import gallery1 from '../../assets/images/highlights/gallery1.webp';

const highlightItems = [
  { id: 1, src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920', category: 'Music & Entertainment' },
  { id: 2, src: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1920', category: 'House Parties' },
  { id: 3, src: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1920', category: 'Networking Events' },
  { id: 4, src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1920', category: 'Tech Conferences' },
  { id: 5, src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1920', category: 'Arts & Culture' },
  { id: 6, src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1920', category: 'Supper Clubs' }
];

export default React.memo(function EventHighlights() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % highlightItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className="highlights-section section-bg-light" id="highlights">
      <div className="container">
        <div className="section-header text-center" style={{ marginBottom: '40px' }}>
          <h2 className="heading-lg" style={{ textAlign: 'center', width: '100%' }}>
            Experience the <span className="text-gradient">Vibe</span>
          </h2>
          <p className="text-body" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            From exclusive house parties and live music nights to networking events, cultural celebrations, and supper clubs, discover the unforgettable moments that bring our community together.
          </p>
        </div>

        <div 
          className="highlights-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Desktop Layout */}
          <div className="highlights-desktop">
            <div className="highlights-featured">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="highlights-featured-inner"
                >
                  <img 
                    src={highlightItems[activeIndex].src} 
                    alt={highlightItems[activeIndex].category} 
                    loading="lazy"
                    onError={(e) => { e.target.src = fallbackImage; }}
                  />
                  <div className="highlights-overlay">
                    <span className="highlights-badge">{highlightItems[activeIndex].category}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {highlightItems.map((item, index) => {
              if (index === activeIndex) return null;
              return (
                <div 
                  key={item.id} 
                  className="highlights-grid-item"
                  onClick={() => setActiveIndex(index)}
                >
                  <img 
                    src={item.src} 
                    alt={item.category} 
                    loading="lazy"
                    onError={(e) => { e.target.src = fallbackImage; }}
                  />
                  <div className="highlights-overlay">
                    <span className="highlights-badge-small">{item.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Layout */}
          <div className="highlights-mobile">
            {highlightItems.map((item) => (
              <div key={item.id} className="highlights-mobile-slide">
                <img 
                  src={item.src} 
                  alt={item.category} 
                  loading="lazy"
                  onError={(e) => { e.target.src = fallbackImage; }}
                />
                <div className="highlights-overlay">
                  <span className="highlights-badge">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
