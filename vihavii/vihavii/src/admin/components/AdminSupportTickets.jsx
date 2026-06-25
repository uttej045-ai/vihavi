import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  SearchFilterBar, Skeleton, Pagination, EmptyState,
  useToast, ExportButton, Drawer, DetailRow, AvatarChip,
  fmtDate, fmtNum, statusBadge, PageHeader, StatsRow, SectionCard, timeSince,
} from './AdminShared';

const PER_PAGE = 8;
const AGENTS = ['Raj Kumar', 'Anita Sharma', 'Preethi Nair', 'Siddharth Roy'];
const PRIORITY_COLOR = { Low: '#52c41a', Medium: '#fa8c16', High: '#ff4d4f', Critical: '#eb2f96' };

const TicketDrawer = ({ ticket, onClose, onUpdateStatus, onAssign, onReply }) => {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  if (!ticket) return null;

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await onReply(ticket.id, reply);
    setReply('');
    setSending(false);
  };

  return (
    <Drawer open={!!ticket} onClose={onClose} title={`Ticket #${ticket.id}`} width={560}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{ticket.subject}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className={statusBadge(ticket.status)}>{ticket.status}</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${PRIORITY_COLOR[ticket.priority]}15`, color: PRIORITY_COLOR[ticket.priority], border: `1px solid ${PRIORITY_COLOR[ticket.priority]}30` }}>{ticket.priority} Priority</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: 'var(--admin-text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>{ticket.category}</span>
        </div>
      </div>

      <DetailRow label="User" value={ticket.userName} />
      <DetailRow label="Email" value={ticket.email} />
      <DetailRow label="Created" value={timeSince(ticket.createdAt)} />
      <DetailRow label="Agent" value={ticket.assignedAgent || 'Unassigned'} />

      {/* Assign Agent */}
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Assign Agent</label>
        <select className="admin-select" style={{ width: '100%' }} defaultValue={ticket.assignedAgent || ''}
          onChange={e => onAssign(ticket.id, e.target.value)}>
          <option value="">Select Agent...</option>
          {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Status update */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Update Status</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Open', 'In Progress', 'Escalated', 'Resolved'].map(s => (
            <button key={s} onClick={() => onUpdateStatus(ticket.id, s)} className="admin-btn-outline"
              style={{ fontSize: 11, background: ticket.status === s ? 'rgba(212,175,55,0.15)' : '', color: ticket.status === s ? 'var(--admin-gold)' : '', borderColor: ticket.status === s ? 'rgba(212,175,55,0.3)' : '' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text-muted)', fontWeight: 700, marginBottom: 12 }}>Conversation</div>
        <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(ticket.messages || []).length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', textAlign: 'center', padding: 20 }}>No messages yet</div>
          )}
          {(ticket.messages || []).map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.from === 'agent' ? 'row-reverse' : 'row' }}>
              <AvatarChip name={msg.from === 'agent' ? 'Agent' : ticket.userName} size={28} color={msg.from === 'agent' ? '#D4AF37' : '#1890ff'} />
              <div style={{ maxWidth: '80%', background: msg.from === 'agent' ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.from === 'agent' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{msg.text}</div>
                <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginTop: 4 }}>{timeSince(msg.time)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." className="admin-input"
            style={{ flex: 1, minHeight: 60, resize: 'none', fontSize: 12 }} />
          <button onClick={handleReply} disabled={sending || !reply.trim()}
            style={{ background: 'linear-gradient(135deg,var(--admin-burgundy),#7a1528)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--admin-gold)', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: 'Inter, sans-serif', alignSelf: 'flex-end' }}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </Drawer>
  );
};

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const { show, ToastContainer } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getSupportTickets(filter, search);
    setTickets(data);
    setPage(0);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateTicketStatus(id, status);
      show(`Status updated to "${status}"`, 'success');
      load();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch { show('Update failed', 'error'); }
  };

  const handleAssign = async (id, agent) => {
    if (!agent) return;
    try {
      await adminService.assignTicket(id, agent);
      show(`Ticket assigned to ${agent}`, 'success');
      load();
    } catch { show('Assignment failed', 'error'); }
  };

  const handleReply = async (id, text) => {
    try {
      await adminService.replyToTicket(id, text, true);
      show('Reply sent', 'success');
      load();
    } catch { show('Failed to send reply', 'error'); }
  };

  const stats = [
    { icon: '🎫', title: 'Total Tickets', value: fmtNum(tickets.length), sub: 'All time' },
    { icon: '🔴', title: 'Open', value: fmtNum(tickets.filter(t => t.status === 'Open').length), sub: 'Needs attention', trend: 'down' },
    { icon: '🔥', title: 'Escalated', value: fmtNum(tickets.filter(t => t.status === 'Escalated').length), sub: 'Critical priority', trend: 'down' },
    { icon: '✅', title: 'Resolved', value: fmtNum(tickets.filter(t => t.status === 'Resolved').length), sub: 'Closed tickets', trend: 'up' },
  ];

  const paged = tickets.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Support Tickets"
        subtitle="Manage customer support requests, assign agents, and resolve issues efficiently."
        icon="🎫"
        actions={<ExportButton data={tickets} filename="support-tickets" label="Export CSV" />}
      />
      <StatsRow stats={stats} loading={loading} />

      <SectionCard
        title={`Tickets (${tickets.length})`}
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Open', 'In Progress', 'Escalated', 'Resolved']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by user, subject, ID..."
          />
        }
      >
        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>User</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Agent</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton rows={PER_PAGE} cols={8} /> :
                paged.length === 0 ? <EmptyState icon="🎫" title="No tickets found" /> :
                paged.map(t => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
                    <td onClick={e => e.stopPropagation()}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 12 }}>{t.subject}</div>
                        <div style={{ fontSize: 10, color: 'var(--admin-gold)', fontFamily: 'monospace' }}>#{t.id}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AvatarChip name={t.userName} size={26} />
                        <span style={{ fontSize: 12 }}>{t.userName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{t.category}</td>
                    <td>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${PRIORITY_COLOR[t.priority]}15`, color: PRIORITY_COLOR[t.priority], border: `1px solid ${PRIORITY_COLOR[t.priority]}30`, fontWeight: 700 }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: t.assignedAgent ? '#fff' : 'var(--admin-text-muted)' }}>{t.assignedAgent || 'Unassigned'}</td>
                    <td style={{ fontSize: 12 }}>{timeSince(t.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}><span className={statusBadge(t.status)}>{t.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(t)}>Open →</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination total={tickets.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>

      {selected && (
        <TicketDrawer
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssign={handleAssign}
          onReply={handleReply}
        />
      )}
    </div>
  );
};

export default AdminSupportTickets;
