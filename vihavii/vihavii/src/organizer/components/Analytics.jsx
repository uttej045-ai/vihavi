import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { Eye, TrendingUp, BarChart2, Activity } from 'lucide-react';
import StatCard from './StatCard';

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const allEvents = await dbService.getAll('events');
        const allBookings = await dbService.getAll('bookings');
        setEvents(allEvents);
        setBookings(allBookings);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  // Aggregated calculations
  const totalViews = events.reduce((sum, e) => sum + (Number(e.views) || 280), 0); // fallback views count
  const totalBookingsCount = bookings.length;
  
  // Conversion Rate (bookings count / total page views)
  const conversionRate = totalViews > 0 ? Math.round((totalBookingsCount / totalViews) * 100) : 12;

  // Render traffic timeline SVG
  const trafficData = [
    { label: 'Mon', views: 80 },
    { label: 'Tue', views: 120 },
    { label: 'Wed', views: 190 },
    { label: 'Thu', views: 150 },
    { label: 'Fri', views: 240 },
    { label: 'Sat', views: 320 },
    { label: 'Sun', views: 290 }
  ];

  const maxViews = Math.max(...trafficData.map(t => t.views), 100);

  if (isLoading) {
    return <div className="organizer-loading">Aggregating Visitor Traffic...</div>;
  }

  return (
    <div className="org-analytics-page">
      <div className="org-page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Analytics & Trends</h1>
        <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Track visitor conversion ratios, monitor page views, and analyze promotional reach.</p>
      </div>

      <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard title="Total Page Views" value={totalViews} icon={Eye} trend={22.8} />
        <StatCard title="Conversion Rate" value={conversionRate} icon={TrendingUp} trend={4.2} suffix="%" />
        <StatCard title="Total Registrants" value={totalBookingsCount} icon={BarChart2} trend={11.0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Weekly Traffic SVG Chart */}
        <div className="luxury-card">
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px' }}>Weekly Page Visits</h3>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height: '220px' }}>
            <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--org-gold)" />
                  <stop offset="100%" stopColor="rgba(88, 15, 29, 0.1)" />
                </linearGradient>
              </defs>
              <line x1="30" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="30" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.05)" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.05)" />
              <line x1="30" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {(() => {
                const points = trafficData.map((d, index) => {
                  const x = 30 + (index * (450 / (trafficData.length - 1)));
                  const y = 170 - (d.views / maxViews) * 140;
                  return { x, y, ...d };
                });

                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

                return (
                  <g>
                    <path d={areaD} fill="url(#viewsGrad)" opacity="0.6" />
                    <path d={pathD} fill="none" stroke="var(--org-gold)" strokeWidth="3" />
                    {points.map((p, index) => (
                      <g key={index} onMouseEnter={() => setHoveredNode(index)} onMouseLeave={() => setHoveredNode(null)}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredNode === index ? 6 : 4}
                          fill="var(--org-burgundy)"
                          stroke="var(--org-gold)"
                          strokeWidth="2"
                          style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                        />
                        {hoveredNode === index && (
                          <g>
                            <rect x={p.x - 30} y={p.y - 30} width={60} height={20} fill="#141416" rx="4" stroke="var(--org-gold)" strokeWidth="1" />
                            <text x={p.x} y={p.y - 17} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">{p.views} views</text>
                          </g>
                        )}
                        <text x={p.x} y="190" fill="var(--org-text-muted)" fontSize="10" textAnchor="middle">{p.label}</text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Popular Event Conversion Rates */}
        <div className="luxury-card">
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px' }}>Event Performance Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((e, idx) => {
              const eventBookings = bookings.filter(b => String(b.eventId) === String(e.id));
              const views = Number(e.views) || 280;
              const rate = views > 0 ? Math.round((eventBookings.length / views) * 100) : 10;
              
              return (
                <div key={e.id || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '500' }}>{e.name}</span>
                    <span style={{ color: 'var(--org-gold)', fontSize: '12px' }}>{eventBookings.length} bookings / {views} views ({rate}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${rate}%`, height: '100%', background: 'var(--org-gold)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* detailed logs */}
      <div className="luxury-card" style={{ padding: '8px' }}>
        <h3 style={{ fontSize: '16px', color: '#fff', margin: '12px 16px' }}>Detailed Traffic Log</h3>
        <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Total Views</th>
              <th>Tickets Booked</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => {
              const count = bookings.filter(b => String(b.eventId) === String(e.id)).length;
              const views = Number(e.views) || 280;
              const conversion = views > 0 ? Math.round((count / views) * 100) : 0;
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: '#fff', fontWeight: '500' }}>{e.name}</td>
                  <td style={{ padding: '16px', color: '#ccc' }}>{views}</td>
                  <td style={{ padding: '16px', color: '#ccc' }}>{count}</td>
                  <td style={{ padding: '16px', color: 'var(--org-gold)', fontWeight: 'bold' }}>{conversion}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
