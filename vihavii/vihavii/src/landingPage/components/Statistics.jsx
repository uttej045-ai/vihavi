import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/Statistics.css';

const StatItem = ({ label, value, suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
      
      let start = 0;
      // Extract numeric value
      const target = parseInt(value.replace(/,/g, ''), 10);
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, value, controls]);

  return (
    <motion.div 
      ref={ref}
      className="stat-card"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
    >
      <div className="stat-number">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label-text">{label}</div>
    </motion.div>
  );
};

export default function Statistics() {
  return (
    <section className="statistics-section">
      <div className="statistics-container">
        <StatItem label="Tickets Sold" value="10000" />
        <div className="stat-divider"></div>
        <StatItem label="Events Hosted" value="500" />
        <div className="stat-divider"></div>
        <StatItem label="Organizers" value="100" />
        <div className="stat-divider"></div>
        <StatItem label="Cities" value="50" />
      </div>
    </section>
  );
}
