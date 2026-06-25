import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  StatCard, SearchFilterBar, Skeleton, Pagination, EmptyState,
  ConfirmModal, useToast, ExportButton, Drawer, DetailRow, AvatarChip,
  fmtDate, fmtNum, statusBadge, PageHeader, StatsRow, SectionCard
} from './AdminShared';

const PER_PAGE = 8;

const UserProfileDrawer = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <Drawer open={!!user} onClose={onClose} title="User Profile" width={500}>
      {/* Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 0 20px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <AvatarChip name={user.name} size={56} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 3 }}>{user.email}</div>
          <span className={statusBadge(user.status)} style={{ marginTop: 6, display: 'inline-flex' }}>{user.status}</span>
        </div>
      </div>

      {/* Personal Information */}
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text-muted)', fontWeight: 700, marginBottom: 10 }}>Personal Information</div>
        <DetailRow label="User ID" value={user.id} mono />
        <DetailRow label="Phone" value={user.phone} />
        <DetailRow label="City" value={user.city} />
        <DetailRow label="Role" value={user.role} />
        <DetailRow label="Joined" value={fmtDate(user.joinDate)} />
        <DetailRow label="Last Login" value={fmtDate(user.lastLogin)} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
        {[
          { label: 'Events Attended', value: user.eventsAttended || 0, color: 'var(--admin-gold)' },
          { label: 'Status', value: user.status, color: user.status === 'Active' ? 'var(--admin-green)' : 'var(--admin-red)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text-muted)', fontWeight: 700, marginBottom: 12 }}>Recent Activity</div>
        {[
          { action: 'Purchased ticket', detail: 'Summer Music Festival', time: '2 days ago' },
          { action: 'Submitted review', detail: 'Rating: 5/5', time: '3 days ago' },
          { action: 'Registered account', detail: 'Email verified', time: fmtDate(user.joinDate) },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-gold)', marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#fff' }}>{a.action} — <span style={{ color: 'var(--admin-text-muted)' }}>{a.detail}</span></div>
              <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginTop: 2 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm] = useState(null); // { action, userId, label }
  const [actionLoading, setActionLoading] = useState(false);
  const { show, ToastContainer } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getUsers(filter, search);
    setUsers(data.sort((a, b) => (a[sort] || '').toString().localeCompare((b[sort] || '').toString())));
    setPage(0);
    setLoading(false);
  }, [filter, search, sort]);

  useEffect(() => { load(); }, [load]);

  const stats = [
    { icon: '👥', title: 'Total Users', value: fmtNum(users.length), sub: 'All registered attendees' },
    { icon: '✅', title: 'Active Users', value: fmtNum(users.filter(u => u.status === 'Active').length), sub: 'Currently active', trend: 'up' },
    { icon: '🆕', title: 'New This Month', value: fmtNum(users.filter(u => u.joinDate?.startsWith('2026-06')).length), sub: 'June 2026', trend: 'up' },
    { icon: '🚫', title: 'Suspended', value: fmtNum(users.filter(u => u.status === 'Suspended').length), sub: 'Needs review', trend: 'down' },
  ];

  const paged = users.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.action === 'suspend') await adminService.updateUserStatus(confirm.userId, 'Suspended');
      else if (confirm.action === 'activate') await adminService.updateUserStatus(confirm.userId, 'Active');
      else if (confirm.action === 'delete') await adminService.deleteUser(confirm.userId);
      show(`User ${confirm.label} successfully`, 'success');
      setConfirm(null);
      load();
    } catch {
      show('Action failed. Please try again.', 'error');
    }
    setActionLoading(false);
  };

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="User Management"
        subtitle="Manage all attendees, view profiles, and enforce platform policies."
        icon="👥"
        actions={<ExportButton data={users} filename="users" label="Export CSV" />}
      />

      <StatsRow stats={stats} loading={loading} />

      {/* Table */}
      <SectionCard
        title={`Users (${users.length})`}
        subtitle="All registered attendees on the platform"
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Active', 'Inactive', 'Suspended']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by name, email, city..."
            right={
              <select value={sort} onChange={e => setSort(e.target.value)} className="admin-select" style={{ fontSize: 11 }}>
                <option value="name">Sort: Name</option>
                <option value="joinDate">Sort: Join Date</option>
                <option value="eventsAttended">Sort: Events Attended</option>
              </select>
            }
          />
        }
      >
        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>City</th>
                <th>Events Attended</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton rows={PER_PAGE} cols={7} /> :
                paged.length === 0 ? <EmptyState icon="👤" title="No users found" /> :
                paged.map(user => (
                  <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(user)}>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarChip name={user.name} size={34} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{user.phone || '—'}</td>
                    <td style={{ fontSize: 12 }}>{user.city || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-gold)' }}>{user.eventsAttended || 0}</td>
                    <td style={{ fontSize: 12 }}>{fmtDate(user.joinDate)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <span className={statusBadge(user.status)}>{user.status || 'Active'}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelectedUser(user)}>👁 View</button>
                        {user.status !== 'Suspended' ? (
                          <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'suspend', userId: user.id, label: 'suspended' })}>Suspend</button>
                        ) : (
                          <button className="admin-btn-success" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'activate', userId: user.id, label: 'activated' })}>Activate</button>
                        )}
                        <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ action: 'delete', userId: user.id, label: 'deleted' })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination total={users.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>

      {/* Profile Drawer */}
      <UserProfileDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          title={`Confirm Action`}
          message={`Are you sure you want to ${confirm.action} this user? This action can be reversed.`}
          confirmLabel={confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}
          type={confirm.action === 'delete' ? 'danger' : 'primary'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;
