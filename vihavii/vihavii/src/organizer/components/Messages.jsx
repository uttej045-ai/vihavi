import React, { useState, useEffect } from 'react';
import { Send, Search, Phone, Video, Info, User, Check, CheckCheck, MessageSquare, Megaphone, Plus, Mail, Bell, Users, Calendar, ArrowRight, History, Clock } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/OrganizerTheme.css';

const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    eventTitle: 'Summer Music Festival 2026',
    audience: 'All Attendees (120 recipients)',
    channels: ['Email', 'App Notifications'],
    subject: 'Gate Timing & Event Instructions',
    body: 'Gates open at 4 PM. Please carry a digital copy of your QR code ticket for contactless check-in.',
    sentAt: '2026-06-24T14:30:00Z',
    status: 'Sent'
  },
  {
    id: 'camp-2',
    eventTitle: 'Tech Innovators Conference 2026',
    audience: 'VIP Holders (15 recipients)',
    channels: ['Email'],
    subject: 'Exclusive VIP Networking Session Location',
    body: 'The VIP session is at Lounge B starting from 1 PM. Your badges are active.',
    sentAt: '2026-06-23T09:15:00Z',
    status: 'Sent'
  }
];

export default function Messages() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'broadcast'
  const [events, setEvents] = useState([]);
  
  // Direct Messages state
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Alice Smith',
      lastMessage: 'Is there a dress code for the festival?',
      time: '10:45 AM',
      unread: 2,
      avatarColor: 'var(--org-gold)',
      messages: [
        { sender: 'them', text: 'Hi, I recently booked tickets for the Summer Music Festival!', time: '10:40 AM' },
        { sender: 'them', text: 'Just wanted to ask: Is there a dress code for the festival?', time: '10:41 AM' }
      ]
    },
    {
      id: 2,
      name: 'John Doe',
      lastMessage: 'Thanks, the check-in was seamless.',
      time: 'Yesterday',
      unread: 0,
      avatarColor: 'var(--org-burgundy-light)',
      messages: [
        { sender: 'them', text: 'Hello, having trouble finding the scanning point.', time: 'Yesterday' },
        { sender: 'me', text: 'Hi John, the scan gate is right beside the main entry lobby.', time: 'Yesterday' },
        { sender: 'them', text: 'Thanks, the check-in was seamless.', time: 'Yesterday' }
      ]
    },
    {
      id: 3,
      name: 'Bob Johnson',
      lastMessage: 'When will the refund request be settled?',
      time: '2 days ago',
      unread: 1,
      avatarColor: 'var(--org-gold)',
      messages: [
        { sender: 'them', text: 'When will the refund request be settled?', time: '2 days ago' }
      ]
    }
  ]);
  const [activeId, setActiveId] = useState(1);
  const [inputText, setInputText] = useState('');
  const activeChat = conversations.find(c => c.id === activeId);

  // Broadcast campaigns state
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('broadcast_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  
  // Form State
  const [targetEvent, setTargetEvent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Attendees');
  const [channels, setChannels] = useState({ email: true, app: true });
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    localStorage.setItem('broadcast_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    const loadEvents = async () => {
      const allEvents = await dbService.getAll('events');
      setEvents(allEvents || []);
      if (allEvents && allEvents.length > 0) {
        setTargetEvent(allEvents[0].id);
      }
    };
    loadEvents();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === activeId) {
        return {
          ...chat,
          lastMessage: inputText,
          time: 'Just now',
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    setInputText('');
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !messageBody.trim()) {
      showToast('Subject and message body are required.', 'error');
      return;
    }

    const eventObj = events.find(ev => String(ev.id) === String(targetEvent));
    const selectedChannels = [];
    if (channels.email) selectedChannels.push('Email');
    if (channels.app) selectedChannels.push('App Notifications');

    const newCampaign = {
      id: `camp-${Math.random().toString(36).substring(2, 9)}`,
      eventTitle: eventObj ? eventObj.name : 'Vihavi Event',
      audience: `${targetAudience}`,
      channels: selectedChannels,
      subject: subject,
      body: messageBody,
      sentAt: new Date().toISOString(),
      status: 'Sent'
    };

    // Save campaign in history list
    setCampaigns(prev => [newCampaign, ...prev]);

    // Mock adding notification log to DB
    try {
      await dbService.create('notifications', {
        type: 'broadcast',
        message: `Broadcast message sent to ${targetAudience} for ${eventObj ? eventObj.name : 'event'}: ${subject}`,
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (err) {
      console.error(err);
    }

    showToast('Broadcast campaign successfully delivered to attendees!', 'success');
    
    // Clear form
    setSubject('');
    setMessageBody('');
    setShowNewCampaignModal(false);
  };

  return (
    <div className="org-messages-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Communication Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Communication Center</h1>
          <p className="org-subtitle" style={{ margin: '4px 0 0 0' }}>Engage with attendees via direct messaging or broadcast targeted email newsletters and updates</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--org-glass-border)' }}>
            <button
              onClick={() => setActiveTab('direct')}
              style={{
                background: activeTab === 'direct' ? 'var(--org-burgundy)' : 'transparent',
                border: 'none',
                color: activeTab === 'direct' ? 'var(--org-gold)' : '#aaa',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={14} /> Direct Chat
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              style={{
                background: activeTab === 'broadcast' ? 'var(--org-burgundy)' : 'transparent',
                border: 'none',
                color: activeTab === 'broadcast' ? 'var(--org-gold)' : '#aaa',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Megaphone size={14} /> Announcements
            </button>
          </div>

          {activeTab === 'broadcast' && (
            <button 
              onClick={() => setShowNewCampaignModal(true)} 
              className="luxury-btn-primary"
              style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 16px', fontSize: '12px' }}
            >
              <Plus size={14} /> New Campaign
            </button>
          )}
        </div>
      </div>

      {activeTab === 'direct' ? (
        /* ── DIRECT MESSAGES VIEW ── */
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          {/* Sidebar Chat List */}
          <div className="luxury-card" style={{ width: '320px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', padding: '8px 16px', borderRadius: '20px' }}>
              <Search size={16} color="var(--org-gold)" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    setActiveId(c.id);
                    setConversations(prev => prev.map(chat => chat.id === c.id ? { ...chat, unread: 0 } : chat));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: c.id === activeId ? 'rgba(88, 15, 29, 0.3)' : 'transparent',
                    border: c.id === activeId ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => { if (c.id !== activeId) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseOut={(e) => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--org-burgundy) 0%, ${c.avatarColor} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--org-gold)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {c.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{c.name}</span>
                      <span style={{ color: 'var(--org-text-muted)', fontSize: '10px' }}>{c.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: 'var(--org-text-muted)', fontSize: '11px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {c.lastMessage}
                      </p>
                      {c.unread > 0 && (
                        <span style={{ background: 'var(--org-gold)', color: '#000', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="luxury-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--org-burgundy) 0%, ${activeChat.avatarColor} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--org-gold)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  {activeChat.name[0]}
                </div>
                <div>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: '14px', fontWeight: '600' }}>{activeChat.name}</h4>
                  <span style={{ color: '#52c41a', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#52c41a', borderRadius: '50%', display: 'inline-block' }}></span> Active Now
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: 'var(--org-gold)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Phone size={16} /></button>
                <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: 'var(--org-gold)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Video size={16} /></button>
                <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--org-glass-border)', color: 'var(--org-gold)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Info size={16} /></button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeChat.messages.map((m, idx) => {
                const isMe = m.sender === 'me';
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                    {!isMe && (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--org-glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--org-gold)', flexShrink: 0 }}>
                        <User size={10} />
                      </div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--org-burgundy)' : 'rgba(255,255,255,0.03)',
                        border: isMe ? '1px solid rgba(212,175,55,0.2)' : '1px solid var(--org-glass-border)',
                        color: '#fff',
                        fontSize: '13px',
                        lineHeight: 1.4
                      }}>
                        {m.text}
                      </div>
                      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--org-text-muted)', marginTop: '4px', padding: '0 4px' }}>
                        <span>{m.time}</span>
                        {isMe && <CheckCheck size={12} color="var(--org-gold)" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <input 
                type="text" 
                placeholder="Type your response here..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--org-glass-border)', borderRadius: '24px', padding: '0 20px', height: '42px', color: '#fff', outline: 'none', fontSize: '13px' }}
              />
              <button type="submit" style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--org-gold)', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={16} /></button>
            </form>
          </div>
        </div>
      ) : (
        /* ── BROADCAST CAMPAIGNS VIEW ── */
        <div className="luxury-card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={18} color="var(--org-gold)" />
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Campaign History Log</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {campaigns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--org-text-muted)' }}>
                <Megaphone size={48} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                <p>No broadcast campaigns sent yet.</p>
              </div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '15px', fontWeight: '700' }}>{camp.subject}</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: 'var(--org-text-muted)' }}>
                        <span style={{ color: 'var(--org-gold)' }}>Target: {camp.eventTitle}</span>
                        <span>•</span>
                        <span>Audience: {camp.audience}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--org-text-muted)', display: 'block' }}>{new Date(camp.sentAt).toLocaleString()}</span>
                      <span className="badge-status confirmed" style={{ marginTop: '4px', display: 'inline-block' }}>{camp.status}</span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#ccc', lineHeight: '1.5', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    {camp.body}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '11px', color: 'var(--org-text-muted)' }}>
                    <span>Channels:</span>
                    {camp.channels.map(ch => (
                      <span key={ch} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--org-glass-border)', padding: '2px 8px', borderRadius: '4px', color: '#fff' }}>{ch}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Broadcast Campaign Modal */}
      {showNewCampaignModal && (
        <div className="v-modal-overlay" onClick={() => setShowNewCampaignModal(false)}>
          <form onSubmit={handleSendBroadcast} className="v-modal" onClick={e => e.stopPropagation()} style={{ background: '#101012', border: '1px solid var(--org-glass-border)', maxWidth: '600px' }}>
            <div className="v-modal-header">
              <h3 className="v-modal-title" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={18} color="var(--org-gold)" /> Create Broadcast Campaign
              </h3>
              <button type="button" className="v-modal-close" onClick={() => setShowNewCampaignModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}><X size={16} /></button>
            </div>
            
            <div className="v-modal-body" style={{ color: '#ccc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Event Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Target Event</label>
                <select 
                  value={targetEvent} 
                  onChange={e => setTargetEvent(e.target.value)}
                  style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Audience segment</label>
                <select 
                  value={targetAudience} 
                  onChange={e => setTargetAudience(e.target.value)}
                  style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  <option>All Attendees</option>
                  <option>Checked-in Attendees</option>
                  <option>Pending Approvals</option>
                  <option>VIP Ticket Holders</option>
                </select>
              </div>

              {/* Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Delivery channels</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels.email} 
                      onChange={e => setChannels(prev => ({ ...prev, email: e.target.checked }))} 
                      style={{ accentColor: 'var(--org-gold)' }}
                    />
                    <Mail size={14} /> Send Email Campaign
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels.app} 
                      onChange={e => setChannels(prev => ({ ...prev, app: e.target.checked }))} 
                      style={{ accentColor: 'var(--org-gold)' }}
                    />
                    <Bell size={14} /> In-App Push Notification
                  </label>
                </div>
              </div>

              {/* Subject */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Subject / Headline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Important Update Regarding Gate Entry Timing" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  required
                />
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Message Body</label>
                <textarea 
                  rows="4"
                  placeholder="Enter details of your event reminder, change in timing, or instructions here..."
                  value={messageBody}
                  onChange={e => setMessageBody(e.target.value)}
                  style={{ background: '#141416', border: '1px solid var(--org-glass-border)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="luxury-btn-outline" 
                  onClick={() => setShowNewCampaignModal(false)}
                  style={{ padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="luxury-btn-primary"
                  style={{ padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  Send Announcements <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </form>
        </div>
      )}
    </div>
  );
}
