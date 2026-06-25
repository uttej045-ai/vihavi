import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useToast, PageHeader, SectionCard } from './AdminShared';

const SettingRow = ({ label, sub, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 24 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
    background: value ? 'linear-gradient(135deg,var(--admin-burgundy),#7a1528)' : 'rgba(255,255,255,0.08)',
    border: value ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.1)',
    position: 'relative', transition: 'all 0.2s', flexShrink: 0,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: value ? 'var(--admin-gold)' : 'rgba(255,255,255,0.3)',
      position: 'absolute', top: 2, left: value ? 22 : 2,
      transition: 'left 0.2s, background 0.2s',
    }} />
  </div>
);

const AdminPlatformSettings = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    const saved = adminService.getSettings();
    setSettings(saved || adminService.getDefaultSettings());
  }, []);

  const update = (section, key, value) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    adminService.saveSettings(settings);
    show('Settings saved successfully!', 'success');
    setSaving(false);
  };

  const handleReset = () => {
    setSettings(adminService.getDefaultSettings());
    show('Settings reset to defaults', 'warning');
  };

  if (!settings) return null;

  const TABS = [
    { id: 'general', label: '⚙️ General', icon: '⚙️' },
    { id: 'security', label: '🔒 Security', icon: '🔒' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'payments', label: '💳 Payments', icon: '💳' },
    { id: 'storage', label: '📦 Storage', icon: '📦' },
  ];

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Platform Settings"
        subtitle="Configure global platform behavior, security policies, and integrations."
        icon="⚙️"
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReset} className="admin-btn-outline" style={{ fontSize: 12 }}>Reset Defaults</button>
            <button onClick={handleSave} disabled={saving}
              style={{ background: 'linear-gradient(135deg,var(--admin-burgundy),#7a1528)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--admin-gold)', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'Inter, sans-serif' }}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        }
      />

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.02)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: activeTab === tab.id ? 'var(--admin-burgundy)' : 'transparent', color: activeTab === tab.id ? 'var(--admin-gold)' : 'var(--admin-text-muted)', fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <SectionCard title="General Settings" subtitle="Configure platform name, contact info, and locale">
          <SettingRow label="Platform Name" sub="Displayed in emails, headers, and public pages">
            <input className="admin-input" value={settings.general.platformName} onChange={e => update('general', 'platformName', e.target.value)} style={{ width: 220 }} />
          </SettingRow>
          <SettingRow label="Contact Email" sub="Primary support and notification email">
            <input className="admin-input" type="email" value={settings.general.contactEmail} onChange={e => update('general', 'contactEmail', e.target.value)} style={{ width: 220 }} />
          </SettingRow>
          <SettingRow label="Contact Phone" sub="Support phone number shown on public pages">
            <input className="admin-input" value={settings.general.contactPhone} onChange={e => update('general', 'contactPhone', e.target.value)} style={{ width: 180 }} />
          </SettingRow>
          <SettingRow label="Default Timezone" sub="Used for all event scheduling and reporting">
            <select className="admin-select" value={settings.general.timezone} onChange={e => update('general', 'timezone', e.target.value)} style={{ width: 180 }}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </SettingRow>
          <SettingRow label="Default Currency" sub="Currency for all transactions and display">
            <select className="admin-select" value={settings.general.currency} onChange={e => update('general', 'currency', e.target.value)} style={{ width: 120 }}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </SettingRow>
        </SectionCard>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <SectionCard title="Security Settings" subtitle="Configure authentication, session, and access control policies">
          <SettingRow label="Minimum Password Length" sub="Minimum characters required for user passwords">
            <input className="admin-input" type="number" min={6} max={32} value={settings.security.minPasswordLength} onChange={e => update('security', 'minPasswordLength', parseInt(e.target.value))} style={{ width: 80 }} />
          </SettingRow>
          <SettingRow label="Require Multi-Factor Authentication" sub="Force MFA for all admin accounts">
            <Toggle value={settings.security.requireMFA} onChange={v => update('security', 'requireMFA', v)} />
          </SettingRow>
          <SettingRow label="Session Timeout (minutes)" sub="Auto-logout after inactivity">
            <input className="admin-input" type="number" min={5} max={1440} value={settings.security.sessionTimeout} onChange={e => update('security', 'sessionTimeout', parseInt(e.target.value))} style={{ width: 80 }} />
          </SettingRow>
          <SettingRow label="Max Login Attempts" sub="Lock account after this many failed attempts">
            <input className="admin-input" type="number" min={3} max={20} value={settings.security.maxLoginAttempts} onChange={e => update('security', 'maxLoginAttempts', parseInt(e.target.value))} style={{ width: 80 }} />
          </SettingRow>
        </SectionCard>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <SectionCard title="Notification Settings" subtitle="Configure how and when users receive notifications">
          <SettingRow label="Email Notifications" sub="Send transactional emails for bookings, approvals, and alerts">
            <Toggle value={settings.notifications.emailNotifications} onChange={v => update('notifications', 'emailNotifications', v)} />
          </SettingRow>
          <SettingRow label="SMS Notifications" sub="Send SMS alerts for critical events and payment confirmations">
            <Toggle value={settings.notifications.smsNotifications} onChange={v => update('notifications', 'smsNotifications', v)} />
          </SettingRow>
          <SettingRow label="Push Notifications" sub="Browser and mobile push notifications">
            <Toggle value={settings.notifications.pushNotifications} onChange={v => update('notifications', 'pushNotifications', v)} />
          </SettingRow>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(24,144,255,0.06)', border: '1px solid rgba(24,144,255,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#1890ff', fontWeight: 700, marginBottom: 6 }}>ℹ Email Integration</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Email notifications use SendGrid API. Configure your API key in the environment settings for production deployment.</div>
          </div>
        </SectionCard>
      )}

      {/* Payments */}
      {activeTab === 'payments' && (
        <SectionCard title="Payment Settings" subtitle="Configure payment gateways and platform commission">
          <SettingRow label="Razorpay Integration" sub="Enable Razorpay as a payment gateway for UPI, Cards, Wallets">
            <Toggle value={settings.payments.razorpayEnabled} onChange={v => update('payments', 'razorpayEnabled', v)} />
          </SettingRow>
          <SettingRow label="Stripe Integration" sub="Enable Stripe for international card payments">
            <Toggle value={settings.payments.stripeEnabled} onChange={v => update('payments', 'stripeEnabled', v)} />
          </SettingRow>
          <SettingRow label="Platform Commission (%)" sub="Percentage taken from each successful ticket sale">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input className="admin-input" type="number" min={0} max={30} value={settings.payments.platformCommission} onChange={e => update('payments', 'platformCommission', parseFloat(e.target.value))} style={{ width: 80 }} />
              <span style={{ color: 'var(--admin-gold)', fontSize: 13, fontWeight: 700 }}>%</span>
            </div>
          </SettingRow>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--admin-gold)', fontWeight: 700, marginBottom: 6 }}>💡 Commission Preview</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>At {settings.payments.platformCommission}% commission, a ₹10,000 booking generates <span style={{ color: 'var(--admin-gold)', fontWeight: 700 }}>₹{(10000 * settings.payments.platformCommission / 100).toFixed(0)}</span> in platform revenue.</div>
          </div>
        </SectionCard>
      )}

      {/* Storage */}
      {activeTab === 'storage' && (
        <SectionCard title="Storage & Upload Settings" subtitle="Configure file upload limits and storage policies">
          <SettingRow label="Max Image Size (MB)" sub="Maximum file size for event banners and profile photos">
            <input className="admin-input" type="number" min={1} max={50} value={settings.storage.imageMaxMb} onChange={e => update('storage', 'imageMaxMb', parseInt(e.target.value))} style={{ width: 80 }} />
          </SettingRow>
          <SettingRow label="Max Video Size (MB)" sub="Maximum size for promotional video uploads">
            <input className="admin-input" type="number" min={10} max={1000} value={settings.storage.videoMaxMb} onChange={e => update('storage', 'videoMaxMb', parseInt(e.target.value))} style={{ width: 80 }} />
          </SettingRow>
          <SettingRow label="Max Document Size (MB)" sub="PDFs, schedules, and other event documents">
            <input className="admin-input" type="number" min={1} max={100} value={settings.storage.documentMaxMb} onChange={e => update('storage', 'documentMaxMb', parseInt(e.target.value))} style={{ width: 80 }} />
          </SettingRow>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(82,196,26,0.06)', border: '1px solid rgba(82,196,26,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#52c41a', fontWeight: 700, marginBottom: 8 }}>📦 Storage Usage Estimate</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['Images', settings.storage.imageMaxMb], ['Videos', settings.storage.videoMaxMb], ['Documents', settings.storage.documentMaxMb]].map(([t, v]) => (
                <div key={t}><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{t}</div><div style={{ fontSize: 14, fontWeight: 700, color: '#52c41a' }}>{v} MB</div></div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default AdminPlatformSettings;
