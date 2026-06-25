import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  SearchFilterBar, Skeleton, Pagination, EmptyState, AvatarChip,
  ExportButton, PageHeader, StatsRow, SectionCard,
  fmtNum, statusBadge, timeSince,
} from './AdminShared';

const PER_PAGE = 12;

const ACTION_ICON = {
  'Approved Organizer': '✅',
  'Rejected Organizer': '❌',
  'Created Event': '📅',
  'Updated Event Details': '✏️',
  'Failed Login Attempt': '🔴',
  'Registered Account': '👤',
  'Purchased Ticket': '🎫',
  'Submitted Review': '⭐',
  'Exported User Report': '📊',
  'Processed Refund': '↩',
  'Deleted User': '🗑',
};

const MODULE_COLOR = {
  'Auth': '#1890ff',
  'Organizer Management': '#D4AF37',
  'Events': '#52c41a',
  'Payments': '#eb2f96',
  'Reports': '#722ed1',
  'Reviews': '#fa8c16',
  'Support': '#13c2c2',
  'Users': '#ff4d4f',
};

const AdminActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getActivityLog(filter, search);
    // Augment with more mock entries
    const augmented = data.length < 8 ? [
      ...data,
      { id: 'al_a1', timestamp: '2026-06-24T21:00:00Z', user: 'Platform Admin', role: 'Admin', action: 'Updated Platform Settings', module: 'Settings', ip: '203.0.113.10', device: 'Chrome/Windows', status: 'Success' },
      { id: 'al_a2', timestamp: '2026-06-24T20:00:00Z', user: 'Sneha Iyer', role: 'User', action: 'Purchased Ticket', module: 'Payments', ip: '203.0.113.50', device: 'Safari/iPhone', status: 'Success' },
      { id: 'al_a3', timestamp: '2026-06-24T19:30:00Z', user: 'NightCraft Studios', role: 'Organizer', action: 'Created Event', module: 'Events', ip: '203.0.113.60', device: 'Chrome/Mac', status: 'Success' },
      { id: 'al_a4', timestamp: '2026-06-24T18:00:00Z', user: 'Unknown', role: 'Unknown', action: 'Failed Login Attempt', module: 'Auth', ip: '45.33.32.156', device: 'Unknown', status: 'Failed' },
      { id: 'al_a5', timestamp: '2026-06-24T17:00:00Z', user: 'Vikram Singh', role: 'User', action: 'Submitted Review', module: 'Reviews', ip: '203.0.113.80', device: 'Firefox/Windows', status: 'Success' },
      { id: 'al_a6', timestamp: '2026-06-24T16:00:00Z', user: 'Platform Admin', role: 'Admin', action: 'Processed Refund', module: 'Payments', ip: '203.0.113.10', device: 'Chrome/Windows', status: 'Success' },
      { id: 'al_a7', timestamp: '2026-06-24T15:00:00Z', user: 'Rohan Verma', role: 'User', action: 'Registered Account', module: 'Auth', ip: '203.0.113.90', device: 'Chrome/Android', status: 'Success' },
      { id: 'al_a8', timestamp: '2026-06-24T14:00:00Z', user: 'Platform Admin', role: 'Admin', action: 'Deleted User', module: 'Users', ip: '203.0.113.10', device: 'Chrome/Windows', status: 'Success' },
    ] : data;
    setLogs(augmented);
    setPage(0);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const stats = [
    { icon: '📋', title: 'Total Events', value: fmtNum(logs.length), sub: 'All activity' },
    { icon: '🔴', title: 'Failed Events', value: fmtNum(logs.filter(l => l.status === 'Failed').length), sub: 'Errors & failures', trend: 'down' },
    { icon: '👑', title: 'Admin Actions', value: fmtNum(logs.filter(l => l.role === 'Admin').length), sub: 'By admins', trend: 'up' },
    { icon: '👤', title: 'User Actions', value: fmtNum(logs.filter(l => l.role === 'User').length), sub: 'By users', trend: 'up' },
  ];

  const paged = logs.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <PageHeader
        title="Activity Log"
        subtitle="Complete audit trail of all actions performed across the platform."
        icon="📋"
        actions={<ExportButton data={logs} filename="activity-log" label="Export Log" />}
      />
      <StatsRow stats={stats} loading={loading} />

      {/* Timeline view */}
      <SectionCard
        title={`Activity Events (${logs.length})`}
        subtitle="Real-time audit trail — newest first"
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Admin', 'User', 'Organizer', 'Success', 'Failed']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by user, action, module..."
          />
        }
      >
        <div style={{ padding: '0 0 8px' }}>
          {loading ? (
            <div style={{ padding: '0 20px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="sk-bar" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="sk-bar" style={{ width: '40%', height: 10 }} />
                    <div className="sk-bar" style={{ width: '60%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : paged.length === 0 ? (
            <EmptyState icon="📋" title="No activity found" sub="Try adjusting your search or filter." />
          ) : (
            <div style={{ padding: '0 20px' }}>
              {paged.map((log, i) => {
                const actionIcon = ACTION_ICON[log.action] || '●';
                const modColor = MODULE_COLOR[log.module] || '#D4AF37';
                const isFailure = log.status === 'Failed';
                return (
                  <div key={log.id || i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: isFailure ? 'rgba(255,77,79,0.1)' : `${modColor}10`, border: `1px solid ${isFailure ? 'rgba(255,77,79,0.3)' : modColor + '30'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {actionIcon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{log.action}</span>
                        <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: `${modColor}15`, color: modColor, border: `1px solid ${modColor}25` }}>{log.module}</span>
                        {isFailure && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'rgba(255,77,79,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.2)' }}>FAILED</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <AvatarChip name={log.user} size={16} />
                          {log.user} <span style={{ fontSize: 10, opacity: 0.6 }}>({log.role})</span>
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>🌐 {log.ip}</span>
                        <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>📱 {log.device}</span>
                      </div>
                    </div>
                    {/* Time */}
                    <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {timeSince(log.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Pagination total={logs.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>
    </div>
  );
};

export default AdminActivityLog;
