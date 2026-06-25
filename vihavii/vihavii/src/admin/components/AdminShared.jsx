// ============================================================
// VIHAVI ADMIN — Shared Reusable Components
// StatCard, Toast, ConfirmModal, Skeleton, Pagination,
// EmptyState, SearchFilterBar, SVG Charts, ExportButton
// ============================================================
import React, { useState, useEffect, useRef } from 'react';

// ── Utility ──────────────────────────────────────────────────
export const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN');
export const fmtCur = (n) => `₹${fmtNum(n)}`;
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
export const timeSince = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Status badge helper ──────────────────────────────────────
export const statusBadge = (status) => {
  const map = {
    Active: 'success', Approved: 'success', Published: 'success', Success: 'success', Resolved: 'success', Verified: 'success',
    Pending: 'pending', 'In Progress': 'pending', Draft: 'pending',
    Suspended: 'failed', Rejected: 'failed', Failed: 'failed', Cancelled: 'failed', Inactive: 'failed',
    Open: 'info', Escalated: 'critical', Featured: 'gold', Refunded: 'info',
  };
  return `admin-badge admin-badge-${map[status] || 'info'}`;
};

// ── StatCard ─────────────────────────────────────────────────
export const StatCard = ({ icon, title, value, sub, trend, color, loading }) => {
  if (loading) return (
    <div className="admin-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sk-bar" style={{ width: 80, height: 10 }} />
      <div className="sk-bar" style={{ width: '60%', height: 28 }} />
      <div className="sk-bar" style={{ width: '40%', height: 10 }} />
    </div>
  );
  const trendColor = trend === 'up' ? 'var(--admin-green)' : trend === 'down' ? 'var(--admin-red)' : 'var(--admin-text-muted)';
  return (
    <div className="admin-card admin-stat-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--admin-text-muted)', fontWeight: 700 }}>{title}</span>
        <div style={{ padding: 9, borderRadius: 10, background: color ? `${color}18` : 'rgba(212,175,55,0.08)', color: color || 'var(--admin-gold)', display: 'flex', alignItems: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginTop: 12, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: trendColor, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{sub}</div>}
    </div>
  );
};

// ── Toast Notification ────────────────────────────────────────
export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const cfg = {
    success: { bg: 'rgba(82,196,26,0.12)', border: 'rgba(82,196,26,0.3)', color: '#52c41a', icon: '✓' },
    error:   { bg: 'rgba(255,77,79,0.12)',  border: 'rgba(255,77,79,0.3)',  color: '#ff4d4f', icon: '✕' },
    warning: { bg: 'rgba(250,140,22,0.12)', border: 'rgba(250,140,22,0.3)', color: '#fa8c16', icon: '⚠' },
    info:    { bg: 'rgba(24,144,255,0.12)', border: 'rgba(24,144,255,0.3)', color: '#1890ff', icon: 'ℹ' },
  }[type] || {};
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#1e1e24', border: `1px solid ${cfg.border}`,
      borderRadius: 12, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
      maxWidth: 360, minWidth: 260,
    }}>
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, padding: 2 }}>×</button>
    </div>
  );
};

// ── useToast hook ─────────────────────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  const ToastContainer = () => (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => <Toast key={t.id} {...t} onClose={() => remove(t.id)} />)}
    </div>
  );
  return { show, ToastContainer };
};

// ── Confirm Modal ─────────────────────────────────────────────
export const ConfirmModal = ({ title, message, confirmLabel = 'Confirm', type = 'danger', onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ background: '#1e1e24', border: `1px solid ${type === 'danger' ? 'rgba(255,77,79,0.3)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 16, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: type === 'danger' ? '#ff4d4f' : 'var(--admin-gold)', marginBottom: 12 }}>{title}</div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="admin-btn-outline">Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{
          background: type === 'danger' ? 'rgba(255,77,79,0.15)' : 'linear-gradient(135deg,var(--admin-burgundy),#7a1528)',
          border: `1px solid ${type === 'danger' ? 'rgba(255,77,79,0.4)' : 'rgba(212,175,55,0.3)'}`,
          color: type === 'danger' ? '#ff4d4f' : 'var(--admin-gold)',
          padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          fontFamily: 'Inter, sans-serif',
        }}>{loading ? 'Processing...' : confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ── Skeleton Loader ───────────────────────────────────────────
export const Skeleton = ({ rows = 5, cols = 5 }) => (
  <>
    <style>{`.sk-bar{background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:4px}.@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={{ padding: '14px 16px' }}>
            <div className="sk-bar" style={{ height: 12, width: `${40 + Math.random() * 40}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── Pagination ────────────────────────────────────────────────
export const Pagination = ({ total, page, perPage, onChange }) => {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const start = page * perPage + 1;
  const end = Math.min((page + 1) * perPage, total);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>Showing {start}–{end} of {total} records</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} className="admin-btn-outline" style={{ padding: '5px 10px', opacity: page === 0 ? 0.3 : 1 }}>‹</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = Math.max(0, Math.min(pages - 5, page - 2)) + i;
          return (
            <button key={p} onClick={() => onChange(p)} className="admin-btn-outline" style={{ padding: '5px 10px', background: p === page ? 'rgba(212,175,55,0.15)' : '', color: p === page ? 'var(--admin-gold)' : '', borderColor: p === page ? 'rgba(212,175,55,0.3)' : '' }}>{p + 1}</button>
          );
        })}
        <button onClick={() => onChange(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1} className="admin-btn-outline" style={{ padding: '5px 10px', opacity: page >= pages - 1 ? 0.3 : 1 }}>›</button>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title = 'No data found', sub = 'Try adjusting your filters.' }) => (
  <tr><td colSpan={99} style={{ padding: '60px 20px', textAlign: 'center' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{sub}</div>
  </td></tr>
);

// ── Search + Filter Bar ───────────────────────────────────────
export const SearchFilterBar = ({ search, onSearch, filters = [], activeFilter, onFilter, placeholder = 'Search...', right }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-glass-border)', borderRadius: 8, padding: '8px 14px', flex: '1 1 200px' }}>
      <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input value={search} onChange={e => onSearch(e.target.value)} placeholder={placeholder} style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, flex: 1, fontFamily: 'Inter, sans-serif' }} />
    </div>
    {filters.length > 0 && (
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 3, borderRadius: 8, border: '1px solid var(--admin-glass-border)' }}>
        {filters.map(f => (
          <button key={f} onClick={() => onFilter(f)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: activeFilter === f ? 'var(--admin-burgundy)' : 'transparent', color: activeFilter === f ? 'var(--admin-gold)' : 'var(--admin-text-muted)', fontSize: 11, fontWeight: activeFilter === f ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{f}</button>
        ))}
      </div>
    )}
    {right}
  </div>
);

// ── CSV Export Button ─────────────────────────────────────────
export const ExportButton = ({ data, filename = 'export', label = 'Export CSV' }) => {
  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={exportCSV} className="admin-btn-outline" style={{ gap: 6, whiteSpace: 'nowrap' }}>⬇ {label}</button>;
};

// ── SVG Bar Chart ─────────────────────────────────────────────
export const SvgBarChart = ({ data = [], xKey = 'label', bars = [], height = 200, showGrid = true }) => {
  const W = 600, H = height;
  const PAD = { top: 16, right: 16, bottom: 30, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.flatMap(d => bars.map(b => d[b.key] || 0)), 1);
  const barW = (plotW / data.length) * 0.6;
  const gap = plotW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      {showGrid && [0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PAD.top + plotH * (1 - f);
        return (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">{Math.round(maxVal * f).toLocaleString()}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = PAD.left + i * gap + gap / 2;
        const totalBars = bars.length;
        return (
          <g key={i}>
            {bars.map((b, bi) => {
              const bx = cx - (totalBars * barW / 2) + bi * (barW + 2);
              const bh = ((d[b.key] || 0) / maxVal) * plotH;
              const by = PAD.top + plotH - bh;
              return (
                <g key={bi}>
                  <rect x={bx} y={by} width={barW} height={bh} fill={b.color} rx="3" opacity="0.85" />
                  <title>{b.label}: {fmtNum(d[b.key])}</title>
                </g>
              );
            })}
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">{d[xKey]}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ── SVG Line Chart ────────────────────────────────────────────
export const SvgLineChart = ({ data = [], xKey = 'label', lines = [], height = 200 }) => {
  const W = 600, H = height;
  const PAD = { top: 16, right: 16, bottom: 30, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.flatMap(d => lines.map(l => d[l.key] || 0)), 1);
  const toX = (i) => PAD.left + (i / (data.length - 1 || 1)) * plotW;
  const toY = (v) => PAD.top + plotH - (v / maxVal) * plotH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PAD.top + plotH * (1 - f);
        return (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">{Math.round(maxVal * f).toLocaleString()}</text>
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">{d[xKey]}</text>
      ))}
      {lines.map(line => {
        const pts = data.map((d, i) => `${toX(i)},${toY(d[line.key] || 0)}`).join(' ');
        const area = `M${toX(0)},${PAD.top + plotH} ` + data.map((d, i) => `L${toX(i)},${toY(d[line.key] || 0)}`).join(' ') + ` L${toX(data.length - 1)},${PAD.top + plotH} Z`;
        return (
          <g key={line.key}>
            <path d={area} fill={line.color} opacity="0.07" />
            <polyline points={pts} fill="none" stroke={line.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${line.color}50)` }} />
            {data.map((d, i) => <circle key={i} cx={toX(i)} cy={toY(d[line.key] || 0)} r="3" fill={line.color} />)}
          </g>
        );
      })}
    </svg>
  );
};

// ── SVG Pie Chart ─────────────────────────────────────────────
export const SvgPieChart = ({ data = [], size = 200 }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.38, inner = r * 0.55;
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let startAngle = -Math.PI / 2;
  const toRad = (v) => (v / total) * 2 * Math.PI;
  const arc = (sa, ea, rx, ry = rx) => {
    const x1 = cx + rx * Math.cos(sa), y1 = cy + ry * Math.sin(sa);
    const x2 = cx + rx * Math.cos(ea), y2 = cy + ry * Math.sin(ea);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${rx},${ry} 0 ${large} 1 ${x2},${y2}`;
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {data.map((d, i) => {
        const a = toRad(d.value);
        const ea = startAngle + a;
        const midA = startAngle + a / 2;
        const path = `${arc(startAngle, ea, r)} L${cx + inner * Math.cos(ea)},${cy + inner * Math.sin(ea)} ${arc(ea, startAngle, inner)} Z`;
        startAngle = ea;
        return <path key={i} d={path} fill={d.color || '#D4AF37'} opacity="0.85" strokeWidth="1" stroke="#0a0a0c"><title>{d.name}: {d.value}</title></path>;
      })}
      <circle cx={cx} cy={cy} r={inner} fill="#141416" />
    </svg>
  );
};

// ── Chart Legend ──────────────────────────────────────────────
export const ChartLegend = ({ items }) => (
  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
    {items.map(item => (
      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{item.label}</span>
      </div>
    ))}
  </div>
);

// ── Avatar Chip ───────────────────────────────────────────────
export const AvatarChip = ({ name = '?', size = 32, color }) => {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
  const colors = ['#D4AF37', '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1'];
  const bg = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: `${bg}25`, border: `1px solid ${bg}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: bg, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

// ── Section Page Header ───────────────────────────────────────
export const PageHeader = ({ title, subtitle, icon, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {icon && <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 3 }}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
  </div>
);

// ── Section Card ──────────────────────────────────────────────
export const SectionCard = ({ title, subtitle, children, actions, noPad }) => (
  <div className="admin-card" style={{ marginBottom: 20 }}>
    {(title || actions) && (
      <div style={{ padding: '18px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: noPad ? 0 : 18 }}>
        <div>
          {title && <div className="admin-section-title">{title}</div>}
          {subtitle && <div className="admin-section-subtitle">{subtitle}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    )}
    <div style={noPad ? {} : { padding: '0 20px 20px' }}>{children}</div>
  </div>
);

// ── Stats Row ─────────────────────────────────────────────────
export const StatsRow = ({ stats, loading }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
    {stats.map((s, i) => <StatCard key={i} loading={loading} {...s} />)}
  </div>
);

// ── Drawer (Side Panel) ───────────────────────────────────────
export const Drawer = ({ open, onClose, title, width = 480, children }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 300 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, background: '#141416', borderLeft: '1px solid rgba(212,175,55,0.15)', zIndex: 301, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 0, animation: 'slideInDrawer 0.25s ease' }}>
        <style>{`@keyframes slideInDrawer{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
        {children}
      </div>
    </>
  );
};

// ── Detail Row (label + value) ────────────────────────────────
export const DetailRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div style={{ minWidth: 130, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 13, color: '#fff', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value || '—'}</div>
  </div>
);

// ── Star Rating ───────────────────────────────────────────────
export const StarRating = ({ rating = 0, max = 5 }) => (
  <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} style={{ fontSize: 12, color: i < rating ? '#D4AF37' : 'rgba(255,255,255,0.15)' }}>★</span>
    ))}
    <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginLeft: 4 }}>{Number(rating).toFixed(1)}</span>
  </span>
);
