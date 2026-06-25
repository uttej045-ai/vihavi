import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, BookOpen, Send, Check } from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';
import '../styles/OrganizerTheme.css';

export default function HelpSupport() {
  const { showToast } = useToast();
  const [ticket, setTicket] = useState({ subject: '', category: 'Technical Issue', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticket.subject.trim() || !ticket.message.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      showToast('Your support ticket has been submitted successfully!', 'success');
      setTicket({ subject: '', category: 'Technical Issue', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  const docs = [
    { title: 'Getting Started as a Vihavi Organizer', desc: 'Learn how to set up your profile and list your first luxury event.' },
    { title: 'Creating Custom Ticket Packages', desc: 'Maximize your sales by structuring early-birds, general admissions, and VIP passes.' },
    { title: 'Processing Customer Refunds', desc: 'Understanding terms, payouts, and how to safely return ticket payments.' },
    { title: 'Vihavi Entry Scanner Guidelines', desc: 'A step-by-step checklist on using the QR Scanner at your event entrance.' }
  ];

  return (
    <div className="org-help-page" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="org-page-header">
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>Help & Support</h1>
        <p style={{ color: 'var(--org-text-muted)', fontSize: '14px', marginTop: '4px' }}>Access organizer documentations, browse FAQs, or open a direct ticket with our operations team.</p>
      </div>

      {/* Grid of Contact channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="luxury-card" style={{ textAlign: 'center', padding: '24px' }}>
          <Mail size={32} color="var(--org-gold)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>Email Support</h3>
          <p style={{ color: 'var(--org-text-muted)', fontSize: '12px', marginTop: '6px' }}>support@vihavi.dev</p>
        </div>
        <div className="luxury-card" style={{ textAlign: 'center', padding: '24px' }}>
          <Phone size={32} color="var(--org-gold)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>Phone Support</h3>
          <p style={{ color: 'var(--org-text-muted)', fontSize: '12px', marginTop: '6px' }}>+91 99000 88000</p>
        </div>
        <div className="luxury-card" style={{ textAlign: 'center', padding: '24px' }}>
          <MessageSquare size={32} color="var(--org-gold)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>Live Chat</h3>
          <p style={{ color: 'var(--org-text-muted)', fontSize: '12px', marginTop: '6px' }}>Available 24/7 in chat tab</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
        {/* Ticket Submission Form */}
        <div className="luxury-card" style={{ padding: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Open Support Ticket</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '6px' }}>Subject</label>
              <input 
                type="text" 
                placeholder="Brief summary of your issue..." 
                value={ticket.subject}
                onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--org-glass-border)', color: '#fff', outline: 'none', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '6px' }}>Category</label>
              <select 
                value={ticket.category}
                onChange={(e) => setTicket({...ticket, category: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#141416', border: '1px solid var(--org-glass-border)', color: '#fff', outline: 'none', fontSize: '13px', cursor: 'pointer' }}
              >
                <option>Technical Issue</option>
                <option>Payout Inquiry</option>
                <option>Event Approval</option>
                <option>Attendee Dispute</option>
                <option>Feedback</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '6px' }}>Message Details</label>
              <textarea 
                rows="5"
                placeholder="Provide a detailed description of your issue..." 
                value={ticket.message}
                onChange={(e) => setTicket({...ticket, message: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--org-glass-border)', color: '#fff', outline: 'none', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
            <button 
              type="submit" 
              className="luxury-btn-primary" 
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 0',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Send size={14} /> {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>

        {/* Documentation / Knowledge base */}
        <div className="luxury-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>Knowledge Base Articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {docs.map((d, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--org-glass-border)',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
              >
                <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--org-gold)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)' }}><BookOpen size={16} /></div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0 }}>{d.title}</h4>
                  <p style={{ color: 'var(--org-text-muted)', fontSize: '11px', margin: '4px 0 0 0', lineHeight: 1.4 }}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
