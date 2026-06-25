import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  SearchFilterBar, Skeleton, Pagination, EmptyState,
  ConfirmModal, useToast, ExportButton, Drawer, DetailRow,
  fmtDate, fmtNum, fmtCur, statusBadge, PageHeader, StatsRow, SectionCard, SvgBarChart, ChartLegend,
} from './AdminShared';

const PER_PAGE = 10;

const PaymentDrawer = ({ payment, onClose, onRefund }) => {
  if (!payment) return null;
  const statusColor = { Success: '#52c41a', Failed: '#ff4d4f', Pending: '#fa8c16', Refunded: '#1890ff' }[payment.status] || '#fff';
  return (
    <Drawer open={!!payment} onClose={onClose} title="Transaction Details" width={500}>
      <div style={{ background: `${statusColor}08`, border: `1px solid ${statusColor}20`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Transaction ID</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace', marginTop: 3 }}>{payment.id}</div>
          </div>
          <span className={statusBadge(payment.status)}>{payment.status}</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 28, fontWeight: 900, color: statusColor }}>{fmtCur(payment.amount)}</div>
      </div>

      <DetailRow label="User" value={payment.userName} />
      <DetailRow label="Event" value={payment.eventName} />
      <DetailRow label="Gateway" value={payment.gateway} />
      <DetailRow label="Date" value={fmtDate(payment.date)} />
      <DetailRow label="Status" value={payment.status} />

      {payment.status === 'Success' && (
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button className="admin-btn-danger" style={{ width: '100%' }} onClick={() => { onRefund(payment.id); onClose(); }}>
            ↩ Process Refund
          </button>
          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', textAlign: 'center', marginTop: 8 }}>
            This will reverse the transaction and credit the user's account.
          </div>
        </div>
      )}
    </Drawer>
  );
};

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
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
    const data = await adminService.getPayments(filter, search);
    setPayments(data);
    setPage(0);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async (id) => {
    setActionLoading(true);
    try {
      await adminService.refundPayment(id);
      show('Refund processed successfully', 'success');
      load();
    } catch { show('Refund failed', 'error'); }
    setActionLoading(false);
    setConfirm(null);
  };

  const totalRevenue = payments.filter(p => p.status === 'Success').reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalRefunded = payments.filter(p => p.status === 'Refunded').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const stats = [
    { icon: '💰', title: 'Total Revenue', value: fmtCur(totalRevenue), sub: 'Successful transactions', trend: 'up' },
    { icon: '✅', title: 'Successful', value: fmtNum(payments.filter(p => p.status === 'Success').length), sub: 'Completed payments', trend: 'up' },
    { icon: '↩', title: 'Refunded', value: fmtCur(totalRefunded), sub: 'Amount refunded' },
    { icon: '❌', title: 'Failed', value: fmtNum(payments.filter(p => p.status === 'Failed').length), sub: 'Failed transactions', trend: 'down' },
  ];

  const gwData = ['Razorpay', 'Stripe', 'UPI', 'Wallet'].map(gw => ({
    gw,
    count: payments.filter(p => p.gateway === gw).length,
  }));

  const paged = payments.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const gwColor = { Razorpay: '#1890ff', Stripe: '#6772e5', UPI: '#52c41a', Wallet: '#fa8c16' };

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Payment Management"
        subtitle="Monitor all transactions, process refunds, and track revenue across payment gateways."
        icon="💰"
        actions={<ExportButton data={payments} filename="payments" label="Export CSV" />}
      />
      <StatsRow stats={stats} loading={loading} />

      {/* Gateway breakdown */}
      <SectionCard title="Gateway Distribution" subtitle="Transactions by payment gateway">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <SvgBarChart
              data={gwData} xKey="gw"
              bars={[{ key: 'count', label: 'Transactions', color: '#D4AF37' }]}
              height={160}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gwData.map(g => (
              <div key={g.gw} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: gwColor[g.gw] || '#D4AF37' }} />
                <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', minWidth: 70 }}>{g.gw}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{g.count} txns</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Transactions table */}
      <SectionCard
        title={`Transactions (${payments.length})`}
        noPad
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={['All', 'Success', 'Pending', 'Failed', 'Refunded']}
            activeFilter={filter} onFilter={f => { setFilter(f); setPage(0); }}
            placeholder="Search by user, transaction ID..."
          />
        }
      >
        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton rows={PER_PAGE} cols={8} /> :
                paged.length === 0 ? <EmptyState icon="💳" title="No transactions found" /> :
                paged.map((p, i) => (
                  <tr key={p.id || i} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--admin-gold)' }}>{p.id}</td>
                    <td style={{ fontSize: 13 }}>{p.userName || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{p.eventName || '—'}</td>
                    <td style={{ fontWeight: 700, color: p.status === 'Refunded' ? '#1890ff' : '#52c41a' }}>{fmtCur(p.amount)}</td>
                    <td>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${gwColor[p.gateway] || '#D4AF37'}18`, color: gwColor[p.gateway] || '#D4AF37', border: `1px solid ${gwColor[p.gateway] || '#D4AF37'}30` }}>
                        {p.gateway || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{fmtDate(p.date)}</td>
                    <td onClick={e => e.stopPropagation()}><span className={statusBadge(p.status)}>{p.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(p)}>👁 View</button>
                        {p.status === 'Success' && (
                          <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ id: p.id })}>↩ Refund</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination total={payments.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </SectionCard>

      <PaymentDrawer payment={selected} onClose={() => setSelected(null)} onRefund={id => setConfirm({ id })} />

      {confirm && (
        <ConfirmModal
          title="Process Refund"
          message="Are you sure you want to refund this transaction? The amount will be credited back to the user's original payment method."
          confirmLabel="Process Refund"
          type="danger"
          onConfirm={() => handleRefund(confirm.id)}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminPaymentManagement;
