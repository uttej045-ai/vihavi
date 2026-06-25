import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import {
  SearchFilterBar, Skeleton, EmptyState,
  ConfirmModal, useToast, PageHeader, SectionCard, SvgBarChart, ChartLegend,
  fmtNum, fmtCur, statusBadge,
} from './AdminShared';

const CategoryFormModal = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || { name: '', icon: '🎪', description: '', color: '#D4AF37', status: 'Active' });
  const ICONS = ['🎵', '💃', '😂', '💻', '💼', '⚽', '🍽️', '🎭', '🙏', '📚', '🎨', '🎬', '🎤', '🏋️', '🌿'];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1e1e24', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-gold)', marginBottom: 20 }}>
          {initial ? '✏️ Edit Category' : '➕ New Category'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category Name *</label>
            <input className="admin-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Music" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
            <textarea className="admin-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this category..." style={{ width: '100%', minHeight: 70, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    style={{ padding: 8, borderRadius: 8, fontSize: 18, border: form.icon === ic ? '2px solid var(--admin-gold)' : '1px solid rgba(255,255,255,0.08)', background: form.icon === ic ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</label>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: 4 }} />
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                <select className="admin-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onCancel} className="admin-btn-outline">Cancel</button>
          <button onClick={() => form.name.trim() && onSave(form)}
            style={{ background: 'linear-gradient(135deg,var(--admin-burgundy),#7a1528)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--admin-gold)', padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {initial ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminCategoryManagement = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { show, ToastContainer } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getCategories();
    setCats(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = cats.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (form) => {
    setActionLoading(true);
    try {
      if (editing) {
        await adminService.updateCategory(editing.id, form);
        show('Category updated', 'success');
      } else {
        await adminService.createCategory(form);
        show('Category created', 'success');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch { show('Failed to save', 'error'); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteCategory(confirm.id);
      show('Category deleted', 'warning');
      setConfirm(null);
      load();
    } catch { show('Delete failed', 'error'); }
    setActionLoading(false);
  };

  const chartData = filtered.slice(0, 8).map(c => ({ name: c.name, events: c.eventCount || 0, revenue: (c.revenue || 0) / 1000 }));

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Category Management"
        subtitle="Create and manage event categories to organize the platform's content."
        icon="🏷️"
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            style={{ background: 'linear-gradient(135deg,var(--admin-burgundy),#7a1528)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--admin-gold)', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            ➕ New Category
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-card" style={{ padding: 20 }}><div className="sk-bar" style={{ width: '60%', height: 28 }} /></div>
        )) : [
          { icon: '🏷️', label: 'Total Categories', value: cats.length },
          { icon: '✅', label: 'Active', value: cats.filter(c => c.status === 'Active').length },
          { icon: '📅', label: 'Total Events', value: cats.reduce((s, c) => s + (c.eventCount || 0), 0) },
          { icon: '💰', label: 'Total Revenue', value: fmtCur(cats.reduce((s, c) => s + (c.revenue || 0), 0)) },
        ].map(s => (
          <div key={s.label} className="admin-card admin-stat-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--admin-text-muted)', fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 10 }}>{s.icon} {s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <SectionCard title="Events per Category" subtitle="Event distribution across categories">
        <SvgBarChart
          data={chartData}
          xKey="name"
          bars={[{ key: 'events', label: 'Events', color: '#D4AF37' }]}
          height={220}
        />
        <ChartLegend items={[{ label: 'Events', color: '#D4AF37' }]} />
      </SectionCard>

      {/* Category Grid */}
      <SectionCard
        title={`Categories (${filtered.length})`}
        actions={
          <SearchFilterBar
            search={search} onSearch={setSearch}
            filters={[]}
            placeholder="Search categories..."
          />
        }
      >
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="sk-bar" style={{ height: 100, borderRadius: 12 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-muted)' }}>No categories found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {filtered.map(cat => (
              <div key={cat.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${cat.color || '#D4AF37'}20`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${cat.color || '#D4AF37'}50`}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${cat.color || '#D4AF37'}20`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${cat.color}18`, border: `1px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{cat.name}</div>
                      <span className={statusBadge(cat.status)} style={{ fontSize: 9 }}>{cat.status}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', lineHeight: 1.5 }}>{cat.description || 'No description'}</div>
                <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: `1px solid ${cat.color}15` }}>
                  <div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Events</div><div style={{ fontWeight: 700, color: cat.color }}>{cat.eventCount || 0}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Revenue</div><div style={{ fontWeight: 700, color: '#52c41a', fontSize: 12 }}>{fmtCur(cat.revenue || 0)}</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="admin-btn-outline" style={{ flex: 1, fontSize: 11 }} onClick={() => { setEditing(cat); setShowForm(true); }}>✏️ Edit</button>
                  <button className="admin-btn-danger" style={{ fontSize: 11 }} onClick={() => setConfirm({ id: cat.id, name: cat.name })}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {showForm && (
        <CategoryFormModal
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {confirm && (
        <ConfirmModal
          title="Delete Category"
          message={`Delete "${confirm.name}"? This cannot be undone and may affect associated events.`}
          confirmLabel="Delete"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminCategoryManagement;
