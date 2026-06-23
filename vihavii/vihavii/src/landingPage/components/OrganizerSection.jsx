
import { motion } from 'framer-motion';
import { BarChart3, Users, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import '../styles/OrganizerSection.css';

const dashboardMockup = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop';
const salesGraph = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop';
import fallbackImage from '../../assets/landingpageimages/common/fallback.webp';

export default function OrganizerSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="organizer-section">
      <div className="organizer-container">
        
        {/* Left: Content */}
        <motion.div 
          className="organizer-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="organizer-badge" variants={itemVariants}>
            For Organizers
          </motion.div>
          <motion.h2 variants={itemVariants}>
            Scale your events with <br />
            <span className="text-gradient">powerful tools.</span>
          </motion.h2>
          <motion.p className="organizer-desc" variants={itemVariants}>
            Everything you need to create, manage, and grow your events. 
            From real-time analytics to seamless check-ins, we've got you covered.
          </motion.p>
          
          <motion.ul className="organizer-features" variants={containerVariants}>
            <motion.li variants={itemVariants}><div className="feat-icon"><BarChart3 size={20}/></div> Real-time sales dashboard</motion.li>
            <motion.li variants={itemVariants}><div className="feat-icon"><Users size={20}/></div> Attendee management CRM</motion.li>
            <motion.li variants={itemVariants}><div className="feat-icon"><Zap size={20}/></div> Instant payouts & smart pricing</motion.li>
            <motion.li variants={itemVariants}><div className="feat-icon"><ShieldCheck size={20}/></div> Fraud prevention & secure access</motion.li>
          </motion.ul>

          <motion.button className="btn btn-primary organizer-cta" variants={itemVariants}>
            Start Hosting <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        {/* Right: Mockup Graphics */}
        <motion.div 
          className="organizer-mockup"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="mockup-container">
            <div className="mockup-header">
              <div className="dots"><span></span><span></span><span></span></div>
              <div className="mockup-url">organizer.vihavi.com</div>
            </div>
            <img src={dashboardMockup} alt="Dashboard" className="mockup-img" onError={(e) => { e.target.src = fallbackImage; }} />
          </div>

          <motion.div 
            className="floating-stat"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="stat-value">$45,200</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-trend positive">+12.5% this week</div>
          </motion.div>

          <motion.div 
            className="floating-graph"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <img src={salesGraph} alt="Graph" onError={(e) => { e.target.src = fallbackImage; }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
