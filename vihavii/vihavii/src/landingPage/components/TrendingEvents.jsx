import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';
import '../styles/TrendingEvents.css';

import highlight1 from '../../assets/images/highlights/highlight1.webp';
import highlight2 from '../../assets/images/highlights/highlight2.webp';
import highlight3 from '../../assets/images/highlights/highlight3.webp';
import highlight4 from '../../assets/images/highlights/highlight4.webp';
import housePartyImg from '../../assets/landingpageimages/common/fallback.webp';
import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';

const trendingEvents = [
  {
    id: 0,
    title: 'House Party',
    location: 'Madhapur, Hyderabad',
    date: 'Coming Soon',
    price: 'Invite Only',
    image: housePartyImg
  },
  {
    id: 't1',
    title: 'Global Tech Summit 2026',
    date: 'Sep 12, 2026',
    location: 'Delhi',
    price: '$299',
    image: highlight1
  },
  {
    id: 't2',
    title: 'Wellness Retreat Goa',
    date: 'Aug 24, 2026',
    location: 'Goa',
    price: '$150',
    image: highlight2
  },
  {
    id: 't3',
    title: 'Supper Club Exclusives',
    date: 'Jul 15, 2026',
    location: 'Mumbai',
    price: '$45',
    image: highlight3
  },
  {
    id: 't4',
    title: 'Indie Art Fair',
    date: 'Jun 30, 2026',
    location: 'Bangalore',
    price: 'Free',
    image: highlight4
  }
];

export default React.memo(function TrendingEvents() {
  return (
    <section className="trending-section section-padding section-bg-white" id="trending">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">
            <TrendingUp className="trending-icon" size={32} /> Trending <span className="text-gradient">Events This Week</span>
          </h2>
          <p className="text-body">The most hyped and highly anticipated events happening right now.</p>
        </div>

        <div className="trending-carousel">
          {trendingEvents.map((evt, index) => (
            <motion.div
              key={evt.id}
              className="trending-card glass-panel"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="trending-image-container">
                <img src={evt.image} alt={evt.title} loading="lazy" onError={(e) => { e.target.src = fallbackImage; }} />
                <div className="trending-price-badge">{evt.price}</div>
              </div>
              <div className="trending-details">
                <h3 className="trending-title">{evt.title}</h3>
                <div className="trending-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{evt.date}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
