import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, CheckCircle, Clock, AlertCircle, XCircle, Trash2, CheckSquare } from 'lucide-react';
import '../styles/UserNotifications.css';

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'confirmed', title: 'Booking Confirmed', message: 'Your tickets for Summer Music Festival are confirmed. QR code is ready in your tickets section.', time: '2 hours ago', read: false },
  { id: 'n2', type: 'reminder', title: 'Event Reminder', message: 'Tech Innovators Conference starts in 3 days. Don\'t forget to download your pass.', time: '1 day ago', read: false },
  { id: 'n3', type: 'updated', title: 'Event Venue Updated', message: 'Naach Bhajana Jam Night venue has been optimized for outdoor space. Review updated schedule.', time: '3 days ago', read: true },
  { id: 'n4', type: 'cancelled', title: 'Event Cancelled', message: 'Comedy Open Mic on June 15 has been cancelled. Full refund has been initiated.', time: '5 days ago', read: true },
  { id: 'n5', type: 'confirmed', title: 'Registration Verified', message: 'Your registration request for Startup Founders Meetup was manually approved.', time: '1 week ago', read: true },
];

const UserNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('user_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotif = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    if (filter === 'Bookings') return n.type === 'confirmed';
    if (filter === 'Updates') return n.type === 'updated' || n.type === 'reminder' || n.type === 'cancelled';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'confirmed':
        return <CheckCircle className="notif-type-icon confirmed" size={18} />;
      case 'reminder':
        return <Clock className="notif-type-icon reminder" size={18} />;
      case 'updated':
        return <AlertCircle className="notif-type-icon updated" size={18} />;
      case 'cancelled':
        return <XCircle className="notif-type-icon cancelled" size={18} />;
      default:
        return <Bell className="notif-type-icon" size={18} />;
    }
  };

  return (
    <div className="user-notifications-page page-enter">
      <div className="notif-page-header">
        <div className="header-left-side">
          <button className="back-to-home-btn" onClick={() => navigate('/user/home')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="notif-title">Notifications</h1>
            <p className="notif-subtitle">Manage notifications and updates from organizers</p>
          </div>
        </div>
        <div className="header-actions">
          {notifications.some(n => !n.read) && (
            <button className="notif-action-btn secondary" onClick={markAllRead}>
              <CheckSquare size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notif-action-btn danger" onClick={clearAll}>
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notif-tabs-bar">
        {['All', 'Unread', 'Bookings', 'Updates'].map(t => (
          <button
            key={t}
            className={`notif-tab-btn ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
            <span className="notif-tab-count">
              {t === 'All' ? notifications.length :
               t === 'Unread' ? notifications.filter(n => !n.read).length :
               t === 'Bookings' ? notifications.filter(n => n.type === 'confirmed').length :
               notifications.filter(n => n.type !== 'confirmed').length}
            </span>
          </button>
        ))}
      </div>

      <div className="notif-list-container">
        {filteredNotifs.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-icon-wrap">
              <Bell size={36} />
            </div>
            <h3>No notifications here</h3>
            <p>We'll notify you when your bookings are confirmed or organizers release updates.</p>
          </div>
        ) : (
          <div className="notif-list">
            {filteredNotifs.map((notif, index) => (
              <div
                key={notif.id}
                className={`notif-row-card hover-lift ${!notif.read ? 'unread' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => toggleRead(notif.id)}
              >
                <div className="notif-icon-section">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content-section">
                  <div className="notif-row-header">
                    <h4>{notif.title}</h4>
                    <span className="notif-time-stamp">{notif.time}</span>
                  </div>
                  <p className="notif-body-message">{notif.message}</p>
                </div>
                <div className="notif-actions-section">
                  {!notif.read && <div className="unread-pulse-dot" />}
                  <button className="notif-row-delete-btn" onClick={(e) => deleteNotif(notif.id, e)} title="Delete notification">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
