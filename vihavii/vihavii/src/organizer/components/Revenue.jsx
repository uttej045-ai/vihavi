import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { DollarSign, ShieldAlert, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';
import StatCard from './StatCard';

export default function Revenue() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const loadFinancials = async () => {
    try {
      setIsLoading(true);
      const allBookings = await dbService.getAll('bookings');
      const allEvents = await dbService.getAll('events');
      const allPayments = await dbService.getAll('payments');
      setBookings(allBookings);
      setEvents(allEvents);
      setPayments(allPayments);
    } catch (err) {
      console.error('Failed to load financial records', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  // Handle mock refund trigger
  const processRefund = async (booking) => {
    if (window.confirm(`Are you sure you want to refund ₹${booking.totalPaid} to ${booking.userName}? This will cancel their entry ticket.`)) {
      try {
        // Update booking status to Refunded
        await dbService.update('bookings', booking.id, {
          status: 'Refunded',
          checkInStatus: 'Cancelled'
        });

        // Update payment status to Refunded
        const payment = payments.find(p => String(p.bookingId) === String(booking.id));
        if (payment) {
          await dbService.update('payments', payment.id, { status: 'Refunded' });
        }

        // Add system alert notification
        await dbService.create('notifications', {
          type: 'payment',
          message: `Refund of ₹${booking.totalPaid} processed successfully for ${booking.userName}.`,
          timestamp: new Date().toISOString(),
          read: false
        });

        showToast('Refund processed successfully.', 'success');
        loadFinancials();
      } catch (err) {
        showToast(`Failed to process refund: ${err.message}`, 'error');
      }
    }
  };

  // Calculations
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const refundedBookings = bookings.filter(b => b.status === 'Refunded');
  
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
  const totalRefunds = refundedBookings.reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
  const netEarnings = totalRevenue - totalRefunds;

  // Monthly Revenue Trend SVG
  const monthlyTimeline = [
    { month: 'Jan', value: 25000 },
    { month: 'Feb', value: 45000 },
    { month: 'Mar', value: 30000 },
    { month: 'Apr', value: 65000 },
    { month: 'May', value: 50000 },
    { month: 'Jun', value: netEarnings || 80000 } // link to live dataset
  ];

  const maxVal = Math.max(...monthlyTimeline.map(m => m.value), 10000);

  if (isLoading) {
    return <div className="organizer-loading">Consolidating Financial Ledger...</div>;
  }

  return (
    <div className="org-revenue-page">
      <div className="org-page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Revenue & Financials</h1>
        <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Analyze earnings, monitor payout channels, and manage customer refunds.</p>
      </div>

      {/* Financial Overview StatCards */}
      <div className="org-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard title="Gross Sales" value={totalRevenue} icon={DollarSign} trend={12.4} isCurrency={true} />
        <StatCard title="Refunds Processed" value={totalRefunds} icon={RotateCcw} trend={-4.5} isCurrency={true} />
        <StatCard title="Net Earnings" value={netEarnings} icon={DollarSign} trend={15.2} isCurrency={true} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Monthly Earnings Trend Chart */}
        <div className="luxury-card">
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px' }}>Monthly Revenue Stream (₹)</h3>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height: '220px' }}>
            <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(212, 175, 55, 0.3)" />
                  <stop offset="100%" stopColor="rgba(88, 15, 29, 0)" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="30" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.05)" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.05)" />
              <line x1="30" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {/* Line graph nodes */}
              {(() => {
                const points = monthlyTimeline.map((m, index) => {
                  const x = 30 + (index * (450 / (monthlyTimeline.length - 1)));
                  const y = 170 - (m.value / maxVal) * 140;
                  return { x, y, ...m };
                });

                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

                return (
                  <g>
                    <path d={areaD} fill="url(#revGrad)" />
                    <path d={pathD} fill="none" stroke="var(--org-gold)" strokeWidth="3" />
                    {points.map((p, index) => (
                      <g key={index} onMouseEnter={() => setHoveredPoint(index)} onMouseLeave={() => setHoveredPoint(null)}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredPoint === index ? 6 : 4}
                          fill="var(--org-burgundy)"
                          stroke="var(--org-gold)"
                          strokeWidth="2"
                          style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                        />
                        {hoveredPoint === index && (
                          <g>
                            <rect x={p.x - 40} y={p.y - 30} width={80} height={20} fill="#141416" rx="4" stroke="var(--org-gold)" strokeWidth="1" />
                            <text x={p.x} y={p.y - 17} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">₹{p.value.toLocaleString()}</text>
                          </g>
                        )}
                        <text x={p.x} y="190" fill="var(--org-text-muted)" fontSize="10" textAnchor="middle">{p.month}</text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Revenue Share breakdown by Event */}
        <div className="luxury-card">
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px' }}>Revenue Breakdown by Event</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.filter(e => e && e.id).map((e, idx) => {
              const eventBookings = bookings.filter(b => b && String(b.eventId) === String(e.id) && b.status === 'Confirmed');
              const rev = eventBookings.reduce((sum, b) => sum + (Number(b.totalPaid) || 0), 0);
              const percentage = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;

              return (
                <div key={e.id || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '500' }}>{e.name || 'Unnamed Event'}</span>
                    <span style={{ color: 'var(--org-gold)', fontWeight: 'bold' }}>₹{rev.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--org-gold)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Transactions List Ledger */}
      <div className="luxury-card" style={{ padding: '8px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '16px', color: '#fff', margin: '12px 16px' }}>Transaction Ledger</h3>
        <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Event</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.filter(b => b && b.id).map(b => {
              const event = events.find(e => e && String(e.id) === String(b.eventId));
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: '#fff', fontWeight: '500' }}>#{b.id}</td>
                  <td style={{ padding: '16px', color: '#ccc', fontSize: '13px' }}>
                    <div>{b.userName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--org-text-muted)', marginTop: '2px' }}>{b.userEmail}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#ccc', fontSize: '13px' }}>{event ? (event.name || 'Unnamed Event') : 'Unknown Event'}</td>
                  <td style={{ padding: '16px', color: 'var(--org-gold)', fontWeight: 'bold' }}>₹{b.totalPaid}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge-status ${(b.status || 'Confirmed').toLowerCase()}`}>{b.status || 'Confirmed'}</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {b.status === 'Confirmed' && (
                      <button 
                        onClick={() => processRefund(b)} 
                        className="luxury-btn-outline" 
                        style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px', borderColor: '#ff4d4f', color: '#ff4d4f' }}
                      >
                        Refund Payment
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
