import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Upload, Calendar, MapPin, Clock, CheckCircle, ChevronRight, 
  ChevronLeft, Plus, Trash2, HelpCircle, Ticket, Image as ImageIcon,
  Link as LinkIcon, Info, Users, Tag, ToggleLeft, ToggleRight, ListPlus,
  Play, Copy, XCircle, AlertTriangle, Eye, ArrowUp, ArrowDown, Scissors
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/CreateEvent.css';

const STEPS = [
  { id: 1, name: 'Basic Information', icon: 'Tag' },
  { id: 2, name: 'Location Details', icon: 'MapPin' },
  { id: 3, name: 'Event Schedule', icon: 'Clock' },
  { id: 4, name: 'Ticket Configuration', icon: 'Ticket' },
  { id: 5, name: 'Event Media', icon: 'ImageIcon' },
  { id: 6, name: 'Frequently Asked Questions', icon: 'HelpCircle' },
  { id: 7, name: 'Promotional Coupons', icon: 'Tag' },
  { id: 8, name: 'Event Settings', icon: 'Settings' },
  { id: 9, name: 'Review & Publish', icon: 'CheckCircle' }
];

const CreateEvent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const { showToast } = useToast();
  
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom toolbar formatting helper
  const [descriptionSelection, setDescriptionSelection] = useState({ start: 0, end: 0 });
  
  // Crop tool simulator state
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [showCropAdjuster, setShowCropAdjuster] = useState(false);

  // Form State matching specifications
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    category: '',
    format: 'In-Person', // In-Person, Virtual, Hybrid
    ageRestriction: 'All Ages', // All Ages, 18+, 21+
    tags: '',
    organizerName: 'Vihavi Luxury Events Team',
    organizerEmail: 'organizer@vihavi.dev',
    
    venue: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    zip: '',
    mapPin: '17.3850, 78.4867', // Hyderabad default coords
    accessInstructions: '',
    virtualLink: '',
    virtualPlatform: 'Zoom', // Zoom, Meet, Teams
    
    isMultiDay: false,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    timeZone: 'IST',
    agenda: [], // array of agenda items: { time, title, desc, speaker }
    
    tickets: [
      { name: 'General Admission', desc: 'Standard entry pass.', price: 0, quantity: 100, saleStart: '', saleEnd: '', minLimit: 1, maxLimit: 4, benefits: '' }
    ],
    isFree: false,
    
    banner: '',
    gallery: [],
    video: '',
    
    faqs: [],
    
    coupons: [],
    
    visibility: 'Public', // Public, Private, Unlisted
    requireApproval: false,
    attendeeListVisibility: 'Hidden', // Public, Visible to Attendees, Hidden
    enableWaitlist: false,
    registrationDeadline: '',
    cancellationPolicy: 'Moderate', // Flexible, Moderate, Strict, No Refunds
    cancellationDetails: '',
    terms: '',
    contactEmail: 'support@vihavi.dev',
    contactPhone: '+91 99000 88000',
    socialTwitter: '',
    socialLinkedin: '',
    socialInstagram: '',
    
    status: 'Draft',
    publishDate: '',
    agreeToTerms: false
  });

  // Load existing event data if editing
  useEffect(() => {
    if (editId) {
      const loadEvent = async () => {
        try {
          const event = await dbService.getById('events', editId);
          if (event) {
            setFormData(prev => ({
              ...prev,
              ...event,
              tickets: event.tickets || prev.tickets,
              faqs: event.faqs || prev.faqs,
              coupons: event.coupons || prev.coupons,
              agenda: event.agenda || prev.agenda
            }));
          }
        } catch (err) {
          console.error('Failed to load event for edit', err);
        }
      };
      loadEvent();
    }
  }, [editId]);

  // Sync isFree check to ticket prices
  useEffect(() => {
    if (formData.isFree) {
      setFormData(prev => ({
        ...prev,
        tickets: prev.tickets.map(t => ({ ...t, price: 0 }))
      }));
    }
  }, [formData.isFree]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Step Validation logic
  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '' && formData.category !== '';
      case 2:
        return formData.format === 'Virtual' || (formData.venue.trim() !== '' && formData.address.trim() !== '' && formData.city.trim() !== '');
      case 3:
        return formData.startDate !== '' && formData.startTime !== '';
      case 4:
        return formData.tickets.length > 0 && formData.tickets[0].name.trim() !== '';
      case 5:
        return formData.banner !== '';
      case 8:
        return formData.contactEmail !== '' && formData.contactPhone !== '';
      default:
        return true;
    }
  };

  const completedSteps = STEPS.filter(s => validateStep(s.id)).map(s => s.id);

  // Navigations
  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handlePrev = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleSidebarStepClick = (stepId) => {
    setActiveStep(stepId);
  };

  // Rich Text Editor Mock formatting
  const applyTextFormat = (formatType) => {
    const textarea = document.getElementById('event-desc-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.description.substring(start, end);
    let replacement = '';

    switch (formatType) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'underline':
        replacement = `_${selectedText || 'underlined text'}_`;
        break;
      case 'bullet':
        replacement = `\n- ${selectedText || 'list item'}`;
        break;
      case 'number':
        replacement = `\n1. ${selectedText || 'list item'}`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](https://example.com)`;
        break;
      default:
        return;
    }

    const newText = formData.description.substring(0, start) + replacement + formData.description.substring(end);
    setFormData(prev => ({ ...prev, description: newText }));
    
    // Reset focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Agenda List Manager
  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { time: '', title: '', desc: '', speaker: '' }]
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleAgendaChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.agenda];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, agenda: updated };
    });
  };

  const moveAgendaItem = (index, direction) => {
    const list = [...formData.agenda];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setFormData(prev => ({ ...prev, agenda: list }));
  };

  // Duration calculation
  const calculateDuration = () => {
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) return 'TBA';
    try {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      const diffMs = end - start;
      if (diffMs <= 0) return 'Invalid timeline (End datetime is before start)';
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return diffDays > 0 ? `${diffDays} Day(s) and ${remainingHours} Hour(s)` : `${remainingHours} Hour(s)`;
    } catch {
      return 'TBA';
    }
  };

  // Ticket Class Configuration
  const handleTicketChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.tickets];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, tickets: updated };
    });
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { name: '', desc: '', price: 0, quantity: 50, saleStart: '', saleEnd: '', minLimit: 1, maxLimit: 4, benefits: '' }]
    }));
  };

  const duplicateTicketType = (index) => {
    const ticketToCopy = formData.tickets[index];
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { ...ticketToCopy, name: `${ticketToCopy.name} (Copy)` }]
    }));
  };

  const removeTicketType = (index) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const totalCapacity = formData.tickets.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);

  // FAQ Manager & Templates
  const handleFaqChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { q: '', a: '' }]
    }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const loadFaqTemplate = (type) => {
    let newFaq = { q: '', a: '' };
    if (type === 'refund') {
      newFaq = { q: 'What is the event refund policy?', a: 'Bookings are refundable up to 7 days before the event start date. Processing fees may apply.' };
    } else if (type === 'bring') {
      newFaq = { q: 'What do I need to bring?', a: 'Please bring a valid photo identification card and a digital or printed copy of your ticket QR code.' };
    } else if (type === 'parking') {
      newFaq = { q: 'Is there parking available at the venue?', a: 'Yes, valet parking and secure guest self-parking are available at the main venue lot.' };
    }
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFaq]
    }));
    showToast('FAQ template added successfully.', 'success');
  };

  // Coupons Manager
  const addCoupon = () => {
    setFormData(prev => ({
      ...prev,
      coupons: [...prev.coupons, { code: '', discountType: 'Percentage', value: 10, limit: 100, validFrom: '', validUntil: '', applicableTickets: [], active: true }]
    }));
  };

  const removeCoupon = (index) => {
    setFormData(prev => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== index)
    }));
  };

  const handleCouponChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.coupons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, coupons: updated };
    });
  };

  const handleCouponTicketCheck = (index, ticketName, checked) => {
    setFormData(prev => {
      const couponsCopy = [...prev.coupons];
      let tList = couponsCopy[index].applicableTickets || [];
      if (checked) {
        tList = [...tList, ticketName];
      } else {
        tList = tList.filter(name => name !== ticketName);
      }
      couponsCopy[index] = { ...couponsCopy[index], applicableTickets: tList };
      return { ...prev, coupons: couponsCopy };
    });
  };

  // Upload/Crop Simulations
  const [isUploading, setIsUploading] = useState(false);
  const simulateUpload = (type) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        if (type === 'banner') {
          setFormData(prev => ({ ...prev, banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200' }));
          setShowCropAdjuster(true);
        } else if (type === 'gallery') {
          setFormData(prev => ({ ...prev, gallery: [...prev.gallery, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'] }));
        }
        showToast('Image uploaded successfully to Vihavi Media CDN!', 'success');
      }
    }, 200);
  };

  const handleApplyCrop = () => {
    setShowCropAdjuster(false);
    showToast('Crop coordinates applied successfully!', 'success');
  };

  // Exit Prompt
  const handleExit = () => {
    if (window.confirm('You have unsaved changes. Are you sure you want to exit Event Creation?')) {
      navigate('/organizer');
    }
  };

  // Final Publish/Submit Handler
  const handleSave = async (publishStatus = 'Draft') => {
    if (publishStatus === 'Published') {
      // Validate all required steps
      for (let i = 1; i <= STEPS.length; i++) {
        if (!validateStep(i)) {
          setActiveStep(i);
          let missingMsg = 'Please complete all required fields for this step before submitting.';
          if (i === 1) missingMsg = 'Please enter Event Title and Category (Step 1).';
          else if (i === 2) missingMsg = 'Please enter Venue Name, Address, and City (Step 2).';
          else if (i === 3) missingMsg = 'Please enter Event Start Date and Start Time (Step 3).';
          else if (i === 4) missingMsg = 'Please add a Ticket Type and Name (Step 4).';
          else if (i === 5) missingMsg = 'Please upload an Event Cover Banner (Step 5).';
          else if (i === 8) missingMsg = 'Please enter Contact Email and Contact Phone (Step 8).';
          
          showToast(missingMsg, 'warning');
          return;
        }
      }

      if (!formData.agreeToTerms) {
        showToast('Please check the terms and conditions agreement box first.', 'warning');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        status: publishStatus,
        updatedAt: new Date().toISOString()
      };

      if (editId) {
        await dbService.update('events', editId, payload);
        showToast(`Event updated successfully as ${publishStatus}!`, 'success');
      } else {
        payload.id = Math.random().toString(36).substring(2, 9);
        payload.createdAt = new Date().toISOString();
        payload.createdBy = localStorage.getItem('email') || 'organizer@vihavi.dev';
        await dbService.create('events', payload);
        
        // Load mock tickets into central tickets DB
        payload.tickets.forEach(async (t, i) => {
          await dbService.create('tickets', {
            id: `t-${payload.id}-${i}`,
            eventId: payload.id,
            name: t.name,
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 100,
            sold: 0,
            saleStart: t.saleStart || payload.startDate,
            saleEnd: t.saleEnd || payload.startDate
          });
        });

        // Add a system notification
        await dbService.create('notifications', {
          type: 'booking',
          message: `Created new event "${payload.name}" successfully.`,
          timestamp: new Date().toISOString(),
          read: false
        });

        showToast(`Event submitted successfully as ${publishStatus}!`, 'success');
      }

      navigate('/organizer/events');
    } catch (err) {
      showToast(`Error saving event: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="org-create-event-page" style={{ color: '#fff' }}>
      {/* Minimal Navigation Bar Header */}
      <header className="org-minimal-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 30px',
        borderBottom: '1px solid var(--org-glass-border)',
        background: 'rgba(10, 10, 12, 0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 95
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/organizer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>Vihavi</span>
          </Link>
          <span style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <h2 style={{ fontSize: '15px', color: 'var(--org-gold)', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Event Creation</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => handleSave('Draft')} className="luxury-btn-outline" style={{ padding: '8px 16px', fontSize: '12px' }}>Save as Draft</button>
          <button onClick={handleExit} className="luxury-btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Exit Wizard</button>
        </div>
      </header>

      {/* Main Workspace Layout Wrapper */}
      <div className="org-create-event-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 72px)' }}>
        
        {/* Sticky Left Progress Sidebar */}
        <aside className="org-wizard-sidebar luxury-card" style={{ width: '280px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '24px 16px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--org-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Setup Progress</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((completedSteps.length / STEPS.length) * 100)}%`, height: '100%', background: 'var(--org-gold)', transition: 'width 0.3s' }}></div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--org-gold)', fontWeight: 'bold' }}>{Math.round((completedSteps.length / STEPS.length) * 100)}%</span>
            </div>
          </div>

          <ul className="wizard-steps-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STEPS.map((s) => {
              const isCompleted = completedSteps.includes(s.id);
              const isActive = activeStep === s.id;
              return (
                <li 
                  key={s.id} 
                  className={`wizard-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleSidebarStepClick(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(88,15,29,0.25)' : 'transparent',
                    border: isActive ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                    color: isActive ? 'var(--org-gold)' : isCompleted ? '#fff' : 'var(--org-text-muted)',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="step-indicator" style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: isCompleted ? 'none' : '1px solid currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: isCompleted ? 'var(--org-gold)' : 'transparent',
                    color: isCompleted ? '#000' : 'inherit'
                  }}>
                    {isCompleted ? <CheckCircle size={12} strokeWidth={3} /> : s.id}
                  </span>
                  <span className="step-name" style={{ fontSize: '13px', fontWeight: '500' }}>{s.name}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Wizard Form Area */}
        <section className="org-wizard-content" style={{ flex: 1, padding: '30px 40px', maxWidth: '900px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--org-text-muted)', letterSpacing: '1.5px' }}>Wizard Step {activeStep} of {STEPS.length}</span>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{STEPS.find(s => s.id === activeStep).name}</h2>
          </div>

          <div className="wizard-step-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* STEP 1: Basic Information */}
            {activeStep === 1 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="org-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>Event Title *</label>
                    <span style={{ fontSize: '10px', color: 'var(--org-text-muted)' }}>{formData.name.length} / 80 chars</span>
                  </div>
                  <input 
                    type="text" 
                    name="name" 
                    className="luxury-input" 
                    maxLength="80"
                    placeholder="e.g. Royal Burgundy Gala 2026" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="org-form-group">
                    <label>Category *</label>
                    <select name="category" className="luxury-select" value={formData.category} onChange={handleInputChange}>
                      <option value="">Select Category</option>
                      <option value="Music">Music & Gala</option>
                      <option value="Tech">Tech Innovations</option>
                      <option value="Networking">Networking & Socials</option>
                      <option value="Culture">Culture & Heritage</option>
                      <option value="Art">Fine Arts</option>
                      <option value="Sports">Elite Sports</option>
                      <option value="Food & Drink">Culinary & Wine</option>
                      <option value="Business">Business & Capital</option>
                    </select>
                  </div>
                  <div className="org-form-group">
                    <label>Age Restriction</label>
                    <select name="ageRestriction" className="luxury-select" value={formData.ageRestriction} onChange={handleInputChange}>
                      <option value="All Ages">All Ages Allowed</option>
                      <option value="18+">18+ (Adults Only)</option>
                      <option value="21+">21+ (ID Verification Required)</option>
                    </select>
                  </div>
                </div>

                <div className="org-form-group">
                  <label>Event Format</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    {['In-Person', 'Virtual', 'Hybrid'].map(fmt => (
                      <button 
                        key={fmt} 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, format: fmt }))}
                        className={formData.format === fmt ? 'luxury-btn-primary' : 'luxury-btn-outline'}
                        style={{ flex: 1, padding: '10px 0', fontSize: '13px' }}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rich Text Editor Mock */}
                <div className="org-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>Event Description</label>
                    <span style={{ fontSize: '10px', color: 'var(--org-text-muted)' }}>{formData.description.length} characters</span>
                  </div>
                  <div style={{ border: '1px solid var(--org-glass-border)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                    {/* Rich text editing toolbar */}
                    <div style={{ display: 'flex', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <button type="button" onClick={() => applyTextFormat('bold')} className="toolbar-btn" style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>B</button>
                      <button type="button" onClick={() => applyTextFormat('italic')} className="toolbar-btn" style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#fff', fontStyle: 'italic', cursor: 'pointer', fontSize: '12px' }}>I</button>
                      <button type="button" onClick={() => applyTextFormat('underline')} className="toolbar-btn" style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>U</button>
                      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                      <button type="button" onClick={() => applyTextFormat('bullet')} className="toolbar-btn" style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>List •</button>
                      <button type="button" onClick={() => applyTextFormat('number')} className="toolbar-btn" style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>List 1.</button>
                      <button type="button" onClick={() => applyTextFormat('link')} className="toolbar-btn" style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Link</button>
                    </div>
                    <textarea 
                      id="event-desc-textarea"
                      name="description" 
                      rows="6" 
                      className="luxury-textarea" 
                      placeholder="Write full details about your luxury event..." 
                      value={formData.description} 
                      onChange={handleInputChange}
                      style={{ border: 'none', background: 'transparent' }}
                    />
                  </div>
                </div>

                <div className="org-form-group">
                  <label>Tags (Comma separated)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--org-glass-border)', borderRadius: '8px', padding: '0 12px', height: '40px' }}>
                    <Tag size={14} color="var(--org-gold)" />
                    <input 
                      type="text" 
                      name="tags" 
                      placeholder="e.g. gala, luxury, burgundy, live" 
                      value={formData.tags}
                      onChange={handleInputChange}
                      style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Organizer Info display */}
                <div style={{ padding: '16px', background: 'rgba(88,15,29,0.1)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--org-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>Organizer Information</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ccc', marginTop: '6px' }}>
                    <span>Account Name: <strong>{formData.organizerName}</strong></span>
                    <span>Contact: <strong>{formData.organizerEmail}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Location Details */}
            {activeStep === 2 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Location Setup</label>
                  <span style={{ background: 'var(--org-burgundy)', color: 'var(--org-gold)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', border: '1px solid rgba(212,175,55,0.2)' }}>{formData.format} Event</span>
                </div>

                {formData.format !== 'Virtual' && (
                  <>
                    <div className="org-form-group">
                      <label>Venue Name *</label>
                      <input 
                        type="text" 
                        name="venue" 
                        className="luxury-input" 
                        placeholder="e.g. Falaknuma Palace, Hyderabad" 
                        value={formData.venue} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="org-form-group">
                      <label>Address *</label>
                      <input 
                        type="text" 
                        name="address" 
                        className="luxury-input" 
                        placeholder="Street Address, Area" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="org-form-group">
                        <label>City *</label>
                        <input type="text" name="city" className="luxury-input" value={formData.city} onChange={handleInputChange} />
                      </div>
                      <div className="org-form-group">
                        <label>State / Province</label>
                        <input type="text" name="state" className="luxury-input" value={formData.state} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="org-form-group">
                        <label>Country</label>
                        <select name="country" className="luxury-select" value={formData.country} onChange={handleInputChange}>
                          <option>India</option>
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>United Arab Emirates</option>
                        </select>
                      </div>
                      <div className="org-form-group">
                        <label>Postal Code</label>
                        <input type="text" name="zip" className="luxury-input" value={formData.zip} onChange={handleInputChange} />
                      </div>
                    </div>

                    {/* Interactive map draggable pin mock */}
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ marginBottom: '6px', display: 'block' }}>Map Integration (Draggable Pin Mock)</label>
                      <div style={{ height: '160px', width: '100%', borderRadius: '8px', border: '1px solid var(--org-glass-border)', overflow: 'hidden', position: 'relative', background: '#1c1c1f' }}>
                        {/* Mock map graphic styling */}
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle, #580f1d 10%, transparent 11%), radial-gradient(circle, #580f1d 10%, transparent 11%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                        {/* Draggable pin mockup */}
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -100%)',
                          cursor: 'grab',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <MapPin size={24} color="var(--org-gold)" fill="rgba(88,15,29,0.8)" />
                          <span style={{ fontSize: '8px', background: '#000', color: '#fff', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--org-gold)', whiteSpace: 'nowrap' }}>Pin Coords: {formData.mapPin}</span>
                        </div>
                      </div>
                    </div>

                    <div className="org-form-group">
                      <label>Access & Parking Guidelines</label>
                      <textarea 
                        name="accessInstructions" 
                        rows="3" 
                        className="luxury-textarea" 
                        placeholder="Valet parking availability, handicap access coordinates..." 
                        value={formData.accessInstructions} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </>
                )}

                {formData.format !== 'In-Person' && (
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ fontSize: '13px', margin: 0, color: 'var(--org-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>Virtual Access Link</h3>
                    <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                      <div className="org-form-group">
                        <label>Streaming link</label>
                        <input 
                          type="text" 
                          name="virtualLink" 
                          className="luxury-input" 
                          placeholder="https://zoom.us/j/..." 
                          value={formData.virtualLink} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="org-form-group">
                        <label>Streaming Platform</label>
                        <select name="virtualPlatform" className="luxury-select" value={formData.virtualPlatform} onChange={handleInputChange}>
                          <option>Zoom</option>
                          <option>Google Meet</option>
                          <option>Microsoft Teams</option>
                          <option>Webex</option>
                          <option>Custom Stream Server</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Event Schedule */}
            {activeStep === 3 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Duration & Calendar</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="isMultiDay" 
                      checked={formData.isMultiDay} 
                      onChange={handleInputChange} 
                    />
                    This is a Multi-Day Event
                  </label>
                </div>

                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="org-form-group">
                    <label>Start Date *</label>
                    <input type="date" name="startDate" className="luxury-input" value={formData.startDate} onChange={handleInputChange} />
                  </div>
                  <div className="org-form-group">
                    <label>End Date {formData.isMultiDay && '*'}</label>
                    <input type="date" name="endDate" className="luxury-input" value={formData.endDate} onChange={handleInputChange} disabled={!formData.isMultiDay} />
                  </div>
                </div>

                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="org-form-group">
                    <label>Start Time *</label>
                    <input type="time" name="startTime" className="luxury-input" value={formData.startTime} onChange={handleInputChange} />
                  </div>
                  <div className="org-form-group">
                    <label>End Time</label>
                    <input type="time" name="endTime" className="luxury-input" value={formData.endTime} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'center' }}>
                  <div className="org-form-group">
                    <label>Timezone Selection</label>
                    <select name="timeZone" className="luxury-select" value={formData.timeZone} onChange={handleInputChange}>
                      <option value="IST">Indian Standard Time (IST - UTC+5:30) (Auto-detected)</option>
                      <option value="EST">Eastern Standard Time (EST - UTC-5)</option>
                      <option value="GMT">Greenwich Mean Time (GMT - UTC+0)</option>
                      <option value="PST">Pacific Standard Time (PST - UTC-8)</option>
                    </select>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', justify: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Calculated Duration</span>
                    <span style={{ color: 'var(--org-gold)', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>{calculateDuration()}</span>
                  </div>
                </div>

                {/* Timeline Agenda Items Builder */}
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>Detailed Agenda & Timeline</h3>
                    <button type="button" onClick={addAgendaItem} className="luxury-btn-primary" style={{ display: 'flex', gap: '6px', padding: '6px 12px', fontSize: '11px' }}>
                      <Plus size={12} /> Add Agenda Slot
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.agenda.map((slot, index) => (
                      <div key={index} className="agenda-card" style={{ display: 'flex', gap: '10px', padding: '12px', border: '1px solid var(--org-glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', alignItems: 'center' }}>
                        {/* Drag Reorder handle buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button type="button" onClick={() => moveAgendaItem(index, 'up')} disabled={index === 0} style={{ background: 'transparent', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.1)' : 'var(--org-gold)', cursor: index === 0 ? 'not-allowed' : 'pointer' }}><ArrowUp size={12} /></button>
                          <button type="button" onClick={() => moveAgendaItem(index, 'down')} disabled={index === formData.agenda.length - 1} style={{ background: 'transparent', border: 'none', color: index === formData.agenda.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--org-gold)', cursor: index === formData.agenda.length - 1 ? 'not-allowed' : 'pointer' }}><ArrowDown size={12} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1.5fr 1fr', gap: '10px', flex: 1 }}>
                          <input type="time" placeholder="Time" className="luxury-input" value={slot.time} onChange={(e) => handleAgendaChange(index, 'time', e.target.value)} />
                          <input type="text" placeholder="Activity Title" className="luxury-input" value={slot.title} onChange={(e) => handleAgendaChange(index, 'title', e.target.value)} />
                          <input type="text" placeholder="Speaker / Performer" className="luxury-input" value={slot.speaker} onChange={(e) => handleAgendaChange(index, 'speaker', e.target.value)} />
                        </div>

                        <button type="button" onClick={() => removeAgendaItem(index)} style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '6px' }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Ticket Configuration */}
            {activeStep === 4 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>Ticket Classes</h3>
                    <button type="button" onClick={addTicketType} className="luxury-btn-primary" style={{ display: 'flex', gap: '6px', padding: '6px 12px', fontSize: '11px' }}>
                      <Plus size={12} /> Add Ticket Type
                    </button>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="isFree" 
                      checked={formData.isFree} 
                      onChange={handleInputChange} 
                    />
                    This is a Free Event
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.tickets.map((ticket, index) => (
                    <div key={index} className="luxury-card" style={{ padding: '20px', position: 'relative', border: '1px solid var(--org-glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {index > 0 && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => duplicateTicketType(index)} title="Duplicate Ticket" style={{ background: 'transparent', border: 'none', color: 'var(--org-gold)', cursor: 'pointer' }}><Copy size={14} /></button>
                          <button type="button" onClick={() => removeTicketType(index)} title="Delete Ticket" style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                      )}
                      
                      <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '15px' }}>
                        <div className="org-form-group">
                          <label>Ticket Package Name *</label>
                          <input type="text" placeholder="e.g. VIP Gold Access" className="luxury-input" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Price (₹) *</label>
                          <input type="number" placeholder="Price" className="luxury-input" disabled={formData.isFree} value={formData.isFree ? 0 : ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Total Quantity Available *</label>
                          <input type="number" placeholder="Qty" className="luxury-input" value={ticket.quantity} onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)} />
                        </div>
                      </div>

                      <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '15px' }}>
                        <div className="org-form-group">
                          <label>Description & Inclusions</label>
                          <input type="text" placeholder="e.g. VIP lounge entry, complimentary wines" className="luxury-input" value={ticket.benefits} onChange={(e) => handleTicketChange(index, 'benefits', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Sales Start Date</label>
                          <input type="date" className="luxury-input" value={ticket.saleStart} onChange={(e) => handleTicketChange(index, 'saleStart', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Sales End Date</label>
                          <input type="date" className="luxury-input" value={ticket.saleEnd} onChange={(e) => handleTicketChange(index, 'saleEnd', e.target.value)} />
                        </div>
                      </div>

                      <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="org-form-group">
                          <label>Minimum Purchase limit</label>
                          <input type="number" className="luxury-input" value={ticket.minLimit || 1} onChange={(e) => handleTicketChange(index, 'minLimit', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Maximum Purchase limit</label>
                          <input type="number" className="luxury-input" value={ticket.maxLimit || 4} onChange={(e) => handleTicketChange(index, 'maxLimit', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Capacity summary badge */}
                <div style={{ display: 'flex', justify: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '8px', fontSize: '13px' }}>
                  <span>Aggregated Event Capacity: <strong style={{ color: 'var(--org-gold)' }}>{totalCapacity} ticket(s)</strong></span>
                  <span>Average Ticket Price: <strong>₹{formData.isFree ? 0 : Math.round(formData.tickets.reduce((acc, t) => acc + (Number(t.price) || 0), 0) / formData.tickets.length)}</strong></span>
                </div>
              </div>
            )}

            {/* STEP 5: Event Media */}
            {activeStep === 5 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="org-form-group">
                  <label>Event Cover Banner *</label>
                  {formData.banner ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--org-glass-border)' }}>
                        <img src={formData.banner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Banner" />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => setShowCropAdjuster(!showCropAdjuster)} className="luxury-btn-outline" style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#000', padding: '6px 12px', fontSize: '11px' }}><Scissors size={12} /> Adjust Crop</button>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, banner: '' }))} className="luxury-btn-outline" style={{ background: '#000', padding: '6px 12px', fontSize: '11px', borderColor: '#ff4d4f', color: '#ff4d4f' }}>Replace</button>
                        </div>
                      </div>

                      {/* Mock Crop Adjuster coordinates */}
                      {showCropAdjuster && (
                        <div className="luxury-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '12px', color: 'var(--org-gold)', margin: 0, fontWeight: 'bold' }}>Crop Tool Settings Mock</h4>
                            <button type="button" onClick={handleApplyCrop} className="luxury-btn-primary" style={{ padding: '4px 10px', fontSize: '10px' }}>Apply Crop</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '11px' }}>
                            <label>X-Offset: <input type="number" value={cropBox.x} onChange={(e) => setCropBox({...cropBox, x: e.target.value})} className="luxury-input" style={{ padding: '4px', height: '24px' }} /></label>
                            <label>Y-Offset: <input type="number" value={cropBox.y} onChange={(e) => setCropBox({...cropBox, y: e.target.value})} className="luxury-input" style={{ padding: '4px', height: '24px' }} /></label>
                            <label>Width %: <input type="number" value={cropBox.w} onChange={(e) => setCropBox({...cropBox, w: e.target.value})} className="luxury-input" style={{ padding: '4px', height: '24px' }} /></label>
                            <label>Height %: <input type="number" value={cropBox.h} onChange={(e) => setCropBox({...cropBox, h: e.target.value})} className="luxury-input" style={{ padding: '4px', height: '24px' }} /></label>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => simulateUpload('banner')} 
                      style={{
                        border: '2px dashed var(--org-glass-border)',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.02)',
                        transition: '0.2s'
                      }}
                    >
                      <Upload size={32} color="var(--org-gold)" style={{ margin: '0 auto 10px auto' }} />
                      <p style={{ fontWeight: '600', margin: 0 }}>{isUploading ? 'Uploading cover banner to CDN...' : 'Upload Cover Banner Image'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--org-text-muted)', marginTop: '6px' }}>Recommended: Landscape aspect ratio 1920 x 1080px (Max 5MB)</p>
                    </div>
                  )}
                </div>

                {/* Additional Images up to 8 */}
                <div className="org-form-group">
                  <label>Additional Gallery Images (Upload up to 8)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', marginTop: '8px' }}>
                    {formData.gallery.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--org-glass-border)' }}>
                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumb" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: '2px', right: '2px', background: '#000', border: 'none', color: '#ff4d4f', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>×</button>
                      </div>
                    ))}
                    {formData.gallery.length < 8 && (
                      <div 
                        onClick={() => simulateUpload('gallery')}
                        style={{
                          height: '80px',
                          border: '1px dashed var(--org-glass-border)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <Plus size={16} color="var(--org-gold)" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Video URLs */}
                <div className="org-form-group">
                  <label>Promo Video Link (YouTube / Vimeo / MP4)</label>
                  <input type="text" name="video" className="luxury-input" placeholder="e.g. https://www.youtube.com/watch?v=..." value={formData.video} onChange={handleInputChange} />
                  {formData.video && (
                    <div style={{ marginTop: '12px', background: '#000', borderRadius: '8px', padding: '10px', border: '1px solid var(--org-glass-border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--org-gold)', display: 'block', marginBottom: '6px' }}>Simulated Video Player Preview:</span>
                      <div style={{ height: '180px', width: '100%', background: '#1c1c1f', display: 'flex', alignItems: 'center', justify: 'center' }}>
                        <Play size={32} color="var(--org-gold)" style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: Frequently Asked Questions */}
            {activeStep === 6 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>FAQ Card Registry</h3>
                  <button type="button" onClick={addFaq} className="luxury-btn-primary" style={{ display: 'flex', gap: '6px', padding: '6px 12px', fontSize: '11px' }}>
                    <Plus size={12} /> Add FAQ Card
                  </button>
                </div>

                {/* Suggested template links */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--org-text-muted)', textTransform: 'uppercase' }}>Click to Import FAQ templates:</span>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => loadFaqTemplate('refund')} className="luxury-btn-outline" style={{ padding: '4px 10px', fontSize: '10px' }}>+ Refund Policy</button>
                    <button type="button" onClick={() => loadFaqTemplate('bring')} className="luxury-btn-outline" style={{ padding: '4px 10px', fontSize: '10px' }}>+ What to Carry</button>
                    <button type="button" onClick={() => loadFaqTemplate('parking')} className="luxury-btn-outline" style={{ padding: '4px 10px', fontSize: '10px' }}>+ Parking Facilities</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.faqs.map((faq, idx) => (
                    <div key={idx} style={{ padding: '15px', border: '1px solid var(--org-glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                      <button 
                        type="button" 
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                        onClick={() => removeFaq(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <input 
                        type="text" 
                        placeholder="Question (e.g. Is outside food allowed?)" 
                        className="luxury-input" 
                        value={faq.q} 
                        onChange={(e) => handleFaqChange(idx, 'q', e.target.value)} 
                      />
                      <textarea 
                        placeholder="Answer details..." 
                        className="luxury-textarea" 
                        rows="2" 
                        value={faq.a} 
                        onChange={(e) => handleFaqChange(idx, 'a', e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Promotional Coupons */}
            {activeStep === 7 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>Coupon Setup</h3>
                  <button type="button" onClick={addCoupon} className="luxury-btn-primary" style={{ display: 'flex', gap: '6px', padding: '6px 12px', fontSize: '11px' }}>
                    <Plus size={12} /> Add Coupon
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {formData.coupons.map((coupon, idx) => (
                    <div key={idx} className="luxury-card" style={{ padding: '20px', border: '1px solid var(--org-glass-border)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                      <button 
                        type="button" 
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                        onClick={() => removeCoupon(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '15px' }}>
                        <div className="org-form-group">
                          <label>Coupon Code *</label>
                          <input type="text" placeholder="e.g. LUXURY20" className="luxury-input" value={coupon.code} onChange={(e) => handleCouponChange(idx, 'code', e.target.value.toUpperCase())} />
                        </div>
                        <div className="org-form-group">
                          <label>Discount Type</label>
                          <select className="luxury-select" value={coupon.discountType} onChange={(e) => handleCouponChange(idx, 'discountType', e.target.value)}>
                            <option value="Percentage">Percentage %</option>
                            <option value="Fixed Amount">Fixed Value (₹)</option>
                          </select>
                        </div>
                        <div className="org-form-group">
                          <label>Discount Value *</label>
                          <input type="number" placeholder="Discount" className="luxury-input" value={coupon.value} onChange={(e) => handleCouponChange(idx, 'value', e.target.value)} />
                        </div>
                      </div>

                      <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div className="org-form-group">
                          <label>Valid From</label>
                          <input type="date" className="luxury-input" value={coupon.validFrom} onChange={(e) => handleCouponChange(idx, 'validFrom', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Valid Until</label>
                          <input type="date" className="luxury-input" value={coupon.validUntil} onChange={(e) => handleCouponChange(idx, 'validUntil', e.target.value)} />
                        </div>
                        <div className="org-form-group">
                          <label>Usage Limit count</label>
                          <input type="number" className="luxury-input" placeholder="100" value={coupon.limit} onChange={(e) => handleCouponChange(idx, 'limit', e.target.value)} />
                        </div>
                      </div>

                      {/* Ticket link checkboxes */}
                      <div className="org-form-group">
                        <label>Applicable Ticket Packages</label>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {formData.tickets.map((t, tIdx) => (
                            <label key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={(coupon.applicableTickets || []).includes(t.name)}
                                onChange={(e) => handleCouponTicketCheck(idx, t.name, e.target.checked)}
                              /> {t.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8: Event Settings */}
            {activeStep === 8 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  <div className="org-form-group">
                    <label>Event Visibility</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      {['Public', 'Private', 'Unlisted'].map(v => (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', flex: 1, padding: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '6px' }}>
                          <input type="radio" name="visibility" checked={formData.visibility === v} value={v} onChange={handleInputChange} /> {v}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="org-form-group">
                    <label>Attendee Directory Visibility</label>
                    <select name="attendeeListVisibility" className="luxury-select" style={{ marginTop: '6px' }} value={formData.attendeeListVisibility} onChange={handleInputChange}>
                      <option value="Public">Public (Visible to anyone)</option>
                      <option value="Visible to Attendees">Visible only to booked attendees</option>
                      <option value="Hidden">Hidden (Organizer only)</option>
                    </select>
                  </div>
                </div>

                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '8px' }}>
                    <input type="checkbox" name="requireApproval" checked={formData.requireApproval} onChange={handleInputChange} />
                    Require approval for bookings
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--org-glass-border)', borderRadius: '8px' }}>
                    <input type="checkbox" name="enableWaitlist" checked={formData.enableWaitlist} onChange={handleInputChange} />
                    Enable waiting list auto-fill
                  </label>
                </div>

                <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  <div className="org-form-group">
                    <label>Registration Deadline date</label>
                    <input type="datetime-local" name="registrationDeadline" className="luxury-input" value={formData.registrationDeadline} onChange={handleInputChange} />
                  </div>
                  <div className="org-form-group">
                    <label>Cancellation Terms</label>
                    <select name="cancellationPolicy" className="luxury-select" value={formData.cancellationPolicy} onChange={handleInputChange}>
                      <option value="Flexible">Flexible (Refunds up to 24h before)</option>
                      <option value="Moderate">Moderate (Refunds up to 72h before)</option>
                      <option value="Strict">Strict (Refunds up to 7 days before)</option>
                      <option value="No Refunds">No Refunds (All sales final)</option>
                    </select>
                  </div>
                </div>

                <div className="org-form-group">
                  <label>Custom Cancellation details textarea</label>
                  <textarea name="cancellationDetails" rows="2" className="luxury-textarea" placeholder="Include any custom administrative fees or constraints..." value={formData.cancellationDetails} onChange={handleInputChange} />
                </div>

                <div className="org-form-group">
                  <label>Official Terms and Conditions</label>
                  <textarea name="terms" rows="3" className="luxury-textarea" placeholder="T&C text required for attendee tick box..." value={formData.terms} onChange={handleInputChange} />
                </div>

                <div style={{ padding: '16px', border: '1px solid var(--org-glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--org-gold)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>Event Contact & Handles</h4>
                  <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                    <div className="org-form-group">
                      <label>Contact Email *</label>
                      <input type="email" name="contactEmail" className="luxury-input" value={formData.contactEmail} onChange={handleInputChange} />
                    </div>
                    <div className="org-form-group">
                      <label>Contact Phone *</label>
                      <input type="text" name="contactPhone" className="luxury-input" value={formData.contactPhone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="org-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <input type="text" name="socialTwitter" className="luxury-input" placeholder="Twitter URL" value={formData.socialTwitter} onChange={handleInputChange} />
                    <input type="text" name="socialLinkedin" className="luxury-input" placeholder="LinkedIn URL" value={formData.socialLinkedin} onChange={handleInputChange} />
                    <input type="text" name="socialInstagram" className="luxury-input" placeholder="Instagram URL" value={formData.socialInstagram} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: Review & Publish */}
            {activeStep === 9 && (
              <div className="step-container animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Checklist validation indicators */}
                <div className="luxury-card" style={{ padding: '16px', border: '1px solid var(--org-glass-border)' }}>
                  <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: 'var(--org-gold)', textTransform: 'uppercase' }}>Wizard Completion Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color={formData.name.trim() ? '#52c41a' : '#ff4d4f'} />
                      <span>Event title and category defined</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color={formData.banner ? '#52c41a' : '#ff4d4f'} />
                      <span>Cover image uploaded</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color={formData.tickets.length > 0 && formData.tickets[0].name.trim() ? '#52c41a' : '#ff4d4f'} />
                      <span>At least one ticket class package configured</span>
                    </div>
                  </div>
                </div>

                {/* Event Card Mock Preview */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Event Card Preview visualizer</label>
                  <div className="luxury-card" style={{ display: 'flex', padding: 0, overflow: 'hidden', maxWidth: '450px', background: '#141416', border: '1px solid var(--org-glass-border)' }}>
                    <img src={formData.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=200'} style={{ width: '120px', height: '100%', objectFit: 'cover' }} alt="Banner" />
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--org-gold)' }}>{formData.category || 'Category'}</span>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{formData.name || 'Unnamed Event Gala'}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--org-text-muted)' }}><Calendar size={10} /> {formData.startDate || 'TBA'} • {formData.startTime || 'TBA'}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--org-text-muted)' }}><MapPin size={10} /> {formData.isOnline ? 'Online Event' : (formData.venue || 'Venue, City')}</p>
                    </div>
                  </div>
                </div>

                {/* Short-cuts to steps */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <label>Review Shortcut links</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {STEPS.slice(0, 8).map(s => (
                      <button key={s.id} type="button" onClick={() => setActiveStep(s.id)} className="luxury-btn-outline" style={{ padding: '4px 10px', fontSize: '10px' }}>Edit {s.name}</button>
                    ))}
                  </div>
                </div>

                {/* Terms and conditions click box */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} />
                    I agree to the Vihavi platform guidelines, fees, and organizer policies.
                  </label>
                </div>

                {/* Submission timeframe guidelines */}
                <div style={{ padding: '12px 16px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <AlertTriangle size={16} color="var(--org-gold)" />
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--org-gold)', lineHeight: 1.4 }}>Expected review timeframe is 24-48 hours. You will receive an email notification when approved.</p>
                </div>

                {/* Publication Schedule date selection */}
                <div className="org-form-group">
                  <label>Schedule Publication date (Optional)</label>
                  <input type="datetime-local" name="publishDate" className="luxury-input" value={formData.publishDate} onChange={handleInputChange} />
                </div>

                {/* Submit buttons */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <button 
                    type="button" 
                    className="luxury-btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => handleSave('Draft')}
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </button>
                  <button 
                    type="button" 
                    className="luxury-btn-primary" 
                    style={{ flex: 2, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleSave('Published')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Admin Approval'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Buttons */}
          <div className="wizard-navigation-footer" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginTop: '30px' }}>
            <button 
              type="button" 
              className="luxury-btn-outline" 
              onClick={handlePrev} 
              disabled={activeStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: activeStep === 1 ? 0.3 : 1, cursor: activeStep === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            
            {activeStep < STEPS.length ? (
              <button 
                type="button" 
                className="luxury-btn-primary" 
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <span style={{ width: '20px' }}></span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateEvent;
