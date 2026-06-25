import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  StatCard, SearchFilterBar, Skeleton, Pagination, EmptyState,
  ConfirmModal, useToast, ExportButton, Drawer, DetailRow,
  fmtDate, fmtNum, fmtCur, statusBadge, PageHeader, StatsRow, SectionCard,
} from './AdminShared';

const PER_PAGE = 8;

const EVENT_MOCK = [
  { id: 'ev1', name: 'Summer Music Festival', category: 'Music', organizer: 'Skyline Events', venue: 'Bandra Amphitheatre, Mumbai', startDate: '2026-07-15', ticketsSold: 420, revenue: 210000, status: 'Published', featured: true, attendeeCount: 420 },
  { id: 'ev2', name: 'Tech Innovators Conference', category: 'Technology', organizer: 'Tech Summit India', venue: 'Hyderabad International Convention', startDate: '2026-07-20', ticketsSold: 280, revenue: 336000, status: 'Published', featured: false, attendeeCount: 280 },
  { id: 'ev3', name: 'Nightclub Royale', category: 'Nightlife', organizer: 'NightCraft Studios', venue: 'Club Royale, Bangalore', startDate: '2026-08-01', ticketsSold: 150, revenue: 45000, status: 'Draft', featured: false, attendeeCount: 0 },
  { id: 'ev4', name: 'Food & Wine Expo 2026', category: 'Food', organizer: 'Foodie Fests', venue: 'Chennai Exhibition Centre', startDate: '2026-08-10', ticketsSold: 90, revenue: 22500, status: 'Published', featured: true, attendeeCount: 90 },
  { id: 'ev5', name: 'Comedy Night Live', category: 'Comedy', organizer: 'Royal Stage Productions', venue: 'Kamani Auditorium, Delhi', startDate: '2026-07-28', ticketsSold: 0, revenue: 0, status: 'Draft', featured: false, attendeeCount: 0 },
  { id: 'ev6', name: 'Dance Festival India', category: 'Dance', organizer: 'Mumbai Dream Planners', venue: 'NCPA, Mumbai', startDate: '2026-09-05', ticketsSold: 310, revenue: 155000, status: 'Published', featured: false, attendeeCount: 310 },
  { id: 'ev7', name: 'IPL Fan Zone 2026', category: 'Sports', organizer: 'Zen Sports Agency', venue: 'DY Patil Stadium, Pune', startDate: '2026-06-20', ticketsSold: 800, revenue: 240000, status: 'Cancelled', featured: false, attendeeCount: 800 },
];

const EventDrawer = ({ event, onClose, onApprove, onReject, onFeature, onCancel }) => {
  if (!event) return null;
  return (
    <Drawer open={!!event} onClose={onClose} title="Event Details" width={540}>
      <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 20, background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(90,16,37,0.15))', padding: '20px', border: '1px solid rgba(212,175,55,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 28 }}>🎪</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{event.name}</div>
            <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{event.category} · {event.organizer}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={statusBadge(event.status)}>{event.status}</span>
          {event.featured && <span style={{ fontSize: 10, background: 'rgba(212,175,55,0.12)', color: 'var(--admin-gold)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.2)' }}>⭐ Featured</span>}
        </div>
      </div>

      <DetailRow label="Venue" value={event.venue} />
      <DetailRow label="Date" value={fmtDate(event.startDate)} />
      <DetailRow label="Tickets Sold" value={fmtNum(event.ticketsSold)} />
      <DetailRow label="Revenue" value={fmtCur(event.revenue)} />
      <DetailRow label="Attendees" value={fmtNum(event.attendeeCount)} />

      <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        {event.status === 'Draft' && (
          <>
            <button className="admin-btn-success" style={{ flex: 1 }} onClick={() => { onApprove(event.id); onClose(); }}>✓ Approve & Publish</button>
            <button className="admin-btn-danger" style={{ flex: 1 }} onClick={() => { onReject(event.id); onClose(); }}>✕ Reject</button>
          </>
        )}
        {event.status === 'Published' && !event.featured && (
          <button className="admin-btn-outline" style={{ flex: 1 }} onClick={() => { onFeature(event.id, true); onClose(); }}>⭐ Mark as Featured</button>
        )}
        {event.status === 'Published' && event.featured && (
          <button className="admin-btn-outline" style={{ flex: 1 }} onClick={() => { onFeature(event.id, false); onClose(); }}>Remove Featured</button>
        )}
        {['Published', 'Draft'].includes(event.status) && (
          <button className="admin-btn-danger" style={{ flex: 1 }} onClick={() => { onCancel(event.id); onClose(); }}>Cancel Event</button>
        )}
      </div>
    </Drawer>
  );
};

const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { show, ToastContainer } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    let data = await adminService.getEvents(filter, search);
    if (data.length < 3) data = [...EVENT_MOCK, ...data];
    setEvents(data);
    setPage(0);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (fn, successMsg) => {
    setActionLoading(true);
    try { await fn(); show(successMsg, 'success'); load(); }
    catch { show('Action failed', 'error'); }
    setActionLoading(false);
    setConfirm(null);
  };

  const stats = [
    { icon: '📅', title: 'Total Events', value: fmtNum(events.length), sub: 'All events' },
    { icon: '✅', title: 'Published', value: fmtNum(events.filter(e => e.status === 'Published').length), sub: 'Live on platform', trend: 'up' },
    { icon: '⏳', title: 'Pending Approval', value: fmtNum(events.filter(e => e.status === 'Draft').length), sub: 'Awaiting review' },
    { icon: '⭐', title: 'Featured', value: fmtNum(events.filter(e => e.featured).length), sub: 'Promoted events', trend: 'up' },
  ];

  const paged = events.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Event Management"
        subtitle="Review, approve, feature, and manage all events across the platform."
        icon="📅"
        actions={<ExportButton data={events} filename="events" label="Export CSV" />}
      />
      <StatsRow stats={stats} loading={loading} />

      <SectionCard
        title={`Events (${events.length})`}
        subtitle="All events submitted by organizers"
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Published', 'Draft', 'Cancelled']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by title, category, venue..."
          />
        }
      >
        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Tickets Sold</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton rows={PER_PAGE} cols={7} /> :
                paged.length === 0 ? <EmptyState icon="📅" title="No events found" /> :
                paged.map(ev => (
                  <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(ev)}>
                    <td onClick={e => e.stopPropagation()}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {ev.name}
                          {ev.featured && <span style={{ fontSize: 9, background: 'rgba(212,175,55,0.12)', color: 'var(--admin-gold)', padding: '1px 6px', borderRadius: 10 }}>FEATURED</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{ev.organizer}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{ev.category}</td>
                    <td style={{ fontSize: 12 }}>{fmtDate(ev.startDate)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-gold)' }}>{fmtNum(ev.ticketsSold)}</td>
                    <td style={{ fontSize: 12, color: '#52c41a' }}>{fmtCur(ev.revenue)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <span className={statusBadge(ev.status)}>{ev.status}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(ev)}>👁 View</button>
                        {ev.status === 'Draft' && (
                          <button className="admin-btn-success" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'approve', id: ev.id, name: ev.name })}>Approve</button>
                        )}
                        {ev.status === 'Published' && !ev.featured && (
                          <button className="admin-btn-outline" style={{ fontSize: 11 }} onClick={() => doAction(() => adminService.featureEvent(ev.id, true), 'Event featured!')}>⭐</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination total={events.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>

      <EventDrawer
        event={selected}
        onClose={() => setSelected(null)}
        onApprove={id => doAction(() => adminService.approveEvent(id), 'Event published!')}
        onReject={id => doAction(() => adminService.rejectEvent(id), 'Event rejected')}
        onFeature={(id, f) => doAction(() => adminService.featureEvent(id, f), f ? 'Event featured!' : 'Feature removed')}
        onCancel={id => doAction(() => adminService.cancelEvent(id), 'Event cancelled')}
      />

      {confirm && (
        <ConfirmModal
          title="Approve Event"
          message={`Publish "${confirm.name}" to the platform? Attendees will be able to purchase tickets.`}
          confirmLabel="Approve & Publish"
          type="primary"
          onConfirm={() => doAction(() => adminService.approveEvent(confirm.id), 'Event published!')}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminEventManagement;
