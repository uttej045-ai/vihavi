import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import '../styles/FAQ.css';

const faqs = [
  {
    question: 'How do I book tickets?',
    answer: 'Booking tickets is easy. Simply navigate to the event page, click "Book Now", select your ticket tier, and proceed to our secure checkout. Your tickets will be instantly emailed to you and available in your dashboard.'
  },
  {
    question: 'Can I cancel tickets?',
    answer: 'Yes, cancellations are subject to the event organizer\'s specific refund policy. Most events allow cancellations up to 48 hours before the event starts. You can manage cancellations directly from your bookings tab.'
  },
  {
    question: 'Is payment secure?',
    answer: 'Absolutely. We use bank-level encryption and partner with industry-leading payment processors like Stripe to ensure your financial data is completely secure. We never store your full credit card details.'
  },
  {
    question: 'How do organizers create events?',
    answer: 'Organizers can create events by signing up for an Organizer account, clicking "Create Event", and using our intuitive event wizard. You can add details, upload banners, set ticket tiers, and publish within minutes.'
  },
  {
    question: 'What are organizer fees?',
    answer: 'Vihavi charges a small flat fee plus a percentage per paid ticket sold. Free events are completely free to host. Our pricing is transparent with no hidden costs or monthly subscriptions.'
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p className="text-body">Everything you need to know about using Vihavi.</p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item glass-panel ${activeIndex === index ? 'active' : ''}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleAccordion(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  className={`faq-icon ${activeIndex === index ? 'rotate' : ''}`} 
                  size={20} 
                />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="faq-answer-wrapper"
                  >
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
