import React from 'react';

export default function UserTypeSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={() => onChange('attendee')}
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: '12px',
          border: `2px solid ${value === 'attendee' ? '#7A0019' : '#e0e0e0'}`,
          background: value === 'attendee' ? 'rgba(122, 0, 25, 0.05)' : '#fff',
          color: value === 'attendee' ? '#7A0019' : '#666',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        Attendee
      </button>
      <button
        type="button"
        onClick={() => onChange('organizer')}
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: '12px',
          border: `2px solid ${value === 'organizer' ? '#7A0019' : '#e0e0e0'}`,
          background: value === 'organizer' ? 'rgba(122, 0, 25, 0.05)' : '#fff',
          color: value === 'organizer' ? '#7A0019' : '#666',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        Organizer
      </button>
    </div>
  );
}
