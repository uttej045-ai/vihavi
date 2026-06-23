import React from 'react';
import { motion } from 'framer-motion';
import { Music, Laptop, Palette, PartyPopper, Utensils, Users, ArrowRight } from 'lucide-react';
import '../styles/EventCategories.css';

import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';

const categories = [
  {
    id: 1,
    name: 'Music & Entertainment',
    subtitle: 'Music, rhythm and community experiences',
    icon: <Music size={24} />,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 2,
    name: 'House Parties',
    subtitle: 'Curated private social gatherings',
    icon: <PartyPopper size={24} />,
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 3,
    name: 'Networking Events',
    subtitle: 'Business networking and professional interactions',
    icon: <Users size={24} />,
    image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 4,
    name: 'Tech Conferences',
    subtitle: 'Networking and innovation summits',
    icon: <Laptop size={24} />,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 5,
    name: 'Arts & Culture',
    subtitle: 'Exhibitions, workshops and creative spaces',
    icon: <Palette size={24} />,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 6,
    name: 'Supper Clubs',
    subtitle: 'Exclusive dining and food communities',
    icon: <Utensils size={24} />,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000'
  }
];

export default React.memo(function EventCategories() {
  return (
    <section className="categories-section" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">Explore <span className="text-gradient">Categories</span></h2>
          <p className="text-body">Find the perfect experience tailored to your interests.</p>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => (
            <motion.div 
              key={category.id} 
              className="category-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <div className="category-image-wrapper">
                <img src={category.image} alt={category.name} loading="lazy" className="category-image" onError={(e) => { e.target.src = fallbackImage; }} />
                <div className="category-overlay"></div>
              </div>
              
              <div className="category-info-wrapper">
                <div className="category-header">
                  <div className="category-icon-wrapper">
                    {category.icon}
                  </div>
                  <h3 className="category-title">{category.name}</h3>
                </div>
                
                <div className="category-content">
                  <p className="category-subtitle">{category.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
