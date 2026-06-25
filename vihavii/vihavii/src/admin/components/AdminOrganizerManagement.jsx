import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  StatCard, SearchFilterBar, Skeleton, Pagination, EmptyState,
  ConfirmModal, useToast, ExportButton, Drawer, DetailRow, AvatarChip,
  fmtDate, fmtNum, fmtCur, statusBadge, PageHeader, StatsRow, SectionCard, StarRating,
} from './AdminShared';

const PER_PAGE = 8;

const OrganizerDrawer = ({ org, onClose, onApprove, onReject }) => {
  if (!org) return null;
  return (
    <Drawer open={!!org} onClose={onClose} title="Organizer Profile" width={520}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <AvatarChip name={org.name} size={56} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{org.name}</div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>{org.company}</div>
          <span className={statusBadge(org.status)} style={{ marginTop: 6, display: 'inline-flex' }}>{org.status}</span>
          {org.verified && <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(82,196,26,0.12)', color: '#52c41a', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(82,196,26,0.2)' }}>✓ Verified</span>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text-muted)', fontWeight: 700, marginBottom: 10 }}>Company Details</div>
        <DetailRow label="Organizer ID" value={org.id} mono />
        <DetailRow label="Email" value={org.email} />
        <DetailRow label="Phone" value={org.phone} />
        <DetailRow label="City" value={org.city} />
        <DetailRow label="Category" value={org.category} />
        <DetailRow label="Join Date" value={fmtDate(org.joinDate)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
        {[
          { label: 'Events Hosted', value: org.eventsHosted || 0, color: 'var(--admin-gold)' },
          { label: 'Total Revenue', value: fmtCur(org.revenue || 0), color: '#52c41a' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 6 }}>Rating</div>
        <StarRating rating={org.rating} />
      </div>

      {org.status === 'Pending' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button className="admin-btn-success" style={{ flex: 1 }} onClick={() => { onApprove(org.id); onClose(); }}>✓ Approve Organizer</button>
          <button className="admin-btn-danger" style={{ flex: 1 }} onClick={() => { onReject(org.id); onClose(); }}>✕ Reject</button>
        </div>
      )}
    </Drawer>
  );
};

const AdminOrganizerManagement = () => {
  const [orgs, setOrgs] = useState([]);
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
    const data = await adminService.getOrganizers(filter, search);
    setOrgs(data);
    setPage(0);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await adminService.approveOrganizer(id);
      show('Organizer approved successfully', 'success');
      load();
    } catch { show('Action failed', 'error'); }
    setActionLoading(false);
    setConfirm(null);
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await adminService.rejectOrganizer(id);
      show('Organizer rejected', 'warning');
      load();
    } catch { show('Action failed', 'error'); }
    setActionLoading(false);
    setConfirm(null);
  };

  const handleSuspend = async (id) => {
    setActionLoading(true);
    try {
      await adminService.suspendOrganizer(id);
      show('Organizer suspended', 'warning');
      load();
    } catch { show('Action failed', 'error'); }
    setActionLoading(false);
    setConfirm(null);
  };

  const stats = [
    { icon: '🏢', title: 'Total Organizers', value: fmtNum(orgs.length), sub: 'All registered' },
    { icon: '✅', title: 'Approved', value: fmtNum(orgs.filter(o => o.status === 'Approved').length), sub: 'Active organizers', trend: 'up' },
    { icon: '⏳', title: 'Pending Review', value: fmtNum(orgs.filter(o => o.status === 'Pending').length), sub: 'Awaiting approval', trend: orgs.filter(o => o.status === 'Pending').length > 0 ? 'down' : 'up' },
    { icon: '⭐', title: 'Verified', value: fmtNum(orgs.filter(o => o.verified).length), sub: 'Badge holders', trend: 'up' },
  ];

  const paged = orgs.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Organizer Management"
        subtitle="Review applications, approve organizers, and manage platform partnerships."
        icon="🏢"
        actions={<ExportButton data={orgs} filename="organizers" label="Export CSV" />}
      />

      <StatsRow stats={stats} loading={loading} />

      <SectionCard
        title={`Organizers (${orgs.length})`}
        subtitle="Manage all event organizers on the platform"
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Approved', 'Pending', 'Rejected', 'Suspended']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by name, company, email..."
          />
        }
      >
        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Category</th>
                <th>City</th>
                <th>Events</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton rows={PER_PAGE} cols={8} /> :
                paged.length === 0 ? <EmptyState icon="🏢" title="No organizers found" /> :
                paged.map(org => (
                  <tr key={org.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(org)}>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarChip name={org.name} size={34} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{org.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{org.email}</div>
                        </div>
                        {org.verified && <span title="Verified" style={{ fontSize: 12, color: '#52c41a' }}>✓</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{org.category || '—'}</td>
                    <td style={{ fontSize: 12 }}>{org.city || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-gold)' }}>{org.eventsHosted || 0}</td>
                    <td style={{ fontSize: 12, color: '#52c41a' }}>{fmtCur(org.revenue || 0)}</td>
                    <td onClick={e => e.stopPropagation()}><StarRating rating={org.rating} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <span className={statusBadge(org.status)}>{org.status}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(org)}>👁 View</button>
                        {org.status === 'Pending' && (
                          <>
                            <button className="admin-btn-success" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'approve', id: org.id, name: org.name })}>Approve</button>
                            <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'reject', id: org.id, name: org.name })}>Reject</button>
                          </>
                        )}
                        {org.status === 'Approved' && (
                          <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'suspend', id: org.id, name: org.name })}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination total={orgs.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>

      <OrganizerDrawer org={selected} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleReject} />

      {confirm && (
        <ConfirmModal
          title={`Confirm: ${confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)} Organizer`}
          message={`Are you sure you want to ${confirm.action} "${confirm.name}"?`}
          confirmLabel={confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}
          type={confirm.action === 'approve' ? 'primary' : 'danger'}
          onConfirm={() => {
            if (confirm.action === 'approve') handleApprove(confirm.id);
            else if (confirm.action === 'reject') handleReject(confirm.id);
            else if (confirm.action === 'suspend') handleSuspend(confirm.id);
          }}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminOrganizerManagement;
