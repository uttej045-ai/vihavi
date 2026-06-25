import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/dbService';
import { Bell, Check, Trash2, ShieldAlert, Sparkles, DollarSign, Calendar } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const allNotifs = await dbService.getAll('notifications');
      // Sort: newest first
      setNotifications(allNotifs.reverse());
    } catch (err) {
      console.error('Failed to load notifications list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notif) => {
    await dbService.update('notifications', notif.id, { read: true });
    loadNotifications();
  };

  const markAllAsRead = async () => {
    try {
      const promises = notifications.filter(n => !n.read).map(n => 
        dbService.update('notifications', n.id, { ...n, read: true })
      );
      await Promise.all(promises);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id) => {
    await dbService.delete('notifications', id);
    loadNotifications();
  };

  const clearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        const promises = notifications.map(n => dbService.delete('notifications', n.id));
        await Promise.all(promises);
        loadNotifications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper icons based on type
  const getNotifIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar size={16} color="var(--org-gold)" />;
      case 'payment':
        return <DollarSign size={16} color="#52c41a" />;
      case 'system':
        return <ShieldAlert size={16} color="#ff4d4f" />;
      default:
        return <Sparkles size={16} color="#faad14" />;
    }
  };

  if (isLoading) {
    return <div className="organizer-loading">Opening Notifications Feed...</div>;
  }

  return (
    <div className="org-notifications-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="org-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Notifications Center</h1>
          <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Stay informed on bookings, ticket registrations, and server logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="luxury-btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px' }} onClick={markAllAsRead}>
            Mark All Read
          </button>
          <button className="luxury-btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div className="luxury-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Bell size={48} color="rgba(212,175,55,0.2)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ color: '#fff' }}>No notifications</h3>
            <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '6px' }}>Your notification feeds are completely clear.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`luxury-card notif-item-row ${n.read ? 'read' : 'unread'}`} style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              background: n.read ? 'rgba(255,255,255,0.01)' : 'rgba(88, 15, 29, 0.15)',
              borderColor: n.read ? 'var(--org-glass-border)' : 'rgba(212, 175, 55, 0.35)',
              transition: 'var(--org-transition)'
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '10px',
                  borderRadius: '50%',
                  border: '1px solid var(--org-glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{getNotifIcon(n.type)}</div>
                
                <div>
                  <p style={{ fontSize: '14px', color: '#eaeaea', margin: 0, fontWeight: n.read ? '500' : '700' }}>{n.message}</p>
                  <span style={{ fontSize: '11px', color: 'var(--org-text-muted)', display: 'block', marginTop: '4px' }}>
                    {(() => {
                      if (!n.timestamp) return 'Just now';
                      const d = new Date(n.timestamp);
                      return isNaN(d.getTime()) ? n.timestamp : d.toLocaleString('en-IN');
                    })()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!n.read && (
                  <button 
                    onClick={() => markAsRead(n)} 
                    title="Mark as read"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: '#52c41a', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <Check size={14} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotif(n.id)} 
                  title="Delete notification"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: '#ff4d4f', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
