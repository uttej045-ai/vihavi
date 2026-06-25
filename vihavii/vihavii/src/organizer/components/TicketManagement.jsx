import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { Ticket, Play, Pause, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';

export default function TicketManagement() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const allTickets = await dbService.getAll('tickets');
      const allEvents = await dbService.getAll('events');
      setTickets(allTickets);
      setEvents(allEvents);
    } catch (err) {
      console.error('Failed to load tickets list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const toggleStatus = async (ticket) => {
    const nextStatus = ticket.status === 'Paused' ? 'Open' : 'Paused';
    await dbService.update('tickets', ticket.id, { status: nextStatus });
    showToast(`Ticket sales for ${ticket.name} are now ${nextStatus === 'Open' ? 'Active' : 'Paused'}.`, 'success');
    loadTickets();
  };

  if (isLoading) {
    return <div className="organizer-loading">Syncing Ticket Inventory...</div>;
  }

  return (
    <div className="org-tickets-page">
      <div className="org-page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Ticket Management</h1>
        <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Configure pricing, monitor capacities, and toggle ticket release statuses.</p>
      </div>

      <div className="luxury-card" style={{ padding: '8px', overflowX: 'auto' }}>
        {tickets.length === 0 ? (
          <p style={{ color: 'var(--org-text-muted)', padding: '24px', textAlign: 'center' }}>No tickets created yet.</p>
        ) : (
          <table className="widget-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Ticket Class</th>
                <th>Associated Event</th>
                <th>Price</th>
                <th>Capacity / Sales</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => {
                const event = events.find(e => String(e.id) === String(t.eventId));
                const soldCount = Number(t.sold) || 0;
                const totalCount = Number(t.quantity) || 100;
                const percent = Math.min(Math.round((soldCount / totalCount) * 100), 100);
                const currentStatus = t.status || 'Open';

                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: 'var(--org-gold)',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(212, 175, 55, 0.2)'
                        }}><Ticket size={16} /></div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{t.name}</div>
                          <div style={{ color: 'var(--org-text-muted)', fontSize: '11px', marginTop: '2px' }}>ID: {t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#ccc', fontSize: '13px' }}>
                      {event ? (event.name || 'Unnamed Event') : 'Unknown Event'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--org-gold)', fontWeight: 'bold' }}>
                      {t.price === 0 ? 'Free' : (t.price ? `₹${t.price}` : 'N/A')}
                    </td>
                    <td style={{ padding: '16px', width: '220px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#e0e0e0', marginBottom: '6px' }}>
                        <span>{soldCount} / {totalCount} sold</span>
                        <span>{percent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--org-burgundy) 0%, var(--org-gold) 100%)', borderRadius: '3px' }}></div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge-status ${currentStatus.toLowerCase() === 'open' ? 'confirmed' : 'pending'}`}>
                        {currentStatus === 'Open' ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleStatus(t)}
                        className="luxury-btn-outline"
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {currentStatus === 'Open' ? (
                          <>
                            <Pause size={12} /> Pause Sales
                          </>
                        ) : (
                          <>
                            <Play size={12} /> Resume Sales
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
