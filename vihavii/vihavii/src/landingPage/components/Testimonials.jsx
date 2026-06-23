import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import '../styles/Testimonials.css';

import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';
import avatar1Img from '../../assets/images/testimonials/avatar1.webp';
import avatar2Img from '../../assets/images/testimonials/avatar2.webp';
import avatar3Img from '../../assets/images/testimonials/avatar3.webp';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Event Director',
    company: 'TechNova',
    text: "Vihavi completely transformed how we manage our annual tech summit. The analytics dashboard alone saved us over 40 hours of manual reporting. Best platform on the market.",
    image: avatar1Img,
    rating: 5
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Founder',
    company: 'Rhythm Festivals',
    text: "From ticketing to on-site check-ins, everything is seamless. We saw a 25% increase in ticket sales just by using their integrated marketing tools. Absolutely incredible support team too.",
    image: avatar2Img,
    rating: 5
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Community Lead',
    company: 'Wellness Co.',
    text: "As someone who organizes weekly yoga retreats, I needed something simple but powerful. Vihavi gave me exactly that. My attendees love the smooth booking experience.",
    image: avatar3Img,
    rating: 4
  }
];

export default React.memo(function Testimonials() {
  return (
    <section className="testimonials-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">Trusted by <span className="text-gradient">Organizers</span></h2>
          <p className="text-body">See what people are saying about the Vihavi experience.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card glass-panel"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: testimonial.id * 0.1, duration: 0.5 }}
            >
              <Quote size={40} className="quote-icon" />
              
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              <p className="testimonial-text">"{testimonial.text}"</p>

              <div className="testimonial-author">
                <img src={testimonial.image} alt={testimonial.name} loading="lazy" onError={(e) => { e.target.src = fallbackImage; }} />
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}, {testimonial.company}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
