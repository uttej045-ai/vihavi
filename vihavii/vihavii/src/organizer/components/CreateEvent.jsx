import React, { useState } from 'react';
import { Upload, Calendar, MapPin, Clock, Image as ImageIcon, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import '../styles/CreateEvent.css';

const CreateEvent = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    address: '',
    ticketName: '',
    ticketPrice: '',
    ticketCapacity: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="org-create-event">
      <div className="org-page-header">
        <h1>Create New Event</h1>
      </div>

      <div className="org-steps-indicator">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`org-step ${step >= i ? 'active' : ''} ${step > i ? 'completed' : ''}`}>
            <div className="org-step-num">
              {step > i ? <CheckCircle size={14} /> : i}
            </div>
            <span className="hidden-mobile">
              {i === 1 ? 'Details' : i === 2 ? 'Schedule' : i === 3 ? 'Venue' : i === 4 ? 'Tickets' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      <div className="org-create-form-card">
        {step === 1 && (
          <div className="org-form-step">
            <h2>Basic Details</h2>
            <div className="org-banner-upload">
              <input type="file" id="banner" hidden />
              <label htmlFor="banner" className="org-upload-label">
                <ImageIcon size={40} />
                <span>Click to upload event banner</span>
                <small>1920x1080px (Max 5MB)</small>
              </label>
            </div>
            <div className="org-form-group">
              <label>Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Neon Summer Party" />
            </div>
            <div className="org-form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                <option value="music">Music & Entertainment</option>
                <option value="tech">Tech Conference</option>
                <option value="party">House Party</option>
              </select>
            </div>
            <div className="org-form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe your event..."></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="org-form-step">
            <h2>Schedule</h2>
            <div className="org-form-row">
              <div className="org-form-group">
                <label><Calendar size={14}/> Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} />
              </div>
              <div className="org-form-group">
                <label><Clock size={14}/> Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="org-form-step">
            <h2>Venue Location</h2>
            <div className="org-form-group">
              <label><Building size={14}/> Venue Name</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Prism Club" />
            </div>
            <div className="org-form-group">
              <label><MapPin size={14}/> Full Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" placeholder="Enter full address..."></textarea>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="org-form-step">
            <h2>Ticket Details</h2>
            <div className="org-ticket-type-card">
              <div className="org-form-row">
                <div className="org-form-group">
                  <label>Ticket Name</label>
                  <input type="text" name="ticketName" value={formData.ticketName} onChange={handleChange} placeholder="e.g. General Admission" />
                </div>
                <div className="org-form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} placeholder="0 for Free" />
                </div>
                <div className="org-form-group">
                  <label>Capacity</label>
                  <input type="number" name="ticketCapacity" value={formData.ticketCapacity} onChange={handleChange} placeholder="Total tickets available" />
                </div>
              </div>
            </div>
            <button className="org-btn-outline" style={{marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center'}}>
              <Plus size={16} /> Add Another Ticket Type
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="org-form-step">
            <h2>Review & Publish</h2>
            <div className="org-review-box">
              <h3>{formData.title || 'Untitled Event'}</h3>
              <p><strong>Category:</strong> {formData.category || 'Not selected'}</p>
              <p><strong>Date:</strong> {formData.date || 'Not set'} | <strong>Time:</strong> {formData.time || 'Not set'}</p>
              <p><strong>Venue:</strong> {formData.venue || 'Not set'}</p>
            </div>
            <div className="org-review-actions">
              <button className="org-btn-outline" style={{flex: 1}}>Save Draft</button>
              <button className="org-btn-primary" style={{flex: 2}}>Publish Event Now</button>
            </div>
          </div>
        )}

        <div className="org-form-footer">
          <button 
            className="org-btn-outline" 
            onClick={handlePrev} 
            disabled={step === 1}
            style={{visibility: step === 1 ? 'hidden' : 'visible'}}
          >
            <ChevronLeft size={16} /> Back
          </button>
          
          {step < 5 && (
            <button className="org-btn-primary" onClick={handleNext}>
              Continue <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Building icon for step 3
const Building = ({size}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);

export default CreateEvent;
