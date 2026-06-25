import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  SearchFilterBar, Skeleton, Pagination, EmptyState,
  ConfirmModal, useToast, ExportButton, Drawer, DetailRow, AvatarChip,
  fmtDate, fmtNum, statusBadge, PageHeader, StatsRow, SectionCard, StarRating,
} from './AdminShared';

const PER_PAGE = 8;

const ReviewDrawer = ({ review, onClose, onApprove, onReject, onDelete }) => {
  if (!review) return null;
  return (
    <Drawer open={!!review} onClose={onClose} title="Review Details" width={500}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottom: '1px solid rgba(212,175,55,0.08)', marginBottom: 20 }}>
        <AvatarChip name={review.userName} size={48} />
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{review.userName}</div>
          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2 }}>{review.eventName}</div>
          <div style={{ marginTop: 6 }}><StarRating rating={review.rating} /></div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontStyle: 'italic' }}>"{review.comment}"</div>
      </div>

      <DetailRow label="Submitted" value={fmtDate(review.date)} />
      <DetailRow label="Status" value={review.status} />
      <DetailRow label="Reported" value={review.reported ? '⚠ Yes – flagged by users' : 'No'} />
      <DetailRow label="Helpful Votes" value={String(review.helpful || 0)} />

      <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {review.status !== 'Approved' && (
          <button className="admin-btn-success" style={{ flex: 1 }} onClick={() => { onApprove(review.id); onClose(); }}>✓ Approve</button>
        )}
        {review.status !== 'Rejected' && (
          <button className="admin-btn-outline" style={{ flex: 1 }} onClick={() => { onReject(review.id); onClose(); }}>🚫 Reject</button>
        )}
        <button className="admin-btn-danger" style={{ flex: 1 }} onClick={() => { onDelete(review.id); onClose(); }}>🗑 Delete</button>
      </div>
    </Drawer>
  );
};

const AdminReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
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
    const data = await adminService.getReviews(filter, search);
    setReviews(data);
    setPage(0);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (fn, msg, type = 'success') => {
    setActionLoading(true);
    try { await fn(); show(msg, type); load(); }
    catch { show('Action failed', 'error'); }
    setActionLoading(false);
    setConfirm(null);
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0';

  const stats = [
    { icon: '⭐', title: 'Total Reviews', value: fmtNum(reviews.length), sub: 'All platform reviews' },
    { icon: '✅', title: 'Approved', value: fmtNum(reviews.filter(r => r.status === 'Approved').length), sub: 'Visible to public', trend: 'up' },
    { icon: '⏳', title: 'Pending', value: fmtNum(reviews.filter(r => r.status === 'Pending').length), sub: 'Awaiting moderation' },
    { icon: '⚠', title: 'Reported', value: fmtNum(reviews.filter(r => r.reported).length), sub: 'Flagged by users', trend: reviews.filter(r => r.reported).length > 0 ? 'down' : 'up' },
  ];

  const paged = reviews.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const ratingColor = (r) => r >= 4 ? '#52c41a' : r >= 3 ? '#fa8c16' : '#ff4d4f';

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Review Moderation"
        subtitle="Moderate user reviews, approve quality content, and remove policy violations."
        icon="⭐"
        actions={<ExportButton data={reviews} filename="reviews" label="Export CSV" />}
      />
      <StatsRow stats={stats} loading={loading} />

      {/* Avg Rating Banner */}
      <div className="admin-card" style={{ marginBottom: 20, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--admin-gold)' }}>{avgRating}</div>
        <div>
          <div style={{ marginBottom: 4 }}><StarRating rating={parseFloat(avgRating)} /></div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>Average platform rating across {reviews.length} reviews</div>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 4, flexDirection: 'column', maxWidth: 200, marginLeft: 'auto' }}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--admin-text-muted)', minWidth: 12 }}>{star}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: ratingColor(star), transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--admin-text-muted)', minWidth: 18 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SectionCard
        title={`Reviews (${reviews.length})`}
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Pending', 'Approved', 'Rejected', 'Reported']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by user, event, comment..."
          />
        }
      >
        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Event</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton rows={PER_PAGE} cols={7} /> :
                paged.length === 0 ? <EmptyState icon="⭐" title="No reviews found" /> :
                paged.map(rev => (
                  <tr key={rev.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(rev)}>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AvatarChip name={rev.userName} size={30} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{rev.userName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)', maxWidth: 140 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.eventName}</div></td>
                    <td><StarRating rating={rev.rating} /></td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {rev.reported && <span title="Reported" style={{ color: '#ff4d4f', fontSize: 12 }}>⚠</span>}
                        "{rev.comment}"
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{fmtDate(rev.date)}</td>
                    <td onClick={e => e.stopPropagation()}><span className={statusBadge(rev.status)}>{rev.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(rev)}>👁 View</button>
                        {rev.status === 'Pending' && (
                          <button className="admin-btn-success" style={{ fontSize: 11 }} onClick={() => doAction(() => adminService.updateReviewStatus(rev.id, 'Approved'), 'Review approved')}>✓</button>
                        )}
                        <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ id: rev.id })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination total={reviews.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>

      <ReviewDrawer
        review={selected}
        onClose={() => setSelected(null)}
        onApprove={id => doAction(() => adminService.updateReviewStatus(id, 'Approved'), 'Review approved')}
        onReject={id => doAction(() => adminService.updateReviewStatus(id, 'Rejected'), 'Review rejected', 'warning')}
        onDelete={id => setConfirm({ id })}
      />

      {confirm && (
        <ConfirmModal
          title="Delete Review"
          message="Permanently delete this review? This action cannot be undone."
          confirmLabel="Delete"
          type="danger"
          onConfirm={() => doAction(() => adminService.deleteReview(confirm.id), 'Review deleted', 'warning')}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminReviewModeration;
