import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import {
  useToast, ExportButton, PageHeader, SectionCard,
  SvgBarChart, SvgLineChart, SvgPieChart, ChartLegend,
  fmtCur, fmtNum,
} from './AdminShared';

const REPORT_TYPES = [
  { id: 'revenue', label: 'Revenue Report', icon: '💰', desc: 'Monthly revenue vs expenses breakdown' },
  { id: 'users', label: 'User Growth Report', icon: '👥', desc: 'User and organizer registration trends' },
  { id: 'events', label: 'Event Performance', icon: '📅', desc: 'Events by category, status, and revenue' },
  { id: 'tickets', label: 'Ticket Sales Report', icon: '🎫', desc: 'Ticket volume and conversion metrics' },
];

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months', 'All Time'];

const MetricCard = ({ label, value, sub, color = 'var(--admin-gold)' }) => (
  <div className="admin-card" style={{ padding: 18 }}>
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--admin-text-muted)', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 900, color, marginTop: 10 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const AdminReports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('Last 12 Months');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { show, ToastContainer } = useToast();

  const revenueData = adminService.getRevenueChartData();
  const growthData = adminService.getUserGrowthData();

  const categoryData = [
    { name: 'Music', value: 34, color: '#1890ff' },
    { name: 'Technology', value: 22, color: '#52c41a' },
    { name: 'Business', value: 15, color: '#D4AF37' },
    { name: 'Dance', value: 18, color: '#722ed1' },
    { name: 'Food', value: 16, color: '#eb2f96' },
    { name: 'Others', value: 23, color: '#fa8c16' },
  ];

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = revenueData.reduce((s, d) => s + d.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  useEffect(() => {
    setLoading(true);
    adminService.generateReport(reportType, dateRange).then(r => {
      setReportData(r);
      setLoading(false);
    });
  }, [reportType, dateRange]);

  const handleExportReport = () => {
    if (!reportData) return;
    const data = reportData.data.length > 0 ? reportData.data :
      [{ type: reportType, dateRange, generatedAt: reportData.generatedAt, ...reportData.summary }];
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${String(v)}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `vihavi-${reportType}-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    show(`${reportType} report exported!`, 'success');
  };

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate, visualize, and export comprehensive business intelligence reports."
        icon="📊"
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select className="admin-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              {DATE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={handleExportReport} className="admin-btn-outline">⬇ Export Report</button>
          </div>
        }
      />

      {/* Report Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {REPORT_TYPES.map(rt => (
          <div key={rt.id} onClick={() => setReportType(rt.id)}
            style={{ background: reportType === rt.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${reportType === rt.id ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{rt.icon}</div>
            <div style={{ fontWeight: 700, color: reportType === rt.id ? 'var(--admin-gold)' : '#fff', fontSize: 13 }}>{rt.label}</div>
            <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 4 }}>{rt.desc}</div>
          </div>
        ))}
      </div>

      {/* Revenue Report */}
      {reportType === 'revenue' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            <MetricCard label="Gross Revenue" value={fmtCur(totalRevenue)} sub="All successful payments" color="#52c41a" />
            <MetricCard label="Total Expenses" value={fmtCur(totalExpenses)} sub="Operational costs" color="#ff4d4f" />
            <MetricCard label="Net Profit" value={fmtCur(netProfit)} sub="After expenses" color="var(--admin-gold)" />
            <MetricCard label="Profit Margin" value={`${profitMargin}%`} sub="Revenue efficiency" color="#1890ff" />
          </div>
          <SectionCard title="Revenue vs Expenses — Monthly (Last 12 Months)" subtitle={`Date range: ${dateRange}`}>
            <SvgBarChart
              data={revenueData} xKey="month"
              bars={[{ key: 'revenue', label: 'Revenue', color: '#52c41a' }, { key: 'expenses', label: 'Expenses', color: '#ff4d4f' }]}
              height={240}
            />
            <ChartLegend items={[{ label: 'Revenue', color: '#52c41a' }, { label: 'Expenses', color: '#ff4d4f' }]} />
          </SectionCard>
          <SectionCard title="Revenue Breakdown Table" subtitle="Monthly detail">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Net</th><th>Margin</th></tr></thead>
                <tbody>
                  {revenueData.map(d => {
                    const net = d.revenue - d.expenses;
                    const margin = ((net / d.revenue) * 100).toFixed(1);
                    return (
                      <tr key={d.month}>
                        <td style={{ fontWeight: 600 }}>{d.month}</td>
                        <td style={{ color: '#52c41a' }}>{fmtCur(d.revenue)}</td>
                        <td style={{ color: '#ff4d4f' }}>{fmtCur(d.expenses)}</td>
                        <td style={{ color: 'var(--admin-gold)', fontWeight: 700 }}>{fmtCur(net)}</td>
                        <td style={{ color: '#1890ff' }}>{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}

      {/* User Growth Report */}
      {reportType === 'users' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            <MetricCard label="Total Users" value={fmtNum(growthData[growthData.length - 1]?.users || 0)} sub="Registered attendees" />
            <MetricCard label="Total Organizers" value={fmtNum(growthData[growthData.length - 1]?.organizers || 0)} sub="Active organizers" color="#52c41a" />
            <MetricCard label="MoM Growth" value="+20.6%" sub="User growth rate" color="#1890ff" />
            <MetricCard label="Avg Retention" value="78%" sub="Monthly active users" color="#722ed1" />
          </div>
          <SectionCard title="User & Organizer Growth" subtitle="Cumulative registrations over time">
            <SvgLineChart
              data={growthData} xKey="month"
              lines={[{ key: 'users', label: 'Users', color: '#D4AF37' }, { key: 'organizers', label: 'Organizers', color: '#52c41a' }]}
              height={240}
            />
            <ChartLegend items={[{ label: 'Users', color: '#D4AF37' }, { label: 'Organizers', color: '#52c41a' }]} />
          </SectionCard>
        </>
      )}

      {/* Event Performance */}
      {reportType === 'events' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            <MetricCard label="Total Events" value="128" sub="All time" />
            <MetricCard label="Published" value="89" sub="Live events" color="#52c41a" />
            <MetricCard label="Avg Attendance" value="312" sub="Per event" color="#1890ff" />
            <MetricCard label="Top Category" value="Music" sub="By event count" color="var(--admin-gold)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SectionCard title="Events by Category">
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <SvgPieChart data={categoryData} size={160} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categoryData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Event Status Breakdown">
              <SvgBarChart
                data={[{ s: 'Published', v: 89 }, { s: 'Draft', v: 24 }, { s: 'Cancelled', v: 10 }, { s: 'Completed', v: 5 }]}
                xKey="s"
                bars={[{ key: 'v', label: 'Events', color: '#D4AF37' }]}
                height={180}
              />
            </SectionCard>
          </div>
        </>
      )}

      {/* Ticket Sales */}
      {reportType === 'tickets' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            <MetricCard label="Tickets Sold" value="4,821" sub="All time" color="#52c41a" />
            <MetricCard label="Avg Ticket Price" value="₹2,840" sub="Across all events" />
            <MetricCard label="Conversion Rate" value="68%" sub="View to purchase" color="#1890ff" />
            <MetricCard label="Refund Rate" value="4.2%" sub="Of total sales" color="#ff4d4f" />
          </div>
          <SectionCard title="Ticket Sales Trend">
            <SvgLineChart
              data={revenueData.map(d => ({ month: d.month, tickets: Math.round(d.revenue / 2840) }))}
              xKey="month"
              lines={[{ key: 'tickets', label: 'Tickets Sold', color: '#D4AF37' }]}
              height={240}
            />
            <ChartLegend items={[{ label: 'Tickets Sold', color: '#D4AF37' }]} />
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default AdminReports;
