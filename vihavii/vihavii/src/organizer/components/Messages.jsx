import React, { useState } from 'react';
import { Send, Search, Phone, Video, Info, User, Check, CheckCheck } from 'lucide-react';
import '../styles/OrganizerTheme.css';

export default function Messages() {
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

  return (
    <div className="org-messages-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '20px' }}>
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
                // Clear unread
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
        {/* Chat Header */}
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

        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeChat.messages.map((m, idx) => {
            const isMe = m.sender === 'me';
            return (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}
              >
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
                  <div style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    color: 'var(--org-text-muted)',
                    marginTop: '4px',
                    padding: '0 4px'
                  }}>
                    <span>{m.time}</span>
                    {isMe && <CheckCheck size={12} color="var(--org-gold)" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
          <input 
            type="text" 
            placeholder="Type your response here..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--org-glass-border)',
              borderRadius: '24px',
              padding: '0 20px',
              height: '42px',
              color: '#fff',
              outline: 'none',
              fontSize: '13px'
            }}
          />
          <button 
            type="submit" 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--org-gold)',
              color: '#000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
