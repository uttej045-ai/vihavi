
import { motion } from 'framer-motion';
import { Map, Users, Compass, QrCode, TrendingUp } from 'lucide-react';
import '../styles/WhyChooseVihavi.css';

const reasons = [
  {
    id: 1,
    icon: <Map size={32} />,
    title: 'Social Heatmap Networking',
    desc: 'See exactly where the crowd is and discover hotspots in real-time. Connect with nearby attendees seamlessly.',
    color: '#ff007f'
  },
  {
    id: 2,
    icon: <Users size={32} />,
    title: 'Community Building',
    desc: 'Turn one-time attendees into loyal community members with built-in engagement tools and groups.',
    color: '#7b2cbf'
  },
  {
    id: 3,
    icon: <Compass size={32} />,
    title: 'Intelligent Event Discovery',
    desc: 'Our AI-driven recommendation engine ensures your events reach the right audience every time.',
    color: '#00e5ff'
  },
  {
    id: 4,
    icon: <QrCode size={32} />,
    title: 'Lightning Fast QR Entry',
    desc: 'Eliminate lines with our 0.2s scan time. Seamless check-ins keep attendees happy from the start.',
    color: '#00ff88'
  },
  {
    id: 5,
    icon: <TrendingUp size={32} />,
    title: 'Deep Analytics',
    desc: 'Understand your audience with detailed demographic breakdowns, sales tracking, and engagement metrics.',
    color: '#ffbe0b'
  }
];

export default function WhyChooseVihavi() {
  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        <div className="why-choose-header">
          <h2 className="heading-lg">Why Choose <span className="text-gradient">Vihavi</span></h2>
          <p className="text-body">The most advanced platform designed to scale your events and amplify experiences.</p>
        </div>

        <div className="why-grid">
          {reasons.map((reason, index) => (
            <motion.div 
              key={reason.id}
              className={`feature-card glass-panel`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="feature-icon-wrapper" style={{ backgroundColor: `${reason.color}15`, color: reason.color }}>
                {reason.icon}
                <div className="feature-glow" style={{ backgroundColor: reason.color }}></div>
              </div>
              <h3>{reason.title}</h3>
              <p>{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
