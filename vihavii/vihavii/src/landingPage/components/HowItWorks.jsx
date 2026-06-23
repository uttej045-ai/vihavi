import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Star, PlusCircle, Megaphone, Settings, BarChart3, Heart } from 'lucide-react';
import '../styles/HowItWorks.css';

const attendeeSteps = [
  { id: 1, icon: <Search />, title: 'Discover Events', desc: 'Find experiences tailored to your interests using our smart matching engine.' },
  { id: 2, icon: <Heart />, title: 'Save Favorite Events', desc: 'Bookmark your favorite events and quickly find them later when you\'re ready to join.' },
  { id: 3, icon: <Ticket />, title: 'Book Tickets', desc: 'Secure your spot instantly with our seamless 1-click checkout process.' },
  { id: 4, icon: <Star />, title: 'Experience', desc: 'Scan your QR code at the entrance and enjoy unforgettable moments.' }
];

const organizerSteps = [
  { id: 1, icon: <PlusCircle />, title: 'Create Event', desc: 'Set up your event page in minutes with our intuitive builder.' },
  { id: 2, icon: <Megaphone />, title: 'Promote', desc: 'Reach thousands of active attendees through our discovery network.' },
  { id: 3, icon: <Settings />, title: 'Manage', desc: 'Track registrations and manage attendees in real-time from your dashboard.' },
  { id: 4, icon: <BarChart3 />, title: 'Track Revenue', desc: 'Get paid faster and analyze your event performance with detailed metrics.' }
];

export default React.memo(function HowItWorks() {
  const [activeTab, setActiveTab] = useState('attendees');

  const currentSteps = activeTab === 'attendees' ? attendeeSteps : organizerSteps;

  return (
    <section className="how-it-works-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">How <span className="text-gradient">Vihavi</span> Works</h2>
          <p className="text-body">The ultimate platform connecting passionate organizers with enthusiastic attendees.</p>
        </div>

        <div className="how-it-works-container">
          <div className="hiw-tabs">
            <button
              className={`hiw-tab ${activeTab === 'attendees' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendees')}
            >
              For Attendees
            </button>
            <button
              className={`hiw-tab ${activeTab === 'organizers' ? 'active' : ''}`}
              onClick={() => setActiveTab('organizers')}
            >
              For Organizers
            </button>
          </div>

          <div className="hiw-steps-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="hiw-steps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {currentSteps.map((step, index) => (
                  <div key={step.id} className="hiw-step-card glass-panel">
                    <div className="step-icon-wrapper">
                      {step.icon}
                    </div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-desc">{step.desc}</p>

                    {index < currentSteps.length - 1 && (
                      <div className="step-connector">
                        <div className="connector-line"></div>
                        <div className="connector-arrow"></div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
});
