import React from 'react';

export default function StatsCounter() {
  return (
    <div className="stats-counter" style={{ display: 'flex', gap: '20px', marginTop: '2rem' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#7A0019' }}>10k+</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Active Users</p>
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#7A0019' }}>5k+</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Events Hosted</p>
      </div>
    </div>
  );
}
